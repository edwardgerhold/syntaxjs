
/*
 ############################################################################################################################################################################################################

 Parser - Converts a stream of EcmaScript Tokens into a Mozilla Parser API AST instead of into the good looking Original Strings

 ############################################################################################################################################################################################################
 */

define("parser", ["tables", "tokenizer"], function (tables, tokenize) {

    "use strict";



    var i18n = require("i18n-messages");
    var EarlyErrors = require("earlyerrors").EarlyErrors;
    var withError, ifAbrupt, isAbrupt;
    var FinishStatementList = tables.FinishStatementList;
    var FinishSwitchStatementList = tables.FinishSwitchStatementList;
    var StatementParsers = tables.StatementParsers;
    var PrimaryExpressionByValue = tables.PrimaryExpressionByValue;
    var PrimaryExpressionByType = tables.PrimaryExpressionByType;
    var SkipableWhiteSpace = tables.SkipableWhiteSpace;
    var InOrOfInsOf = tables.InOrOfInsOf;
    var InOrOf = tables.InOrOf;
    var propKeys = tables.propKeys;
    var BindingIdentifiers = tables.BindingIdentifiers;
    var ExprNoneOfs = tables.ExprNoneOfs;
    var MethodKeyByType = tables.MethodKeyByType;
    var MethodKeyByValue = tables.MethodKeyByValue;
    var StartBinding = tables.StartBinding;
    var LPAREN = tables.LPAREN;
    var RPAREN = tables.RPAREN;
    var LPARENOF = tables.LPARENOF;
    var Punctuators = tables.Punctuators;
    var WhiteSpaces = tables.WhiteSpaces;
    var LineTerminators = tables.LineTerminators;
    var Keywords = tables.Keywords;
    var IsAnyLiteral = tables.IsAnyLiteral;
    var PunctToExprName = tables.PunctToExprName;
    var BinaryOperators = tables.BinaryOperators;
    var AssignmentOperators = tables.AssignmentOperators;

    var UnaryOperators = tables.UnaryOperators;
    var UpdateOperators = tables.UpdateOperators;
    var ExprEndOfs = tables.ExprEndOfs;
    var OperatorPrecedence = tables.OperatorPrecedence;

    // ==========================================================
    // Parser Variables
    // ==========================================================

    var ltNext; // will be set if a lineterminator is before the next token, unset else
    var a, b;

    var isWorker = typeof importScripts === "function";
    var isNode = typeof process !== "undefined" && typeof global !== "undefined";
    var isBrowser = typeof window !== "undefined";

    var ast;

    //
    // VERY IMPORTANT
    //

    var lookahead, lookaheadt; // lookahead
    var tokens;
    var T = Object.create(null); // current token
    var t; // current token type
    var v; // current token value
    var i; // tokens[i] pointer
    var j; // tokens.length;

    var parser = Object.create(null);

    // Production Parameters 
    var noInStack = [];
    var isNoIn = false;
    var yieldStack = [];
    var yieldIsId = true;
    var defaultStack = [];
    var defaultIsId = true;
    var generatorParameter = false;
    var generatorParameterStack = [];
    var strictModeStack = [];
    var inStrictMode = false;


    /*
	for the CST research
    */
    
    var withExtras = true;
    var extraBuffer = [];
    function flushBuffer() {
	    var b = extraBuffer;
	    extraBuffer = [];
	    return b;
    }
    function intoBuffer(t) { 
	    extraBuffer.push(t); 
    }
    
    /*
    
    */


    // pointer to current Node defining the Scope
    var currentScopeNode;
    var scopeNodeStack = [];
    
    // loc information (not completed yet)
    var operator;
    var bytes = 0;
    var start = 0; // pos?
    var end = 0; // last ending?
    var byte = 0;
    var lines = []; // lines[0] = 12 (columns)
    var lastloc = makeLoc();
    var loc = makeLoc();
    var lastcolumn = 0;
    var text;

    // compiler / notifier options
    var compile = false;
    var builder = null;
    var cb;
    var notify = false;
    // 

    var stateStack = [];
    var state = "";
    function pushState(newState) {
        stateStack.push(state);
        state = newState;
    }
    function popState() {
        state = stateStack.pop();
    }



    function pushNoIn(new_state) {
        noInStack.push(isNoIn);
        isNoIn = new_state;
    }
    function popNoIn() {
        isNoIn = noInStack.pop();
    }

    function makeErrorStackString(error) {
        var stack = error.stack;
        var line = loc && loc.start.line;
        var column = loc && loc.start.column;
        var location = "{syntax.js} A Parser Error occured at line " + line + ", column " + column + "\r\n";
        error.stack = location;
        if (stack) error.stack += stack;
        return error;
    }

    function throwError(obj) {
        makeErrorStackString(obj);
        throw obj;
    }

    function syntaxError(C) {
        var line = loc && loc.start.line;
        var column = loc && loc.start.column;
        throwError(new SyntaxError(C + " expected at line " + line + ", column " + column));
    }

    function Assert(test, message) {
        if (!test) throwError(new Error(message));
    }
    function SyntaxAssert(test, message) {
        if (!test) throwError(new SyntaxError(message));
    }

//
// Parameter
//

    var staticSemantics;

    function makeStaticSemantics(tokens) {
        staticSemantics = StaticSemantics();
    }


    // GOT TO BE RENAMED.

    function StaticSemantics() {
        "use strict";

        // Parameter
        var parameters = Object.create(null);
        parameters["Default"] = [];
        parameters["GeneratorParameter"] = [];
        parameters["NoReference"] = [];
        parameters["In"] = [];
        parameters["Return"] = [];
        parameters["Yield"] = [];

        // Contains
        var container = Object.create(null);
        var containers = [container];

        // SymbolTable
        var LexEnv = Object.create(null);
        var VarEnv = LexEnv;
        var varEnvs = [VarEnv];
        var lexEnvs = [LexEnv];

        /*
         var lexNames;
         var lexDecls;
         var varNames;
         var varDecls;
         // stacks
         var LexNames = [];
         var LexDecls = [];
         var VarNames = [];
         var VarDecls = [];
         */
        // Contains

        function newContainer() {
            containers.push(container);
            container = Object.create(null);
        }

        function popContainer() {
            container = containers.pop();
        }

        function put(production, value) {
            container[production] = value === undefined ? true : value;
        }

        function contains(production) {
            if (container)
                if (Object.hasOwnProperty.call(container, production)) return container[production] || true;
            return false;
        }

        // Parameter 

        function getParameter(name) {
            var parameter = parameters[name];
            return parameter[parameter.length-1];
        }

        function newParameter(name, value) {
            var parameter = parameters[name];
            return parameter.push(value);
        }

        function popParameter(name) {
            var parameter = parameters[name];
            return parameter.pop();
        }

        // Variable Environment

        function newVarEnv() {
            varEnvs.push(VarEnv);
            VarEnv = Object.create(LexEnv);
            /*
             VarEnv.varNames = [];
             VarEnv.varDecls = [];
             */
            lexEnvs.push(LexEnv);
            LexEnv = Object.create(LexEnv);
            /*
             LexNames.push(lexNames);
             lexNames = [];
             LexDecls.push(lexDecls);
             lexDecls = [];
             */
            return VarEnv;
        }

        function newLexEnv() {
            lexEnvs.push(LexEnv);
            LexEnv = Object.create(LexEnv);
            /*
             LexNames.push(lexNames);
             lexNames = [];
             LexDecls.push(lexDecls);
             lexDecls = [];
             */
            return LexEnv;
        }

        function popEnvs() {
            container = containers.pop();

            if (LexEnv === VarEnv) {
                VarEnv = varEnvs.pop();
            }
            LexEnv = lexEnvs.pop();
            return LexEnv;
        }

        function addLexBinding(name, param) {
            SyntaxAssert(!hasLexBinding(name), name + " is a duplicate identifier in lexical scope!");
            LexEnv[name] = param === undefined ? true : param;
        }


        function addVarBinding(name, param) {
            SyntaxAssert(!hasVarBinding(name) || !currentScopeNode.strict, name + " is a duplicate identifier in variable scope!");
            VarEnv[name] = param === undefined ? true : param;
        }

        function hasVarBinding(name) {
            if (typeof name == "string")
                return Object.hasOwnProperty.call(VarEnv, name);

        }

        function hasLexBinding(name) {
            if (typeof name == "string")
                return Object.hasOwnProperty.call(LexEnv, name);
        }

        function addVarDecl(decl) {
            varDecls.push(decl);
        }
        function varDecls() {
            return varDecls;
        }
        function addLexDecl(decl) {
            lexDecls.push(decl);
        }
        function lexDecls() {
            return lexDecls;
        }

        function lexNames() {
            var boundNames = [];
            for (var v in LexEnv) {
                if (Object.hasOwnProperty.call(LexEnv, v)) boundNames.push(v); // O(n) time to gather additionally
            }
            return boundNames;
        }

        function varNames() {
            var boundNames = [];
            for (var v in VarEnv) if (Object.hasOwnProperty.call(VarEnv, v)) boundNames.push(v); // lexNames should be a list + an object!! O(1) in both cases but 2*memory;
            return boundNames;
        }

        return {
            // parameters
            getParameter: getParameter,
            newParameter: newParameter,
            popParameter: popParameter,
            // contains
            newContainer: newContainer,
            popContainer: popContainer,
            put: put,
            contains: contains,
            // lexNames, varNAmes
            newVarEnv: newVarEnv, // var +& lex
            newLexEnv: newLexEnv, // lex
            popEnvs: popEnvs,
            addLexBinding: addLexBinding,
            addVarBinding: addVarBinding,
            hasVarBinding: hasVarBinding,
            hasLexBinding: hasLexBinding,
            /*
             addVarDecl: addVarDecl,
             addLexDecl: addLexDecl,
             varDecls: varDecls,
             lexDecls: lexDecls,
             */
            lexNames: lexNames,
            varNames: varNames,
            //
            constructor: StaticSemantics,
            toString: function () { return "[object EcmaScript StaticSemantics]"}
        };

        // Needs to be renamed


    }

    var debugmode = false;

    function debug() {
        if (debugmode && typeof importScripts !== "function") {
            if (typeof arguments[0] == "object") {
                console.dir(arguments[0]);
            } else console.log.apply(console, arguments);
        }
    }

    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }

     var nodeId = 1;

    function Node(type /*, linkToken*/ ) {
        var node = Object.create(null);
        node.ID = ++nodeId;
        //staticSemantics.put(type);
        node.type = type;
        return node;
    }

    function stringifyTokens(array) {
        //        return array.join("");
        var string = "";
        for (var i = 0, j = array.length; i < j; i++) {
            string += array[i].value;
        }
        return string;
    }

    // ========================================================================================================
    // lookahead functions
    // ========================================================================================================

    function righthand(tokens, i) {
        var lookahead; // = " ";
        var b = 0;
        var t;
        ltNext = false;
        do {
            b++;
            t = tokens[i + b];
            if (t === undefined) return undefined;
            lookahead = t.value;
            lookaheadt = t.type;
            if (WhiteSpaces[lookaheadt]) continue;
            if (LineTerminators[lookaheadt]) ltNext = true;
        } while (WhiteSpaces[lookaheadt]);
        return lookahead;
    }

    function error(err) {
        throw err;
    }

    function unquote(str) {
        return ("" + str).replace(/^("|')|("|')$/g, ""); //'
    }

    function build(node) {
        if (!compile) return node;
        var type = node.type;
        var work = builder[type];
        return work(node);
    }

    function rotate_binexps(node) {
        var op = node.operator,
            right = node.right,
            rightOp = right && right.operator,
            tmp;
        if (right.type !== "UnaryExpression" && rightOp) {
            if ((OperatorPrecedence[rightOp] || Infinity) < (OperatorPrecedence[op] || Infinity)) {
                tmp = node;
                node = node.right;
                tmp.right = node.left;
                node.left = tmp;
            }
        }
        return node;
    }

    // ========================================================================================================
    // source locations
    // ========================================================================================================

    function makeLoc(start, end) {
        return {
            start: start || {},
            end: end || {}
        };
    }

    function resetVariables(t) {
        ast = null;

        if (typeof t === "string") t = tokenize(t);
        tokens = t || [];

        makeStaticSemantics();

        i = -1;
        j = tokens.length;
        T = v = t = undefined;
        lookahead = lookaheadt = undefined;
    }

    // ========================================================================================================
    // skip, next, pass, scan, eos
    // ========================================================================================================

    parser.skip = skip;
    parser.next = next;
    parser.scan = scan;

    function scan(C) {
        debug("scan (advance 2 tokens): " + C);
        if (lookahead === C) next();
        else syntaxError(C);
        next();
    }

    function advance(C) {
        debug("advance (advance 1 token): " + C);
        if (lookahead === C) next();
        else syntaxError(C);
    }

    function pass(C) {
        debug("pass this token: " + C);
        if (v === C) next();
        else syntaxError(C);
    }

    function skip(C) {
        if (v === C) {
            debug("skipped: " + C);
            next();
            return true;
        } else {
            debug("cant skip: " + C + " /at " + v);
            return false;
        }
    }

    function eos() {
        return i >= j;
    }

    var lastloc;
    function hasNext() {
        return lookahead != undefined;
    }

    var captureExtraTypes = {
        __proto__:null,
	"WhiteSpace":true,
	"MultiLineComment":true,
	"LineComment":true,
    };
    var captureExtraValues = {
	__proto__: null,
	"(": true,
	")": true,
	"[": true,
	"]": true,
	"}": true,
	"{": true,
	";": true,
	":": true,	// will capture the colon of the label, but also of the ternary
	",": true
    };
    
    function nextToken () {
	return tokenizer.next();
    }

    function next() {
        if (i < j) {
            i += 1;
            lastloc = loc;
            T = tokens[i];  // this function really works on an array 
            if (T) {
                t = T.type;
        	    if (withExtras && captureExtraTypes[t]) intoBuffer(T);
                if (SkipableWhiteSpace[t]) return next();
                v = T.value;                
                if (withExtras && captureExtraValues[v]) intoBuffer(T);
                loc = T.loc;

            } else {
                t = v = undefined;
            }
            lookahead = righthand(tokens, i);	// i see, i have to update that. it just picks them off the array. 
            return T;				// origin: first the tokenizer tokenized html for my syntax highlighter
        } else if (i == j) {
            T = v = t = undefined;
            return false;
        }
        throw error(new RangeError("parse: next(): Unexpected end. Mean called once to often. Should stop on j = length."));
    }

    // ========================================================================================================
    // Literals, Identifier
    // ========================================================================================================

    parser.Literal = Literal;

    function Literal() {
        var node;
        if (IsAnyLiteral[t]) {
            node = Node(t);
            node.details = T.details;
            node.value = v;
            debug("Literal packed " + v);
            node.loc = makeLoc(loc && loc.start, loc && loc.end);
            pass(v);
            if (compile) return builder[node.type](node.value, loc);
            return node;
        }
        return null;
    }

    function Identifier() {

        if (t === "Identifier" || (v === "yield" && yieldIsId) || (v === "default" && defaultIsId)) {

            var node = Node("Identifier");
            node.name = v;
            node.loc = T.loc;

            debug("Identifier packed " + v);

            pass(v);

            if (compile) return builder["identifier"](node.name, loc);
            return node;
        }
        return null;
    }

    parser.Identifier = Identifier;
    parser.ClassExpression = ClassExpression;
    parser.TemplateLiteral = TemplateLiteral;



    function ClassExpression() {
        if (v === "class") {
            // Einfach gemacht.
            var isExpr = true;
            var node = this.ClassDeclaration(isExpr);
            return node;
        }
        return null;
    }

    function TemplateLiteral() {
        if (t === "TemplateHead" || t === "NoSubstitutionTemplate") {
            var l1, l2;
            l1 = loc && loc.start;
            var node = Node("TemplateLiteral");
            node.spans = [T];
            if (t !== "NoSubstitutionTemplate") {
                while (t !== "TemplateTail") {
                    next(/*inputelementtemplatetail*/);
                    node.spans.push(T);
                }
            } else {
                node.noSubstitutionTemplate = true;
            }
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            pass(v);
            return compile ? builder["templateLiteral"](node.spans, node.loc) : node;
        }
        return null;
    }
    parser.Elision = Elision;

    function Elision(node) {
        if (v === ",") {
            var l1, l2;
            if (node) {
                node.width += 1;
                if (node.loc) {
                    node.loc.end = loc && loc.end;
                }

            } else {
                node = Node("Elision");
                node.width = 1;
                l1 = loc && loc.start;
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
            }
            pass(v);
            return compile ? builder["elision"](node.value, node.loc) : node;
        }
        return null;
    }

    parser.ElementList = ElementList;

    function ElementList() {
        var list = [],
            el;

        do {

            if (v === "," && lookahead == ",") {
                el = null;
                do {
                    el = this.Elision(el);
                } while (v === ",");
                list.push(el);
            }

            if (v === "]") break;

            el = this.SpreadExpression() || this.AssignmentExpression();
            list.push(el);

            if (v === ",") {
                if (lookahead !== ",") pass(",");
                continue;
            } 
            /*else if (v !== "]") {
                    throwError(new SyntaxError("buggy element list"));
             }*/

        } while (v && v !== "]");

        return list;
    }
    parser.ArrayExpression = ArrayExpression;

    function ArrayExpression() {
        var node, l1, l2;

        if (v === "[") {
            l1 = loc && loc.start;

            if (lookahead === "for") return this.ArrayComprehension();

            pass("[");

            var node = Node("ArrayExpression");

            if (v !== "]") node.elements = this.ElementList(node);
            else node.elements = [];

            l2 = loc && loc.end;
            pass("]");
            node.loc = makeLoc(l1, l2);
            return compile ? builder["arrayExpression"](node.elements, node.loc) : node;
        }
        return null;
    }



    parser.StrictFormalParameters = StrictFormalParameters;
    function StrictFormalParameters() {
        return this.FormalParameterList.apply(this, arguments);
    }
    parser.PropertyDefinitionList = PropertyDefinitionList;


    parser.ComputedPropertyName = ComputedPropertyName;
    function ComputedPropertyName() {
        var propertyName;
        if (v === "[") {
            pass("[");
            propertyName = this.AssignmentExpression();
            pass("]");
            return propertyName;
        }
        return null;
    }

    parser.PropertyKey = PropertyKey;
    function PropertyKey() {
        var node;
        node = this.ComputedPropertyName() || this.Identifier() || this.Literal();
        if (!node && (Keywords[v])) {
            node = Node("Identifier");
            node.name = v;
            node.loc = T && T.loc;
        }
        if (node) return node;
        throwError(new SyntaxError("invalid property key in definition list"));
        return null;
    }

    function PropertyDefinitionList(parent) {
        var list = [];
        list.type = "PropertyDefinitionList";
        var id;
        var node, hasAsterisk, computedPropertyName; // p ist hier der node-name (renamen)
        var method;
        do {

            if (v == "}") break;

            if ((v === "get" || v === "set") && lookahead !== ":" && lookahead !== "(") {

                node = Node("PropertyDefinition");
                node.kind = v;
                method = this.MethodDefinition(parent, true);
                if (!method) throwError(new SyntaxError("Error parsing MethodDefinition in ObjectExpression"));
                node.key = method.id;
                node.value = method;
                list.push(node);

            } else {

                /* 
                 This has to be cleaned up. I did today, and removed the double method, the double "init", the computedPropertyName,
                 and used PropertyKey() for both. It looked nice and clean. But it failed. So i restored it for now. I want to write
                 it again (from scratch), but tomorrow.
                 */

                if (v === "[") {
                    computedPropertyName = this.ComputedPropertyName();
                } else computedPropertyName = undefined;

                if (v === "*" || computedPropertyName || (BindingIdentifiers[t] || v === "constructor")) { //*[ Id

                    node = Node("PropertyDefinition");

                    if ((lookahead === "," || lookahead === "}") && (BindingIdentifiers[t] || v === "constructor")) { // {x,y}

                        node.kind = "init";
                        id = this.PropertyKey();
                        if (!id) throwError(new SyntaxError("error parsing objectliteral shorthand"))
                        node.key = id;
                        node.value = id;
                        list.push(node);

                    } else if (computedPropertyName && v === ":") { // [s]:

                        node.kind = "init";
                        node.key = computedPropertyName;
                        node.computed = true;
                        pass(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throwError(new SyntaxError("error parsing objectliteral := [symbol_expr]: assignmentexpression"))
                        list.push(node);

                    } else if (lookahead === ":") { // key: AssignmentExpression

                        node.kind = "init";
                        node.key = this.PropertyKey();
                        pass(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throwError(new SyntaxError("error parsing objectliteral := propertykey : assignmentexpression"))
                        list.push(node);

                    } else if (computedPropertyName && v == "(") {

                        node.kind = "method";
                        method = this.MethodDefinition(parent, true, computedPropertyName);
                        if (!method) throwError(new SyntaxError("Error parsing method definition in ObjectExpression."));
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);

                    } else if (((v == "[" || BindingIdentifiers[t] || v === "constructor") && lookahead === "(") || (v === "*" && (lookahead == "[" || BindingIdentifiers[lookaheadt] || lookahead === "constructor"))) {

                        node.kind = "method";
                        method = this.MethodDefinition(parent, true);
                        if (!method) throwError(new SyntaxError("Error parsing method definition in ObjectExpression."));
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);
                    }

                }
            }
            computedPropertyName = undefined;

            if (v === ",") {
                pass(",");
            } else break;

        } while (v !== "}" && v !== undefined);

        return list;
    }


    parser.ObjectExpression = ObjectExpression;


    function ObjectExpression() {
        var node, l1, l2;
        if (v === "{") {


            l1 = loc && loc.start;
            node = Node("ObjectExpression");
            node.properties = [];
            pass("{");
            node.properties = this.PropertyDefinitionList();
            l2 = loc && loc.end;
            pass("}");
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            return compile ? builder["objectExpression"](node.properties, node.loc) : node;


        }
        return null;
    }
    parser.MemberExpression = MemberExpression;

    function MemberExpression(obj) {
        var node, l1, l2;

        if (obj === undefined)
            obj = this.PrimaryExpression();

        if (obj) {
            l1 = obj.loc && obj.loc.start;

            var node = Node("MemberExpression");
            node.object = obj;

            if (v === "TemplateLiteral") return this.CallExpression(obj);
            else if (v === "[") {

                pass("[");
                node.computed = true;
                node.property = this.AssignmentExpression();
                pass("]");

            } else if (v === ".") {

                pass(".");
                node.computed = false;

                if (t === "Identifier" || t === "Keyword" || propKeys[v] || t === "NumericLiteral") {
                    var property = Object.create(null);
                    property.type = "Identifier";
                    property.name = v;
                    property.loc = T.loc
                    node.property = property;

                } else if (v === "!") {

                    // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency
                    // MemberExpression ! [Expression]
                    // MemberExpression ! Arguments
                    // MemberExpression ! Identifier
                    // setzt .eventual auf true

                } else {

                    throwError(new SyntaxError("MemberExpression . Identifier expects a valid IdentifierString or an IntegerString as PropertyKey."));
                }

                pass(v);

            } else return node.object;
            // recur toString().toString().toString().valueOf().toString()
            if (v == "[" || v == ".") return this.MemberExpression(node);
            else if (v == "(") return this.CallExpression(node);
            else if (t == "TemplateLiteral") return this.CallExpression(node);
            // strawman:concurrency addition 
            // else if (v == "!") return this.MemberExpression(node);

            EarlyErrors(node);
            if (compile) return builder["memberExpression"](node.object, node.property, node.computed, node.loc);
            l2 = loc && loc.end;

            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }

    function Arguments() {
        var args, arg;
        if (v === "(") {

            pass("(");
            args = [];

            if (v !== ")")
                do {

                    if (v === ")") break;

                    arg = this.SpreadExpression() || this.AssignmentExpression();
                    if (arg) args.push(arg);
                    if (v === ",") {
                        pass(",");
                        continue;
                    }

                    //else if (v !== ")") {
                    //    throwError(new SyntaxError("Error parsing the argument list of a call expression"));
                    //}

                } while (v !== undefined && i < j);

            pass(")");
            return args;
        }
        return null;
    }
    parser.Arguments = Arguments;

    function CallExpression(parent) {

        var node, tmp, l1, l2;
        l1 = l2 = (loc && loc.start);

        if (parent) tmp = parent;
        else tmp = this.MemberExpression();

        if (tmp) {
            l1 = tmp.loc && tmp.loc.start;

            node = Node("CallExpression");
            node.callee = tmp;
            node.arguments = null;

            if (t === "TemplateLiteral") {

                node.arguments = [this.TemplateLiteral()];
                l2 = loc && loc.end;

                node.loc = makeLoc(l1, l2);
                if (compile) return builder.callExpression(node.callee, node.arguments, node.loc);
                return node;
            } else if (v === "(") {

                node.arguments = this.Arguments();

                if (v === "(") {
                    // ..()()()

                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    return this.CallExpression(node);

                } else if (v === "[" || v == ".") {

                    // ..[][][] x.y.z.a.b
                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    return this.MemberExpression(node);

                } else {

                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    if (compile) return builder.callExpression(node.callee, node.arguments, node.loc);
                    return node;
                }

            } else {

                return node.callee;
            }

        }
        return null;
    }
    parser.CallExpression = CallExpression;
    parser.NewExpression = NewExpression;

    function NewExpression() {
        var node, l1, l2;

        if (v === "new") {

            l1 = loc && loc.start;
            l2 = loc && loc.end;
            node = Node("NewExpression");
            pass("new");

            if (v === "new") node.callee = this.NewExpression();
            else {

                var callee = this.CallExpression();
                if (callee && callee.type === "CallExpression") {
                    node = callee;
                    node.type = "NewExpression";
                } else node.callee = callee;
            }

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder.newExpression(node.callee, node.arguments, node.loc);
            return node;
        }
        return null;
    }

    function LeftHandSideExpression() {
        return this.NewExpression() || this.CallExpression();
    }

    /*

     - ( GeneratorComprehension )
     abkuerzung fuer eine (function * () { for (k of a) yield k; }());

     */

    parser.ComprehensionForList = ComprehensionForList;

    function ComprehensionForList() {
        var list = [], el, binding, ae;
        while (v === "for") {
            pass("for");
            pass("(");
            binding = this.ForBinding();
            pass("of");
            ae = this.AssignmentExpression();
            var block = Node("ComprehensionBlock");
            block.left = binding;
            block.right = ae;
            list.push(block);
            pass(")");
        }
        return list.length ? list : null;
    }

    parser.ComprehensionFilters = ComprehensionFilters;

    function ComprehensionFilters() {
        var list = []
        while (v == "if") {
            pass("if");
            pass("(");
            list.push(this.AssignmentExpression());
            pass(")");
        }
        return list.length ? list : null
    }

    parser.ArrayComprehension = ArrayComprehension;

    function ArrayComprehension() {
        var node, blocks, filter;

        if (v === "[") {
            var l1, l2;
            l1 = loc && loc.start;
            node = Node("ArrayComprehension");
            node.blocks = [];
            node.filter = [];
            pass("[");
            while (v === "for") {
                blocks = this.ComprehensionForList();
                if (blocks) node.blocks = node.blocks.concat(blocks);
                filter = this.ComprehensionFilters();
                if (filter) node.filter = node.filter.concat(filter);
            }
            node.expression = this.AssignmentExpression();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            pass("]");
            EarlyErrors(node);
            if (compile) return builder.comprehensionExpression(node.blocks, node.filter, node.expression, node.loc);
            return node;
        }
        return null;
    }

    parser.GeneratorComprehension = GeneratorComprehension;

    function GeneratorComprehension() {
        var node;

        if (v === "(") {
            var l1, l2;
            l1 = loc && loc.start;

            node = Node("GeneratorComprehension");

            pass("(");

            node.blocks = this.ComprehensionForList();
            node.filter = [];
            while (v == "if") {
                pass("if");
                node.filter.push(this.Expression());
            }

            node.expression = this.AssignmentExpression();

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;

    }

    parser.ExpressionStatement = ExpressionStatement;

    function ExpressionStatement(expr, l1, l2) {
        var node = Node("ExpressionStatement");
        node.expression = expr;
        node.loc = makeLoc(l1, l2);
        return node;
    }

    parser.SequenceExpression = SequenceExpression;

    function SequenceExpression(list, l1, l2) {
        var node = Node("SequenceExpression");
        node.sequence = list;
        node.loc = makeLoc(l1, l2);
        return node;
    }

    parser.Expression = Expression;

    function Expression(stop, parenthesised) {

        var list = [];
        var node;
        var ae;
        var l1 = loc && loc.start;
        var l2;

        var hasStop = typeof stop === "string";

        if (!parenthesised && (ExprNoneOfs[v] || (v === "let" && lookahead === "["))) return null;
        do {
            debug("expr at " + v);

            if (hasStop && v === stop) break;
            ae = this.AssignmentExpression();
            if (ae) list.push(ae);
            if (hasStop && v === stop) break;

            if (v === ",") {
                pass(",");
                continue;
            } else break;

        } while (i < j && v !== undefined);

        l2 = loc && loc.end;

        switch (list.length) {
            case 0:
                return null;
                break;
            case 1:
                node = list[0];
                if (parenthesised) return this.ParenthesizedExpressionNode(node, l1, l2);
                return this.ExpressionStatement(node, l1, l2);
                break;
            default:
                node = this.SequenceExpression(list, l1, l2);
                if (parenthesised) return this.ParenthesizedExpressionNode(node, l1, l2);
                else return node;
        }
    }

    parser.ExpressionNoIn = ExpressionNoIn;
    function ExpressionNoIn() {
        noInStack.push(isNoIn);
        isNoIn = true;
        var node = this.Expression();
        isNoIn = noInStack.pop();
        return node;
    }

    parser.AssignmentExpressionNoIn = AssignmentExpressionNoIn;
    function AssignmentExpressionNoIn() {
        noInStack.push(isNoIn);
        isNoIn = true;
        var node = this.AssignmentExpression();
        isNoIn = noInStack.pop();
        return node;
    }

    parser.ParenthesizedExpression = ParenthesizedExpression;
    function ParenthesizedExpression() {
        return this.Expression(undefined, true);
    }
    
    // temporary until it replaces Expression, ParenthesizedExpression
    // and has Code in runtime.js for evaluation["ParenthesizedExpression"]
    parser.ParenthesizedExpressionNode = ParenthesizedExpressionNode;
    function ParenthesizedExpressionNode(exprNode, startLoc, endLoc) {
	   var node = Node("ParenthesizedExpression");
	   node.expression = exprNode;
	   node.loc = makeLoc(startLoc, endLoc);
	   return node;
    }

    parser.CoverParenthesizedExpression = CoverParenthesizedExpression;

    function CoverParenthesizedExpression(tokens) {
        var expression = parseGoal("ParenthesizedExpression", tokens);
        return expression;
    }

    parser.ArrowParameterList = ArrowParameterList;

    function ArrowParameterList(tokens) {
        var formals = parseGoal("FormalParameterList", tokens);
        return formals;
    }

    parser.CoverParenthesisedExpressionAndArrowParameterList = CoverParenthesisedExpressionAndArrowParameterList;

    function CoverParenthesisedExpressionAndArrowParameterList() {

        var parens = [];
        var covered = [];
        var cover = false;
        var expr, node, l1, l2;
        l1 = loc && loc.start;

        if (t === "Identifier" && lookahead === "=>") {
            expr = this.Identifier();
            cover = true;
            

        } else if (v === "(") {
            if (lookahead === "for") return this.GeneratorComprehension();

            cover = true;
            parens.push(v);

            while (next()) {
                if (v === "(") {
                    parens.push(v);
                } else if (v === ")") {
                    parens.pop();
                    if (!parens.length) {
                        covered.push(T);
                        break;
                    }
                }
                covered.push(T);
            }

            if (i >= j) throwError(new SyntaxError("no tokens left over covering expression"));

            pass(")");

        }

        if (cover) {
                

            if (v === "=>") {
                node = Node("ArrowExpression");
                node.kind = "arrow";
                node.strict = true;
                node.expression = true;                
                node.params = (expr ? [expr] : this.ArrowParameterList(covered));
                pass("=>");
                node.body = this.ConciseBody(node);
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) return builder.arrowExpression(node.params, node.body, node.loc);
                return node;
            } else {
                return this.CoverParenthesizedExpression(covered);
            }
        }
        return null;
    }

    parser.ConciseBody = ConciseBody;

    function ConciseBody(parent) {
        if (v == "{") {
            var body;
            yieldStack.push(yieldIsId);
            yieldIsId = true;
            pass("{");
            body = this.FunctionBody(parent);
            pass("}");
            yieldIsId = yieldStack.pop();
            return body;
        }
        return this.AssignmentExpression();
    };

    function PrimaryExpression() {
        var fn, node;
        debug("primary at " + v);
        fn = this[PrimaryExpressionByValue[v]];
        if (!fn) fn = this[PrimaryExpressionByType[t]];
        if (!fn && yieldIsId && v === "yield") fn = this.YieldAsIdentifier;
        if (!fn && defaultIsId && v === "default") fn = this.DefaultAsIdentifier;
        if (fn) node = fn.call(this);
        if (node) return node;
        return null;
    }

    parser.YieldExpression = YieldExpression;
    parser.YieldStatement = YieldExpression;

    parser.DefaultAsIdentifier = DefaultAsIdentifier;

    function DefaultAsIdentifier() {
        if (v === "default") {
            if (defaultIsId) {
                var node = Node("Identifier");
                node.name = "default";
                node.loc = T && T.loc;
                pass("default");
                return node;
            }
        }
        return null;
    }

    parser.YieldAsIdentifier = YieldAsIdentifier;

    function YieldAsIdentifier() {
        if (v === "yield") {
            if (yieldIsId) {
                var node = Node("Identifier");
                node.name = "yield";
                node.loc = T && T.loc;
                pass("yield");
                return node;
            }
        }
        return null;
    }

    function YieldExpression() {
        if (v === "yield" && !yieldIsId) {
                pass("yield");
                var node = Node("YieldExpression");
                node.argument = this.Expression(";");
                return node;
        }
        return null;
    }

    function PostfixExpression(lhs) {
        var l1 = loc && loc.start;
        lhs = lhs || this.LeftHandSideExpression();
        if (lhs) debug("got lhs " + lhs.type);
        if (lhs && UpdateOperators[v]) {
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = false;
            node.argument = lhs;
            node.loc = makeLoc(l1, loc && loc.end);
            pass(v);
            return node;
        }
        return lhs;
    }

    function UnaryExpression() {
        if (UnaryOperators[v] || UpdateOperators[v]) {
            var l1 = loc && loc.start;
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = true;
            pass(v);
            node.argument = this.PostfixExpression();
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return this.PostfixExpression();
    }

    parser.ConditionalExpressionNoIn = ConditionalExpressionNoIn;

    function ConditionalExpressionNoIn(left) {
        noInStack.push(isNoIn);
        isNoIn = true;
        var r = this.ConditionalExpression(left);
        isNoIn = noInStack.pop();
        return r;
    }
    parser.ConditionalExpression = ConditionalExpression;

    function ConditionalExpression(left) {
        if (left && v === "?") {
            var l1 = loc && loc.start,
                l2;
            var node = Node("ConditionalExpression");
            node.test = left;
            pass("?");
            node.consequent = this.AssignmentExpression();
            pass(":");
            node.alternate = this.AssignmentExpression();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }

    parser.LeftHandSideExpression = LeftHandSideExpression;
    parser.ExpressionStatement = ExpressionStatement;
    parser.Expression = Expression;
    parser.PrimaryExpression = PrimaryExpression;
    parser.PostfixExpression = PostfixExpression;
    parser.UnaryExpression = UnaryExpression;

    parser.AssignmentExpression = AssignmentExpression;



    function AssignmentExpression() { // der parent parameter ist völlig dummsinnig. Aber wiederaufnahme der rekursion wäre gut. Für einen anderen Fall.

        var node = null,
            leftHand, l1, l2;

        l1 = loc && loc.start;
        debug("At assignmentexpression with " + t + ", " + v);
        
        if (!yieldIsId && v === "yield") node = this.YieldExpression();
        if (!node) node = this.CoverParenthesisedExpressionAndArrowParameterList();

        if (!node) leftHand = this.UnaryExpression();
        else leftHand = node;

        if (!leftHand) return null;
        if (v === undefined) return leftHand;
        if ((isNoIn === true && InOrOf[v])) return leftHand;
        if (v === "," || ExprEndOfs[v]) return leftHand;

        if (t !== "Punctuator" && !InOrOfInsOf[v]) {
            // throwError(new SyntaxError("can not parse expression"));
            return leftHand;
        }

        if (v === "?") {
            node = this.ConditionalExpressionNoIn(leftHand);
            return node;
        }


        // Fixing the recursion to lhs upwards again
        if (v === "." || v === "[") leftHand = this.MemberExpression(leftHand);
        else if (v === "(" || v === "`") leftHand = this.CallExpression(leftHand);
        else if (v == "++" || v == "--") leftHand = this.PostfixExpression(leftHand);

        if (AssignmentOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {

            node = Node("AssignmentExpression");
            node.longName = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;

            debug(v);
            pass(v);

            node.right = this.AssignmentExpressionNoIn(node);
            if (!node.right) throwError(new SyntaxError("can not parse a valid righthandside for this assignment expression"));

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;

        } else if (BinaryOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {
            node = Node("BinaryExpression");
            node.longName = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;
            debug(v);
            pass(v);
            node.right = this.AssignmentExpression();
            if (!node.right) throwError(new SyntaxError("can not parse a valid righthandside for this binary expression"));
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            node = rotate_binexps(node);
            return node;
        } else {
            return leftHand;
        }
    }

    parser.SuperExpression = SuperExpression;

    function SuperExpression() {
        if (v === "super") {
            var l1 = loc && loc.start;
            var node = Node("SuperExpression");
            node.loc = makeLoc(l1, l1);
            pass("super");
            if (currentScopeNode) currentScopeNode.needsSuper = true; //
            // wird nicht im classDefaultConstructor erkannt sein.!
            if (compile) return builder.superExpression(node.loc);
            return node;
        }
        return null;
    }
    parser.ThisExpression = ThisExpression;

    function ThisExpression() {
        if (v === "this") {
            var l1 = loc && loc.start;
            var node = Node("ThisExpression");
            node.loc = makeLoc(l1, l1);
            pass("this");
            if (compile) return builder.thisExpression(node.loc);
            return node;
        }
        return null;
    }

    parser.Initialiser = Initialiser;

    function Initialiser() {
        if (v === "=") {
            pass("=");
            var expr = this.AssignmentExpression();
            return expr;
        }
        return null;
    }

    // hier ist binding elements
    parser.BindingElementList = BindingElementList;
    parser.BindingPattern = BindingPattern;

    function BindingElementList() {
        var list = [];
        var id, bindEl, l1, l2;
        if (v === "{") {

            pass("{");

            while (v !== "}") {

                if (StartBinding[v]) id = this.BindingPattern();
                else id = this.Identifier();

                if (v === ":") {
                    l1 = id.loc && id.loc.start;
                    bindEl = Node("BindingElement");
                    bindEl.id = id;
                    pass(":");
                    bindEl.as = this.Identifier();
                    l2 = loc && loc.end;
                    bindEl.loc = makeLoc(l1, l2);

                    staticSemantics.addLexBinding(bindEl.as.name);

                    list.push(bindEl);
                } else {

                    staticSemantics.addLexBinding(id.name);
                    list.push(id);
                }

                if (v === ",") {
                    pass(",");
                    if (v === "}") break;
                    continue;
                }
                //else if (v !== "}") throwError(new SyntaxError("illegal statement in binding element list"));
            }

            pass("}");
        } else if (v === "[") {
            pass("[");
            while (v !== "]") {

                if (v === "...") id = this.RestParameter();
                else if (StartBinding[v]) id = this.BindingPattern();
                else id = this.Identifier();
                if (id) list.push(id);

                if (v === ",") {
                    pass(",");
                    if (v === "]") break;
                    continue;
                }
                //else if (v !== "]") throwError(new SyntaxError("illegal statement in binding pattern"));
            }
            pass("]");
        }
        return list;
    }
    parser.BindingPattern = BindingPattern;

    var PatternName = {
        __proto__: null,
        "{": "ObjectPattern",
        "[": "ArrayPattern"
    };

    function BindingPattern() {
        var node, l1, l2;
        if (StartBinding[v]) {
            l1 = loc && loc.start;
            node = Node(PatternName[v]);
            node.elements = this.BindingElementList();
            if (v === "=") node.init = this.Initialiser();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder.bindingPattern(node.type, node.elements, node.init, node.loc);
            return node;
        }
        return null;
    }
    parser.VariableDeclaration = VariableDeclaration;

    function VariableDeclaration(kind) {

        var node = this.BindingPattern();

        if (node) {
            node.kind = kind;
            return node;
        }

        if (t === "Identifier" || (v === "yield" && yieldIsId) || (v === "default" && defaultIsId)) {

            node = Node("VariableDeclarator");
            node.kind = kind;

            var id = this.Identifier();
            node.id = id.name;

            if (kind == "var") staticSemantics.addVarBinding(id.name);
            else staticSemantics.addLexBinding(id.name);

            if (v === "=") node.init = this.Initialiser();
            else if (v === ",") node.init = null;
            else if (v === ";") node.init = null;
            else if (v === "in" || v === "of") node.init = null;
            return node;
        }

        return null;
    }
    parser.VariableDeclarationList = VariableDeclarationList;

    function VariableDeclarationList(kind) {
        var list = [];
        var decl;
        while (i < (j - 1)) {

            decl = this.VariableDeclaration(kind);
            if (decl) list.push(decl);
            if (isNoIn && InOrOf[v]) break;

            if (v === ",") {
                pass(",");
                continue;
            } else if (v === ";") {
                break;
            } else if (v === undefined) break;

        }
        return list;
    }
    parser.VariableStatement = VariableStatement;

    var LetOrConst = {
        __proto__: null,
        "let": true,
        "const": true
    };

    function VariableStatement() {
        var node, decl, l1, l2;
        if (v === "var" || v === "let" || v === "const") {
            l1 = loc && loc.start;
            node = Node("VariableDeclaration");
            node.declarations = [];
            node.kind = v;
            if (LetOrConst[v]) node.type = "LexicalDeclaration";
            pass(v);
            node.declarations = this.VariableDeclarationList(node.kind);
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder["variableStatement"](node.kind, node.declarations, node.loc);
            return node;
        }
        return null;
    }

    parser.MethodDefinition = MethodDefinition;
    function MethodDefinition(parent, isObjectMethod, computedPropertyName) {

        var l1, l2;
        var node;
        var isStaticMethod = false;
        var isGenerator = false;
        var init = false;
        var isGetter = false;
        var isSetter = false;
        var isComputedPropertyKey = false;

        if (v === "}") return null;

        l1 = loc && loc.start;

        if (v === ";") {
            if (!isObjectMethod) pass(";");
        }

        if (v === "static" && !isObjectMethod) {
            isStaticMethod = true;
            pass(v);
        }

        if (v === "*") {
            isGenerator = true;
            pass(v);
        } else if (v === "get") {
            isGetter = true;
            pass(v);
            // get c() {}
        } else if (v === "set") {
            isSetter = true;
            pass(v);
            // set c() {}
        }





        node = Node("MethodDefinition");

        scopeNodeStack.push(currentScopeNode)
        currentScopeNode = node;

        if (v =="[") node.computed = true;
        node.id = this.PropertyKey();


        node.generator = isGenerator;
        if (!isObjectMethod) node.static = isStaticMethod;

        if (isGetter) node.kind = "get";
        if (isSetter) node.kind = "set";
        pass("(");
        node.params = this.FormalParameterList();
        pass(")");
        pass("{");
        node.body = this.FunctionBody(node);
        pass("}");
        l2 = loc && loc.end;
        node.loc = makeLoc(l1, l2);
        EarlyErrors(node);
        if (compile) return builder.methodDefinition(node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc);

        currentScopeNode = scopeNodeStack.pop();

        return node;


        /*
         } else if (((computedPropertyName && v === "=") || lookahead === "=") && !isObjectMethod) {

         node = Node("PropertyDefinition");
         if (computedPropertyName) {
         node.id = computedPropertyName
         node.computed = true;
         } else {
         node.id = v;
         pass(v);
         }
         node.static = isStatic;
         pass("=");
         node.value = this.AssignmentExpression();
         l2 = loc && loc.end;
         node.loc = makeLoc(l1, l2);
         if (compile) return builder.propertyDefinition(node.id, node.static, node.value, node.loc);
         return node;
         }*/

        return node;

    }

    parser.ClassDeclaration = ClassDeclaration;

    function ClassDeclaration(isExpr) {
        var node, m;
        if (v === "class") {

            staticSemantics.newVarEnv();

            node = Node("ClassDeclaration");
            node.id = null;
            node.expression = !! isExpr;
            node.extends = null;
            node.elements = [];

            pass("class");
            var id = this.Identifier();
            node.id = id.name;

            staticSemantics.addLexBinding(id);

            if (v === "extends") {
                pass("extends");
                node.extends = this.AssignmentExpression();
            }

            pass("{");
            while (v !== "}") {
                m = this.MethodDefinition(node);
                node.elements.push(m);
            }

            pass("}");

            staticSemantics.popEnvs();
            if (compile) return builder["classExpression"](node.id, node.extends, node.elements, node.loc);
            return node;
        }
        return null;
    }

    parser.RestParameter = RestParameter;

    function RestParameter() {
        if (v === "...") {
            var l1 = loc && loc.start;
            pass("...");
            var node = Node("RestParameter");
            node.id = v;

            staticSemantics.addLexBinding(v);

            pass(v);
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return builder["restParameter"](node.id, node.loc);
            return node;
        }
        return null;
    }

    parser.SpreadExpression = SpreadExpression;

    function SpreadExpression() {
        if (v === "...") {
            var l1 = loc && loc.start;
            pass("...");
            var node = Node("SpreadExpression");
            node.argument = this.AssignmentExpression();
            var l2 = node.argument.loc && node.argument.loc.end; 
            node.loc = makeLoc(l1, l2);
            if (compile) return builder["spreadExpression"](node.argument, node.loc);
            return node;
        }
        return null;
    }
    parser.DefaultParameter = DefaultParameter;

    function DefaultParameter() { // ES6
        var node;
        if (t == "Identifier" && lookahead == "=") {
            var l1 = loc&&loc.start;
            node = Node("DefaultParameter");
            var id = this.Identifier();
            node.id = id.name;
            pass("=");
            node.init = this.AssignmentExpression();
            node.loc = makeLoc(l1, loc && loc.end);
            if (compile) return builder["defaultParameter"](node.id, node.init, node.loc);
            return node;
        }
        return null;
    }

    parser.FormalParameterList = FormalParameterList;

    function FormalParameterList() {
        var list = [];

        list.type = "FormalParameterList";

        var defaults;
        var id;
        var x;
        do {
            x = i;
            if (v) {

                debug("formalparameters calling with " + v);
                if (v === ")") break;

                else if (v === "...") {
                    id = this.RestParameter();
                    list.push(id);
                } else if (StartBinding[v]) {
                    id = this.BindingPattern();
                    list.push(id);
                } else if (t === "Identifier") {
                    if (lookahead == "=") {
                        id = this.DefaultParameter();
                    } else {
                        id = this.Identifier();
                        staticSemantics.addLexBinding(id.name);
                    }
                    list.push(id);
                }

                if (v === ",") {
                    pass(",");
                    continue;
                }

            }
            if (x == i) break;
        } while (v !== undefined && v !== ")" && i < j);

        return list;
    }
    parser.FunctionExpression = FunctionExpression;

    function FunctionExpression() {
        return this.FunctionDeclaration(true);
    }
    parser.FunctionBody = FunctionBody;

    function GeneratorBody(parent) {
        yieldStack.push(yieldIsId);
        yieldIsId = false;
        var body = this.FunctionBody(parent);
        yieldIsId = yieldStack.pop();
        return body;
    }
    parser.GeneratorBody = GeneratorBody;

    function FunctionBody(parent) {
        var body = [];
        body.type = "FunctionStatementList";
        var node, strict;
        if (v === "}") return body;
        this.DirectivePrologue(parent, body);
        while (v !== undefined && v !== "}") {
            node = this.FunctionDeclaration() || this.ModuleDeclaration() || this.ClassDeclaration() || this.Statement();
            body.push(node);
        }
        return body;
    }

    parser.FunctionDeclaration = FunctionDeclaration;

    function FunctionDeclaration(isExpr) {
        var node, start, end, sourceStart, sourceEnd;

        if (v === "function") {

            defaultStack.push(defaultIsId);
            defaultIsId = true;

            start = loc && loc.start;

            pass("function");

            if (v === "*") {
                node = Node("GeneratorDeclaration");
                node.generator = true;
                pass("*");
            } else {
                node = Node("FunctionDeclaration");
                node.generator = false;
            }

            scopeNodeStack.push(currentScopeNode);
            currentScopeNode = node;


            node.id = null;
            node.params = [];
            node.expression = !! isExpr;
            node.strict = false;
            node.body = [];


            var id;

            if (v !== "(") id = this.Identifier();
            if (id) node.id = id.name;
            else {
                if (!node.expression) {
                    throwError(new SyntaxError("Function and Generator Declarations must have a name [only expressions can be anonymous]"));
                }
            }

            if (id && !isExpr) staticSemantics.addVarBinding(id.name);

            staticSemantics.newVarEnv();
            staticSemantics.newContainer();

            if (id && isExpr) staticSemantics.addVarBinding(id.name);

            pass("(");
            node.params = this.FormalParameterList();
            pass(")");

            if (!node.generator) {
                yieldStack.push(yieldIsId);
                yieldIsId = true;
            } else {
                yieldStack.push(yieldIsId);
                yieldIsId = false;
            }

            pass("{");
            node.body = this.FunctionBody(node);
            pass("}");

            yieldIsId = yieldStack.pop();
            end = loc && loc.end;
            node.loc = makeLoc(start, end);

            /*if (node.generator) {
             AddParentPointers(node);
             }*/

            defaultIsId = defaultStack.pop();



            //node.lexNames = staticSemantics.lexNames();
            //node.varNames = staticSemantics.varNames();

            staticSemantics.popContainer();
            staticSemantics.popEnvs();

            currentScopeNode = scopeNodeStack.pop();

            EarlyErrors(node);
            return node;
        }
        return null;
    }

    function AddParentPointers(node, parent) {
        var n;
        if (Array.isArray(node)) {
            for (var i = 0, j = node.length; i < j; i++) {
                AddParentPointers(node[i], parent);
            }
            return;
        } else {
            for (var k in node) {
                if (Object.hasOwnProperty.call(node, k)) {
                    n = node[k];
                    if (n && typeof n === "object") {
                        if (n.type || Array.isArray(n)) AddParentPointers(n, node);
                    }
                }
            }
            if (node && parent) node.parent = parent;
        }
    }

    parser.BlockStatement = BlockStatement;

    function BlockStatement() {
        if (v === "{") {

            var l1, l2;
            l1 = loc && loc.start;

            staticSemantics.newLexEnv();
            staticSemantics.newContainer();

            var node = Node("BlockStatement");

            defaultStack.push(defaultIsId);
            defaultIsId = true;

            pass("{");
            node.body = this.StatementList();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);

            defaultIsId = defaultStack.pop();
            staticSemantics.popContainer();
            staticSemantics.popEnvs();

            pass("}");
            return node;

        }
        return null;
    }
    parser.BreakStatement = BreakStatement;

    function BreakStatement() {
        if (v === "break") {
            var node, l1, l2;
            l1 = loc && loc.start;
            node = Node("BreakStatement");
            pass("break");
            if (v !== ";") {
                if (ltNext) return node;
                if (t === "Identifier") {
                    var id = this.Identifier();
                    node.label = id.name;
                }
            }
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.ContinueStatement = ContinueStatement;

    function ContinueStatement() {
        var node, l1, l2;
        if (v === "continue") {
            node = Node("ContinueStatement");
            l1 = loc && loc.start;
            pass("continue");
            if (v !== ";") {
                if (ltNext) return node;
                if (t === "Identifier") {
                    var id = this.Identifier();
                    node.label = id.name;
                }
            }
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
    }
    parser.ReturnStatement = ReturnStatement;

    function ReturnStatement() {
        var node, l1, l2;
        if (v === "return") {
            l1 = loc && loc.start;
            node = Node("ReturnStatement");

            pass("return");

            if (v !== ";") {

                if (ltNext) {
                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    return node;
                }
                node.argument = this.Expression();

            }
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.WithStatement = WithStatement;

    function WithStatement() {
        if (v === "with") {
            var node = Node("WithStatement");
            var l1 = loc && loc.start;
            pass("with");
            pass("(");
            node.object = this.Expression();
            pass(")");
            Assert(v === "{", "expecting BlockStatement after with (EXPR)");
            node.body = this.BlockStatement();
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.ThrowStatement = ThrowStatement;

    function ThrowStatement() {
        if (v === "throw") {
            var node, l1, l2;
            node = Node("ThrowStatement");
            l1 = loc && loc.start;
            pass("throw");
            if (v !== ";") {
                if (ltNext) if (notify) return notifyObservers(node);
                node.argument = this.Expression();
            } else skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.LabelledStatement = LabelledStatement;

    function LabelledStatement() {
        if (t === "Identifier" && lookahead === ":") {
            var node = Node("LabelledStatement");
            var l1 = loc && loc.start;
            var label = this.Identifier();
            node.label = label.name;
            pass(":");
            node.statement = this.Statement();
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;
    }
    parser.TryStatement = TryStatement;

    function TryStatement() {
        if (v === "try") {
            var node = Node("TryStatement");
            var l1, l2;
            l1 = loc && loc.start;
            pass("try");
            node.handler = this.Statement();
            if (v === "catch") node.guard = this.Catch();
            if (v === "finally") node.finalizer = this.Finally();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;
    }

    parser.Catch = Catch;

    function Catch() {
        if (v === "catch") {
            var node, l1, l2;
            node = Node("CatchClause");
            l1 = loc && loc.start;
            pass("catch");
            pass("(");
            node.params = this.FormalParameterList();
            pass(")");
            node.block = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.Finally = Finally;

    function Finally() {
        if (v === "finally") {
            var node, l1, l2;
            l1 = loc && loc.start;
            var node = Node("Finally");
            pass("finally");
            node.block = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.DebuggerStatement = DebuggerStatement;

    function DebuggerStatement() {
        if (v === "debugger") {
            var node, l1, l2;
            node = Node("DebuggerStatement");
            l1 = loc && loc.start;
            pass("debugger");
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return builder["debuggerStatement"](node.loc);
            return node;
        }
        return null;
    }
    //
    // Module
    //


    parser.ModuleDeclaration = ModuleDeclaration;

    function ModuleDeclaration() {
        if (v === "module") {
            var node, l1, l2;
            l1 = loc && loc.start;

            staticSemantics.newContainer();
            staticSemantics.newVarEnv();


            node = Node("ModuleDeclaration");
            node.strict = true;

            scopeNodeStack.push(currentScopeNode);
            currentScopeNode = node;

            node.exportEntries = [];
            node.knownExports = [];
            node.unknownExports = [];
            node.knownImports = [];
            node.unknownImports = [];
            node.moduleRequests = [];

            pass("module");

            node.id = this.ModuleSpecifier();
            node.body = this.ModuleBody(node);
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);

            EarlyErrors(node);

            staticSemantics.popContainer();
            staticSemantics.popEnvs();

            currentScopeNode = scopeNodeStack.pop();

            return node;
        }
        return null;
    }
    parser.ModuleSpecifier = ModuleSpecifier;

    function ModuleSpecifier() {
        if (t === "StringLiteral") {
            var specifier = v.slice(1, v.length - 1);
            pass(v);
            return specifier;
        }
        throwError(new SyntaxError("can not make out ModuleSpecifier"));
    }
    parser.ModuleBody = ModuleBody;

    function ModuleBody() {
        var list = [];
        pass("{");
        var item;
        while (v !== undefined && v !== "}") {
            item = this.ExportStatement() || this.ModuleDeclaration() || this.ImportStatement() || this.Statement();
            if (item) list.push(item);
            else throwError(new SyntaxError("Error parsing module body"));
        }
        pass("}");
        return list;
    }

    parser.FromClause = FromClause;

    function FromClause() {
        pass("from");
        var frm = this.ModuleSpecifier();
        return frm;
    }

    //
    // Imports
    //    
    parser.ImportClause = ImportClause;

    function ImportClause() {
        var node = Node("ImportClause");
        var id = this.Identifier();
        node.id = id;
        if (id) {
            if (v === ",") {
                pass(v);
                var node2 = this.NamedImports();

                node.named = node2;
            }
        }
        return node;
    }
    parser.NamedImports = NamedImports;

    function NamedImports() {
        if (v === "{") {
            var list = [];
            while (v && v !== "}") {
                var node = Node("ImportSpecifier");
                node.id = this.Identifier();
                if (v === "as") {
                    pass("as");
                    node.as = this.Identifier();
                }
                list.push(node);
                if (v === ",") {
                    pass(",");
                    continue;
                } else {
                    throwError(new SyntaxError("BindingElement did not terminate with a , or }"));
                }
            }
            return list;
        }
        return null;
    }

    parser.ImportStatement = ImportStatement;

    function ImportStatement() {
        if (v === "import") {
            var l1 = loc && loc.start;
            var l2;
            var node = Node("ImportStatement");
            pass("import");
            var list = node.imports = [];
            var imp;
            if (v === "module") {
                if (ltNext) return null;
                node.module = true;
                node.id = this.Identifier();
            } else {
                while (v !== "from") {
                    if (v === "{") {
                        imp = this.ImportClause();
                        if (imp) list.push(imp);
                    } else if (t === "Identifier") {
                        imp = this.Identifier();
                        if (imp) list.push(imp);
                    } else if (v === ",") {
                        pass(",");
                        continue;
                    } else if (v !== "from") {
                        throwError(new SyntaxError("invalid import statement"));
                    }
                }
            }
            node.from = this.FromClause();
            skip(";");
            EarlyErrors(node);
            return node;
        }
        return null;
    }
    //
    // Exports
    //
    parser.ExportsClause = ExportsClause;

    function ExportsClause() {
        if (v === "{") {
            var list = [];
            while (v && v !== "}") {
                var node = Node("ExportsSpecifier");
                node.id = this.Identifier();
                if (v === "as") {
                    pass("as");
                    node.as = this.Identifier();
                }
                list.push(node);
                if (v === ",") {
                    pass(",");
                    continue;
                } else {
                    throwError(new SyntaxError("BindingElement did not terminate with a , or }"));
                }
            }
            return list;
        }
        return null;
    }

    parser.DeclarationDefault = DeclarationDefault;

    function DeclarationDefault() {
        defaultStack.push(defaultIsId);
        defaultIsId = true;
        var node = this.FunctionDeclaration();
        defaultIsId = defaultStack.pop();
    }

    parser.ExportStatement = ExportStatement;


    var BoundNames = require("slower-static-semantics").BoundNames;

    function ExportStatement() {
        if (v === "export") {
            var l1 = loc && loc.start;
            var l2;

            var node = Node("ExportStatement");
            pass("export");
            if (v === "default") {
                pass("default");
                node.default = true;
                node.exports = this.AssignmentExpression();
                skip(";");

            } else if (v === "*") {

                node.all = true;
                pass(v);
                node.from = this.FromClause();



                skip(";");

            } else {
                node.exports = this.ExportsClause();
                if (node.exports) node.from = this.FromClause();

                else node.exports = this.VariableStatement() || this.DeclarationDefault();


                var names = BoundNames(node.exports);
                for (var i = 0, j = names.length; i < j; i++) {
                    var name = names[i];
                    currentScopeNode.exportEntries.push({ ModuleRequest: null, ImportName: null, LocalName: name, ExportName: name })
                }


                skip(";");
                if (!node.exports) throwError(new SyntaxError("should be an error in the export statement"));
            }


            l2 = loc && loc.end;
            makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;
    }

    /*
     Statement
     */
    parser.StatementList = StatementList;
    parser.SwitchStatementList = SwitchStatementList;

    function SwitchStatementList() {
        var list = [];
        list.type = "StatementList";
        list.switch = true;
        var s;
        debug("swstmtlist():");
        do {
            if (i >= j) break;
            s = this.Statement();
            list.push(s);
        } while (!FinishSwitchStatementList[v]);
        return list;
    }

    function StatementList() {
        var list = [];
        list.type = "StatementList";
        var s;
        debug("stmtlist():");
        do {
            if (i >= j) break;
            s = this.Statement();
            list.push(s);
        } while (!FinishStatementList[v]);

        return list;
    }

    parser.Statement = Statement;

    function Statement(a, b, c, d) {
        var node;
        var x = i;
        debug("statement at " + v);
        var fn = this[StatementParsers[v]];
        if (fn) node = fn.call(this, a, b, c, d);
        if (!node) node = (this.LabelledStatement(a, b, c, d) || this.Expression(a, b, c, d));
        skip(";");
        if (x == i) next();
        return node;
    }

    /*
     Iteration
     */
    parser.IterationStatement = IterationStatement;

    function IterationStatement() {
        if (v === "for") return this.ForStatement();
        if (v === "do") return this.DoWhileStatement();
        if (v === "while") return this.WhileStatement();
        return null;
    }
    parser.ForStatement = ForStatement;

    var positions = [];

    function saveTheDot() {
        var o = {
            loc: loc,
            tokens: tokens,

            i: i,
            j: j,
            T: T,
            t: t,
            v: v,
            lookahead: lookahead,
            isNoIn: isNoIn,
            yieldIsId: yieldIsId,
            defaultIsId: defaultIsId,
            yieldStack: yieldStack,
            defaultStack: defaultStack,
            staticSemantics: staticSemantics
        };
        positions.push(o);
        return o;
    }

    function restoreTheDot(o) {
        o = o || positions.pop();
        if (o) {
            loc = o.loc;
            tokens = o.tokens;
            i = o.i;
            j = o.j;
            T = o.T;
            t = o.t;
            v = o.v;
            lookahead = o.lookahead;
            lookaheadt = o.lookaheadt;
            isNoIn = o.isNoIn;
            yieldIsId = o.yieldIsId;
            defaultIsId = o.defaultIsId;
            yieldStack = o.yieldStack;
            defaultStack = o.defaultStack;
            staticSemantics = o.staticSemantics;
        }
    }

    function dropPositions() {
        return positions.pop();
    }

    function ForDeclaration() {
        var node;
        if (LetOrConst[v]) {
            node = Node("ForDeclaration");
            node.kind = v;
            pass(v);
            node.id = this.ForBinding();
            return node;
        }
        return null;
    }

    parser.ForDeclaration = ForDeclaration;
    parser.ForBinding = ForBinding;

    function ForBinding() {
        var node = this.BindingPattern() || this.Identifier();
        return node;
    }

    parser.VariableStatementNoIn = VariableStatementNoIn;

    function VariableStatementNoIn() {
        noInStack.push(isNoIn);
        isNoIn = true;
        var node = this.VariableStatement();
        isNoIn = noInStack.pop();
        return node;
    }

    parser.ForStatement = ForStatement;

    function ForStatement() {
        var node;
        var left;
        var right;
        var init;
        var test;
        var update;
        var statement;
        var parens = [];
        var peek;
        var numSemi = 0;
        var hasInOf = false;
        var l1, l2;

        if (v === "for") {
            l1 = loc && loc.start;
            pass("for");
            pass("(");

            /* lookahead */
            parens.push("(");
            for (var y = i; y < j; y++) {
                peek = (peek = tokens[y]) && peek.value;

                if (peek === ";") {
                    numSemi += 1;
                } else if (peek === "in" || peek === "of") {
                    hasInOf = peek;
                } else if (peek === "(") {
                    parens.push("(");
                } else if (peek === ")") {
                    parens.pop();
                    if (!parens.length) break;
                }
            }

            /* parse */

            staticSemantics.newLexEnv();
            staticSemantics.newContainer();

            if (numSemi === 2) {
                node = Node("ForStatement");

                if (v === ";") {
                    node.init = null;
                    pass(";");
                } else {
                    if (v === "var") {
                        node.init = this.VariableStatementNoIn();
                    } else if (LetOrConst[v]) {
                        node.init = this.VariableStatementNoIn();
                    } else {
                        node.init = this.ExpressionNoIn();
                    }
                    pass(";")
                }

                if (v === ";") {
                    node.test = null;
                    pass(";");
                } else {
                    node.test = this.Expression(";");
                    pass(";");
                }

                if (v === ")") node.update = null;
                else node.update = this.Expression(")");

                pass(")");

            } else if (numSemi === 0 && hasInOf) {

                node = Node("ForStatement");

                if (v === "var") {
                    pass("var");
                    node.left = this.ForBinding();
                } else if (LetOrConst[v]) {
                    node.left = this.ForDeclaration();
                } else {
                    node.left = this.LeftHandSideExpression();
                }

                if (!node.left) throwError(new SyntaxError("can not parse a valid lefthandside expression for for statement"));

                if (lookahead === "in" || lookahead === "of") next();

                if (v === "in") {
                    node.type = "ForInStatement";
                    pass("in");
                    node.right = this.Expression();
                } else if (v === "of") {
                    node.type = "ForOfStatement";
                    pass("of");
                    node.right = this.AssignmentExpression();
                }

                if (!node.right) throwError(new SyntaxError("can not parse a valid righthandside expression for for statement"));

                pass(")");

            } else {
                throwError(new SyntaxError("invalid syntax in for statement"));
            }

            node.body = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            staticSemantics.popContainer();
            staticSemantics.popEnvs();

            if (compile) {
                if (node.type === "ForStatement") return builder["forStatement"](node.init, node.condition, node.update, node.body, loc);
                else if (node.type === "ForInStatement") return builder["forInStatement"](node.left, node.right, node.body, loc);
                else if (node.type === "ForOfStatement") return builder["forOfStatement"](node.left, node.right, node.body, loc);
            }

            return node;
        }
        return null;
    }

    function WhileStatement() {
        /* IterationStatement : while ( this.Expression ) Statement */
        if (v === "while") {
            staticSemantics.newContainer();
            var l1, l2;
            l1 = loc && loc.start;
            var node = Node("WhileStatement");
            scan("(");
            node.test = this.Expression();
            pass(")");
            node.body = this.Statement();
            l2 = loc && loc.end;
            EarlyErrors(node);
            staticSemantics.popContainer();
            if (compile) return builder["whileStatement"](node.test, node.body, node.loc);
            return node;
        }
        return null;
    }
    parser.WhileStatement = WhileStatement;

    function IfStatement() {

        if (v === "if") {

            var node = Node("IfStatement");
            pass("if");
            pass("(");
            node.test = this.Expression();
            pass(")");
            node.consequent = this.Statement();
            if (v === "else") {
                pass("else");
                node.alternate = this.Statement();
            }
            EarlyErrors(node);
            if (compile) return builder["ifStatement"](node.test, node.consequent, node.alternate, loc);
            return node;
        }
        return null;
    }
    parser.IfStatement = IfStatement;
    parser.DoWhileStatement = DoWhileStatement;

    function DoWhileStatement() {
        if (v === "do") {
            var l1, l2;
            l1 = loc && loc.start;

            staticSemantics.newContainer();

            var node = Node("DoWhileStatement");

            pass("do");
            node.body = this.Statement();
            pass("while");
            pass("(");
            node.test = this.Expression();
            pass(")");
            l2 = loc && loc.end;
            skip(";");
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            staticSemantics.popContainer();

            if (compile) return builder["doWhileStatement"](node.test, node.body, node.loc);
            return node;
        }
        return null;
    }
    parser.SwitchStatement = SwitchStatement;

    function SwitchStatement() {
        if (v === "switch") {

            defaultStack.push(defaultIsId);
            defaultIsId = false;
            staticSemantics.newContainer();

            var c;
            var node = Node("SwitchStatement");

            var l1 = loc && loc.start;
            var l2;

            pass("switch");
            pass("(");
            node.discriminant = this.Expression(")");
            pass(")");
            pass("{");

            var cases = node.cases = [];
            while (v !== "}") {
                c = this.SwitchCase() || this.DefaultCase();
                cases.push(c);
            }
            pass("}");

            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            defaultIsId = defaultStack.pop();
            staticSemantics.popContainer();

            if (compile) return builder["switchStatement"](node.discriminant, node.cases, node.loc);
            return node;
        }
        return null;
    }
    parser.DefaultCase = DefaultCase;

    function DefaultCase() {
        if (v === "default" && lookahead === ":") {
            var node = Node("DefaultCase");
            pass("default");
            pass(":");
            node.consequent = this.SwitchStatementList();
            skip(";");
            return node;
        }
        return null;
    }
    parser.SwitchCase = SwitchCase;

    function SwitchCase() {

        if (v === "case") {
            var node = Node("SwitchCase");
            pass("case");
            node.test = this.Expression(":");
            pass(":");

            node.consequent = this.SwitchStatementList();
            skip(";");

            return node;
        }
        return null;
    }

    parser.EmptyStatement = EmptyStatement;

    function EmptyStatement() {
        /* EmptyStatement : ; */
        var node;
        if (v === ";") {
            node = Node("EmptyStatement");
            node.loc = makeLoc(loc && loc.start, loc && loc.end);
            pass(";");
            if (compile) return builder.emptyStatement(loc);
            return node;
        }
        return null;
    }

    parser.DirectivePrologue = DirectivePrologue;

    function DirectivePrologue(containingNode, nodes) {

        var node;

        while (t === "StringLiteral") { // this was set to "Directive" and killed strict mode last versions.

            if (v === "\"use strict\"" || v === "\'use strict\'") containingNode.strict = true;
            else if (v == "\"use asm\"" || v == "\'use asm\'") containingNode.asm = true;

            var l1 = loc && loc.start;
            var node = Node("Directive");
            node.value = v;
            pass(v);
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            skip(";");
            if (compile) node = builder.directive(node.value, node.loc);
            nodes.push(node);
        }

        return;
    }

    parser.SourceElements = SourceElements;

    function SourceElements(program) {
        var nodes = [];
        var node, strict;

        this.DirectivePrologue(program, nodes);

        do {

            node = this.FunctionDeclaration() || this.ClassDeclaration() || this.ModuleDeclaration() || this.Statement();
            if (node) nodes.push(node);

        } while (i < j && T !== undefined);

        return nodes;
    }


    parser.Module = Module;

    function Module() {
        var root = Node("Module");
        var l1 = loc && loc.start;
        root.body = this.ModuleBody();
        root.strict = true;
        var l2 = loc && loc.end;
        root.loc = makeLoc(l1, l2);
        EarlyErrors(root);
        if (compile) return builder["module"](root.body, root.loc);
        return root;
    }


    parser.Program = Program;

    function Program() {

        staticSemantics.newContainer(); // (node) attach contains and order it
        staticSemantics.newVarEnv(); // newVarEnv(node) directly attach and save time

        var node = Node("Program");
        node.loc = loc = makeLoc();
        loc.start.line = 1;
        loc.start.column = 0;
        var l1 = loc && loc.start;
        var l2;

        next();

        currentScopeNode = node;

        node.body = this.SourceElements(node);

        l2 = loc && loc.end;
        node.loc = makeLoc(l1, l2);
        EarlyErrors(node);

        /*
         node.lexNames = staticSemantics.lexNames();
         node.varNames = staticSemantics.varNames();
         */

        staticSemantics.popContainer();
        
        if (compile) return builder["program"](node.body, loc);
        return node;
    }

    // ===========================================================================================================
    // Regular Expression Parser
    // ===========================================================================================================

    function Atom() {

    }

    function Quantifier() {
        var qf = QuantifierPrefix();
        if (!qf) return null;
        var node = Node("Quantifier");
        node.quantifier = qf;
        if (lookahead === "?") {
            next();
            node.questionmark = true;
        }
        return node;
    }

    var quantifierPrefixes = {
        "*": true,
        "+": true,
        "?": true,
        "{": true
    };

    function QuantifierPrefix() {
        var prefix, digits = "";
        if (quantifierPrefixes[v]) {
            prefix = Node("quantifierprefix");
            if (v === "{") {
                next();
                while (v !== "}") {
                    digits += v;
                    next();
                }
            }
            prefix.value = v;
            return prefix;
        }
        return null;
    }

    function AtomEscape() {

    }

    function Assertion() {
        var node;
        var node = Node("assertion");
        if (v === "^") {

        } else if (v === "$") {

        } else if ((v === "\\" && lookahead === "b") || (v === "\\" && lookahead === "B")) {

        } else if (v === "(" && lookahead === "=") {

        } else if (v === "(" && lookahead === "!") {

        } else {
            return null;
        }
        return node;
    }

    function CharacterClass() {

    }

    function AtomQuantifieropt() {
        var atom = Atom();
        if (atom) {
            var node = Node("term");
            node.atom = atom;
            var qf = Quantifier();
            if (qf) {
                node.quantifier = qf;
            }
            return node;
        }
        return null;
    }

    function Term() {
        var term = Assertion();
        var node = Node("term");
        if (term) {
            node.assertion = term;
            return node;
        }
        term = AtomQuantifieropt();
        if (term) {
            node.atom = term.atom;
            if (term.quantifier) {
                node.quantifier = term.quantifier;
            }
            return node;
        }
        return null;
    }

    function Alternative() {
        var term;
        if (v === undefined) return null;
        var node = Node("alternative");
        var list = [];
        while (term = Term()) {
            list.push(term);
        }
        node.alternatives = list;
        return node;
    }

    function Disjunction() {
        var node = Node("disjunction");
        var alternative = Alternative();
        if (lookahead === "|") {
            scan("|");
            var disjunction = Disjunction();
            if (disjunction) node.disjunction = disjunction;
        }
        return node;
    }

    function Pattern() {
        var node = Node("pattern");
        var disjunction = Disjunction();
        if (disjunction) {
            node.disjunction = disjunction;
            return node;
        } else return null;
    }

    function PatternCharacter() {

    }

    parser.RegularExpressionLiteral = RegularExpressionLiteral;

    function RegularExpressionLiteral() {
        var tree = Pattern();
        if (tree) return tree;
        else throwError(new SyntaxError("Can not parse Regular Expression Source with Goal Symbol Pattern"));
    }

    // ===========================================================================================================
    // JSON Parser is invoked via parseGoal from the Runtime of the Interpreter and is incompatible
    // ===========================================================================================================

    parser.JSONText = JSONText;

    function JSONText() {
        if (!withError) {
            withError = require("api").withError;
            ifAbrupt = require("api").ifAbrupt;
            isAbrupt = require("api").isAbrupt;
        }
        var tree = JSONValue();
        return tree;
    }

    parser.JSONValue = JSONValue;

    function JSONValue() {
        var value = JSONObject() || JSONArray() || JSONNumber() || JSONString() || JSONBooleanLiteral() || JSONNullLiteral();
        return value;
    }

    parser.JSONString = JSONString;

    function JSONString() {
        if (t === "StringLiteral") {
            var q1, q2;
            q1 = v[0];
            q2 = v[v.length - 1];
            if (q1 !== "\"" || q2 !== "\"") return withError("JSONString: Expecting double quoted strings.");
            var node = Node("JSONString");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    parser.JSONNumber = JSONNumber;

    function JSONNumber() {
        if (t === "NumericLiteral") {
            var node = Node("JSONNumber");
            node.value = v;
            next();
            return node;
        }
    }
    parser.JSONFraction = JSONFraction;

    function JSONFraction() {

    }
    parser.JSONNullLiteral = JSONNullLiteral;

    function JSONNullLiteral() {
        if (t === "NullLiteral") {
            var node = Node("JSONNullLiteral");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    parser.JSONBooleanLiteral = JSONBooleanLiteral;

    function JSONBooleanLiteral() {
        if (t === "BooleanLiteral") {
            var node = Node("JSONBooleanLiteral");
            node.value = v;
            next();
            return node;
        }
        return null;
    }

    parser.JSONArray = JSONArray;

    function JSONArray() {
        if (v === "[") {
            var node = Node("JSONArray");
            var elements = JSONElementList();
            if (isAbrupt(elements = ifAbrupt(elements))) return elements;
            node.elements = elements;
            pass("]");
            return node;
        }
        return null;

    }

    parser.JSONElementList = JSONElementList;

    function JSONElementList() {
        var list = [];
        next();
        while (v !== "]") {
            var node = JSONValue();
            if (isAbrupt(node = ifAbrupt(node))) return node;
            if (node) list.push(node);
            else return withError("JSONElementList: Error parsing Element");
            if (v === ",") pass(",");
            else if (v === "]") break;
            else return withError("JSONElementList: Invalid formatted literal. Comma or ] expected. Got " + v);
        }
        return list;
    }

    parser.JSONObject = JSONObject;

    function JSONObject() {
        if (v === "{") {
            var node = Node("JSONObject");
            var properties = JSONMemberList();
            if (isAbrupt(properties = ifAbrupt(properties))) return properties;
            node.properties = properties;
            pass("}");
            return node;
        }
        return null;
    }

    parser.JSONMember = JSONMember;

    function JSONMember() {
        var node = Node("JSONMember");
        var key = JSONString();
        if (!key) return withError("Syntax", "JSONMember: Expecting double quoted string keys in object literals.");
        if (isAbrupt(key = ifAbrupt(key))) return key;
        pass(":");
        var value = JSONValue();
        if (isAbrupt(value = ifAbrupt(value))) return value;
        node.key = key;
        node.value = value;
        return node;
    }
    parser.JSONMemberList = JSONMemberList;

    function JSONMemberList() {
        var list = [];
        next();
        while (v !== "}") {
            var node = JSONMember();
            if (isAbrupt(node = ifAbrupt(node))) return node;
            if (node) list.push(node);
            else return withError("JSONMemberList: Error parsing Member");
            if (v === ",") pass(",");
            else if (v === "}") break;
            else return withError("JSONMemberList: Invalid formatted literal. Comma or } expected. Got: " + v);
        }
        return list;
    }

    /***************************************************************************/

    /* setze inlinelex per default auf true */

    function CreateTheAST(tokens, options, inlineLexBool) {
        resetVariables(tokens, inlineLexBool);
        try {
            ast = parser.Program();
        } catch (ex) {
            console.log("[Parser Exception]")
            console.dir(ex);
            console.log(ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            ast = ex;
        }
        return ast;
    }

    function parseGoal(goal, source) {

        if (!withError) {
            var api = require("api")
            withError = api && api.withError;
            ifAbrupt = api && api.ifAbrupt;
            isAbrupt = api && api.isAbrupt;
        }

        saveTheDot();
        resetVariables();

        if (Array.isArray(source)) {
            tokens = source;
        } else {
            text = source;
            tokens = tokenize(text);
        }

        lookahead = lookaheadt = T = v = t = undefined;
        i = -1;
        j = tokens.length;
        next();

        //tokenize.inlineSetup(0, source);
        //next = tokenize.inlineLex;

        var fn = parser[goal];
        if (!fn) throw "Sorry, got no parser for " + goal;
        try {
            var node = fn.call(parser);
        } catch (ex) {
            console.log(ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            node = ex;
            throw ex;
        } finally {
            restoreTheDot();
            return node;
        }

    }

    var exports = CreateTheAST;
    exports.parse = CreateTheAST;
    exports.parseGoal = parseGoal;
    exports.setBuilder = setBuilder;
    exports.unsetBuilder = unsetBuilder;
    exports.registerObserver = registerObserver;
    exports.unregisterObserver = unregisterObserver;

    exports.enableExtras = enableExtras;
    exports.disableExtras = disableExtras;

    var observers = [];
    function registerObserver(f) {
        if (typeof f === "function")
            obervers.push(f);
        else throw new TypeError("registerObserver: argument f is not a function")
    }
    function unregisterObserver(f) {
        observers = observers.filter(function (g) { return f !== g; });
    }
    function notifyObservers(node) {
        observers.forEach(function (observer) { observer(node); });
        return node;
    }

    var saveBuilder = [];
    function unsetBuilder(objBuilder) {
        var state;
        if (builder === objBuilder) state = saveBuilder.pop();
        if (state) {
            builder = state.builder;
            compile = state.compile;
        }
    }

    function setBuilder(objBuilder, boolCompile) {
        saveBuilder.push({
            builder: builder,
            compile: compile
        });
        if (typeof objBuilder !== "object") {
            throw "objBuilder ist a Mozilla Parser-API compatible Builder Object for Code Generation from the AST, see http://developers.mozilla.org/en-US/docs/SpiderMonkey/Parser_API for more how to use..";
        }
        builder = objBuilder;
        if (boolCompile !== undefined) compile = !! boolCompile;
        return true;
    }
    
    
   /*
    * prototyping CST Extras with a decorator 
    * fails with endless loop when starting the shell
    */

    function enableExtras () {
        console.log("Enabling CST");
        Object.keys(parser).forEach(function (k) {      
            if (typeof parser[k] === "function" && !parser[k].wrapped) {       
                if (k == "next" || k == "scan" || k == "pass" || k.indexOf("JSON")===0) return; // for my hacky wacky system
                console.log("wrapping "+k)
                var originalFunction = parser[k];
                var parseFunction = function () {                
            	    var b = flushBuffer();
                    var node = originalFunction.call(this, arguments);
                    if (extraBuffer.length && typeof node === "object" && node) {
                        node.extras = b;                                                
                    }
                    return node;
                };
                parseFunction.wrapped = originalFunction;
                parser[k] = parseFunction;
            }
        });
    }
    function disableExtras () {
        Object.keys(parser).forEach(function (k) {            
            if (typeof parser[k] === "function" && parser[k].wrapped) 
            parser[k] = parser[k].wrapped;
        });    
    }    

    // enableExtras(); 
    // uncomment for endless loop

    return exports;
});

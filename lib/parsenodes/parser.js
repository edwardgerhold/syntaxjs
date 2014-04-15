

/*
 ############################################################################################################################################################################################################
 Parser
 very old
 legacy code?
 delete

 uses input arrays from tokenize(src)
 doesnt call tokenizer.next() (at the time, will somewhen happen, isnt that urgent)

 has a second function parseGoal(goal, srcOrArr)
 ch can be invoked from anywhere within

 it predicts at forstatement
 it saves/restores the parser state before/after parseGoal
 it collects and reparses at cover parenthesized expressions and arrow param list

 it has some ugly old conditions in the while () i notice
 it misses some syntax errors, early errors.

 and i some words i had for this comment


 -- using the builder nodefactory would be cool
    so i can use either nodes or bytes
    but for that a few parameters must update to es6
    (could use my own for purpose and replace or propose later)
    then will be there no return node, only return builder.variableStatement() etc

    // a map of the fn types must be made to map UpperCase and lowerCase firstChars.

    HINT: i have no list (array) of all parser_api fns to generate the thing from
    // or to handwrite the table with

 ############################################################################################################################################################################################################
 */

define("parser", function () {

    "use strict";
//    var i18n = require("i18n-messages");
    var tables = require("tables");
    var tokenize = require("tokenizer");

    var EarlyErrors = require("earlyerrors").EarlyErrors;
    var Contains = require("earlyerrors").Contains;

    var withError, ifAbrupt, isAbrupt;
    var IsIteration = tables.IsIteration;
    var IsTemplateToken = tables.IsTemplateToken;
    var FinishStatementList = tables.FinishStatementList;
    var FinishSwitchStatementList = tables.FinishSwitchStatementList;
    var StatementParsers = tables.StatementParsers;
    var PrimaryExpressionByValue = tables.PrimaryExpressionByValue;
    var PrimaryExpressionByType = tables.PrimaryExpressionByType;
    var SkipableToken = tables.SkipableToken;
    var InOrOfInsOf = tables.InOrOfInsOf;
    var InOrOf = tables.InOrOf;
    var propKeys = tables.propKeys;
    var BindingIdentifiers = tables.BindingIdentifiers;
    var ExprNoneOfs = tables.ExprNoneOfs;
    var StartBinding = tables.StartBinding;
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
    var isDirective = tables.isDirective;
    var isStrictDirective = tables.isStrictDirective;
    var isAsmDirective = tables.isAsmDirective;
    var ForbiddenArgumentsInStrict = tables.ForbiddenArgumentsInStrict;
    var ReservedWordsInStrictMode = tables.ReservedWordsInStrictMode;
    var ExprEndOfs = tables.ExprEndOfs;

function makeParser() {

    var ast;
    var ltNext; // will be set if a lineterminator is before the next token, unset else
    var gotSemi;
    var lookahead, lookaheadt; // lookahead
    var tokens;
    var token = Object.create(null); // current token
    var t; // current token type
    var v; // current token value
    var i; // tokens[i] pointer     (array version)
    var j; // tokens.length;        (array version)


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





    /*
     parser needs strict mode for early errors
     */

    var strictStack = [];
    var isStrict = false;
    function pushStrict(v) {
        strictStack.push(isStrict);
        isStrict = v;
    }
    function popStrict() {
        isStrict = strictStack.pop();
    }


    /*
     with these arrays/lists i will grab the
     TopLevelVarScopedDeclarations and LexicalDeclarations
     and Names for the InstantiateXxxDeclaration functions
     already at the first parsing stage for maximum efficiency.
     */

    /*

     wow, is this really cheaper, than a traversal?
     creating the 8 arrays each invocation is a horror for me.

     still not satisfied:
     issue: parseGoal("FunctionBody", source);

     does not return any lists containing the infos.

     hint: esprimas body=blockstatement would make it easier.
     */

    var varNames = [], lexNames = [];
    var varDecls = [], lexDecls = [];
    var varNamesStack = [], lexNamesStack = [],
        varDeclsStack = [], lexDeclsStack = [];
    function pushVarNames () {varNamesStack.push(varNames);varNames=[];}
    function popVarNames() {varNames = varNamesStack.pop();}
    function pushLexNames () {lexNamesStack.push(lexNames);lexNames=[];}
    function popLexNames() {lexNames = lexNamesStack.pop();}
    function pushVarDecls () {varDeclsStack.push(varDecls);varDecls=[];}
    function popVarDecls() {varDecls = varDeclsStack.pop();}
    function pushLexDecls () {lexDeclsStack.push(lexDecls);lexDecls=[];}
    function popLexDecls() {lexDecls = lexDeclsStack.pop();}
    function pushDecls() {
        pushVarDecls();
        pushVarNames();
        pushLexNames();
        pushLexDecls();
    }
    function pushLexOnly() {
        pushLexNames();
        pushLexDecls();
    }
    function popLexOnly(node) {
        node.lexNames = lexNames;
        node.lexDecls = lexDecls;
        popLexNames();
        popLexDecls();
    }
    function popDecls(node) {
        node.varNames = varNames;
        node.lexNames = lexNames;
        node.varDecls = varDecls;
        node.lexDecls = lexDecls;
        popVarDecls();
        popVarNames();
        popLexDecls();
        popLexNames();
    }


    /*
     These functions shall support getifys et al. CST idea.
     */

    var captureExtraTypes = {
        __proto__:null,
        "WhiteSpace":true,
        "LineTerminator": true,
        "MultiLineComment":true,
        "LineComment":true
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
        ":": true,
        ",": true
    };

    var withExtras = true;
    var extraBuffer = [];
    function newExtrasNode(data) {
        var node = Node("Extras");
        if (data) node.extras = data;
        else node.extras = [];
        return node;
    }
    function exchangeBuffer() {
        var b = extraBuffer;
        extraBuffer = [];
        return b;
    }

    function dumpExtras(node, prop, dir) {   // dumpExtras(id, "id", "before");
        var extras;
        if (!node || !extraBuffer.length) return;
        if (!node.extras) node.extras = {};
        if (!node.extras[prop]) node.extras[prop] = {};
        node.extras[prop][dir] = extraBuffer;
        extraBuffer = [];
    }
    function dumpExtras2(node, prop) {   // dumpExtras(id, "id", "before");
        var extras;
        if (!node || !extraBuffer.length) return;
        if (!node.extras) node.extras = {};
        node.extras[prop] = extraBuffer;
        extraBuffer = [];
    }

    /*

     */

    var currentNode;   // can be class, function, module
    var nodeStack = [];
    var currentModule; // just be module
    var moduleStack = [];
    // have to finsish this crap urgently.

    /*
     state

     Contains[ExpressionStatement] ruins my simple Contains blacklist
     directly implemented in the StatementList Algorithms...
     */

    // this could help, but i should need a piece of paper plus spec
    // to write down what i don´t mind now (my memory is sometimes weak)
    /*
     var inState;
     var inState_Program = 1;
     var inState_Function = 2;
     var inState_Method = 3;
     var inState_Class = 4;
     var inState_Module = 5;
     var inStateStack = [];
     */
    /*
     inState = inState_Function;

     in SuperExpression

     var noSuper = { 1 : true, 5 : true };

     if (noSuper[inState] && node.type === "


     */


    var loc = makeLoc();
    var text;

    function startLoc() {
        return loc && loc.start;
    }

    function endLoc(node, l1) {
        var l2 = loc && loc.end;
        node.loc = makeLoc(l1, l2);
    }

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

    function augmentErrorStack(error) {
        var stack = error.stack;
        var line = loc && loc.start.line;
        var column = loc && loc.start.column;
        var location = "A syntax.js parser error occured at line " + line + ", column " + column + "\r\n";
        error.stack = location;
        if (stack) error.stack += stack;
        return error;
    }

    function charExpectedString(C) {
        var line = loc && loc.start.line;
        var column = loc && loc.start.column;
        return C + " expected at line " + line + ", column " + column;
    }

    function Assert(test, message) {
        if (!test) throw new Error(message);
    }

    var debugmode = false;
    var hasConsole = typeof console === "object" && console != null && typeof console.log === "function";

    function debug() {
        if (debugmode && hasConsole) {
            if (typeof arguments[0] == "object") {
                console.dir(arguments[0]);
            } else console.log.apply(console, arguments);
        }
    }

    function debugdir() {
        if (debugmode && hasConsole) console.dir.apply(console, arguments);
    }

    var nodeId = 1;

    function Node(type /*, linkToken*/ ) {
        var node = Object.create(null);
        //nodeTable[
        node._id_ = ++nodeId;
        //] = node;
        // staticSemantics.put(type);
        node.type = type;
        return node;
    }

    function stringifyTokens(array) {
        var string = "";
        for (var i = 0, j = array.length; i < j; i++) {
            string += array[i].value;
        }
        return string;
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
            right = node.right,     // the next node bouncing of
            rightOp = right && right.operator,  // the node right has it a higher or lower operator?
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

    function makeLoc(start, end, filename, source) {
        return {
            start: start || {},
            end: end || {},
            source: source,
    	    filename: filename
        };
    }
    
    function stringifyLoc(loc) { 
	var str = "";
	if (!loc) return str;
	if (typeof loc == "object") {
	    if (loc.start) {
		var start = loc.start;
		var end = loc.end;
		if (start) {
		    str +=  "@loc.start: line " +start.line + ", column "+start.column;
		}
		if (end) {
		    if (start) str += ", ";
		    else str += "@";
		    str +=  "loc.end: line " +end.line + ", column "+end.column;	    
		}
	    } else if (loc.line != undefined) {
		str = "@loc: line " +loc.line + ", column "+loc.column;	    
	    }
	    return str;
	}
    }


    function resetVariables(t) {
        ast = null;

    
        //nodeTable = Object.create(null);

	//nodeTable makes an ast navigatable.
	

        lexDecls = [];
        varDecls = [];
        lexNames = [];
        varNames = [];
        lexDeclsStack = [];
        varDeclsStack = [];
        lexNamesStack = [];
        varNamesStack = [];


        if (typeof t === "string") t = tokenize(t);
        tokens = t || [];

        i = -1;
        j = tokens.length;
        token = v = t = undefined;
        lookahead = lookaheadt = undefined;

    }

    // ========================================================================================================
    // skip, next, pass, scan, eos
    // ========================================================================================================

    parser.skip = skip;
    parser.next = next;

    function consume(i) {
        debug("consuming "+i+" tokens");
        while (i > 0) { next(); i--; }
    }

    function pass(C) { // match
        debug("pass this token: " + C);
        if (v === C) next();
        else throw new SyntaxError(charExpectedString(C));
    }

    function skip(C) {
        if (v === C) {
            debug("skipped: " + C);
            next();
            return true;
        } else {
            debug("can't skip: " + C + " ("+v+")");
            return false;
        }
    }

    function semicolon() {
        if (v == ";") {
            gotSemi = true;
            skip(";")
        } else {
            gotSemi = false;
        }
    }


    function eos() {
        return i >= j;
    }

    function hasNext() {
        return lookahead != undefined;
    }

    function nextToken () {
        return tokenizer.next();
    }

    function next() {
        if (i < j) {

            i += 1;

            token = tokens[i];  // this function really works on an array

            // later it is "token = lookahead; lookahead = next(); not more, not less"

            if (token) {
                t = token.type;
                // if (withExtras && captureExtraTypes[t]) extraBuffer.push(token);
                if (SkipableToken[t]) return next();
                v = token.value;
//              if (withExtras && captureExtraValues[v]) extraBuffer.push(token);
                loc = token.loc;
            } else {
                t = v = undefined;
            }

            lookahead = righthand(tokens, i);	// i see, i have to update that. it just picks them off the array. 
            return token;				// origin: formerly the tokenizer tokenized html for my syntax highlighter
        }
        return token = v = t = undefined;
    }

    /*
     lookahead function
     will be replaced someday, when i throw away the tokenizer stage,
     which i really only implemented for my syntax highlighter which
     became legacy code as i started working on the es6 runtime.
     ( i read all the parser books and watched videos after writing that code )
     */

    var isComment = { __proto__: true, "LineComment": true, "MultiLineComment": true};
    function righthand(tokens, i) {
        var lookahead; // = " ";
        var b = 0;
        var t;
        ltNext = false;
        for(;;) {
            b++;
            t = tokens[i + b];
            if (t === undefined) return undefined;
            lookahead = t.value;
            lookaheadt = t.type;
            if (lookaheadt === "LineTerminator") {
                ltNext = true;
            }
            if (SkipableToken[lookaheadt]) continue;
            break;
        }
        return lookahead;
    }


    // ========================================================================================================
    // Literals, Identifier
    // ========================================================================================================

    parser.Literal = Literal;

    function Literal() {
        var node;
        if (IsAnyLiteral[t]) {
            node = Node(t);
            node.details = token.details;
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
            node.loc = token.loc;
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
            var isExpr = true;
            var node = this.ClassDeclaration(isExpr);
            return node;
        }
        return null;
    }

    function TemplateLiteral() {
        if (t === "TemplateLiteral") {
            var l1, l2;
            l1 = loc && loc.start;
            var node = Node("TemplateLiteral");
            node.spans = v;
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

            }

            /*else if (v !== "]") {
             throw new SyntaxError("buggy element list");
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
            node.loc = token && token.loc;
        }
        if (node) return node;

        throw new SyntaxError("invalid property key in definition");

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
                if (!method) throw new SyntaxError("Error parsing MethodDefinition in ObjectExpression");
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
                        if (!id) throw new SyntaxError("error parsing objectliteral shorthand");
                        node.key = id;
                        node.value = id;
                        list.push(node);

                    } else if (computedPropertyName && v === ":") { // [s]:

                        node.kind = "init";
                        node.key = computedPropertyName;
                        node.computed = true;
                        pass(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throw new SyntaxError("error parsing objectliteral := [symbol_expr]: assignmentexpression");
                        list.push(node);

                    } else if (lookahead === ":") { // key: AssignmentExpression

                        node.kind = "init";
                        node.key = this.PropertyKey();
                        pass(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throw new SyntaxError("error parsing objectliteral := propertykey : assignmentexpression");
                        list.push(node);

                    } else if (computedPropertyName && v == "(") {

                        node.kind = "method";
                        method = this.MethodDefinition(parent, true, computedPropertyName);
                        if (!method) throw new SyntaxError("Error parsing method definition in ObjectExpression.");
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);

                    } else if (((v == "[" || BindingIdentifiers[t] || v === "constructor") && lookahead === "(") || (v === "*" && (lookahead == "[" || BindingIdentifiers[lookaheadt] || lookahead === "constructor"))) {

                        node.kind = "method";
                        method = this.MethodDefinition(parent, true);
                        if (!method) throw new SyntaxError("Error parsing method definition in ObjectExpression.");
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
        debug("MemberExpression (" + t + ", " + v + ")");

        obj = obj || this.PrimaryExpression();

        if (obj) {
            l1 = obj.loc && obj.loc.start;

            var node = Node("MemberExpression");
            node.object = obj;

            if (t === "TemplateLiteral") return this.CallExpression(obj);
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
                    property.loc = token.loc;
                    node.property = property;

                } else if (v === "!") {

                    // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency
                    // MemberExpression ! [Expression]
                    // MemberExpression ! Arguments
                    // MemberExpression ! Identifier
                    // setzt .eventual auf true

                } else {
                    throw new SyntaxError("MemberExpression . Identifier expects a valid IdentifierString or an IntegerString as PropertyKey.");
                }
                pass(v);
            } else return node.object;

            // recur toString().toString().toString().valueOf().toString()

            if (v == "[" || v == ".") return this.MemberExpression(node);
            else if (v == "(") return this.CallExpression(node);
            else if (IsTemplateToken[t]) return this.CallExpression(node);

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
            debug("Arguments (" + t + ", " + v + ")");

            pass("(");
            args = [];

            if (v !== ")")
                do {

                    if (v === ")") break;

                    if (arg = this.SpreadExpression() || this.AssignmentExpression()) {
                        args.push(arg);
                    } 
                    
                    if (v === ",") {
                        pass(",");
                    } else if (v != ")" && v != undefined) {
                        throw new SyntaxError("Error parsing the argument list of a call expression");
                    }

                } while (v !== undefined);

            pass(")");
            return args;
        }
        return null;
    }
    parser.Arguments = Arguments;

    function CallExpression(callee) {

        var node, tmp, l1, l2;
        l1 = l2 = (loc && loc.start);

        if (callee == undefined)
            callee = this.MemberExpression();

        if (callee) {
            l1 = callee.loc && callee.loc.start;

            node = Node("CallExpression");
            node.callee = callee;
            node.arguments = null;

            if (t === "TemplateLiteral") {
                var template = this.TemplateLiteral();
                node.arguments = [ template ];
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
        var list = [];
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

    // PLEASE RE-WRI-TE: PAREN EXPR, EXPR, EXPRSTMT, SEQEXPR and factor out unclearness from last year

    function Expression(stop, parenthesized) {

        var list = [];
        var node;
        var ae;
        var l1 = loc && loc.start;
        var l2;

        var hasStop = typeof stop === "string";

        if (!parenthesized && (ExprNoneOfs[v] || (v === "let" && lookahead === "["))) return null;

        do {

            if (hasStop && v === stop) break;
            if (ae = this.AssignmentExpression()) list.push(ae);            
            if (hasStop && v === stop) break;

            if (v === ",") {
                pass(",");
            } else if (ltNext) {
                break;
            } else if (ExprEndOfs[v]) {                
                break;
            } else if (v != undefined) {
                throw new SyntaxError("invalid expression statement");
            }

        } while (v !== undefined);

        l2 = loc && loc.end;

        switch (list.length) {
            case 0:
                return null;

            case 1:
                node = list[0];
                if (parenthesized) return this.ParenthesizedExpressionNode(node, l1, l2);
                return this.ExpressionStatement(node, l1, l2);

            default:
                node = this.SequenceExpression(list, l1, l2);
                if (parenthesized) return this.ParenthesizedExpressionNode(node, l1, l2);
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
            
	} else if (v === "..." && lookaheadt === "Identifier") {
    	
            expr = this.RestParameter();
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
                        covered.push(token);
                        break;
                    }
                }
                covered.push(token);
                if (v === undefined) throw new SyntaxError("no tokens left over covering expression");
            }
            pass(")");
        }

        if (cover) {

            if (v === "=>") {

                pass("=>");

                node = Node("ArrowExpression");
                node.kind = "arrow";
                node.strict = true;

                pushStrict(true);

                node.expression = true;


                node.params = (expr ? [expr] : this.ArrowParameterList(covered));

                node.body = this.ConciseBody(node);
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);

                popStrict();

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
        debug("PrimaryExpression (" + t + ", " + v + ")");
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
                node.loc = token && token.loc;
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
                node.loc = token && token.loc;
                pass("yield");
                return node;
            }
        }
        return null;
    }

    function YieldExpression() {
        debug("YieldExpression");
        if (v === "yield" && !yieldIsId) {
            pass("yield");
            var node = Node("YieldExpression");
            node.argument = this.Expression();
            return node;
        }
        return null;
    }

    function PostfixExpression(lhs) {
        debug("PostfixExpression (" + t + ", " + v + ")");
        var l1 = loc && loc.start;
        
        if (v == "(") lhs = this.ParenthesizedExpression();
        else lhs = lhs || this.LeftHandSideExpression();
        
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


    function stringifyLoc(loc) { 
	var str = "";
	if (!loc) return str;
	if (typeof loc == "object") {
	    if (loc.start) {
		var start = loc.start;
		var end = loc.end;
		if (start) {
		    str +=  "from line " +start.line + ", column "+start.column;
		}
		if (end) {
		    str +=  "- line " +end.line + ", column "+end.column;	    
		}
	    } else if (loc.line != undefined) {
		  str = "from line " +loc.line + ", column "+loc.column;	              
	    }
	    return str;
	}
    }
    
    

    function UnaryExpression() {

        if (UnaryOperators[v] || UpdateOperators[v]) {
            debug("UnaryExpression ("+t+","+v+")");

            var l1 = loc && loc.start;
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = true;
            pass(v);
            node.argument = this.PostfixExpression();
            var l2 = loc && loc.end;
            if (node.argument == null) {
                throw new SyntaxError("invalid unary expression "+node.operator+", operand missing " + stringifyLoc(loc));
            }

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

            debug("ConditionalExpression ("+t+","+v+")");
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
    function AssignmentExpression() {
        debug("AssignmentExpression (" + t + ", " + v + ")");

        var node = null,
            leftHand, l1, l2;

        l1 = loc && loc.start;

        if (!yieldIsId && v === "yield") node = this.YieldExpression();
        if (!node) node = this.CoverParenthesisedExpressionAndArrowParameterList();
        leftHand = node || this.UnaryExpression(); // recurs up
        
        
        if (!leftHand) return null;
        if (v === undefined) return leftHand;

        if ((isNoIn && InOrOf[v])) return leftHand; // i am at "in" or "of" in the expr

        if (v === "," || ExprEndOfs[v] || ltNext) return leftHand;

        if (t !== "Punctuator" && !InOrOfInsOf[v]) {
            // throw new SyntaxError("can not parse expression");
            return leftHand;
        }


        if (v === "?") {
            node = this.ConditionalExpressionNoIn(leftHand);
            return node;
        }


        debug("before recursion fix ("+t+","+v+")");

        if (v === "." || v === "[") leftHand = this.MemberExpression(leftHand) || leftHand;
        else if (v === "(" || v === "`") leftHand = this.CallExpression(leftHand) || leftHand;
        else if (v == "++" || v == "--") leftHand = this.PostfixExpression(leftHand) || leftHand;

        debug("after recursion fix ("+t+","+v+")");

        if (AssignmentOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {

            node = Node("AssignmentExpression");
            debug("AssignmentExpression found (" + t + ", " + v + ")");
            node.longName = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;

            debug(v);
            pass(v);

            node.right = this.AssignmentExpressionNoIn(node);
            if (!node.right) throw new SyntaxError("can not parse a valid righthandside for this assignment expression");

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return rotate_binexps(node);

        } else if (BinaryOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {
            debug("BinaryExpression  (" + t + ", " + v + ")");

            node = Node("BinaryExpression");
            node.longName = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;
            debug(v);
            pass(v);
            node.right = this.AssignmentExpression();
            if (!node.right) {
                throw new SyntaxError("can not parse a valid righthandside for this binary expression");
            }

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            node = rotate_binexps(node);
            return node;


        } else {

            return leftHand;

        }
    }

    parser.SuperExpression = SuperExpression;


    var ContainNoSuperIn = {
        "Program" : true,
        "ModuleDeclaration": true,
        "Module" : true
    };

    function SuperExpression() {

        if (v === "super") {

            var l1 = loc && loc.start;
            var node = Node("SuperExpression");
            node.loc = makeLoc(l1, l1);

            // if (withExtras && extraBuffer.length) dumpExtras2(node, "before");

            pass("super");

            // if (withExtras && extraBuffer.length) dumpExtras2(node, "after");

            if (currentNode) {
                if (ContainNoSuperIn[currentNode.type]) {
                    throw new SyntaxError("contains: super is not allowed in "+currentNode.type);
                }
                currentNode.needsSuper = true; // needsSuper is ES6 Term, maybe should just be .super for Parser_API
                // currentNode.super = true;
            }

            if (currentNode === ast) {
                throw new SyntaxError("contains: super Expression is not allowed in program")
            }



            // "super" wird nicht im classDefaultConstructor erkannt sein.!
            // da parseGoal nicht auf currentNode zugreifen kann.
            // solution:
            // STATE VARIABLE!!!! statt property

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

            // if (withExtras && extraBuffer.length) dumpExtras2(node, "before");

            pass("this");

            // if (withExtras && extraBuffer.length) dumpExtras2(node, "after");

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
            debug("Returning from initialiser");
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

    	    while (v != "}") {

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

                    if (isStrict && ForbiddenArgumentsInStrict[bindEl.as.name]) {
                        throw new SyntaxError(bindEl.as.name + " is not a valid binding identifier in strict mode");
                    }

                    // staticSemantics.addLexBinding(bindEl.as.name);

                    list.push(bindEl);

                    if (v === "=") {
                        bindEl.init = this.Initialiser();
                    }

                } else {

                    if (isStrict && ForbiddenArgumentsInStrict[id.name]) {
                        throw new SyntaxError(v + " is not a valid bindingidentifier in strict mode");
                    }
                    // staticSemantics.addLexBinding(id.name);
                    list.push(id);

                    if (v === "=") {
                        id.init = this.Initialiser();
                    }
                }


                if (v === ",") {
                    pass(",");
                    if (v === "}") break;
		    continue;
                } else if (v != "}") {
            	    throw new SyntaxError("invalid binding property list. csv and terminating }");
                }

            } 

            pass("}");

        } else if (v === "[") {

            pass("[");
            while (v !== "]") {

                if (v === "...") id = this.RestParameter();
                else if (StartBinding[v]) id = this.BindingPattern();
                else id = this.Identifier();

                if (id) list.push(id);

                if (v === "=") {
                    id.init = this.Initialiser();
                }

                if (v === ",") {
                    pass(",");
                    if (v === "]") break;
		    continue;
                } else if (v !== "]") {
            	    throw new SyntaxError("invalid binding element list. csv and terminating ]");
                }
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
        debug("VariableDeclaration (" + t + ", " + v + ")");
        var node = this.BindingPattern();

        if (node) {
            node.kind = kind;
            return node;
        }

        if (t === "Identifier" || (v === "yield" && yieldIsId) || (v === "default" && defaultIsId)) {

            debug("VariableDeclarator (" + t + ", " + v + ")");
            node = Node("VariableDeclarator");

            node.kind = kind;

            var id = this.Identifier();

            node.id = id;

            if (isStrict && (ReservedWordsInStrictMode[id.name] || ForbiddenArgumentsInStrict[id.name])) {
                throw new SyntaxError(id.name + " is not a valid identifier in strict mode");
            }

            /*
             if (kind == "var") {
             varNames.push(id.name);
             varDecls.push(node);
             } else {
             lexNames.push(id.name);
             lexDecls.push(node);
             }
             */

            if (v === "=") node.init = this.Initialiser();
            else node.init = null;
            return node;
        }

        return null;
    }
    parser.VariableDeclarationList = VariableDeclarationList;

    function VariableDeclarationList(kind) {
        var list = [];
        var decl;
        for (;;) {

            decl = this.VariableDeclaration(kind);
            if (decl) list.push(decl);
            if (isNoIn && InOrOf[v]) break;

            if (v === ",") {
                pass(",");
                continue;             
            } else if (ltNext) {
                break;
            } else if (v === ";") {
                pass(";");
                break;
            } else if (v === undefined) {
                break;
            } 


            throw new SyntaxError("illegal token after "+kind+": " + v);

            //break;        
        }
        
        if (!list.length) throw new SyntaxError("expecting identifier names after "+kind);
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
            debug("VariableStatement (" + t + ", " + v + ")");
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
        // THESE I WILL LOOSE WHEN REFACTORING
        var l1, l2;
        var node;
        var isStaticMethod = false;
        var isGenerator = false;
        var init = false;
        var isGetter = false;
        var isSetter = false;
        var isComputedPropertyKey = false;
        var specialMethod = false;

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
            specialMethod = isGetter = true;

            pass(v);
            // get c() {}
        } else if (v === "set") {
            specialMethod = isSetter = true;
            pass(v);
            // set c() {}
        }

        debug("MethodDefinition (" + t + ", " + v + ")");

        node = Node("MethodDefinition");

        nodeStack.push(currentNode);
        currentNode = node;

        if (v =="[") node.computed = true;
        node.id = this.PropertyKey();

        if (isStrict && ForbiddenArgumentsInStrict[node.id.name]) {
            throw new SyntaxError(node.id.name + " is not a valid method identifier in strict mode")
        }

        node.generator = isGenerator;
        if (!isObjectMethod) node.static = isStaticMethod;


        if (isGetter) {
            node.kind = "get";
        }


        if (isSetter) {
            node.kind = "set";
        }

        pass("(");
        node.params = this.FormalParameterList();
        pass(")");

        pass("{");
        node.body = this.FunctionBody(node);
        pass("}");

        node.specialMethod = specialMethod;
        l2 = loc && loc.end;
        node.loc = makeLoc(l1, l2);

        EarlyErrors(node);
        if (compile) return builder.methodDefinition(node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc);

        currentNode = nodeStack.pop();

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

    }

    parser.ClassDeclaration = ClassDeclaration;

    function ClassDeclaration(isExpr) {
        var node, m;
        if (v === "class") {
            debug("ClassDeclaration (" + t + ", " + v + ")");


            // staticSemantics.newVarEnv();

            pushDecls();

            node = Node("ClassDeclaration");
            node.id = null;

            node.strict = true;
            pushStrict(true);

            node.expression = !! isExpr;
            node.extends = null;
            node.elements = [];

            pass("class");
            var id = this.Identifier();
            node.id = id.name;

            // // staticSemantics.addLexBinding(id);

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

            // staticSemantics.popEnvs();

            popStrict();

            popDecls(node);

            if (compile) return builder["classExpression"](node.id, node.extends, node.elements, node.loc);
            return node;
        }
        return null;
    }

    parser.RestParameter = RestParameter;

    function RestParameter() {
        if (v === "...") {
            debug("RestParameter (" + t + ", " + v + ")");

            var l1 = loc && loc.start;
            pass("...");
            var node = Node("RestParameter");            
            node.id = v;
            if (t !== "Identifier") {
                throw new SyntaxError("invalid rest parameter, identifier expected");
            }
            if (isStrict && ForbiddenArgumentsInStrict[v]) {
                throw new SyntaxError(v + " is not a valid rest identifier in strict mode");
            }
            // staticSemantics.addLexBinding(v);
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
            debug("SpreadExpression (" + t + ", " + v + ")");

            var l1 = loc && loc.start;
            pass("...");
            var node = Node("SpreadExpression");
            node.argument = this.AssignmentExpression();
            var l2 = node.argument && node.argument.loc && node.argument.loc.end;
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
            debug("DefaultParameter (" + t + ", " + v + ")");

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

        debug("FormalParameterList (" + t + ", " + v + ")");

        list.type = "FormalParameterList";

        var defaults;
        var id;
        var x;

        
        do {

            if (v) {
                //x = i;
                debug("FormalParameters ("+t+", "+v+")");   
                

                if (v === ")") {
                    break;
                }
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
                    }
                    if (isStrict && ForbiddenArgumentsInStrict[id.name]) {
                        throw new SyntaxError(id.name + " is not allowed in strict mode");
                    }
                    list.push(id);
                }

                if (v === ",") {
                    pass(",");
                } else if (v !== undefined && v !== ")") {
                    throw new SyntaxError("error parsing formal parameter list");
                }
            
            }
        } while (v !== undefined && v !== ")");

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

        var contains = Contains["FunctionDeclaration"]; // rename to FunctionBody?
        var node;
        var body = [];

        body.type = "FunctionStatementList";

        if (v === "}") return body;

        pushStrict(this.DirectivePrologue(parent, body) || isStrict); // right or wrong? contained in strict code. tests will show

        while (v !== undefined && v !== "}") {
            if (node = this.FunctionDeclaration() || this.ModuleDeclaration() || this.ClassDeclaration() || this.Statement()) {
                if (!contains[node.type]) body.push(node);
                else throw new SyntaxError("contains: "+node.type+" is not allowed in a functionBody");
            }
        }

        popStrict();

        return body;
    }

    function CreateTablePlusAddParentPointerIds (node, parent, nodeTable) {
        /*
         on yield: set suspend flag
         that exit´s any nested evaluation loop and returns without mourning
         just with the result value (that´s what´s yielded)

         on resume:
         just take the recorded instruction
         go to parent, if parent is a list, advance.
         if parent is not a list, do the assignment
         and then continue one right

         */
         
        nodeTable = nodeTable || Object.create(null);
        
        if (Array.isArray(node)) {
            for (var i = 0, j = node.length; i < j; i++) {
                CreateTablePlusAddParentPointerIds(node[i], node, nodeTable);
            }
            return nodeTable;
        }
        if (typeof node === "object" && node != null && node.loc) {

            if (node.parent = parent["_id_"]) {
        	nodeTable["_id_"] = parent;
            }
            Object.keys(node).forEach(function (key) {
                if (typeof node[key] != "object" || !node || key === "parent" || key === "loc" || key == "extras") return;
                CreateTablePlusAddParentPointerIds(node[key], node, nodeTable);
            });
        }
        return nodeTable;
    }

    parser.FunctionDeclaration = FunctionDeclaration;

    function FunctionDeclaration(isExpr) {
        var node, start, end, sourceStart, sourceEnd;

        if (v === "function") {

            debug("FunctionDeclaration (" + t + ", " + v + ")");


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

            nodeStack.push(currentNode);
            currentNode = node;


            node.id = null;
            node.params = [];
            node.expression = !!isExpr;

            node.strict = isStrict; // RIGHT or Wrong? contained in strict code?


            node.body = [];

            var id;

            if (v !== "(") {
                id = this.Identifier();
                node.id = id.name;
                /*
                 if (!node.expression) {
                 varNames.push(id.name);
                 varDecls.push(node);
                 }
                 */
            } else {
                if (!node.expression) {
                    throw new SyntaxError("Function and Generator Declarations must have a name [only expressions can be anonymous]");
                }
            }


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


            pushDecls();

            pass("{");
            node.body = this.FunctionBody(node);
            pass("}");

            popDecls(node);


            yieldIsId = yieldStack.pop();
            end = loc && loc.end;
            node.loc = makeLoc(start, end);

            if (node.generator) {            
                node.nodesById = CreateTablePlusAddParentPointerIds(node);
            }

            EarlyErrors(node);
            defaultIsId = defaultStack.pop();
            currentNode = nodeStack.pop();
            if (compile) return builder.functionDeclaration(node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc, node.extras);
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

            // staticSemantics.newLexEnv();
            // staticSemantics.newContainer();

            var node = Node("BlockStatement");

            debug("BlockStatement (" + t + ", " + v + ")");

            defaultStack.push(defaultIsId);
            defaultIsId = true;

            pushLexOnly();

            pass("{");
            node.body = this.StatementList();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            defaultIsId = defaultStack.pop();
            pass("}");

            popLexOnly(node);

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

            // if (withExtras && extraBuffer.length) dumpExtras2(node, "before");
            pass("return");
            // if (withExtras && extraBuffer.length) dumpExtras2(node, "after");

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

            if (isStrict) {
                throw new SyntaxError("with not allowed in strict mode");
            }

            var node = Node("WithStatement");
            var l1 = loc && loc.start;

            // if (withExtras) dumpExtras(node, "with", "before");
            pass("with");
            // if (withExtras) dumpExtras(node, "with", "after");

            pass("(");

            node.object = this.Expression();
            pass(")");
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
            var stmt = this.Statement();

            if (!IsIteration[stmt.type]) {
                throw new SyntaxError("A LabelledStatement must be an Iteration Statement");
            }

            node.statement = stmt;
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
            if (compile) return builder.tryStatement(node.handler, node.guard, node.finalizer, node.loc);
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

            // staticSemantics.newContainer();
            // staticSemantics.newVarEnv();


            pushDecls();

            node = Node("ModuleDeclaration");
            node.strict = true;

            nodeStack.push(currentNode);
            moduleStack.push(currentModule);
            currentNode = currentModule = node;

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

            popDecls(node);

            EarlyErrors(node);

            currentNode = nodeStack.pop();
            currentModule =  moduleStack.pop();

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
        throw new SyntaxError("can not make out ModuleSpecifier");
    }
    parser.ModuleBody = ModuleBody;

    function ModuleBody() {
        var list = [];
        pass("{");
        var item;
        while (v !== undefined && v !== "}") {
            if (item = this.ExportStatement() || this.ModuleDeclaration() || this.ImportStatement() || this.Statement()) {

                if (!Contains.ModuleDeclaration[item.type]) list.push(item);
                else throw new SyntaxError("contains: "+item.type+" not allowed in ModuleDeclarations");

            }
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

                } else {
                    throw new SyntaxError("BindingElement did not terminate with a , or }");
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
                    } else if (v !== "from") {
                        throw new SyntaxError("invalid import statement");
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

                currentNode.moduleRequests.push(node);

                list.push(node);
                if (v === ",") {
                    pass(",");

                } else {
                    throw new SyntaxError("BindingElement did not terminate with a , or }");
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
                    currentModule.exportEntries.push({ ModuleRequest: null, ImportName: null, LocalName: name, ExportName: name });
                }
                skip(";");
                if (!node.exports) throw new SyntaxError("should be an error in the export statement");
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
        
        do {
            if (v == undefined) break;
            if (s = this.Statement()) list.push(s);
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


            /*
             es6> let id = 0;
             undefined
             es6> id id
             0

             should throw first statement.


             shall better recognize ; and lt here.

             skip(";") has to register, if one was found.

             if (!ltNext) it should throw

             */



        } while (!FinishStatementList[v]);

        return list;
    }

    parser.Statement = Statement;

    function Statement(a, b, c, d) {
        var node;

        /*
         if (debugmode) {
         var start = loc && loc.start;
         var line = start && start.line;
         var col = start && start.col;
         debug("statement at " + v + " at line "+line+", col "+col);
         }
         */


        var fn = this[StatementParsers[v]];
        if (fn) node = fn.call(this, a, b, c, d);
        if (!node) {
            node = this.LabelledStatement(a, b, c, d) || this.Expression(a,b,c,d);
        }
        if (node) {
            skip(";");
            return node;
        }
        return null;
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
            token: token,
            t: t,
            v: v,
            lookahead: lookahead,
            isNoIn: isNoIn,
            yieldIsId: yieldIsId,
            defaultIsId: defaultIsId,
            yieldStack: yieldStack,
            defaultStack: defaultStack,
            //           nodeTable: nodeTable
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
            token = o.token;
            t = o.t;
            v = o.v;
            lookahead = o.lookahead;
            lookaheadt = o.lookaheadt;
            isNoIn = o.isNoIn;
            yieldIsId = o.yieldIsId;
            defaultIsId = o.defaultIsId;
            yieldStack = o.yieldStack;
            defaultStack = o.defaultStack;
            //         nodeTable = o.nodeTable;
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

            /* predict
            *
            * this works with the tokens array
            * for the inline lexer i have to prefetch
            * the WHOLE forStatement to use PARSEGOAL on.
            *
            * and - a parser should have an own parseGoal fn
            * with separate state variables (just a parseGoal = parser_factory() parser)
            * (later when making factories and replacing the one-and-only multiple realm shared state sys
            * by a fresh instance of each for each realm)
            */

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

            // staticSemantics.newLexEnv();
            // staticSemantics.newContainer();

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
                        pass(";")
                    }

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

                if (!node.left) throw new SyntaxError("can not parse a valid lefthandside expression for for statement");

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

                if (!node.right) throw new SyntaxError("can not parse a valid righthandside expression for for statement");

                pass(")");

            } else {
                throw new SyntaxError("invalid syntax in for statement");
            }

            node.body = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            // staticSemantics.popContainer();
            // staticSemantics.popEnvs();

            if (compile) {
                if (node.type === "ForStatement") return builder["forStatement"](node.init, node.condition, node.update, node.body, loc);
                if (node.type === "ForInStatement") return builder["forInStatement"](node.left, node.right, node.body, loc);
                if (node.type === "ForOfStatement") return builder["forOfStatement"](node.left, node.right, node.body, loc);
            }

            return node;
        }
        return null;
    }

    function WhileStatement() {
        /* IterationStatement : while ( this.Expression ) Statement */
        if (v === "while") {
            // staticSemantics.newContainer();
            var l1, l2;
            l1 = loc && loc.start;
            var node = Node("WhileStatement");
            pass("while");
            pass("(");
            node.test = this.Expression();
            pass(")");
            node.body = this.Statement();
            l2 = loc && loc.end;
            EarlyErrors(node);
            // staticSemantics.popContainer();
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

            // staticSemantics.newContainer();

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

            // staticSemantics.popContainer();

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
            // staticSemantics.newContainer();

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
            // staticSemantics.popContainer();

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

            dumpExtras2(node, "before");

            pass(";");

            dumpExtras2(node, "after");


            if (compile) return builder.emptyStatement(loc);
            return node;
        }
        return null;
    }

    parser.DirectivePrologue = DirectivePrologue;
    function DirectivePrologue(containingNode, nodes) {
        var strict = false;
        while (t === "StringLiteral" && isDirective[v]) {
            if (isStrictDirective[v]) strict = containingNode.strict = true;
            else if (isAsmDirective[v]) containingNode.asm = true;
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
        return strict;
    }

    parser.SourceElements = SourceElements;
    function SourceElements(program) {
        var body = [];
        var node;

        pushStrict(this.DirectivePrologue(program, body));
        var contains = Contains["Program"];

        do {
            if (node = this.FunctionDeclaration() || this.ClassDeclaration() || this.ModuleDeclaration() || this.Statement()) {

                /* O(1) test for contains */
                if (!contains[node.type]) body.push(node);
                else throw new SyntaxError("contains: "+node.type+" is not allowed in Program");
                /* new idea */

            } else {
            
                if (token != undefined)
                    throw new SyntaxError("unexpected token " + t + " with value " +v);
            
            }

        } while (token != undefined);

        popStrict();

        return body;
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

        var node = Node("Program");
        node.loc = loc = makeLoc();
        loc.start.line = 1;
        loc.start.column = 1;
        var l1 = loc && loc.start;


        next(); // walk to first token

        pushDecls();    // symbol table replacement only with the varscoped lists is stupid,
        // i need duplicate identifier check anyways. (staticsemantics object symbol/list/contains mixture was a better idea)
        // redo symbol table which can make lists for getting semantic analysis into syntactic stage

        currentNode = node;

        node.body = this.SourceElements(node);

        var l2;
        l2 = loc && loc.end;
        node.loc = makeLoc(l1, l2);
        EarlyErrors(node);

        popDecls(node);

        if (compile) return builder["program"](node.body, loc);
        return node;
    }

    parser.RegularExpressionLiteral = RegularExpressionLiteral;

    function RegularExpressionLiteral() {
        if (t === "RegularExpressionLiteral") {
            var l1 = loc && loc.start;
            var node = Node("RegularExpressionLiteral");

            // value is an array
            node.value = v[0];
            node.flags = v[1];

            /* // value is the whole literal string
            var lastIndex = v.lastIndexOf("/");
            node.value = v.substr(1, lastIndex - 1);
            node.flags = v.substr(lastIndex + 1, v.length-lastIndex);
            */
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1,l2);
            next();
            return node;
        }
        return null;        
    }


    // ===========================================================================================================
    // JSON Parser is invoked via parseGoal from the Runtime of the Interpreter and is incompatible
    // should be moved into a separate piece of scope, because of "withError". Or "withError" should
    // become a convention for the whole parser to return an error (which makes isAbrupt() tests necessary)
    // ===========================================================================================================

    parser.JSONText = JSONText;


    function JSONText() {

        if (!withError) {
            withError = require("api").withError;
            ifAbrupt = require("api").ifAbrupt;
            isAbrupt = require("api").isAbrupt;
        }

        return this.JSONValue();
    }

    parser.JSONValue = JSONValue;

    function JSONValue() {
        return this.JSONObject() || this.JSONArray() || this.JSONNumber() || this.JSONString() || this.JSONBooleanLiteral() || this.JSONNullLiteral();
    }

    parser.JSONString = JSONString;

    function JSONString() {

        if (t === "StringLiteral" || (t == "Literal" && typeof v == "string"))  {
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
        if (t === "NumericLiteral" || (t == "Literal" && typeof v === "number")) {
            var node = Node("JSONNumber");
            node.value = v;
            next();
            return node;
        }
    }

    parser.JSONFraction = JSONFraction;
    function JSONFraction() {
        return null;
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
            pass("[");
            var elements = this.JSONElementList();
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
        while (v !== "]" && v !== undefined) {
            var node = this.JSONValue();
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
            pass("{");
            var properties = this.JSONMemberList();
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
        var key = this.JSONString();
        if (!key) return withError("Syntax", "JSONMember: Expecting double quoted string keys in object literals.");
        if (isAbrupt(key = ifAbrupt(key))) return key;
        pass(":");
        var value = this.JSONValue();
        if (isAbrupt(value = ifAbrupt(value))) return value;
        node.key = key;
        node.value = value;
        return node;
    }
    parser.JSONMemberList = JSONMemberList;

    function JSONMemberList() {
        var list = [];
        while (v !== "}" && v !== undefined) {
            var node = this.JSONMember();
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

    function parse(sourceCodeOrTokens) {
        resetVariables(sourceCodeOrTokens);
        try {

            ast = parser.Program();

        } catch (ex) {

            //  throw ex;

            console.log("[Parser Exception]: " + ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            ast = ex;

            // if ((x = parse(y)) instanceof Error) idea to return if abrupt later
        }


        return ast;
    }

    function parseGoal(goal, source) {

        if (!withError) {
            var api = require("api");
            withError = api && api.withError;
            ifAbrupt = api && api.ifAbrupt;
            isAbrupt = api && api.isAbrupt;

            // use the (x instanceof Error) better in runtime to remove dependency

        }

        saveTheDot();

        resetVariables();
        if (Array.isArray(source)) {
            tokens = source;
        } else {
            text = source;
            tokens = tokenize(text);
        }

        lookahead = lookaheadt = token = v = t = undefined;
        i = -1;
        j = tokens.length;
        next();

        var fn = parser[goal];
        if (!fn) throw "Sorry, got no parser for " + goal;
        try {
            var node = fn.call(parser);
        } catch (ex) {
            console.log("[Parser Exception @parseGoal]: " + ex.name);
            console.log(ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            node = ex;
        }
        restoreTheDot();
        return node;
    }

    var exports = parse;
    exports.parser = parser;
    exports.parseGoal = parseGoal;
    exports.setBuilder = setBuilder;
    exports.unsetBuilder = unsetBuilder;
    exports.registerObserver = registerObserver;
    exports.unregisterObserver = unregisterObserver;
    exports.enableExtras = enableExtras;
    exports.disableExtras = disableExtras;
    exports.setWithExtras = setWithExtras;
    exports.isWithExtras = isWithExtras;
    exports.makeParser = makeParser;
    /*
     * Observers. Turning the parser into some observable
     */

    var observers = [];
    function registerObserver(f) {
        if (typeof f === "function")
            observers.push(f);
        else
            throw new TypeError("registerObserver: argument f is not a function")
    }
    function unregisterObserver(f) {
        observers = observers.filter(function (g) { return f !== g; });
    }
    function notifyObserver(observer) {
        observer(node);
    }
    function notifyObservers(node) {
        observers.forEach(notifyObserver);
        return node;
    }

    /*
     * Builder Object can be compilers, more analyzers, whatever can be done behind the interface
     */

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
        if (boolCompile !== undefined) compile = !!boolCompile;
        return true;
    }



    /*
     * prototyping CST Extras with a decorator
     * --still failing---
     */


    function enableExtras () {
        debug("Enabling CST extras");
        Object.keys(parser).forEach(function (k) {
            if (typeof parser[k] === "function" && !parser[k].wrapped) {
                if (k == "next" || k == "pass" || k.indexOf("JSON")===0) return; // for my hacky wacky system
                debug("wrapping "+k);
                var originalFunction = parser[k];
                var parseFunction = function () {
                    console.log("parsing "+originalFunction.name+ " at  "+ v + " "+ t + " " + lookahead);

                    var b = exchangeBuffer();
                    var node = originalFunction.call(this, arguments);
                    if (node) {
                        if (b.length) console.dir(b);
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
        debug("Disabling CST extras");
        Object.keys(parser).forEach(function (k) {
            if (typeof parser[k] === "function" && parser[k].wrapped)
                parser[k] = parser[k].wrapped;
        });
    }
    function setWithExtras(value) {
        withExtras = !!value;
    }
    function isWithExtras() {
        return !!withExtras;
    }


    // enableExtras();
    // uncomment for endless loop
    return exports;


}

    return makeParser();
    
});

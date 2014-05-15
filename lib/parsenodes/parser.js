
define("parser", function () {

//    function makeParser() {
    "use strict";
//    var i18n = require("i18n-messages");
    var tables = require("tables");
    var tokenize = require("tokenizer").tokenizeIntoArray; // around one return nextToken() to go to replace

    var i18n = require("i18n");
    var format = i18n.format;

    var Contains = require("earlyerrors").Contains;
    var SymbolTable = require("symboltable").SymbolTable;
    var BoundNames = require("slower-static-semantics").BoundNames;

    // JSON uses the api.
    var api, newSyntaxError, ifAbrupt, isAbrupt;
    // separation of the independent parser
    // should be reconsidered, or a wrap in
    // a try/catch and a regular throw, then
    // JSON otherwise is regularly usable from
    // parseGoalSymbol

    var IsIteration = tables.IsIteration;
    var IsTemplateToken = tables.IsTemplateToken;
    var FinishStatementList = tables.FinishStatementList;
    var FinishSwitchStatementList = tables.FinishSwitchStatementList;
    var StatementParsers = tables.StatementParsers;
    var PrimaryExpressionByValue = tables.PrimaryExpressionByValue;
    var PrimaryExpressionByType = tables.PrimaryExpressionByType;
    var PrimaryExpressionByTypeAndFollowByValue = tables.PrimaryExpressionByTypeAndFollowByValue;
    var PrimaryExpressionByValueAndFollowByType = tables.PrimaryExpressionByValueAndFollowByType;
    var SkipableToken = tables.SkipableToken;
    var SkipableTokenNoLT = tables.SkipableTokenNoLT;
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
    var OperatorPrecedence = tables.OperatorPrecedence;
    var UnaryOperatorPrecedence = tables.UnaryOperatorPrecedence;
    var isDirective = tables.isDirective;
    var isStrictDirective = tables.isStrictDirective;
    var isAsmDirective = tables.isAsmDirective;
    var ForbiddenArgumentsInStrict = tables.ForbiddenArgumentsInStrict;
    var ReservedWordsInStrictMode = tables.ReservedWordsInStrictMode;
    var ExprEndOfs = tables.ExprEndOfs;
    var ast;
    var ltNext;
    var ltPassedBy;
    var gotSemi;
    var tokens;
    var token = Object.create(null);
    var lkhdTok;
    var lkhdVal, lkhdTyp;
    var t; // current token type
    var v; // current token value
    var pos; // tokens[pos] pointer     (array version)
    var lookPos;
    var tokenArrayLength; // tokens.length;        (array version)
    var symtab;
    var parser = Object.create(null);


    var inStack = [];
    var isIn = true;
    var yieldStack = [];
    var isYieldId = true;
    var defaultStack = [];
    var isDefaultId = true;
    var generatorParameter = false;
    var generatorParameterStack = [];
    var isReturn = false;
    var returnStack = [];
    var strictStack = [];
    var isStrict = false;

    var currentNode;
    var nodeStack = [];
    var currentModule;
    var moduleStack = [];
    var loc = makeLoc();
    var lastloc;
    var text;
    var builder = null;
    var compile = false;
    var compiler;
    var cb;
    var notify = false;
    var stateStack = [];
    var state = "";
    var parseGoalState;
    var ContainNoSuperIn = {
        "Program" : true,
        "ModuleDeclaration": true,
        "Module" : true
    };
    var PatternName = {
        __proto__: null,
        "{": "ObjectPattern",
        "[": "ArrayPattern"
    };
    var LetOrConst = {
        __proto__: null,
        "let": true,
        "const": true
    };
    var debugmode = false;
    var hasConsole = typeof console === "object" && console != null && typeof console.log === "function";
    var hasPrint = typeof print == "function";
    var nodeId = 1;

    var withExtras = false;
    // CST withExtras. The collection is now done in the tokenizer
    // and fetched from it´s object.

    function compile(node) {
        // i replace the old compile call (with a little cost for callBuilder)
        // to have an easier interface to maintain for debugging and POC impls
        return builder.callBuilder(node);
    }


    function exchangeBuffer() {
        var b = tokenize.extraBuffer;
        tokenize.extraBuffer = [];
        return b;
    }

    function dumpExtras(node, prop, dir) {   // dumpExtras(id, "id", "before");
        var extras;
        var extraBuffer = tokenize.extraBuffer;
        if (!node || (extraBuffer && !extraBuffer.length)) return;
        if (!node.extras) node.extras = {};
        if (!node.extras[prop]) node.extras[prop] = {};
        node.extras[prop][dir] = extraBuffer;
        tokenize.extraBuffer = [];
    }
    function dumpExtras2(node, prop) {   // dumpExtras(id, "id", "before");
        var extras;
        var extraBuffer = tokenize.extraBuffer;
        if (!node || (extraBuffer && !extraBuffer.length)) return;
        if (!node.extras) node.extras = {};
        node.extras[prop] = extraBuffer;
        tokenize.extraBuffer = [];
    }

    function startLoc() {
        return loc.start;
    }
    function endLoc(node, l1) {
        node.loc = makeLoc(l1, loc.end);
    }

    function debug() {
        if (debugmode && hasConsole) {
            if (typeof arguments[0] == "object") {
                console.dir(arguments[0]);
            } else console.log.apply(console, arguments);
        }
        if (hasPrint) print.apply(null, arguments);
    }
    function debugdir() {
        if (debugmode && hasConsole) console.dir.apply(console, arguments);
    }
    function pushStrict(v) {
        strictStack.push(isStrict);
        isStrict = v;
    }
    function popStrict() {
        isStrict = strictStack.pop();
    }
    function pushState(newState) {
        stateStack.push(state);
        state = newState;
    }
    function popState() {
        state = stateStack.pop();
    }
    function pushNoIn(new_state) {
        inStack.push(isIn);
        isIn = new_state;
    }
    function popNoIn() {
        isIn = inStack.pop();
    }
    function build(node) {
        if (!compile) return node;
        var type = node.type;
        var work = builder[type];
        return work(node);
    }
    function rotate_binexps(node) {
        if (node.right) {
            var tmp,
                prec = OperatorPrecedence[node.operator],
                rPrec = OperatorPrecedence[node.right.operator] || Infinity;
            if (prec > rPrec) {
                tmp = node;
                node = node.right;
                tmp.right = node.left;
                node.left = tmp;
            }
        }
        return node;
    }
    function makeLoc(start, end, filename, source) {
        return {
            start: start || {},
            end: end || {},
            source: source,
            filename: filename
        };
    }
    function stringifyTokens(array) {
        var string = "";
        for (var i = 0, j = array.length; i < j; i++) {
            string += array[i].value;
        }
        return string;
    }
    function augmentErrorStack(error) {
        var stack = error.stack;
        var line = loc.start.line;
        var column = loc.start.column;
        var location = "A syntax.js parser error occured at line " + line + ", column " + column + "\r\n";
        error.stack = location;
        if (stack) error.stack += stack;
        return error;
    }
    function charExpectedString(C) {
        var line = loc.start.line;
        var column = loc.start.column;
        return C + " expected "+atLineCol();
    }
    function atLineCol() {
        var line = loc.start.line;
        var column = loc.start.column;
        return " [[value="+v+" type="+t+" lkhdVal="+lkhdVal+" at line "+line+", column "+column+"]]";
    }
    var uqrx = /^("|')|("|')$/g;
    function unquote(str) {
        return str.replace(uqrx, ""); //'
    }
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

    var saveBuilder = [];
    function unsetBuilder(builderObj) {
        var state;
        if (builder === builderObj) state = saveBuilder.pop();
        if (state) {
            builder = state.builder;
            compile = state.compile;
        }
    }
    function setBuilder(builderObj, boolCompile) {
        saveBuilder.push({
            builder: builder,
            compile: compile
        });
        if (typeof builderObj !== "object") {
            throw new TypeError("builderObj ist a Mozilla Parser-API compatible Builder Object for Code Generation from the AST, see http://developers.mozilla.org/en-US/docs/SpiderMonkey/Parser_API for more how to use..");
        }
        builder = builderObj;
        if (boolCompile !== undefined) compile = !!boolCompile;
        return true;
    }
    function enableExtras () {
        Object.keys(parser).forEach(function (k) {
            var f = parser[k];
            if (typeof f === "function" && !f.wrapped) {
                if (k.indexOf("JSON")===0) return;
                var originalFunction = f;
                var parseFunction = function () {
                    var b = exchangeBuffer();
                    var node = originalFunction.apply(parser, arguments);
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
        Object.keys(parser).forEach(function (k) {
            var f = parser[k];
            if (typeof f === "function" && f.wrapped)
                parser[k] = f.wrapped;
        });
    }
    function setWithExtras(value) {
        withExtras = !!value;
    }
    function isWithExtras() {
        return !!withExtras;
    }
    function consume(i) {
        while (i > 0) { next(); i--; }
    }
    function match(C) { // match
        if (v === C) next();
        else throw new SyntaxError(charExpectedString(C));
    }
    function skip(C) {
        if (v === C) {
            next();
            return true;
        } else return false;
    }
    function semicolon() {
        if (v == ";") {
            gotSemi = true;
            next();
        } else {
            gotSemi = false;
        }
    }
    function eos() {
        return lkhdVal === undefined;
    }

    var nextToken = nextToken__array__;

    function next() {
        if (lkhdTok) {
            token = lkhdTok;
            if (token) {
                t = token.type;
                v = token.value;
                lastloc = loc;
                loc = token.loc;
                nextToken();
                return token;
            }
        }
        return token = v = t = undefined;
    }
    function nextToken__array__() {
        ltPassedBy = ltNext;
        ltNext = false;
        lookPos = pos;
        for(;;) {
            lkhdTok = tokens[++lookPos];
            if (lkhdTok === undefined) {
                lkhdVal = lkhdTyp = undefined;
                break;
            }
            lkhdTyp = lkhdTok.type;
            lkhdVal = lkhdTok.value;
            if (lkhdTyp === "LineTerminator") {
                ltNext = true;
                continue;
            }
            if (SkipableToken[lkhdTyp]) continue;
            break;
        }
        pos = lookPos;
        return lkhdTok;
    }
    function nextToken__step__() {
        ltPassedBy = ltNext;
        ltNext = false;
        lookPos = pos;
        for(;;) {
            ++lookPos;
            lkhdTok = tokenize.nextToken();
            if (lkhdTok === undefined) {
                lkhdVal = lkhdTyp = undefined;
                break;
            }
            lkhdTyp = lkhdTok.type;
            lkhdVal = lkhdTok.value;
            ltNext = tokenize.ltNext;
            if (lkhdTyp === "LineTerminator") {
                ltNext = true;
                continue;
            }
            if (SkipableToken[lkhdTyp]) continue;
            break;
        }
        pos = lookPos;
        return lkhdTok;
    }

    function Node2(type) {   // this one seems to get optimized and costs nothing more than inlined {}
        return {
            type: type,
            _id_: ++nodeId
        };
    }
    function Node(type) {
        switch(type) {
            case "Program":
                return {type:type,_id_:++nodeId,strict:undefined,body:undefined,loc:undefined,extras:undefined};
            case "Identifier":
                return {type:type,_id_:++nodeId,name:undefined,loc:undefined,extras:undefined};
            case "ParenthesizedExpression":
            case "ExpressionStatement":
                return {type:type,_id_:++nodeId,expression:undefined,loc:undefined,extras:undefined};
            case "LexicalDeclaration":
            case "VariableDeclaration":
                return {type:type,_id_:++nodeId,kind:undefined,declarations:undefined,loc:undefined,extras:undefined};
            case "VariableDeclarator":
                return {type:type,_id_:++nodeId,kind:undefined,id:undefined,init:undefined};
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "GeneratorDeclaration":
            case "GeneratorExpression":
                return {type:type,_id_:++nodeId,expression:undefined,generator:undefined,strict:undefined,id:undefined,params:undefined,body:undefined,loc:undefined,extras:undefined};
            case "ArrowExpression":
                return {type:type,_id_:++nodeId,params:undefined,body:undefined,loc:undefined,ebxtras:undefined};
            case "NumericLiteral":
            case "StringLiteral":
            case "BooleanLiteral":
            case "Literal":
                return {type:type,_id_:++nodeId,value:undefined,loc:undefined,extras:undefined}
            case "TemplateLiteral":
                return {type:type,_id_:++nodeId,spans:undefined,loc:undefined,extras:undefined}
            case "ObjectExpression":
                return {type:type,_id_:++nodeId,properties:undefined,loc:undefined,extras:undefined};
            case "ArrayExpression":
                return {type:type,_id_:++nodeId,elements:undefined,loc:undefined,extras:undefined};
            case "ObjectPattern":
            case "ArrayPattern":
                return {type:type,_id_:++nodeId,elements:undefined,loc:undefined,extras:undefined};
            case "WhileStatement":
            case "DoWhileStatement":
                return {type:type,_id_:++nodeId,test:undefined, body:undefined,loc:undefined,extras:undefined};
            case "BlockStatement":
                return {type:type,_id_:++nodeId,body:undefined,loc:undefined,extras:undefined};
            case "IfStatement":
                return {type:type,_id_:++nodeId,test:undefined,consequent:undefined,alternate:undefined,loc:undefined,extras:undefined};
            case "ConditionalExpression":
                return {type:type,_id_:++nodeId,test:undefined,consequent:undefined,alternate:undefined,loc:undefined,extras:undefined};
            case "BinaryExpression":
            case "AssignmentExpression":
                return {type:type,_id_:++nodeId,operator:undefined,left:undefined,right:undefined,loc:undefined,extras:undefined};
            case "ForInOfStatement":
                return {type:type,_id_:++nodeId,left:undefined,right:undefined,body:undefined,loc:undefined,extras:undefined};
            case "ForStatement":
                return {type:type,_id_:++nodeId,init:undefined,test:undefined,update:undefined,loc:undefined,extras:undefined};
            case "NewExpression":
                return {type:type,_id_:++nodeId, callee:undefined, arguments:undefined, loc:undefined, extras:undefined};
            case "CallExpression":
                return {type:type,_id_:++nodeId, callee:undefined, arguments:undefined, loc:undefined, extras:undefined};
            case "RestParameter":
                return {type:type,_id_:++nodeId, id:undefined, loc:undefined, extras:undefined};
            case "SpreadExpression":
                return {type:type,_id_:++nodeId, id:undefined, loc:undefined, extras:undefined};
            case "BindingPattern":
                return {type:type,_id_:++nodeId, id:undefined, target:undefined, loc:undefined, extras:undefined};
            case "ArrayComprehension":
                return {type:type,_id_:++nodeId, blocks:undefined, filter:undefined, expression:undefined, loc:undefined, extras:undefined};
            case "GeneratorComprehension":
                return {type:type,_id_:++nodeId, loc:undefined, extras:undefined};
            case "SwitchStatement":
                return {type:type,_id_:++nodeId, discriminant:undefined, cases:undefined, loc:undefined, extras:undefined};
            case "DefaultCase":
                return {type:type,_id_:++nodeId, consequent:undefined, loc:undefined, extras:undefined};
            case "SwitchCase":
                return {type:type,_id_:++nodeId, test:undefined, consequent:undefined, loc:undefined, extras:undefined};
            case "TryStatement":
                return {type:type,_id_:++nodeId, handler:undefined, guard:undefined, finalizer:undefined, loc:undefined, extras:undefined};
            case "CatchClause":
                return {type:type,_id_:++nodeId, block:undefined, loc:undefined, extras:undefined};
            case "Finally":
                return {type:type,_id_:++nodeId, block:undefined, loc:undefined, extras:undefined};
            case "Elision":
                return {type:type,_id_:++nodeId, width: undefined, loc: undefined, extras: undefined};
            default:
                return {type:type,_id_:++nodeId, loc:undefined, extras:undefined};
        }
    }

    var positions = [];
    function saveTheDot() {
        var memento = {
            ast: ast,
            loc: loc,
            tokens: tokens,
            pos: pos,
            tokenArrayLength: tokenArrayLength,
            token: token,
            t: t,
            v: v,
            nextToken: nextToken,
            lookPos: lookPos,
            lkhdTok: lkhdTok,
            lkhdVal: lkhdVal,
            lkhdTyp: lkhdTyp,
            isIn: isIn,
            inStack: inStack,
            isYieldId: isYieldId,
            isDefaultId: isDefaultId,
            yieldStack: yieldStack,
            defaultStack: defaultStack,
            symtab: symtab
            //           nodeTable: nodeTable
        };
        positions.push(memento);
        return memento;
    }
    function restoreTheDot(memento) {
        memento = memento || positions.pop();
        if (memento) {
            loc = memento.loc;
            symtab = memento.symtab;
            tokens = memento.tokens;
            pos = memento.pos;
            tokenArrayLength = memento.tokenArrayLength;
            token = memento.token;
            ast = memento.ast;
            t = memento.t;
            v = memento.v;

            nextToken = memento.nextToken;
            lookPos = memento.lookPos;
            lkhdTok = memento.lkhdTok;
            lkhdVal = memento.lkhdVal;
            lkhdTyp = memento.lkhdTyp;

            isIn = memento.isIn;
            inStack = memento.inStack;
            isYieldId = memento.isYieldId;
            isDefaultId = memento.isDefaultId;
            yieldStack = memento.yieldStack;
            defaultStack = memento.defaultStack;
            //         nodeTable = memento.nodeTable;
        }
    }
    function Literal() {
        var node;
        if (IsAnyLiteral[t]) {
            node = Node(t);
            node.longName = token.longName;
            node.value = v;
            node.computed = token.computed;
            node.loc = makeLoc(loc.start, loc.end);
            match(v);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function Identifier() {
        if (t === "Identifier" || (v === "yield" && isYieldId) || (v === "default" && isDefaultId)) {
            var node = Node("Identifier");
            node.name = v;
            node.loc = token.loc;
            match(v);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ComprehensionForList() {
        var list = [], el, binding, ae;
        while (v === "for") {
            match("for");
            match("(");
            binding = this.ForBinding();
            match("of");
            ae = this.AssignmentExpression();
            var block = Node("ComprehensionBlock");
            block.left = binding;
            block.right = ae;
            list.push(block);
            match(")");
        }
        return list.length ? list : null;
    }
    function ComprehensionFilters() {
        var list = [];
        while (v == "if") {
            match("if");
            match("(");
            list.push(this.AssignmentExpression());
            match(")");
        }
        return list.length ? list : null
    }
    function ArrayComprehension() {
        var node, blocks, filter;
        if (v === "[") {
            var l1, l2;
            l1 = loc.start;
            node = Node("ArrayComprehension");
            node.blocks = [];
            node.filter = [];
            match("[");
            while (v === "for") {
                blocks = this.ComprehensionForList();
                if (blocks) node.blocks = node.blocks.concat(blocks);
                filter = this.ComprehensionFilters();
                if (filter) node.filter = node.filter.concat(filter);
            }
            node.expression = this.AssignmentExpression();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            match("]");
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function GeneratorComprehension() {
        var node;
        if (v === "(") {
            var l1, l2;
            l1 = loc.start;
            node = Node("GeneratorComprehension");
            match("(");
            node.blocks = this.ComprehensionForList();
            node.filter = [];
            while (v == "if") {
                match("if");
                node.filter.push(this.Expression());
            }
            node.expression = this.AssignmentExpression();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function YieldAsIdentifier() {
        if (v === "yield") {
            if (isYieldId) {
                var node = Node("Identifier");
                node.name = "yield";
                node.loc = token && token.loc;
                match("yield");
                if (compile) return compiler(node);
                return node;
            }
        }
        return null;
    }
    function YieldExpression() {
        if (v === "yield" && !isYieldId) {
            match("yield");
            var node = Node("YieldExpression");
            node.argument = this.Expression();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ClassExpression() {
        if (v === "class") {
            var isExpr = true;
            var node = this.ClassDeclaration(isExpr);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function TemplateLiteral() {
        if (t === "TemplateLiteral") {
            var l1, l2;
            l1 = loc.start;
            var node = Node("TemplateLiteral");
            node.spans = v;
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            match(v);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function Elision(node) {
        if (v === ",") {
            var l1, l2;
            if (node) {
                node.width += 1;
                if (node.loc) {
                    node.loc.end = loc.end;
                }
            } else {
                node = Node("Elision");
                node.width = 1;
                l1 = loc.start;
                l2 = loc.end;
                node.loc = makeLoc(l1, l2);
            }
            match(v);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ElementList() {
        var list = [], el;
        if (v === "]") return list;
        do {
            if (v === "," && lkhdVal == ",") {
                el = null;
                do {
                    el = this.Elision(el);
                } while (v === ",");
                list.push(el);
            }
            if (v === "]") break;
            if (v === "...") el = this.SpreadExpression()
            else el = this.AssignmentExpression();
            if (el) list.push(el);
            if (v === "," && lkhdVal !== ",") match(",");
        } while (v && v !== "]");
        return list;
    }
    function ArrayExpression() {
        var node, l1, l2;
        if (v === "[") {
            l1 = loc.start;
            if (lkhdVal === "for") return this.ArrayComprehension();
            match("[");
            var node = Node("ArrayExpression");
            node.elements = this.ElementList();
            l2 = loc.end;
            match("]");
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function StrictFormalParameters() {
        return this.FormalParameterList.apply(this, arguments);
    }

    function ComputedPropertyName() {
        var propertyName;
        if (v === "[") {
            match("[");
            propertyName = this.AssignmentExpression();
            match("]");
            return propertyName;
        }
        return null;
    }
    function PropertyKey() {
        var node = /*this.ComputedPropertyName() ||*/ this.Identifier() || this.Literal();

        if (!node && (Keywords[v])) {
            node = Node("Identifier");
            node.name = v;
            node.loc = token && token.loc;
        }

        if (node) {
            if (compile) return compiler(node);
            return node;
        }

        throw new SyntaxError("invalid property key in definition"+atLineCol());

    }
    function PropertyDefinitionList() {
        var list = [];
        list.type = "PropertyDefinitionList";
        var id;
        var node, hasAsterisk, computedPropertyName; // p ist hier der node-name (renamen)
        var method;
        do {

            if (v == "}") break;

            if ((v === "get" || v === "set") && lkhdVal !== ":" && lkhdVal !== "(") {

                node = Node("PropertyDefinition");
                node.kind = v;
                method = this.MethodDefinition(true); // isObjectMethod = true
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

                    if (!computedPropertyName && (lkhdVal === "," || lkhdVal === "}") && (BindingIdentifiers[t] || v === "constructor")) { // {x,y}

                        node.kind = "init";
                        id = this.PropertyKey();
                        if (!id) throw new SyntaxError("error parsing objectliteral shorthand"+atLineCol());
                        node.key = id;
                        node.value = id;
                        list.push(node);

                    } else if (computedPropertyName && v === ":") { // [s]:

                        node.kind = "init";
                        node.key = computedPropertyName;
                        node.computed = true;
                        match(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throw new SyntaxError("error parsing objectliteral := [symbol_expr]: assignmentexpression"+atLineCol());
                        list.push(node);

                    } else if (lkhdVal === ":") { // key: AssignmentExpression

                        node.kind = "init";
                        node.key = this.PropertyKey();
                        match(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throw new SyntaxError("error parsing objectliteral := propertykey : assignmentexpression");
                        list.push(node);

                    } else if (computedPropertyName && v == "(") {

                        node.kind = "method";
                        method = this.MethodDefinition(true, computedPropertyName);
                        if (!method) throw new SyntaxError("Error parsing method definition in ObjectExpression"+atLineCol());
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);

                    } else if (((v == "[" || BindingIdentifiers[t] || v === "constructor") && lkhdVal === "(") || (v === "*" && (lkhdVal == "[" || BindingIdentifiers[lkhdTyp] || lkhdVal === "constructor"))) {

                        node.kind = "method";
                        method = this.MethodDefinition(true);
                        if (!method) throw new SyntaxError("Error parsing method definition in ObjectExpression"+atLineCol());
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);
                    }
                }
            }
            computedPropertyName = undefined;

            if (v === ",") {
                match(",");
            } else break;

        } while (v !== "}" && v !== undefined);

        return list;
    }
    function ObjectExpression() {
        var node, l1, l2;
        if (v === "{") {

            l1 = loc.start;
            node = Node("ObjectExpression");
            node.properties = [];
            match("{");
            node.properties = this.PropertyDefinitionList();
            l2 = loc.end;
            match("}");
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ExpressionNoIn() {
        inStack.push(isIn);
        isIn = false;
        var node = this.Expression();
        isIn = inStack.pop();
        return node;
    }
    function CoverParenthesizedExpression(tokens) {
        return parseGoal("ParenthesizedExpression", tokens);
    }
    function ParenthesizedExpression() {
        var l1 = loc.start;
        var node = Node("ParenthesizedExpression");
        // match("(");
        node.expression = this.Expression();
        // match(")");
        var l2 = loc.end;
        node.loc = makeLoc(l1, l2);
        if (compile) return compiler(node);
        return node;
    }
    function ArrowParameterList(tokens) {
        return parseGoal("FormalParameterList", tokens);
    }
    function CoverParenthesizedExpressionAndArrowParameterList() {
        var parens = [];
        var covered = [];
        var cover = false;
        var expr, node, l1, l2;
        l1 = loc.start;
        if (t === "Identifier" && lkhdVal === "=>") {
            expr = this.Identifier();
            cover = true;
        } else if (v === "..." && lkhdTyp === "Identifier") {
            expr = this.RestParameter();
            cover = true;
        } else if (v === "(") {
            if (lkhdVal === "for") return this.GeneratorComprehension();
            cover = true;
            parens.push(v);

            while (next()) {
                if (v === "(") {
                    parens.push(v);
                } else if (v === ")") {
                    parens.pop();
                    if (!parens.length) {
                        break;
                    }
                }
                covered.push(token);
                if (v === undefined) throw new SyntaxError("no tokens left over covering expression"+atLineCol());
            }
            match(")");
        }
        if (cover) {
            if (v === "=>") {
                match("=>");
                node = Node("ArrowExpression");
                node.kind = "arrow";
                node.strict = true;
                pushStrict(true);
                node.expression = true;
                node.params = (expr ? [expr] : this.ArrowParameterList(covered));
                node.body = this.ConciseBody(node);
                l2 = loc.end;
                node.loc = makeLoc(l1, l2);
                popStrict();
                if (compile) return compiler(node);
                return node;
            } else {
                return this.CoverParenthesizedExpression(covered);
            }
        }
        return null;
    }
    function PrimaryExpression() {
        var fn, node;
        fn = PrimaryExpressionByTypeAndFollowByValue[t];
        if (fn) fn = this[fn[lkhdVal]];
        else {
            fn = PrimaryExpressionByValueAndFollowByType[v];
            if (fn) fn = this[fn[lkhdTyp]];
        }
        if (!fn) fn = this[PrimaryExpressionByValue[v]];
        if (!fn) fn = this[PrimaryExpressionByType[t]];
        if (!fn && v === "yield") {
            if (isYieldId) fn = this.YieldAsIdentifier;
            else fn = this.YieldExpression;
        }
        if (!fn && isDefaultId && v === "default") fn = this.DefaultAsIdentifier;
        if (fn) node = fn.call(this);
        if (node) return this.PostfixExpression(node);
        return null;
    }
    function MemberExpression(obj) {
        var node, l1, l2;
        if (obj = obj || this.PrimaryExpression()) {
            l1 = obj.loc && obj.loc.start;
            var node = Node("MemberExpression");
            node.object = obj;
            if (t === "TemplateLiteral") {
                return this.CallExpression(obj);
            } else if (v === "[") {
                match("[");
                node.computed = true;
                node.property = this.AssignmentExpression();
                match("]");
            } else if (v === ".") {
                match(".");
                node.computed = false;
                var property = Object.create(null);
                if (t === "Identifier" || t === "Keyword" || propKeys[v] || t === "NumericLiteral") {
                    property.type = "Identifier";
                    property.name = v;
                    property.loc = token.loc;
                    match(v);
                }
                /*else if (v === "!") {
                 match("!");
                 if (v == "[") {
                 var
                 } else if (v == "(") {
                 var args = this.Arguments();


                 } else if (t === "Identifier") {
                 property = {};
                 property.name = v;
                 }
                 property.eventual = true;
                 node.eventual = true;

                 // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency
                 // MemberExpression ! [Expression]
                 // MemberExpression ! Arguments
                 // MemberExpression ! Identifier
                 // setzt .eventual auf true
                 } */
                else {
                    throw new SyntaxError("MemberExpression . Identifier expects a valid IdentifierString or an Integer or null,true,false as PropertyKey"+atLineCol());
                }
                node.property = property;
            } else {
                return obj;
            }

            if (v == "[" || v == ".") return this.MemberExpression(node);
            else if (v == "(") return this.CallExpression(node);
            else if (IsTemplateToken[t]) return this.CallExpression(node);
            // strawman:concurrency addition
            else if (v == "!") return this.MemberExpression(node);
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function Arguments() {
        var args, arg;
        if (v === "(") {
            match("(");
            args = [];
            if (v !== ")") {
                do {
                    if (v === ")") break;

                    if (v === "...") arg = this.SpreadExpression();
                    else arg = this.AssignmentExpression();
                    if (arg)
                        args.push(arg);

                    if (v === ",") match(",");
                    else if (v != ")" && v != undefined) throw new SyntaxError("illegal argument list"+atLineCol());

                } while (v !== undefined);
            }
            match(")");
            return args;
        }
        return null;
    }
    function ConditionalExpressionNoIn(test) {
        inStack.push(isIn);
        isIn = false;
        var r = this.ConditionalExpression(test);
        isIn = inStack.pop();
        return r;
    }
    function ConditionalExpression(test) {
        if (test && v === "?") {
            var l1 = loc.start,
                l2;
            var node = Node("ConditionalExpression");
            node.test = test;
            match("?");
            node.consequent = this.AssignmentExpression();
            match(":");
            node.alternate = this.AssignmentExpression();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);

            if (node.test.type === "AssignmentExpression") {
                // Hier knallt der Compiler am Test ohne Fkt.
                var tmp = node.test;
                node.test = tmp.right;
                tmp.right = node;
                node = tmp;
            }

            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function PostfixExpression(lhs) {
        var l1 = loc.start;
        lhs = lhs || this.LeftHandSideExpression();
        if (lhs && UpdateOperators[v]) {
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = false;
            node.argument = lhs;
            node.loc = makeLoc(l1, loc.end);
            match(v);
            if (compile) return compiler(node);
            return node;
        }
        return lhs;
    }
    function UnaryExpression() {
        if (UnaryOperators[v] || UpdateOperators[v]) {
            var l1 = loc.start;
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = true;
            match(v);
            if (UnaryOperators[v]) node.argument = this.UnaryExpression();
            else node.argument = this.PostfixExpression();
            var l2 = loc.end;
            if (node.argument == null) throw new SyntaxError("invalid unary expression "+node.operator+", operand missing " + atLineCol());
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return this.PostfixExpression();
    }
    function AssignmentExpressionNoIn() {
        inStack.push(isIn);
        isIn = false;
        var node = this.AssignmentExpression();
        isIn = inStack.pop();
        return node;
    }
    function StartAssignmentExpressionNoIn() {
        inStack.push(isIn);
        isIn = false;
        var node = this.StartAssignmentExpression();
        isIn = inStack.pop();
        return node;
    }

    function StartAssignmentExpression() {
        var node = null, leftHand, l1, l2;
        l1 = loc.start;
        leftHand = this.LeftHandSideExpression();
        if (AssignmentOperators[v] && (isIn || (!isIn && v != "in"))) {
            var node = Node("AssignmentExpression");
            node.longName = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;
            match(v);
            node.right = this.StartAssignmentExpression();
            if (!node.right) throw new SyntaxError("can not parse a valid righthandside for this assignment expression"+atLineCol());
            var l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            node = rotate_binexps(node);
        } else if (BinaryOperators[v] && (isIn || (!isIn && v != "in"))) {
            var node = Node("BinaryExpression");
            node.longName = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;
            match(v);
            node.right = this.StartAssignmentExpression();
            if (!node.right) {
                throw new SyntaxError("can not parse a valid righthandside for this binary expression "+atLineCol());
            }
            var l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            node = rotate_binexps(node);
        }
        else return leftHand;
        if (compile) return compiler(node);
        return node;
    }
    function AssignmentExpression() {
        var node = this.StartAssignmentExpression();
        if (v == "?") return this.ConditionalExpressionNoIn(node);
        return node;
    }
    function CallExpression(callee) {
        var node, l1, l2;
        l1 = l2 = (loc.start);
        if (callee = (callee||this.MemberExpression())) {
            l1 = callee.loc && callee.loc.start;
            node = Node("CallExpression");
            node.callee = callee;
            node.arguments = null;
            if (t === "TemplateLiteral") {
                var template = this.TemplateLiteral();
                node.arguments = [ template ];
                l2 = loc.end;
                node.loc = makeLoc(l1, l2);
                // if (compile) return builder.callExpression(node.callee, node.arguments, node.loc);
                return node;
            } else if (v === "(") {
                node.arguments = this.Arguments();
                if (v === "(") {
                    // ..()()()
                    l2 = loc.end;
                    node.loc = makeLoc(l1, l2);
                    return this.CallExpression(node);
                } else if (v === "[" || v == ".") {
                    // .. [][][]
                    l2 = loc.end;
                    node.loc = makeLoc(l1, l2);
                    return this.MemberExpression(node);
                } else {
                    l2 = loc.end;
                    node.loc = makeLoc(l1, l2);
                    if (compile) return compiler(node);
                    return node;
                }
            } else {
                return callee;
            }
        }
        return null;
    }
    function NewExpression() {
        var node, l1, l2;
        if (v === "new") {
            l1 = loc.start;
            l2 = loc.end;
            node = Node("NewExpression");
            match("new");
            if (v === "new") node.callee = this.NewExpression();
            else {
                var callee = this.CallExpression();
                if (callee && callee.type === "CallExpression") {
                    node = callee;
                    node.type = "NewExpression";
                } else if (!callee) {
                    throw new SyntaxError("NewExpression: can not identify callee");
                } else {
                    node.callee = callee;
                }
            }
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function LeftHandSideExpression(callee) {
        return this.NewExpression(callee) || this.CallExpression(callee);
    }
    function ExpressionStatement() {
        if (!ExprNoneOfs[v] && !(v === "let" && lkhdVal=="[")) {
            var expression = this.Expression();
            if (!expression) return null;
            var node = Node("ExpressionStatement");
            node.expression = expression;
            node.loc = expression.loc;
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function SequenceExpressionNode(list, l1, l2) {
        var node = Node("SequenceExpression");
        node.sequence = list;
        node.loc = makeLoc(l1, l2);
        if (compile) return compiler(node);
        return node;
    }
    function Expression() {
        var list = [];
        var node;
        var ae;
        var l1 = loc.start;
        var l2;
        if (ExprEndOfs[v]) return null;

        while (v != undefined) {
            if (ae = this.AssignmentExpression()) list.push(ae);
            if (v === ",") match(",");
            else break;
        }
        l2 = loc.end;
        switch (list.length) {
            case 0: return null;
            case 1: return list[0];
            default: return this.SequenceExpressionNode(list, l1, l2);
        }
    }
    function SuperExpression() {
        if (v === "super") {
            var l1 = loc.start;
            var node = Node("SuperExpression");
            node.loc = makeLoc(l1, l1);
            if (withExtras && tokenize.extraBuffer.length) dumpExtras2(node, "before");
            match("super");
            if (withExtras && tokenize.extraBuffer.length) dumpExtras2(node, "after");
            if (currentNode) {
                if (ContainNoSuperIn[currentNode.type]) {
                    throw new SyntaxError("contains: super is not allowed in "+currentNode.type);
                }
                currentNode.needsSuper = true;
            }
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ThisExpression() {
        if (v === "this") {
            var l1 = loc.start;
            var node = Node("ThisExpression");
            node.loc = makeLoc(l1, l1);
            if (withExtras && tokenize.extraBuffer.length) dumpExtras2(node, "before");
            match("this");
            if (withExtras && tokenize.extraBuffer.length) dumpExtras2(node, "after");
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function Initializer() {
        if (v === "=") {
            match("=");
            return this.AssignmentExpression();
        }
        return null;
    }
    function BindingElementList() {
        var list = [];
        var id, bindEl, l1, l2;
        if (v === "{") {
            match("{");
            while (v != "}") {
                // iif (StartBinding[v]) id = this.BindingPattern();

                id = this.Identifier();

                if (v === ":") {
                    l1 = id.loc && id.loc.start;
                    bindEl = Node("BindingElement");
                    bindEl.id = id;
                    match(":");
                    if (StartBinding[v]) bindEl.target = this.BindingPattern();
                    else bindEl.target = this.LeftHandSideExpression();
                    if (bindEl.target.type === "Identifier") {
                        if (isStrict && ForbiddenArgumentsInStrict[bindEl.target.name]) {
                            throw new SyntaxError(bindEl.target.name + " is not a valid binding identifier in strict mode");
                        }
                    }
                    l2 = loc.end;
                    bindEl.loc = makeLoc(l1, l2);
                    list.push(bindEl);
                    if (v === "=") {
                        bindEl.init = this.Initializer();
                    }
                } else {
                    if (isStrict && ForbiddenArgumentsInStrict[id.name]) {
                        throw new SyntaxError(v + " is not a valid binding identifier in strict mode");
                    }
                    list.push(id);
                    if (v === "=") {
                        id.init = this.Initializer();
                    }
                }
                if (v === ",") {
                    match(",");
                    if (v === "}") break;
                    continue;

                } else if (v != "}") {
                    throw new SyntaxError("invalid binding property list. csv and terminating }");
                }
            }
            match("}");
        } else if (v === "[") {
            match("[");
            while (v !== "]") {
                switch(v) {
                    case "...":
                        id = this.RestParameter();
                        break;
                    case "{":
                    case "[":
                        id = this.BindingPattern();
                        break;
                    default:
                        id = this.Identifier();
                        break;
                }
                if (id) list.push(id);
                if (v === "=") {
                    id.init = this.Initializer();
                }
                if (v === ",") {
                    match(",");
                    if (v === "]") break;
                    continue;
                } else if (v !== "]") {
                    throw new SyntaxError("invalid binding element list. csv and terminating ]");
                }
            }
            match("]");
        }
        return list;
    }
    function BindingPattern() {
        var node, l1, l2;
        if (StartBinding[v]) {
            l1 = loc.start;
            node = Node(PatternName[v]);
            node.elements = this.BindingElementList();
            if (v === "=") node.init = this.Initializer();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function VariableDeclaration(kind) {
        var node = this.BindingPattern();
        if (node) {
            node.kind = kind;
            return node;
        }
        if (t === "Identifier" || (v === "yield" && isYieldId) || (v === "default" && isDefaultId)) {
            node = Node("VariableDeclarator");
            node.kind = kind;
            var id = this.Identifier();
            node.id = id;

            var name = id.name;
            if (isStrict && (ReservedWordsInStrictMode[name] || ForbiddenArgumentsInStrict[name])) {
                throw new SyntaxError(name + " is not a valid identifier in strict mode");
            }

            // throws error on duplicate identifier
            if (kind === "var") symtab.putVar(node);
            else symtab.putLex(node);

            if (v === "=") node.init = this.Initializer();
            else node.init = null;
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function VariableDeclarationList(kind) {
        var list = [];
        var decl;
        for (;;) {
            decl = this.VariableDeclaration(kind);
            if (decl) list.push(decl);
            else throw new SyntaxError(kind + " declaration expected");
            if (!isIn && InOrOf[v]) break;
            if (v === ",") {
                match(",");
                continue;
            } else if (v === ";") {
                match(";");
                break;
            } else break;
            // else throw new SyntaxError("illegal "+v+" after "+kind);
        }
        if (!list.length) throw new SyntaxError("expecting identifier names after "+kind);
        return list;
    }
    function VariableStatement() {
        var node, decl, l1, l2;
        if (v === "var" || v === "let" || v === "const") {

            if (v == "const" && lkhdVal == "class") {
                return this.ConstClassDeclaration();
            }

            l1 = loc.start;
            node = Node("VariableDeclaration");
            node.declarations = [];
            node.kind = v;
            if (v !== "var") node.type = "LexicalDeclaration";
            match(v);
            node.declarations = this.VariableDeclarationList(node.kind);
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function VariableStatementNoIn() {
        inStack.push(isIn);
        isIn = false;
        var node = this.VariableStatement();
        isIn = inStack.pop();
        return node;
    }


    function ConstClassDeclaration() {
        match("const");
        return this.ClassDeclaration(false, true);
    }

    function ClassDeclaration(isExpr, isConst) {
        var node, m;
        if (v === "class") {
            //pushDecls();
            node = Node("ClassDeclaration");
            node.id = null;
            node.strict = true;
            node.expression = !! isExpr;
            node.const = !! isConst;
            node.extends = null;
            node.elements = [];

            pushStrict(true);

            match("class");
            var id = this.Identifier();
            node.id = id.name;
            if (v === "extends") {
                match("extends");
                node.extends = this.AssignmentExpression();
            }
            match("{");
            while (v !== "}") {
                m = this.MethodDefinition();
                node.elements.push(m);
            }
            match("}");

            popStrict();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function MethodDefinition(isObjectMethod, computedPropertyName) {
        var l1, l2;
        var node;

        var isStaticMethod = false;
        var isGenerator = false;
        var isGetter = false;
        var isSetter = false;
        var specialMethod = false;


        if (v === "}") return null; // end of the class body, or the object body

        l1 = loc.start;

        if (v === ";") {
            if (!isObjectMethod) match(";");
            else throw new SyntaxError("invalid ; in object literal");
        }


        if (v === "static") {
            if (!isObjectMethod) {
                isStaticMethod = true;
                match(v);
            } else throw new SyntaxError("static is not allowed in objects");
        }


        if (v === "*") {
            isGenerator = true;
            match(v);
        } else if (v === "get") {
            isGetter = true;
            match(v);
            // get c() {}
        } else if (v === "set") {
            isSetter = true;
            match(v);
            // set c() {}
        }


        node = Node("MethodDefinition");

        nodeStack.push(currentNode);
        currentNode = node;


        if (computedPropertyName) {
            node.id = computedPropertyName;
            node.computed = true;
        } else if (v =="[") {
            node.id = this.ComputedPropertyName();
            node.computed = true;
        } else {
            node.id = this.PropertyKey();
        }

        if (isStrict && ForbiddenArgumentsInStrict[node.id.name]) throw new SyntaxError(node.id.name + " is not a valid method identifier in strict mode");
        node.generator = isGenerator;
        if (!isObjectMethod) node.static = isStaticMethod;

        if (isGetter) node.kind = "get";
        else if (isSetter) node.kind = "set";

        match("(");
        node.params = this.FormalParameterList();
        match(")");
        match("{");
        node.body = this.FunctionBody(node);
        match("}");

        l2 = loc.end;
        node.loc = makeLoc(l1, l2);
        currentNode = nodeStack.pop();

        if (compile) return compiler(node);
        return node;

    }
    function RestParameter() {
        if (v === "...") {
            var l1 = loc.start;
            match("...");
            var node = Node("RestParameter");
            node.id = v;
            if (t !== "Identifier") {
                throw new SyntaxError("invalid rest parameter, identifier expected");
            }
            if (isStrict && ForbiddenArgumentsInStrict[v]) {
                throw new SyntaxError(v + " is not a valid rest identifier in strict mode");
            }
            match(v);
            var l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function SpreadExpression() {
        if (v === "...") {
            var l1 = loc.start;
            match("...");
            var node = Node("SpreadExpression");
            node.argument = this.AssignmentExpression();
            var l2 = node.argument && node.argument.loc && node.argument.loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function DefaultParameter() { // ES6
        var node;
        if (t == "Identifier" && lkhdVal == "=") {
            var l1 = loc.start;
            node = Node("DefaultParameter");
            var id = this.Identifier();
            node.id = id.name;
            match("=");
            node.init = this.AssignmentExpression();
            node.loc = makeLoc(l1, loc.end);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function FormalParameterList() {
        var list = [];
        list.type = "FormalParameterList";
        var id;
        if (v && v != ")")
            do {
                if (v === "...") {
                    id = this.RestParameter();
                    list.push(id);
                } else if (StartBinding[v]) {
                    id = this.BindingPattern();
                    list.push(id);
                } else if (t === "Identifier") {
                    if (lkhdVal == "=") {
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
                    match(",");
                } else if (v !== undefined && v !== ")") {
                    throw new SyntaxError("error parsing formal parameter list "+atLineCol());
                }
            } while (v !== undefined && v !== ")");
        return list;
    }
    function FunctionDeclaration(isExpr) {
        var node, start, end, sourceStart, sourceEnd;
        if (v === "function") {
            defaultStack.push(isDefaultId);
            isDefaultId = true;
            start = loc.start;
            match("function");
            if (v === "*") {
                node = Node("GeneratorDeclaration");
                node.generator = true; // i am a legacy man :) (otherwise my node.type is violating the parser api)
                match("*");
            } else {
                node = Node("FunctionDeclaration");
                node.generator = false;
            }
            nodeStack.push(currentNode);
            currentNode = node;
            node.id = null;
            node.params = [];
            node.expression = !!isExpr;
            node.strict = isStrict;
            node.body = [];
            var id;
            if (v !== "(") {
                id = this.Identifier();
                node.id = id.name;
            } else {
                if (!node.expression) {
                    throw new SyntaxError("Function and Generator Declarations must have a name [only expressions can be anonymous]");
                }
            }
            symtab.newScope();
            match("(");
            node.params = this.FormalParameterList();
            match(")");
            if (!node.generator) {
                yieldStack.push(isYieldId);
                isYieldId = true;
            } else {
                yieldStack.push(isYieldId);
                isYieldId = false;
                node.strict = true;
            }
            //pushDecls();
            match("{");
            node.body = this.FunctionBody(node);
            match("}");
            //popDecls(node);
            isYieldId = yieldStack.pop();
            end = loc.end;
            node.loc = makeLoc(start, end);
            if (node.generator) {
                node.nodesById = CreateTablePlusAddParentPointerIds(node);
            }
            isDefaultId = defaultStack.pop();
            currentNode = nodeStack.pop();
            symtab.oldScope();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function FunctionExpression() {
        return this.FunctionDeclaration(true);
    }
    function GeneratorBody(parent) {
        yieldStack.push(isYieldId);
        isYieldId = false;
        var body = this.FunctionBody(parent);
        isYieldId = yieldStack.pop();
        return body;
    }
    function FunctionBody(parent) {
        var contains = Contains["FunctionDeclaration"];
        var node;
        var body = [];
        body.type = "FunctionStatementList";
        if (v === "}") return body;
        pushStrict(this.DirectivePrologue(parent, body) || isStrict);
        while (v !== undefined && v !== "}") {
            switch (v) {
                case "function": node = this.FunctionDeclaration(); break;
                case "module": node = this.ModuleDeclaration(); break;
                case "class": node = this.ClassDeclaration(); break;
                default: node = this.Statement(); break;
            }
            if (node) {
                if (!contains[node.type]) body.push(node);
                else throw new SyntaxError("contains: "+node.type+" is not allowed in a functionBody");
            }
        }
        popStrict();
        return body;
    }
    function ConciseBody(parent) {
        if (v == "{") {
            var body;
            yieldStack.push(isYieldId);
            isYieldId = true;
            match("{");
            body = this.FunctionBody(parent);
            match("}");
            isYieldId = yieldStack.pop();
            return body;
        }
        return this.AssignmentExpression();
    }
    function CreateTablePlusAddParentPointerIds (node, parent, nodeTable) {
        nodeTable = nodeTable || Object.create(null);
        if (Array.isArray(node)) {
            for (var i = 0, j = node.length; i < j; i++) {
                CreateTablePlusAddParentPointerIds(node[i], parent, nodeTable);
            }
            return nodeTable;
        }
        else if (typeof node === "object" && node != null && node.loc) {
            if (parent) {
                node.parent = parent["_id_"];
                nodeTable["_id_"] = parent;
            }
            Object.keys(node).forEach(function (key) {
                if (typeof node[key] != "object" || !node || key === "parent" || key === "loc" || key == "extras") return;
                CreateTablePlusAddParentPointerIds(node[key], node, nodeTable);
            });
        }
        return nodeTable;
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
    function BlockStatement() {
        if (v === "{") {
            symtab.newBlock();
            var l1, l2;
            l1 = loc.start;
            var node = Node("BlockStatement");
            defaultStack.push(isDefaultId);
            isDefaultId = true;
            //pushLexOnly();
            match("{");
            node.body = this.StatementList();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            isDefaultId = defaultStack.pop();
            match("}");
            symtab.oldBlock();
            //popLexOnly(node);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function BreakStatement() {
        if (v === "break") {
            var node, l1, l2;
            l1 = loc.start;
            node = Node("BreakStatement");
            match("break");
            if (v !== ";") {
                if (ltPassedBy) {
                    l2 = loc.start;
                    node.loc = makeLoc(l1,l2);
                    return node;

                }
                if (t === "Identifier") {
                    var id = this.Identifier();
                    node.label = id.name;
                }
            }
            semicolon();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ContinueStatement() {
        var node, l1, l2;
        if (v === "continue") {
            node = Node("ContinueStatement");
            l1 = loc.start;
            match("continue");
            if (v !== ";") {
                if (ltPassedBy) {
                    l2 = loc.start;
                    node.loc = makeLoc(l1,l2);
                    return node;
                }
                if (t === "Identifier") {
                    var id = this.Identifier();
                    node.label = id.name;
                }
            }
            semicolon();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
    }
    function ReturnStatement() {
        var node, l1, l2;
        if (v === "return") {
            l1 = loc.start;
            node = Node("ReturnStatement");
            if (withExtras && tokenize.extraBuffer.length) dumpExtras2(node, "before");
            match("return");
            if (withExtras && tokenize.extraBuffer.length) dumpExtras2(node, "after");
            if (v !== ";") {
                if (ltPassedBy) {
                    l2 = loc.end;
                    node.loc = makeLoc(l1, l2);
                    return node;
                }
                node.argument = this.Expression();
            }
            semicolon();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ThrowStatement() {
        if (v === "throw") {
            var node, l1, l2;
            node = Node("ThrowStatement");
            l1 = loc.start;
            match("throw");
            if (v !== ";") {
                if (ltPassedBy) {
                    l2 = loc.end;
                    node.loc = makeLoc(l1, l2);
                    return node;
                }
                else node.argument = this.Expression();
            } else semicolon();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function LabelledStatement() {
        if (t === "Identifier" && lkhdVal === ":") {
            var node = Node("LabelledStatement");
            var l1 = loc.start;
            var label = this.Identifier();
            node.label = label.name;
            match(":");
            var stmt = this.Statement();
            if (!IsIteration[stmt.type]) {
                throw new SyntaxError("A LabelledStatement must be an Iteration Statement");
            }
            node.statement = stmt;
            var l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function TryStatement() {
        if (v === "try") {
            var node = Node("TryStatement");
            var l1, l2;
            l1 = loc.start;
            match("try");
            node.handler = this.Statement();
            if (v === "catch") node.guard = this.Catch();
            if (v === "finally") node.finalizer = this.Finally();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function Catch() {
        if (v === "catch") {
            var node, l1, l2;
            node = Node("CatchClause");
            l1 = loc.start;
            match("catch");
            match("(");
            node.params = this.FormalParameterList();
            match(")");
            node.block = this.Statement();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function Finally() {
        if (v === "finally") {
            var node, l1, l2;
            l1 = loc.start;
            var node = Node("Finally");
            match("finally");
            node.block = this.Statement();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function WithStatement() {
        if (v === "with") {
            if (isStrict) {
                throw new SyntaxError("with not allowed in strict mode" + atLineCol());
            }
            var node = Node("WithStatement");
            var l1 = loc.start;
            if (withExtras) dumpExtras(node, "with", "before");
            match("with");
            if (withExtras) dumpExtras(node, "with", "after");
            match("(");
            node.object = this.Expression();
            match(")");
            node.body = this.BlockStatement();
            var l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function DebuggerStatement() {
        if (v === "debugger") {
            var node, l1, l2;
            node = Node("DebuggerStatement");
            l1 = loc.start;
            match("debugger");
            semicolon();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ModuleDeclaration() {
        if (v === "module") {
            var node, l1, l2;
            l1 = loc.start;
            //pushDecls();
            symtab.newScope();
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
            match("module");
            node.id = this.ModuleSpecifier();
            node.body = this.ModuleBody(node);
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            //popDecls(node);
            // EarlyErrors(node);
            currentNode = nodeStack.pop();
            currentModule =  moduleStack.pop();
            symtab.oldScope();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ModuleSpecifier() {
        if (t === "StringLiteral") {
            var specifier = v.slice(1, v.length - 1);
            match(v);
            return specifier;
        }
        throw new SyntaxError("can not make out ModuleSpecifier");
    }
    function ModuleBody() {
        var list = [];
        match("{");
        var item;
        while (v !== undefined && v !== "}") {
            switch (v) {
                case "export": item = this.ExportStatement();
                    break;
                case "module": item = this.ModuleDeclaration();
                    break;
                case "import": item = this.ImportStatement();
                    break;
                default:
                    item = this.Statement();
                    break;
            }
            if (item) {
                if (!Contains.ModuleDeclaration[item.type]) list.push(item);
                else throw new SyntaxError("contains: "+item.type+" not allowed in ModuleDeclarations" + atLineCol());
            }
        }
        match("}");
        return list;
    }
    function FromClause() {
        match("from");
        var frm = this.ModuleSpecifier();
        return frm;
    }
    function ImportClause() {
        var node = Node("ImportClause");
        var id = this.Identifier();
        node.id = id;
        if (id) {
            if (v === ",") {
                match(v);
                var node2 = this.NamedImports();
                node.named = node2;
            }
        }
        if (compile) return compiler(node);
        return node;
    }
    function NamedImports() {
        if (v === "{") {
            var list = [];
            while (v && v !== "}") {
                var node = Node("ImportSpecifier");
                node.id = this.Identifier();
                if (v === "as") {
                    match("as");
                    node.target = this.Identifier();
                }
                list.push(node);
                if (v === ",") {
                    match(",");

                } else {
                    throw new SyntaxError("BindingElement did not terminate with a , or }" + atLineCol());
                }
            }
            return list;
        }
        return null;
    }
    function ImportStatement() {
        if (v === "import") {
            var l1 = loc.start;
            var l2;
            var node = Node("ImportStatement");
            match("import");
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
                    } else if (t = "Identifier") {
                        imp = this.Identifier();
                        if (imp) list.push(imp);
                    } else if (v === ",") {
                        match(",");
                    } else if (v !== "from") {
                        throw new SyntaxError("invalid import statement" + atLineCol());
                    }
                }
            }
            node.from = this.FromClause();
            semicolon();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ExportsClause() {
        if (v === "{") {
            var list = [];
            while (v && v !== "}") {
                var node = Node("ExportsSpecifier");
                node.id = this.Identifier();
                if (v === "as") {
                    match("as");
                    node.target = this.Identifier();
                }
                currentNode.moduleRequests.push(node);
                list.push(node);
                if (v === ",") {
                    match(",");
                } else {
                    throw new SyntaxError("BindingElement did not terminate with a , or }" + atLineCol());
                }
            }
            return list;
        }
        return null;
    }
    function DeclarationDefault() {
        defaultStack.push(isDefaultId);
        isDefaultId = true;
        var node = this.FunctionDeclaration();
        isDefaultId = defaultStack.pop();
        return node;
    }
    function ExportStatement() {
        if (v === "export") {
            var l1 = loc.start;
            var l2;
            var node = Node("ExportStatement");
            match("export");
            if (v === "default") {
                match("default");
                node.default = true;
                node.exports = this.AssignmentExpression();
            } else if (v === "*") {
                node.all = true;
                match(v);
                node.from = this.FromClause();
            } else {
                node.exports = this.ExportsClause();
                if (node.exports) node.from = this.FromClause();
                else node.exports = this.VariableStatement() || this.DeclarationDefault();
                var names = BoundNames(node.exports);
                for (var i = 0, j = names.length; i < j; i++) {
                    var name = names[i];
                    currentModule.exportEntries.push({ ModuleRequest: null, ImportName: null, LocalName: name, ExportName: name });
                }
                if (!node.exports) throw new SyntaxError("should be an error in the export statement");
            }
            l2 = loc.end;
            makeLoc(l1, l2);
            semicolon();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function SwitchStatementList() {
        var list = [];
        list.type = "StatementList";
        list.switch = true;
        var s;
        if (v)
            do {
                list.push(this.Statement());
            } while (!FinishSwitchStatementList[v] && v != undefined );
        return list;
    }
    function StatementList() {
        var list = [];
        list.type = "StatementList";
        var s;
        if (v)
            do {
                list.push(this.Statement());
            } while (!FinishStatementList[v] && v != undefined);
        return list;
    }
    function Statement() {
        var node;
        var fn = this[StatementParsers[v]];
        if (fn) node = fn.call(this);
        if (!node) {
            if (t === "Identifier" && lkhdVal == ":") node = this.LabelledStatement();
            else node = this.ExpressionStatement();
        }


        if (!node && (v === "function")) {
            if (isStrict)
                throw new SyntaxError("FunctionDeclarations are not allowed outside of the Top-Level in strict mode");
            else node = this.FunctionDeclaration();
        }


        semicolon();
        if (compile) return compiler(node);
        return node;
    }
    function IterationStatement() {
        if (v === "for") return this.ForStatement();
        if (v === "do") return this.DoWhileStatement();
        if (v === "while") return this.WhileStatement();
        return null;
    }
    function ForDeclaration() {
        var node;
        if (LetOrConst[v]) {
            var l1 = loc.start;
            var l2;
            node = Node("ForDeclaration");
            node.kind = v;
            match(v);
            node.id = this.ForBinding();
            l2 = loc.end;
            node.loc = makeLoc(l1,l2);
            if (v != "in" && v != "of") {
                throw new SyntaxError("invalid token '"+v+"' after let or const declaration at the for statement "+atLineCol() );
            }
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function ForBinding() {
        switch (v) {
            case "{":
            case "[":
                return this.BindingPattern();
            default:
                return this.Identifier();
        }
        return null;
    }
    function ForStatementHead() {
        var node = Node("ForStatement");
        if (v === ";") {
            node.init = null;
            match(";");
        } else {
            if (v === "var") {
                node.init = this.VariableStatementNoIn();
            } else if (LetOrConst[v]) {
                node.init = this.VariableStatementNoIn();
            } else {
                node.init = this.ExpressionNoIn();
                match(";")
            }
        }
        if (v === ";") {
            node.test = null;
            match(";");
        } else {
            node.test = this.Expression();
            match(";");
        }
        if (v === ")") node.update = null;
        else node.update = this.Expression();
        return node;
    }
    function ForInOfStatementHead() {
        var node = Node("ForInOfStatement");
        if (v === "var") {
            match("var");
            node.left = this.ForBinding();
        } else if (LetOrConst[v]) {
            node.left = this.ForDeclaration();
        } else {
            node.left = this.LeftHandSideExpression();
        }
        if (!node.left) throw new SyntaxError("can not parse a valid lefthandside expression for for statement");
        if (v === "in") {
            node.type = "ForInStatement";
            match("in");
            node.right = this.Expression();
        } else if (v === "of") {
            node.type = "ForOfStatement";
            match("of");
            node.right = this.AssignmentExpression();
        } else {
            throw new SyntaxError("in or of expected "+atLineCol());
        }
        if (!node.right) throw new SyntaxError("can not parse a valid righthandside expression for for statement");
        return node;
    }
    function ForStatement() {
        var node;
        var statement;
        var parens = [];
        var peek;
        var numSemi = 0;
        var hasInOf = false;
        var l1, l2;
        if (v === "for") {
            l1 = loc.start;
            match("for");
            match("(");
            /* predict */
            parens.push("(");
            var collected = [];
            loop:
                for (;;) {
                    peek = token && token.value;
                    switch(peek) {
                        case ";": numSemi += 1;
                            break;
                        case "in":
                        case "of":
                            hasInOf = peek;
                            break;
                        case "(":
                            parens.push("(");
                            break;
                        case ")":
                            parens.pop();
                            if (!parens.length) break loop;
                            break;
                        case undefined:
                            throw new SyntaxError("unexpeceted end of token stream");
                            break;
                    }
                    collected.push(token);
                    next();
                }
            /* parse */
            if (numSemi === 2) {
                node = parseGoal("ForStatementHead", collected);
            } else if (numSemi === 0 && hasInOf) {
                node = parseGoal("ForInOfStatementHead", collected);
            } else {
                throw new SyntaxError("invalid syntax in for statement");
            }
            match(")");
            node.body = this.Statement();
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function IfStatement() {
        if (v === "if") {
            var node = Node("IfStatement");
            match("if");
            match("(");
            node.test = this.Expression();
            match(")");
            node.consequent = this.Statement();
            if (v === "else") {
                match("else");
                node.alternate = this.Statement();
            }
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function WhileStatement() {
        if (v === "while") {
            var l1, l2;
            l1 = loc.start;
            var node = Node("WhileStatement");
            match("while");
            match("(");
            node.test = this.Expression();
            match(")");
            node.body = this.Statement();
            l2 = loc.end;
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function DoWhileStatement() {
        if (v === "do") {
            var l1, l2;
            l1 = loc.start;
            var node = Node("DoWhileStatement");
            match("do");
            node.body = this.Statement();
            match("while");
            match("(");
            node.test = this.Expression();
            match(")");
            l2 = loc.end;
            semicolon();
            node.loc = makeLoc(l1, l2);
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function SwitchStatement() {
        if (v === "switch") {
            defaultStack.push(isDefaultId);
            isDefaultId = false;
            var c;
            var node = Node("SwitchStatement");
            var l1 = loc.start;
            var l2;
            match("switch");
            match("(");
            node.discriminant = this.Expression();
            match(")");
            match("{");
            var cases = node.cases = [];
            while (v !== "}") {
                switch (v) {
                    case "case": cases.push(this.SwitchCase()); break;
                    case "default": cases.push(this.DefaultCase()); break;
                    default:
                        throw new SyntaxError("invalid statment in switch")
                }
            }
            match("}");
            l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            isDefaultId = defaultStack.pop();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function DefaultCase() {
        if (v === "default" && lkhdVal === ":") {
            var node = Node("DefaultCase");
            match("default");
            match(":");
            node.consequent = this.SwitchStatementList();
            semicolon();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function SwitchCase() {
        if (v === "case") {
            var node = Node("SwitchCase");
            match("case");
            node.test = this.Expression();
            match(":");
            node.consequent = this.SwitchStatementList();
            semicolon();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function EmptyStatement() {
        var node;
        if (v === ";") {
            node = Node("EmptyStatement");
            node.loc = makeLoc(loc.start, loc.end);
            //  dumpExtras2(node, "before");
            match(";");
            //   dumpExtras2(node, "after");
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function DirectivePrologue(containingNode, nodes) {
        var strict = false;
        while (t === "StringLiteral" && isDirective[v]) {
            if (isStrictDirective[v]) strict = containingNode.strict = true;
            else if (isAsmDirective[v]) containingNode.asm = true;
            var l1 = loc.start;
            var node = Node("Directive");
            node.value = v;
            match(v);
            var l2 = loc.end;
            node.loc = makeLoc(l1, l2);
            semicolon();
            if (compile) node = compiler(node);
            nodes.push(node);
        }
        return strict;
    }
    function SourceElements(program) {
        var body = [];
        var node;
        pushStrict(this.DirectivePrologue(program, body));
        var contains = Contains["Program"];
        do {
            switch (v) {
                case "function": node = this.FunctionDeclaration(); break;
                case "class": node = this.ClassDeclaration(); break;
                case "module": node = this.ModuleDeclaration(); break;
                default: node = this.Statement(); break;
            }
            if (node) {
                if (!contains[node.type]) body.push(node);
                else throw new SyntaxError("contains: "+node.type+" is not allowed in Program");
            } else {
                if (token != undefined)
                    throw new SyntaxError("unexpected token " + t + " with value " +v);
            }
        } while (token != undefined);
        popStrict();
        return body;
    }
    function Module() {
        var root = Node("Module");
        var l1 = loc.start;
        root.body = this.ModuleBody();
        root.strict = true;
        var l2 = loc.end;
        root.loc = makeLoc(l1, l2);
        if (compile) return compiler(root);
        return root;
    }
    function DefaultAsIdentifier() {
        if (v === "default") {
            if (isDefaultId) {
                var node = Node("Identifier");
                node.name = "default";
                node.loc = token && token.loc;
                match("default");
                if (compile) return compiler(node);
                return node;
            }
        }
        return null;
    }
    function Program() {
        var node = Node("Program");
        node.loc = loc = makeLoc();
        loc.start.line = 1;
        loc.start.column = 1;
        var l1 = loc.start;
        //pushDecls();
        currentNode = node;
        node.body = this.SourceElements(node);
        var l2;
        l2 = lastloc && lastloc.end;
        node.loc = makeLoc(l1, l2);
        if (compile) return compiler(node);
        return node;
    }
    function RegularExpressionLiteral() {
        if (t === "RegularExpressionLiteral") {
            var l1 = loc.start;
            var node = Node("RegularExpressionLiteral");
            node.value = v[0];
            node.flags = v[1];
            var l2 = loc.end;
            node.loc = makeLoc(l1,l2);
            next();
            if (compile) return compiler(node);
            return node;
        }
        return null;
    }
    function JSONText() {
        if (!newSyntaxError) {
            newSyntaxError = require("api").newSyntaxError;
            ifAbrupt = require("api").ifAbrupt;
            isAbrupt = require("api").isAbrupt;
        }
        return this.JSONValue();
    }
    function JSONValue() {
        return this.JSONObject() || this.JSONArray() || this.JSONNumber() || this.JSONString() || this.JSONBooleanLiteral() || this.JSONNullLiteral();
    }
    function JSONString() {
        if (t === "StringLiteral" || (t == "Literal" && typeof v == "string"))  {
            var q1, q2;
            q1 = v[0];
            q2 = v[v.length - 1];
            if (q1 !== "\"" || q2 !== "\"") return newSyntaxError("JSONString: Expecting double quoted strings.");
            var node = Node("JSONString");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    function JSONNumber() {
        if (t === "NumericLiteral" || (t == "Literal" && typeof v === "number")) {
            var node = Node("JSONNumber");
            node.value = v;
            next();
            return node;
        }
    }
    function JSONFraction() {
        return null;
    }
    function JSONNullLiteral() {
        if (t === "NullLiteral") {
            var node = Node("JSONNullLiteral");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    function JSONBooleanLiteral() {
        if (t === "BooleanLiteral") {
            var node = Node("JSONBooleanLiteral");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    function JSONArray() {
        if (v === "[") {
            var node = Node("JSONArray");
            match("[");
            var elements = this.JSONElementList();
            if (isAbrupt(elements = ifAbrupt(elements))) return elements;
            node.elements = elements;
            match("]");
            return node;
        }
        return null;

    }
    function JSONElementList() {
        var list = [];
        while (v !== "]" && v !== undefined) {
            var node = this.JSONValue();
            if (isAbrupt(node = ifAbrupt(node))) return node;
            if (node) list.push(node);
            else return newSyntaxError("JSONElementList: Error parsing Element");
            if (v === ",") match(",");
            else if (v === "]") break;
            else return newSyntaxError("JSONElementList: Invalid formatted literal. Comma or ] expected. Got " + v);
        }
        return list;
    }
    function JSONObject() {
        if (v === "{") {
            var node = Node("JSONObject");
            match("{");
            var properties = this.JSONMemberList();
            if (isAbrupt(properties = ifAbrupt(properties))) return properties;
            node.properties = properties;
            match("}");
            return node;
        }
        return null;
    }
    function JSONMember() {
        var node = Node("JSONMember");
        var key = this.JSONString();
        if (!key) return newSyntaxError( "JSONMember: Expecting double quoted string keys in object literals.");
        if (isAbrupt(key = ifAbrupt(key))) return key;
        match(":");
        var value = this.JSONValue();
        if (isAbrupt(value = ifAbrupt(value))) return value;
        node.key = key;
        node.value = value;
        return node;
    }
    function JSONMemberList() {
        var list = [];
        while (v !== "}" && v !== undefined) {
            var node = this.JSONMember();
            if (isAbrupt(node = ifAbrupt(node))) return node;
            if (node) list.push(node);
            else return newSyntaxError("JSONMemberList: Error parsing Member");
            if (v === ",") match(",");
            else if (v === "}") break;
            else return newSyntaxError("JSONMemberList: Invalid formatted literal. Comma or } expected. Got: " + v);
        }
        return list;
    }
    function initOldLexer(sourceOrTokens, opts) {
        if (!Array.isArray(sourceOrTokens)) tokens = tokenize.tokenizeIntoArray(sourceOrTokens);
        else tokens = sourceOrTokens;
        if (typeof opts == "object" && opts) {
            if (opts.builder) {
                compile = true;
                builder = opts.builder;
                compiler = opts.builder.build;
            }
        }
        nextToken = nextToken__array__;
        pos = -1;
        lookPos = 0;
        token = t = v = undefined;
        tokenArrayLength = tokens.length;
        ast = null;
        loc = lastloc = undefined;
        currentNode = undefined;
        symtab = SymbolTable();
        nextToken(); // load lookahead
        next();     // move lookahead and get new
    }

    function initNewLexer(sourceOrTokens, opts) {
        currentNode = loc = lastloc = pos = t = v = token = lkhdTok = lkhdVal = lkhdTyp = undefined;
        ast = null;
        symtab = SymbolTable();
        if (typeof opts == "object" && opts) {
            if (opts.builder) {
                compile = true;
                builder = opts.builder;
            }
        }
        if (sourceOrTokens != undefined) {
            if (Array.isArray(sourceOrTokens)) {
                initOldLexer(sourceOrTokens, opts);
            } else {
                nextToken = nextToken__step__;
                lkhdTok = tokenize(sourceOrTokens);
                next();
            }
        }
    }
    function parse(sourceOrTokens, opts) {
        tokenize.saveState();
        if (tokenize === tokenize.tokenizeIntoArray) initOldLexer(sourceOrTokens, opts);
        else initNewLexer(sourceOrTokens, opts);
        try {
            ast = parser.Program();
        } catch (ex) {
            console.log("[ParserException@parse]: " + ex.name + " "+atLineCol());
            console.log(ex.message);
            console.log(ex.stack);
            ast = ex;
        } finally {
            tokenize.restoreState();
        }
        return ast;
    }
    function initParseGoal(source) {
        initOldLexer(source);
    }
    function parseGoal(goal, source, opts) {
        tokenize.saveState();
        saveTheDot();
        initOldLexer(source, opts);
        var fn = parser[goal];
        if (!fn) throw "Sorry, got no parser for " + goal;
        try {
            var node = fn.call(parser);
        } catch (ex) {
            console.log("[ParserException@parseGoal]: " + ex.name + " " +atLineCol());
            console.log(ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            node = ex;
        } finally {
            restoreTheDot();
            tokenize.restoreState();
        }
        return node;
    }

    parser.ExpressionStatement = ExpressionStatement;
    parser.StartAssignmentExpression = StartAssignmentExpression;
    parser.StartAssignmentExpressionNoIn = StartAssignmentExpressionNoIn;
    parser.ConstClassDeclaration = ConstClassDeclaration;
    parser.JSONText = JSONText;
    parser.JSONValue = JSONValue;
    parser.JSONString = JSONString;
    parser.JSONNumber = JSONNumber;
    parser.JSONFraction = JSONFraction;
    parser.JSONNullLiteral = JSONNullLiteral;
    parser.JSONBooleanLiteral = JSONBooleanLiteral;
    parser.JSONArray = JSONArray;
    parser.JSONElementList = JSONElementList;
    parser.JSONObject = JSONObject;
    parser.JSONMember = JSONMember;
    parser.JSONMemberList = JSONMemberList;
    parser.ConditionalExpressionNoIn = ConditionalExpressionNoIn;
    parser.ConditionalExpression = ConditionalExpression;
    parser.LeftHandSideExpression = LeftHandSideExpression;
    parser.Expression = Expression;
    parser.PrimaryExpression = PrimaryExpression;
    parser.PostfixExpression = PostfixExpression;
    parser.UnaryExpression = UnaryExpression;
    parser.YieldExpression = YieldExpression;
    parser.YieldStatement = YieldExpression;
    parser.DefaultAsIdentifier = DefaultAsIdentifier;
    parser.YieldAsIdentifier = YieldAsIdentifier;
    parser.AssignmentExpression = AssignmentExpression;
    parser.SuperExpression = SuperExpression;
    parser.ThisExpression = ThisExpression;
    parser.Initializer = Initializer;
    parser.BindingElementList = BindingElementList;
    parser.BindingPattern = BindingPattern;
    parser.VariableDeclaration = VariableDeclaration;
    parser.VariableDeclarationList = VariableDeclarationList;
    parser.VariableStatement = VariableStatement;
    parser.Expression = Expression;
    parser.ExpressionNoIn = ExpressionNoIn;
    parser.AssignmentExpressionNoIn = AssignmentExpressionNoIn;
    parser.ParenthesizedExpression = ParenthesizedExpression;
    parser.ArrowParameterList = ArrowParameterList;
    parser.CoverParenthesizedExpressionAndArrowParameterList = CoverParenthesizedExpressionAndArrowParameterList;
    parser.ConciseBody = ConciseBody;
    parser.CoverParenthesizedExpression = CoverParenthesizedExpression;
    parser.Literal = Literal;
    parser.Identifier = Identifier;
    parser.ClassExpression = ClassExpression;
    parser.TemplateLiteral = TemplateLiteral;
    parser.Elision = Elision;
    parser.ElementList = ElementList;
    parser.ArrayExpression = ArrayExpression;
    parser.StrictFormalParameters = StrictFormalParameters;
    parser.PropertyDefinitionList = PropertyDefinitionList;
    parser.ComputedPropertyName = ComputedPropertyName;
    parser.PropertyKey = PropertyKey;
    parser.ObjectExpression = ObjectExpression;
    parser.MemberExpression = MemberExpression;
    parser.Arguments = Arguments;
    parser.CallExpression = CallExpression;
    parser.NewExpression = NewExpression;
    parser.ComprehensionForList = ComprehensionForList;
    parser.ComprehensionFilters = ComprehensionFilters;
    parser.ArrayComprehension = ArrayComprehension;
    parser.GeneratorComprehension = GeneratorComprehension;
    parser.SequenceExpressionNode = SequenceExpressionNode;
    parser.GeneratorBody = GeneratorBody;
    parser.FunctionBody = FunctionBody;
    parser.MethodDefinition = MethodDefinition;
    parser.ClassDeclaration = ClassDeclaration;
    parser.RestParameter = RestParameter;
    parser.SpreadExpression = SpreadExpression;
    parser.DefaultParameter = DefaultParameter;
    parser.FormalParameterList = FormalParameterList;
    parser.FunctionExpression = FunctionExpression;
    parser.FunctionDeclaration = FunctionDeclaration;
    parser.BlockStatement = BlockStatement;
    parser.ContinueStatement = ContinueStatement;
    parser.BreakStatement = BreakStatement;
    parser.ReturnStatement = ReturnStatement;
    parser.WithStatement = WithStatement;
    parser.ThrowStatement = ThrowStatement;
    parser.LabelledStatement = LabelledStatement;
    parser.TryStatement = TryStatement;
    parser.Catch = Catch;
    parser.Finally = Finally;
    parser.DebuggerStatement = DebuggerStatement;
    parser.ModuleDeclaration = ModuleDeclaration;
    parser.ModuleSpecifier = ModuleSpecifier;
    parser.ModuleBody = ModuleBody;
    parser.FromClause = FromClause;
    parser.ImportClause = ImportClause;
    parser.NamedImports = NamedImports;
    parser.ImportStatement = ImportStatement;
    parser.ExportsClause = ExportsClause;
    parser.DeclarationDefault = DeclarationDefault;
    parser.ExportStatement = ExportStatement;
    parser.StatementList = StatementList;
    parser.SwitchStatementList = SwitchStatementList;
    parser.Statement = Statement;
    parser.IterationStatement = IterationStatement;
    parser.ForStatement = ForStatement;
    parser.ForDeclaration = ForDeclaration;
    parser.ForBinding = ForBinding;
    parser.VariableStatementNoIn = VariableStatementNoIn;
    parser.SourceElements = SourceElements;
    parser.EmptyStatement = EmptyStatement;
    parser.DirectivePrologue = DirectivePrologue;
    parser.Module = Module;
    parser.Program = Program;
    parser.RegularExpressionLiteral = RegularExpressionLiteral;
    parser.ForStatement = ForStatement;
    parser.WhileStatement = WhileStatement;
    parser.IfStatement = IfStatement;
    parser.DoWhileStatement = DoWhileStatement;
    parser.SwitchStatement = SwitchStatement;
    parser.DefaultCase = DefaultCase;
    parser.SwitchCase = SwitchCase;
    parser.ForStatementHead = ForStatementHead;
    parser.ForInOfStatementHead = ForInOfStatementHead;

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
    //   exports.makeParser = makeParser;
    return exports;
    // }
    // return makeParser();
});


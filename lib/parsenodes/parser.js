
define("parser", function () {


    function makeParser() {
        "use strict";
//    var i18n = require("i18n-messages");
        var tables = require("tables");
        var tokenize = require("tokenizer").tokenizeIntoArray; // removing fails a couple of tests, but NOT even the half (i´m close)
        var EarlyErrors = require("earlyerrors").EarlyErrors;
        var Contains = require("earlyerrors").Contains;
        var SymbolTable = require("symboltable").SymbolTable;
        var symtab;
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
        var ast;
        var ltNext;
        var ltLast;
        var gotSemi;
        var tokens;
        var token = Object.create(null);
        var lookaheadToken;
        var lookahead, lookaheadType;
        var t; // current token type
        var v; // current token value
        var pos; // tokens[pos] pointer     (array version)
        var tokenArrayLength; // tokens.length;        (array version)
        var parser = Object.create(null);
        var noInStack = [];
        var isNoIn = false;
        var yieldStack = [];
        var yieldIsId = true;
        var defaultStack = [];
        var defaultIsId = true;
        var generatorParameter = false;
        var generatorParameterStack = [];
        var strictStack = [];
        var isStrict = false;
        var currentNode;
        var nodeStack = [];
        var currentModule;
        var moduleStack = [];
        var loc = makeLoc();
        var text;
        var compile = false;
        var builder = null;
        var cb;
        var notify = false;
        var stateStack = [];
        var state = "";
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
        var BoundNames = require("slower-static-semantics").BoundNames;
        var nodeId = 1;

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
        var withExtras = false;
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
        function startLoc() {
            return loc && loc.start;
        }
        function endLoc(node, l1) {
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
        }
        function Assert(test, message) {
            if (!test) throw new Error(message);
        }
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
            noInStack.push(isNoIn);
            isNoIn = new_state;
        }
        function popNoIn() {
            isNoIn = noInStack.pop();
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
        /*
            the other variant to use and parse with precedence is
            to collect in a loop while the precedence is
            equal and the move through the other operators
            like in the grammar there is a long list to go upwards
            (with a while each)
            each time a new node is made and hung into the tree,
            if the precedence is higher, the nodes are rotated

         */

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
        function stringifyTokens(array) {
            var string = "";
            for (var i = 0, j = array.length; i < j; i++) {
                string += array[i].value;
            }
            return string;
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
        function atLineCol() {
            var line = loc && loc.start.line;
            var column = loc && loc.start.column;
            return " at line "+line+", column "+column;
        }
        function unquote(str) {
            return ("" + str).replace(/^("|')|("|')$/g, ""); //'
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
                throw new TypeError("objBuilder ist a Mozilla Parser-API compatible Builder Object for Code Generation from the AST, see http://developers.mozilla.org/en-US/docs/SpiderMonkey/Parser_API for more how to use..");
            }
            builder = objBuilder;
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
            return lookahead === undefined;
        }
        var next = next_from_array; // stepwise_next;
        function stepwise_next() {
            if (lookahead) {
                token = lookaheadToken;
                if (token) {
                    t = token.type;
                    v = token.value;
                }
                lookaheadToken = tokenize.nextToken();
                if (lookaheadToken) {
            	    ltLast = ltNext;
                    lookahead = lookaheadToken.value;
                    lookaheadType = lookaheadToken.type;
                    ltNext = tokenize.ltNext;
                } else {
                    lookaheadToken = lookahead = lookaheadType = undefined;
                    ltNext = false;
                }
                return token;
            }
            token = t = v = lookahead = lookaheadType = lookaheadToken = undefined;
            return undefined;
        }

        function next_from_array() {
            if (pos < tokenArrayLength) {
                pos += 1;
                token = tokens[pos];
                if (token) {
                    t = token.type;
                    //if (withExtras && captureExtraTypes[t]) extraBuffer.push(token);
                    v = token.value;
                    //if (withExtras && captureExtraValues[v]) extraBuffer.push(token);
                    if (SkipableToken[t]) return next();
                    loc = token.loc;
                    lookahead = nextTokenFromArray();
                    return token;
                }
            }
            return token = v = t = undefined;
        }
        function nextTokenFromArray() {
            var lookahead;
            var b = 0;
            var t;
            ltLast = ltNext;
            ltNext = false;
            for(;;) {
                b++;
                t = tokens[pos + b];
                if (t === undefined) return undefined;
                lookahead = t.value;
                lookaheadType = t.type;
                if (lookaheadType === "LineTerminator") {
                    ltNext = true;
                }
                if (SkipableToken[lookaheadType]) continue;
                break;
            }
            return lookahead;
        }
        function hasNext() {
            return lookahead != undefined;
        }
        function nextToken () {
            return tokenizer.next();
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
        function Node(type /*, linkToken*/ ) {
            var node = Object.create(null);
            //nodeTable[
            node._id_ = ++nodeId;
            //] = node;
            // staticSemantics.put(type);
            node.type = type;
            return node;
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
                next: next,
                lookahead: lookahead,
                lookaheadType: lookaheadType,
                isNoIn: isNoIn,
                yieldIsId: yieldIsId,
                defaultIsId: defaultIsId,
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
                next = memento.next;
                lookahead = memento.lookahead;
                lookaheadType = memento.lookaheadType;
                isNoIn = memento.isNoIn;
                yieldIsId = memento.yieldIsId;
                defaultIsId = memento.defaultIsId;
                yieldStack = memento.yieldStack;
                defaultStack = memento.defaultStack;
                //         nodeTable = memento.nodeTable;
            }
        }
        function dropPositions() {
            return positions.pop();
        }
        function Literal() {
            var node;
            if (IsAnyLiteral[t]) {
                node = Node(t);
                node.longName = token.longName;
                node.value = v;
                node.computed = token.computed;
                node.loc = makeLoc(loc && loc.start, loc && loc.end);
                match(v);
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
                match(v);
                if (compile) return builder["identifier"](node.name, loc);
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
                l1 = loc && loc.start;
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
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                match("]");
                EarlyErrors(node);
                if (compile) return builder.comprehensionExpression(node.blocks, node.filter, node.expression, node.loc);
                return node;
            }
            return null;
        }
        function GeneratorComprehension() {
            var node;
            if (v === "(") {
                var l1, l2;
                l1 = loc && loc.start;
                node = Node("GeneratorComprehension");
                match("(");
                node.blocks = this.ComprehensionForList();
                node.filter = [];
                while (v == "if") {
                    match("if");
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
        function YieldAsIdentifier() {
            if (v === "yield") {
                if (yieldIsId) {
                    var node = Node("Identifier");
                    node.name = "yield";
                    node.loc = token && token.loc;
                    match("yield");
                    return node;
                }
            }
            return null;
        }
        function YieldExpression() {
            if (v === "yield" && !yieldIsId) {
                match("yield");
                var node = Node("YieldExpression");
                node.argument = this.Expression();
                return node;
            }
            return null;
        }
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
                match(v);
                return compile ? builder["templateLiteral"](node.spans, node.loc) : node;
            }
            return null;
        }
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
                match(v);
                return compile ? builder["elision"](node.value, node.loc) : node;
            }
            return null;
        }
        function ElementList() {
            var list = [], el;
            if (v === "]") return list;
            do {
                if (v === "," && lookahead == ",") {
                    el = null;
                    do {
                        el = this.Elision(el);
                    } while (v === ",");
                    list.push(el);
                }
                if (v === "]") break;
                if (el = this.SpreadExpression() || this.AssignmentExpression()) list.push(el);
//                if (!el && v != undefined) throw new SyntaxError("illegal statement in element list");
                if (v === "," && lookahead !== ",") match(",");
            } while (v && v !== "]");
            return list;
        }
        function ArrayExpression() {
            var node, l1, l2;
            if (v === "[") {
                l1 = loc && loc.start;
                if (lookahead === "for") return this.ArrayComprehension();
                match("[");
                var node = Node("ArrayExpression");
                node.elements = this.ElementList();
                l2 = loc && loc.end;
                match("]");
                node.loc = makeLoc(l1, l2);
                return compile ? builder["arrayExpression"](node.elements, node.loc) : node;
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
            var node;
            node = this.ComputedPropertyName() || this.Identifier() || this.Literal();
            if (!node && (Keywords[v])) {
                node = Node("Identifier");
                node.name = v;
                node.loc = token && token.loc;
            }
            if (node) return node;

            throw new SyntaxError("invalid property key in definition"+atLineCol());

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

                        } else if (lookahead === ":") { // key: AssignmentExpression

                            node.kind = "init";
                            node.key = this.PropertyKey();
                            match(":");
                            node.value = this.AssignmentExpression();
                            if (!node.value) throw new SyntaxError("error parsing objectliteral := propertykey : assignmentexpression");
                            list.push(node);

                        } else if (computedPropertyName && v == "(") {

                            node.kind = "method";
                            method = this.MethodDefinition(parent, true, computedPropertyName);
                            if (!method) throw new SyntaxError("Error parsing method definition in ObjectExpression"+atLineCol());
                            node.key = method.id;
                            node.computed = method.computed;
                            node.value = method;
                            list.push(node);

                        } else if (((v == "[" || BindingIdentifiers[t] || v === "constructor") && lookahead === "(") || (v === "*" && (lookahead == "[" || BindingIdentifiers[lookaheadType] || lookahead === "constructor"))) {

                            node.kind = "method";
                            method = this.MethodDefinition(parent, true);
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

                l1 = loc && loc.start;
                node = Node("ObjectExpression");
                node.properties = [];
                match("{");
                node.properties = this.PropertyDefinitionList();
                l2 = loc && loc.end;
                match("}");
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);

                return compile ? builder["objectExpression"](node.properties, node.loc) : node;
            }
            return null;
        }
        function ExpressionNoIn() {
            noInStack.push(isNoIn);
            isNoIn = true;
            var node = this.Expression();
            isNoIn = noInStack.pop();
            return node;
        }
        function AssignmentExpressionNoIn() {
            noInStack.push(isNoIn);
            isNoIn = true;
            var node = this.AssignmentExpression();
            isNoIn = noInStack.pop();
            return node;
        }
        function ParenthesizedExpression() {
            return this.Expression(undefined, true);
        }
        function ParenthesizedExpressionNode(exprNode, startLoc, endLoc) {
            var node = Node("ParenthesizedExpression");
            node.expression = exprNode;
            node.loc = makeLoc(startLoc, endLoc);
            return node;
        }
        function CoverParenthesizedExpression(tokens) {
            var expression = parseGoal("ParenthesizedExpression", tokens);
            return expression;
        }
        function ArrowParameterList(tokens) {
            var formals = parseGoal("FormalParameterList", tokens);
            return formals;
        }
        function CoverParenthesisedExpressionAndArrowParameterList() {
            var parens = [];
            var covered = [];
            var cover = false;
            var expr, node, l1, l2;
            l1 = loc && loc.start;
            if (t === "Identifier" && lookahead === "=>") {
                expr = this.Identifier();
                cover = true;
            } else if (v === "..." && lookaheadType === "Identifier") {
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
        
        

        function MemberExpression(obj) {
            var node, l1, l2;
            obj = obj || this.PrimaryExpression();
            if (obj) {
                l1 = obj.loc && obj.loc.start;
                var node = Node("MemberExpression");
                node.object = obj;
            
                if (t === "TemplateLiteral") return this.CallExpression(obj);
                else if (v === "[") {
                    match("[");
                    node.computed = true;
                    node.property = this.AssignmentExpression();
                    match("]");
            
                } else if (v === ".") {
                    match(".");
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
                        throw new SyntaxError("MemberExpression . Identifier expects a valid IdentifierString or an IntegerString as PropertyKey"+atLineCol());
                    }
                    match(v);

                } else {
                
            	    return obj;
            	    
            	}
            
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
                match("(");
                args = [];
                if (v !== ")") {
                    do {
                        if (v === ")") break;
                        if (arg = this.SpreadExpression() || this.AssignmentExpression()) {
                            args.push(arg);
                        } else {
                            throw new SyntaxError("illegal argument list"+atLineCol());
                        }
                        if (v === ",") {
                            match(",");
                        } else if (v != ")" && v != undefined) {
                            throw new SyntaxError("illegal argument list"+atLineCol());
                        }
                    } while (v !== undefined);
                }
                match(")");
                return args;
            }
            return null;
        }

        function PrimaryExpression() {
            var fn, node;
            fn = this[PrimaryExpressionByValue[v]];
            if (!fn) fn = this[PrimaryExpressionByType[t]];
            if (!fn && yieldIsId && v === "yield") fn = this.YieldAsIdentifier;
            if (!fn && defaultIsId && v === "default") fn = this.DefaultAsIdentifier;
            if (fn) node = fn.call(this);
            if (node) return node;
            return null;
        }
        function ConditionalExpressionNoIn(left) {
            noInStack.push(isNoIn);
            isNoIn = true;
            var r = this.ConditionalExpression(left);
            isNoIn = noInStack.pop();
            return r;
        }
        function ConditionalExpression(left) {
            if (left && v === "?") {
                var l1 = loc && loc.start,
                    l2;
                var node = Node("ConditionalExpression");
                node.test = left;
                match("?");
                node.consequent = this.AssignmentExpression();
                match(":");
                node.alternate = this.AssignmentExpression();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return null;
        }
        function PostfixExpression(lhs) {
            var l1 = loc && loc.start;
            if (v === "(") lhs = this.ParenthesizedExpression();
            lhs = lhs || this.LeftHandSideExpression();
            if (lhs && UpdateOperators[v]) {
                var node = Node("UnaryExpression");
                node.operator = v;
                node.prefix = false;
                node.argument = lhs;
                node.loc = makeLoc(l1, loc && loc.end);
                match(v);
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
                match(v);
                node.argument = this.UnaryExpression();
                var l2 = loc && loc.end;
                if (node.argument == null) throw new SyntaxError("invalid unary expression "+node.operator+", operand missing " + stringifyLoc(loc));
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return this.PostfixExpression();
        }
        function AssignmentExpression() {
            var node = null, leftHand, l1, l2;
            l1 = loc && loc.start;
            /*
                the
                primaryexpression
                memberexpression
                callexpression
                newexpression
                is a little bit out of order here
             */
            if (!yieldIsId && v === "yield") leftHand = this.YieldExpression();
            if (!leftHand) leftHand = this.CoverParenthesisedExpressionAndArrowParameterList();
            leftHand = leftHand || this.UnaryExpression();
            if (!leftHand) return null;
            if (v === undefined) return leftHand;
            if ((isNoIn && InOrOf[v])) return leftHand;
            if (v === "," || ExprEndOfs[v] || ltNext) return leftHand;
            if (t !== "Punctuator" && !InOrOfInsOf[v]) return leftHand;

            if (v === "." || v === "[") leftHand = this.MemberExpression(leftHand);
            else if (v === "(" || v === "`") leftHand = this.CallExpression(leftHand);
            else if (v == "++" || v == "--") leftHand = this.PostfixExpression(leftHand);
    	    else if (v === "?") return this.ConditionalExpressionNoIn(leftHand);

            if (AssignmentOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {
                node = Node("AssignmentExpression");

                node.longName = PunctToExprName[v];
                node.operator = v;
                node.left = leftHand;
                // debug(v);
                match(v);
                node.right = this.AssignmentExpressionNoIn(node);
                if (!node.right) throw new SyntaxError("can not parse a valid righthandside for this assignment expression"+atLineCol());
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                node = rotate_binexps(node);
                if (v == "?") return this.ConditionalExpressionNoIn(node);
                return node;
            } else if (BinaryOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {
                node = Node("BinaryExpression");
                node.longName = PunctToExprName[v];
                node.operator = v;
                node.left = leftHand;
                match(v);
                node.right = this.AssignmentExpression();
                if (!node.right) {
                    throw new SyntaxError("can not parse a valid righthandside for this binary expression "+atLineCol());
                }
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                node = rotate_binexps(node);
                if (v == "?") return this.ConditionalExpressionNoIn(node);
                return node;
            } else {
                return leftHand;
            }
        }
        function CallExpression(callee) {
            var node, tmp, l1, l2;
            l1 = l2 = (loc && loc.start);
            if (callee = (callee||this.MemberExpression())) {
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
                        // .. [][][]
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
        function NewExpression() {
            var node, l1, l2;
            if (v === "new") {
                l1 = loc && loc.start;
                l2 = loc && loc.end;
                node = Node("NewExpression");
                match("new");
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
        function LeftHandSideExpression(callee) {
            return this.NewExpression(callee) || this.CallExpression(callee);
        }
        function ExpressionStatement(expr, l1, l2) {
            var node = Node("ExpressionStatement");
            node.expression = expr;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        function SequenceExpression(list, l1, l2) {
            var node = Node("SequenceExpression");
            node.sequence = list;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        function Expression(stop, parenthesized) {
            var list = [];
            var node;
            var ae;
            var l1 = loc && loc.start;
            var l2;
            var hasStop = typeof stop === "string";


            if ((!parenthesized && ExprNoneOfs[v]) || (v === "let" && lookahead === "[")) return null;
            
            do {
                if (hasStop && v === stop) break;
                if (ae = this.AssignmentExpression()) list.push(ae);
                if (hasStop && v === stop) break;
                if (v === ",") {
                    match(",");
                    continue;
                } else if (ltLast) {
                    break;
                } else if (ExprEndOfs[v]) {
                    break;
                } else if (v === undefined) {
                    break;
                } else {
        	    throw new SyntaxError("invalid expression statement "+atLineCol());
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
        function SuperExpression() {
            if (v === "super") {
                var l1 = loc && loc.start;
                var node = Node("SuperExpression");
                node.loc = makeLoc(l1, l1);
                if (withExtras && extraBuffer.length) dumpExtras2(node, "before");
                match("super");
                if (withExtras && extraBuffer.length) dumpExtras2(node, "after");
                if (currentNode) {
                    if (ContainNoSuperIn[currentNode.type]) {
                        throw new SyntaxError("contains: super is not allowed in "+currentNode.type);
                    }
                    currentNode.needsSuper = true;
                }
                if (compile) return builder.superExpression(node.loc);
                return node;
            }
            return null;
        }
        function ThisExpression() {
            if (v === "this") {
                var l1 = loc && loc.start;
                var node = Node("ThisExpression");
                node.loc = makeLoc(l1, l1);
                if (withExtras && extraBuffer.length) dumpExtras2(node, "before");
                match("this");
                if (withExtras && extraBuffer.length) dumpExtras2(node, "after");
                if (compile) return builder.thisExpression(node.loc);
                return node;
            }
            return null;
        }
        function Initializer() {
            if (v === "=") {
                match("=");
                var expr = this.AssignmentExpression();
                return expr;
            }
            return null;
        }
        function BindingElementList() {
            var list = [];
            var id, bindEl, l1, l2;
            if (v === "{") {
                match("{");
                while (v != "}") {
                    if (StartBinding[v]) id = this.BindingPattern();
                    else id = this.Identifier();
                    if (v === ":") {
                        l1 = id.loc && id.loc.start;
                        bindEl = Node("BindingElement");
                        bindEl.id = id;
                        match(":");
                        bindEl.as = this.Identifier();
                        l2 = loc && loc.end;
                        bindEl.loc = makeLoc(l1, l2);
                        if (isStrict && ForbiddenArgumentsInStrict[bindEl.as.name]) {
                            throw new SyntaxError(bindEl.as.name + " is not a valid binding identifier in strict mode");
                        }
                        list.push(bindEl);
                        if (v === "=") {
                            bindEl.init = this.Initializer();
                        }
                    } else {
                        if (isStrict && ForbiddenArgumentsInStrict[id.name]) {
                            throw new SyntaxError(v + " is not a valid bindingidentifier in strict mode");
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
                    if (v === "...") id = this.RestParameter();
                    else if (StartBinding[v]) id = this.BindingPattern();
                    else id = this.Identifier();
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
                l1 = loc && loc.start;
                node = Node(PatternName[v]);
                node.elements = this.BindingElementList();
                if (v === "=") node.init = this.Initializer();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) return builder.bindingPattern(node.type, node.elements, node.init, node.loc);
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
            if (t === "Identifier" || (v === "yield" && yieldIsId) || (v === "default" && defaultIsId)) {
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
                if (isNoIn && InOrOf[v]) break;
                if (v === ",") {
                    match(",");
                    continue;
                } else if (v === ";") {
                    match(";");
                    break;
                } else if (ltLast) {
                    break;
                } else if (v === undefined) {
                    break;
                } else {
            	    throw new SyntaxError("illegal token "+v+" after "+kind+" declaration");
                }
                
            }
            if (!list.length) throw new SyntaxError("expecting identifier names after "+kind);
            return list;
        }
        function VariableStatement() {
            var node, decl, l1, l2;
            if (v === "var" || v === "let" || v === "const") {
                l1 = loc && loc.start;
                node = Node("VariableDeclaration");
                node.declarations = [];
                node.kind = v;
                if (LetOrConst[v]) node.type = "LexicalDeclaration";
                match(v);
                node.declarations = this.VariableDeclarationList(node.kind);
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) return builder["variableStatement"](node.kind, node.declarations, node.loc);
                return node;
            }
            return null;
        }
        function VariableStatementNoIn() {
            noInStack.push(isNoIn);
            isNoIn = true;
            var node = this.VariableStatement();
            isNoIn = noInStack.pop();
            return node;
        }
        function ClassDeclaration(isExpr) {
            var node, m;
            if (v === "class") {
                //pushDecls();
                node = Node("ClassDeclaration");
                node.id = null;
                node.strict = true;
                node.expression = !! isExpr;
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
                    m = this.MethodDefinition(node);
                    node.elements.push(m);
                }
                match("}");
                popStrict();
                //popDecls(node);
                if (compile) return builder["classExpression"](node.id, node.extends, node.elements, node.loc);
                return node;
            }
            return null;
        }
        function MethodDefinition(parent, isObjectMethod, computedPropertyName) {
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
                if (!isObjectMethod) match(";");
                else throw new SyntaxError("invalid ; in object literal");
            }
            if (v === "static") {
                if (!isObjectMethod) {
                    isStaticMethod = true;
                    match(v);
                } else {
                    throw new SyntaxError("static is not allowed in objects");
                }
            }
            if (v === "*") {
                isGenerator = true;
                match(v);
            } else if (v === "get") {
                specialMethod = isGetter = true;
                match(v);
                // get c() {}
            } else if (v === "set") {
                specialMethod = isSetter = true;
                match(v);
                // set c() {}
            }
            node = Node("MethodDefinition");
            nodeStack.push(currentNode);
            currentNode = node;
            if (v =="[") node.computed = true;
            node.id = this.PropertyKey();
            if (isStrict && ForbiddenArgumentsInStrict[node.id.name]) throw new SyntaxError(node.id.name + " is not a valid method identifier in strict mode");
            node.generator = isGenerator;
            if (!isObjectMethod) node.static = isStaticMethod;
            if (isGetter) node.kind = "get";
            if (isSetter) node.kind = "set";
            match("(");
            node.params = this.FormalParameterList();
            match(")");
            match("{");
            node.body = this.FunctionBody(node);
            match("}");
            node.specialMethod = specialMethod;
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder.methodDefinition(node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc);
            currentNode = nodeStack.pop();
            return node;
        }
        function RestParameter() {
            if (v === "...") {
                var l1 = loc && loc.start;
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
                var l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                if (compile) return builder["restParameter"](node.id, node.loc);
                return node;
            }
            return null;
        }
        function SpreadExpression() {
            if (v === "...") {
                var l1 = loc && loc.start;
                match("...");
                var node = Node("SpreadExpression");
                node.argument = this.AssignmentExpression();
                var l2 = node.argument && node.argument.loc && node.argument.loc.end;
                node.loc = makeLoc(l1, l2);
                if (compile) return builder["spreadExpression"](node.argument, node.loc);
                return node;
            }
            return null;
        }
        function DefaultParameter() { // ES6
            var node;
            if (t == "Identifier" && lookahead == "=") {
                var l1 = loc&&loc.start;
                node = Node("DefaultParameter");
                var id = this.Identifier();
                node.id = id.name;
                match("=");
                node.init = this.AssignmentExpression();
                node.loc = makeLoc(l1, loc && loc.end);
                if (compile) return builder["defaultParameter"](node.id, node.init, node.loc);
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
                        match(",");
                    } else if (v !== undefined && v !== ")") {
                        throw new SyntaxError("error parsing formal parameter list");
                    }
                } while (v !== undefined && v !== ")");
            return list;
        }
        function FunctionDeclaration(isExpr) {
            var node, start, end, sourceStart, sourceEnd;
            if (v === "function") {
                defaultStack.push(defaultIsId);
                defaultIsId = true;
                start = loc && loc.start;
                match("function");
                if (v === "*") {
                    node = Node("GeneratorDeclaration");
                    node.generator = true;
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
                    yieldStack.push(yieldIsId);
                    yieldIsId = true;
                } else {
                    yieldStack.push(yieldIsId);
                    yieldIsId = false;
                }
                //pushDecls();
                match("{");
                node.body = this.FunctionBody(node);
                match("}");
                //popDecls(node);
                yieldIsId = yieldStack.pop();
                end = loc && loc.end;
                node.loc = makeLoc(start, end);
                if (node.generator) {
                    node.nodesById = CreateTablePlusAddParentPointerIds(node);
                }
                defaultIsId = defaultStack.pop();
                currentNode = nodeStack.pop();
                symtab.oldScope();
                EarlyErrors(node);
                if (compile) return builder.functionDeclaration(node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc, node.extras);
                return node;
            }
            return null;
        }
        function FunctionExpression() {
            return this.FunctionDeclaration(true);
        }
        function GeneratorBody(parent) {
            yieldStack.push(yieldIsId);
            yieldIsId = false;
            var body = this.FunctionBody(parent);
            yieldIsId = yieldStack.pop();
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
                if (node = this.FunctionDeclaration() || this.ModuleDeclaration() || this.ClassDeclaration() || this.Statement()) {
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
                yieldStack.push(yieldIsId);
                yieldIsId = true;
                match("{");
                body = this.FunctionBody(parent);
                match("}");
                yieldIsId = yieldStack.pop();
                return body;
            }
            return this.AssignmentExpression();
        }
        function CreateTablePlusAddParentPointerIds (node, parent, nodeTable) {
            nodeTable = nodeTable || Object.create(null);
            if (Array.isArray(node)) {
                for (var i = 0, j = node.length; i < j; i++) {
                    CreateTablePlusAddParentPointerIds(node[i], node, nodeTable);
                }
                return nodeTable;
            }
            if (typeof node === "object" && node != null && node.loc) {
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
                l1 = loc && loc.start;
                var node = Node("BlockStatement");
                defaultStack.push(defaultIsId);
                defaultIsId = true;
                //pushLexOnly();
                match("{");
                node.body = this.StatementList();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                defaultIsId = defaultStack.pop();
                match("}");
                symtab.oldBlock();
                //popLexOnly(node);
                return node;
            }
            return null;
        }
        function BreakStatement() {
            if (v === "break") {
                var node, l1, l2;
                l1 = loc && loc.start;
                node = Node("BreakStatement");
                match("break");
                if (v !== ";") {
                    if (ltLast) {
                        l2 = loc && loc.start;
                	node.loc = makeLoc(l1,l2);
                	return node;
                	return node;
            	    }
                    if (t === "Identifier") {
                        var id = this.Identifier();
                        node.label = id.name;
                    }
                }
                semicolon();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return null;
        }
        function ContinueStatement() {
            var node, l1, l2;
            if (v === "continue") {
                node = Node("ContinueStatement");
                l1 = loc && loc.start;
                match("continue");
                if (v !== ";") {
                    if (ltLast) {
                	l2 = loc && loc.start;
                	node.loc = makeLoc(l1,l2);
                	return node;
            	    }
                    if (t === "Identifier") {
                        var id = this.Identifier();
                        node.label = id.name;
                    }
                }
                semicolon();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
        }
        function ReturnStatement() {
            var node, l1, l2;
            if (v === "return") {
                l1 = loc && loc.start;
                node = Node("ReturnStatement");
                if (withExtras && extraBuffer.length) dumpExtras2(node, "before");
                match("return");
                if (withExtras && extraBuffer.length) dumpExtras2(node, "after");
                if (v !== ";") {
                    if (ltLast) {
                        l2 = loc && loc.end;
                        node.loc = makeLoc(l1, l2);
                        return node;
                    }
                    node.argument = this.Expression();
                }
                semicolon();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return null;
        }
        function ThrowStatement() {
            if (v === "throw") {
                var node, l1, l2;
                node = Node("ThrowStatement");
                l1 = loc && loc.start;
                match("throw");
                if (v !== ";") {
                    if (ltLast) { 
                        l2 = loc && loc.end;
                        node.loc = makeLoc(l1, l2);
                        return node;
                    }
                    else node.argument = this.Expression();
                } else semicolon();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return null;
        }
        function LabelledStatement() {
            if (t === "Identifier" && lookahead === ":") {
                var node = Node("LabelledStatement");
                var l1 = loc && loc.start;
                var label = this.Identifier();
                node.label = label.name;
                match(":");
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
        function TryStatement() {
            if (v === "try") {
                var node = Node("TryStatement");
                var l1, l2;
                l1 = loc && loc.start;
                match("try");
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
        function Catch() {
            if (v === "catch") {
                var node, l1, l2;
                node = Node("CatchClause");
                l1 = loc && loc.start;
                match("catch");
                match("(");
                node.params = this.FormalParameterList();
                match(")");
                node.block = this.Statement();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return null;
        }
        function Finally() {
            if (v === "finally") {
                var node, l1, l2;
                l1 = loc && loc.start;
                var node = Node("Finally");
                match("finally");
                node.block = this.Statement();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
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
                var l1 = loc && loc.start;
                if (withExtras) dumpExtras(node, "with", "before");
                match("with");
                if (withExtras) dumpExtras(node, "with", "after");
                match("(");
                node.object = this.Expression();
                match(")");
                node.body = this.BlockStatement();
                var l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                return node;
            }
            return null;
        }
        function DebuggerStatement() {
            if (v === "debugger") {
                var node, l1, l2;
                node = Node("DebuggerStatement");
                l1 = loc && loc.start;
                match("debugger");
                semicolon();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                if (compile) return builder["debuggerStatement"](node.loc);
                return node;
            }
            return null;
        }
        function ModuleDeclaration() {
            if (v === "module") {
                var node, l1, l2;
                l1 = loc && loc.start;
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
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                //popDecls(node);
                EarlyErrors(node);
                currentNode = nodeStack.pop();
                currentModule =  moduleStack.pop();
                symtab.oldScope();
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
                if (item = this.ExportStatement() || this.ModuleDeclaration() || this.ImportStatement() || this.Statement()) {

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
                        node.as = this.Identifier();
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
                var l1 = loc && loc.start;
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
                EarlyErrors(node);
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
                        node.as = this.Identifier();
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
            defaultStack.push(defaultIsId);
            defaultIsId = true;
            var node = this.FunctionDeclaration();
            defaultIsId = defaultStack.pop();
        }
        function ExportStatement() {
            if (v === "export") {
                var l1 = loc && loc.start;
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
                l2 = loc && loc.end;
                makeLoc(l1, l2);
                EarlyErrors(node);
                semicolon();
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
                    if (s = this.Statement()) list.push(s);
                } while (!FinishSwitchStatementList[v] && v != undefined );
            return list;
        }
        function StatementList() {
            var list = [];
            list.type = "StatementList";
            var s;
            if (v)
                do {
                    if (s = this.Statement()) list.push(s);
                } while (!FinishStatementList[v] && v != undefined);
            return list;
        }
        function Statement(a, b, c, d) {
            var node;
            var fn = this[StatementParsers[v]];
            if (fn) node = fn.call(this, a, b, c, d);
            if (!node) {
                node = this.LabelledStatement(a, b, c, d) || this.Expression(a,b,c,d);
            }
            if (node) semicolon();
            return node || null;
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
                var l1 = loc && loc.start;
                var l2;
                node = Node("ForDeclaration");
                node.kind = v;
                match(v);
                node.id = this.ForBinding();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1,l2);
                if (v != "in" && v != "of") {
                    throw new SyntaxError("invalid token '"+v+"' after let or const declaration at the for statement "+atLineCol() );
                }
                return node;
            }
            return null;
        }
        function ForBinding() {
            var node = this.BindingPattern() || this.Identifier();
            return node;
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
                l1 = loc && loc.start;
                match("for");
                match("(");
                /* predict */
                parens.push("(");
                var collected = [];
                for (;;) {
                    peek = token && token.value;
                    if (peek === ";") {
                        numSemi += 1;
                    } else if (peek === "in" || peek === "of") {
                        hasInOf = peek;
                    } else if (peek === "(") {
                        parens.push("(");
                    } else if (peek === ")") {
                        parens.pop();
                        if (!parens.length) {
                            break;
                        }
                    } else if (peek === undefined) {
                        throw new SyntaxError("unexpected end of token stream");
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
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) {
                    if (node.type === "ForStatement") return builder["forStatement"](node.init, node.condition, node.update, node.body, loc);
                    if (node.type === "ForInStatement") return builder["forInStatement"](node.left, node.right, node.body, loc);
                    if (node.type === "ForOfStatement") return builder["forOfStatement"](node.left, node.right, node.body, loc);
                }
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
                EarlyErrors(node);
                if (compile) return builder["ifStatement"](node.test, node.consequent, node.alternate, loc);
                return node;
            }
            return null;
        }
        function WhileStatement() {
            if (v === "while") {
                var l1, l2;
                l1 = loc && loc.start;
                var node = Node("WhileStatement");
                match("while");
                match("(");
                node.test = this.Expression();
                match(")");
                node.body = this.Statement();
                l2 = loc && loc.end;
                EarlyErrors(node);
                // staticSemantics.popContainer();
                if (compile) return builder["whileStatement"](node.test, node.body, node.loc);
                return node;
            }
            return null;
        }
        function DoWhileStatement() {
            if (v === "do") {
                var l1, l2;
                l1 = loc && loc.start;
                var node = Node("DoWhileStatement");
                match("do");
                node.body = this.Statement();
                match("while");
                match("(");
                node.test = this.Expression();
                match(")");
                l2 = loc && loc.end;
                semicolon();
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) return builder["doWhileStatement"](node.test, node.body, node.loc);
                return node;
            }
            return null;
        }
        function SwitchStatement() {
            if (v === "switch") {
                defaultStack.push(defaultIsId);
                defaultIsId = false;
                var c;
                var node = Node("SwitchStatement");
                var l1 = loc && loc.start;
                var l2;
                match("switch");
                match("(");
                node.discriminant = this.Expression(")");
                match(")");
                match("{");
                var cases = node.cases = [];
                while (v !== "}") {
                    c = this.SwitchCase() || this.DefaultCase();
                    cases.push(c);
                }
                match("}");
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                defaultIsId = defaultStack.pop();
                if (compile) return builder["switchStatement"](node.discriminant, node.cases, node.loc);
                return node;
            }
            return null;
        }
        function DefaultCase() {
            if (v === "default" && lookahead === ":") {
                var node = Node("DefaultCase");
                match("default");
                match(":");
                node.consequent = this.SwitchStatementList();
                semicolon();
                return node;
            }
            return null;
        }
        function SwitchCase() {
            if (v === "case") {
                var node = Node("SwitchCase");
                match("case");
                node.test = this.Expression(":");
                match(":");
                node.consequent = this.SwitchStatementList();
                semicolon();
                return node;
            }
            return null;
        }
        function EmptyStatement() {
            var node;
            if (v === ";") {
                node = Node("EmptyStatement");
                node.loc = makeLoc(loc && loc.start, loc && loc.end);
                dumpExtras2(node, "before");
                match(";");
                dumpExtras2(node, "after");
                if (compile) return builder.emptyStatement(loc);
                return node;
            }
            return null;
        }
        function DirectivePrologue(containingNode, nodes) {
            var strict = false;
            while (t === "StringLiteral" && isDirective[v]) {
                if (isStrictDirective[v]) strict = containingNode.strict = true;
                else if (isAsmDirective[v]) containingNode.asm = true;
                var l1 = loc && loc.start;
                var node = Node("Directive");
                node.value = v;
                match(v);
                var l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                semicolon();
                if (compile) node = builder.directive(node.value, node.loc);
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
                if (node = this.FunctionDeclaration() || this.ClassDeclaration() || this.ModuleDeclaration() || this.Statement()) {
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
            var l1 = loc && loc.start;
            root.body = this.ModuleBody();
            root.strict = true;
            var l2 = loc && loc.end;
            root.loc = makeLoc(l1, l2);
            EarlyErrors(root);
            if (compile) return builder["module"](root.body, root.loc);
            return root;
        }
        function DefaultAsIdentifier() {
            if (v === "default") {
                if (defaultIsId) {
                    var node = Node("Identifier");
                    node.name = "default";
                    node.loc = token && token.loc;
                    match("default");
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
            var l1 = loc && loc.start;
            //pushDecls();
            currentNode = node;
            node.body = this.SourceElements(node);
            var l2;
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            ////popDecls(node);
            if (compile) return builder["program"](node.body, loc);
            return node;
        }
        function RegularExpressionLiteral() {
            if (t === "RegularExpressionLiteral") {
                var l1 = loc && loc.start;
                var node = Node("RegularExpressionLiteral");
                node.value = v[0];
                node.flags = v[1];
                var l2 = loc && loc.end;
                node.loc = makeLoc(l1,l2);
                next();
                return node;
            }
            return null;
        }
        function JSONText() {
            if (!withError) {
                withError = require("api").withError;
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
                if (q1 !== "\"" || q2 !== "\"") return withError("JSONString: Expecting double quoted strings.");
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
                else return withError("JSONElementList: Error parsing Element");
                if (v === ",") match(",");
                else if (v === "]") break;
                else return withError("JSONElementList: Invalid formatted literal. Comma or ] expected. Got " + v);
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
            if (!key) return withError("Syntax", "JSONMember: Expecting double quoted string keys in object literals.");
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
                else return withError("JSONMemberList: Error parsing Member");
                if (v === ",") match(",");
                else if (v === "}") break;
                else return withError("JSONMemberList: Invalid formatted literal. Comma or } expected. Got: " + v);
            }
            return list;
        }
        function debugging() {
            console.dir(token);
            console.log(v);
            console.log(t);
        }

        function initOldLexer(sourceOrTokens) {
            if (!Array.isArray(sourceOrTokens))
                tokens = tokenize.tokenizeIntoArray(sourceOrTokens);
            else
                tokens = sourceOrTokens;
            next = next_from_array;
            pos = -1;
            token = t = v = undefined;
            tokenArrayLength = tokens.length;
            ast = null;
            currentNode = undefined;
            symtab = SymbolTable();
            if (lookaheadToken = tokens[0]) {
                lookahead = lookaheadToken.value;
                lookaheadType = lookaheadToken.type;
            }
            next();
        }

        function initNewLexer(sourceOrTokens) {
            currentNode = pos = t = v = token = lookaheadToken = lookahead = lookaheadType = undefined;
            ast = null;
            symtab = SymbolTable();
            if (sourceOrTokens != undefined) {
                if (Array.isArray(sourceOrTokens)) {
                    tokens = sourceOrTokens;
                    next = next_from_array;
                    pos = -1;
                    tokenArrayLength = tokens.length;
                    lookaheadToken = tokens[0];
                } else {
                    next = stepwise_next;
                    lookaheadToken = tokenize(sourceOrTokens);
                }
            }
            if (lookaheadToken) {
                lookahead = lookaheadToken.value;
                lookaheadType = lookaheadToken.type;
            }
            next();
        }

        function parse(sourceOrTokens) {
            tokenize.saveState();
            if (tokenize === tokenize.tokenizeIntoArray) {
                initOldLexer(sourceOrTokens);
            } else {
                initNewLexer(sourceOrTokens);
            }
            try {
                ast = parser.Program();
            } catch (ex) {
                //  throw ex;
                console.log("[Parser Exception]: " + ex.name);
                console.log(ex.message);
                console.log(ex.stack);
                ast = ex;
            } finally {
                tokenize.restoreState();
            }
            return ast;
        }

        function initParseGoal(source) {
            symtab = SymbolTable();
            ast = t = v = token = lookaheadToken = lookahead = lookaheadType = undefined;
            if (!Array.isArray(source)) tokens = tokenize.tokenizeIntoArray(source);
            else tokens = source;
            next = next_from_array;
            pos = -1;
            tokenArrayLength = tokens.length;
            next();
        }
        function parseGoal(goal, source) {
            if (!withError) {
                var api = require("api");
                withError = api.withError;
                ifAbrupt = api.ifAbrupt;
                isAbrupt = api.isAbrupt;
            }
            tokenize.saveState();
            saveTheDot();
            initParseGoal(source);
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
            } finally {
                restoreTheDot();
                tokenize.restoreState();
            }
            return node;
        }
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
        parser.ExpressionStatement = ExpressionStatement;
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
        parser.ParenthesizedExpressionNode = ParenthesizedExpressionNode;
        parser.ArrowParameterList = ArrowParameterList;
        parser.CoverParenthesisedExpressionAndArrowParameterList = CoverParenthesisedExpressionAndArrowParameterList;
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
        parser.ExpressionStatement = ExpressionStatement;
        parser.SequenceExpression = SequenceExpression;
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
        exports.makeParser = makeParser;
        return exports;
    }
    return makeParser();
});
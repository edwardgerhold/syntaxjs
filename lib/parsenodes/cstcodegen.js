define("js-codegen", function (require, exports, module) {
    "use strict";



    var builder = {};
    var parser = require("parser").parser;

    var parseGoal = parser.parseGoal;
    var setBuilder = parser.setBuilder;
    var unsetBuilder = parser.unsetBuilder;

    var TAB = "    ";
    var SPC = " ";
    var indent = 0;


    function tabs(indent) {
        var str = "";
        for (var i = 1; i <= indent; i++) {
            str += TAB;
        }
        return str;
    }

    function nl() {
        return "\r\n";
    }

    var names = {
        __proto__: null,
        "Directive": "directive",
        "BooleanLiteral": "literal",
        "StringLiteral": "literal",
        "NullLiteral": "literal",
        "NumericLiteral": "literal",
        "VariableDeclarator": "variableDeclarator",
        "BinaryExpression": "binaryExpression"
    };
     Object.keys(parser).forEach(function (k) {
        names[k] = (k[0]).toLowerCase() + k.slice(1);
     });

    function callBuilder(node) {
        var args;
        var name;

        if (!node) return "";

        if (Array.isArray(node)) {

            var src = "";
            var stm;
            for (var i = 0, j = node.length; i < j; i++) {
                if (stm = node[i]) {
                    src += callBuilder(stm);
                }
            }
            return src;

        } else if (typeof node === "string") {

            return node;

        } else {

            name = node.type;

            switch (name) {
                case "BlockStatement":
                    return this.blockStatement(node.body, node.loc, node.extras);
                    break;
                case "FunctionDeclaration":
                case "FunctionExpression":
                case "GeneratorDeclaration":
                case "GeneratorExpression":
                    return this.functionDeclaration(node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc, node.extras);
                case "MethodDefinition":
                    return this.methodDefinition(node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc, node.extras);
                case "ArrowExpression":
                    return this.arrowExpression(node.id, node.params, node.body, node.loc, node.extras);
                case "ParenthesizedExpression":
                    return this.parenthesizedExpression(node.expression, node.loc, node.extras);
                case "ExpressionStatement":
                    return this.expressionStatement(node.expression, node.loc, node.extras);
                case "SequenceExpression":
                    return this.sequenceExpression(node.sequence, node.loc, node.extras);
                case "VariableDeclarator":
                    return this.variableDeclarator(node.id, node.init, node.loc, node.extras);
                    break;
                case "VariableDeclaration": return this.variableDeclaration(node.kind, node.declarations, node.loc, node.extras);
                case "LexicalDeclaration": return this.lexicalDeclaration(node.kind, node.declarations, node.loc, node.extras);
                case "EmptyStatement":
                    return this.emptyStatement(node.loc, node.extras);
                    break;
                case "ForStatement":
                    args = [node.init, node.test, node.update, node.body, node.loc, node.extras];
                    break;
                case "ForInStatement":
                case "ForOfStatement":
                    args = [node.left, node.right, node.body, node.loc, node.extras];
                    break;
                case "DoWhileStatement":
                case "WhileStatement":
                    args = [node.test, node.body, node.loc, node.extras];
                    break;
                case "LabelledStatement":
                    args = [node.label, node.statement, node.loc, node.extras];
                    break;
                case "IfStatement":
                    args = [node.test, node.consequent, node.alternate, node.loc, node.extras];
                    break;
                case "TryStatement":
                    args = [node.handler, node.guard, node.finalizer, node.loc, node.extras];
                    break;
                case "SwitchStatement":
                    args = [node.discriminant, node.cases, node.loc, node.extras];
                    break;
                case "WithStatement":
                    args = [node.object, node.body, node.loc, node.extras];
                    break;
                case "ComprehensionExpression":
                    args = [node.blocks, node.filter, node.expression, node.loc, node.extras];
                    break;
                case "AssignmentExpression":
                case "BinaryExpression":
                case "LogicalExpression":
                    args = [node.operator, node.left, node.right, node.loc, node.extras];
                    break;
                case "UnaryExpression":
                    args = [node.operator, node.argument, node.prefix, node.loc, node.extras];
                    break;
                case "MemberExpression":
                    args = [node.object, node.property, node.computed, node.loc, node.extras];
                    break;
                case "CallExpression":
                case "NewExpression":
                    args = [node.callee, node.arguments, node.loc, node.extras];
                    break;
                case "ObjectPattern":
                case "ArrayPattern":
                    args = [node.elements, node.loc, node.extras];
                    break;
                case "BindingElement":
                    args = [node.id.name, node.target.name, node.loc, node.extras];
                    break;
                case "ObjectExpression":
                    args = [node.properties, node.loc, node.extras];
                    break;
                case "ArrayExpression":
                    args = [node.elements, node.loc, node.extras];
                    break;
                case "DefaultParameter":
                    args = [node.id, node.init, node.loc, node.extras];
                    break;
                case "RestParameter":
                    args = [node.id, node.init, node.loc, node.extras];
                    break;
                case "SpreadExpression":
                    args = [node.argument, node.loc, node.extras];
                    break;
                case "ClassDeclaration":
                case "ClassExpression":
                    args = [node.id, node.extends, node.elements, node.expression, node.loc, node.extras];
                    break;
                case "ThisExpression":
                case "SuperExpression":
                    args = [node.extras, node.loc];
                    break;
                case "Program":
                    args = [node.body, node.loc, node.extras];
                    break;
                case "Identifier":
                    args = [node.name || node.value, node.loc, node.extras];
                    break;
                case "ReturnStatement":
                case "ThrowStatement":
                    args = [node.argument, node.loc, node.extras];
                    break;
                case "BreakStatement":
                case "ContinueStatement":
                    args = [node.argument, node.label, node.loc, node.extras];
                    break;
                case "YieldExpression":
                    args = [node.argument, node.delegator, node.loc, node.extras];
                    break;
                case "Directive":
                case "Literal":
                case "NumericLiteral":
                case "StringLiteral":
                case "NullLiteral":
                case "BooleanLiteral":
                    args = [node.value, node.loc, node.extras];
                    break;
                case "TemplateLiteral":
                    args = [node.spans, node.loc, node.extras];
                    break;
                case "WhiteSpace":
                case "LineComment":
                case "MultiLineComment":
                case "LineTerminator":
                    args = [node.value, node.loc];
                    break;
                case "ConditionalExpression":
                    args = [node.test, node.consequent, node.alternate, node.loc, node.extras];
                    break;
            }
            var fn;
            // name = name[0].toLowerCase() + name.slice(1);
            //if (name)
                fn = builder[names[name]];

            if (fn) return fn.apply(builder, args);
            else throw new TypeError("can not generate code for " + name);
        }
    }

    builder.spreadExpression = function (argument, loc, extras) {
        var src = "..." + callBuilder(argument);
        return src;
    };

    builder.restParameter = function (id, init, loc, extras) {
        var src = "..." + callBuilder(id);
        if (init) src += " = " + callBuilder(init);
        return src;
    };

    builder.defaultParameter = function (id, init, loc, extras) {
        var src = "";
        src += callBuilder(id);
        src += " = ";
        src += callBuilder(init);
        return src;
    };

    builder.classExpression =
        builder.classDeclaration = function (id, extend, elements, expression, loc, extras) {
            var src = "class ";
            var e;
            src += id;
            if (extend) src += " extends " + callBuilder(extend);
            src += "{";
            ++indent;
            for (var i = 0, j = elements.length; i < j; i++) {
                if (e = elements[i]) {
                    src += tabs(indent) + callBuilder(e) + nl();
                }
            }
            --indent;
            src += "}";
            return src;
        };

    builder.program = function (body, loc, extras) {
        var src = "";
        var inst;
        for (var i = 0, j = body.length; i < j; i++) {
            if (inst = body[i]) {
                src += tabs(indent) + callBuilder(inst) + ";" + nl();
            }
        }
        return src;
    };

    builder.bindingElement = function (name, as, initializer, loc, extras) {
        var src = "";
        src += name;
        src += ":";
        src += as;
        if (initializer) src += " = " + callBuilder(initializer);
        return src;
    };
    builder.objectPattern = function (elements, loc, extras) {
        var src = "", e;
        src += "{";
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {
                src += callBuilder(e);
                if (i < j - 1) src += ", ";
            }
        }
        src += "}";
        return src;
    };
    builder.arrayPattern = function (elements, loc, extras) {
        var src ="", e;
        src += "[";
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {
                src += callBuilder(e);
                if (i < j - 1) src += ", ";
            }
        }
        src += "]";
        return src;
    };
    builder.identifier = function (name, loc, extras) {
        var src = "";
        src += name;
        return src;
    };

    builder.directive =
        builder.stringLiteral =
            builder.numericLiteral =
                builder.booleanLiteral =
                    builder.nullLiteral =
                    builder.literal = function (literal, loc, extras) {
                        var src = "";
                        src += literal;
                        return src;
                    };

    builder.emptyStatement = function emptyStatement(loc, extras) {
        var src = "";
        if (extras && extras.before) src += callBuilder(extras.before);
        src += ";";
        if (extras && extras.after) src += callBuilder(extras.after);
        return src;
    };

    builder.variableDeclarator = function (id, init, loc, extras) {
        var src = "";

        if (typeof id == "string")	// for identifier strings
            src += id;			    // esprima uses identifier nodes
        else src += id.name;		// which is fine for me, too.

        // must align (will replace id strings
        // with nodes)

        return src;
    };
    builder.lexicalDeclaration =
        builder.variableDeclaration = function variableStatement(kind, declarations, loc, extras) {
            var src = kind + " ";
            var decl;
            for (var i = 0, j = declarations.length; i < j; i++) {
                if (decl = declarations[i]) {

                    src += callBuilder(decl);

                    if (decl.init) {
                        src += " = " + callBuilder(decl.init);
                    }

                    if (i < j - 1) {
                        src += ", ";
                    }
                }
            }
            return src;
        };

    builder.functionBody = function (body) {
        if (body.type === "BlockStatement") return this.blockStatement(body.body, body.loc, body.extras);
        var src = "";
        var st;
        src += "{";
        src += nl();
        ++indent;
        for (var i = 0, j = body.length; i < j; i++) {
            if (st = body[i]) {
                src += tabs(indent) + callBuilder(st) + ";" + nl();
            }
        }
        --indent;
        src += "}";
        return src;
    };

    builder.arrowExpression =
        function (id, params, body, loc, extras) {
            var src = "";
            src += this.formalParameters(params);
            src += " => ";
            if (Array.isArray(body))
                src += this.functionBody(body);
            else
                src += callBuilder(body);
            return src;

        };

    builder.functionDeclaration =
        builder.functionExpression =
            builder.generatorDeclaration =
                builder.generatorExpression = function (id, params, body, strict, generator, expression, loc, extras) {

                    var src = "function";
                    if (generator) src += "*";
                    src += " ";


                    if (typeof id == "string") {		//change id to node.
                        src += id;
                    } else if (id) src += id.name;

                    src += this.formalParameters(params);
                    src += " ";
                    src += this.functionBody(body);
                    return src;
                };

    builder.generatorMethod =
        builder.methodDefinition = function (id, params, body, strict, generator, loc, extras) {
            ++indent;
            var src = "";
            if (generator) src += "*";
            src += id;
            src += this.formalParameters(params);
            src += " ";
            src += this.functionBody(body);
            return src;
        };

    builder.formalParameters = function (formals) {
        var a;
        var src = "";
        src += "(";
        if (formals && formals.length) {
            for (var i = 0, j = formals.length; i < j; i++) {
                if (a = formals[i]) {
                    src += callBuilder(a);
                    if (i < j - 1) src += ", ";
                }
            }
        }
        src += ")";
        return src;
    };

    builder.memberExpression = function (object, property, computed) {
        var src = "";
        src += callBuilder(object);
        if (computed) src += "[" + callBuilder(property) + "]";
        else src += "." + callBuilder(property);
        return src;
    };

    builder.callExpression = function (callee, args, loc, extras) {
        var src = "";
        src += callBuilder(callee);
        src += this.formalParameters(args);
        return src;

    };
    builder.newExpression = function (callee, args, loc, extras) {
        var src = "new ";
        src += callBuilder(callee);
        src += this.formalParameters(args);
        return src;
    };

    builder.objectExpression = function (properties, loc, extras) {
        var p, e;
        var src = "{";
        for (var i = 0, j = properties.length; i < j; i++) {
            if (p = properties[i]) {

                switch (p.kind) {
                    case "init":
                        src += callBuilder(p.key);
                        src += ":";
                        src += callBuilder(p.value);
                        break;
                    case "get":
                        src += "get ";
                        src += callBuilder(p.value);
                        break;
                    case "set":
                        src += "set ";
                        src += callBuilder(p.value);
                        break;
                }

                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        src += "}";
        return src;
    };
    builder.arrayExpression = function (elements, loc, extras) {
        var e;
        var src = "[";
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {

                src += callBuilder(e);

                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        src += "]";
        return src;

    };

    builder.blockStatement = function (body, loc, extras) {
        var stm;
        var src = "{";

        if (body) {
            src += nl();
            ++indent;
            for (var i = 0, j = body.length; i < j; i++) {
                if (stm = body[i]) {

                    src += tabs(indent);
                    src += callBuilder(stm);
                    src += ";";
                    src += nl();

                }
            }
            --indent;
        }
        src += "}";
        return src;
    };

    var isOneOfThoseUnaryOperators = {
       "typeof": true,
        "void": true,
        "delete": true
    };
    builder.unaryExpression = function (operator, argument, prefix, loc, extras) {
        var src = "";
        if (prefix) src += operator;
        if (isOneOfThoseUnaryOperators[operator]) src += " ";
        src += callBuilder(argument);
        if (!prefix) src += operator;
        return src;
    };

    builder.binaryExpression = function (operator, left, right, loc, extras) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    };

    builder.assignmentExpression = function (operator, left, right, loc, extras) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    };

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc, extras) {
        var src = "";
        src += callBuilder(expr);
        return src;
    };
    builder.labelledStatement = function labelledStatement(label, body, loc, extras) {
        var src = "";
        src += label + ": ";
        src += nl();
        src += tabs(indent);
        src += callBuilder(body);
        return src;
    };
    builder.sequenceExpression = function (seq, loc, extras) {
        var src = "";
        var e;
        for (var i = 0, j = seq.length; i < j; i++) {
            if (e = seq[i]) {
                src += callBuilder(e);
                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        return src;
    };
    builder.ifStatement = function ifStatement(test, condition, alternate, loc, extras) {
        var src = tabs(indent) + "if (" + callBuilder(test) + ") " + callBuilder(condition);
        if (alternate) src += tabs(indent) + " else " + callBuilder(alternate);
        return src;
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc, extras) {
        var c;
        var src = "switch (" + callBuilder(discriminant) + ") {";
        for (var i = 0, j = cases.length; i < j; i++) {
            if (c = cases[i]) {
                if (c.type === "DefaultCase") {
                    src += "default: " + nl();
                    ++indent;
                    src += callBuilder(c.consequent);
                    --indent;
                } else {
                    src += "case " + callBuilder(c.test) + ":" + nl();
                    ++indent;
                    src += callBuilder(c.consequent);
                    --indent;
                }
            }
        }
        src += "}";
        return src;
    };
    builder.whileStatement = function whileStatement(test, body, loc, extras) {
        var src = "while (" + callBuilder(test) + ")" + callBuilder(body);
        return src;
    };
    builder.doWhileStatement = function doWhileStatement(test, body, loc, extras) {
        var src = "do " + callBuilder(body) + " while (" + callBuilder(test) + ");";
        return src;
    };
    builder.withStatement = function withStatement(obj, body, loc, extras) {
        var src = "";
        if (extras && extras.with) src += callBuilder(extras.with.before);
        src += "with";
        if (extras && extras.with) src += callBuilder(extras.with.after);
        src += " (" + callBuilder(obj) + ") " + callBuilder(body);
        return src;
    };
    builder.debuggerStatement = function debuggerStatement(loc, extras) {
        var src = "";
        if (extras && extras.before) src += callBuilder(extras.before);
        src += "debugger";
    	if (extras && extras.after) src += callBuilder(extras.after);
        return src;
    };

    builder.parenthesizedExpression = function (expression, loc, extras) {
        var src = "";
        src += "(";
        src += callBuilder(expression);
        src += ")";
        return src;
    };
    builder.tryStatement = function (block, guard, finalizer, loc, extras) {
        var src = "try " + callBuilder(block);
        if (guard) src += " catch (" + callBuilder(guard.params) + ") " + callBuilder(guard.block);
        if (finalizer) src += "finally " + callBuilder(finalizer.block);
        return src;
    };
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc, extras) {
        var src = "for (";
        src += callBuilder(left);
        src += " in ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forOfStatement = function forOfStatement(left, right, body, loc, extras) {
        var src = "for (";
        src += callBuilder(left);
        src += " of ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forStatement = function forStatement(init, test, update, body, loc, extras) {
        var src = "for (";
        if (init) src += callBuilder(init);
        src += ";";
        if (test) src += callBuilder(test);
        src += ";";
        if (update) src += callBuilder(update);
        src += ") ";
        src += callBuilder(body);
        return src;
    };

    builder.throwStatement = function (expression, loc, extras) {
        var src = "throw";
        if (expression) {
            src += SPC;
            src += callBuilder(expression);
        }
        return src;
    };
    builder.breakStatement = function (label, loc, extras) {
        var src = "break";
        if (label) {
            src += SPC;
            src += callBuilder(label);
        }
        return src;
    };
    builder.continueStatement = function (label, loc, extras) {
        var src = "continue";
        if (label) {
            src += SPC;
            src += callBuilder(label);
        }
        return src;
    };
    builder.returnStatement = function (expression, loc, extras) {
        var src = "";
        if (extras && extras.before) src += callBuilder(extras.before);

        src += "return";
        if (extras && extras.after) src += callBuilder(extras.after);
        if (expression) {
            src += " " + callBuilder(expression);
        }
        return src;
    };
    builder.thisExpression = function (loc, extras) {
        var src = "";
        if (extras) src += callBuilder(extras.before);
        src += "this";
        if (extras) src += callBuilder(extras.after);
        return src;
    };
    builder.superExpression = function (loc, extras) {
        var src = "";
        if (extras) src += callBuilder(extras.before);
        src += "super";
        if (extras) src += callBuilder(extras.after);
        return src;
    };

    builder.conditionalExpression = function (test, consequent, alternate, loc, extras) {
       var src = "";
       src += callBuilder(test);
       src += " ? ";
       src += callBuilder(consequent);
        src += " : ";
        src += callBuilder(alternate);
        return src;
    };

    builder.whiteSpace = function (value, loc) {
        return value;
    };
    builder.lineComment = function(value, loc) {
        return value + "\n";
    };
    builder.multiLineComment = function (value, loc) {
        return value;
    };
    builder.lineTerminator = function (value, loc) {
        return value;
    };

    function buildFromSrc(src) {
        setBuilder(builder, true);
        try {
            var result = parser(src);
        } catch (ex) {
            result = "[" + ex.name + "]" + ex.message + ";\r\n" + tabs(1) + ex.stack + "\r\n";
        }
        unsetBuilder(builder);
        return result;
    }

    function build(ast) {
        if (typeof ast === "string") {
            return buildFromSrc(ast);
        }
        if (typeof ast.type === "string") {
            return callBuilder(ast);
        }
        if (Array.isArray(ast)) {
            return callBuilder(ast);
        }
        throw new TypeError("undefined input for build()")
    }

    build.callBuilder = callBuilder;
    build.buildFromSrc = buildFromSrc;
    build.builder = builder;

    return build;
});

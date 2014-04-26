
/*
############################################################################################################################################################################################################

    JavaScript Codegenerator - This module transforms the AST back into ES6 Source Code.
        
############################################################################################################################################################################################################
*/

define("js-codegen", function (require, exports, module) {
    "use strict";

    var builder = {};
    var parser = require("parser");
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
/*
    var names = {
        __proto__: null,
        "VariableStatement": "variableStatement",
        "ExpressionStatement": "expressionStatement",
        "FunctionDeclaration": "functionDeclaration",
        "MethodDefinition": "methodDefinition",
        "PropertyDefinition": "propertyDefinition"
    };
*/

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
                args = [node.body, node.loc];
                break;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "GeneratorDeclaration":
            case "GeneratorExpression":
                args = [node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc];
                break;
            case "MethodDefinition":
                args = [node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc];
                break;
            case "ArrowExpression":
                args = [node.id, node.params, node.body, node.loc];
                break;
            case "ExpressionStatement":
            case "SequenceExpression":
                args = [node.expression, node.loc];
                break;
            case "VariableDeclarator":
                args = [node.id, node.init, node.loc];
                break;
            case "VariableDeclaration":
            case "LexicalDeclaration":
                args = [node.kind, node.declarations, node.loc];
                break;
            case "EmptyStatement":
                args = [node.loc];
                break;
            case "ForStatement":
                args = [node.init, node.test, node.update, node.body, node.loc];
                break;
            case "ForInStatement":
            case "ForOfStatement":
                args = [node.left, node.right, node.body, node.loc];
                break;
            case "DoWhileStatement":
            case "WhileStatement":
                args = [node.test, node.body, node.loc];
                break;
            case "LabelledStatement":
                args = [node.label, node.statement, node.loc];
                break;
            case "IfStatement":
                args = [node.test, node.consequent, node.alternate, node.loc];
                break;
            case "TryStatement":
                args = [node.block, node.guard, node.finalizer, node.loc];
                break;
            case "SwitchStatement":
                args = [node.discriminant, node.cases, node.loc];
                break;
            case "WithStatement":
                args = [node.object, node.body, node.loc];
                break;
            case "ComprehensionExpression":
                args = [node.blocks, node.filter, node.expression];
                break;
            case "AssignmentExpression":
            case "BinaryExpression":
            case "LogicalExpression":
                args = [node.operator, node.left, node.right, node.loc];
                break;
            case "UnaryExpression":
                args = [node.operator, node.argument, node.prefix, node.loc];
                break;
            case "MemberExpression":
                args = [node.object, node.property, node.computed, node.loc];
                break;
            case "CallExpression":
            case "NewExpression":
                args = [node.callee, node.arguments, node.loc];
                break;
            case "ObjectPattern":
            case "ArrayPattern":
                args = [node.elements, node.loc];
                break;
            case "BindingElement":
                args = [node.id.name, node.as.name, node.loc];
                break;
            case "ObjectExpression":
                args = [node.properties, node.loc];
                break;
            case "ArrayExpression":
                args = [node.elements, node.loc];
                break;
            case "DefaultParameter":
                args = [node.id, node.init, node.loc];
                break;
            case "RestParameter":
                args = [node.id, node.init, node.loc];
                break;
            case "SpreadExpression":
                args = [node.argument, node.loc];
                break;
            case "ClassDeclaration":
            case "ClassExpression":
                args = [node.id, node.extends, node.elements, node.expression, node.loc];
                break;
            case "ThisExpression":
            case "SuperExpression":
                args = [node.loc];
                break;
            case "Program":
                args = [node.body, node.loc];
                break;
            case "Identifier":
                args = [node.name || node.value, node.loc];
                break;
            case "ReturnStatement":
            case "ThrowStatement":
                args = [node.argument, node.loc];
                break;

            case "BreakStatement":
            case "ContinueStatement":
                args = [node.argument, node.label, node.loc];
                break;
            case "YieldExpression":
                args = [node.argument, node.delegator, node.loc];
                break;
            case "Directive":
            case "Literal":
            case "NumericLiteral":
            case "StringLiteral":
            case "NullLiteral":
            case "BooleanLiteral":
                args = [node.value, node.loc];
                break;
            case "TemplateLiteral":
                args = [node.spans, node.loc];
                break;
            case "ParenthesizedExpression":
        	args = [node.expression];
        	break;
            }

            name = name[0].toLowerCase() + name.slice(1);
            return builder[name].apply(builder, args);

        }
    }

    builder.spreadExpression = function (argument, loc) {
        var src = "..." + callBuilder(argument);
        return src;
    };

    builder.restParameter = function (id, init, loc) {
        var src = "..." + callBuilder(id);
        if (init) src += " = " + callBuilder(init);
        return src;
    };

    builder.defaultParameter = function (id, init, loc) {
        var src = "";
        src += callBuilder(id);
        src += " = ";
        src += callBuilder(init);
        return src;
    };

    builder.classExpression =
        builder.classDeclaration = function (id, extend, elements, expression, loc) {
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

    builder.program = function (body, loc) {
        var src = "";
        var inst;
        for (var i = 0, j = body.length; i < j; i++) {
            if (inst = body[i]) {
                src += tabs(indent) + callBuilder(inst) + ";" + nl();
            }
        }
        return src;
    };

    builder.bindingElement = function (name, as, initializer, loc) {
        var src = "";
        src += name;
        src += ":";
        src += as;
        if (initializer) src += " = " + callBuilder(initializer);
        return src;
    };
    builder.objectPattern = function (elements, loc) {
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
    builder.arrayPattern = function (elements, loc) {
        var src = "", e;
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
    builder.identifier = function (name, loc) {
        var src = "";
        src += name;
        return src;
    };

    builder.directive =
        builder.stringLiteral =
        builder.numericLiteral =
        builder.booleanLiteral =
        builder.literal = function (literal, loc) {
            var src = "";
            src += literal;
            return src;
    };

    builder.emptyStatement = function emptyStatement(loc) {
        var src = ";";
        return src;
    };

    builder.variableDeclarator = function (id, init, loc) {
        var src = "";
        src += id;
        return src;
    };
    builder.lexicalDeclaration =
        builder.variableDeclaration = function variableStatement(kind, declarations, loc) {
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
        function (id, params, body, loc) {
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
        builder.generatorExpression = function (id, params, body, strict, generator, expression, loc) {
            var src = "function";
            if (generator) src += "*";
            src += " ";
            if (id) src += id;
            src += this.formalParameters(params);
            src += " ";
            src += this.functionBody(body);
            return src;
    };

    builder.generatorMethod =
        builder.methodDefinition = function (id, params, body, strict, generator, loc) {
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

    builder.callExpression = function (callee, args, loc) {
        var src = "";
        src += callBuilder(callee);
        src += this.formalParameters(args);
        return src;

    };
    builder.newExpression = function (callee, args, loc) {
        var src = "new ";
        src += callBuilder(callee);
        src += this.formalParameters(args);
        return src;
    };

    builder.objectExpression = function (properties, loc) {
        var p;
        var src = "{";
        for (var i = 0, j = properties.length; i < j; i++) {
            if (p = properties[i]) {

                src += callBuilder(e);

                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        src += "}";
        return src;
    };
    builder.arrayExpression = function (elements, loc) {
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

    builder.blockStatement = function (body, loc) {
    	if (body.type === "BlockStatement") return this.blockStatement(body.body, body.loc, body.extras);
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

    builder.unaryExpression = function (operator, argument, prefix, loc) {
        var src = "";
        if (prefix) src += operator;
        src += callBuilder(argument);
        if (!prefix) src += operator;
        return src;
    };

    builder.binaryExpression = function (operator, left, right, loc) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    };

    builder.assignmentExpression = function (operator, left, right, loc) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    };

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc) {
        var src = "";
        src += callBuilder(expr);
        return src;
    };
    builder.labelledStatement = function labelledStatement(label, body, loc) {
        var src = "";
        src += label + ": ";
        src += nl();
        src += tabs(indent);
        src += callBuilder(body);
        return src;
    };
    builder.sequenceExpression = function (seq, loc) {
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
    builder.ifStatement = function ifStatement(test, condition, alternate, loc) {
        var src = tabs(indent) + "if (" + callBuilder(test) + ") " + callBuilder(condition);
        if (alternate) src += " else " + callBuilder(alternate);
        return src;
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc) {
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
    builder.whileStatement = function whileStatement(test, body, loc) {
        var src = "while (" + callBuilder(test) + ")" + callBuilder(body);
        return src;
    };
    builder.doWhileStatement = function doWhileStatement(test, body, loc) {
        var src = "do " + callBuilder(body) + " while (" + callBuilder(test) + ");";
        return src;
    };
    builder.withStatement = function withStatement(obj, body, loc) {
        var src = "with (" + callBuilder(obj) + ") " + callBuilder(body);
        return src;
    };
    builder.debuggerStatement = function debuggerStatement(loc) {
        var src = "debugger;";
        return src;
    };
    builder.tryStatement = function (block, handler, guard, finalizer, loc) {
        var src = "try " + callBuilder(block) + " catch (" + callBuilder(guard.params) + ") " + callBuilder(guard.block);
        if (finalizer) src += "finally " + callBuilder(finalizer.block);
        return src;
    };
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc) {
        var src = "for (";
        src += callBuilder(left);
        src += " in ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forOfStatement = function forOfStatement(left, right, body, loc) {
        var src = "for (";
        src += callBuilder(left);
        src += " of ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forStatement = function forStatement(init, test, update, body, loc) {
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

    builder.throwStatement = function (expression, loc) {
        var src = "throw";
        if (expression) {
            src += SPC;
            src += callBuilder(expression);
        }
        return src;
    };
    builder.breakStatement = function (label, loc) {
        var src = "break";
        if (label) {
            src += SPC;
            src += callBuilder(label);
        }
        return src;
    };
    builder.continueStatement = function (label, loc) {
        var src = "continue";
        if (label) {
            src += SPC;
            src += callBuilder(label);
        }
        return src;
    };
    builder.returnStatement = function (expression, loc) {
        var src = "return";
        if (expression) {
            src += " " + callBuilder(expression);
        }
        return src;
    };
    builder.thisExpression = function (loc) {
        return "this";
    };
    builder.superExpression = function (loc) {
        return "super";
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

        if (ast.type === "Program") {
            return callBuilder(ast);
        }
    }

    build.callBuilder = callBuilder;
    build.buildFromSrc = buildFromSrc;
    build.builder = builder;

    return build;
});

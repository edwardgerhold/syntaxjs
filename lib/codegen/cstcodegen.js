
/*
############################################################################################################################################################################################################
    A Simple JavaScript Codegenerator - This module transforms the AST back into ES6 Source Code.
    This shall become a prototype to support generating Code from a "Concrete Syntax Tree"
    
    This means, it regenerates Comments, WhiteSpaces, LineTerminators
    
    How it works?
    The build(node) function calls callBuilder(node) which is a big switch 
    for all kinds of nodes. Inside that switch the arguments array is defined. 
    This is passed to the builder interface of the mozilla parser api.
    The first node calls callBuilder(body) and each body node will be called with
    it´s appropriate builder, the whole tree down.

    -- Idea to improve Parser_API: Add a second possibility for a valid interface.
    If argument.length is 1 on all nodes, a function (node) is expected to be
    the builder. It can easily examine the whole object, which is better than the 
    fixed parameter builder interface which has to be programmed for each node by
    providing the right arguments than just the node. --- As a second option.


    this one takes the extras after the loc to change no signature but extend them by ", extras"
    
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
    var nesting = [];

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

        "VariableStatement": "variableStatement",
        "ExpressionStatement": "expressionStatement",
        "FunctionDeclaration": "functionDeclaration",
        "MethodDefinition": "methodDefinition",
        "PropertyDefinition": "propertyDefinition"

    };
    // ok, map names per function
    /*
    Object.keys(parser).forEach(function (k) {
        if (["next","scan","pass","parse"].indexOf(k) > -1) return;
        names[k] = k[0].toLowerCase() + k.slice(1);
    });
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
                args = [node.body, node.loc, node.extras];
                break;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "GeneratorDeclaration":
            case "GeneratorExpression":
                args = [node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc, node.extras];
                break;
            case "MethodDefinition":
                args = [node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc, node.extras];
                break;
            case "ArrowExpression":
                args = [node.id, node.params, node.body, node.loc, node.extras];
                break;
            case "ExpressionStatement":
            case "SequenceExpression":
                args = [node.expression, node.loc, node.extras];
                break;
            case "VariableDeclarator":
                args = [node.id, node.init, node.loc, node.extras];
                break;
            case "VariableDeclaration":
            case "LexicalDeclaration":
                args = [node.kind, node.declarations, node.loc, node.extras];
                break;
            case "EmptyStatement":
                args = [node.extras, node.loc];
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
                args = [node.block, node.guard, node.finalizer, node.loc, node.extras];
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
                args = [node.id.name, node.as.name, node.loc, node.extras];
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
            case "TemplateLiteral":
                args = [node.spans, node.loc, node.extras];
                break;
            }
            name = name[0].toLowerCase() + name.slice(1);
            return builder[/*names[*/name/*]*/].apply(builder, args);
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

    builder.bindingElement = function (name, as, initialiser, loc, extras) {
        var src = "";
        src += name;
        src += ":";
        src += as;
        if (initialiser) src += " = " + callBuilder(initialiser);
        return src;
    };
    builder.objectPattern = function (elements, loc, extras) {
        var src, e;
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
        var src, e;
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
        builder.literal = function (literal, loc, extras) {
            var src = "";
            src += literal;
            return src;
    };

    builder.emptyStatement = function emptyStatement(loc) {
        var src = ";";
        return src;
    };

    builder.variableDeclarator = function (id, init, loc, extras) {
        var src = "";
        src += id;
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
            return s

    };

    builder.functionDeclaration =
        builder.functionExpression =
        builder.generatorDeclaration =
        builder.generatorExpression = function (id, params, body, strict, generator, expression, loc, extras) {
            var src = "";
            var st;
            src = "function";
            if (generator) src += "*";
            src += " ";
            if (id) src += id;
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
    }

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

    builder.unaryExpression = function (operator, argument, prefix, loc, extras) {
        var src = "";
        if (prefix) src += operator;
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
    }

    builder.assignmentExpression = function (operator, left, right, loc, extras) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    }

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc, extras) {
        var src = "";
        src += callBuilder(expr);
        return src;
    };
    builder.labelledStatement = function labelledStatement(label, body, loc, extras) {
        var src;
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
        if (alternate) src += " else " + callBuilder(alternate);
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
        var src = "with (" + callBuilder(obj) + ") " + callBuilder(body);
        return src;
    };
    builder.debuggerStatement = function debuggerStatement(loc) {
        var src = "debugger;";
        return src;
    };
    builder.tryStatement = function (block, handler, guard, finalizer, loc, extras) {
        var src = "try " + callBuilder(block) + " catch (" + callBuilder(guard.params) + ") " + callBuilder(guard.block);
        if (finalizer) src += "finally " + callBuilder(finalizer.block);
        return src;
    };
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc, extras) {
        var src = "for ("
        src += callBuilder(left);
        src += " in ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forOfStatement = function forOfStatement(left, right, body, loc, extras) {
        var src = "for ("
        src += callBuilder(left);
        src += " of ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forStatement = function forStatement(init, test, update, body, loc, extras) {
        var src = "for ("
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
        } finally {
            return result;
        }
        unsetBuilder(builder);
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

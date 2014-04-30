define("compiler", function (require, exports, module) {
    "use strict";

    var builder = {};
    var code; // one long array with code
    var parser = require("parser").parser;
    var parseGoal = parser.parseGoal;
    var setBuilder = parser.setBuilder;
    var unsetBuilder = parser.unsetBuilder;

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
        var arr;
        if (!node) return null;
        if (Array.isArray(node)) {
            var arr = [];
            var stm;
            for (var i = 0, j = node.length; i < j; i++) {
                if (stm = node[i]) {
                    arr.push(callBuilder(stm));
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
                case "ParenthesizedExpression":
                case "ExpressionStatement":
                    args = [node.expression, node.loc, node.extras];
                    break;
                case "SequenceExpression":
                    args = [node.sequence, node.loc, node.extras];
                    break;
                case "VariableDeclarator":
                    args = [node.id, node.init, node.loc, node.extras];
                    break;
                case "VariableDeclaration":
                case "LexicalDeclaration":
                    args = [node.kind, node.declarations, node.loc, node.extras];
                    break;
                case "EmptyStatement":
                    args = [node.loc, node.extras];
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
            var fn = builder[names[name]];
            if (fn) return fn.apply(builder, args);
            else throw new TypeError("can not generate code for " + name);
        }
    }

    builder.spreadExpression = function (argument, loc, extras) {
    };

    builder.restParameter = function (id, init, loc, extras) {
    };

    builder.defaultParameter = function (id, init, loc, extras) {
    };

    builder.classExpression =
        builder.classDeclaration = function (id, extend, elements, expression, loc, extras) {
        };

    builder.program = function (body, loc, extras) {
    };

    builder.bindingElement = function (name, as, initializer, loc, extras) {
    };
    builder.objectPattern = function (elements, loc, extras) {
    };
    builder.arrayPattern = function (elements, loc, extras) {
    };
    builder.identifier = function (name, loc, extras) {
    };

    builder.directive =
        builder.stringLiteral =
            builder.numericLiteral =
                builder.booleanLiteral =
                    builder.nullLiteral =
                    builder.literal = function (literal, loc, extras) {
                    };

    builder.emptyStatement = function emptyStatement(loc, extras) {
    };

    builder.variableDeclarator = function (id, init, loc, extras) {
    };
    builder.lexicalDeclaration =
        builder.variableDeclaration = function variableStatement(kind, declarations, loc, extras) {
        };

    builder.functionBody = function (body) {
    };

    builder.arrowExpression =
        function (id, params, body, loc, extras) {
        };

    builder.functionDeclaration =
        builder.functionExpression =
            builder.generatorDeclaration =
                builder.generatorExpression = function (id, params, body, strict, generator, expression, loc, extras) {
                };

    builder.generatorMethod =
        builder.methodDefinition = function (id, params, body, strict, generator, loc, extras) {
        };

    builder.formalParameters = function (formals) {
    };

    builder.memberExpression = function (object, property, computed) {
    };

    builder.callExpression = function (callee, args, loc, extras) {
    };
    builder.newExpression = function (callee, args, loc, extras) {
    };

    builder.objectExpression = function (properties, loc, extras) {
    };
    builder.arrayExpression = function (elements, loc, extras) {
    };

    builder.blockStatement = function (body, loc, extras) {
    };
    builder.unaryExpression = function (operator, argument, prefix, loc, extras) {
    };

    builder.binaryExpression = function (operator, left, right, loc, extras) {
    };

    builder.assignmentExpression = function (operator, left, right, loc, extras) {
    };

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc, extras) {
    };
    builder.labelledStatement = function labelledStatement(label, body, loc, extras) {
    };
    builder.sequenceExpression = function (seq, loc, extras) {
    };
    builder.ifStatement = function ifStatement(test, condition, alternate, loc, extras) {
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc, extras) {
    };
    builder.whileStatement = function whileStatement(test, body, loc, extras) {
    };
    builder.doWhileStatement = function doWhileStatement(test, body, loc, extras) {
    };
    
    builder.withStatement = function withStatement(obj, body, loc, extras) {
    };
    builder.debuggerStatement = function debuggerStatement(loc, extras) {
    };

    builder.parenthesizedExpression = function (expression, loc, extras) {
    };
    builder.tryStatement = function (block, guard, finalizer, loc, extras) {
    };
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc, extras) {
    };
    builder.forOfStatement = function forOfStatement(left, right, body, loc, extras) {
    };
    builder.forStatement = function forStatement(init, test, update, body, loc, extras) {
    };

    builder.throwStatement = function (expression, loc, extras) {
    };
    builder.breakStatement = function (label, loc, extras) {
    };
    builder.continueStatement = function (label, loc, extras) {
    };
    builder.returnStatement = function (expression, loc, extras) {
    };
    builder.thisExpression = function (loc, extras) {
    };
    builder.superExpression = function (loc, extras) {
    };

    builder.conditionalExpression = function (test, consequent, alternate, loc, extras) {
    };

    builder.whiteSpace = function (value, loc) {
    };
    builder.lineComment = function(value, loc) {
    };
    builder.multiLineComment = function (value, loc) {
    };
    builder.lineTerminator = function (value, loc) {
    };


    function buildFromSrc(src) {
        //setBuilder(builder, true);
        try {
            var result = parser(src, { builder: builder });
        } catch (ex) {
            result = "[" + ex.name + "]" + ex.message + ";\r\n" + tabs(1) + ex.stack + "\r\n";
        }
        //unsetBuilder(builder);
        return result;
    }

    function build(ast) {
        code = [];
        if (typeof ast === "string") {
            return buildFromSrc(ast);
        }
        if (Array.isArray(ast)) {
            return callBuilder(ast);
        }
        if (typeof ast.type === "string") {
            return callBuilder(ast);
        }
        throw new TypeError("compiler(): undefined input for build()")
    }

    build.callBuilder = callBuilder;
    build.buildFromSrc = buildFromSrc;
    build.builder = builder;
    return build;
});

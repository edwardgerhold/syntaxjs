
/*
############################################################################################################################################################################################################

    A Codegenerator which transforms the AST nodes into a smaller format.

    This could be stored on the heap. But i should make sure to write them independently.

    This file will fulfill using the mozilla parser api builder interface.

############################################################################################################################################################################################################
*/

define("builder", function (require, exports, module) {
    var builder = exports;

    var byteCode = {
        "loc": 999,
        "true": 1,
        "false": 0,
        "EmptyStatement": -127,
        "AssignmentExpression": 32,
        "Expression": 43,
        "SequenceExpression" : 45,
        "VariableDeclaration" : 33,
        "VariableDeclarationList": 34,
        "LexicalDeclaration": 37,
        "GeneratorBody" : 324,
        "FunctionDeclaration": 112,
        "FunctionExpression": 113,
        "Identifer": 45,
        "NumericLiteral": 46,
        "BooleanLiteral": 67,
        "NullLiteral": 95,
        "TemplateLiteral": 244,
        "RegularExpressionLiteral": 300,
        "StatementList": 2321,
        "SwitchStatement": 455,
        "WhileStatement": 2512,
        "DoWhileStatement": 235
        "ForStatement": 2556,
        "ForInStatement": 2342,
        "ForOfStatement": 2345,
        "IfStatement": 100,
        "ReturnStatement": 23,
        "ThrowStatement": 74,
        "ContinueStatement": 84,
        "BreakStatement": 85,
        "YieldExpression": 24,
        "CallExpression": 44,
        "NewExpression": 234,
        "MemberExpression": 25,
        "ObjectExpression": 474,
        "ArrayExpression": 2355,
        "ArrayPattern" : 556,
        "ObjectPattern": 663,
        "ArrayComprehension": 552,
        "GeneratorComprehension": 252,
        "ArrayExpression": 242,
        "BinaryExpression": 2223,
        "let": 2344,
        "const": 6362,
        "var": 6376
    };
    var byteDecoder = {};
    for (var k in byteCode) {
        if (Object.hasOwnProperty.call(byteCode, k))
        byteDecoder[byteCode[k]] = k;
    }

    var nodeFields {
       "type": 0,
       "body": 1,
       "left": 1,
       "kind": 1,
       "argument": 1,
       "right": 2,
       "operator": 3
    }:

    function locArray(loc) {
        return [byteCode["loc"], loc.start.line,loc.start.column, loc.end.line, loc.end.column];
    }
    function byteString(str) {
       var a = [];
        for (var i = 0; i < str.length; i++) a.push(str.charCodeAt(i));
        return a;
    }

    builder.emptyStatement = function emptyStatement(loc) {
        return [byteCode["EmptyStatement"]];
    };

    builder.literal = function (type, value) {
        return [byteCode[type],
                value];
    };

    builder.functionDeclaration = function (body, params, strict, generator, loc) {

        return [byteCode["FunctionDeclaration"],
                callBuilder(body),
                callBuilder(params),
                +strict,
                +generator,
                locArray(loc)];
    };
    builder.functionExpression = function (body, params, strict, generator, loc) {
        return [byteCode["FunctionExpression"],
            callBuilder(body),
            callBuilder(params),
            +strict,
            +generator,
            locArray(loc)];
    };

    builder.variableStatement = function variableStatement(kind, decls, loc) {
        return [byteCode["VariableStatement"],
                byteCode[kind],
                callBuilder(decls),
                locArray(loc)
                ];
    };

    builder.callExpression = function (callee, args, loc) {
            return [byteCode["CallExpression"],
                callBuilder(callee),
                callBuilder(args),
                locArray(loc)];
    };
    builder.newExpression = function (callee, args, loc) {
        return [byteCode["NewExpression"],
            callBuilder(callee),
            callBuilder(args),
            locArray(loc)];
    };
    builder.objectExpression = function (properties, loc) {
        return [byteCode["ObjectExpression"],
        callBuilder(properties),
        locArray(loc)];
    };
    builder.arrayExpression = function (elements, loc) {
        return [byteCode["ArrayExpression"],
            callBuilder(elements),
            locArray(loc)];
    };

    builder.blockStatement = function (body, loc) {
        return [byteCode["BlockStatement"],
        callBuilder(body),
        locArray(loc)];
    };
    builder.binaryExpression = function (left, operator, right, loc) {
        return [byteCode["BinaryExpression"],
        callBuilder(left),
        callBuilder(right),
        byteCode[operator]
        locArray(loc)];
    };
    builder.assignmentExpression = function (left, operator, right, loc) {
        return [byteCode["AssignmentExpression"],
            callBuilder(left),
            callBuilder(right),
            byteCode[operator]
            locArray(loc)];
    };
    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc) {};
    builder.labeledStatement = function labeledStatement(label, body, loc) {};
    builder.sequenceExpression = function (seq, loc) {};
    builder.ifStatement = function ifStatement(test, condition, alternate, loc) {};
    builder.switchStatement = function (discriminant, cases, isLexical, loc) {};
    builder.whileStatement = function whileStatement(test, body, loc) {};
    builder.withStatement = function withStatement(obj, body, loc) {};
    builder.debuggerStatement = function debuggerStatement(loc) {};
    builder.tryStatement = function (block, handler, guard, finalizer, loc) {};
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc) {};
    builder.forOfStatement = function forOfStatement(left, right, body, loc) {};
    builder.forOfStatement = function forOfStatement(init, condition, update, body, loc) {};
    builder.doWhileStatement = function doWhileStatement(body, test, loc) {};
    builder.throwStatement = function (expression, loc) {
        return [byteCode["ThrowStatement"],
            callBuilder(expression),
            locArray(loc)
        ];
    };
    builder.breakStatement = function (label, loc) {
        return [byteCode["BreakStatement"],
            byteString(label),
            locArray(loc)];
    };
    builder.continueStatement = function (label, loc) {
        return [byteCode["ContinueStatement"],
        byteString(label),
        locArray(loc)];
    };
    builder.returnStatement = function (expression, loc) {
        return [byteCode["ReturnStatement"],
            callBuilder(expression),
            locArray(loc)
        ];
    };

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
                case "TemplateLiteral":
                    args = [node.value, node.loc];
                    break;
            }
            name = name[0].toLowerCase() + name.slice(1);
            return builder[name].apply(builder, args);
        }
    }
    builder.callBuilder = callBuilder;
    return builder;
});

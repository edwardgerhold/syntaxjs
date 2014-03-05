
/*
############################################################################################################################################################################################################

    A codegenerator, which transforms the AST into an Array.
    This is a version, where the builder has to be called on the complete AST, because it goes down recursivly.
    A second version, which will be the "update" of this one, will do it only the node passed in at a time,
    which means, that nodes passed in are already put into byte code format.
    Probably the second version will do heap writes or return one typed array instead of returning nested arrays,
    like this one, for making it easy.

    Almost parallel, the runtime.js will be updated to supported interface-driven access to the ir code. That makes
    it possible to read an array instead of the parser api ast nodes.

    In the other version offsets are passed as parameters instead of objects, then i just store the offsets together
    with the node (in one large typed array).

############################################################################################################################################################################################################
*/

define("builder", function (require, exports, module) {
    var builder = exports;

    var byteCode = {
        "loc": 999,
        "true": 1,
        "false": 0,
        "null": - 1,
        "undefined": -2,
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
        "DoWhileStatement": 235,
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
        "Directive": 111,
        "ArrayComprehension": 552,
        "GeneratorComprehension": 252,
        "MethodDefinition": 499,
        "PropertyDefinition": 588,
        "PropertyDefinitionList": 785,
        "BinaryExpression": 2223,
        "ThisStatement": 266,
        "SuperExpression": 377,
        "DebuggerStatement": 999,
        "DefaultCase": 177,
        "SwitchCase": 189,
        "Finally": 200,
        "ModuleDeclaration": 777,
        "ExportStatement": 776,
        "ImportStatement": 988,

        "let": 2344,
        "const": 6362,
        "var": 6376
    };
    var byteDecoder = {};
    for (var k in byteCode) {
        if (Object.hasOwnProperty.call(byteCode, k))
        byteDecoder[byteCode[k]] = k;
    }

    var nodeFields = {
       "type": 0,
       "body": 1,
       "left": 1,
       "kind": 1,
       "argument": 1,
       "right": 2,
       "operator": 3
    };

    function locArray(loc) {
        return [byteCode["loc"], loc.start.line,loc.start.column, loc.end.line, loc.end.column];
    }
    function byteString(str) {
        //var a = [];
        //for (var i = 0; i < str.length; i++) a.push(str.charCodeAt(i));
        //return a;
        return str;
    }

    builder.emptyStatement = function emptyStatement(loc) {
        return [byteCode["EmptyStatement"],
        locArray(loc)];
    };

    builder.directive = function (directive, loc) {
      return [byteCode["Directive"],
      byteString(directive),
      locArray(loc)]
    };

    builder.literal = function (type, value, loc) {
        return [byteCode[type],
                value];
    };

    builder.identifier = function (name) {
       return [byteCode["Identifier"], byteString(name)];
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
        byteCode[operator],
        locArray(loc)];
    };
    builder.assignmentExpression = function (left, operator, right, loc) {
        return [byteCode["AssignmentExpression"],
            callBuilder(left),
            callBuilder(right),
            byteCode[operator],
            locArray(loc)];
    };
    builder.propertyDefinition = function (id, expr, loc) {
        return [
            byteCode["PropertyDefinition"],
            byteString(id),
            callBuilder(expr),
            locArray(loc)
        ];
    };
    builder.methodDefinition = function (id, params, body, strict, statics, generator, loc) {
        return [
            byteCode["MethodDefinition"],
            byteString(id),
            callBuilder(params),
            callBuilder(body),
            +strict,
            +statics,
            +generator,
            locArray(loc)
        ];
    };

    builder.bindingElement = function (name, as, loc) {
        return [byteCode["BindingElement"],
            byteString(name),
            byteString(as),
        locArray(loc)]
    };

    builder.pattern =
    builder.arrayPattern =
    builder.objectPattern = function (properties, loc) {
        var bc = [];
        for (var i = 0, j = properties.length; i < j; i++) {
            bc.push(callBuilder(properties[i]));
        }
        bc.push(locArray(loc));
        return bc;
    };
    builder.expressionStatement = function expressionStatement(expr, loc) {
        return [
        byteCode["ExpressionStatement"],
            callBuilder(expr),
        locArray(loc)];

    };
    builder.labeledStatement = function labeledStatement(label, body, loc) {
        return [
            byteCode["LabeledStatement"],
            callBuilder(body),
            locArray(loc)
        ];
    };
    builder.sequenceExpression = function (seq, loc) {
        return [
            byteCode["SequenceExpression"],
            callBuilder(seq),
            locArray(loc)
        ];
    };
    builder.ifStatement = function ifStatement(test, condition, alternate, loc) {
        return [byteCode["IfStatement"],
            callBuilder(condition),
            callBuilder(alternate),
            locArray(loc)
        ];
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc) {
        var bc = [
            byteCode["SwitchStatement"],
            callBuilder(discriminant)
        ];
        var scbc = [];
        for (var i = 0, j = cases.length; i < j; i++) {
            scbc.push(callBuilder(cases[i]));
        }
        bc.push(scbc);
        bc.push(locArray(loc));
        return bc;
    };
    builder.whileStatement = function whileStatement(test, body, loc) {
        return [
            byteCode["WhileStatement"],
            callBuilder(test),
            callBuilder(body),
            locArray(loc)
        ];
    };
    builder.withStatement = function withStatement(obj, body, loc) {
        return [
            byteCode["WithStatement"],

            callBuilder(body),
            locArray(loc)
        ];
    };
    builder.debuggerStatement = function debuggerStatement(loc) {
        return [byteCode["DebuggerStatement"], locArray(loc)];
    };
    builder.tryStatement = function (block, handler, guard, finalizer, loc) {
        return [
            byteCode["TryStatement"],
            callBuilder(block),
            callBuilder(handler),
            callBuilder(finalizer),
            locArray(loc)
        ];
    };
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc) {
        return [
            byteCode["ForInStatement"],
            callBuilder(left),
            callBuilder(right),
            callBuilder(body),
            locArray(loc)
        ];
    };
    builder.forOfStatement = function forOfStatement(left, right, body, loc) {
        return [
            byteCode["ForOfStatement"],
            callBuilder(left),
            callBuilder(right),
            callBuilder(body),
            locArray(loc)
        ];

    };
    builder.forStatement = function forStatement(init, condition, update, body, loc) {
        return [
            byteCode["ForStatement"],
            callBuilder(init),              // later
            callBuilder(condition),         // these
            callBuilder(update),            // fn return
            callBuilder(body),              // just offsets
            locArray(loc)                   // for the heap
        ];

    };
    builder.doWhileStatement = function doWhileStatement(body, test, loc) {
        return [
            byteCode["DoWhileStatement"],
            callBuilder(body),
            callBuilder(test),
            locArray(loc)
        ];
    };
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
            var result = [];
            var stm;
            for (var i = 0, j = node.length; i < j; i++) {
                if (stm = node[i]) {
                    result.push( callBuilder(stm) );
                }
            }
            return result;
        } else if (typeof node === "string") {
            return byteString(node);
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
                    args = [node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc];
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
                case "PropertyDefinition":
                    args = [node.kind, node.key, node.value, node.loc];
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

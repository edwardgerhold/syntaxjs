
/*
############################################################################################################################################################################################################

    A Codegenerator which transforms the AST nodes into a smaller format.

    This could be stored on the heap. But i should make sure to write them independently.

    This file will fulfill using the mozilla parser api builder interface.

############################################################################################################################################################################################################
*/

define("builder", function (require, exports, module) {
    var builder = exports;


    builder.emptyStatement = function emptyStatement(loc) {
    };

    builder.literal = function (type, value) {
    };

    builder.functionDeclaration = function (body, params, strict, generator, loc) {};
    builder.functionExpression = function (body, params, strict, generator, loc) {};

    builder.variableStatement = function variableStatement(kind, decls, loc) {};

    builder.callExpression = function (callee, args, loc) {};
    builder.newExpression = function (callee, args, loc) {};
    builder.objectExpression = function (properties, loc) {
    };
    builder.arrayExpression = function (elements, loc) {
    };

    builder.blockStatement = function (body, loc) {};
    builder.binaryExpression = function (left, operator, right, loc) {

    };
    builder.assignmentExpression = function (left, operator, right, loc) {
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
    builder.throwStatement = function (expression, loc) {};
    builder.breakStatement = function (label, loc) {};
    builder.continueStatement = function (label, loc) {};
    builder.returnStatement = function (expression, loc) {};

    return builder;
});

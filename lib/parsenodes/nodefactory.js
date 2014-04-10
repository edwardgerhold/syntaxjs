/*
    refactoring the parser
    ----------------------

    this node factory bases on the builder pattern of the Parser_API

    the compiler factory bases on the same patterns.

    plan: go through all productions and simply call the builder at the
    end. It is exchangable then.
    And compatible to other tools. But not long...

    PROBLEM:

    What about the NEW properties.
    I have to decide to add the arguments to the interface.
    This makes it incompatible again.
    But future proof or update-ready. ;

 */

define("nodefactory", function () {

    var builder = {};
    builder.program = function (body, strict, loc, extras) {
        return {
            type: "Program",
            body: "body",
            strict: strict,
            loc: loc,
            extras: extras
        };
    };
    builder.variableDeclarator = function (id, init, loc, extras) {
        return {
            type: "VariableDeclarator",
            id: id,
            init: init,
            loc: loc,
            extras: extras
        };
    };
    builder.lexicalDeclaration = function (kind, declarations, loc, extras) {
        return {
            type: "LexicalDeclaration",
            kind: kind,
            declarations: declarations,
            loc: loc,
            extras: extras
        };
    };
    builder.variableDeclaration = function (kind, declarations, loc, extras) {
        return {
            type: "VariableDeclaration",
            kind: kind,
            declarations: declarations,
            loc: loc,
            extras: extras
        };
    };
    builder.functionDeclaration = function (id, formals, body, strict, loc, extras) {
        return {
            type: "FunctionDeclaration",
            params: params,
            body: body,
            strict: strict,
            loc: loc,
            extras: extras
        };
    };
    builder.spreadExpression = function (argument, loc, extras) {
    };
    builder.restParameter = function (id, init, loc, extras) {
    };
    builder.defaultParameter = function (id, init, loc, extras) {
    };
    builder.classExpression =
    builder.classDeclaration = function (id, extend, elements, expression, loc, extras) {
    };
    builder.bindingElement = function (name, as, initialiser, loc, extras) {
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
    builder.literal = function (literal, loc, extras) {

    };
    builder.emptyStatement = function (loc, extras) {

    };



    builder.functionBody = function (body) {
    };
    builder.arrowExpression = function (id, params, body, loc, extras) {
    };
    builder.functionDeclaration =
    builder.functionExpression =
    builder.generatorDeclaration =
    builder.generatorExpression = function (id, params, body, strict, generator, expression, loc, extras) {
        var type;
        if (expression) {
            type = generator ? "GeneratorExpression" : "FunctionExpression";
        } else {
            type = generator ? "GeneratorDeclaration": "FunctionDeclaration";
        }
        return {
            type: "type",
            strict: strict,
            generator: generator,
            expression: expression,
            params: params,
            body: body,
            loc: loc,
            extras: extras
        };
    };
    builder.generatorMethod =
    builder.methodDefinition = function (id, params, body, strict, generator, loc, extras) {
    };
    builder.formalParameters = function (formals) {
    };
    builder.memberExpression = function (object, property, computed, loc, extras) {
        return {
           type: "MemberExpression",
           object: object,
           property: property,
           computed: computed,
           loc: loc,
           extras: extras
        };
    };
    builder.callExpression = function (callee, args, loc, extras) {
        return {
            type: "CallExpression",
            callee: callee,
            params: args,
            loc: loc,
            extras: extras
        };
    };
    builder.newExpression = function (callee, args, loc, extras) {
    };
    builder.objectExpression = function (properties, loc, extras) {
    };
    builder.arrayExpression = function (elements, loc, extras) {
        return {
            type: "ArrayExpression",
            elements: elements,
            loc: loc,
            extras: extras
        };
    };
    builder.blockStatement = function (body, loc, extras) {
        return {
            type: "BlockStatement",
            body: body,
            loc: loc,
            extras: extras
        };
    };
    builder.unaryExpression = function (operator, argument, prefix, loc, extras) {
        return {
            type: "UnaryExpression",
            operator: operator,
            argument: argument,
            prefix: prefix,
            loc: loc,
            extras: extras
        };
    };
    builder.binaryExpression = function (operator, left, right, loc, extras) {
        return {
            type: "BinaryExpression",
            operator: operator,
            left: left,
            right: right,
            loc: loc,
            extras: extras
        };
    };
    builder.assignmentExpression = function (operator, left, right, loc, extras) {
        return {
            type: "AssignmentExpression",
            operator: operator,
            left: left,
            right: right,
            loc: loc,
            extras: extras
        };
    };
    builder.expressionStatement = function (expr, loc, extras) {
        return {
            type: "ExpressionStatement",
            expression: expr,
            loc: loc,
            extras: extras
        };
    };
    builder.labelledStatement = function (label, body, loc, extras) {
        return {
            type: "LabelledStatement",
            label: label,
            body: body,
            loc: loc,
            extras: extras
        };
    };
    builder.sequenceExpression = function (seq, loc, extras) {
        return {
            type: "SequenceExpression",
            sequence: seq,
            loc: loc,
            extras: extras
        };
    };
    builder.ifStatement = function (test, condition, alternate, loc, extras) {
        return {
            type: "IfStatement",
            condition: condition,
            alternate: alternate,
            loc: loc,
            extras: extras
        };
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc, extras) {
        return {
            type: "SwitchStatement",
            discriminant: discriminant,
            cases: cases,
            isLexical: isLexical,
            loc: loc,
            extras: extras
        };
    };
    builder.whileStatement = function (test, body, loc, extras) {
        return {
            type: "WhileStatement",
            test: test,
            body: body,
            loc: loc,
            extras: extras
        };
    };
    builder.doWhileStatement = function (test, body, loc, extras) {
        return {
            type: "DoWhileStatement",
            test: test,
            body: body,
            loc: loc,
            extras: extras
        };
    };
    builder.withStatement = function (obj, body, loc, extras) {
        return {
            type: "WithStatement",
            object: obj,
            body: body,
            loc: loc,
            extras: extras
        };
    };
    builder.debuggerStatement = function (loc, extras) {
        return {
            type: "DebuggerStatement",
            loc: loc,
            extras: extras
        };
    };
    builder.tryStatement = function (block, handler, guard, finalizer, loc, extras) {
        return {
            type: "TryStatement",
            block: block,
            handler: handler,
            guard: guard,
            finalizer: finalizer,
            loc: loc,
            extras: extras
        };
    };
    builder.forInStatement = function (left, right, body, isForEach, loc, extras) {
    };
    builder.forOfStatement = function (left, right, body, loc, extras) {
    };
    builder.forStatement = function (init, test, update, body, loc, extras) {
    };
    builder.throwStatement = function (expression, loc, extras) {
    };
    builder.breakStatement = function (label, loc, extras) {
    };
    builder.continueStatement = function (label, loc, extras) {
    };
    builder.returnStatement = function (argument, loc, extras) {
        return {
          type: "ReturnStatement",
          argument: argument
          loc: loc,
          extras: extras
        };
    };
    builder.thisExpression = function (loc, extras) {
        return {
            type: "ThisExpression",
            loc: loc,
            extras: extras
        };
    };
    builder.superExpression = function (loc, extras) {
        return {
            type: "SuperExpression",
            loc: loc,
            extras: extras
        };
    };
    return builder;
});

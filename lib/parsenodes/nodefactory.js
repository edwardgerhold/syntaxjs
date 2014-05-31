define("nodefactory", function () {

    var simpleId = 0;
    
    var NodePrototype = {};
       
    builder.program = function (body, strict, loc, extras) {
        return { 
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "Program",
            body: body,
            strict: strict,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.variableDeclarator = function (id, init, loc, extras) {
        return { 
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "VariableDeclarator",
            kind: kind,
            id: id,
            init: init,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.lexicalDeclaration = function (kind, declarations, loc, extras) {
        return { 
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "LexicalDeclaration",
            kind: kind,
            declarations: declarations,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.variableDeclaration = function (kind, declarations, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "VariableDeclaration",
            kind: kind,
            declarations: declarations,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.functionDeclaration = function (id, formals, body, strict, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "FunctionDeclaration",
            params: params,
            body: body,
            strict: strict,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.spreadExpression = function (argument, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "SpreadExpression",
            argument: argument,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.restParameter = function (id, init, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "RestParameter",
            id: id,
            init: init,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.defaultParameter = function (id, init, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "DefaultParameter",
            id: id,
            init: init,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.classExpression =
    builder.classDeclaration = function (id, extend, elements, expression, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ClassDeclaration",
            id: id,
            extend: extend,
            elements: elements,
            expression: expression,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.bindingElement = function (name, target, initializer, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "BindingElement",
            name: name,
            target: target,
            init: initializer,
            loc: loc,
            extras: extras,
            parent: undefined
        };
    };
    builder.objectPattern = function (elements, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ObjectPattern",
            elements: elements,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.arrayPattern = function (elements, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ArrayPattern",
            elements: elements,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.identifier = function (name, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "Identifier",
            name: name,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.directive= function (directive, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "Directive",
            value: directive,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.stringLiteral =
    builder.numericLiteral =
    builder.booleanLiteral =
    builder.literal = function (literal, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "Literal",
            value: literal,
            loc: loc,
            extras: extras, parent: undefined
        };
    };


    builder.emptyStatement = function (loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "EmptyStatement",
            loc: loc,
            extras: extras, parent: undefined
        };
    };

    builder.functionBody = function (body) {
        var node = [];
        for (var i = 0, j = body.length; i < j; i++) {
            node.push(body[i]);
        }
        node.type = "StatementList";
        return node;
    };
    builder.arrowExpression = function (id, params, body, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ArrowExpression",
            strict: true,
            params: params,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
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
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: type,
            strict: strict,
            generator: generator,
            expression: expression,
            params: params,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.generatorMethod =
    builder.methodDefinition = function (id, params, body, strict, generator, kind, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "MethodDefinition",
            id: id,
            strict: strict,
            generator: generator,
            kind: kind,
            params: params,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };

    };
    builder.formalParameters = function (formals) {
        var node = [];
        for (var i = 0, j = formals.length; i < j; i++) {
            node.push(formals[i]);
        }
        node.type = "FormalParameterList";
        return node;
    };
    builder.memberExpression = function (object, property, computed, loc, extras) {
        return { 
            _proto_: NodePrototype, 
            nodeId: ++simpleId,
           type: "MemberExpression",
           object: object,
           property: property,
           computed: computed,
           loc: loc,
           extras: extras, parent: undefined
        };
    };
    builder.callExpression = function (callee, args, loc, extras) {
        return { 
            _proto_: NodePrototype, 
            nodeId: ++simpleId,
            type: "CallExpression",
            callee: callee,
            params: args,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.newExpression = function (callee, args, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "NewExpression",
            callee: callee,
            params: args,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.objectExpression = function (properties, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ObjectExpression",
            properties: properties,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.arrayExpression = function (elements, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ArrayExpression",
            elements: elements,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.blockStatement = function (body, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "BlockStatement",
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.unaryExpression = function (operator, argument, prefix, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "UnaryExpression",
            operator: operator,
            argument: argument,
            prefix: prefix,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.binaryExpression = function (operator, left, right, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "BinaryExpression",
            operator: operator,
            left: left,
            right: right,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.assignmentExpression = function (operator, left, right, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "AssignmentExpression",
            operator: operator,
            left: left,
            right: right,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.expressionStatement = function (expr, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "ExpressionStatement",
            expression: expr,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.labelledStatement = function (label, body, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "LabelledStatement",
            label: label,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.sequenceExpression = function (seq, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "SequenceExpression",
            sequence: seq,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.ifStatement = function (test, condition, alternate, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "IfStatement",
            condition: condition,
            alternate: alternate,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "SwitchStatement",
            discriminant: discriminant,
            cases: cases,
            isLexical: isLexical,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.whileStatement = function (test, body, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "WhileStatement",
            test: test,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.doWhileStatement = function (test, body, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "DoWhileStatement",
            test: test,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.withStatement = function (obj, body, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "WithStatement",
            object: obj,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.debuggerStatement = function (loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "DebuggerStatement",
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.tryStatement = function (block, handler, guard, finalizer, loc, extras) {
        return { _proto_: NodePrototype, nodeId: ++simpleId,
            type: "TryStatement",
            block: block,
            handler: handler,
            guard: guard,
            finalizer: finalizer,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.forInStatement = function (left, right, body, isForEach, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ForInStatement",
            left: left,
            right: right,
            isForEach: isForEach,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.forOfStatement = function (left, right, body, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ForOfStatement",
            left: left,
            right: right,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.forStatement = function (init, test, update, body, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ForStatement",
            init: init,
            test: test,
            update: update,
            body: body,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.throwStatement = function (expression, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ThrowStatement",
            expression: expression,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.breakStatement = function (label, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "BreakStatement",
            label: label,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.continueStatement = function (label, loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ContinueStatement",
            label: label,
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.returnStatement = function (argument, loc, extras) {
        return {
          _proto_: NodePrototype,
          nodeId: ++simpleId,
          type: "ReturnStatement",
          argument: argument,
          loc: loc,
          extras: extras, parent: undefined
        };
    };
    builder.thisExpression = function (loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "ThisExpression",
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    builder.superExpression = function (loc, extras) {
        return {
            _proto_: NodePrototype,
            nodeId: ++simpleId,
            type: "SuperExpression",
            loc: loc,
            extras: extras, parent: undefined
        };
    };
    return builder;
});

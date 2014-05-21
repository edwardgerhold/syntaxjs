define("queryselector", function (require, exports) {

function matchesQuery(node, query) {
    "use strict";
    var propName;
    var typeName;
    switch(query[0]) {
        case ".":
            propName = query.slice(1);
            break;
        default:
            typeName = query;
            break;
    }
    if (propName && (propName in node)) return true;
    else if (typeName && (node.type === typeName)) return true;
    return false;
}

function querySelectorAll(node, query) {
    "use strict";
    var stack = [];
     var nodes = [];
     var i, j;

    // querySelector(node, "CallExpression") returns all CallExpressions from the node on
    // querySelector(node, ".id") returns all nodes with an .id property from the node on

    stack.push(node);

    while (node = stack.pop()) {

        if (matchesQuery(node, query)) nodes.push(node);

        switch (node.type) {
            case "Program":
                // // return {type:type,_id_:++nodeId,strict:undefined,body:undefined,loc:undefined,extras:undefined};
                for (i = node.body.length - 1; i >= 0; i--) {
                    stack.push(node.body[i]);
                }
                break;
            case "Identifier":
                break;
            // // return {type:type,_id_:++nodeId,name:undefined,loc:undefined,extras:undefined};
            case "ParenthesizedExpression":
            case "ExpressionStatement":
                stack.push(node.expression);
                break;
            // // return {type:type,_id_:++nodeId,expression:undefined,loc:undefined,extras:undefined};
            case "LexicalDeclaration":
            case "VariableDeclaration":
                for (i = node.declarations.length - 1; i >= 0; i--) {
                    stack.push(node.declarations[i]);
                }
                break;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "GeneratorDeclaration":
            case "GeneratorExpression":
            case "MethodDefinition":
                for (i = node.body.length - 1; i >= 0; i--) {
                    stack.push(node.body[i]);
                }
                // / // return {type:type,_id_:++nodeId,expression:undefined,generator:undefined,strict:undefined,id:undefined,params:undefined,body:undefined,loc:undefined,extras:undefined};
                break;
            case "ArrowExpression":
                if (Array.isArray(node.body)) {
                    for (i = node.body.length - 1; i >= 0; i--) {
                        stack.push(node.body[i]);
                    }
                } else {
                    stack.push(node.body);
                }
                // // return {type:type,_id_:++nodeId,params:undefined,body:undefined,loc:undefined,ebxtras:undefined};
                //stack.push(node);
                break;
            case "NumericLiteral":
            case "StringLiteral":
            case "BooleanLiteral":
            case "Literal":
                // // return {type:type,_id_:++nodeId,value:undefined,loc:undefined,extras:undefined}

                break;
            case "TemplateLiteral":
                // // return {type:type,_id_:++nodeId,spans:undefined,loc:undefined,extras:undefined}
                break;
            case "ObjectExpression":
                // // return {type:type,_id_:++nodeId,properties:undefined,loc:undefined,extras:undefined};
                for (i = node.properties.length - 1; i >= 0; i--) {
                    stack.push(node.properties[i]);
                }
                break;
            case "ArrayExpression":
                // // return {type:type,_id_:++nodeId,elements:undefined,loc:undefined,extras:undefined};
                for (i = node.body.length - 1; i >= 0; i--) {
                    stack.push(node.body[i]);
                }
                break;
            case "ObjectPattern":
            case "ArrayPattern":
                for (i = node.elements.length - 1; i >= 0; i--) {
                    stack.push(node.elements[i]);
                }
                break;
            // // return {type:type,_id_:++nodeId,elements:undefined,loc:undefined,extras:undefined};
            case "WhileStatement":
            case "DoWhileStatement":
            // // return {type:type,_id_:++nodeId,test:undefined, body:undefined,loc:undefined,extras:undefined};
            case "BlockStatement":
                for (i = node.body.length - 1; i >= 0; i--) {
                    stack.push(node.body[i]);
                }
                break;
            // // return {type:type,_id_:++nodeId,body:undefined,loc:undefined,extras:undefined};
            case "IfStatement":
            // // return {type:type,_id_:++nodeId,test:undefined,consequent:undefined,alternate:undefined,loc:undefined,extras:undefined};
                stack.push(node.test);
                stack.push(node.consequent);
                stack.push(node.alternate);
                break;
            case "ConditionalExpression":
            // // return {type:type,_id_:++nodeId,test:undefined,consequent:undefined,alternate:undefined,loc:undefined,extras:undefined};
                stack.push(node.test);
                stack.push(node.consequent);
                stack.push(node.alternate);
                break;
            case "BinaryExpression":
            case "AssignmentExpression":
            // // return {type:type,_id_:++nodeId,operator:undefined,left:undefined,right:undefined,loc:undefined,extras:undefined};
                stack.push(node.left);
                stack.push(node.right);
                break;
            case "ForInOfStatement":
            // // return {type:type,_id_:++nodeId,left:undefined,right:undefined,body:undefined,loc:undefined,extras:undefined};
                stack.push(node.left);
                stack.push(node.right);
                break;
            case "ForStatement":
                stack.push(node.init);
                stack.push(node.condition);
                stack.push(node.update);
                break;
            // // return {type:type,_id_:++nodeId,init:undefined,test:undefined,update:undefined,loc:undefined,extras:undefined};
            case "NewExpression":
            // // return {type:type,_id_:++nodeId, callee:undefined, arguments:undefined, loc:undefined, extras:undefined};
            case "CallExpression":
                stack.push(node.callee);
                stack.push(node.arguments);
                break;
            // // return {type:type,_id_:++nodeId, callee:undefined, arguments:undefined, loc:undefined, extras:undefined};
            case "RestParameter":
            // // return {type:type,_id_:++nodeId, id:undefined, loc:undefined, extras:undefined};
            case "SpreadExpression":
            // // return {type:type,_id_:++nodeId, id:undefined, loc:undefined, extras:undefined};

            case "BindingPattern":
            // // return {type:type,_id_:++nodeId, id:undefined, target:undefined, loc:undefined, extras:undefined};
                break;
            case "ArrayComprehension":

            // // return {type:type,_id_:++nodeId, blocks:undefined, filter:undefined, expression:undefined, loc:undefined, extras:undefined};
            case "GeneratorComprehension":
                for (i = node.blocks.length - 1; i >= 0; i--) {
                    stack.push(node.blocks[i]);
                }
                for (i = node.filters.length - 1; i >= 0; i--) {
                    stack.push(node.filters[i]);
                }
                break;
            // // return {type:type,_id_:++nodeId, loc:undefined, extras:undefined};
            case "SwitchStatement":
                for (i = node.cases.length - 1; i >= 0; i--) {
                    stack.push(node.cases[i]);
                }
                break;
            // // return {type:type,_id_:++nodeId, discriminant:undefined, cases:undefined, loc:undefined, extras:undefined};
            case "DefaultCase":

            // // return {type:type,_id_:++nodeId, consequent:undefined, loc:undefined, extras:undefined};
            case "SwitchCase":
            // // return {type:type,_id_:++nodeId, test:undefined, consequent:undefined, loc:undefined, extras:undefined};
            case "TryStatement":
                stack.push(node.handler);
                stack.push(node.finalizer);
                break;
            // // return {type:type,_id_:++nodeId, handler:undefined, guard:undefined, finalizer:undefined, loc:undefined, extras:undefined};
            case "CatchClause":
            // // return {type:type,_id_:++nodeId, block:undefined, loc:undefined, extras:undefined};
            case "Finally":
            // // return {type:type,_id_:++nodeId, block:undefined, loc:undefined, extras:undefined};
            default:
            // // return {type:type,_id_:++nodeId, loc:undefined, extras:undefined};
        }
    }

    return nodes;
}

exports.matchesQuery = matchesQuery;
exports.querySelectorAll = querySelectorAll;

});
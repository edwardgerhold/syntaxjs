define("ssa-tool", function (require, exports) {
    /*
     cases where to extract expressions
     1. assignment = binaryexpression : extract the binary expressions and convert to ssa´s
     2. binaryexpression: extract nested binaries and convert to ssa
     3. callexpression : extract the arguments and convert to ssa and write them in front of the call
     4.
     5.
     6.
     */


    /*
        is cloning to complex?
        definitly yes.
        maybe it´s an option
        or better be deleted
     */

    function clone(node) {
        /*this function does not clone array or objects*/
        var newNode = {};
        for (var k in node) {
            if (Object.prototype.hasOwnProperty.call(node, k)) {
                newNode[k] = node[k];
            }
        }
        return newNode;
    }
    function deep_clone(node) {
        var newNode = {}, p;
        for (var k in node) {
            if (Object.prototype.hasOwnProperty.call(node, k)) {
                p = node[k];
                if (p && typeof p === "object") p = clone(p);
                newNode[k] = p;
            }
        }
        return newNode;
    }

    /**
     best idea so far:
     ----------------
     input 1 node or array
     output 1..n nodes in an array
     */



    var tNum = 0;

    function ssa_rewriter(node) {

        var newNode;

        if (Array.isArray(node)) {
            var newNodes = [];
            for (var i = 0, j = node.length; i < j; i++) {
                newNodes = newNodes.concat(rewrite(node[i]));
            }
            return newNodes;
        }

        switch (node.type) {
            case "Program":

                newNode = clone(node);
                newNode.body = rewrite(node.body);
                return newNode;

                break;

            case "Identifier":
                newNode = clone(node);
                return newNode;

                break;
            case "ParenthesizedExpression":
                break;
            case "ExpressionStatement":
                break;
            case "LexicalDeclaration":
            case "VariableDeclaration":
                break;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "GeneratorDeclaration":
            case "GeneratorExpression":
            case "ArrowExpression":
            case "NumericLiteral":
            case "StringLiteral":
            case "BooleanLiteral":
            case "Literal":
            case "TemplateLiteral":
            case "ObjectExpression":
            case "ArrayExpression":
            case "ObjectPattern":
            case "ArrayPattern":
            case "WhileStatement":
            case "DoWhileStatement":
            case "BlockStatement":
            case "IfStatement":
            case "ConditionalExpression":


                newNode = clone(node);

                break;
            case "BinaryExpression":
                if (node.left === "BinaryExpression") {
                    newNodes = newNodes.concat(rewrite(node.left));
                    var tLeft = tNum;
                } else tLeft = undefined;


                if (node.right === "BinaryExpression") {
                    newNodes = newNodes.concat(rewrite(node.right));
                    var tRight = tNum;
                } else tRight = undefined;

                newNode = {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: {
                        type: "Identifier",
                        name: "t"+ (++tNum)
                    },

                    right: {
                        type: "BinaryExpression",
                        operator: node.operator,
                        left: tLeft ? { type: "Identifier", name: "t"+tLeft } : node.left,
                        right: tRight ? { type: "Identifier", name: "t"+tRight } : node.right
                    }


                }

                break;
            case "AssignmentExpression":


                break;
            case "ForInOfStatement":
            case "ForStatement":
            case "NewExpression":
            case "CallExpression":
            case "RestParameter":
            case "SpreadExpression":
            case "BindingPattern":
            case "ArrayComprehension":
            case "GeneratorComprehension":
            case "SwitchStatement":
            case "DefaultCase":
            case "SwitchCase":
            case "TryStatement":
            case "CatchClause":
            case "Finally":
            default:
                newNode = clone(node);

        }
        if (node && node.loc) {
            newNode.loc = node.loc;
        }

        return newNode;
    }


    function createTempVariables() {

        var varDecls = [];
        if (tNum > 1) {
            for (var i = 1, j = tNum; i <= j; i++) {
                varDecls.push({
                    type: "VariableDeclarator",
                    id: "t"+i,
                    kind: "var"
                });
            }
        }

        var varDecl = {
            type: "VariableDeclaration",
            kind: "var",
            declarations: varDecls
        };

        return varDecls;
    }


    function rewrite(ast) {
        tNum = 0;
        var newAST = ssa_rewriter(ast);
        var varDecl = createTempVariables();
        if (ast.body) {
            ast.body = ast.body.unshift(varDecl);
        }
        return newAST;
    }

    exports.rewrite = rewrite;

});
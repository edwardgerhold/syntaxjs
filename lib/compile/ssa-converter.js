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



    function rewrite(input) {

        var scope;
        var output;
        var stack = [input];

        while (node = stack.pop()) {
            switch (node.type) {
                case "Program":
                case "Identifier":
                case "ParenthesizedExpression":
                case "ExpressionStatement":
                case "LexicalDeclaration":
                case "VariableDeclaration":
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
                case "BinaryExpression":
                case "AssignmentExpression":
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
            }
        }
    }

    exports.rewrite = rewrite;

});
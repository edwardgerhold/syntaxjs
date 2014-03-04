var syntaxjs = require("./syntax.js").syntaxjs;

var ast = syntaxjs.createAst("obj.foo + 42");
var expr = ast.body[0].expression;
console.log(expr.left.property.name);
console.log(expr.right.value);

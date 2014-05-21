var syntaxjs = require("../../syntax0.js").syntaxjs;
var qs = syntaxjs.require("queryselector").querySelectorAll;

var code = "let x = 10; x; y;";

var ast = syntaxjs.parse(require("fs").readFileSync("../../syntax0.js", "utf8"));

console.log("Search for Program");
var nodes = qs(ast, "Program");
console.dir(nodes);

console.log("Search for Identifier");
nodes = qs(ast, "Identifier");
console.dir(nodes);

console.log("Search for LexicalDeclaration");
nodes = qs(ast, "LexicalDeclaration");
console.dir(nodes);


console.log("Search for nodes with .name (all identifiers).");
nodes = qs(ast, ".name");
console.dir(nodes);


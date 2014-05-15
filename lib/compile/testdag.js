var syntaxjs = require("../../syntax0.js");
if (!require.cache["graph"]) {
    Function("define", require("fs").readFileSync("./dag.js", "utf8"))(syntaxjs.define);
}

var Graph = syntaxjs.require("graph").Graph;
var g = new Graph();

g.insert("x");
g.insert("y");
g.insert("z");
g.connect("x", "y", 10);
g.connect("y", "z", 10);
g.connect("x", "z", 32);

console.log(g.shortest("x", "z"));
console.dir(g);

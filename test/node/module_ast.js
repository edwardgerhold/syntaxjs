var syntaxjs = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;

var fs = require("fs");

var code1 = fs.readFileSync("module1.js", "utf8");
var code2 = fs.readFileSync("module2.js", "utf8");
console.log("BAUM 1");
console.dir(syntaxjs.createAst(code1));
console.log("BAUM 2");
console.dir(syntaxjs.createAst(code2));
console.log("PROGRAM 1");
console.dir(syntaxjs.toValue(code1));
console.log("PROGRAM 2");
console.dir(syntaxjs.toValue(code2))



console.log("comparing the speed of syntax.js with esprima");
var esprima = require("esprima");
var syntaxjs = require("../../syntax0.js");
var code = require("fs").readFileSync("../../syntax0.js", "utf8");
function test() {
    console.time("timer syntax.js");
    syntaxjs.parse(code);
    console.timeEnd("timer syntax.js");    
    console.time("timer esprima");
    esprima.parse(code);
    console.timeEnd("timer esprima");
}
for (var i = 0; i < 10; i++) test();
console.log("thanks for the great work, ariya and friends.");
console.log("comparing the speed of syntax.js with native js");
var syntaxjs = require("../../syntax0.js");
var code = "for (var i = 0; i < 50e3; i++) {}";
console.log(code);
var ast = syntaxjs.parse(code);
var realm = syntaxjs.createRealm();
function test() {
    console.time("timer syntax.js");
    realm.eval(code);
    console.timeEnd("timer syntax.js");    
    console.time("timer native");
    eval(code);
    console.timeEnd("timer native");
}
for (var i = 0; i < 10; i++) test();

code = "var i = 0; while (i < 10) { i++; Object; } Object;";
console.log(code);
for (var i = 0; i < 10; i++) test();

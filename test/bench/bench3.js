console.log("comparing the <s>speed</s> slowness of syntax.js runtime with the bytecode runtime");
var syntaxjs = require("../../syntax0.js");
var code = "234";
console.log("at 30e2 times +234 the callstack of syntax.js blows. that means not deep enough nesting.");
for (var i = 0; i < 12e2; i++) code += "+(234)";

console.log(code);
var ast = syntaxjs.parse(code);
var realm = syntaxjs.createRealm();
function test() {
    console.time("timer syntax.js ast");
    console.log(realm.eval(code));
    console.timeEnd("timer syntax.js ast");    
    console.time("timer syntax.js few bytecodes");
    console.log(realm.evalByteCode(code));
    console.timeEnd("timer syntax.js few bytecodes");
}
for (var i = 0; i < 10; i++) test();


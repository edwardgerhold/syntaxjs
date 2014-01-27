var syntaxjs = require("./syntax.js").syntaxjs;
var fs = require("fs");
var Test = require("./tester.js").Test;
var code = fs.readFileSync("code2.js", "utf8");
var ex = syntaxjs.toValue(code, true, true);

console.log("code:");
console.log(code);
console.log("result:");
console.dir(ex);
console.log("tests:");

var test = new Test();
test.add(function () {
    var code = "let c = new C();";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, undefined, code);
});
test.add(function () {
    var code = "C.method();";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, "static method called", code);
});
test.add(function () {
    var code = "c.method();";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, "method called", code);
});
test.add(function () {
    var code = "c.push(100);";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, 1, code);
});
test.add(function () {
    var code = "c.push(200);";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, 2, code);
});
test.add(function () {
    var code = "c.length;";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, 2, code);
});
test.add(function () {
    var code = "c.pop();";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, 200, code);
});
test.add(function () {
    var code = "c.pop();";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, 100, code);
});

test.run();
test.print();

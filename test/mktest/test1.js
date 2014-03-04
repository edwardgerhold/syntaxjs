var syntaxjs = require("./syntax.js").syntaxjs;
var fs = require("fs");
var Test = require("./tester.js").Test;
var code = fs.readFileSync("code1.js", "utf8");
console.log("code:");
console.log(code);
var ex = syntaxjs.toValue(code, true, true);
console.log("result:");
console.dir(ex);

var test = new Test();
console.log("tests:");

test.add(function () {
    var code = "F()";
    this.throws(function () {
	var r = syntaxjs.toValue(code, true);
    }, code);
});

test.add(function () {
    var code = "global.fault";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, undefined, code);
});


test.add(function () {
    var code = "let o = new F();";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, undefined, code);
});

test.add(function () {
    var code = "o.myFault;";
    var r = syntaxjs.toValue(code, true);
    this.assert(r, true, code);
});


test.run();
test.print();

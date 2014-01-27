var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();

test.add(function () {
    var r = syn.toValue("function f() {} typeof f;");
    this.assert(r, "function", "f ist eine function");
});

test.add(function () {
    var r = syn.toValue("var v = undefined; typeof v;");
    this.assert(r, "undefined", "undefined ist undefined");
});

test.add(function () {
    var r = syn.toValue("var v = 1; typeof v;");
    this.assert(r, "number", "1 ist eine Number");
});

test.add(function () {
    var r = syn.toValue("var v = /expr/i; typeof v;");
    this.assert(r, "object", "/expr/i ist ein object");
});


test.add(function () {
    var r = syn.toValue("var v = 'string'; typeof v;");
    this.assert(r, "string", "'string' ist ein string");
});

test.add(function () {
    var r = syn.toValue("var v = {}; typeof v;");
    this.assert(r, "object", "{} ist ein object");
});

test.add(function () {
    var r = syn.toValue("var v = null; typeof v;");
    this.assert(r, "object", "null ist ein object");
});

test.add(function () {
    var r = syn.toValue("var v = true; typeof v;");
    this.assert(r, "boolean", "true ist ein boolean");
});

test.add(function () {
    var r = syn.toValue("var v = false; typeof v;");
    this.assert(r, "boolean", "false ist ein boolean");
});


test.add(function () {
    var r = syn.toValue("var v = new Symbol(); typeof v;");
    this.assert(r, "symbol", "v ist ein symbol");
});

test.run();
test.print();

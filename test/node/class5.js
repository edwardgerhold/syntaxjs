var Test = require("./tester.js").Test;
var syntaxjs = require("./syntax.js").syntaxjs;
var test = new Test();



test.add(function () {
    var code = "class C extends Array { method(a,b,c) { return 123.4567; } }";
    var r = syntaxjs.toValue(code, true, true);
    test.assert(""+r, "[object OrdinaryFunction]", code);
});

test.add(function () {
    var code = "let c = new C(1,2,3,4,5);";
    var r = syntaxjs.toValue(code, true);
    test.assert(r, undefined, code);
});

test.add(function () {
    var code = "c instanceof C";
    var r = syntaxjs.toValue(code, true);
    test.assert(r, true, code);
});

test.add(function () {
    var code = "c.method();"
    var r = syntaxjs.toValue(code, true);
    test.assert(r, 123.4567, code);
});


test.add(function () {
    var code = "c.push('Edward')";
    var r = syntaxjs.toValue(code, true);
    test.assert(r, 1, code);
});

test.add(function () {
    var code = "c.push('Gerhold')";
    var r = syntaxjs.toValue(code, true);
    test.assert(r, 2, code);
});


test.run();
test.print();

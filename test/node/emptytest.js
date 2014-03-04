var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();

test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x += y; x;");
    this.assert(r, 22, "muss 22 sein (var x = 10, y = 12; x += y; x;)");
});

test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x *= y; x;");
    this.assert(r, 120, "muss 120 sein (var x = 10, y = 12; x *= y; x;)");
});

test.run();
test.print();

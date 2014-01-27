
var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();
test.name = "Abstract Syntax Tree Tests";




test.add(function (test) {
    var r = syn.createAst("let a = [1,2,3,4];");
    console.log(JSON.stringify(r, null, 4));
    var r = syn.toValue("let a = [1,2,3,4]; a;");
    test.deepEquals(r, [1,2,3,4], "a sollte [1,2,3,4] sein");
});



test.add(function (test) {
    var r = syn.createAst("let a; [,,,a] = [1,2,3,4]; a");
    console.log(JSON.stringify(r, null, 4));
    var r = syn.toValue("let a; [,,,a] = [1,2,3,4]; a");
    test.assert(r, 4, "a sollte nach 3 elisions = 4 sein");
});


test.run();
test.print();

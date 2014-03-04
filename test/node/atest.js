
var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();
test.name = "Abstract Syntax Tree Tests";

test.add(function (test) {
    var r = syn.createAst("identifier");
    console.log(JSON.stringify(r, null, 4));
    test.deepEquals(r.type, "Program", "der AST startet immer mit dem Program...");
});

test.add(function (test) {
    var r = syn.createAst("function f (a=1, b=2, ...rest) { return [a,b,...rest]; } f(undefined,undefined, 3,4,5,6);");
    console.log(JSON.stringify(r, null, 4));
    test.deepEquals(r.type, "Program", "der AST startet immer mit dem Program...");
});


test.add(function (test) {
    var r = syn.createAst("let {first, last} = {first:'Edward',last:'Gerhold'}");
    console.log(JSON.stringify(r, null, 4));
    test.deepEquals(r.type, "Program", "der AST startet immer mit dem Program...");
});



test.run();
test.print();

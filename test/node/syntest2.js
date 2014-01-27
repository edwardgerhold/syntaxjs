var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();

test.add(function () {
    var r = syn.createAst("a+(b+c)");
    console.log(JSON.stringify(r.body, null, 4));
});
test.add(function () {
    var r = syn.createAst("(a+b)+c");
    console.log(JSON.stringify(r.body, null, 4));
});

test.add(function () {
    var r = syn.createAst("((a)+((b)+(c)))");
    console.log(JSON.stringify(r.body, null, 4));
});

test.run();

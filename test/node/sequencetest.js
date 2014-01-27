var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();


test.add(function () {
    var r = syn.createAst("x,y,x,y,x,y,x,y;");
    console.dir(r);
});



test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x,y,x,y,x,y,x,y;");
    this.assert(r, 12, "y ist 12");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x,y,x,y,x,y,x,y,y,23,25425,2352,x;");
    this.assert(r, 10, "x ist 10");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x,y,x+y,x,x,y,y,x*y;");
    this.assert(r, 120, "x*y ist 120");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x,y,x,y,x,y,x,y,'sdfsdfsdf',x;");
    this.assert(r, 10, "x ist 10");
});



test.run();
test.print();

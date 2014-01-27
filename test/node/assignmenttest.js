var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();


/*
test.add(function () {
    var r = syn.createAst("var x = 10, y = 12; [y,x]=[x,y]; x; y;");
    this.assert(typeof r, "object", "Der AST.");
    console.dir(r); 
});

*/



test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x += y; x;");
    this.assert(r, 22, "muss 22 sein (var x = 10, y = 12; x += y; x;)");
});

test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x *= y; x;");
    this.assert(r, 120, "muss 120 sein (var x = 10, y = 12; x *= y; x;)");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; x *= y; y+=x; y+y;");
    this.assert(r, 264, "muss 264 sein (var x = 10, y = 12; x *= y; y+=x; y+y;)");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; [y,x]=[x,y]; x;");
    this.assert(r, 12, "muss 12 sein (var x = 10, y = 12; [y,x]=[x,y];");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; [y,x]=[x,y]; x;");
    this.assert(r, 12, "muss 12 sein (var x = 10, y = 12; [y,x]=[x,y]; x;");
});



test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; [y,x]=[x,y]; y");
    this.assert(r, 10, "muss 10 sein (var x = 10, y = 12; [y,x]=[x,y]; y;");
});



test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; [y,x]=[x,y]; x + y; ");
    this.assert(r, 22, "muss 22 sein (var x = 10, y = 12; [y,x]=[x,y]; x+y;");
});


test.add(function () {
    var r = syn.toValue("var x = 10, y = 12; [y,x]=[x,y]; x / y");
    this.assert(r, 1.2, "muss 1.2 sein (var x = 10, y = 12; [y,x]=[x,y]; x / y;");
});




test.run();
test.print();

var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();
test.name = "Class Definitions";

var classCode = "class C { constructor(...args) {  } method(a,b,c) { return a+b+c; } }";
var methodCode = "let instance = new C(); instance.method(1,2,3);";
var instanceCode = "let instance = new C(); instance instanceof C;"; 

var sclassCode = "function F() {}\nclass C extends F { constructor(...args) { /*super(...args);*/ } method(a,b,c) { return a+b+c; } }";


test.add(function (test) {
    var r = syn.createAst(classCode);
    test.assert(r.body[0].type, "ClassDeclaration", "body[0] ist classDecl");
    //console.log(JSON.stringify(r, null, 4));
});


test.add(function (test) {
    var r = syn.createAst(sclassCode);
    test.assert(r.body[1].type, "ClassDeclaration", "body[1] ist classDecl");
    //console.log(JSON.stringify(r, null, 4));
});


test.add(function (test) {
    var r = syn.toValue(classCode + methodCode);
    test.assert(r, 6, "instance.method(1,2,3) is 1+2+3 = 6");
});


test.add(function (test) {
    var r = syn.createAst(sclassCode);
    var r = syn.toValue(sclassCode + methodCode);
    test.assert(r, 6, "instance.method(1,2,3) is 1+2+3 = 6");
});


test.add(function (test) {
    var r = syn.toValue(classCode + instanceCode);
    // console.dir(r);
    test.assert(r, true, "instance instanceof C (muss instanceof impl.)");
});

test.run();
test.print();

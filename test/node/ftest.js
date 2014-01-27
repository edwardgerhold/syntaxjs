var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();

test.name = "Function Environment Tests";



test.add(function (test) {
    var r = syn.toValue("function f(first) { return first } f('Edward')");
    test.assert(r, "Edward", "Einfaches Identifier argument.");
});

test.add(function (test) {
    var r = syn.toValue("function f(...rest) { return rest } f(3,4,5)");
    test.deepEquals(r, [3,4,5], "f. f(...rest) (ohne ;) returns rest");
});
test.add(function (test) {
    var r = syn.toValue("function f(...rest) { return rest; } f(3,4,5);");
    test.deepEquals(r, [3,4,5], "f. f(...rest) (mit ;) returns rest");
});

test.add(function (test) {
    var src = "var object = { name: 'Edward Gerhold', a: function (first='Edward') { return test.b(first); },";
    src+= "b:function(x,last='Gerhold') { return x+' '+last; } }; object.b()";
    var r = syn.toValue(src);
    console.log(JSON.stringify(syn.createAst(src), null, 4));
    test.assert(r, "Edward Gerhold", "Ordinary Object and Function Data Structure, thisValue and Default Parameters, and FunctionDeclaration work with new Structures");
});

test.add(function (test) {
    var r = syn.toValue("function f() { function g() { return 'Gerhold'; } return 'Edward '+g(); } f();");
    test.assert(r, "Edward Gerhold", "The nested function g returns together with its outer function f two string pieces concatenated.");
});

test.add(function (test) {
    var r = syn.toValue("function f(a=1,b=2,c=3) { return [a,b,c]; } f();");
    test.deepEquals(r, [1,2,3], "default parameters returned");
});

test.add(function (test) {
    var r = syn.toValue("function f(a=0,b=1) { return a; } f();");
    test.equals(r, "0", "f(a) returns 0 and is == string 0");
});

test.add(function (test) {
    var r = syn.toValue("function f( {first, last} ) { return first+' '+last; } f({first:'Edward',last:'Gerhold'});");
    test.equals(r, "Edward Gerhold", "Destructuring: f({first,last}) returns my full name.");
});

test.run();
test.print();

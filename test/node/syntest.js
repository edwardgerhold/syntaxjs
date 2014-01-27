var syn = require("./syntax.js").syntaxjs;
var Test = require("./tester.js").Test;
var test = new Test();
test.add(function () {
    var r = syn.toValue("1+2");
    this.assert(r,3, "1+2 should be 3");
});
test.add(function () {
    var r = syn.toValue("let b = 1+2; b;");
    this.assert(r,3, "b should be 3");
});
test.add(function () {
    var r = syn.toValue("const c = 1+2; c;");
    this.assert(r,3, "c should be 3");
});
test.add(function () {
    var r = syn.toValue("let {first,last} = {first:'Edward',last:'Gerhold'}; first+' '+last;");
    this.assert(r,"Edward Gerhold", "{first, last} sollten Edward und Gerhold sein.");
});
test.add(function () {
    var r = syn.toValue("function f(...rest) { return rest } f(3,4,5)");
    this.deepEquals(r, [3,4,5], "f. f(...rest) (ohne ;) returns rest");
});
test.add(function () {
    var r = syn.toValue("function f(...rest) { return rest; } f(3,4,5);");
    this.deepEquals(r, [3,4,5], "f. f(...rest) (mit ;) returns rest");
});
test.add(function () {
    var r = syn.toValue("var x='x', y='y'; let r={x,y}; r");
    this.deepEquals(r, {x:"x",y:"y"}, "{x,y} desugars into {x:x, y:y}");
});
test.add(function () {
    var r = syn.toValue("var x=1; let y=2; var r = {x,y}; r;");
    this.deepEquals(r, {x:1,y:2}, "{x,y} desugars into {x:x, y:y} - anders geschrieben.");
});
test.add(function () {
    var r = syn.toValue("class Person { constructor(x,y) { } }");
    this.assert(r, undefined, "Nur eine Klasse deklarieren sollte undefined ergeben.");
    
});
test.add(function () {
    var r = syn.toValue("var x = 10;");
    this.assert(r, undefined, "Nur eine Variable var x = 10 deklarieren sollte undefined ergeben.");
    
});

test.add(function () {
    var src = "var object = { name: 'Edward Gerhold', a: function (first='Edward') { return this.b(first); },";
    src+= "b:function(first,last='Gerhold') { return first+' '+last; } }; object.b()";
    var r = syn.toValue(src);
    this.assert(r, "Edward Gerhold", "Ordinary Object and Function Data Structure, thisValue and Default Parameters, and FunctionDeclaration work with new Structures");
    this.assert(r, 0, "");
});

test.add(function () {
    var r = syn.toValue("0");
    this.assert(r, 0, "");
});
test.add(function () {
    var r = syn.toValue("0");
    this.assert(r, 0, "");
});
test.add(function () {
    var r = syn.tokenize("var x = 10;");
    this.assert(r.length, 8, "tokenize should get 8 tokens from var x = 10;");
});
test.add(function () {
    var r = syn.toValue("function f() { function g() { return 'Gerhold'; } return 'Edward '+g(); } f();");
    this.assert(r, "Edward Gerhold", "The nested function g returns together with its outer function f two string pieces concatenated.");
});
test.add(function () {
    var r = syn.toValue("function f(a=1,b=2,c=3) { return [a,b,c]; } f();");
    this.deepEquals(r, [1,2,3], "default parameters returned");
});

test.add(function () {
    var r = syn.toValue("function f(a=0,b=1) { return a; } f();");
    this.equals(r, "0", "f(a) returns  0 and is == string 0");
});

test.add(function () {
    var r = syn.toValue("let x = 12;");
    this.notEquals(r, 0, "let x = 12; should not be 0.");
});

test.run();
test.print();

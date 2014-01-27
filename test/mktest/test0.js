// Load Modules
var syntaxjs = require("./syntax.js").syntaxjs;
var fs = require("fs");
var Test = require("./tester.js").Test;
// Lade den Code
var code = fs.readFileSync("code1.js", "utf8");
// Starte den Interpreter
var ex = syntaxjs.toValue(code, true, true);

// Log the Code, the result of it´s evaluation

console.log("Code to start interpreter:");
console.log(code);
console.log("The result of evaluating the code:");
console.dir(ex);

// Instantiate Test
var test = new Test();
console.log("Now the results of the tests added to this piece of code:");

// Add some Tests
// - The parameters of assert, equals, notEquals, strictEquals, strictNotEquals
// are like in nodes assert library. throws takes a function as a code block
// and wait´s for an exception. And notThrows excepts no exception.
// - Log the code as the message

test.add(function () {
    var code = "";
    var r = syntaxjs.toValue(code, true); 
    this.assert(r, undefined, code);
});

// Don´t forget to run and to print the Test
test.run();
test.print();

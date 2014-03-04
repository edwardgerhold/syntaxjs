/* seems to work a little */
var syntaxjs = require("./syntax0.js").syntaxjs;
var p = syntaxjs.evalAsyncXfrm("let o = { a: 1, b: 2, c: 3 }; o;");
console.dir(p);
p.then(function (value) {
    console.log("promise resolved with value = "+console.dir(value));
});




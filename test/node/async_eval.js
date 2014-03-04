/* seems to work a little */
var syntaxjs = require("./syntax0.js").syntaxjs;
var p = syntaxjs.evalAsync("var x = 10; x+x+x+x;");
console.dir(p);
p.then(function (value) {
    console.log("promise resolved with value = "+value);
});



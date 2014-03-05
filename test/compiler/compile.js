var syntaxjs = require("syntaxjs").syntaxjs;


var fs = require("fs");
var file = fs.readFileSync(process.argv[2]);

console.dir(syntaxjs.arraycompile(file));
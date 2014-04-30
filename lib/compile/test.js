var fs = require("fs");
var syntaxjs = require("../../syntax0.js").syntaxjs;
var builder = syntaxjs.require("arraycompiler");
var source = fs.readFileSync(process.argv[2]||"test.js", "utf8");
var result = syntaxjs.parse(source, { builder: builder });
console.dir(JSON.stringify(result, null, 4));
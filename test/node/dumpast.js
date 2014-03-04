#!/usr/local/bin/node
var args = process.argv.slice(2);
var file;
var fs = require("fs");
var syntaxjs = require("./syntax.js").syntaxjs;
String.repeat = function (str, j) {
    j = +j;
    var s = "";
    for (var i = 0; i < j; i++) {
	s += str;
    }
    return s;
};
function dump(obj) {
    console.log(JSON.stringify(obj, null, 4));
}

while (file = args.shift()) {
    console.log(String.repeat("-", 80));
    console.log("emitting: "+file);
    console.log(String.repeat("-", 80));
    var code = fs.readFileSync(file, "utf8");
    var ast = syntaxjs.createAst(code);
    dump(ast);
    console.log(String.repeat("-", 80));
}


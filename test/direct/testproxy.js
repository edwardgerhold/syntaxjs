var syntaxjs = require("./syntax.js").syntaxjs;
var fs = require("fs");
var code = fs.readFileSync("proxy.js", "utf8");
console.dir(syntaxjs.toValue(code));

var s = require("../../syntax0.js");
var asmparser = s.require("asm-parser");
var source = process.argv[2];
if (!source) {
    throw new TypeError("asmparser.js [file.ajs]");
}
var compilationUnit = asmparser.parse(source);
var result = asmparser.eval(compilationUnit);


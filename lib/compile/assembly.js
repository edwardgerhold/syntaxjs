/**
* testing and developing a bytecode dsl
*
* This program
* reads the asm-DSL parser
* tries to parse and compile the file argument given
* shows evaluation result of the bytecode assembler
*
*
*/

var s = require("../../syntax0.js");
var asmparser = s.require("asm-parser");
var source = process.argv[2];
var sourceText = "";
var fs = require("fs");
if (!fs.existsSync(source)) {
    throw new TypeError("asmparser.js [file.ajs]");
} else {
    sourceText = fs.readFileSync(source, "utf8");
}
var compilationUnit = asmparser.parse(sourceText);
var result = asmparser.eval(compilationUnit);


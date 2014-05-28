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
if (!source) {
    throw new TypeError("asmparser.js [file.ajs]");
}
var compilationUnit = asmparser.parse(source);
var result = asmparser.eval(compilationUnit);


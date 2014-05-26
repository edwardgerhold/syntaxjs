var s = require("../../syntax0.js");
var asmparser = s.require("asm-parser");
var source = process.argv[2];
var compilationUnit = asmparser.parse(source);
try {
    console.log(JSON.stringify(bytecode, null, 4));
} catch(ex) {
    console.log(ex);
}
var result = asmparser.eval(bytecode);


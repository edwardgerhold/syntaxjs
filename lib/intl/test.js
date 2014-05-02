var syntaxjs = require("../../syntax0.js");
var formatStr = syntaxjs.require("i18n").formatStr;

var format = syntaxjs.require("i18n").format;
console.log(formatStr("%s %s %s", "ich", "bin", "toll"));
console.log(format("REFERENCE_S_IS_UNRESOLVABLE", "hallo_welt"));

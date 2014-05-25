/*
    syntax.js and it´s last foreign headers
    Cool Public Domain and Open Source written by Edward Gerhold
    www.linux-swt.de
    at opensource.org/osd/ per intellij idea i found a good explanation
    of what this means
    built with ./build_syntax and node inlinefiles.js
    tools/inlinefiles.js
    reads these include directives in
    and processes each recursivly for more inclusions,
    - anything included inside these files is not runnable alone and
      only and of course modularised for better maintainability
    - lib/api.js: includes lib/api/*.js and lib/intrinsics/*.js
      which are sub-packages separated by ECMA-262 definitions
      in a just-cut-out format (i have to clean the code up)
*/
Error.stackTraceLimit = 10;
var syntaxjs;
/* moved outside (temp for experiments with self running) */
//#include "lib/amdpromise.js";
(function () {
    "use strict";
    syntaxjs = Object.create(null);
    // first i create syntaxjs and
    // add define, require, modules (require.cache link) and makePromise
//#include "lib/detector.js";
    // then i have some fs operations
//#include "lib/filesystem.js";
    // require("i18n").format("KEY", ...varags) translates from now on
//---#include "lib/intl/identifier-module.js"; // only loading takes longer, i need to learn more from m.bynens and norbert l. (seriously) and then go for Intl and Collator. :)
//#include "lib/intl/languages.de_DE.js";
//#include "lib/intl/languages.en_US.js";
//#include "lib/intl/i18n.js";
    // the lexer and parser api ast and ast-to-string for es6 code
//#include "lib/parsenodes/tables.js";
//#include "lib/parsenodes/symboltable.js";
//#include "lib/parsenodes/semantics.js";
//#include "lib/parsenodes/tokenizer.js";
//#include "lib/parsenodes/earlyerrors.js";
//#include "lib/parsenodes/parser.js";
//#include "lib/parsenodes/regexp_parser.js";
//#include "lib/parsenodes/cstcodegen.js";
//#include "lib/parsenodes/queryselector.js";
    // ecma-262 operations and astnode evaluation
    // lib/api.js #includes lib/api/*.js; lib/intrinsics/*.js
//#include "lib/api.js";
//#include "lib/parsenodes/runtime.js";
//--#include "lib/parsenodes/runtime0.js";
    // experimental typed memory and compiler (development)
    //--#include "lib/heap/heap.js"; // too high level
//#include "lib/compile/asm-typechecker.js";
//#include "lib/compile/asm-compiler.js";
//#include "lib/compile/asm-runtime.js";	// is not asm. but renamable.
    // syntax highlighter (the original application of syntax.js)
    // will be rewritten soon,
    // maybe with jquery for max effect with same simplicity
//#include "lib/highlighter/highlighter.js";
//#include "lib/highlighter/annotations.de_DE.js";
//--#include "lib/highlighter/annotations.en_US.js";
//#include "lib/highlighter/highlighter-app.js";
    // evaluation in web workers should save some of the ux
//#include "lib/worker.js";
    // the commandline shell is my favorite playtoy
//#include "lib/shell.js";
    // assembling and autostart of shell or browser highlighter
//#include "lib/syntaxjsexport.js";
//#include "lib/autostart.js";
    return syntaxjs;
}());
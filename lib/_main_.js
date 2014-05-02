/*
    
    syntax.js
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

    - lib/api.js includes lib/api/*.js and lib/intrinsics/*.js
      which are sub-packages separated by ECMA-262 definitions
      in a just-cut-out format

*/

Error.stackTraceLimit = 33;

var syntaxjs;

//#include "lib/amdpromise.js";

(function () {

    "use strict";

    syntaxjs = Object.create(null);
    
    // first i create syntaxjs and
    // add define, require, modules (require.cache link) and makePromise

    /* moved outside (temp for experiments with self running) */

    // then i have some fs operations
//#include "lib/filesystem.js";

    // soon back inside
//---#include "lib/intl/identifier-module.js"; // only loading takes longer, i need to learn more from m.bynens and norbert l. (seriously) and then go for Intl and Collator. :)
//#include "lib/intl/i18n.js";

// the lexer and parser api ast and tostring for es6 code
//#include "lib/parsenodes/tables.js";
//#include "lib/parsenodes/symboltable.js";
//#include "lib/parsenodes/semantics.js";
//#include "lib/parsenodes/tokenizer.js";
//#include "lib/parsenodes/earlyerrors.js";
//#include "lib/parsenodes/parser.js";
//#include "lib/parsenodes/regexp_parser.js";
//#include "lib/parsenodes/cstcodegen.js";

// ecma-262 operations and astnode evaluation
//#include "lib/api.js";
//#include "lib/parsenodes/runtime.js";

// experimental typed memory and compiler
//#include "lib/heap/heap.js";
//#include "lib/compile/jvm-bytecode.js";
//#include "lib/compile/compiler.js";
//#include "lib/compile/arraycompiler.js";
//#include "lib/compile/vm.js";

// syntax highlighter
//#include "lib/highlighter/highlighter.js";

    // now easily translatable.
    // i will add i18n mapping to the engine very soon

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
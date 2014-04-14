/*
    
    syntax.js
    Public Domain written by Edward Gerhold
    built with ./build_syntax

    tools/inlinefiles.js
    reads these include directives in
    and processes each recursivly for more inclusions,

    - each file is an amd-like module except for amd-prolly.js

    - anything included inside these files is not runnable alone and
      only modularised for better maintainability

    - lib/api.js includes lib/api/*.js and lib/intrinsics/*.js
      which are sub-packages separated by ECMA-262 definitions
      in a just-cut-out format

*/


//#include "lib/amd-prolly.js";

//#include "lib/filesystem.js";

//#include "lib/parsenodes/tables.js";

/*// #include "lib/intl/identifier-module.js"; // disabled */

/* // #include "lib/intl/i18n.js"; */

//#include "lib/parsenodes/semantics.js";

//#include "lib/parsenodes/tokenizer.js";

//#include "lib/parsenodes/earlyerrors.js";

//#include "lib/parsenodes/parser.js";
//#include "lib/parsenodes/regexp_parser.js";

//#include "lib/parsenodes/cstcodegen.js";

/* // #include "lib/heap/heap.js";
   // #include "lib/compile/compiler.js"; */

//#include "lib/api.js";

//#include "lib/parsenodes/runtime.js";


//#include "lib/highlighter/highlighter.js";
//#include "lib/highlighter/highlighter-app.js";
//#include "lib/worker.js";

//#include "lib/shell.js";

//#include "lib/syntaxjs.js";

//#include "lib/app.js";

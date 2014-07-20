define("asm-compiler", function (require, exports) {

    /*
    
	if you wonder, that "BYTECODE"
	
	contains "OBJECTREC" or "REFERENCE"
	
	it´s that i merged the PREFIX "TYPES"
	with BYTECODE, to have less to write.
	But if it´s less understandable, i will
	change it again. I asked myself already
	once, why i renamed types to bytecode, too.
	
    
    */


    "use strict";

    var format = require("i18n").format;
    var tables = require("tables");
    // temp
    var propDefKinds = tables.propDefKinds;
    var propDefCodes = tables.propDefCodes;
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromString = tables.unaryOperatorFromString;


    /*
     move into the main file
     give me all variables in overview
     that i can remove the dead code
     and start over

     */

    var realm, strict, tailCall;
    var tables = require("tables");
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromCode = tables.unaryOperatorFromCode;
    var propDefCodes = tables.propDefCodes;
    var detector = require("detector");
    var hasConsole = detector.hasConsole;
    var formatStr = require("i18n").formatStr;
    var translate = require("i18n").translate;


    var frames;
    var frame;
    var fp = -1;
    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    var pc;


    var ecma = require("ast-api");
    var parse = require("parser");
    var parseGoal = parse.parseGoal;


    var stack, pc;
    var state = [];    // save
    var st = -1;


    /*

        todo: rename the stuff to intel like machine

        secondly: prefer heap8 for the bytecode dispatch
        and the operand bytecodes. the original machine uses
        the same technology and oring the operandflags into
        the heap32 int is more difficult to understand than the heap8 assignments

     */


    var DEFAULT_SIZE = 5*1024*1024; // 5MB
    var POOL, DUPEPOOL;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var STACKBASE, STACKSIZE, STACKTOP;
    var LABELS;         // goto indizes LABEL[name] ==> offset
    var LABELNAMES;     // LABELNAMES[offset] ==> name
    var RETADDR = [];
    var STATE;
    var PROGSTART;
    var BYTECODE;

    function init(stackSize, poolSize) {
        POOL = new Array(poolSize||10000);
        DUPEPOOL = Object.create(null); // dupe check for identifiers, etc.
        MEMORY = new ArrayBuffer(stackSize||1024*1024);
        HEAP8 = new Int8Array(MEMORY);
        HEAPU8 = new Uint8Array(MEMORY);
        HEAP16 = new Int16Array(MEMORY);
        HEAPU16 = new Uint16Array(MEMORY);
        HEAP32 = new Int32Array(MEMORY);
        HEAPU32 = new Uint32Array(MEMORY);
        HEAPF32 = new Float32Array(MEMORY);
        HEAPF64 = new Float64Array(MEMORY);
        STACKBASE = 0;
        STACKSIZE = stackSize;
        STACKTOP = 0;
        PROGSTART = undefined;
        STATE = [];
        LABELS = Object.create(null);
        LABELNAMES = Object.create(null);

        BYTECODE = BYTECODESET.BYTECODE;
    }
    
    function get() {
        return {
            POOL: POOL,
            DUPEPOOL: DUPEPOOL,
            MEMORY: MEMORY,
            HEAP8: HEAP8,
            HEAPU8: HEAPU8,
            HEAP16: HEAP16,
            HEAPU16: HEAPU16,
            HEAPU32: HEAPU32,
            HEAP32: HEAP32,
            HEAPF32: HEAPF32,
            HEAPF64: HEAPF64,
            STACKBASE: STACKBASE,
            STACKSIZE: STACKSIZE,
            STACKTOP: STACKTOP,
            STATE: STATE,
            LABELS: LABELS,
            LABELNAMES: LABELNAMES,
            PROGSTART: PROGSTART
        };
    }
    function set(unit) {
        POOL = unit.POOL;
        DUPEPOOL = unit.DUPEPOOL;
        MEMORY = unit.MEMORY;
        HEAP8 = unit.HEAP8;
        HEAPU8 = unit.HEAPU8;
        HEAP16 = unit.HEAP16;
        HEAPU16 = unit.HEAPU16;
        HEAPU32 = unit.HEAPU32;
        HEAP32 = unit.HEAP32;
        HEAPF32 = unit.HEAPF32;
        HEAPF64 = unit.HEAPF64;
        STACKBASE = unit.STACKBASE;
        STACKTOP = unit.STACKTOP;
        STACKSIZE = unit.STACKSIZE;
        STATE = unit.STATE;
        LABELS = unit.LABELS;
        LABELNAMES = unit.LABELNAMES;
        PROGSTART = unit.PROGSTART;
    }


    /**
     *
     * Include files:
     * --------------
     *
     *
     * bytecode: contains the bytecode definitions
     * library: contains a typed array/bytecode driven version of ecma 262
     * compiler: compiles the syntax tree into bytecode
     *
     *                      (attention eddie: 'target-independent/multi-target' should be considered earlier,
     *                      maybe there could be a bytecode transfer to some other machine,
     *                      what´s then? e.g. jvm, not arm instead of intel.
     *                      what about 2 bytecodes generated from one compiler? or three or ten?
     *                      this piece of the compiler is important.)
     *
     * runtime: dispatcher to execute the compiled basic blocks with ecma 262 semantics
     *
     *
     */


//#include "lib/compile/asm-bytecode.js";
//#include "lib/compile/asm-library.js";
//#include "lib/compile/asm-compiler.js";
//#include "lib/compile/asm-runtime.js";

});


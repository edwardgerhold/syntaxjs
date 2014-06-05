define("asm-compiler", function (require, exports) {
    "use strict";

    var format = require("i18n").format;

    var tables = require("tables");

    // temp
    var propDefKinds = tables.propDefKinds;
    var propDefCodes = tables.propDefCodes;
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromString = tables.unaryOperatorFromString;



    var DEFAULT_SIZE = 5*1024*1024; // 5MB
    var POOL, DUPEPOOL;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var STACKBASE, STACKSIZE, STACKTOP;
    var LABELS;         // goto indizes LABEL[name] ==> offset
    var LABELNAMES;     // LABELNAMES[offset] ==> name
    var RETADDR = [];
    var STATE;

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
        STATE = [];
        LABELS = Object.create(null);
        LABELNAMES = Object.create(null);
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
            LABELNAMES: LABELNAMES
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
    }

    /**
     * Include files:
     * --------------
     * bytecode: contains the bytecode definitions
     * library: contains a typed array/bytecode driven version of ecma 262
     * compiler: compiles the syntax tree into bytecode
     * runtime: dispatcher to execute the compiled basic blocks
     *
     */


//#include "lib/compile/asm-bytecode.js";
//#include "lib/compile/asm-library.js";
//#include "lib/compile/asm-compiler.js
//#include "lib/compile/asm-runtime.js";


});


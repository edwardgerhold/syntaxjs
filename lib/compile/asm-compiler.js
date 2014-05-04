/**
 * Created by root on 03.05.14.
 */
/**
 * this is really becoming an asm.js compiler
 * i think this will work, even if it´s getting
 * rejected by the AOT at the beginning end else
 * this bytecode will anyways be 3-4x faster than
 * the ast anyways, so trying it out makes much sense
 */
define("asm-compiler", function (require, exports) {

    "use strict";

    var DEFAULT_SIZE = 1024*1024;    // 1 Meg of RAM (string, id, num)
                                     // No Joke, i have to add
                                     // the nodeCounter to guess
                                     // the average memory consumption
                                     // for the compilationUnit

    var POOL;
    var MEMORY, HEAP32, FLOAT64;
    var STACKSIZE, STACKTOP;

    /**
     * first bytecodes
     */

    var STRINGLITERAL = 0x15;
    var NUMERICLITERAL = 0x16;
    var IDENTIFIER = 0x17;
    var BOOLEANLITERAL = 0x18;

    var SCONST = 0x15;  // String from Constant Pool (choose your register)
    var NCONST = 0x16;  // Numeric from Constant Pool (coose your register)
    var ICONST = 0x17;  // IdentifierName from Constant Pool (choose your register)

    // bools could get one code each?
    var BTRUE  = 0x20;        // Code for a true Boolean
    var BFALSE = 0x21;        // Code for a false Boolean

    var EQ = 0x50;
    var NEQ = 0x51;

    var HALT = 0x255;

    /**
     * initialize the compiler for a new compilation
     * after compilation use exports.get() to get the data
     *
     * @param stackSize
     */
    function init(stackSize) {
        POOL = [];
        MEMORY = new ArrayBuffer(stackSize);
        HEAP32 = new Int32Array(MEMORY);
        FLOAT64 = new Float64Array(MEMORY);
        STACKSIZE = stackSize;
        STACKTOP = 0;
    }

    /**
     * get returns the compiled data, the heap, the constant pool, the stacksize and stacktop
     * @returns {{POOL: *, HEAP32: *, STACKSIZE: *, STACKTOP: *}}
     *
     */
    function get() {
        return {
            POOL: POOL,
            HEAP32: HEAP32,
            FLOAT64: FLOAT64,
            STACKSIZE: STACKSIZE,
            STACKTOP: STACKTOP
        }
    }

    /**
     * add a value to the constant pool
     * the index of the value in the array is returned
     * i don´t check for dupes, so two stringliterals with
     * the same value get added twice
     *
     * @param value
     * @returns {number}
     */
    function addToConstantPool(value) {
        return POOL.push(value) - 1;
    }

    /**
     * since the heap is a HEAP32 a 1 counts 4 bytes
     * stackAlloc is namely in emscripten/docs/paper.pdf
     *
     * @param size32
     * @returns {*}
     */
    function stackAlloc(size32) {
        var ptr = STACKTOP;
        STACKTOP += size32;
        return ptr;
    }

    /**
     * IDENTIFIER is a bytecode identification
     *
     * @type {number}
     */


    /**
     * this compiles the identifier for the ast heap
     * the difference today is, that i store "IDENTIFIER"
     * instead of storing an "SCONST" and a REGISTER NUMBER
     * the register number is not determined yet.
     *
     * @param node
     * @returns {*}
     * @constructor
     */
    function identifier (node) {
        var poolIndex = POOL.push(node.name) - 1;
        var ptr = STACKTOP;
        HEAP32[ptr] = ICONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 2;
        return ptr;
    }

    /**
     * it was quite a lot to add this to FLOAT64
     * to align the data and calculate the pointer
     * maybe it´s better, than i still can change
     * the code. now i add even the numeric value
     * for simplification to the constant pool.
     *
     * @param node
     * @returns {*}
     */

    function numericLiteral (node) {
        var poolIndex = POOL.push(node.value) - 1;
        var ptr = STACKTOP;
        HEAP32[ptr] = NCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 2;
        return ptr;
    }

    /**
     * stringLiteral
     * 1. obtain ptr from STACKTOP;
     * 2. add node.value to the constant pool and get poolIndex
     * 3. write poolIndex into the HEAP
     * 4. increase STACKTOP
     * @param node
     * @constructor
     */
    function stringLiteral (node) {
        var poolIndex = POOL.push(node.value) - 1;
        var ptr = STACKTOP;
        HEAP32[ptr] = SCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 2;
        return ptr;
    }

    function booleanLiteral(node) {
        var ptr = STACKTOP;
        if (node.value === "true")
        HEAP32[ptr] = BTRUE;
        else HEAP32[ptr] = BFALSE;
        STACKTOP += 1;
        return ptr;
    }

    function compile(ast) {
        if (!ast) return 0;
        if (Array.isArray(ast)) {
            for (var i = 0, j = ast.length; i < j; ++i) {
                compile(ast[i]);
            }
            return;
        }
        switch (ast.type) {
            case "StringLiteral":
                stringLiteral(ast);
                break;
            case "Identifier":
                identifier(ast);
                break;
            case "NumericLiteral":
                numericLiteral(ast);
                break;
            case "Program":
                compile(ast.body);
                break;
            case "BooleanLiteral":
                booleanLiteral(ast);
            case "ExpressionStatement":
                compile(ast.expression);
                break;
            default:
                return -1;
        }
    }

    /**
     * spent thirty seconds for showing how to use the compiler
     * @param ast
     * @returns {{POOL: *, HEAP32: *, STACKSIZE: *, STACKTOP: *}}
     */
    function compileUnit(ast) {
        init(DEFAULT_SIZE); // invent a good guess and a resize for the emergency case
        compile(ast);
        return get();
    }

    /**
     * i don´t need that object in here now,
     * but i better save them down here once
     * @type {null}
     */

    var bytecodes = Object.create(null);
    bytecodes.SCONST = SCONST;
    bytecodes.NCONST = NCONST;
    bytecodes.ICONST = ICONST;
    bytecodes.BTRUE = BTRUE;
    bytecodes.BFALSE = BFALSE;
    // equal to
    bytecodes.STRINGLITERAL = STRINGLITERAL;
    bytecodes.IDENTIFIER = IDENTIFIER;
    bytecodes.NUMERICLITERAL = NUMERICLITERAL;

    /**
     * the steps are to call init, compile and get
     * and to unify it i add the method compileUnit
     * @type {null}
     */
    exports.bytecodes = bytecodes;
    exports.init = init;
    exports.compile = compile;
    exports.get = get;
    exports.compileUnit = compileUnit;

});


/**
 */
define("asm-compiler", function (require, exports) {

    "use strict";
    var DEFAULT_SIZE = 2*1024*1024; // 2 Meg of RAM (string, id, num) should be big enough to run this program
    var POOL;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, FLOAT32, FLOAT64;
    var STACKSIZE, STACKTOP;
    /**
     * first bytecodes
     */
    /*
    var STRINGLITERAL = 0x15;
    var NUMERICLITERAL = 0x16;
    var IDENTIFIER = 0x17;
    var BOOLEANLITERAL = 0x19;
    */
    var PRG = 0x05;
    var SCONST = 0x15;  // String from Constant Pool (choose your register)
    var NCONST = 0x16;  // Numeric from Constant Pool (coose your register)
    var ICONST = 0x17;  // IdentifierName from Constant Pool (choose your register)

    // bools could get one code each?
    var TRUEBOOL  = 0x20;        // Code for a true Boolean
    var FALSEBOOL = 0x21;        // Code for a false Boolean

    var EXPRSTMT = 0x33;
    var EQ = 0x50;
    var NEQ = 0x51;


    var ADDI = 0xA0;

    var BINEXPR = 0xB0;
    var LOAD1   = 0xB1;
    var LOAD2   = 0xB2;
    var BINOP   = 0xB3;

    var HALT = 0xFF;
    /**
     * initialize the compiler for a new compilation
     * after compilation use exports.get() to get the data
     *
     * @param stackSize
     */
    function init(stackSize) {
        POOL = [];
        MEMORY = new ArrayBuffer(stackSize);
        HEAP8 = new Int8Array(MEMORY);
        HEAPU8 = new Uint8Array(MEMORY);
        HEAP16 = new Int16Array(MEMORY);
        HEAPU16 = new Uint16Array(MEMORY);
        HEAP32 = new Int32Array(MEMORY);
        HEAPU32 = new Uint32Array(MEMORY);
        FLOAT32 = new Float32Array(MEMORY);
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
            MEMORY: MEMORY,
            HEAP8: HEAP8,
            HEAPU8: HEAPU8,
            HEAP16: HEAP16,
            HEAPU16: HEAPU16,
            HEAPU32: HEAPU32,
            HEAP32: HEAP32,
            FLOAT32: FLOAT32,
            FLOAT64: FLOAT64,
            STACKSIZE: STACKSIZE,
            STACKTOP: STACKTOP
        };
    }
    /**
     * add a value to the constant pool
     * the index of the value in the array is returned
     * i don´t check for dupes, so two stringliterals with
     * the same value get added twice
     *
     * This is something external, the integer for the poolIndex
     * can be passed around, the rest must happen outside of the
     * fast interpreter block (that will still save us some ms)
     *
     * @param value
     * @returns {number}
     */
    function addToConstantPool(value) {
        return POOL.push(value) - 1;
    }
    /**
     * @param node
     * @returns {*}
     */
    function identifier (node) {
        var poolIndex = POOL.push(node.name) - 1;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = ICONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        console.log("compiled identifier to " + ptr);
        return ptr;
    }
    /**
     * @param node
     * @returns {*}
     */
    function numericLiteral (node) {
        var poolIndex = POOL.push(node.value) - 1;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = NCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        console.log("compiled numericLiteral to " + ptr);
        return ptr;
    }
    /**
     * stringLiteral
     * 1. obtain ptr from STACKTOP;
     * 2. add node.value to the constant pool and get poolIndex
     * 3. write poolIndex into the HEAP
     * 4. increase STACKTOP
     * @param node
     */
    function stringLiteral (node) {
        var poolIndex = POOL.push(node.computed) - 1;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = SCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        console.log("compiled stringLiteral to " + ptr);
        return ptr;
    }
    /**
     * @param node
     * @returns {*}
     */
    function booleanLiteral(node) {
        var ptr = STACKTOP >> 2;
        if (node.value === "true") HEAP32[ptr] = TRUEBOOL;
        else HEAP32[ptr] = FALSEBOOL;
        STACKTOP += 4;
        console.log("compiled boolean to " + ptr);
        return ptr;

    }
    /**
     * I really compile the node.expression
     * into one slot.
     * @param node
     * @returns {number}
     */
    function expressionStatement(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = EXPRSTMT;
        HEAP32[ptr+1] = compile(node.expression);
        return ptr;
    }
    /**
     * @param node
     */
    function assignmentExpression(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    /**
     *
     */
    function binaryExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 28;
        HEAP32[ptr] = BINEXPR;
        HEAP32[ptr+1] = compile(node.left);
        HEAP32[ptr+2] = LOAD1;
        HEAP32[ptr+3] = compile(node.right);
        HEAP32[ptr+4] = LOAD2;
        HEAP32[ptr+5] = BINOP;
        HEAP32[ptr+6] = node.operator.charCodeAt(0);
        return ptr;
    }
    /**
     *
     * @param node
     * @returns {*}
     */
    function program(node) {
        var body = node.body;
        var strict = !!node.strict;
        var len = body.length;
        var ptr = STACKTOP >> 2; // /4
        HEAP32[ptr] = PRG;          // "Program"
        HEAP32[ptr+1] = strict|0;   // node.strict
        HEAP32[ptr+2] = len|0;        // body.length
        STACKTOP += 12;             //
        STACKTOP += (len << 2);   // *4
        for (var i = 0, j = len; i < j; i++) {
            HEAP32[ptr+3+i] = compile(body[i]);// fill array with starting offsets
        }
        return ptr;
    }
    /**
     *
     * @param ast
     * @returns {number}
     */
    function compile(ast) {
        if (!ast) return -1;
        switch (ast.type) {
            case "StringLiteral":           return stringLiteral(ast);
            case "Identifier":              return identifier(ast);
            case "NumericLiteral":          return numericLiteral(ast);
            case "Program":                 return program(ast);
            case "BooleanLiteral":          return booleanLiteral(ast);
            case "ExpressionStatement":     return expressionStatement(ast);
            case "AssignmentExpression":    return assignmentExpression(ast);
            case "BinaryExpression":break;
            case "CallExpression":break;
            case "NewExpression":break;
            default:return -1;
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
     * the steps are to call init, compile and get
     * and to unify it i add the method compileUnit
     * @type {null}
     */
    exports.init = init;
    exports.compile = compile;
    exports.get = get;
    exports.compileUnit = compileUnit;
});


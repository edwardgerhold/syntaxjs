/**
 *
 *
 */

define("vm", function (require, exports) {

    var compiler = require("asm-compiler");

    /**
     * intl functions to translate messages from the beginning on
     * @type {Function|format}
     */
        
    var format = require("i18n").format;
    var formatStr = require("i18n").formatStr;
    var trans = require("i18n").trans;

    /**
     * this is just the bytecode memory
     */
    var POOL;
    var MEMORY;
    var HEAP8;
    var HEAPU8;
    var HEAP16;
    var HEAPU16;
    var HEAP32;
    var HEAPU32;
    var FLOAT32;
    var FLOAT64;
    var STACKTOP;
    var STACKSIZE;


    /**
     * registers
     */
    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    var r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;



    /**
     * the bytecodes,
     *
     * @type {number}
     */
    var PRG = 0x05;
    var SLIST = 0x06;

    var SCONST = 0x15;  // load string from constant pool (index next nr)
    var NCONST = 0x16;  // load number from constant pool
    var ICONST = 0x17;  // load identifername from constant pool (index is next int)


    var TRUEBOOL = 0x20;       // BooleanLiteral "true"  (know the code, choose register)
    var FALSEBOOL = 0x21;      // BooleanLiteral "false" (know the code, choose register)

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
     * i knew from the beginning on, later i will replace them
     * currently they will slow down and help a little within
     * the code until it becomes replacable
     * @type {exports}
     */

    var ecma = require("api");
    var parse = require("parser");
    var parseGoal = parse.parseGoal;
    var withError = ecma.withError;
    var newTypeError = ecma.newTypeError;
    var newSyntaxError = ecma.newSyntaxError;
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var getRealm = ecma.getRealm;
    var getLexEnv = ecma.getLexEnv;
    var getContext = ecma.getContext;
    var GetIdentifierReference = ecma.GetIdentifierReference;
    var NormalCompletion = ecma.NormalCompletion;
    var applyBinOp = ecma.applyBinOp;
    var getAssignmentOperationResult = ecma.getAssignmentOperationResult;
    function getReference(poolIndex) {
        r0 = GetIdentifierReference(getLexEnv(), POOL[poolIndex], strict);
    }
    function getTrue() {
        r0 = true;
    }
    function getFalse() {
        r0 = false;
    }
    function getFromPool(index) {
        r0 = POOL[index];
    }
    function getBinaryResult(operator) {
        r0 = applyBinOp(String.fromCharCode(operator), r1, r2);
    }

    var r1s = [];
    var r2s = [];

    function saveR1() {
        "use strict";
        r1s.push(r1);
    }
    function restoreR1() {
        "use strict";
        r1 = r1s.pop();
    }
    function saveR2() {
        "use strict";
        r2s.push(r2);
    }
    function restoreR2() {
        "use strict";
        r2 = r2s.pop();
    }

    /**
     *
     */

    var strict = false;     // strictMode

    /**
     * stack - contains the ptr to the next instruction
     *
     * should grow each statement list, and shrink each instruction
     * the program should halt (or run nextTask) if the stack is empty.
     */

    var stackBuffer, stack, sp;

    function unknownInstruction(code) {
        r0 = newTypeError(format("UNKNOWN_INSTRUCTION_S", code));
    }

    function main() {
        "use strict";
        "use asm soon";

        do {

            console.log("main: sp is " + sp);
            var ptr = stack[sp];      // 1. ptr from stack
            console.log("main: got ptr " + ptr);
            var code = HEAP32[ptr];     // 2. byte code from heap[ptr]
            console.log("main: got code " + code);
            console.log("code is:");
            switch (code) {
                case PRG:
                    console.log("PRG")
                    strict = HEAP32[ptr + 1]; // strict mode? external calls to set strict? a lot of procedures will be.
                    console.log("strict = " + strict);
                    r1 = ptr + 3;                           // -> first instruction
                    console.log("first instruction is at " + r1);
                    r3 = HEAP32[ptr + 2];     // number of instructions
                    console.log("number of instructions " + r3);
                    r2 = r1 + r3 - 1;           // -> last instruction
                    console.log("last instruction = " + r2);
                    for (; r2 >= r1; r2--) {
                        stack[sp] = HEAP32[r2]; // that is a ptr
                        console.log("added ptr " + stack[sp] + " to sp " + sp)
                        sp = sp + 1;
                    } // last element first onto stack
                    sp = sp - 1; // go back to stack top
                    continue;
                case EXPRSTMT:
                    console.log("EXPRSTMT");
                    stack[sp] = HEAP32[ptr+1];
                    continue;
                case SCONST:
                    console.log("SCONST");
                    getFromPool(HEAP32[ptr + 1])
                    break;
                case NCONST:
                    console.log("NCONST");
                    getFromPool(HEAP32[ptr + 1]);
                    break;
                case ICONST:
                    console.log("ICONST")
                    getReference(HEAP32[ptr + 1]); // uses pool outside of the block
                    break;
                case TRUEBOOL:
                    console.log("TRUEBOOL");
                    getTrue();
                    break;
                case FALSEBOOL:
                    console.log("FALSEBOOL");
                    getFalse();
                    break;
                case ADDI:
                    console.log("ADDI")
                    r1 = HEAP32[ptr+1];
                    r2 = HEAP32[ptr+2];
                    r0 = r1+r2;
                    break;
                case BINEXPR:
                    console.log("BINEXPR");
                    stack[sp]   = HEAP32[ptr+5];// BINOP (add r1 + r2 into r0)
                    stack[++sp] = HEAP32[ptr+4] // LOAD2
                    stack[++sp] = HEAP32[ptr+3] // bytecode right // eval and next from stack is load2
                    stack[++sp] = HEAP32[ptr+2] // LOAD1
                    stack[++sp] = HEAP32[ptr+1] // bytecode left // eval and second from stack is load1
                    continue;
                case LOAD1:
                    console.log("LOAD1");
                    saveR1();
                    r1 = r0;
                    break;
                case LOAD2:
                    console.log("LOAD2");
                    saveR2();
                    r2 = r0;
                    break;
                case BINOP:
                    console.log("BINOP")
                    getBinaryResult(HEAP32[ptr+1]); // ptr+1 == operator
                    restoreR1();
                    restoreR2();
                    break;
                case HALT:
                    return;
                default:
                    unknownInstruction(code);
                    return;
            }
            sp = sp - 1;
        } while (sp >= 0);
    }

    function CompileAndRun(realm, src) {
        var ast;
        try {ast = parse(src)} catch (ex) {return newSyntaxError( ex.message)}
        var unit = compiler.compileUnit(ast);
        POOL = unit.POOL;
        MEMORY = unit.MEMORY;
        HEAP8 = unit.HEAP8;
        HEAPU8 = unit.HEAPU8;
        HEAP16 = unit.HEAP16;
        HEAPU16 = unit.HEAPU16;
        HEAPU32 = unit.HEAPU32;
        HEAP32 = unit.HEAP32;
        FLOAT32 = unit.FLOAT32;
        FLOAT64 = unit.FLOAT64;
        STACKTOP = unit.STACKTOP;
        STACKSIZE = unit.STACKSIZE;
        r0 = undefined;
        stackBuffer = new ArrayBuffer(4096 * 16);
        stack = new Int32Array(stackBuffer);
        sp = 0;
        stack[0] = 0; 
        main();
        if (isAbrupt(r0=ifAbrupt(r0))) return r0;
        return NormalCompletion(r0);
    }
    exports.CompileAndRun = CompileAndRun;
});
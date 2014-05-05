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


    var EQ = 0x50;
    var NEQ = 0x51;

    var HALT = 0x255;


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

    function getReference(poolIndex) {
        r0 = GetIdentifierReference(getLexEnv(), POOL[poolIndex], strict);
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

        do {

            console.log("sp is "+sp);
            var ptr = stack[sp];      // 1. ptr from stack
            console.log("got ptr "+ptr);
            var code = HEAP32[ptr];     // 2. byte code from heap[ptr]
            console.log("got code "+code);


            switch (code) {
                case PRG:

                    console.log("PRG")

                    strict = HEAP32[ptr + 1]; // strict mode? external calls to set strict? a lot of procedures will be.
                    console.log("strict = " + strict);

                    r1 = ptr + 3;                           // -> first instruction
                    console.log("first instruction is at " + r1);


                    r3 = HEAP32[ptr + 2];     // number of instructions
                    console.log("number of instructions " + r3 );

                    r2 = r1 + r3 - 1;           // -> last instruction
                    console.log("last instruction = "+ r2);

                    for (; r2 >= r1; r2--) {

                        stack[sp] = HEAP32[r2]; // that is a ptr

                        console.log("added ptr " + stack[sp] + " to sp " + sp)
                        sp = sp + 1;

                    } // last element first onto stack

                    sp = sp - 1; // go back to stack top

                    continue;
                case SCONST:
                    console.log("SCONST");
                    r0 = POOL[HEAP32[ptr + 1]];
                    break;
                case NCONST:
                    console.log("NCONST")
                    r0 = POOL[HEAP32[ptr + 1]]; // uses pool still inside of the block
                    break;
                case ICONST:
                    console.log("ICONST")
                    getReference(HEAP32[ptr+1]); // uses pool outside of the block
                    break;
                case TRUEBOOL:
                    console.log("TRUEBOOL");
                    r0 = true;      // booleans are not allowed?

                    break;
                case FALSEBOOL:
                    console.log("FALSEBOOL")
                    r0 = false;     // booleans are not allowed?
                    break;
                case HALT:
                    return;
                default:
                    unknownInstruction(code);
                    return;
            }

            sp = sp - 1;

        } while (sp >= 0);
   

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
        stack[0] = 0; // show to HEAP32[0] which is HALT
        main();
        if (isAbrupt(r0=ifAbrupt(r0))) return r0;
        return NormalCompletion(r0);
    }
    exports.CompileAndRun = CompileAndRun;
});
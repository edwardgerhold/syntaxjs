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
     * this is just the compiled ast
     * object semantics are not implemented in these few lines
     *
     * i´ve seen, i should learn how to write "hidden classes"
     * i heard in a talk, maybe you heard, that the other engines
     * use hidden classes now, too. And they are really simpler
     * than writing a hash for the heap, which i already wanted to
     * :-)
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

    var PC;
    var PROGLEN; // no longer

    /**
     * registers
     */
    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    var r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;



    /**
     * the bytecodes,
     * i should use a better transfer object and use
     * the dot notation in the switch statement
     * than to copy and paste them
     * @type {number}
     */
    var PRG = 0x05;
    var SLIST = 0x06;

    var SCONST = 0x15;  // load string from constant pool (index next nr)
    var NCONST = 0x16;  // load number from constant pool
    var ICONST = 0x17;  // load identifername from constant pool (index is next int)


    var NUMLIT = 0x18;         // Float follows

    var BTRUE = 0x20;       // BooleanLiteral "true"  (know the code, choose register)
    var BFALSE = 0x21;      // BooleanLiteral "false" (know the code, choose register)


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

    function getReference() {
        "use strict";
        // set register 0 with the reference (real object currently)
        // with the identifier fetched from constantPool[index from register 1]
        // that looks only like a temp solution
        r0 = GetIdentifierReference(getLexEnv(), POOL[r1], strict);
        return;
    }

    /**
     *
     */

    var strict = false;     // strictMode

    /**
     * stack - contains the ptr to the next instruction
     *
     * should grow each statement list
     * and shrink each instruction
     * the program should halt (or run nextTask) when
     * the stack is empty.
     */
    var stackBuffer, stack, sp;



    function unknownInstruction(code) {
        r0 = newTypeError(format("UNKNOWN_INSTRUCTION_S", code));
    }

    function main() {
        "use strict";

        while (sp >= 0) {

            // get next ptr from execution stack and reduce pointer
            PC = stack[sp];
            // fetch code from ptr from bytecode
            var code = HEAP32[PC];

            // evaluate byte code and work with the registers and heap
            switch (code) {
                case SLIST:
                    r3 = HEAP32[PC + 1]|0; // len
                    r1 = PC+2;             // i = pc
                    r2 = r1 + r3 - 1;      // j = i + len
                    r4 = 0;
                    for (; r2 >= r1; r2--, r4++) stack[sp+r4] = HEAP32[r2]; // first element the last on the stack
                    continue;
                case PRG:
                    strict = HEAP32[PC + 1]; // strict mode? external calls to set strict? a lot of procedures will be.
                    r3 = HEAP32[PC + 2];     // len
                    r1 = PC+3;               // i = pc
                    r2 = r1 + r3 - 1;        // j = i + len
                    r4 = 0;
                    for (; r2 >= r1; r2--, r4++) stack[sp+r4] = HEAP32[r2]; // last element first onto stack
                    continue;
                case SCONST:
                    r0 = POOL[HEAP32[PC + 1]];
                    break;
                case NCONST:
                    r0 = POOL[HEAP32[PC + 1]]; // uses pool still inside of the block
                    break;
                case ICONST:
                    r1 = HEAP32[PC + 1];
                    getReference(); // uses pool outside of the block
                    break;
                case BTRUE:
                    r0 = true;      // booleans are not allowed?
                    break;
                case BFALSE:
                    r0 = false;     // booleans are not allowed?
                    break;
                case HALT:
                    return;
                default:
                    unknownInstruction();
                    return;
            }

            sp = sp - 1;
        }
    }

    /**
     * I just kept the code from VM.eval to call require("vm").CompileAndRun
     *
     * Now this invokes the "asm.js" (eek!) compiler (which currently uses a constant pool for help)
     *
     * And then it executes the bytecode from the typed array and maybe fetches data from the
     * constant pool or calls the incredible essential methods
     *
     *  The borders of what is later the asm module and what is extern are not clear yet, for
     *  that i will have to do for a while
     *
     * I´m going to continue this.
     *
     * @param realm
     * @param src
     * @returns {*}
     * @constructor
     */


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

        PROGLEN = STACKTOP >> 2; // 32bit offset proglen (8 bit stacktop bytelen)
        STACKSIZE = unit.STACKSIZE;
        PC = 0;
        r0 = undefined;
        stackBuffer = new ArrayBuffer(4096 * 1024);
        stack = new Int32Array(stackBuffer);
        sp = 0;
        stack[sp] = 0; // show to HEAP32[0] (which should be e.g. a prg)
        main();
        if (isAbrupt(r0=ifAbrupt(r0))) return r0;
        return NormalCompletion(r0);
    }
    exports.CompileAndRun = CompileAndRun;
});
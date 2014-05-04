/**
 *
 * This VM will become some asm.js interpreter,
 * with that i mean, that it is itself written in
 * asm.js as good as it goes
 *
 * At the beginning it won´t be any real asm.js
 * and only look like making accesses to the HEAP
 * for fetching bytecodes, pointers and constant pool
 * indexes
 *
 * it is not known how i call the remaining javascript from
 * the asm.js interpreter.
 * I don´t know how much i have to rewrite from the "api" module
 * to make it work,
 * but i would be there to rewrite the whole code for making it
 * fast
 *
 * The AST interpreter is finished very soon. I have to add the stack
 * to the generator and to write down the latest call instantiation to
 * make sure the current bug which is there can no longer be there
 * and to fix the labelled break/continue(which should just be a comparison
 * on "ifAbrupt" if the label is my label to break or continue)
 * And that was all.
 * With the builtins i´m a bit behind.
 * And i am not sure, how many of the builtins i can rewrite with the asm
 * compiler. But maybe i just get the things optimized.
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
    var HEAP32;
    var STACKTOP;
    var STACKSIZE;
    var PC;

    var PROGLEN;

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
    var SCONST = 0x15;
    var NCONST = 0x16;
    var ICONST = 0x17;

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
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var getRealm = ecma.getRealm;
    var getLexEnv = ecma.getLexEnv;
    var getContext = ecma.getContext;
    var GetIdentifierReference = ecma.GetIdentifierReference;

    /**
     * my first switch in a loop to process bytecode
     *
     * inspired by the emscripten/docs/paper.pdf technology
     * that i can support and implement some asm.js like code
     * which is easily optimizable for the engine
     * that´s much better than interpreting the ast, but i love
     * the runtime so much that i will complete it (it´s not much
     * anymore, just fixing some bugs, meanwhile i can copy and paste the
     * functions to change to HEAP32[] semantics, i think that already goes)
     */

    function main() {
        "use strict";
        loop:
        while (PC < PROGLEN) {
            var code = HEAP32[PC];
            switch (code) {
                case SCONST:
                    r0 = POOL[HEAP32[PC + 1]];
                    PC += 2;
                    break;
                case NCONST:
                    r0 = POOL[HEAP32[PC + 1]];
                    PC += 2;
                    break;
                case ICONST:
                    var name = POOL[HEAP32[PC + 1]];
                    // here comes that function pool into play (first need to read valid asm.js)
                    r0 = GetIdentifierReference(getLexEnv(), name, getContext().strict)
                    PC += 2;
                    break;
                case BTRUE:
                    r0 = true;
                    PC += 1;
                    break;
                case BFALSE:
                    r0 = false;
                    PC += 1;
                    break;
                case HALT:
                    break loop;
                default:
                    r0 = newTypeError(format("UNKNOWN_INSTRUCTION_S", code));
                    break loop;

            }
        }
    }

    /**
     * I just kept the code from VM.eval to call require("vm").CompileAndRun
     *
     * Now this invokes the asm.js compiler (which currently uses a constant pool for help)
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
        HEAP32 = unit.HEAP32;
        FLOAT64 = unit.FLOAT64;
        STACKTOP = unit.STACKTOP;
        PROGLEN = STACKTOP;
        STACKSIZE = unit.STACKSIZE;
        PC = 0;
        r0 = undefined;
        main();
        return r0;
    }
    exports.CompileAndRun = CompileAndRun;
});
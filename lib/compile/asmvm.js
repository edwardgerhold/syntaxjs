
define("vm", function (require, exports) {

    var compiler = require("asm-compiler");
    /**
     * this is just the compiled ast
     * object semantics are not implemented in these few lines
     *
     */
    var POOL;
    var MEMORY;
    var HEAP32;
    var STACKTOP;
    var STACKSIZE;
    var PC;

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
        var code;
        loop:
        while (PC < STACKTOP) {
            code = HEAP32[PC];
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
                    r0 = GetIdentifierReference(getLexEnv(), name, getContext().strict)
                    PC += 2;
                    break;
                case HALT:
                    break loop;
                default:
                    r0 = withError("Type", "unknown instruction " + code);
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
     * I´m going to continue this.
     *
     * @param realm
     * @param src
     * @returns {*}
     * @constructor
     */

    function CompileAndRun(realm, src) {
        var ast;
        try {ast = parse(src)} catch (ex) {return withError("Syntax", ex.message)}
        var unit = compiler.compileUnit(ast);
        POOL = unit.POOL;
        MEMORY = unit.MEMORY;
        HEAP32 = unit.HEAP32;
        STACKTOP = unit.STACKTOP;
        STACKSIZE = unit.STACKSIZE;
        PC = 0;
        main();
        return r0;
    }
    exports.CompileAndRun = CompileAndRun;
});
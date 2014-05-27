/**
 * asm-runtime
 */

define("asm-runtime", function (require, exports) {
    var realm, strict, tailCall;
    var compiler = require("asm-compiler");
    var tables = require("tables");
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromCode = tables.unaryOperatorFromCode;
    var propDefCodes = tables.propDefCodes;
    var detector = require("detector");
    var hasConsole = detector.hasConsole;
    var format = require("i18n").format;
    var formatStr = require("i18n").formatStr;
    var trans = require("i18n").trans;



    var CODESET = require("asm-shared").BYTECODESET;
    var FLAGSET = require("asm-shared").BITFLAGSET;
    var REGISTERSET = require("asm-shared").REGISTERSET;    // dynamic. but there are other registers in HEAP32 format in use

    /**
     * Now HEAP*:
     * this is just the bytecode memory
     *
     * i will redo it
     *
     * for CS (Code segment, the below)
     * for SS (Stack Segment, a large area for executing code, registers, local vars)
     * for DS (Data Segment, the runtime HEAP for allocating objects)
     *
     * a POOL: Constant Pool shared by everyone.
     *
     *
     * If i do all in one Array Buffer.
     * A resize of the heap will cost also to copy all the compiled code
     * and the whole stack. A resize of the stack will shrink the heap.
     * A resize of the code isn´t usual. But i need to copy it, if i resize
     * the ArrayBuffer (replace with a new, larger, or smaller)
     */

    var POOL;
    var pp;
    var poolDupeMap;
    var MEMORY;
    var HEAP8;
    var HEAPU8;
    var HEAP16;
    var HEAPU16;
    var HEAP32;
    var HEAPU32;
    var HEAPF32;
    var HEAPF64;
    var STACKBASE;
    var STACKLIMIT;
    var STACKTOP;
    var STACKSIZE;
    var CALLSTACK;
    var frames;
    var frame;
    var fp = -1;

    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;

    var regs = [[],[],[],[],[],[],[],[],[],[],[]];  // if you have no operand stack, you need to save the regs.
    // in the HEAP32 the registers are stack allocated and should have a couple of slots in advance
    // i have to figure out, which numbers are good and fight to teach myself

    /**
     * old imports.
     * i think the runtime will be compatible later,
     * because the syntax tree eval can use HEAP32 objects without mourns
     * and the other way round i make it compatible by knowing the pointer
     * or the type. and if not, no, and if, two sep impl to compare are as good as always.
     * @type {exports}
     */
    var ecma = require("api");
    var parse = require("parser");
    var CodeRealm = ecma.CodeRealm;
    var CreateRealm = ecma.CreateRealm;
    var parseGoal = parse.parseGoal;
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
    var applyAssignmentBinOp = ecma.applyAssignmentBinOp;
    var EvaluateCall = EvaluateCall;
    var GetValue = ecma.GetValue;
    var PutValue = ecma.PutValue;
    var ExecutionContext = ecma.ExecutionContext;
    var stack, pc;
    var state = [];    // save
    var st = -1;

    /**
     *  Data Structures
     *  Objects, Functions, Environments
     *  Callstack,
     */
    function newContext() {
        var context = new Int32Array(STACKTOP, 8);
        STACKTOP += 32;
        CALLSTACK.push(context);
    }
    function oldContext() {
        CALLSTACK.pop();
    }
    function OrdinaryObject() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.OBJECT;
        STACKTOP += 32;
        return ptr;
    }
    function OrdinaryFunction () {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.OBJECT;
        HEAP32[ptr+1] = BITS.IS_CALLABLE | BITS.IS_CONSTRUCTABLE | BITS.IS_EXTENSIBLE;
        STACKTOP += 32;
        return ptr;
    }
    function DeclarativeRecord() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.LOCALREC;   // Kenne funktionstabelle durch den typen
        HEAP32[ptr+2] = allocateBindingRecords(numberLocalBindings);
        return ptr;
    }
    function ObjectRecord() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.OBJECTREC;
        return ptr;
    }
    function FunctionRecord() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.FUNCTIONREC;
        return ptr;
    }
    function GlobalRecord() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.GLOBALREC;
        return ptr;
    }



    function main(pc) {
        "use strict";
        // local registers
        var $0,$1,$2,$3,$4,$5,$6,$7,$8,$9,$A,$B,$C,$D,$E,$F;
        var result; // oh, what register. maybe i learn.
        //  var state = 0;
        while (1) {
            var code = HEAP32[pc];
            switch(code) {
                case BYTECODE.PRG:
                case BYTECODE.EXPR:
                case BYTECODE.SEQEXPR:
                    state[++st] = code;
                    pc = pc + 1;
                    continue;
                case BYTECODE.JMP:
                    pc = HEAP32[pc+1];
                    continue;
                case BYTECODE.REFERENCE:
                    // ReferenceRecord(HEAP32.subarray(pc,4);
                    var PTR = STACKTOP >> 2;
                    STACKTOP += 20;
                    HEAP32[PTR] = TYPES.REFERENCE;
                    HEAP32[PTR+1] = HEAP32[pc+1];
                    HEAP32[PTR+2] = HEAP32[pc+2];
                    HEAP32[PTR+3] = HEAP32[pc+3];
                    HEAP32[PTR+4] = HEAP32[pc+4];
                    pc = pc + 5;
                    continue;
                case BYTECODE.PUTVALUE:
                    var lhs = HEAP32[pc+1];
                    var value = HEAP32[pc+2];
                    if (lhs[0] == TYPES.REFERENCE) {
                        lhs[1] = value; // setting base
                        r0 = undefined;
                    } else {
                        r0 = newReferenceError();
                    }
                    pc = pc + 2;
                    continue;
                case BYTECODE.GETOWNPROPERTY:
                    var O = HEAP32[pc+1];
                    var P = HEAP32[pc+2];
                    var propList = POOL[O[1]];  // O[1] ist die PropNameList (war auf Papier am Ende nach 1* type und bits, aber egal)
                    var desc = O[propList[P]];
                    r0 = desc[1];
                    pc = pc + 3;    // CODE.GETOWNPROP, O, P = 3
                    continue;
            }

            if (STACKTOP >= MEMORY.byteLength - 1024) {
                /**
                 * time to do the magic garbage colletion
                 */
            }
        }
    }

    /**
     *
     * @param realm
     * @param src
     * @returns {*}
     * @constructor
     */

    function set(unit) {
        POOL = unit.POOL;
        pp = unit.pp;
        poolDupeMap = unit.poolDupeMap;
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
        CODESET = unit.CODESET;
        FLAGSET = unit.FLAGSET;
        BITS = unit.BITS;
    }

    function init(numGlobalLocalVars) {   // callstack up
        stack = new Int32Array(MEMORY, STACKTOP);
        STACKTOP += 4096 * 16;
        framesArrayBuffer = new ArrayBuffer(4096 * 16);
        frames = new Int32Array(MEMORY, STACKTOP);
        var nul = STACKTOP;
        STACKTOP += 4096 * 16;      // we run out of
        fp = 0;
        frame = frames[fp] = ExecutionRecord(numGlobalLocalVars, nul, realm);
    }

    function allocateLocalVars(numVars) {
        // can be determined by static source analysis how many _exactly_
        var ptr = STACKTOP >> 2;
        STACKTOP += numVars * 16;   // 16? too much? 4 slots each variable with no design for now
        return ptr;
    }

    function allocateRegisters(numRegs) {
        var ptr = STACKTOP >> 2;
        STACKTOP += numRegs * 20; // can hold a full reference and completion, don´t know if this is an useful thought
        return ptr;
    }

    function ExecutionRecord(numVars, outer, stack, realm) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 7 << 2;
        HEAP32[0] = TYPES.CALLCONTEXT;
        HEAP32[1] = allocateLocalVars(numVars, outer, stack);//write start offset, block is numVars + sizeOfVar
        HEAP32[2] = allocateRegisters(numRegs); //write start offset
        HEAP32[3] = stack;
        //HEAP32[4] = getPtr(realm.globalThis);
        //HEAP32[5] = getPtr(realm.globalEnv);
        //HEAP32[6] =
        return ptr;
    }

    function getType(O) {
        if (typeof O === "number") {
            // try ptr
        } else if (typeof O === "object") {
            // return native type
        }

    }

    function getPtr(obj) {
        if (typeof obj === "object" && hasInternalSlot(obj, Bindings)) {
            var ptr = STACKTOP;
            STACKTOP += 8;
            HEAP32[ptr] = TYPES.OBJECT;
            //HEAP32[ptr+1] = addToConstantPool(obj);
            return ptr;
        }
    }

    /**
     *
     * new interface for the asm parser
     * but the old code has to go now!!!
     * next!! at once!! today!! tomorrow!!!
     * YESTERDAY!!!
     *
     * @param realm
     * @param unit
     * @returns {*}
     */


    function RunUnit(unit, realm) {
        if (realm = undefined) {
            // Initialize
            realm = CreateRealm();
        }
        set(unit);
        init();
        pc = 0;
        stack[pc] = STACKBASE;
        main(pc);
        if (isAbrupt(r0=ifAbrupt(r0))) return r0;
        return NormalCompletion(r0);
    }

    function CompileAndRun(realm, src) {
        var ast;
        try {ast = parse(src)} catch (ex) {return newSyntaxError(ex.message)}
        var unit = compiler.compileUnit(ast);
        set(unit);
        init();
        pc = 0;
        stack[pc] = STACKBASE; // ip to first bytecode at HEAP32[stack[0]]
        main(pc);
        if (isAbrupt(r0=ifAbrupt(r0))) return r0;
        return NormalCompletion(r0);
    }
    exports.CompileAndRun = CompileAndRun;
    exports.RunUnit = RunUnit;
});
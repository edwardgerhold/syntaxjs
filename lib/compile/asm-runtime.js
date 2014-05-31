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


    var POOL;
    var pp;
    var DUPEPOOL;
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

    var regs = [[],[],[],[],[],[],[],[],[],[],[]];  // if you have no operand stack, you need to save the regs


    var ecma = require("old-api");
    var parse = require("parser");
    var CodeRealm = ecma.CodeRealm;
    var CreateRealm = ecma.CreateRealm;
    var parseGoal = parse.parseGoal;
    var stack, pc;
    var state = [];    // save
    var st = -1;

    /**
     * need a dispatch or do i compile them away?
     */
    function hasInternalSlot() {

    }
    function callInternalSlot() {

    }
    function getInternalSlot() {

    }
    function setInternalSlot() {

    }

    var REALM_TYPE = 0;
    var REALM_INTR = 1;


    function CodeRealm() {

    }

    function Intrinsics() {

    }

    /**
     * long list of substitutions
     */

    /*
        object field access
     */
    var OBJ_TYPE = 0;
    var OBJ_FLAGS = 1;

    /*
        execution context fields
     */
    var CTX_RETADDR = 0;
    var CTX_GTHIS = 1;
    var CTX_GENV = 2;
    var CTX_GENERATOR = 3;
    var CTX_REALM = 4;

    var CTX_VARENV = 5;
    var CTX_LEXENV = 6;

    /*
        environment record fields
     */
    var ENV_TYPE = 0;
    var ENV_FLAGS = 1;
    var ENV_DYN_MAP = 2;
    var ENV_SLOTS = 3;


    /*
        binding record fields
     */
    var BINDING_TYPE = 0;
    var BINDING_FLAGS = 1;
    var BINDING_KEY = 3;
    var BINDING_VALUE = 4;

    /*
        property descriptor fields
     */
    var PROP_TYPE = 0;
    var PROP_FLAGS = 1;
    var PROP_KEY= 2;
    var PROP_VALUE = 3;
    var PROP_GET = 3;
    var PROP_SET = 4;



    /**
     *
     *  Data Structures
     *  Objects, Functions, Environments
     *  Callstack,
     */

    /**** I need the functions already in the compiler, so i should move them out, like into asm-shared.js or asm-api.js **/

    function SymbolPrimitiveType(desc) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = TYPES.SYMBOL;
        HEAP32[ptr+1] = StringPrimitiveType()
        return ptr;
    }

    function StringPrimitiveType(str) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.STRING;
        var strLen = str.length;
        var realLen = 0;
        var ptr16 = (ptr+1) << 1;
        var i = 0;
        var cp1, cp2;
        while (i < strLen) {
            cp1 = str[i].charCodeAt(0);
            HEAP32[ptr16+i] = cp1;
            if (cp1 > 0xD800 && cp1 < 0xD8FF) {
                cp2 = str[i].charCodeAt(1);
                strLen = strLen + 1;
                i = i + 1;
                HEAP32[ptr16+i] = cp2;
            }
            i = i + 1;
        }
        HEAP32[ptr+1] = strLen;
        STACKTOP += 8 + Math.ceil(strLen / 2) * 4;
        return ptr;
    }
    function ConstantPoolStringPrimitiveType(str) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.STRINGCONST;
        HEAP32[ptr+1] = addToConstantPool(str);
        return ptr;
    }
    function ConstantPoolNumberPrimitiveType(v) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.NUMBERCONST;
        HEAP32[ptr+1] = addToConstantPool(v);
        return ptr;
    }
    function NumberPrimitiveType(v) {   // Number kann man zentral aendern
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.NUMBER;         // F32 is lossless??? it´s untested that´s why its here
        HEAPF32[ptr+1] = v >> 32;           // schneide unteren Teil ab
        HEAPF32[ptr+2] = v & 0xFFFFFFFF;    // Maskiere oberen Teil weg?
        STACKTOP += 12;                     // F64 needs alignment. I´ve never tried to merge to F32. 8*I8 to F64 fails of course.
        return ptr;
    }
    function BooleanPrimitiveType(v) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = TYPES.BOOLEAN;
        HEAP32[ptr+1] = (+(!!v));
        return ptr;
    }
    function NullPrimitiveType() {
        var ptr = STACKTOP >> 2;
        STACKTOP += 4;
        HEAP32[ptr] = TYPES.NULL;
        return ptr;
    }
    function UndefinedPrimitiveType() {
        var ptr = STACKTOP >> 2;
        STACKTOP += 4;
        HEAP32[ptr] = TYPES.UNDEFINED;
        return ptr;
    }

    function allocateProperties(n) {
        var ptr = STACKTOP >> 2;
        STACKTOP += n * 4;
        return ptr;
    }

    function OrdinaryObject() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.OBJECT;
        HEAP32[ptr+1] = 0;  // TYPE ORDINARY (klärt slots)
        HEAP32[ptr+2] = allocateProperties(10);
        STACKTOP += 8;
        return ptr;
    }
    function OrdinaryFunction () {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.OBJECT;
        HEAP32[ptr+1] = 0;
        STACKTOP += 8;
        return ptr;
    }
    function ArrayExoticObject() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.OBJECT;
        HEAP32[ptr+1] = 0;
        STACKTOP += 8;
        return ptr;
    }


    /**
     * TYPES.BINDING
     * FLAGS
     * ptr VALUE
     * ptr key
     * @constructor
     */
    function BindingRecord(v, c, i) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.BINDINGRECORD;
        var flags = 0;
        if (c) flags |= FLAGS.CONFIGURABLE;
        if (i) flags |= FLAGS.INITIALIZED;
        if (k) flags |= FLAGS.KEY;
        HEAP32[ptr+1] = flags;
        HEAP32[ptr+2] = v;
        if (k) HEAP32[ptr+3] = k;
        return ptr;
    }
    /**
     * TYPES.DATADESC // TYPES.ACCESSORDESC
     * FLAGS (conf, write, enum)
     * ptr VALUE | ptr GET
     *             ptr SET
     * ptr key
     * @constructor
     */

    function DataPropertyDescriptor(c,e,v,w,k) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.DATADESCRIPTOR;
        var flags = 0;
        if (c) flags |= FLAGS.CONFIGURABLE;
        if (e) flags |= FLAGS.ENUMERABLE;
        if (w) flags |= FLAGS.WRITABLE;
        if (k) flags |= FLAGS.KEY;
        HEAP32[ptr+1] = flags;
        HEAP32[ptr+2] = v;
        if (k) HEAP32[ptr+3] = k;
        return ptr;
    }


    function AccessorPropertyDescriptor(c,e,g,s, k) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.ACCESSORDESCRIPTOR;
        var flags = 0;
        if (c) flags |= FLAGS.CONFIGURABLE;
        if (e) flags |= FLAGS.ENUMERABLE;
        if (k) flags |= FLAGS.KEY;
        HEAP32[ptr+1] = flags;
        HEAP32[ptr+2] = g|0;
        HEAP32[ptr+3] = s|0;
        if (k) HEAP32[ptr+4] = k;
        return ptr;
    }




    function DeclarativeRecord() {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = TYPES.LOCALREC;   // Kenne funktionstabelle durch den typen
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
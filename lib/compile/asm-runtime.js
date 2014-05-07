/**
 *
 *  there is a difference between
 *  operand stack and a push of the result onto
 *
 *  or a r0 for result
 *  and a copy to r1 or r2 with and extra instruction
 *
 *  the same for the node.type headers, they can be factored out
 *
 *
 *
 */

define("vm", function (require, exports) {


    var realm;

    var compiler = require("asm-compiler");

    var codeForOperator = require("tables").codeForOperator;
    var operatorForCode = require("tables").operatorForCode;
    var unaryOperatorFromCode = require("tables").unaryOperatorFromCode;

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
    var HEAPF32;
    var HEAPF64;
    var STACKTOP;
    var STACKSIZE;

    /*
        before i forget
     */

    var operandStack = new Array(1000);
    var oc = -1;
    function pushOp() {
        operandStack[++oc] = r0;
    }
    function pop1Op() {
        r1 = operandStack[oc--];
    }
    function pop2Op() {
        // r2 is evaled first, so popped of last
        r1 = operandStack[oc--];
        r2 = operandStack[oc--];
    }

    /**
     * registers
     */

    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    var r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;


    /*
        saving registers
        before using the operand stack
        i had to save the registers

        dunno if it´s needed later
     */
    var r1s = [];
    var r2s = [];

    function saveR1() {
        r1s.push(r1);
    }
    function restoreR1() {
        r1 = r1s.pop();
    }
    function saveR2() {
        r2s.push(r2);
    }
    function restoreR2() {
        r2 = r2s.pop();
    }
    function r0r1() {
        r1 = r0;
    }
    function r0r2() {
        r2 = r0;
    }

    /**
     * the bytecodes,
     *
     * What i figured out, you can see it at repeating blocks
     * The initial "...EXPR" int code can be removed.
     * In better VMs you see already that the code has been removed
     *
     *
     * @type {number}
     */
    var PRG = 0x05;
    var SLIST = 0x06;
    var STR = 0x10;
    var NUM = 0x11;
    var NUL = 0x12;
    var UNDEF = 0x13;
    var STRCONST = 0x15;  // load string from constant pool (index next nr)
    var NUMCONST = 0x16;  // load number from constant pool
    var IDCONST = 0x17;  // load identifername from constant pool (index is next int)
    var TRUEBOOL = 0x20;       // BooleanLiteral "true"  (know the code, choose register)
    var FALSEBOOL = 0x21;      // BooleanLiteral "false" (know the code, choose register)
    var EXPRSTMT = 0x33;
    var PARENEXPR = 0x34;
    var SEQEXPR = 0x35;
    var UNARYEXPR = 0x36;
    var UNARYOP = 0x37;
    var POSTFIXOP = 0x38;
    var IFEXPR = 0x60;
    var IFOP = 0x61;
    var WHILESTMT = 0x63;
    var WHILEBODY = 0x64;
    var DOWHILESTMT = 0x65;
    var DOWHILECOND = 0x66;
    var BLOCKSTMT = 0x70;
    var ASSIGNEXPR  = 0xA0;
    var ASSIGN = 0xA1;
    var BINEXPR = 0xB0;
    var LOAD1   = 0xB1;
    var LOAD2   = 0xB2;
            var BINOP   = 0xB3;
    var CALLEXPR = 0xC0;
    var CALL = 0xC1;
    var NEWEXPR = 0xC2;
    var CONSTRUCT = 0xC3;
    var RET = 0xD0;
    var ERROR = 0xFE;
    var HALT = 0xFF;
    var EMPTY = -0x01;  // negative can not point into something



    /**
     * i knew from the beginning on, later i will replace them
     * currently they will slow down and help a little within
     * the code until it becomes replacable
     * @type {exports}
     */

    var ecma = require("api");
    var parse = require("parser");
    var CodeRealm = ecma.CodeRealm;
    var CreateRealm = ecma.CreateRealm;
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
    var applyAssignmentBinOp = ecma.applyAssignmentBinOp;
    var EvaluateCall = EvaluateCall;
    var GetValue = ecma.GetValue;
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
    function getNumberFromPool(index) {
        r0 = +POOL[index];
    }
    function getStringFromPool(index) {
        r0 = ""+POOL[index];
    }
    function getBinaryResult(operator) {
        r1 = operandStack[oc--];
        r2 = operandStack[oc--];
        r1 = GetValue(r1);
        r2 = GetValue(r2);
        if (isAbrupt(r1=ifAbrupt(r1))) r0 = r1;
        else if (isAbrupt(r2=ifAbrupt(r2))) r0 = r2;
        else r0 = applyBinOp(operatorForCode[operator], r1, r2);
    }
    function getAssignmentResult(operator) {
        r1 = operandStack[oc--];
        r2 = operandStack[oc--];
        if (isAbrupt(r1=ifAbrupt(r1))) r0 = r1;
        else if (isAbrupt(r2=ifAbrupt(r2))) r0 = r2;
        else r0 = applyAssignmentBinOp(operatorForCode[operator], r1, r2);
    }
    function getCallResult() {
        r1 = operandStack[oc--];
        r2 = operandStack[oc--];
        if (isAbrupt(r1=ifAbrupt(r1))) r0 = r1;
        else if (isAbrupt(r2=ifAbrupt(r2))) r0 = r2;
        else r0 = EvaluateCall(r1, r2, strict);
    }
    function getConstructResult() {
        r2 = operandStack[oc--];
        r1 = operandStack[oc--];
        if (isAbrupt(r1=ifAbrupt(r1))) r0 = r1;
        else if (isAbrupt(r2=ifAbrupt(r2))) r0 = r2;
        else r0 = OrdinaryConstruct(r1, r2);
    }
    function getUnaryResult(operator) {
        r1 = operandStack[oc--];
        if (isAbrupt(r1=ifAbrupt(r1))) r0 = r1;
        else r0 = applyUnaryOp(unaryOperatorFromCode[operator], true, r1);
    }
    function getPostfixResult(operator) {
        r1 = operandStack[oc--];
        if (isAbrupt(r1=ifAbrupt(r1))) r0 = r1;
        else r0 = applyUnaryOp(unaryOperatorFromCode[operator], false, r1);
    }
    function getString() {
        r0 = String.fromCharCode.apply(undefined, r1);
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
    function unknownError() {
        "use strict";
        r0 = newTypeError(format("UNKNOWN_ERROR"))
    }
    /*
        this thing reads, loads the stack up,
        continues.
        the rule is to assign to stack[sp++]
        and to break; for the sp = sp - 1; at the end
        that we can get the next ptr from stack[sp];
        this loops through the whole code
        the stack will be filled and worked down

        the good is, the same is what i will
        do with runtime.js that i can bring a
        sophisticated solution for the generator.
        And with the same manner i also reduce
        the too large call stack by a lot. I will
        call methods, but not so deep again, then.
     */
    function main() {
        "use strict";
        var $1,$2,$3,$4;
        /*
            the external functions
            will be as expensive
            as calling
            a WhiteSpace()||LineTerminator()||Comment()||Expression()||
            each token
            and slow down the sign to the max. Calls are the worst of all statements.
            Even if the functions are "first class", they cost too much used little wrong.

         */

        do {
            var ptr = stack[sp];        // 1. ptr from stack (running program)
            var code = HEAP32[ptr];     // 2. start byte code from heap[ptr] (compiled code)
            switch (code) {
                /*
                    ptr+1 strict
                    ptr+2 len
                    ptr+2+1+len ptrs
                 */
                case PRG:
                    strict = HEAP32[ptr + 1];
                    r1 = ptr + 3;             // -> first instruction
                    r3 = HEAP32[ptr + 2];     // number of instructions
                    r2 = r1 + r3 - 1;         // -> last instruction
                    for (; r2 >= r1; r2--) stack[sp++] = HEAP32[r2];
                    break;
            /**
             *  sequence expressions
             *  are , separated
             *
             *  saved as
             *  [0] seqexpr
             *  [1] len
             *  [2..1+len] expr ptrs
             */
                case BLOCKSTMT:
                case SEQEXPR:
                    r1 = ptr + 2;
                    r3 = HEAP32[ptr + 1];
                    r2 = r1 + r3 - 1;
                    for (; r2 >= r1; r2--) stack[sp++] = HEAP32[r2]; 
                    break;
                /*
                */
                case IFEXPR:
                    stack[sp++] = ptr+2; // IFOP (compares r0 to true)
                    stack[sp++] = HEAP32[ptr+1]; // eval test
                    break;
                case IFOP:
                    if (!!r0) stack[sp++] = HEAP32[ptr+1];
                    else stack[sp++] = HEAP32[ptr+2];
                    break;
                /**
                 * expression statement
                 * and parenthesized expression
                 * i could skip this code
                 * but i didn´t
                 */
                case EXPRSTMT:
                case PARENEXPR:
                    stack[sp++] = HEAP32[ptr+1];
                    break;
                /*
                 * from the constant pool
                 */
                case STRCONST:
                    getStringFromPool(HEAP32[ptr + 1])
                    break;
                case NUMCONST:
                    getNumberFromPool(HEAP32[ptr + 1]);
                    break;
                case IDCONST:
                    getReference(HEAP32[ptr + 1]); // uses pool outside of the block
                    break;
                case TRUEBOOL:
                    //r0 = true;
                    getTrue();
                    break;
                case FALSEBOOL:
                    //r0 = false;
                    getFalse();
                    break;
            /**
             * str and num
             * with real alignment and encoding
             *
             */
                case STR:
                    r2 = HEAP32[ptr+1];
                    r1 = HEAPU16.subarray(((ptr+2)<<1), (((ptr+2)<<1)+r2));
                    getString();
                    break;
                case NUM:
                    r0 = HEAPF64[(ptr+1)>>1];
                    break;
            /**
             *
             * too much code
             * (transfered r0 to r1
             * or r0 to r2)
             * saved Register R1 or R2 with saveR?() before
             * (i see there are multiple ways to do such a machine)
             *
             * now it pushes onto the operand stack
             *
             * maybe these bytes are faster than the
             * opstack array
             *
             * but these codes add 2 instructions each target node
             */
                case LOAD1:
                    pushOp();       // now it´s no longer a r0->r1, now it pushes r0 onto the operandStack[++oc] = r0
                    break;
                case LOAD2:
                    pushOp();       // can be removed by assuring the other operation does the push onto the opstack
                                    // when the result is calculated, like in school already thaught since decades.
                    break;
            /**
             *  binary expressions
             *  assignment,
             *  call
             *  have the same order
              */
                case BINEXPR:
                case ASSIGNEXPR:
                case NEWEXPR:
                case CALLEXPR:
                    stack[sp++] = ptr+5; // 5. will be executed last
                    stack[sp++] = ptr+4; // 4. LOAD2 (arguments from r0 -> r2)      <---- can be removed
                    stack[sp++] = HEAP32[ptr+3]; // 3. second: arguments to r0
                    stack[sp++] = ptr+2; // 2. LOAD1 (callee from r0 -> r2)             <---- can be removed
                    stack[sp++] = HEAP32[ptr+1]; // 1. first statement: callee to r0
                    break;
                case BINOP:
                    getBinaryResult(HEAP32[ptr+1]); // ptr+1 == operator
                    break;
                case ASSIGN:
                    getAssignmentResult(HEAP32[ptr+1]); // ptr+1 == operator
                    break;
                case CALL:
                    getCallResult();
                    break;
                case CONSTRUCT:
                    getConstructResult();
                    break;
            /**
             * unary expression code blocks
             */
                case UNARYEXPR:
                    stack[sp++] = ptr+3;         // UNARYOP/POSTFIXOP (reads from r1, see getUnary/PostfixResult, should change)
                    stack[sp++] = ptr+2;         // LOAD 1 <--- not needed (remove)
                    stack[sp++] = HEAP32[ptr+1]; // calulate this .argument
                    break;
                case UNARYOP:
                    getUnaryResult(HEAP32[ptr+1]);
                    break;
                case POSTFIXOP:
                    getPostfixResult(HEAP32[ptr+1]);
                    break;
            /**
             * while
             */
                case WHILESTMT:
                    stack[sp++] = ptr+2;         // 2. goto whilebody
                    stack[sp++] = HEAP32[ptr+1]; // 1. condition
                    break;
                case WHILEBODY:
                    if (r0) {
                        r1 = ptr + 2; // first
                        r3 = HEAP32[ptr + 1]; // len
                        r2 = r1 + r3 - 1; // last
                        stack[sp++] = r2+1; // r2+1. back to whileexpr
                        for (; r2 >= r1; r2--) stack[sp++] = HEAP32[r2];
                    }
                case DOWHILESTMT:

                        r1 = ptr + 2; // first
                        r3 = HEAP32[ptr + 1]; // len
                        r2 = r1 + r3 - 1; // last
                        stack[sp++] = r2+1; // r2+1. back to dowhilebody
                        // better if op here

                        for (; r2 >= r1; r2--) stack[sp++] = HEAP32[r2];

                    break;
                case DOWHILECOND:
                    if (r0) {
                        stack[sp++] = HEAP32[ptr+1];
                    }
                break;
            /**
             *
             * first crap
             */
                case HALT:
                    return;
                case ERROR:
                    unknownError();
                    return;
                default:
                    unknownInstruction(code);
                    return;
            }
            sp = sp - 1;
        } while (sp >= 0);
    }

    /**
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
        HEAPF32 = unit.HEAPF32;
        HEAPF64 = unit.HEAPF64;
        STACKTOP = unit.STACKTOP;
        STACKSIZE = unit.STACKSIZE;
        r0 = undefined;
        stackBuffer = new ArrayBuffer(4096 * 16);
        stack = new Int32Array(stackBuffer);
        sp = 0;
        stack[0] = 0; // ptr to first bytecode at HEAP32[stack[0]]
        realm = CreateRealm(); // this costs starting the thing a lot of ms to create all objects.
        ecma.saveCodeRealm();
        ecma.setCodeRealm(realm);
        main();
        ecma.restoreCodeRealm();
        if (isAbrupt(r0=ifAbrupt(r0))) return r0;
        return NormalCompletion(r0);
    }
    exports.CompileAndRun = CompileAndRun;
});
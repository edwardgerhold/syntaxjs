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


    var realm, strict, tailCall;

    var compiler = require("asm-compiler");

    var tables = require("tables");
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromCode = tables.unaryOperatorFromCode;
    var propDefCodes = tables.propDefCodes;

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
    var pp;
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
    var STACKTOP;
    var STACKSIZE;


    /**
     * call frames (execution context)
     * @type {Array}
     */
    var frames =  new Array(1000);
    var fp = -1;
    var frame;

    function newFrame() {
        "use strict";
        frame = frames[++fp] = ExecutionContext(frames[fp-1]);
    }
    function oldFrame() {
        "use strict";
        frame = frames[fp--];
    }

    /**
     * global operandStack
     * @type {Array}
     */

    var operands = new Array(1000);
    var sp = -1;


    /**
     * global registers
     */

    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    var reg = Array(10);
    var regs = [[],[],[],[],[],[],[],[],[],[],[]];  // if you have no operand stack, you need to save the regs.
                                                    // here i have to deal with javascript objects
                                                    // for a while.

                                            // hmm, maybe, i should next try to rewrite the object on the heap
                                            // or just point outside to the pool, where the object will not be
                                            // gc´ed. Btw. it could be watched if it needs deletion there, i think
                                            // it was seen and forgotten. Delete from pool if it needs collection.

                                    // well, ObjectCreate() shall no longer return an object ordinary object
                                    // but a memory location with, e.g. first a const pool index, where the new
                                    // object exists, so i can smuggle the HEAP32 into the running system on the
                                    // AST. nobody will care for the ms. It´s anyways the slowest es6 available ;-)

    function pushReg(nr) {
        regs[nr].push(reg[nr]);
    }

    function popReg(nr) {
        reg[nr] = regs[nr].pop();
    }

    /**
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
    var VARDECL = 0x40;
    var IFEXPR = 0x60;
    var IFOP = 0x61;
    var WHILESTMT = 0x63;
    var WHILEBODY = 0x64;
    var DOWHILESTMT = 0x65;
    var DOWHILECOND = 0x66;
    var BLOCKSTMT = 0x70;
    var ASSIGNEXPR  = 0xA0;
    var ASSIGNMENTOPERATOR = 0xA1;
    var BINEXPR = 0xB0;
    var LOAD1   = 0xB1;
    var LOAD2   = 0xB2;
    var BINOP   = 0xB3;
    var CALLEXPR = 0xC0;
    var CALL = 0xC1;
    var NEWEXPR = 0xC2;
    var CONSTRUCT = 0xC3;
    var FUNCDECL = 0xC4;

    var ARRAYEXPR = 0xD1;
    var ARRAYINIT = 0xD2;
    var OBJECTEXPR = 0xD4;
    var PROPDEF = 0xD5;
    var OBJECTINIT = 0xD6;


    var RET = 0xD0;
    var ERROR = 0xFE;
    var HALT = 0xFF;


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
        var $0 = GetIdentifierReference(getLexEnv(), POOL[poolIndex], strict);
        operands[++sp] = $0;
    }
    function evaluateTrue() {
        var $0 = true;
        operands[++sp] = $0;
    }
    function evaluateFalse() {
        var $0 = false;
        operands[++sp] = $0;
    }
    function getFromPool(index) {
        var $0 = POOL[index];
        operands[++sp] = $0;
    }
    function getNumberFromPool(index) {
        var $0 = +POOL[index];
        operands[++sp] = $0;
    }
    function getStringFromPool(index) {
        var $0 = ""+POOL[index];
        operands[++sp] = $0;
    }
    function evaluateBinary(operator) {
        var $0,$1,$2;
        $2 = operands[sp--];
        $1 = operands[sp--];
        $1 = GetValue($1);
        $2 = GetValue($2);
        if (isAbrupt($1=ifAbrupt($1))) $0 = $1;
        else if (isAbrupt($2=ifAbrupt($2))) $0 = $2;
        else $0 = applyBinOp(operatorForCode[operator], $1, $2);
        operands[++sp] = $0;
    }
    function evaluateAssignment(operator) {
        var $0,$1,$2;
        $2 = operands[sp--];
        $1 = operands[sp--];
        if (isAbrupt($1=ifAbrupt($1))) $0 = $1;
        else if (isAbrupt($2=ifAbrupt($2))) $0 = $2;
        else $0 = applyAssignmentBinOp(operatorForCode[operator], $1, $2);
        operands[++sp] = $0;
    }
    function evaluateCall() {
        var $0,$1,$2;
        $2 = operands[sp--];
        $1 = operands[sp--];
        if (isAbrupt($1=ifAbrupt($1))) $0 = $1;
        else if (isAbrupt($2=ifAbrupt($2))) $0 = $2;
        else $0 = EvaluateCall($1, $2, tailCall);
        operands[++sp] = $0;
    }
    function evaluateConstruct() {
        var $0,$1,$2;
        $2 = operands[sp--];
        $1 = operands[sp--];
        if (isAbrupt($1=ifAbrupt($1))) $0 = $1;
        else if (isAbrupt($2=ifAbrupt($2))) $0 = $2;
        else $0 = OrdinaryConstruct($1, $2);
        operands[++sp] = $0;
    }
    function evaluateUnary(operator) {
        var $0;
        var $1 = operands[sp--];
        if (isAbrupt($1=ifAbrupt($1))) $0 = $1;
        else $0 = applyUnaryOp(unaryOperatorFromCode[operator], true, $1);
        operands[++sp] = $0;
    }
    function evaluatePostfix(operator) {
        var $0, $1;
        $1 = operands[sp--];
        if (isAbrupt(r1=ifAbrupt(r1))) $0 = $1;
        else $0 = applyUnaryOp(unaryOperatorFromCode[operator], false, $1);
        operands[++sp] = $0;
    }
    function evaluateString() {
        var $1 = operands[sp--];
        var $0 = String.fromCharCode.apply(undefined, $1);
        operands[++sp] = $0;
    }

    /**
     * stack - contains the ip to the next instruction
     * should grow each statement list, and shrink each instruction
     * the program should halt (or run nextTask) if the stack is empty.
     */
    var stackBuffer, stack, pc;
    function unknownInstruction(code) {
        var $0 = newTypeError(format("UNKNOWN_INSTRUCTION_S", code));
        operands[++sp] = $0;
    }
    function unknownError() {
        var $0 = newTypeError(format("UNKNOWN_ERROR"));
        operands[++sp] = $0;
    }

    
    function main(pc) {
        var $0, $1,$2,$3,$4;
        "use strict";

        /*
            the external functions will be as expensive as calling
            a WhiteSpace()||LineTerminator()||Comment()||Expression()||
         */

        do {
            var ip = stack[pc];
            var code = HEAP32[ip];

            switch (code) {
                case PRG:
                    strict = HEAP32[ip + 1];
                    $1 = ip + 3;                    // first
                    $3 = HEAP32[ip + 2];            // len
                    $2 = $1 + $3 - 1;               // last
                    for (; $2 >= $1; $2--) stack[pc++] = HEAP32[$2];
                    break;
            /**
             * code,len,elems
             */
                case BLOCKSTMT:
                case SEQEXPR:
                    $1 = ip + 2;
                    $3 = HEAP32[ip + 1];
                    $2 = $1 + $3 - 1;
                    for (; $2 >= $1; $2--) stack[pc++] = HEAP32[$2];
                    break;
                /*

                */
                case IFEXPR:
                    stack[pc++] = ip+2; // IFOP (compares r0 to true)
                    stack[pc++] = HEAP32[ip+1]; // eval test
                    break;
                case IFOP:
                    $0 = operands[sp--];
                    if (!!$0) stack[pc++] = HEAP32[ip+1];
                    else stack[pc++] = HEAP32[ip+2];
                    break;
                /**
                 * expression statement
                 * and parenthesized expression
                 */
                case EXPRSTMT:
                case PARENEXPR:
                    stack[pc++] = HEAP32[ip+1];
                    break;
                /*
                 * from the constant pool
                 */
                case STRCONST:
                    $1 = HEAP32[ip + 1]
                    getStringFromPool($1)
                    break;
                case NUMCONST:
                    $1 = HEAP32[ip + 1]
                    getNumberFromPool($1);
                    break;
                case IDCONST:
                    $1 = HEAP32[ip + 1]
                    getReference($1); // uses pool outside of the block
                    break;
                case TRUEBOOL:
                    evaluateTrue();
                    break;
                case FALSEBOOL:
                    evaluateFalse();
                    break;
            /**
             * str and num
             * with real alignment and encoding
             *
             */
                case STR:
                    $2 = HEAP32[ip+1];
                    $1 = HEAPU16.subarray(((ip+2)<<1), (((ip+2)<<1)+$2));
                    operands[++sp] = $1;
                    evaluateString();
                    break;
                case NUM:
                    $0 = HEAPF64[(ip+1)>>1];
                    operands[++sp] = $0; // may not be in here.
                    // $0 can be argument? is numeric
                    break;

            /**
             *  have the same order
              */
                case BINEXPR:
                case ASSIGNEXPR:
                case NEWEXPR:
                case CALLEXPR:
                    stack[pc++] = ip+3;         // call
                    stack[pc++] = HEAP32[ip+2]; // args
                    stack[pc++] = HEAP32[ip+1]; // callee
                    break;
                case BINOP:
                    $1 = HEAP32[ip+1]
                    evaluateBinary($1);
                    break;
                case ASSIGNMENTOPERATOR:
                    $1 = HEAP32[ip+1]
                    evaluateAssignment($1);
                    break;
                case CALL:
                    evaluateCall();
                    break;
                case CONSTRUCT:
                    evaluateConstruct();
                    break;
            /**
             * unary expression code blocks
             */
                case UNARYEXPR:
                    stack[pc++] = ip+2;         // prefix/postifx
                    stack[pc++] = HEAP32[ip+1]; // .arg
                    break;
                case UNARYOP:
                    $1 = HEAP32[ip+1]; // op
                    evaluateUnary($1);
                    break;
                case POSTFIXOP:
                    $1 = HEAP32[ip+1]; // op
                    evaluatePostfix($1);
                    break;
            /**
             * while
             */
                case WHILESTMT:
                    stack[pc++] = ip+2;         // 2. goto whilebody
                    stack[pc++] = HEAP32[ip+1]; // 1. condition
                    break;
                case WHILEBODY:
                    $0 = !!operands[sp--]; // may not be in here. operands is DYNAMIC TYPED.

                    if ($0) {
                        $1 = ip + 2;            // first
                        $3 = HEAP32[ip + 1];    // len
                        $2 = $1 + $3 - 1;       // last
                        stack[pc++] = $2+1;     // wexpr
                        for (; $2 >= $1; $2--) stack[pc++] = HEAP32[$2];
                    }
                    break;
                case DOWHILESTMT:
                        $1 = ip + 2;            // first
                        $3 = HEAP32[ip + 1];    // len
                        $2 = $1 + $3 - 1;       // last
                        stack[pc++] = $2+1;     // dowhilebody
                        for (; $2 >= $1; $2--) stack[pc++] = HEAP32[$2];
                    break;
                case DOWHILECOND:
                    $0 = !!operands[sp--]; // this may not happen in here

                    if ($0) {
                        stack[pc++] = HEAP32[ip+1];
                    }
                break;


                case ARRAYEXPR:
                case ARRAYINIT:


                case OBJECTEXPR:
                    break;
                case PROPDEF:
                    break;
                case OBJECTINIT:
                    break;
                case FUNCDECL:
                    break;
                case VARDECL:
                    break;

            /**
             * first
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
            pc = pc - 1;
        } while (pc >= 0);
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
        pp = unit.pp;
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
        r0 = undefined;
        stackBuffer = new ArrayBuffer(4096 * 16);
        stack = new Int32Array(stackBuffer);
        pc = 0;
        stack[pc] = STACKBASE; // ip to first bytecode at HEAP32[stack[0]]
        realm = CreateRealm(); // this costs starting the thing a lot of ms to create all objects.
        ecma.saveCodeRealm();
        ecma.setCodeRealm(realm);
        frame = frames[0] = ExecutionContext(null);
        main(pc);
        ecma.restoreCodeRealm();
        var $0 = operands[sp--];
        if (isAbrupt($0=ifAbrupt($0))) return $0;
        return NormalCompletion($0);
    }
    exports.CompileAndRun = CompileAndRun;
});
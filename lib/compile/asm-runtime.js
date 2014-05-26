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
    var detector = require("detector");
    var hasConsole = detector.hasConsole;

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
    var STACKTOP;
    var STACKSIZE;


    /**
     * call frames (execution context)
     * @type {Array}
     */
    var frames =  new Array(1000);
    var fp = -1;
    var frame;

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
    var STR = 0x10;     // A Uint16 encoded with length first (about 8 bytes longer than the string)
    var NUM = 0x11;       // A Float64 with alignment (about 12 bytes)
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
    var IFEXPR = 0x61;
    var IFOP = 0x62;
    var WHILESTMT = 0x63;
    var WHILEBODY = 0x64;
    var DOWHILESTMT = 0x65;
    var DOWHILECOND = 0x66;
    var BLOCKSTMT = 0x67;

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
    var ARGLIST = 0xC6;
    var ARRAYEXPR = 0xD1;
    var ARRAYINIT = 0xD2;
    var OBJECTEXPR = 0xD4;
    var PROPDEF = 0xD5;
    var OBJECTINIT = 0xD6;
    var RET = 0xD0;

    var DEBUGGER = 0xFA;
    var ERROR = 0xFE;
    var HALT = 0xFF;
    var EMPTY = -0x01;  // negative can not point into something


    var PUSH = 0xE0;
    var PUSH2 = 0xE1;
    var PUSH3 = 0xE2;

    var ADD = 0x70; // +
    var SUB = 0x71; // -
    var MUL = 0x72; // *
    var DIV = 0x73; // /
    var MOD = 0x74; // %
    var AND = 0x75; // &
    var OR  = 0x76; // |
    var NOT = 0x77; // !
    var L_OR = 0x78; // ||
    var L_AND = 0x79; // &&
    var GT = 0x7A; // >
    var LT = 0x7B  // <
    var GT_EQ = 0x7C; // >=
    var LT_EQ = 0x7D; // <=
    var EQ =    0x80;   // ==
    var STRICT_EQ = 0x81; // ===
    var NOT_EQ = 0x82;  // !=
    var STRICT_NOT_EQ = 0x83; // !==
    var SHL = 0x84;     // <<
    var SHR  = 0x85;    // >>
    var SSHR = 0x86;    // >>>

    var A_ADD = 0xE3; // +
    var A_SUB = 0xE4; // -
    var A_MUL = 0xE5; // *
    var A_DIV = 0xE6; // /
    var A_MOD = 0xE7; // %
    var A_SHR = 0x87;   // <<=
    var A_SHL = 0x88;   // >>=
    var A_SSHR = 0x89;  // >>>=

    var REST = 0x90; // rest and spread "..." ? own instruction is cool, or? if i don´t find a common replacement
    var SPREAD = 0x91;
    var ASSIGN = 0xA2;  // =

    var IFLT = 0x93;   // if (??? < ???)
    var IFGT = 0x94;   // >
    var IFCMP = 0x95;  // if ()
    var IFNOTCMP = 0x96;   // if(!)

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

    function getFromPool(index) {
        var $0 = POOL[index];
        operands[++sp] = $0;
    }

    /**
     * stack - contains the ip to the next instruction
     * should grow each statement list, and shrink each instruction
     * the program should halt (or run nextTask) if the stack is empty.
     *
     * This will be replaced by smarter calculations of offsets
     *
     */

    var stackBuffer, stack, pc;


    var states = [];    // save
    var MAINBODY = 2;
    var FUNCTIONCALL = 4;
    var GENERATOR = 8;
    var METHOD = 16;
    var CLASS = 32;
    var ARGLIST = 64;
    var ASSIGNMENT = 128;
    var OBJECTLITERAL = 256;
    var ARRAYLITERAL = 512;


    function main(pc) {
        "use strict";
        // local registers

        var $0,$1,$2,$3,$4,$5,$6,$7,$8,$9,$A,$B,$C,$D,$E,$F;

        //  var state = 0;

        do {
            var ip = stack[pc];
            var code = HEAP32[ip];
            switch (code) {
                case PUSH:
                    stack[pc++] = HEAP32[ip+1];
                    break;
                case PUSH2:
                    stack[pc++] = ip+2;
                    stack[pc++] = HEAP32[ip+1];
                    break;
                case PUSH3:
                    stack[pc++] = ip+3;
                    stack[pc++] = HEAP32[ip+2];
                    stack[pc++] = HEAP32[ip+1];
                    break;
                case PRG:
                    strict = HEAP32[ip + 1];
                    $1 = ip + 3;                    // first
                    $3 = HEAP32[ip + 2];            // len
                    $2 = $1 + $3 - 1;               // last
                    for (; $2 >= $1; $2--) stack[pc++] = HEAP32[$2];
                    break;

                case STR:

                    $3 = (ip+2) << 1;
                    $2 = HEAP32[ip+1];
                    $1 = HEAPU16.subarray($3, $3+$2);
                    $0 = String.fromCharCode.apply(undefined, $1);
                    operands[++sp] = $0;
                    break;
                case STRCONST:
                    $1 = HEAP32[ip + 1];
                    $0 = "" + POOL[$1];
                    operands[++sp] = $0;
                    break;
                case NUMCONST:
                    $1 = HEAP32[ip + 1];
                    $0 = +POOL[$1];
                    operands[++sp] = $0;
                    break;
                case IDCONST:
                    $1 = HEAP32[ip + 1];
                    $0 = GetIdentifierReference(getLexEnv(), POOL[$1], strict);
                    operands[++sp] = $0; // uses pool outside of the block
                    break;
                case TRUEBOOL:
                    operands[++sp] = true;  // JVM uses 0 and 1 integers for boolean
                    break;
                case FALSEBOOL:
                    operands[++sp] = false;
                    break;
                case NUM:
                    $0 = HEAPF64[(ip+1)>>1];
                    operands[++sp] = $0;
                    break;

                case ADD:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $4 + $2;
                    break;
                case SUB:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 - $4;
                    break;
                case MUL:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 * $4;
                    break;
                case DIV:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 / $4;
                    break;
                case MOD:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 % $4;
                    break;
                case AND:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 & $4;
                    break;
                case OR :
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 | $4;
                    break;
                case NOT:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($3=ifAbrupt($2))) {
                        operands[++sp] = $3;
                        return;
                    }
                    operands[++sp] = !$3;
                    break;
                case L_OR:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 || $4;
                    break;
                case L_AND:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 && $4;
                    break;
                case GT:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 > $4;
                    break;
                case LT:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 < $4;
                    break;
                case GT_EQ:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 >= $4;
                    break;
                case LT_EQ:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $1 + $2;
                    break;
                case EQ:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 == $4;
                    break;
                case STRICT_EQ:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 === $4;
                    break;
                case NOT_EQ:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 != $4;
                    break;
                case STRICT_NOT_EQ:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 !== $4;
                    break;
                case SHL:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 << $4;
                    break;
                case SHR:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $2 >> $4;
                    break;
                case SSHR:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    operands[++sp] = $1 >>> $2;
                    break;
                case A_SHR:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    // mit Assignment, heisst hier PutValue durchfuehren.
                    $5 = $2 >> $4;
                    $6 = PutValue($1, $5);
                    if (isAbrupt($6)) {
                        operands[++sp] = $6;
                        return;
                    }
                    operands[++sp] = $5;
                    break;
                case A_SHL:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    $5 = $2 << $4;
                    $6 = PutValue($1, $5);
                    if (isAbrupt($6)) {
                        operands[++sp] = $6;
                        return;
                    }
                    operands[++sp] = $5;
                    break;
                case A_SSHR:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    $5 = $2 >>> $4;

                    $6 = PutValue($1, $5);
                    if (isAbrupt($6)) {
                        operands[++sp] = $6;
                        return;
                    }
                    operands[++sp] = $5;
                    break;
                case ASSIGN:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    $5 = $4;
                    $6 = PutValue($1, $5);
                    if (isAbrupt($6)) {
                        operands[++sp] = $6;
                        return;
                    }
                    operands[++sp] = $5;
                    break;
                case A_ADD:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    $5 = $2 + $4;
                    $6 = PutValue($1, $5);
                    if (isAbrupt($6)) {
                        operands[++sp] = $6;
                        return;
                    }
                    operands[++sp] = $5;
                    break;
                case A_SUB:
                    $1 = operands[sp--];
                    $2 = GetValue($1);
                    if (isAbrupt($2=ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    $3 = operands[sp--];
                    $4 = GetValue($3);
                    if (isAbrupt($4=ifAbrupt($4))) {
                        operands[++sp] = $4;
                        return;
                    }
                    $5 = $2 - $4;
                    $6 = PutValue($1, $5);
                    if (isAbrupt($6)) {
                        operands[++sp] = $6;
                        return;
                    }
                    operands[++sp] = $5;
                    break;
                case IFLT:
                    $1 = operands[sp--];
                    $2 = operands[sp--];

                    break;
                case IFGT:
                    break;
                case IFCMP:
                    break;
                case IFNOTCMP:
                    break;
                case BLOCKSTMT:
                case SEQEXPR:
                    $1 = ip + 2;
                    $3 = HEAP32[ip + 1];
                    $2 = $1 + $3 - 1;
                    for (; $2 >= $1; $2--) stack[pc++] = HEAP32[$2];
                    break;
                case IFEXPR:
                    stack[pc++] = ip+2; // IFOP (compares r0 to true)
                    stack[pc++] = HEAP32[ip+1]; // eval test
                    break;
                case IFOP:
                    $0 = operands[sp--];
                    if (!!$0) stack[pc++] = HEAP32[ip+1];
                    else stack[pc++] = HEAP32[ip+2];
                    break;
                case EXPRSTMT:
                case PARENEXPR:
                    stack[pc++] = HEAP32[ip+1];
                    break;
                case BINEXPR:
                case ASSIGNEXPR:
                case NEWEXPR:
                case CALLEXPR:
                    stack[pc++] = ip+3;         // call
                    stack[pc++] = HEAP32[ip+2]; // ^args
                    stack[pc++] = HEAP32[ip+1]; // callee
                    break;
                case ARGLIST:
                    $1 = HEAP32[ptr+1]
                    operands[++sp] = POOL[$1];
                    break;
                case CALL:
                    // tailCall = HEAP32[ptr+1];
                    $1 = operands[sp--]; // callee
                    if (isAbrupt($1 = ifAbrupt($1))) {
                        operands[++sp] = $1;
                        return;
                    }
                    $2 = operands[sp--]; // args;
                    if (isAbrupt($2 = ifAbrupt($2))) {
                        operands[++sp] = $2;
                        return;
                    }
                    operands[++sp] = EvaluateCall($1, $2, tailCall);
                    break;

                case CONSTRUCT:
                    $2 = operands[sp--];
                    $1 = operands[sp--];
                    if (isAbrupt($1 = ifAbrupt($1))) $0 = $1;
                    else if (isAbrupt($2 = ifAbrupt($2))) $0 = $2;
                    else $0 = OrdinaryConstruct($1, $2);
                    operands[++sp] = $0;
                    break;

                case UNARYEXPR:
                    stack[pc++] = ip+2;         // prefix/postifx
                    stack[pc++] = HEAP32[ip+1]; // .arg
                    break;
                case UNARYOP:
                    $1 = HEAP32[ip+1]; // op
                    var $2 = operands[sp--];
                    $3 = GetValue($3);
                    if (isAbrupt($2 = ifAbrupt($2))) $0 = $2;
                    else $0 = applyUnaryOp(unaryOperatorFromCode[$1], true, $3);
                    operands[++sp] = $0;
                    break;
                case POSTFIXOP:
                    $1 = HEAP32[ip+1]; // op
                    $2 = operands[sp--];
                    $3 = GetValue($2)
                    if (isAbrupt(r2 = ifAbrupt(r2))) $0 = $2;
                    else $0 = applyUnaryOp(unaryOperatorFromCode[$1], false, $3);
                    operands[++sp] = $0;
                    break;

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

                case DEBUGGER:
                    ecma.debuggerOutput();
                    break;


                case HALT:
                    return;

                case ERROR:
                    operands[++sp] = newTypeError(format("UNKNOWN_ERROR"));
                    return;

                default:
                    operands[++sp] = newTypeError(format("UNKNOWN_INSTRUCTION_S", code));
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
    }

    function init() {   // callstack up
        stackBuffer = new ArrayBuffer(4096 * 16);
        stack = new Int32Array(stackBuffer);
        ++fp;
        frame = frames[fp] = ExecutionContext(frames[fp-1]);
        frame.stackBuffer = stackBuffer;
        frame.stack = stack;
        frame.pc = pc;
    }

    function restore() {    // callstack down
        frame = frames[--fp];
        if (frame) {
            stack = frame.stack;
            stackBuffer = frame.stackBuffer;
            pc = frame.pc;
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
        var $0 = operands[sp--];
        if (isAbrupt($0=ifAbrupt($0))) return $0;
        return NormalCompletion($0);
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
        var $0 = operands[sp--];
        if (isAbrupt($0=ifAbrupt($0))) return $0;
        return NormalCompletion($0);
    }
    exports.CompileAndRun = CompileAndRun;
    exports.RunUnit = RunUnit;

});
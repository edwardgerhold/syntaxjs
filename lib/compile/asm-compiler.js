/**
 * this compiler deconstructs the ast into INT Code.
 * I hope to refactor it into BYTECODE.
 * (much) later it should be valid numeric code to be run inside an asm js module.
 * the STACKTOP is count in BYTES.
 * the pointers are stored as STACKTOP >> 2 (means div by 4) for INTs
 *
 * I notice that BINEXPR, ASSIGNEXPR, CALLEXPR,
 * which take just two arguments can loose their heading code
 * and just store ptr to left, bytecode for load result into r1, ptr to right, bytecode to load result into r2, bytecode for operation of r1, r2
 * currently i emit another header int
 *  (the instruction set can be refactored into regular assembly, i just got behind)
 *
 * i see, the "node.type" gets lost when creating bytecode.
 * repeating patterns just make some loads/register transfers necessary
 * which can be done with the same code
 *
 * i switched from registers back to stack machine and i am
 * unsure which way to go, registers anyway make a pushreg and popreg
 * necessary, and the operandstack has the same problem. otherwise
 * sometimes i don´t need to save the registers ;)
 * i don´t know exactly, what the outcome will be, but i am sure, that
 * overworking the code will result in a typical bytecode with load,
 * store, add, branch, ifeq, iflt, ifgt or what their names are and i
 * think i´ll soon get it to design these codes.
 *
 */

define("asm-compiler", function (require, exports) {

    "use strict";
    var format = require("i18n").format;

    var DEFAULT_SIZE = 2*1024*1024; // 2 Meg of RAM (string, id, num) should be big enough to run this program
    var POOL, pp, poolDupeMap;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var STACKBASE, STACKSIZE, STACKTOP;
    var FLAGSET = flagSet(), CODESET = codeSet();


    var RETADDR = []; // save return addresses for the compiler
                      // LIST BLOCKS GEN BACKWARS (LAST COMPILE FIRST, ITS COMPILE, NOT CALC, GET GOTO AT RETURN PTR)

    /**
     * first bytecodes
     * currently intcodes
     *
     * the compiler and the interpreter will go through a few refactorings
     * i see instructions/annotations which are not needed anymore and could be replaced
     *
     *
     * THEY ARE NO LONGER NEEDED
     *
     * EXCEPT FOR COMPILATION OF THE ALSO NO LONGER NEEDED COMPILER FUNCTIONS
     *
     * I GOT THE NEW INSTRUCTION SET WITH A MEDIUM KIND OF DEFINE FUNCTION BELOW
     *
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

    var JMP;
    var JEQ;
    var JNE;
    var JF;
    var JT;
    var JB;
    var JA;
    var JEB;
    var JEA;

    var NEWOBJECT;
    var NEWARRAY;
    var INVOKE;

    /**
     * The NEW Instruction Set
     *
     * working it out over time now
     *
     * This Bytecode may contain both,
     * instructions and special code (instructions)
     * used by the instructions
     *
     * @type {null}
     */

    defineByteCode(0x00, "END", "");
    defineByteCode(0x01, "SYSCALL", "");
    defineByteCode(0x20, "STRCONST", "");
    defineByteCode(0x21, "NUMCONST", "");
    defineByteCode(0x22, "IDREFCONST", "");
    defineByteCode(0x60, "ADD", "add");
    defineByteCode(0x61, "ADDL", "add and assign");
    defineByteCode(0x62, "SUB", "subtract");
    defineByteCode(0x63, "SUBL", "subtract and assign");
    defineByteCode(0x64, "MUL", "multiply");
    defineByteCode(0x65, "MULL", "multiply and assign");
    defineByteCode(0x66, "DIV", "");
    defineByteCode(0x67, "DIVL", "");
    defineByteCode(0x68, "MOD", "");
    defineByteCode(0x69, "MODL", "");
    defineByteCode(0x70, "SHL", "");
    defineByteCode(0x71, "SHLL", "");
    defineByteCode(0x72, "SHR", "");
    defineByteCode(0x73, "SHRL", "");
    defineByteCode(0x74, "SSHR", "");
    defineByteCode(0x75, "SSHRL", "");

    defineByteCode(0x76, "AND", "");
    defineByteCode(0x77, "OR", "");
    defineByteCode(0x78, "LAND", "");
    defineByteCode(0x79, "LOR", "");

    // Data Structures
    defineByteCode(0xB00, "LIST", "Code telling that this HEAP/STACK Area is to be read as list");       // [0] = LIST, [1] = NEXT LISTNODE;
    defineByteCode(0xB01, "LISTNODE", "ListNode with a pointer to next and it´s item"); // [0] LISTNODE [1] NEXT [2..DATA]
    defineByteCode(0xB02, "DLISTNODE", "ListNode with a pointer to next, prev and it´s item"); // [0] LISTNODE [1] NEXT [2] PREV [3.. DATA]
    defineByteCode(0xB03, "LISTLISTNODE", "ListNode with a pointer to next, prev, list and it´s item"); // [0] LISTNODE [1] NEXT [2] PREV [3] LIST [4.. DATA]

    defineByteCode(0xB10, "HASH", "");
    defineByteCode(0xB11, "HASHKEY", "");
    defineByteCode(0xB12, "HASHVALUE", "");
    defineByteCode(0xB13, "HASHFUNC", "Pointer to Hashfunction in Function Table");

    defineByteCode(0xB20, "ARRAY", "Treat the following bytes as array structure");     // [0] = ARRAY [1] = LEN [2...2+LEN] ITEMS
    
    defineByteCode(0xB25, "INT32ARRAY", ""); // access HEAP like array of these, could speed up typed arrays in the vm :-)
    defineByteCode(0xB26, "FLOAT64ARRAY", "");

    defineByteCode(0xFF, "HALT", "Stop script evaluation now and return whatever it is.");

    defineByteCode(0x100, "NORMALCOMP", "Normal Completion");
    defineByteCode(0x101, "THROWCOMP", "Throw Completion");
    defineByteCode(0x102, "BREAKCOMP", "Break Completion");
    defineByteCode(0x103, "CONTINUECOMP", "Continue Completion");
    defineByteCode(0x104, "RETURNCOMP", "Return Completion");

    defineByteCode(0x200, "NEWOBJECT", "Shorty to create a new Object, hidden Class of PropNames from Parsing is in the Constant Pool");
    defineByteCode(0x201, "NEWARRAY", "Shorty to create a new Array");
    defineByteCode(0x202, "NEWSYMBOL", "Call Symbol()");
    defineByteCode(0x203, "NEWNUMBER", "Call new Number()");
    defineByteCode(0x204, "NEWSTRING", "");
    defineByteCode(0x204, "NEWARRAYBUFFER", "");
    defineByteCode(0x206, "NEWDATAVIEW", "");
    defineByteCode(0x207, "NEWINT8ARRAY", "");
    defineByteCode(0x208, "NEWINT16ARRAY", "");
    defineByteCode(0x209, "NEWINT32ARRAY", "");
    defineByteCode(0x210, "NEWUINT8ARRAY", "");
    defineByteCode(0x211, "NEWUINT8CLAMPEDARRAY", "");
    defineByteCode(0x212, "NEWUINT16ARRAY", "");
    defineByteCode(0x213, "NEWUINT32ARRAY", "");
    defineByteCode(0x214, "NEWFLOAT32ARRAY", "");
    defineByteCode(0x215, "NEWFLOAT64ARRAY", "");
    defineByteCode(0x216, "NEWFUNCTION", "");
    defineByteCode(0x217, "NEWGENERATORFUNCTION", "");

    defineByteCode(0x300, "GETSLOT", "lookup internal object slot");
    defineByteCode(0x301, "SETSLOT", "");
    defineByteCode(0x302, "HASSLOT", "");

    defineByteCode(0x501, "CALL", "");
    defineByteCode(0x502, "CONSTRUCT", "");
    defineByteCode(0x503, "RET", "");
    defineByteCode(0x504, "INVOKE", "");
    defineByteCode(0x505, "FPROTOCALL", "");
    defineByteCode(0x506, "FPROTOAPPLY", "");
    defineByteCode(0x507, "SUPERCALL", "");

    defineByteCode(0x600, "JMP", "");
    defineByteCode(0x601, "JEQ", "if op1 === op2 goto op3");
    defineByteCode(0x602, "JNEQ", "");
    defineByteCode(0x603, "JLT", "");
    defineByteCode(0x604, "JLTEQ", "");
    defineByteCode(0x605, "JGT", "");
    defineByteCode(0x606, "JGTEQ", "");

    defineByteCode(0x700, "GETPROPERTY", "");
    defineByteCode(0x701, "GET", "");
    defineByteCode(0x702, "SET", "");
    defineByteCode(0x703, "DEFINEOWNPROPERTY", "");
    defineByteCode(0x704, "DELETEPROPERTY", "");
    defineByteCode(0x705, "DEFINEOWNPROPERTYORTHROW", "");
    defineByteCode(0x706, "DELETEPROPERTYORTHROW", "");

    defineByteCode(0x800, "GETVALUE", "");
    defineByteCode(0x801, "SETVALUE", "");
    defineByteCode(0x802, "ISUNRESOLVABLE", "");
    defineByteCode(0x803, "ISPROPERTYREF", "");

    defineByteCode(0x900, "ITERATOR", "");
    defineByteCode(0x901, "ITERATOR1", "");
    defineByteCode(0x902, "ITERATOR2", "");
    defineByteCode(0x903, "CREATELISTITERATOR", "");
    defineByteCode(0x920, "CREATEARRAYITERATOR", "");
    defineByteCode(0x921, "CREATELOADERITERATOR", "");
    defineByteCode(0x922, "CREATESTRINGITERATOR", "");
    defineByteCode(0x923, "CREATEMAPITERATOR", "");
    defineByteCode(0x924, "CREATESETITERATOR", "");

    defineByteCode(0xA00, "ARRAYFROMLIST", "");
    defineByteCode(0xA01, "LISTFROMARRAY", "");

    defineByteCode(0xE00, "EXPRESSION", "");


    function codeSet() {
        return {
            BYTECODE: Object.create(null),
            WORDS: Object.create(null),
            DESC: Object.create(null)
        };
    }


    function defineByteCode(num, name, desc) {
        if (typeof num != "number" || typeof name != "string" || (desc !== undefined && typeof desc != "string")) {
            throw new TypeError("invalid code definition. defineByteCode(0x01, 'ERROR', 'Code 0x01 is for the Error Example when wrong arguments are given to defineByteCode'");
        }
        CODESET.BYTECODE[name] = num;
        CODESET.WORDS[num] = ""+name;
        CODESET.DESC[name] = CODESET.DESC[num] = desc;
    }


    function flagSet () {
        return {
            FLAGS: Object.create(null),
            DESC: Object.create(null)
        };
    }

    function defineBitFlags(name, bitvalue, description) {
        if (typeof name != "string" || typeof bitvalue != "number" ||
            (description !== undefined && typeof description != "string")) {
            throw new TypeError("invalid flag definition. defineBitflags('flag_error', 0, 'for the example if the flag register is zero then an error occured.'");
        }
        FLAGSET.FLAGS[name] = bitvalue;
        FLAGSET.DESC[name] = description;
    }

    defineBitFlags("P_STRICT", 1, "");
    defineBitFlags("P_METHOD", 2, "");
    defineBitFlags("P_GENERATOR", 4, "");
    defineBitFlags("P_GETTER", 8, "");
    defineBitFlags("P_SETTER", 16, "");
    defineBitFlags("P_STATIC_METHOD", 32, "");            // static method() in class
    defineBitFlags("P_PROTOTYPE_METHOD", 64, "");         // method() in class
    defineBitFlags("P_EXPRESSION", 128, "");              // [computed]

    var FUNCTIONFLAGS = Object.create(null);
    defineBitFlags("F_STRICT", 1, "");
    defineBitFlags("F_METHOD", 2, "");
    defineBitFlags("F_EXPRESSION", 4, "");
    defineBitFlags("F_GENERATOR", 8, "");
    defineBitFlags("F_THISMODE_LEXICAL", 16, "");
    defineBitFlags("F_ARROW", 16, "");
    defineBitFlags("F_THISMODE_GLOBAL", 128, "");
    defineBitFlags("F_BOUNDFUNCTION", 256, "");

    var REFERENCE_FLAGS = Object.create(null);
    defineBitFlags("R_STRICT", 1, "");
    defineBitFlags("R_SUPER", 2, "");
    defineBitFlags("R_UNDEFINED", 4, "");


/**
 *
 *  Better idea
 *
 *
 *  refactor back into
 *
 *  one FLAGS, one desc
 *
 *  and unique longer BITFLAG_NAMES
 *
 *
 *
 * @type {exports}
 */


    var tables = require("tables");
    var propDefKinds = tables.propDefKinds;
    var propDefCodes = tables.propDefCodes;
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromString = tables.unaryOperatorFromString;

    /**
     * initialize the compiler for a new compilation
     * after compilation use exports.get() to get the data
     *
     * @param stackSize
     */
    function init(stackSize, poolSize) {
        POOL = new Array(poolSize||10000);
        pp = -1;
        poolDupeMap = Object.create(null); // dupe check for identifiers, etc.
        MEMORY = new ArrayBuffer(stackSize||1024*1024);
        HEAP8 = new Int8Array(MEMORY);
        HEAPU8 = new Uint8Array(MEMORY);
        HEAP16 = new Int16Array(MEMORY);
        HEAPU16 = new Uint16Array(MEMORY);
        HEAP32 = new Int32Array(MEMORY);
        HEAPU32 = new Uint32Array(MEMORY);
        HEAPF32 = new Float32Array(MEMORY);
        HEAPF64 = new Float64Array(MEMORY);
        STACKBASE = 0;
        STACKSIZE = stackSize;
        STACKTOP = 0;
    }
    /**
     * get returns the compiled data, the heap, the constant pool, the stacksize and stacktop
     * @returns {{POOL: *, HEAP32: *, STACKSIZE: *, STACKTOP: *}}
     *
     */
    function get() {
        return {
            POOL: POOL,
            pp: pp,
            poolDupeMap: poolDupeMap,
            MEMORY: MEMORY,
            HEAP8: HEAP8,
            HEAPU8: HEAPU8,
            HEAP16: HEAP16,
            HEAPU16: HEAPU16,
            HEAPU32: HEAPU32,
            HEAP32: HEAP32,
            HEAPF32: HEAPF32,
            HEAPF64: HEAPF64,
            STACKBASE: STACKBASE,
            STACKSIZE: STACKSIZE,
            STACKTOP: STACKTOP,
            FLAGSET: FLAGSET,
            CODESET: CODESET
        };
    }
    /**
     * add a value to the constant pool
     * the index of the value in the array is returned
     * i don´t check for dupes, so two stringliterals with
     * the same value get added twice
     *
     * This is something external, the integer for the poolIndex
     * can be passed around, the rest must happen outside of the
     * fast interpreter block (that will still save us some ms)
     *
     * @param value
     * @returns {number}
     */
    function addToConstantPool(value) {
        var poolIndex;
        if (poolIndex=poolDupeMap[value]) return poolIndex;
        POOL[++pp] = value;
        return pp;
    }
    /**
     * @param node
     * @returns {*}
     */
    function identifier (node) {
        var poolIndex = addToConstantPool(node.name);
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = IDCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        //console.log("compiled identifier to " + ptr);
        return ptr;
    }
    /**
     * @param node
     * @returns {*}
     */
    function numericLiteralPool (node) {
        var poolIndex = addToConstantPool(node.value);
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = NUMCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        //console.log("compiled numericLiteral to " + ptr);
        return ptr;
    }

    /**
     * this stores a number as float directly where it appears
     * the Pool version pushes the value into an array and is not
     * what i would prefer
     *
     * @param node
     * @returns {*}
     */
    function numericLiteral(node) {
        var value = node.computed;
        if (value === undefined) value = +node.value;
        var align;
        align = STACKTOP % 8;
        if (align === 0) STACKTOP += 4;
        var ptr = STACKTOP >> 2;
        STACKTOP+=12;
        HEAP32[ptr] = NUM;
        HEAPF64[(ptr+1)>>1] = value;
        //console.log("compiled numlit to " + ptr);
        return ptr;
    }

    function stringLiteral(node) {
        var str = node.computed;
        if (str === undefined) str = str.slice(1, str.length-2);
        var ptr = STACKTOP >> 2;
        // 1. encode into code points, that i can find pairs.
        var codePoints = [];
        for (var i = 0, j = str.length; i < j; i++) {
            // perform codeunit check
            var s = str[i];
            var cu = s.charCodeAt(0);
            // if (between 0xD800 && ... i forgot it ten times)
            codePoints.push(cu);
            if (cu.length === 2) codePoints.push(s.charCodeAt(1));
        }
        // and then write them into the heap
        var len = codePoints.length;
        // because str.length && codePoints.length could differ
        STACKTOP += (8 + Math.ceil(len>>1));
        HEAP32[ptr] = STR;
        HEAP32[ptr+1] = len;
        var ptr2 = (ptr+2)<<1;
        for (var i = 0; i < len; i++) HEAPU16[ptr2+i] = codePoints[i];
        //console.log("compiled str to " + ptr);
        return ptr;
    }

    /**
     * stringLiteral
     * 1. obtain ptr from STACKTOP;
     * 2. add node.value to the constant pool and get poolIndex
     * 3. write poolIndex into the HEAP
     * 4. increase STACKTOP
     * @param node
     */
    function stringLiteralPool (node) {
        addToConstantPool(node.computed);
        var poolIndex = pp;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = STRCONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        //console.log("compiled stringLiteral to " + ptr);
        return ptr;
    }
    /**
     * @param node
     * @returns {*}
     */
    function booleanLiteral(node) {
        var ptr = STACKTOP >> 2;
        if (node.value === "true") HEAP32[ptr] = TRUEBOOL;
        else HEAP32[ptr] = FALSEBOOL;
        STACKTOP += 4;
        //console.log("compiled boolean to " + ptr);
        return ptr;
    }
    /**
     * I really compile the node.expression
     * into one slot.
     * @param node
     * @returns {number}
     */

    /*


        best is to read a little x86 assembly and jvm bytecode next
        to get a better instruction set together. i don´t want to take
        it, it should become developed out of the existing. but it´s better
        to take some real world bytecode names, than redefining nodenames
        so i better learn a bit more about
        (and i am glad that i am later able to write assembly and jvm bytecode, ehe)

     */


    function expressionStatement(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = EXPRSTMT;
        HEAP32[ptr+1] = compile(node.expression);
        //console.log("compiled expr stmt to " + ptr);
        return ptr;
    }

    function parenthesizedExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = PARENEXPR;
        HEAP32[ptr+1] = compile(node.expression);
        //console.log("compiled paren expr to " + ptr);
        return ptr;
    }

    /**
     * @param node
     * @returns {*}
     */
    function sequenceExpression(node) {
        var ptr = STACKTOP >> 2;
        var len = node.sequence.length
        HEAP32[ptr] = SEQEXPR;
        HEAP32[ptr+1] = len|0;
        STACKTOP += 8 + (len << 2);
        for (var i = 0; i < len; i++) HEAP32[ptr+2+i] = compile(node.sequence[i]);
        //console.log("compiled seq expr stmt to " + ptr);
        return ptr;
    }

    /**
     * @param node
     */
    function assignmentExpression1(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 20;
        HEAP32[ptr] = ASSIGNEXPR;
        HEAP32[ptr+1] = compile(node.left);
        HEAP32[ptr+2] = compile(node.right);
        HEAP32[ptr+3] = ASSIGNMENTOPERATOR;
        HEAP32[ptr+4] = codeForOperator[node.operator];
        //console.log("compiled assign expr to " + ptr);
        return ptr;
    }

    function assignmentExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 16;
        HEAP32[ptr] = PUSH3;
        HEAP32[ptr+1] = compile(node.right);
        HEAP32[ptr+2] = compile(node.left);
        var code;
        switch (node.operator) {
            case "=": code = ASSIGN; break;
            case "+=": code = A_ADD; break;
            case "-=": code = A_SUB; break;
            case "*=": code = A_MUL; break;
            case "/=": code = A_DIV; break;
            case "%=": code = A_MOD; break;
            case "<<=": code = A_SHL; break;
            case ">>=": code = A_SHR; break;
            case ">>>=": code = A_SSHR; break;
        }
        HEAP32[ptr+3] = code;

        return ptr;
    }

    function unaryExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 12;
        if (node.prefix)
            HEAP32[ptr] = UNARYEXPR;
        HEAP32[ptr+1] = compile(node.argument);
        if (node.prefix) HEAP32[ptr+2] = UNARYOP;
        else HEAP32[ptr+2] = POSTFIXOP;
        HEAP32[ptr+2] = unaryOperatorFromString[node.operator];
        //console.log("compiled unary expr to " + ptr);
        return ptr;
    }
    /**
     *
     */

    function binaryExpression1(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 20;
        HEAP32[ptr] = BINEXPR;
        HEAP32[ptr+1] = compile(node.right);
        HEAP32[ptr+2] = compile(node.left);
            HEAP32[ptr+3] = BINOP;
                HEAP32[ptr+4] = codeForOperator[node.operator];
                //console.log("compiled binary expr to " + ptr);
                return ptr;
        }


    function binaryExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 16;
        HEAP32[ptr] = PUSH3;
        HEAP32[ptr+1] = compile(node.right);
        HEAP32[ptr+2] = compile(node.left);
        var code;
        switch (node.operator) {
            case "==": code = EQ; break;
            case "===": code = STRICT_EQ; break;
            case "!=": code = NOT_EQ; break;
            case "!==": code = STRICT_NOT_EQ; break;
            case "+": code = ADD; break;
            case "-": code = SUB; break;
            case "*": code = MUL; break;
            case "/": code = DIV; break;
            case "%": code = MOD; break;
            case "<<": code = SHL; break;
            case ">>": code = SHR; break;
            case "|": code = OR; break;
            case "&": code = AND; break;
            case "&&": code = L_AND; break;
            case "||": code = L_OR; break;
            case "<": code = LT; break;
            case ">": code = GT; break;
            case ">=": code = GT_EQ; break;
            case "<=": code = LT_EQ; break;
        }
        HEAP32[ptr+3] = code; // push3 loads the stack with the next 3 positions
        return ptr;
    }
    /**
     *
     * @param node
     * @returns {*}
     */

    function callExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 16;
        HEAP32[ptr] = PUSH3;
        HEAP32[ptr+1] = argumentList(node.arguments);
        HEAP32[ptr+2] = compile(node.callee);
        HEAP32[ptr+3] = CALL;
        //console.log("compiled call expr to " + ptr);
        return ptr;
    }
    /**
     *
     * @param node
     */
    function newExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 16;
        HEAP32[ptr] = NEWEXPR;
        HEAP32[ptr+1] = compile(node.callee);
        HEAP32[ptr+2] = argumentList(node.arguments);
        HEAP32[ptr+3] = CONSTRUCT;
        //console.log("compiled new expr to " + ptr);
        return ptr;
    }

    /*
    function argumentList(list) {
        var len = list.length;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = ARGLIST;
        HEAP32[ptr+1] = len|0;
        STACKTOP += 8 + (len << 2);
        for (var i = 0; i < len; i++) {
            HEAP32[ptr+i] = compile(list[i]);
        }
        //console.log("compiled arguments List with length of "+len+ " to "+ ptr)
        return ptr;
    }
    */

    function argumentList(list) {
        var poolIndex = ++pp;
        POOL[pp] = list;
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = ARGLIST;
        HEAP32[ptr+1] = poolIndex;
        return ptr;
    }


    function formalParameters(list) {
        var poolIndex = ++pp;
        POOL[pp] = list;
        var ptr = STACKTOP >> 2;
        STACKTOP += 4;
        HEAP32[ptr] = poolIndex;
        return ptr;
    }

    function functionDeclaration(node) {
        POOL[++pp] = node;
        var poolIndex = pp;
        var ptr = STACKTOP;
        STACKTOP += 8;
        HEAP32[ptr] = FUNCDECL;
        HEAP32[ptr+1] = poolIndex;
        //console.log("compiled fdecl to " + ptr);
        return ptr;
    }

    function variableDeclaration(node) {
        POOL[++pp] = node;
        var poolIndex = pp;
        var ptr = STACKTOP;
        STACKTOP += 8;
        HEAP32[ptr] = VARDECL;
        HEAP32[ptr+1] = poolIndex;
        //console.log("compiled var decl to " + ptr);
        return ptr;
    }

    function propertyDefinition(node) {
        var ptr = STACKTOP >> 2;
        POOL[++pp] = node.key;
        var keyIndex = pp;
        STACKTOP += 16;
        HEAP32[ptr] = PROPDEF;
        HEAP32[ptr+1] = propDefKinds[node.kind];
        HEAP32[ptr+2] = keyIndex;
        HEAP32[ptr+3] = compile(node.value);
        //console.log("compiled prop def to " + ptr);
        return ptr;
    }

    function objectExpression(node) {
        var ptr = STACKTOP >> 2;
        var len = node.elements.length;
        STACKTOP += 8 + (len<<2);
        HEAP32[ptr] = OBJECTEXPR;
        HEAP32[ptr+1] = len;
        for (var i = 0; i < len; i++) HEAP32[ptr+1+i] = compile(node.properties[i]);
        //console.log("compiled object expr to " + ptr);
        return ptr;
    }

    function arrayExpression(node) {
        var ptr = STACKTOP >> 2;
        var len = node.elements.length;
        STACKTOP += 8 + (len<<2);
        HEAP32[ptr] = ARRAYEXPR;
        HEAP32[ptr+1] = len;
        for (var i = 0; i < len; i++) HEAP32[ptr+1+i] = compile(node.elements[i]);
        //console.log("compiled array expr to " + ptr);
        return ptr;
    }

    function elision(ast) {
        var ptr = STACKTOP >> 2;
        var width = node.width;
        STACKTOP+=8;
        HEAP32[ptr] = ELISION;
        HEAP32[ptr+1] = width;
        //console.log("compiled elision to " + ptr);
        return ptr;
    }

    function returnStatement(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 8;
        HEAP32[ptr] = RET;
        if (node.argument)
            HEAP32[ptr+1] = compile(node.argument);
        else HEAP32[ptr+1] = EMPTY;
        //console.log("compiled return to " + ptr);
        return ptr;
    }

    function ifStatement(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 20;
        HEAP32[ptr] = IFEXPR;
        HEAP32[ptr+1] = compile(node.test);
        HEAP32[ptr+2] = IFOP;
        HEAP32[ptr+3] = compile(node.consequent);
        HEAP32[ptr+4] = compile(node.alternate);
        //console.log("compiled new expr to " + ptr);
        return ptr;
    }

    /**
     * the block
     * has a code
     * a length
     * and slots with ptrs to each stmt
     * @param node
     * @returns {*}
     */

    function blockStatement(node) {
        var len = node.body.length;
        var body = node.body;
        var ptr = STACKTOP >> 2;
        STACKTOP += 8 + (len << 2);
        HEAP32[ptr] = BLOCKSTMT;
        HEAP32[ptr+1] = len|0;
        for (var i = 0, j = len; i < j; i++) HEAP32[ptr+2+i] = compile(body[i]);
        //console.log("compiled block to " + ptr);
        return ptr;
    }

    function whileStatement(node) {
        var len = node.body.length;
        var body = node.body;
        var ptr = STACKTOP >> 2;
        STACKTOP += 20+(len<<2);
        HEAP32[ptr] = WHILESTMT;
        HEAP32[ptr+1] = compile(node.test);
        HEAP32[ptr+2] = WHILEBODY;
        HEAP32[ptr+3] = len;
        for (var i = 0, j = len; i < j; i++) HEAP32[ptr+4+i] = compile(body[i]);
        HEAP32[ptr+4+len] = ptr;
        //console.log("compiled while to " + ptr);
        return ptr;
    }

    function doWhileStatement(node) {
        var len = node.body.length;
        var body = node.body;
        var ptr = STACKTOP >> 2;
        STACKTOP += 20+(len<<2);

        HEAP32[ptr] = DOWHILESTMT;
        HEAP32[ptr+1] = len;
        for (var i = 0, j = len; i < j; i++) HEAP32[ptr+2+i] = compile(body[i]);
        HEAP32[ptr+2+len] = compile(node.test);

        var ptr2 = ptr+2+len;
        HEAP32[ptr2] = DOWHILECOND;
        HEAP32[ptr2+1] = ptr;
        //console.log("compiled doWhile to " + ptr);
        return ptr;
    }


    /**
     *
     * @param node
     * @returns {*}
     */
    function program(node) {
        var body = node.body;
        var strict = !!node.strict;
        var len = body.length;
        var ptr = STACKTOP >> 2; // /4
        HEAP32[ptr] = PRG;          // "Program"
        HEAP32[ptr+1] = strict|0;   // node.strict
        HEAP32[ptr+2] = len|0;        // body.length
        STACKTOP += 12;             //
        STACKTOP += (len << 2);   // *4
        for (var i = 0, j = len; i < j; i++) {
            HEAP32[ptr+3+i] = compile(body[i]);// fill array with starting offsets
        }
        //console.log("compiled prg expr to " + ptr);
        return ptr;
    }

    /**
     *
     * @param ast
     * @returns {number}
     */


    function forStatement (node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function forInOfStatement (node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function switchStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function switchCase(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function defaultCase(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function tryStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function catchClause(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function finally_(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function objectPattern(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function arrayPattern(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function moduleDeclaration(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    function importStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function exportStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function throwStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function breakStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function continueStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function debuggerStatement(node) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = DEBUGGER;
        return ptr;
    }


    function compile(ast) {
        if (!ast) return -1;
        switch (ast.type) {
            case "StringLiteral":           return stringLiteral(ast);
            case "Identifier":              return identifier(ast);
            case "NumericLiteral":          return numericLiteral(ast);
            case "Program":                 return program(ast);
            case "BooleanLiteral":          return booleanLiteral(ast);
            case "ExpressionStatement":     return expressionStatement(ast);
            case "AssignmentExpression":    return assignmentExpression(ast);
            case "BinaryExpression":        return binaryExpression(ast);
            case "CallExpression":          return callExpression(ast);
            case "NewExpression":           return newExpression(ast);
            case "ReturnStatement":         return returnStatement(ast);
            case "ParenthesizedExpression": return parenthesizedExpression(ast);
            case "SequenceExpression":      return sequenceExpression(ast);
            case "UnaryExpression":         return unaryExpression(ast);
            case "IfStatement":             return ifStatement(ast);
            case "BlockStatement":          return blockStatement(ast);
            case "WhileStatement":          return whileStatement(ast);
            case "DoWhileStatement":        return doWhileStatement(ast);
            case "FunctionDeclaration":     return functionDeclaration(ast);
            case "VariableDeclaration":     return variableDeclaration(ast);
            case "ObjectExpression":        return objectExpression(ast);
            case "PropertyDefinition":      return propertyDefinition(ast);
            case "ArrayExpression":         return arrayExpression(ast);
            case "Elision":                 return elision(ast);
            case "SwitchStatement":         return switchStatement(ast);
            case "SwitchCase":              return switchCase(ast);
            case "DefaultCase":             return defaultCase(ast);
            case "TryStatement":            return tryStatement(ast);
            case "CatchClause":             return catchClause(ast);
            case "Finally":                 return finally_(ast);
            case "ForStatement":            return forStatement(ast);
            case "ForInStatement":
            case "ForOfStatement":          return forInOfStatement(ast);
            case "ModuleDeclaration":       return moduleDeclaration(ast);
            case "ImportStatement":         return importStatement(ast);
            case "ExportStatement":         return exportStatement(ast);
            case "ThrowStatement":          return throwStatement(ast);
            case "BreakStatement":          return breakStatement(ast);
            case "ContinueStatement":       return continueStatement(ast);
            case "DebuggerStatement":       return debuggerStatement(ast);
            default:
                throw new TypeError(format("NO_COMPILER_FOR_S", ast && ast.type));
        }
    }
    /**
     * spent thirty seconds for showing how to use the compiler
     * @param ast
     * @returns {{POOL: *, HEAP32: *, STACKSIZE: *, STACKTOP: *}}
     */
    function compileUnit(ast) {
        init(DEFAULT_SIZE); // invent a good guess and a resize for the emergency case
        compile(ast);
        return get();
    }
    /**
     * the steps are to call init, compile and get
     * and to unify it i add the method compileUnit
     * @type {null}
     */
    exports.init = init;
    exports.compile = compile;
    exports.get = get;
    exports.compileUnit = compileUnit;
});


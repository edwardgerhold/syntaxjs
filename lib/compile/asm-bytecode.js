// the first assignments for the definition are more verbose, to store an in-doc description
// for simpler access to the bytecodes meaning


function defineByteCode(num, name, desc) {
    if (typeof num != "number" || typeof name != "string" || (desc !== undefined && typeof desc != "string")) {
        throw new TypeError("invalid code definition. defineByteCode(0xF01, 'ERROR', 'Code 0x01 is for the Error Example when wrong arguments are given to defineByteCode'");
    }
    BYTECODESET.BYTECODE[name] = num;
    BYTECODESET.WORDS[num] = ""+name;
    BYTECODESET.DESC[name] = BYTECODESET.DESC[num] = desc;
}
function defineBitFlags(name, bitvalue, description) {
    if (typeof name != "string" || typeof bitvalue != "number" ||
        (description !== undefined && typeof description != "string")) {
        throw new TypeError("invalid flag definition. defineBitflags('flag_error', 0, 'for the example if the flag register is zero then an error occured.'");
    }
    BITFLAGSET.FLAGS[name] = bitvalue;
    BITFLAGSET.DESC[name] = description;
}
function defineRegister($name, $type, $desc) {
    REGISTERSET.REGISTERS[$name] = undefined;
    REGISTERSET.REGNAMES[$name] = true;
    REGISTERSET.REGTYPES[$name] = $type;
}

// compound objects just to hold bytecodes, flags, descriptions (for doc generation)
// assign bytecode = bytecodeset.bytecode before accessing
// as a shorthand

var BITFLAGSET = flagSet();         // the flag object itself can be decoupled from this structure
var BYTECODESET = codeSet();        // this holds the bytecode object plus description object
var REGISTERSET = registerSet();    // is compound object with a description object,

function registerSet () {
    return {
        REGISTERS: Object.create(null),
        REGNAMES: Object.create(null),
        REGTYPES: Object.create(null)
    };
}

function codeSet() {
    return {
        BYTECODE: Object.create(null),
        WORDS: Object.create(null),
        DESC: Object.create(null)
    };
}

function flagSet () {
    return {
        FLAGS: Object.create(null),
        DESC: Object.create(null)
    };
}


/**
 * Created by root on 27.05.14.
 */
    var STATES = Object.create(null);
    STATES.MAINBODY = 2;
    STATES.FUNCTIONCALL = 4;
    STATES.GENERATOR = 8;
    STATES.METHOD = 16;
    STATES.CLASS = 32;
    STATES.ARGLIST = 64;
    STATES.ASSIGNMENT = 128;
    STATES.OBJECTLITERAL = 256;
    STATES.ARRAYLITERAL = 512;

    var BITS = Object.create(null);
    BITS.IS_STRICT = 1;
    BITS.IS_CALLABLE = 2;
    BITS.IS_CONSTRUCTOR = 4;
    BITS.IS_ARROW = 8;
    BITS.HAS_BODY = 16;
    BITS.IS_EXTENSIBLE = 32;
    BITS.IS_SEALED = 64;
    BITS.IS_FROZEN = 128;
    BITS.IS_NATIVE_JS = 256;    // 2nd byte? grrr

    var TYPES = Object.create(null);
    TYPES.REFERENCE = 1;                    // Merge with BYTECODE Object. Give them free numbers of the code.
    TYPES.NUMBER = 2;
    TYPES.STRING = 3;
    TYPES.SYMBOL = 4;
    TYPES.OBJECT = 5;
    TYPES.NULL = 6;
    TYPES.UNDEFINED = 7;
    TYPES.COMPLETION = 8;
    TYPES.ENVIRONMENT = 9;
    TYPES.CALLCONTEXT = 10;

    var RECORDTYPE = Object.create(null);       // <------ merge with BYTECODE Object. Easier to compare.
    RECORDTYPE.GLOBALREC = 1;
    RECORDTYPE.FUNCTIONREC = 2;
    RECORDTYPE.LOCALREC = 3;
    RECORDTYPE.OBJECTREC = 4;
    RECORDTYPE.GLOBALENV = 10;
    RECORDTYPE.FUNCTIONENV = 11;
    RECORDTYPE.LOCALENV = 12;
    RECORDTYPE.OBJECTENV = 13;

    /**
     *  BYTECODES
     */

    defineByteCode(0xF01, "END", "");
    defineByteCode(0xF02, "SYSCALL", "");

    defineByteCode(0xF03, "DEBUGGER", "The debugger; Statement");

    /*
        ByteCodes to Identify

        Data Types
        Environment Records
        Completions

        in the Heap

        I decided to put these under the ByteCode
        to be able to test by just using BYTECODE.*
        instead of TYPES.IDENTIFIER and BYTECODE.IDCONST
        and similar

        but i will work it out before the solution is clear


        /* THE TWO BYTE CODE IS NOT NEEDED,
        256 COMMANDS ARE DEFINITLY ENOUGH FOR THE VM
        AND I WILL RENUMBER THEM ALL TO FIT IN THE BYTE.

         */


    defineByteCode(0xF21, "STRINGCONST")
    defineByteCode(0xF22, "NUMCONST")
    defineByteCode(0xF23, "IDCONST")
    defineByteCode(0xF24, "NULL");
    defineByteCode(0xF25, "UNDEFINED");
    defineByteCode(0xF26, "SYMBOL");
    defineByteCode(0xF27, "STRING");
    defineByteCode(0xF28, "BOOLEAN");
    defineByteCode(0xF29, "NUMBER");
    defineByteCode(0xF2A, "OBJECT");
    defineByteCode(0xF2B, "LOCALREC");
    defineByteCode(0xF2C, "OBJECTREC");
    defineByteCode(0xF2D, "FUNCTIONREC");
    defineByteCode(0xF2E, "GLOBALREC");
    defineByteCode(0xF2F, "REFERENCE");
    defineByteCode(0xF30, "UNRESOLVEDREFERENCE");
    defineByteCode(0xF31, "EXECUTIONCONTEXT");
    defineByteCode(0xF32, "NORMALCOMPLETION");
    defineByteCode(0xF33, "THROWCOMPLETION");
    defineByteCode(0xF34, "RETURNCOMPLETION");
    defineByteCode(0xF35, "BREAKCOMPLETION");
    defineByteCode(0xF36, "CONTINUECOMPLETION");
    defineByteCode(0xF37, "CODEREALM");
    /**
     * binary, relational, assignment expressions
     * btw. it makes sense to separate relational expressions
     * from arithmetic and assignments. but i didnt here now.
     * let me think about doing it better. all relational expressions
     * return a boolean result.
     * all assignments store a value
     * and compound assignments are two instructions, one to add, one to store
     */
    defineByteCode(0xF60, "ADD", "add");
    defineByteCode(0xF61, "ADDL", "add and assign");
    defineByteCode(0xF62, "SUB", "subtract");
    defineByteCode(0xF63, "SUBL", "subtract and assign");
    defineByteCode(0xF64, "MUL", "multiply");
    defineByteCode(0xF65, "MULL", "multiply and assign");
    defineByteCode(0xF66, "DIV", "");
    defineByteCode(0xF67, "DIVL", "");
    defineByteCode(0xF68, "MOD", "");
    defineByteCode(0xF69, "MODL", "");
    defineByteCode(0xF70, "SHL", "");
    defineByteCode(0xF71, "SHLL", "");
    defineByteCode(0xF72, "SHR", "");
    defineByteCode(0xF73, "SHRL", "");
    defineByteCode(0xF74, "SSHR", "");
    defineByteCode(0xF75, "SSHRL", "");
    defineByteCode(0xF76, "AND", "&");
    defineByteCode(0xF77, "OR", "|");
    defineByteCode(0xF78, "LAND", "&&");
    defineByteCode(0xF79, "LOR", "||");
    defineByteCode(0xF80, "NEG", "unary not with !");
    defineByteCode(0xF81, "XOR", "xor with ^");
    defineByteCode(0xF82, "INV", "invert with ~");
    // Data Structures (use the heap as structure)
    defineByteCode(0xFB00, "LIST", "Code telling that this HEAP/STACK Area is to be read as list");       // [0] = LIST, [1] = NEXT LISTNODE;
    defineByteCode(0xFB01, "LISTNODE", "ListNode with a pointer to next and it´s item"); // [0] LISTNODE [1] NEXT [2..DATA]
    defineByteCode(0xFB02, "DLISTNODE", "ListNode with a pointer to next, prev and it´s item"); // [0] LISTNODE [1] NEXT [2] PREV [3.. DATA]
    defineByteCode(0xFB03, "LISTLISTNODE", "ListNode with a pointer to next, prev, list and it´s item"); // [0] LISTNODE [1] NEXT [2] PREV [3] LIST [4.. DATA]
    defineByteCode(0xFB10, "HASH", "");
    defineByteCode(0xFB11, "HASHKEY", "");
    defineByteCode(0xFB12, "HASHVALUE", "");
    defineByteCode(0xFB13, "HASHFUNC", "Pointer to Hashfunction in Function Table");
    defineByteCode(0xFB20, "ARRAY", "Treat the following bytes as array structure");     // [0] = ARRAY [1] = LEN [2...2+LEN] ITEMS
    // use HEAP32 etc as typed array (it is already one, so let´s gain speed inside syntax)
    defineByteCode(0xFB25, "INT32ARRAY", ""); // access HEAP like array of these, could speed up typed arrays in the vm :-)
    defineByteCode(0xFB26, "FLOAT64ARRAY", "");
    // some HALT CODE
    defineByteCode(0xFFF, "HALT", "Stop script evaluation now and return whatever it is.");

    /**
     * Calling Builtin Constructors with one Instruction
     */
    defineByteCode(0xF200, "NEWOBJECT", "Shorty to create a new Object, hidden Class of PropNames from Parsing is in the Constant Pool");
    defineByteCode(0xF201, "NEWARRAY", "Shorty to create a new Array");
    defineByteCode(0xF202, "NEWSYMBOL", "Call Symbol()");
    defineByteCode(0xF203, "NEWNUMBER", "Call new Number()");
    defineByteCode(0xF204, "NEWSTRING", "");
    defineByteCode(0xF204, "NEWARRAYBUFFER", "");
    defineByteCode(0xF206, "NEWDATAVIEW", "");
    defineByteCode(0xF207, "NEWINT8ARRAY", "");
    defineByteCode(0xF208, "NEWINT16ARRAY", "");
    defineByteCode(0xF209, "NEWINT32ARRAY", "");
    defineByteCode(0xF210, "NEWUINT8ARRAY", "");
    defineByteCode(0xF211, "NEWUINT8CLAMPEDARRAY", "");
    defineByteCode(0xF212, "NEWUINT16ARRAY", "");
    defineByteCode(0xF213, "NEWUINT32ARRAY", "");
    defineByteCode(0xF214, "NEWFLOAT32ARRAY", "");
    defineByteCode(0xF215, "NEWFLOAT64ARRAY", "");
    defineByteCode(0xF216, "NEWFUNCTION", "");
    defineByteCode(0xF217, "NEWGENERATORFUNCTION", "");
    /**
     * Accessing internal slots in one instruction
     */
    defineByteCode(0xF300, "GETSLOT", "lookup internal object slot");
    defineByteCode(0xF301, "SETSLOT", "");
    defineByteCode(0xF302, "HASSLOT", "");
    /**
     * Call Codes
     */
    defineByteCode(0xF501, "CALL", "");
    defineByteCode(0xF502, "CONSTRUCT", "");
    defineByteCode(0xF503, "RET", "");
    defineByteCode(0xF504, "INVOKE", "");
    defineByteCode(0xF505, "FPROTOCALL", "");
    defineByteCode(0xF506, "FPROTOAPPLY", "");
    defineByteCode(0xF507, "SUPERCALL", "");
    /*
     * Conditional jumps
     */
    defineByteCode(0xF600, "JMP", "");
    defineByteCode(0xF601, "JEQ", "if op1 === op2 goto op3");
    defineByteCode(0xF602, "JNEQ", "");
    defineByteCode(0xF603, "JLT", "");
    defineByteCode(0xF604, "JLTEQ", "");
    defineByteCode(0xF605, "JGT", "");
    defineByteCode(0xF606, "JGTEQ", "");
    /**
     * essentials in one instruction
     */
    defineByteCode(0xF700, "GETPROPERTY", "");
    defineByteCode(0xF701, "GET", "");
    defineByteCode(0xF702, "SET", "");
    defineByteCode(0xF703, "DEFINEOWNPROPERTY", "");
    defineByteCode(0xF704, "DELETEPROPERTY", "");
    defineByteCode(0xF705, "DEFINEOWNPROPERTYORTHROW", "");
    defineByteCode(0xF706, "DELETEPROPERTYORTHROW", "");
    defineByteCode(0xF707, "OWNPROPERTYKEYS", "");
    defineByteCode(0xF708, "ENUMERATE", "");
    /**
     * reference
     */
    defineByteCode(0xF800, "GETVALUE", "");
    defineByteCode(0xF801, "SETVALUE", "");
    defineByteCode(0xF802, "ISUNRESOLVABLE", "");
    defineByteCode(0xF803, "ISPROPERTYREF", "");
    /**
     * creating iterators fast
     */
    defineByteCode(0xF900, "ITERATOR", "");
    defineByteCode(0xF901, "ITERATOR1", "");
    defineByteCode(0xF902, "ITERATOR2", "");
    defineByteCode(0xF903, "CREATELISTITERATOR", "");
    defineByteCode(0xF920, "CREATEARRAYITERATOR", "");
    defineByteCode(0xF921, "CREATELOADERITERATOR", "");
    defineByteCode(0xF922, "CREATESTRINGITERATOR", "");
    defineByteCode(0xF923, "CREATEMAPITERATOR", "");
    defineByteCode(0xF924, "CREATESETITERATOR", "");
    /*
     convert between lists and arrays
     */
    defineByteCode(0xFA00, "ARRAYFROMLIST", "");
    defineByteCode(0xFA01, "LISTFROMARRAY", "");
    defineByteCode(0xFE00, "EXPRESSION", "");
    defineByteCode(0xFE01, "SEQEXPR", "");
    defineByteCode(0xFE02, "PROGRAM", "");
    /*
     declarative environments
     */
    defineByteCode(0xFE20, "HASBINDING", "");
    defineByteCode(0xFE21, "CREATEMUTABLEBINDING", "");
    defineByteCode(0xFE22, "CREATEIMMUTABLEBINDING", "");
    defineByteCode(0xFE23, "INITIALIZEBINDING", "");
    defineByteCode(0xFE24, "SETMUTABLEBINDING", "");
    defineByteCode(0xFE25, "GETBINDINGVALUE", "");
    defineByteCode(0xFE26, "DELETEBINDING", "");
    defineByteCode(0xFE29, "HASTHISBINDING", "");
    defineByteCode(0xFE27, "WITHBASEOBJECT", "");
    defineByteCode(0xFE28, "HASSUPERBINDING", "");



    defineBitFlags("P_STRICT", 1, "");
    defineBitFlags("P_METHOD", 2, "");
    defineBitFlags("P_GENERATOR", 4, "");
    defineBitFlags("P_GETTER", 8, "");
    defineBitFlags("P_SETTER", 16, "");
    defineBitFlags("P_STATIC_METHOD", 32, "");            // static method() in class
    defineBitFlags("P_PROTOTYPE_METHOD", 64, "");         // method() in class
    defineBitFlags("P_EXPRESSION", 128, "");              // [computed]

    defineBitFlags("F_STRICT", 1, "");
    defineBitFlags("F_METHOD", 2, "");
    defineBitFlags("F_EXPRESSION", 4, "");
    defineBitFlags("F_GENERATOR", 8, "");
    defineBitFlags("F_THISMODE_LEXICAL", 16, "");
    defineBitFlags("F_ARROW", 16, "");
    defineBitFlags("F_THISMODE_GLOBAL", 128, "");
    defineBitFlags("F_BOUNDFUNCTION", 256, "");
    defineBitFlags("R_STRICT", 1, "");
    defineBitFlags("R_SUPER", 2, "");
    defineBitFlags("R_UNDEFINED", 4, "");



    /**
     * needed or not? currently i tend to no.
     */
    defineRegister("0", undefined, "")
    defineRegister("1", undefined, "")
    defineRegister("new", undefined, "")
    defineRegister("return", undefined, "")
    defineRegister("class", undefined, "");
    defineRegister("number", undefined, "");
    /**
     *
     */

    exports.BYTECODESET = BYTECODESET;
    exports.STATES = STATES;
    exports.TYPES = TYPES;
    exports.RECORDTYPE = RECORDTYPE;
    exports.REGISTERSET = REGISTERSET;
    exports.BITFLAGSET = BITFLAGSET;
    exports.BITS = BITS;


// });

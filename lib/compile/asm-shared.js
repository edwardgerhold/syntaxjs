/**
 * contains (but in an early and still evolving state)
 *
 * STATE
 * TYPE
 * RECORDTYPE
 * BITS
 * BYTECODE
 * FLAGS
 * REGISTERS
 * functions to define bytecodes on some object,
 * functions to define a register object
 *
 * needed by asm-compiler, asm-runtime for compiling and execution
 * so i factor it out here
 */


/**
 * Created by root on 27.05.14.
 */
define("asm-shared", function (require, exports, module) {

    /**
     *
     * In my loop i may have the need for setting machine state
     * The state may be allocated on the stack
     *
     * Maybe it´s not necessary
     *
     * @type {null}
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


    /**
     * Bitsets
     * They will be there, but the set is not known yet.
     *
     * To save memory, all kind of HEAP allocated Objects
     * have some booleans compressed in a bitset. That is
     * an | or += to set and to subtract the bitvalue to unset
     * @type {null}
     */
    var BITS = Object.create(null);
    BITS.IS_STRICT = 1;
    BITS.IS_CALLABLE = 2;
    BITS.IS_CONSTRUCTOR = 3;
    BITS.IS_ARROW = 4;
    BITS.HAS_BODY = 8;
    BITS.IS_EXTENSIBLE = 16;
    BITS.IS_SEALED = 32;
    BITS.IS_FROZEN = 64;
    BITS.IS_NATIVE_JS = 128;


    /**
     * The results of the Type abstract operation are the same.
     * I compile with a type byte to identify the object and where
     * to look up the essential methods.
     *
     * @type {null}
     */
    var TYPES = Object.create(null);
    TYPES.REFERENCE = 1;
    TYPES.NUMBER = 2;
    TYPES.STRING = 3;
    TYPES.SYMBOL = 4;
    TYPES.OBJECT = 5;
    TYPES.NULL = 6;
    TYPES.UNDEFINED = 7;
    TYPES.COMPLETION = 8;
    TYPES.ENVIRONMENT = 9;
    TYPES.CALLCONTEXT = 10;
    // function Type(O) should be inlined and manually testet in this file. maybe it helps. calls hurt too much.

    /**
     * Record means EnvironmentRecord
     * RECORDTYPE is an ID for the Environment Records
     *
     * @type {null}
     */
    var RECORDTYPE = Object.create(null);
    RECORDTYPE.GLOBALREC = 1;
    RECORDTYPE.FUNCTIONREC = 2;
    RECORDTYPE.LOCALREC = 3;
    RECORDTYPE.OBJECTREC = 4;
    RECORDTYPE.GLOBALENV = 10;
    RECORDTYPE.FUNCTIONENV = 11;
    RECORDTYPE.LOCALENV = 12;
    RECORDTYPE.OBJECTENV = 13;

    // got to rename these
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
     * todo: pass set with call to defineRegister, or do the extra arg automatically
     *
     * DEFINE REGISTER
     *
     * define a special purpose register in the REGISTERS OBJECT, costs a [[Get]](P) each time,
     * but can have any name, any length and any value, it´s a javascript dynamic register
     *
     * other register types in use are the typed array registers, which are just one int
     * (special regs could be a number of slots, like a reference register with four slots for base,name,strict,thisValue)
     *
     * @param $name
     * @param $type
     * @param $desc
     */
    function defineRegister($name, $type, $desc) {
        REGISTERSET.REGISTERS[$name] = undefined;
        REGISTERSET.REGNAMES[$name] = true;
        REGISTERSET.REGTYPES[$name] = $type;
    }

    function defineByteCode(num, name, desc) {
        if (typeof num != "number" || typeof name != "string" || (desc !== undefined && typeof desc != "string")) {
            throw new TypeError("invalid code definition. defineByteCode(0x01, 'ERROR', 'Code 0x01 is for the Error Example when wrong arguments are given to defineByteCode'");
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

    /**
     *
     *  BYTECODES
     *
     *  i try to define an unique instruction set
     *  in the meantime i do a rush on assembly to get everything together
     *
     *  i am already at paging or a the calling convention and stack allocation for procedures
     *
     *  and figuring out, but there is more to do for me until this becomes what it look likes it wants to become
     *
     */

    defineByteCode(0x00, "END", "");
    defineByteCode(0x01, "SYSCALL", "");
    defineByteCode(0x20, "STRCONST", "");
    defineByteCode(0x21, "NUMCONST", "");
    defineByteCode(0x22, "IDREFCONST", "");
    /**
     * binary, relational, assignment expressions
     * btw. it makes sense to separate relational expressions
     * from arithmetic and assignments. but i didnt here now.
     * let me think about doing it better. all relational expressions
     * return a boolean result.
     * all assignments store a value
     * and compound assignments are two instructions, one to add, one to store
     */
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
    defineByteCode(0x76, "AND", "&");
    defineByteCode(0x77, "OR", "|");
    defineByteCode(0x78, "LAND", "&&");
    defineByteCode(0x79, "LOR", "||");
    defineByteCode(0x80, "NEG", "unary not with !");
    defineByteCode(0x81, "XOR", "xor with ^");
    defineByteCode(0x82, "INV", "invert with ~");
    // Data Structures (use the heap as structure)
    defineByteCode(0xB00, "LIST", "Code telling that this HEAP/STACK Area is to be read as list");       // [0] = LIST, [1] = NEXT LISTNODE;
    defineByteCode(0xB01, "LISTNODE", "ListNode with a pointer to next and it´s item"); // [0] LISTNODE [1] NEXT [2..DATA]
    defineByteCode(0xB02, "DLISTNODE", "ListNode with a pointer to next, prev and it´s item"); // [0] LISTNODE [1] NEXT [2] PREV [3.. DATA]
    defineByteCode(0xB03, "LISTLISTNODE", "ListNode with a pointer to next, prev, list and it´s item"); // [0] LISTNODE [1] NEXT [2] PREV [3] LIST [4.. DATA]
    defineByteCode(0xB10, "HASH", "");
    defineByteCode(0xB11, "HASHKEY", "");
    defineByteCode(0xB12, "HASHVALUE", "");
    defineByteCode(0xB13, "HASHFUNC", "Pointer to Hashfunction in Function Table");
    defineByteCode(0xB20, "ARRAY", "Treat the following bytes as array structure");     // [0] = ARRAY [1] = LEN [2...2+LEN] ITEMS
    // use HEAP32 etc as typed array (it is already one, so let´s gain speed inside syntax)
    defineByteCode(0xB25, "INT32ARRAY", ""); // access HEAP like array of these, could speed up typed arrays in the vm :-)
    defineByteCode(0xB26, "FLOAT64ARRAY", "");
    // some HALT CODE
    defineByteCode(0xFF, "HALT", "Stop script evaluation now and return whatever it is.");
    // Signalling Completion Records
    defineByteCode(0x100, "NORMALCOMP", "Normal Completion");
    defineByteCode(0x101, "THROWCOMP", "Throw Completion");
    defineByteCode(0x102, "BREAKCOMP", "Break Completion");
    defineByteCode(0x103, "CONTINUECOMP", "Continue Completion");
    defineByteCode(0x104, "RETURNCOMP", "Return Completion");
    /**
     * Calling Builtin Constructors with one Instruction
     */
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
    /**
     * Accessing internal slots in one instruction
     */
    defineByteCode(0x300, "GETSLOT", "lookup internal object slot");
    defineByteCode(0x301, "SETSLOT", "");
    defineByteCode(0x302, "HASSLOT", "");
    /**
     * Call Codes
     */
    defineByteCode(0x501, "CALL", "");
    defineByteCode(0x502, "CONSTRUCT", "");
    defineByteCode(0x503, "RET", "");
    defineByteCode(0x504, "INVOKE", "");
    defineByteCode(0x505, "FPROTOCALL", "");
    defineByteCode(0x506, "FPROTOAPPLY", "");
    defineByteCode(0x507, "SUPERCALL", "");
    /*
     * Conditional jumps
     */
    defineByteCode(0x600, "JMP", "");
    defineByteCode(0x601, "JEQ", "if op1 === op2 goto op3");
    defineByteCode(0x602, "JNEQ", "");
    defineByteCode(0x603, "JLT", "");
    defineByteCode(0x604, "JLTEQ", "");
    defineByteCode(0x605, "JGT", "");
    defineByteCode(0x606, "JGTEQ", "");
    /**
     * essentials in one instruction
     */
    defineByteCode(0x700, "GETPROPERTY", "");
    defineByteCode(0x701, "GET", "");
    defineByteCode(0x702, "SET", "");
    defineByteCode(0x703, "DEFINEOWNPROPERTY", "");
    defineByteCode(0x704, "DELETEPROPERTY", "");
    defineByteCode(0x705, "DEFINEOWNPROPERTYORTHROW", "");
    defineByteCode(0x706, "DELETEPROPERTYORTHROW", "");
    defineByteCode(0x707, "OWNPROPERTYKEYS", "");
    defineByteCode(0x708, "ENUMERATE", "");
    /**
     * reference
     */
    defineByteCode(0x800, "GETVALUE", "");
    defineByteCode(0x801, "SETVALUE", "");
    defineByteCode(0x802, "ISUNRESOLVABLE", "");
    defineByteCode(0x803, "ISPROPERTYREF", "");
    /**
     * creating iterators fast
     */
    defineByteCode(0x900, "ITERATOR", "");
    defineByteCode(0x901, "ITERATOR1", "");
    defineByteCode(0x902, "ITERATOR2", "");
    defineByteCode(0x903, "CREATELISTITERATOR", "");
    defineByteCode(0x920, "CREATEARRAYITERATOR", "");
    defineByteCode(0x921, "CREATELOADERITERATOR", "");
    defineByteCode(0x922, "CREATESTRINGITERATOR", "");
    defineByteCode(0x923, "CREATEMAPITERATOR", "");
    defineByteCode(0x924, "CREATESETITERATOR", "");
    /*
     convert between lists and arrays
     */
    defineByteCode(0xA00, "ARRAYFROMLIST", "");
    defineByteCode(0xA01, "LISTFROMARRAY", "");
    defineByteCode(0xE00, "EXPRESSION", "");
    defineByteCode(0xE01, "SEQEXPR", "state[++st] = SEQ  if this is encountered seqexpr state is pushed onto stack (needed for , operator returning last result only)");
    defineByteCode(0xE02, "PROGRAM", "state[++st] = PROG goes from first block to last block");
    /*
     declarative environments
     */
    defineByteCode(0xE20, "HASBINDING", "");
    defineByteCode(0xE21, "CREATEMUTABLEBINDING", "");
    defineByteCode(0xE22, "CREATEIMMUTABLEBINDING", "");
    defineByteCode(0xE23, "INITIALIZEBINDING", "");
    defineByteCode(0xE24, "SETMUTABLEBINDING", "");
    defineByteCode(0xE25, "GETBINDINGVALUE", "");
    defineByteCode(0xE26, "DELETEBINDING", "");
    defineByteCode(0xE29, "HASTHISBINDING", "");
    defineByteCode(0xE27, "WITHBASEOBJECT", "");
    defineByteCode(0xE28, "HASSUPERBINDING", "");


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
     *
     * Define an object with special registers for special instructions
     * other kind of register allocation is going per stack allocation
     *
     * i think i will continue with reading machine code assembly and stack
     * and memory to get closer to what i want to
     *
     * having REGISTERS["t1"] for each SSA until REGISTERS["t9257285272"] free
     * is cool, but what´s better or when is the tradeoff to be made?
     *
     */

    defineRegister("0", undefined, "")
    defineRegister("1", undefined, "")
    defineRegister("new", undefined, "")
    defineRegister("return", undefined, "")
    defineRegister("class", undefined, "");
    defineRegister("number", undefined, "");




    /**
     * Now i export the stuff and load them into the other components
     * like i did with "tables" in parsenodes
     *
     * But anyways, this here has to be cleaned up.
     */

    exports.BYTECODESET = BYTECODESET;
    exports.STATES = STATES;
    exports.TYPES = TYPES;
    exports.RECORDTYPE = RECORDTYPE;
    exports.REGISTERSET = REGISTERSET;
    exports.BITFLAGSET = BITFLAGSET;
    exports.BITS = BITS;


});

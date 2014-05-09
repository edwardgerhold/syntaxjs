/**
 * this compiler deconstructs the ast into INT Code.
 * I hope to refactor it into BYTECODE.
 * later it should be valid numeric code to be run inside an asm js module.
 * the STACKTOP is count in BYTES.
 * the pointers are stored as STACKTOP >> 2 (means times 4) for INTs
 *
 * I notice that BINEXPR, ASSIGNEXPR, CALLEXPR,
 * which take just two arguments can loose their heading code
 * and just store ptr to left, bytecode for load result into r1, ptr to right, bytecode to load result into r2, bytecode for operation of r1, r2
 * currently i emit another header int
 *
 * i see, the "node.type" gets lost when creating bytecode.
 * repeating patterns just make some loads/register transfers necessary
 * which can be done with the same code
 */

define("asm-compiler", function (require, exports) {

    "use strict";
    var DEFAULT_SIZE = 2*1024*1024; // 2 Meg of RAM (string, id, num) should be big enough to run this program
    var POOL, pp;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var STACKBASE, STACKSIZE, STACKTOP;
    /**
     * first bytecodes
     * currently intcodes
     *
     * the compiler and the interpreter will go through a few refactorings
     * i see instructions/annotations which are not needed anymore and could be replaced
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
    var FUNCDECL = 0xC4;
    var ARRAYEXPR = 0xD1;
    var ARRAYINIT = 0xD2;
    var OBJECTEXPR = 0xD4;
    var PROPDEF = 0xD5;
    var OBJECTINIT = 0xD6;
    var RET = 0xD0;
    var ERROR = 0xFE;
    var HALT = 0xFF;
    var EMPTY = -0x01;  // negative can not point into something

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
        POOL = Array(poolSize||10000);
        pp = -1;
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
            STACKTOP: STACKTOP
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
        return POOL[++pp];
    }
    /**
     * @param node
     * @returns {*}
     */
    function identifier (node) {
        POOL[++pp] = node.name;
        var poolIndex = pp;
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
        POOL[++pp] = node.value;
        var poolIndex = pp;
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
            var cu = str[i].charCodeAt(0);
            // if (between 0x800 && ... i forgot it ten times)
            codePoints.push(cu);
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
        POOL[++pp] = node.computed;
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
    function assignmentExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 20;
        HEAP32[ptr] = ASSIGNEXPR;
        HEAP32[ptr+1] = compile(node.left);
        HEAP32[ptr+2] = compile(node.right);
        HEAP32[ptr+3] = ASSIGN;
        HEAP32[ptr+4] = codeForOperator[node.operator];
        //console.log("compiled assign expr to " + ptr);
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
    function binaryExpression(node) {
        var ptr = STACKTOP >> 2;
        STACKTOP += 20;
        HEAP32[ptr] = BINEXPR;
        HEAP32[ptr+1] = compile(node.left);
        HEAP32[ptr+2] = compile(node.right);
        HEAP32[ptr+3] = BINOP;
        HEAP32[ptr+4] = codeForOperator[node.operator];
        //console.log("compiled binary expr to " + ptr);
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
        HEAP32[ptr] = CALLEXPR;
        HEAP32[ptr+1] = compile(node.callee);
        HEAP32[ptr+2] = compile(node.arguments);
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
        HEAP32[ptr+2] = compile(node.arguments);
        HEAP32[ptr+3] = CONSTRUCT;
        //console.log("compiled new expr to " + ptr);
        return ptr;
    }

    function argumentList(list) {
        var len = list.length;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = len|0;
        STACKTOP += 4 + (len << 2);
        for (var i = 0; i < len; i++) {
            HEAP32[ptr+i] = compile(list[i]);
        }
        //console.log("compiled arguments List with length of "+len+ " to "+ ptr)
        return ptr;
    }

    function formalParameters(list) {
        var len = list.length;
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = len|0;
        STACKTOP += 4 + (len << 2);
        for (var i = 0; i < len; i++) {
            HEAP32[ptr+i] = compile(list[i]);
        }
        //console.log("compiled formalParameterList with length of "+len+ " to "+ ptr)
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


    function switchStatement(node) {}
    function switchCase(node) {}
    function defaultClause(node) {}

    function tryStatement(node) {}
    function catchClause(node) {}
    function finally_(node) {}


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

                /*

                case "SwitchStatement": return switchStatement(ast);
                case "SwitchCase": return switchCase(ast);
                case "DefaultCase": return defaultCase(ast);
                case "TryStatement":            return tryStatement(ast);
                case "CatchClause":             return catchClause(ast);
                case "Finally":                 return finally_(ast);



                 */
            default:
                return ERROR;
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


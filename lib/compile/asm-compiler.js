define("asm-compiler", function (require, exports) {

    "use strict";
    var format = require("i18n").format;

    var DEFAULT_SIZE = 2*1024*1024; // 2 Meg of RAM (string, id, num) should be big enough to run this program
    var POOL, DUPEPOOL;

    // HEAP32 here in the compiler is CODE32 in the runtime, the runtime stack will have arrays called STACK32 etc.
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var STACKBASE, STACKSIZE, STACKTOP, STACKLIMIT;

    var LABELS;         // goto indizes LABEL[name] ==> offset
    var LABELNAMES;     // LABELNAMES[offset] ==> name

    var RETADDR = [];   // stack for saving addr during compilation
                        // otherwise i pass them per function argument
    var STATE;

    /*
    function UTF16Encode(cp) {
        Assert(0 <= cp && cp <= 0x10FFFF, "utf16encode: cp has to be beetween 0 and 0x10FFFF");

        if (cp <= 65535) return cp;

        var cu1 = Math.floor((cp - 65536) % 1024) + 55296;
        var cu2 = ((cp - 65536) % 1024) + 56320;
        return [cu1, cu2];
    }

    function UTF16Decode(lead, trail) {
        Assert(0xD800 <= lead && lead <= 0xD8FF, "utf16decode: lead has to be beetween 0xD800 and 0xD8FF");
        Assert(0xDC00 <= trail && trail <= 0xDFFF, "utf16decode: trail has to be beetween 0xDC00 and 0xDFFF");
        var cp = (lead - 55296) * 1024 + (trail - 564320);
        return cp;
    }
    */




    function pointsToString(points)  {
      return String.fromCharCode.apply(undefined, points);
    }



    var BYTECODESET = require("asm-shared").BYTECODESET;
    var BYTECODE = BYTECODESET.BYTECODE;
    var BITFLAGSET = require("asm-shared").BITFLAGSET;

    var tables = require("tables");
    var propDefKinds = tables.propDefKinds;
    var propDefCodes = tables.propDefCodes;
    var codeForOperator = tables.codeForOperator;
    var operatorForCode = tables.operatorForCode;
    var unaryOperatorFromString = tables.unaryOperatorFromString;

    /**
     * This jmp function is used at the end of each basic block
     * or between alternatives
     *
     * @param ptr
     * @param target
     */

    function jmp(target) {
        if (target === undefined) return;       // simplified (returns if not needed)
        var ptr = STACKTOP >> 2;                // actual position
        HEAP32[ptr]   = BYTECODE.JMP;           // a jump
        HEAP32[ptr+1] = target;                 // to offset passed
    }

    /**
     *
     * @param value
     * @returns {*}
     */
    
    function addToConstantPool(value) {
        var poolIndex;
        if (poolIndex=DUPEPOOL[value]) return poolIndex;
        return POOL.push(value) - 1;
    }

    /**
     *
     * Identifier:
     *
     * context relative is what is to be generated
     *
     * IDENTIFIERNAME       (or Unresolved Identifier)
     * or
     * REFERENCE            (real Reference Type with Identifier Name set to Identifier)
     *
     * got to figure out in practice
     *
     * @param node
     * @returns {*}
     */

    function identifier (node) {
        var poolIndex = addToConstantPool(node.name);
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.IDNAMECONST;
        HEAP32[ptr+1] = poolIndex;
        STACKTOP += 8;
        return ptr;
    }


    /*
        this creates a reference type
        will be aligned with the code for reference type
        and be the same function to allocate a four field record
    */

    function identifierReference(name, base, strict, thisValue) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.IDENTIFIERREFERENCE;
        HEAP32[ptr+1] = 0;
        HEAP32[ptr+2] = 0;
        HEAP32[ptr+3] = 0;
    }

    // GetValue(ptr): erstmal base = HEAP32[HEAP32[ptr+1]]  base = heap[heap[ptr]]  dort wo der ptr der records hinzeigt

    
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
        return NumberPrimitiveType(value);
    }

    function stringLiteral(node) {
        var str = node.computed;
        if (str === undefined) str = str.slice(1, str.length-2);    // here is an issue in StringLiteral/SV (long time noticed)
        return StringPrimitiveType(str);
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
        var str = node.computed;
        if (str === undefined) str = str.slice(1, str.length-2);    // here is an issue in StringLiteral/SV (long time noticed)
        return ConstantPoolStringPrimitiveType(str);
    }
    /**
     * @param node
     * @returns {*}
     */
    function booleanLiteral(node) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.BOOLEAN;
        HEAP32[ptr+1] = (node.value === "true") ? 1 : 0;
        STACKTOP += 8;
        return ptr;
    }
    /**
     * I really compile the node.expression
     * into one slot. Or ? no.
     * @param node
     * @returns {number}
     */
    function expressionStatement(node, next) {
        return compile(node.expression, next);
    }

    function parenthesizedExpression(node, next) {
        return compile(node.expression, next);
    }

    /**
     * @param node
     * @returns {*}
     */
    function sequenceExpression(node, nextAddr) {   // no code, i take the result of the last in the code where i compiled it. i think that works
        var len = node.sequence.length;
        var ptr = STACKTOP >> 2;
        for (var i = 0; i < len; i++) {
            nextAddr = compile(node.sequence[i], nextAddr);
        }
        return ptr;
    }

    /**
     * @param node
     */

    function assignmentExpression(node, nextAddr) {
        var ptr = STACKTOP >> 2;
        var code;
        switch (node.operator) {
            case "=": code = BYTECODE.ASSIGN; break;
            case "+=": code = BYTECODE.ADDL; break;
            case "-=": code = BYTECODE.SUBL; break;
            case "*=": code = BYTECODE.MULL; break;
            case "/=": code = BYTECODE.DIVL; break;
            case "%=": code = BYTECODE.MODL; break;
            case "<<=": code = BYTECODE.SHLL; break;
            case ">>=": code = BYTECODE.SHRL; break;
            case ">>>=": code = BYTECODE.SSHRL; break;
        }
        HEAP32[ptr] = code;

        // runtime should get now a result
        // and, it´s an assignment.
        // just putvalue to the left.
        // more details later.

        if (nextAddr != undefined) jmp(nextAddr);
        return ptr;
    }

    function unaryExpression(node, next) {
        var ptr = compile(node.argument);   // erst die value berechnen
        var code;
        switch (node.operator) {
            case "!": code = BYTECODE.NEG; break;
            case "~": code = BYTECODE.INV; break;
            case "++": code = node.prefix ? BYTECODE.PREINCREMENT : BYTECODE.POSTINCREMENT; break;
            case "--": code = node.prefix ? BYTECODE.PREDECREMENT : BYTECODE.POSTDECREMENT; break;
            case "!!": code = BYTECODE.TOBOOLEAN; break;
        }
        var ptr2 = STACKTOP >> 2;
        HEAP32[ptr2] = code;
        if (next !== undefined) jmp(next);              // maybe it´s too much here and is only in "Expression" and not in "piece of expression"
        return ptr;
    }
    /**
     *
     */
    function binaryExpression(node, nextAddr) {
        var ptr = STACKTOP >> 2;
        var code;
        switch (node.operator) {
            case "==": code = BYTECODES.EQ; break;
            case "===":code = BYTECODES.SEQ; break;
            case "!=": code = BYTECODES.NEQ; break;
            case "!==":code = BYTECODES.SNEQ; break;
            case "+": code = BYTECODES.ADD; break;
            case "-":code = BYTECODES.SUB; break;
            case "*":code = BYTECODES.MUL; break;
            case "/":code = BYTECODES.DIV; break;
            case "%":code = BYTECODES.MOD; break;
            case "<<":code = BYTECODES.SHL; break;
            case ">>":code = BYTECODES.SHR; break;
            case "|":code = BYTECODES.OR; break;
            case "&":code = BYTECODES.AND; break;
            case "&&":code = BYTECODES.LOGOR; break;
            case "||":code = BYTECODES.LOGAND; break;
            case "<":code = BYTECODES.LT; break;
            case ">":code = BYTECODES.GT; break;
            case ">=":code = BYTECODES.GTEQ; break;
            case "<=":code = BYTECODES.LTEQ; break;
            break;
        }
        HEAP32[ptr] = code; // fetch operator left and operator right (left and right gets one stack each, or i save them to the stack and pop them to left and right back like asm, we´ll see)
        if (nextAddr!==undefined) jmp(nextAddr);
        return ptr;
    }
    /**
     *
     * @param node
     * @returns {*}
     */

    function callExpression(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }
    /**
     *
     * @param node
     */
    function newExpression(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }


    function argumentList(list) {
        var poolIndex = ++pp;
        POOL[pp] = list;
        var ptr = STACKTOP >> 2;
        return ptr;
    }


    function formalParameters(list) {
        var poolIndex = ++pp;
        POOL[pp] = list;
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function functionDeclaration(node) {
        POOL[++pp] = node;
        var poolIndex = pp;
        var ptr = STACKTOP;
        return ptr;
    }

    function variableDeclaration(node) {
        POOL[++pp] = node;
        var poolIndex = pp;
        return ptr;
    }

    function propertyDefinition(node) {
        var ptr = STACKTOP >> 2;
        POOL[++pp] = node.key;
        return ptr;
    }

    function objectExpression(node) {
        var ptr = STACKTOP >> 2;
        var len = node.elements.length;
        return ptr;
    }

    function arrayExpression(node) {
        var ptr = STACKTOP >> 2;
        var len = node.elements.length;
        return ptr;
    }

    function elision(ast) {
        var ptr = STACKTOP >> 2;
        var width = node.width;
        STACKTOP+=8;
        HEAP32[ptr] = ELISION;
        HEAP32[ptr+1] = width;
        return ptr;
    }

    function returnStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function ifStatement(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function blockStatement(node) {
        var len = node.body.length;
        var body = node.body;
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function whileStatement(node) {
        var len = node.body.length;
        var body = node.body;
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    function doWhileStatement(node) {
        var len = node.body.length;
        var body = node.body;
        var ptr = STACKTOP >> 2;
        return ptr;
    }


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
        HEAP32[ptr] = BYTECODE.CONTINUECOMP;
        HEAP32[ptr+1] = LABELS[node.label];
        return ptr;
    }

    function debuggerStatement(node) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = DEBUGGER;
        return ptr;
    }



    function labelledStatement(node, next) {    // [label|nextoffset] code to start with label is ok to interpret as label and ptr? or more verbose? no, costs speed, or?
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.LABEL;

        LABELS[node.label] = ptr;
        LABELNAMES[ptr] = node.label;

        HEAP32[ptr+1] = compile(node.statement, next);  // goto direkt nach dem statement. das label belongs now to the statement

        return ptr;
    }


    /**
     * @param node
     * @returns {*}
     */

    function program(node) {
        var body = node.body;
        var strict = !!node.strict;
        var len = body.length;
        var nextBlockAddr = lastBlock();
        for (var i = body.length-1; i >= 0;i--) {
            nextBlockAddr = compile(body[i], nextBlockAddr);
        }
        var ptr = STACKTOP >> 2;
        jmp(ptr);
        return ptr;
    }

    function lastBlock() {
        var ptr = STACKTOP >> 2;
        STACKTOP += 4;
        HEAP32[ptr] = BYTECODE.END;
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
            case "LabelledStatement":        return labelledStatement(ast);
            default:
                throw new TypeError(format("NO_COMPILER_FOR_S", ast && ast.type));
        }
    }
    /**
     * this createas an empty compilation unit for use
     * by asm-parser.js a synxtax directed translator for this bytecode dsl
     *
     * @returns {{POOL: *, HEAP32: *, STACKSIZE: *, STACKTOP: *}}
     */
    function getEmptyUnit() {
        var oldUnit = get();
        init();
        var newUnit = get();
        set(oldUnit);
        return newUnit;
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
     * initialize the compiler for a new compilation
     * after compilation use exports.get() to get the data
     *
     * @param stackSize
     */
    function init(stackSize, poolSize) {
        POOL = new Array(poolSize||10000);
        DUPEPOOL = Object.create(null); // dupe check for identifiers, etc.
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
        STATE = [];
        LABELS = Object.create(null);
    }

    /**
     * get returns the compiled data, the heap, the constant pool, the stacksize and stacktop
     * @returns {{POOL: *, HEAP32: *, STACKSIZE: *, STACKTOP: *}}
     *
     */
    function get() {
        return {
            POOL: POOL,
            DUPEPOOL: DUPEPOOL,
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
            STATE: STATE,
            LABELS: LABELS,
            LABELNAMES: LABELNAMES
        };
    }

    /**
     *
     * @param unit
     */
    function set(unit) {
        POOL = unit.POOL;
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
        STATE = unit.STATE;
        LABELS = unit.LABELS;
        LABELNAMES = unit.LABELNAMES;
    }


    /**
     * the steps are to call init, compile and get
     * and to unify it i add the method compileUnit
     * @type {null}
     */
/*    exports.init = init;
    exports.compile = compile;
    exports.get = get; */
    exports.compileUnit = compileUnit;
    exports.getEmptyUnit = getEmptyUnit;


    /*
        xs outside

     */

    var debug = {};
    exports.debug = debug;



    debug.compile = compile;


});


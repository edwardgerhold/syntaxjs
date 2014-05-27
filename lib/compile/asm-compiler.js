/*
    requirements

    1) boundNames, lexNames, varNames
    on each node
    for setting them in the constant pool

    2) re-writing 40% of the ecma api
    to use a array basis for registers,
    local variables, object slots

    3) ObjectEnvironment stays old version
    4) ObjectRecord is same, but new typed layout

    must do strict separation of old ast runtime
    and new binary runtime.

    (it´s another 4-8 weeks of hard work, but
    then it´s small, typed, fast and dynamic)

 */

define("asm-compiler", function (require, exports) {

    "use strict";
    var format = require("i18n").format;

    var DEFAULT_SIZE = 2*1024*1024; // 2 Meg of RAM (string, id, num) should be big enough to run this program
    var POOL, pp, poolDupeMap;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var MEMORY, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAPU32, HEAP32, HEAPF32, HEAPF64;
    var STACKBASE, STACKSIZE, STACKTOP, STACKLIMIT;

    var LABELS;         // goto indizes
    var RETADDR = [];   // stack for saving addr during compilation

    var STATE;
    var st = -1;

    function pushState(state) {
        STATE[++st] = state;
    }

    function popState() {
        return STATE[st--];
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
     *
     * @param ptr
     * @param target
     */
    function jmp(ptr, target) {
        HEAP32[ptr]   = JMP;
        HEAP32[ptr+1] = target;
    }

    /**
     *
     * @param value
     * @returns {*}
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
        return ptr;
    }
    /**
     * I really compile the node.expression
     * into one slot. Or ? no.
     * @param node
     * @returns {number}
     */
    function expressionStatement(node) {
        return compile(node.expression);
    }

    function parenthesizedExpression(node) {
        var ptr = STACKTOP >> 2;
        return ptr;
    }

    /**
     * @param node
     * @returns {*}
     */
    function sequenceExpression(node) {
        var len = node.sequence.length
        var ptr = STACKTOP >> 2;
        STACKTOP += 12;
        HEAP32[ptr] = BYTECODES.SEQEXPR;    // set eval state to "comma sequence";
        for (var i = 0; i < len; i++) {
            RETADDR.push(compile(node.sequence[i], RETADDR.pop())); // 2. compile last to first and set gotos
        }
        jmp(ptr+1, RETADDR.pop());  // 3. GOTO first compiled expression
        return ptr;
    }

    /**
     * @param node
     */

    function assignmentExpression(node) {
        var ptr = STACKTOP >> 2;
        var code;
        switch (node.operator) {
            case "=": code = BYTECODES.ASSIGN; break;
            case "+=": code = BYTECODES.ADDL; break;
            case "-=": code = BYTECODES.SUBL; break;
            case "*=": code = BYTECODES.MULL; break;
            case "/=": code = BYTECODES.DIVL; break;
            case "%=": code = BYTECODES.MODL; break;
            case "<<=": code = BYTECODES.SHLL; break;
            case ">>=": code = BYTECODES.SHRL; break;
            case ">>>=": code = BYTECODES.SSHRL; break;
        }
        return ptr;
    }

    function unaryExpression(node) {
        var ptr = STACKTOP >> 2;

        return ptr;
    }
    /**
     *
     */
    function binaryExpression(node) {
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
        jmp(ptr+2, RETADDR.pop())
        return ptr;
    }

    function debuggerStatement(node) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = DEBUGGER;
        return ptr;
    }



    function labelledStatement(node) {
        var ptr = STACKTOP >> 2;
        HEAP32[ptr] = BYTECODE.LABEL;
        LABELS[node.label] = ++LABELIDX;
        HEAP32[ptr+1] = LABELIDX;

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

        var ptr = STACKTOP >> 2;
        STACKTOP += 4;
        HEAP32[ptr] = PRG;
        c

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
            STATE: STATE,
            LABELS: LABELS
        };
    }

    /**
     *
     * @param unit
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
        STATE = unit.STATE;
        LABELS = unit.LABELS;
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
});


/**
 * asm-runtime is now an include file
 * and will take some while to become what
 *
 */

/*
 move into the main file
 give me all variables in overview
 that i can remove the dead code
 and start over

 */

var realm, strict, tailCall;
var tables = require("tables");
var codeForOperator = tables.codeForOperator;
var operatorForCode = tables.operatorForCode;
var unaryOperatorFromCode = tables.unaryOperatorFromCode;
var propDefCodes = tables.propDefCodes;
var detector = require("detector");
var hasConsole = detector.hasConsole;
var formatStr = require("i18n").formatStr;
var translate = require("i18n").translate;


var frames;
var frame;
var fp = -1;
var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
var pc;


var ecma = require("ast-api");
var parse = require("parser");
var parseGoal = parse.parseGoal;


var stack, pc;
var state = [];    // save
var st = -1;


function throwUnknownByteCode(code) {
    throw new TypeError(format("UNKNOWN_INSTRUCTION_S", code));
}


var putOut;
if (hasConsole) putOut = console.log.bind(console);
else if (hasPrint) putOut = print;
else putOut = function () {};


function showDebuggingStats() {
    putOut("DEBUGGER STATUS:");
    putOut("----------------");
    putOut("HEAP32.byteLength: "+HEAP32.byteLength);

}


function main() {
    "use strict";
    var $0,$1,$2,$3,$4,$5,$6,$7,$8,$9,$A,$B,$C,$D,$E,$F;

    while (1) {

        var code = HEAP32[pc];
        debug("decoded "+code+" at "+pc+" ("+(pc<<2)+")");
        switch(code) {


            case BYTECODE.JMP:
                pc = HEAP32[pc+1];
                continue;
            case BYTECODE.DEBUGGER:
                showDebuggingStats();
                pc = pc + 1;
                break;
            case BYTECODE.END:
                return;
                break;





            case BYTECODE.REFERENCE:
                r0 = ptr;

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



            default:
                throwUnknownByteCode();
                return;
        }

        if (STACKTOP >= MEMORY.byteLength - 128) {
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
function initRuntime(numGlobalLocalVars) {
    stack = new Int32Array(MEMORY, STACKTOP);
    STACKTOP += 4096 * 16;

    frames = new Int32Array(MEMORY, STACKTOP);
    var frameStart = STACKTOP;
    STACKTOP += 4096 * 16;

    fp = 0;
    frame = frames[fp] = ExecutionRecord();
}

function allocateLocalVars(numVars) {
    var ptr = STACKTOP >> 2;
    STACKTOP += numVars * 4;
    return ptr;
}
function allocateRegisters(numRegs) {
    var ptr = STACKTOP >> 2;
    numRegs = numRegs|0;
    STACKTOP += numRegs * 4;
    return ptr;
}

function ExecutionRecord(numVars, numRegs, outer) {
    numVars = numVars|0;
    numRegs = numRegs|0;
    var ptr = STACKTOP >> 2;
    STACKTOP += 16;
    HEAP32[0] = BYTECODE.CALLCONTEXT;
    HEAP32[1] = allocateLocalVars(numVars);
    HEAP32[2] = allocateRegisters(numRegs);
    //HEAP32[4] = getPtr(realm.globalThis);
    //HEAP32[5] = getPtr(realm.globalEnv);
    //HEAP32[6] =
    return ptr;
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

/**


 These function should set registers like "extern" functions do
 and return "void" instead of returning the pointer
 */


function isAbrupt(ptr) {
    switch(HEAP32[ptr]) {
        case BYTECODE.THROWCOMPLETION:
        case BYTECODE.BREAKCOMPLETION:
        case BYTECODE.CONTINUECOMPLETION:
        case BYTECODE.RETURNCOMPLETION:
            return true;
        default:
            return false;
    }
}

function ifAbrupt(ptr) {
    switch(HEAP32[ptr]) {
        case BYTECODE.THROWCOMPLETION:
        case BYTECODE.BREAKCOMPLETION:
        case BYTECODE.CONTINUECOMPLETION:
        case BYTECODE.RETURNCOMPLETION:
            return ptr;
        default:
            return HEAP32[ptr+1];	// [0] = COMPLTYPE [1] VALUE PTR
    }
}

function RunUnit(unit, realm) {
    if (realm === undefined) {
        realm = CreateRealm();
    }
    initRuntime();
    pc = PROGSTART;
    main();
    if (isAbrupt(r0=ifAbrupt(r0))) return r0;
    return r0;
}
function CompileAndRun(realm, src) {
    var ast;
    try {ast = parse(src)} catch (ex) {return newSyntaxError(ex.message)}
    var unit = compileUnit(ast);
    return RunUnit(unit, realm)
}

exports.CompileAndRun = CompileAndRun;
exports.RunUnit = RunUnit;

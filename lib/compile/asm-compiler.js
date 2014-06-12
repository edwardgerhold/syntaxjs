



/**
 * Created by root on 01.06.14.
 */
function debug(str) {
    console.log(str)
}


var varNum;
var currentScope;
var varMap;
var varMapNum;
function mapVariable(name) {
    varMap[name] = ++varNum;
    varMapNum[varNum] = name;
}
function newScope(current) {
    varMap=Object.create(null);
    varNum=0;
    currentScope = current;
}



function jmp(target) {

    if (target === undefined) return;       // simplified (returns if not needed)
    var ptr = STACKTOP >> 2;                // actual position
    HEAP32[ptr]   = BYTECODE.JMP;           // a jump
    HEAP32[ptr+1] = target;                 // to offset passed
    STACKTOP += 8;
    debug("compiling jump at "+ptr+" to "+target);

    return ptr;
}



function addToConstantPool(value) {
    var poolIndex;
    if (poolIndex=DUPEPOOL[value]) return poolIndex;
    return POOL.push(value) - 1;
}
function identifier (node) {
    var poolIndex = addToConstantPool(node.name);
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.IDNAMECONST;
    HEAP32[ptr+1] = poolIndex;
    STACKTOP += 8;
    return ptr;
}
function identifierReference(name, base, strict, thisValue) {
    var ptr = STACKTOP >> 2;
    STACKTOP += 20;
    HEAP32[ptr] = BYTECODE.IDENTIFIERREFERENCE;
    HEAP32[ptr+1] = name;
    HEAP32[ptr+2] = base;
    HEAP32[ptr+3] = strict;
    HEAP32[ptr+4] = thisValue;
}
function numericLiteralPool (node) {
    var poolIndex = addToConstantPool(node.value);
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = NUMCONST;
    HEAP32[ptr+1] = poolIndex;
    STACKTOP += 8;
    return ptr;
}
function numericLiteral(node) {
    var value = node.computed;
    if (value === undefined) value = +node.value;
    return NumberPrimitiveType(value);	// This function WRITES to the HEAP
}
function stringLiteral(node) {
    var str = node.computed;
    if (str === undefined) str = str.slice(1, str.length-2);
    return StringPrimitiveType(str);	// This WRITES to the HEAP
}
function stringLiteralPool (node) {
    var str = node.computed;
    if (str === undefined) str = str.slice(1, str.length-2);
    return ConstantPoolStringPrimitiveType(str);
}
function booleanLiteral(node) {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.BOOLEAN;
    HEAP32[ptr+1] = (node.value === "true") ? 1 : 0;
    STACKTOP += 8;
    return ptr;
}

function expressionStatement(node, next) {
    return compile(node.expression, next);
}

function parenthesizedExpression(node, next) {
    return compile(node.expression, next);
}

function sequenceExpression(node, nextAddr) {   // no code, i take the result of the last in the code where i compiled it. i think that works
    var len = node.sequence.length;
    var ptr = STACKTOP >> 2;
    for (var i = 0; i < len; i++) {
        nextAddr = compile(node.sequence[i], nextAddr);
    }
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
function binaryExpression(node, nextAddr) {
    var ptr = STACKTOP >> 2;
    var code;
    switch (node.operator) {
        case "==": code = BYTECODE.EQ; break;
        case "===":code = BYTECODE.SEQ; break;
        case "!=": code = BYTECODE.NEQ; break;
        case "!==":code = BYTECODE.SNEQ; break;
        case "+": code = BYTECODE.ADD; break;
        case "-":code = BYTECODE.SUB; break;
        case "*":code = BYTECODE.MUL; break;
        case "/":code = BYTECODE.DIV; break;
        case "%":code = BYTECODE.MOD; break;
        case "<<":code = BYTECODE.SHL; break;
        case ">>":code = BYTECODE.SHR; break;
        case "|":code = BYTECODE.OR; break;
        case "&":code = BYTECODE.AND; break;
        case "&&":code = BYTECODE.LOGOR; break;
        case "||":code = BYTECODE.LOGAND; break;
        case "<":code =  BYTECODE.LT; break;
        case ">":code =  BYTECODE.GT; break;
        case ">=":code = BYTECODE.GTEQ; break;
        case "<=":code = BYTECODE.LTEQ; break;
            break;
    }
    HEAP32[ptr] = code;

    if (nextAddr!==undefined) jmp(nextAddr);
    return ptr;
}

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
function callExpression(node) {
    var ptr = STACKTOP >> 2;
    return ptr;
}
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
    newScope(ptr);
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
    var ptr = STACKTOP >> 2;ugger
    HEAP32[ptr] = BYTECODE.CONTINUECOMP;
    HEAP32[ptr+1] = LABELS[node.label];
    return ptr;
}
function debuggerStatement(node, next) {
    var ptr = STACKTOP >> 2;
    STACKTOP += 4;
    HEAP32[ptr] = BYTECODE.DEBUGGER;
    debug("compiling debugger to "+ptr);
    jmp(next);
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

// todo: is compiling backwards
function program(node) {
    var body = node.body;
    var strict = !!node.strict;
    var len = body.length;
    var nextBlockAddr = lastBlock();
    var ptr = STACKTOP >> 2;
    newScope(ptr);
    for (var i = body.length-1; i >= 0; i--) {
        debug("compiling program item "+i)
        nextBlockAddr = compile(body[i], nextBlockAddr);
    }
    jmp(nextBlockAddr);
    return nextBlockAddr;
}


function lastBlock() {
    var ptr = STACKTOP >> 2;
    STACKTOP += 4;
    HEAP32[ptr] = BYTECODE.END;
    debug("compiling BYTECODE.END to "+ptr)
    return ptr;
}

function compile(ast, next) {
    if (!ast) return -1;
    switch (ast.type) {
        case "StringLiteral":           return stringLiteral(ast, next);
        case "Identifier":              return identifier(ast, next);
        case "NumericLiteral":          return numericLiteral(ast, next);
        case "Program":                 return program(ast, next);
        case "BooleanLiteral":          return booleanLiteral(ast, next);
        case "ExpressionStatement":     return expressionStatement(ast, next);
        case "AssignmentExpression":    return assignmentExpression(ast, next);
        case "BinaryExpression":        return binaryExpression(ast, next);
        case "CallExpression":          return callExpression(ast, next);
        case "NewExpression":           return newExpression(ast, next);
        case "ReturnStatement":         return returnStatement(ast, next);
        case "ParenthesizedExpression": return parenthesizedExpression(ast, next);
        case "SequenceExpression":      return sequenceExpression(ast, next);
        case "UnaryExpression":         return unaryExpression(ast, next);
        case "IfStatement":             return ifStatement(ast, next);
        case "BlockStatement":          return blockStatement(ast, next);
        case "WhileStatement":          return whileStatement(ast, next);
        case "DoWhileStatement":        return doWhileStatement(ast, next);
        case "FunctionDeclaration":     return functionDeclaration(ast, next);
        case "VariableDeclaration":     return variableDeclaration(ast, next);
        case "ObjectExpression":        return objectExpression(ast, next);
        case "PropertyDefinition":      return propertyDefinition(ast, next);
        case "ArrayExpression":         return arrayExpression(ast, next);
        case "Elision":                 return elision(ast, next);
        case "SwitchStatement":         return switchStatement(ast, next);
        case "SwitchCase":              return switchCase(ast, next);
        case "DefaultCase":             return defaultCase(ast, next);
        case "TryStatement":            return tryStatement(ast, next);
        case "CatchClause":             return catchClause(ast, next);
        case "Finally":                 return finally_(ast, next);
        case "ForStatement":            return forStatement(ast, next);
        case "ForInStatement":
        case "ForOfStatement":          return forInOfStatement(ast, next);
        case "ModuleDeclaration":       return moduleDeclaration(ast, next);
        case "ImportStatement":         return importStatement(ast, next);
        case "ExportStatement":         return exportStatement(ast, next);
        case "ThrowStatement":          return throwStatement(ast, next);
        case "BreakStatement":          return breakStatement(ast, next);
        case "ContinueStatement":       return continueStatement(ast, next);
        case "DebuggerStatement":       return debuggerStatement(ast, next);
        case "LabelledStatement":        return labelledStatement(ast, next);
        default:
            throw new TypeError(format("NO_COMPILER_FOR_S", ast && ast.type));
    }
}

function getEmptyUnit() {
    var oldUnit = get();
    init();
    var newUnit = get();
    set(oldUnit);
    return newUnit;
}


function compileUnit(ast, next) {
    init(DEFAULT_SIZE); // invent a good guess and a resize for the emergency case
    PROGSTART = compile(ast, next);
    return get();
}

exports.compileUnit = compileUnit;
exports.getEmptyUnit = getEmptyUnit;


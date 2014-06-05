/**
 * Created by root on 01.06.14.
 */


var varNum;
var currentScope;
var varMap;
function mapVariable(name) {
    varmap[name] = ++varNum;
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
    HEAP32[ptr] = BYTECODE.IDENTIFIERREFERENCE;
    HEAP32[ptr+1] = 0;
    HEAP32[ptr+2] = 0;
    HEAP32[ptr+3] = 0;
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
    return NumberPrimitiveType(value);
}
function stringLiteral(node) {
    var str = node.computed;
    if (str === undefined) str = str.slice(1, str.length-2);
    return StringPrimitiveType(str);
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
function program(node) {
    var body = node.body;
    var strict = !!node.strict;
    var len = body.length;
    var nextBlockAddr = lastBlock();

    newScope(ptr);

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

function getEmptyUnit() {
    var oldUnit = get();
    init();
    var newUnit = get();
    set(oldUnit);
    return newUnit;
}

function compileUnit(ast) {
    init(DEFAULT_SIZE); // invent a good guess and a resize for the emergency case
    compile(ast);
    return get();
}

exports.compileUnit = compileUnit;
exports.getEmptyUnit = getEmptyUnit;


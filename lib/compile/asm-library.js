/*
 got to split this into multiple include files,
 like before.
 */

function hasInternalSlot() {
}

function callInternalSlot() {
}

function getInternalSlot() {
}

function setInternalSlot() {
}

var REALM_TYPE = 0;
var REALM_INTR = 1;

function CodeRealm() {
}

function Intrinsics() {
}

/*
 object field access
 */
var OBJ_TYPE = 0;
var OBJ_FLAGS = 1;
/*
 execution context fields
 */
var CTX_RETADDR = 0;
var CTX_GTHIS = 1;
var CTX_GENV = 2;
var CTX_GENERATOR = 3;
var CTX_REALM = 4;
var CTX_VARENV = 5;
var CTX_LEXENV = 6;
var CTX_OUTER = 7;
var CTX_SIZEOF = 8 * 4;
/*
 environment record fields
 */
var ENV_TYPE = 0;
var ENV_FLAGS = 1;
var ENV_DYN_MAP = 2;
var ENV_SLOTS = 3;
var ENV_SIZEOF = 4 * 4;
/*
 binding record fields
 */
var BINDING_TYPE = 0;
var BINDING_FLAGS = 1;
var BINDING_KEY = 3;
var BINDING_VALUE = 4;
var BINDING_SIZEOF = 4 * 4;
/*
 property descriptor fields
 */
var PROP_TYPE = 0;
var PROP_FLAGS = 1;
var PROP_KEY = 2;
var PROP_VALUE = 3;
var PROP_GET = 3;
var PROP_SET = 4;
var PROP_SIZEOF = 4 * 4;
/**
 *
 *  Data Structures
 *  Objects, Functions, Environments
 *  Callstack,
 */

/**** I need the functions already in the compiler, so i should move them out, like into asm-bytecode.js or asm-api.js **/

function SymbolPrimitiveType(desc) {
    var ptr = STACKTOP >> 2;
    STACKTOP += 8;
    HEAP32[ptr] = BYTECODE.SYMBOL;
    HEAP32[ptr + 1] = StringPrimitiveType(desc);
    return ptr;
}


function pointsToString(points)  {
    return String.fromCharCode.apply(undefined, points);
}

function StringPrimitiveType(str) {
    // It is creating a uint16 array of codepoints after a bytecode.string
    // and a length value, the string is immutable, changing means to create
    // a new string somewhere else in memory

    var strLen = str.length;
    var realLen = 0;
    var ptr16 = (ptr + 1) << 1;
    var i = 0;
    var cp1, cp2;
    var ptr = STACKTOP >> 2;

    HEAP32[ptr] = BYTECODE.STRING;

    while (i < strLen) {
        cp1 = str[i].charCodeAt(0);
        HEAP32[ptr16 + i] = cp1;
        if (cp1 >= 0xD800 && cp1 <= 0xD8FF) {
            cp2 = str[i].charCodeAt(1);
            strLen = strLen + 1;
            i = i + 1;
            HEAP32[ptr16 + i] = cp2;
        }
        i = i + 1;
    }

    HEAP32[ptr + 1] = strLen;

    STACKTOP += 8 + Math.ceil(strLen / 2) * 4;
    return ptr;
}

function ConstantPoolStringPrimitiveType(str) {
    /*
     this is also a string primitive type
     but the string itself is unencoded in the
     constant pool
     */
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.STRINGCONST;
    HEAP32[ptr + 1] = addToConstantPool(str);
    return ptr;
}

function ConstantPoolNumberPrimitiveType(v) {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.NUMBERCONST;
    HEAP32[ptr + 1] = addToConstantPool(v);
    return ptr;
}

function NumberPrimitiveType(v) {       // kann man zentral aendern
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.NUMBER;         // F32 is lossless??? it´s untested that´s why its here
    HEAPF32[ptr + 1] = v >> 32;           // schneide unteren Teil ab
    HEAPF32[ptr + 2] = v & 0xFFFFFFFF;    // Maskiere oberen Teil weg?
    STACKTOP += 12;                     // F64 needs alignment. I´ve never tried to merge two F32. 8*I8 to F64 fails of course.
    return ptr;
}

function BooleanPrimitiveType(v) {
    var ptr = STACKTOP >> 2;
    STACKTOP += 8;
    HEAP32[ptr] = BYTECODE.BOOLEAN;
    HEAP32[ptr + 1] = (+(!!v));
    return ptr;
}

function NullPrimitiveType() {
    var ptr = STACKTOP >> 2;
    STACKTOP += 4;
    HEAP32[ptr] = BYTECODE.NULL;
    return ptr;
}

function UndefinedPrimitiveType() {
    var ptr = STACKTOP >> 2;
    STACKTOP += 4;
    HEAP32[ptr] = BYTECODE.UNDEFINED;
    return ptr;
}

function allocateProperties(n) {
    var ptr = STACKTOP >> 2;
    STACKTOP += n * 4;
    return ptr;
}

function OrdinaryObject() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.OBJECT;
    HEAP32[ptr + 1] = 0;  // TYPE ORDINARY (klärt slots)
    HEAP32[ptr + 2] = allocateProperties(10);
    STACKTOP += 8;
    return ptr;
}

function OrdinaryFunction() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.OBJECT;
    HEAP32[ptr + 1] = 0;
    STACKTOP += 8;
    return ptr;
}

function ArrayExoticObject() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.OBJECT;
    HEAP32[ptr + 1] = 0;
    STACKTOP += 8;
    return ptr;
}


/**
 * BYTECODE.BINDING
 * FLAGS
 * ptr VALUE
 * ptr key
 * @constructor
 */
function BindingRecord(v, c, i) {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.BINDINGRECORD;
    var flags = 0;
    if (c) flags |= FLAGS.CONFIGURABLE;
    if (i) flags |= FLAGS.INITIALIZED;
    if (k) flags |= FLAGS.KEY;
    HEAP32[ptr + 1] = flags;
    HEAP32[ptr + 2] = v;
    if (k) HEAP32[ptr + 3] = k;
    return ptr;
}

/**
 * BYTECODE.DATADESC // BYTECODE.ACCESSORDESC
 * FLAGS (conf, write, enum)
 * ptr VALUE | ptr GET
 *             ptr SET
 * ptr key
 * @constructor
 */

function DataPropertyDescriptor(c, e, v, w, k) {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.DATADESCRIPTOR;
    var flags = 0;
    if (c) flags |= FLAGS.CONFIGURABLE;
    if (e) flags |= FLAGS.ENUMERABLE;
    if (w) flags |= FLAGS.WRITABLE;
    if (k) flags |= FLAGS.KEY;
    HEAP32[ptr + 1] = flags;
    HEAP32[ptr + 2] = v;
    if (k) HEAP32[ptr + 3] = k;
    return ptr;
}


function AccessorPropertyDescriptor(c, e, g, s, k) {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.ACCESSORDESCRIPTOR;
    var flags = 0;
    if (c) flags |= FLAGS.CONFIGURABLE;
    if (e) flags |= FLAGS.ENUMERABLE;
    if (k) flags |= FLAGS.KEY;
    HEAP32[ptr + 1] = flags;
    HEAP32[ptr + 2] = g | 0;
    HEAP32[ptr + 3] = s | 0;
    if (k) HEAP32[ptr + 4] = k;
    return ptr;
}


function DeclarativeRecord() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.LOCALREC;   // Kenne funktionstabelle durch den typen
    return ptr;
}

function ObjectRecord() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.OBJECTREC;
    return ptr;
}


function FunctionRecord() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.FUNCTIONREC;
    return ptr;
}


function FR_CreateMutableBinding() {}
function FR_CreateImmutableBinding() {}
function FR_HasBinding() {}
function FR_DeleteBinding() {}
function FR_SetMutableBinding() {}
function FR_GetBindingValue() {}


function GlobalRecord() {
    var ptr = STACKTOP >> 2;
    HEAP32[ptr] = BYTECODE.GLOBALREC;
    return ptr;
}



function GR_CreateMutableBinding() {}
function GR_CreateImmutableBinding() {}
function GR_HasBinding() {}
function GR_DeleteBinding() {}
function GR_SetMutableBinding() {}
function GR_GetBindingValue() {}


/*
 next is the function table for environment records.
 a typed array with numbers to array indices of these functions
 can be generated from. whether it´s necessary, nicer, cleverer
 or not, gotta find out, by trying it out, what´s better to maintain.




 */


var RecordFunctions = {
    // Declarative Record

    // Object Record

    // Function Record
    FR_CreateMutableBinding: FR_CreateMutableBinding,
    FR_CreateImmutableBinding: FR_CreateImmutableBinding,
    FR_HasBinding: FR_HasBinding,

    // Global Record
    GR_CreateMutableBinding: GR_CreateMutableBinding,
    GR_CreateImmutableBinding: GR_CreateImmutableBinding,
    GR_HasBinding: GR_HasBinding,
};



var FunctionTable = [

    FR_CreateMutableBinding,
    FR_CreateImmutableBinding,
    FR_HasBinding

];



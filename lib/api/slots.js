/**
* Created by root on 18.04.14.
*/
/*
    HOW TO?
    COLLECT IN THE OTHER FILES THE SLOTNAMES IN SOME OBJECT
    THEN MOVE THE SLOTS HERE
    (same name on other object gets same slot index for it later)

 */

var SLOTS = Object.create(null);

SLOTS.GET = "Get"; // x
SLOTS.SET = "Set"; // x
SLOTS.DEFINEOWNPROPERTY = "DefineOwnProperty"; // x
SLOTS.GETOWNPROPERTY = "GetOwnProperty";
SLOTS.OWNPROPERTYKEYS = "OwnPropertyKeys";
SLOTS.ENUMERATE = "Enumerate";
SLOTS.GETPROTOTYPEOF = "GetPrototypeOf"; // x
SLOTS.SETPROTOTYPEOF = "SetPrototypeOf"; // x
SLOTS.PROTOTYPE = "Prototype";
SLOTS.EXTENSIBLE = "Extensible";
SLOTS.INVOKE = "Invoke";
SLOTS.HASPROPERTY = "HasProperty";
SLOTS.ISEXTENSIBLE = "IsExtensible";
SLOTS.BINDINGS = "Bindings";
SLOTS.SYMBOLS = "Symbols";

SLOTS.CODE = "Code";    // in use
SLOTS.CALL = "Call";    // ok
SLOTS.CONSTRUCT = "Construct"; // ok
SLOTS.FORMALPARAMETERS = "FormalParameters"; // ok
SLOTS.THISMODE = "ThisMode"; // ok
SLOTS.STRICT = "Strict";    // ok
SLOTS.FUNCTIONKIND = "FunctionKind";
SLOTS.NEEDSSUPER = "NeedsSuper";
SLOTS.HOMEOBJECT = "HomeObject";
SLOTS.METHODNAME = "MethodName";
SLOTS.ENVIRONMENT = "Environment"

SLOTS.BOUNDTHIS = "BoundThis";
SLOTS.BOUNDTARGETFUNCTION = "BoundTargetFunction";
SLOTS.BOUNDARGUMENTS = "BoundArguments";

SLOTS.NUMBERDATA = "NumberData";
SLOTS.STRINGDATA = "StringData";
SLOTS.BOOLEANDATA = "BooleanData";
SLOTS.SYMBOLDATA = "SymbolData";

SLOTS.DESCRIPTION = "Description";
SLOTS.ARRAYBUFFERDATA = "ArrayBufferData";
SLOTS.TYPEDARRAYNAME = "TypedArrayName";
SLOTS.TYPEDARRAYCONSTRUCTOR = "TypedArrayConstructor";
SLOTS.BYTELENGTH = "ByteLength";
SLOTS.BYTEOFFSET = "ByteOffset";

// proxyexoticobjects.js the first to use them.
SLOTS.PROXYTARGET = "ProxyTarget";
SLOTS.PROXYHANDLER = "ProxyHandler";


Object.freeze(SLOTS);
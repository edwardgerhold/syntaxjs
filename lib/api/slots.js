/**
* Created by root on 18.04.14.
*/


var SLOTS = Object.create(null);

SLOTS.GET = "Get"; // x
SLOTS.SET = "Set"; // x
SLOTS.DEFINEOWNPROPERTY = "DefineOwnProperty"; // x
SLOTS.GETOWNPROPERTY = "GetOwnProperty";
SLOTS.OWNPROPERTYKEYS = "OwnPropertyKeys";
SLOTS.ENUMERATE = "Enumerate"; // x
SLOTS.GETPROTOTYPEOF = "GetPrototypeOf"; // x
SLOTS.SETPROTOTYPEOF = "SetPrototypeOf"; // x
SLOTS.PROTOTYPE = "Prototype"; // x
SLOTS.EXTENSIBLE = "Extensible"; // x
SLOTS.INVOKE = "Invoke"; // x
SLOTS.HASPROPERTY = "HasProperty"; // x
SLOTS.ISEXTENSIBLE = "IsExtensible"; //x
SLOTS.BINDINGS = "Bindings";
SLOTS.SYMBOLS = "Symbols";

SLOTS.CODE = "Code";    // in use
SLOTS.CALL = "Call";    // ok
SLOTS.CONSTRUCT = "Construct"; // ok
SLOTS.FORMALPARAMETERS = "FormalParameters"; // ok
SLOTS.THISMODE = "ThisMode"; // ok
SLOTS.STRICT = "Strict";    // ok
SLOTS.FUNCTIONKIND = "FunctionKind"; // x
SLOTS.NEEDSSUPER = "NeedsSuper"; // x
SLOTS.HOMEOBJECT = "HomeObject"; // x
SLOTS.METHODNAME = "MethodName"; // x
SLOTS.ENVIRONMENT = "Environment"; // x

SLOTS.BOUNDTHIS = "BoundThis";  // x
SLOTS.BOUNDTARGETFUNCTION = "BoundTargetFunction";  // x
SLOTS.BOUNDARGUMENTS = "BoundArguments";    // x

SLOTS.NUMBERDATA = "NumberData"; //x
SLOTS.STRINGDATA = "StringData"; //x
SLOTS.BOOLEANDATA = "BooleanData"; //y
SLOTS.SYMBOLDATA = "SymbolData";//y

SLOTS.DESCRIPTION = "Description";
SLOTS.ARRAYBUFFERDATA = "ArrayBufferData";
SLOTS.TYPEDARRAYNAME = "TypedArrayName";
SLOTS.TYPEDARRAYCONSTRUCTOR = "TypedArrayConstructor";
SLOTS.BYTELENGTH = "ByteLength";
SLOTS.BYTEOFFSET = "ByteOffset";
SLOTS.ARRAYLENGTH = "ArrayLength";

SLOTS.ARRAYBUFFERBYTELENGTH = "ArrayBufferByteLength"
SLOTS.ARRAYINITIALISATIONSTATE = "ArrayInitialisationState";//x

// proxyexoticobjects.js the first to use them.
SLOTS.PROXYTARGET = "ProxyTarget"; // x
SLOTS.PROXYHANDLER = "ProxyHandler"; // x
SLOTS.LOADERRECORD = "LoaderRecord"; // x

SLOTS.DATAVIEW = "DataView"; //x

Object.freeze(SLOTS);
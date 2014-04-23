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
SLOTS.GET = "Get";
SLOTS.SET = "Set";
SLOTS.DEFINEOWNPROPERTY = "DefineOwnProperty";
SLOTS.GETOWNPROPERTY = "GetOwnProperty";
SLOTS.OWNPROPERTYKEYS = "OwnPropertyKeys";
SLOTS.ENUMERATE = "Enumerate";
SLOTS.CALL = "Call";
SLOTS.CONSTRUCT = "Construct";
SLOTS.INVOKE = "Invoke";
SLOTS.HASPROPERTY = "HasProperty";
SLOTS.ISEXTENSIBLE = "IsExtensible";
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

SLOTS.PROTOTYPE = "Prototype";
SLOTS.EXTENSIBLE = "Extensible";

SLOTS.BINDINGS = "Bindings";    // Slots for my property tables
SLOTS.SYMBOLS = "Symbols";      // Will even hold for in typed memory (need a new hash there anyways)




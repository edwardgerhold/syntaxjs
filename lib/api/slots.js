var SLOTS = Object.create(null);
// Object Properties
SLOTS.BINDINGS = "Bindings";
SLOTS.SYMBOLS = "Symbols";
// Objects
SLOTS.PROTOTYPE = "Prototype";
SLOTS.EXTENSIBLE = "Extensible";
SLOTS.GET = "Get";
SLOTS.SET = "Set";
SLOTS.DEFINEOWNPROPERTY = "DefineOwnProperty";
SLOTS.GETOWNPROPERTY = "GetOwnProperty";
SLOTS.OWNPROPERTYKEYS = "OwnPropertyKeys";
SLOTS.ENUMERATE = "Enumerate";
SLOTS.GETPROTOTYPEOF = "GetPrototypeOf";
SLOTS.SETPROTOTYPEOF = "SetPrototypeOf";
SLOTS.INVOKE = "Invoke";
SLOTS.HASPROPERTY = "HasProperty";
SLOTS.ISEXTENSIBLE = "IsExtensible";
SLOTS.INTEGRITY = "Integrity";
// Arguments
SLOTS.PARAMETERMAP = "ParameterMap";
// Functions
SLOTS.CODE = "Code";
SLOTS.CALL = "Call";
SLOTS.CONSTRUCT = "Construct";
SLOTS.FORMALPARAMETERS = "FormalParameters";
SLOTS.THISMODE = "ThisMode";
SLOTS.STRICT = "Strict";
SLOTS.FUNCTIONKIND = "FunctionKind";
SLOTS.NEEDSSUPER = "NeedsSuper";
SLOTS.HOMEOBJECT = "HomeObject";
SLOTS.METHODNAME = "MethodName";
SLOTS.ENVIRONMENT = "Environment";
// Bound Functions
SLOTS.BOUNDTHIS = "BoundThis";
SLOTS.BOUNDTARGETFUNCTION = "BoundTargetFunction";
SLOTS.BOUNDARGUMENTS = "BoundArguments";
// Primitive Types
SLOTS.NUMBERDATA = "NumberData";
// Str
SLOTS.STRINGDATA = "StringData";
SLOTS.ITERATEDSTRING = "IteratedString";
SLOTS.ITERATIONKIND = "IterationKind";
SLOTS.ITERATORNEXTINDEX = "IteratorNextIndex";
SLOTS.BOOLEANDATA = "BooleanData";
// own listiterator
SLOTS.ITERATEDLIST = "IteratedList";
// Symbol
SLOTS.ES5ID = "es5id";
SLOTS.SYMBOLDATA = "SymbolData";
SLOTS.DESCRIPTION = "Description";
// ArrayBuffer, TypedArray, DataView Slots
SLOTS.ARRAYBUFFERDATA = "ArrayBufferData";
SLOTS.TYPEDARRAYNAME = "TypedArrayName";
SLOTS.TYPEDARRAYCONSTRUCTOR = "TypedArrayConstructor";
SLOTS.BYTELENGTH = "ByteLength";
SLOTS.BYTEOFFSET = "ByteOffset";
SLOTS.ARRAYLENGTH = "ArrayLength";
SLOTS.DATAVIEW = "DataView";
SLOTS.ARRAYBUFFERBYTELENGTH = "ArrayBufferByteLength";
SLOTS.VIEWEDARRAYBUFFER = "ViewedArrayBuffer";
// Array Slots
SLOTS.ARRAYINITIALISATIONSTATE = "ArrayInitialisationState";
SLOTS.ITERATEDOBJECT = "IteratedObject";
SLOTS.ARRAYITERATIONNEXTINDEX = "ArrayIterationNextIndex";
SLOTS.ARRAYITERATIONKIND = "ArrayIterationKind";
// Proxy Slots (first replaced)
SLOTS.PROXYTARGET = "ProxyTarget";
SLOTS.PROXYHANDLER = "ProxyHandler";
SLOTS.REVOKABLEPROXY = "RevokableProxy";
// SetIterator Slots
SLOTS.ITERATEDSET = "IteratedSet";
SLOTS.SETNEXTINDEX = "SetNextIndex";
SLOTS.SETITERATIONKIND = "SetIterationKind";
// Promise Slots
SLOTS.PROMISESTATE = "PromiseState";
SLOTS.PROMISERESULT = "PromiseResult";
SLOTS.PROMISEREJECTREACTIONS = "PromiseRejectReactions";
SLOTS.PROMISERESOLVEREACTIONS = "PromiseResolveReactions";
SLOTS.INDEX = "Index";
SLOTS.VALUES = "Values";
SLOTS.CAPABILITY = "Capability";
SLOTS.REMAININGELEMENTS = "RemainingElements";
SLOTS.FULFILLMENTHANDLER = "FulfillmentHandler";
SLOTS.REJECTIONHANDLER = "RejectionHandler";
SLOTS.PROMISE = "Promise";
SLOTS.ALREADYRESOLVED = "AlreadyResolved";
SLOTS.PROMISECONSTRUCTOR = "PromiseConstructor";
// Loader Slots
SLOTS.LOADERRECORD = "LoaderRecord";
SLOTS.LOADER = "Loader";
SLOTS.LOAD = "Load";
SLOTS.LOADERITERATIONKIND = "LoaderIterationKind";
SLOTS.LOADERNEXTINDEX = "LoaderNextIndex";
SLOTS.REQUEST = "Request";
SLOTS.REFERERADDRESS = "RefererAddress";
SLOTS.REFERERNAME = "RefererName";
// RegExp Slots
SLOTS.REGEXPMATCHER = "RegExpMatcher";
SLOTS.ORIGINALSOURCE = "OriginalSource";
SLOTS.ORIGINALFLAGS = "OriginalFlags";
// Date
SLOTS.DATEVALUE = "DateValue";
// JSON
SLOTS.JSONTAG = "JSONTag";
// Math
SLOTS.MATHTAG = "MathTag";
// Set
SLOTS.SETDATA = "SetData";
SLOTS.SETCOMPARATOR = "SetComparator";
// key for objects in map and set
SLOTS.UNIQUEMAPANDSETES5KEY = "UniqueMapAndSetES5Key";
// Map
SLOTS.MAPDATA = "MapData";
SLOTS.MAPCOMPARATOR = "MapComparator";
SLOTS.MAP = "Map";
SLOTS.MAPNEXTINDEX = "MapNextIndex";
SLOTS.MAPITERATIONKIND = "MapIterationKind";
// Realm
SLOTS.REALM = "Realm";
SLOTS.REALMRECORD = "RealmRecord";
// observe
SLOTS.NOTIFIER = "Notifier";
SLOTS.CHANGEOBSERVERS = "ChangeObservers";
SLOTS.ACTIVECHANGES = "ActiveChanges";
SLOTS.TARGET = "Target";
SLOTS.PENDINGCHANGERECORDS = "PendingChangeRecords";
// Generator
SLOTS.GENERATORCONTEXT = "GeneratorContext";
SLOTS.GENERATORSTATE = "GeneratorState";
// Emitter
SLOTS.EVENTLISTENERS = "EventListeners";
// StructTypes
SLOTS.TYPEDESCRIPTOR = "TypeDescriptor";
SLOTS.OPACITY = "Opacity";
SLOTS.STRUCTURE = "Structure";
SLOTS.DIMENSIONS = "Dimensions";
SLOTS.RANK = "Rank";
SLOTS.ARRAYDESCRIPTOR = "ArrayDescriptor";
SLOTS.OPAQUEDESCRIPTOR = "OpaqueDescriptor";
// Structured Clones
SLOTS.TRANSFER = "Transfer";
SLOTS.ONSUCCESSTRANSFER = "OnSuccessTransfer";
SLOTS.WRAPPEDOBJECT = "WrappedObject";
SLOTS.NATIVETHIS    = "NativeThis"
// Ecma 402 Intl API
SLOTS.AVAILABLELOCALES = "availableLocales";
SLOTS.RELEVANTEXTENSIONKEYS = "relevantExtensionKeys";
SLOTS.SORTLOCALEDATA = "sortLocaleData";
SLOTS.INITIALIZEDINTLOBJECT = "initializedIntlObject";
// compound iterator
SLOTS.ITERATOR1 = "Iterator1";
SLOTS.ITERATOR2 = "Iterator2";
SLOTS.STATE = "State";

Object.freeze(SLOTS); // DOES A FREEZE HELP OPTIMIZING? The pointers can´t change anymore, or?

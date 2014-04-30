function Push(array, data) {
    return array.push(data);
}
function Length(array) {
    return array.length;
}
function getField(array, index) {
    return array[index];
}
function setField(array, index, value) {
    return array[index] = value;
}
function getRec(obj, key) {
    return obj[key];
}
function setRec(obj, key, value) {
    return obj[key] = value;
}
function genericArray(arr) {
    return arr;
}

function genericRecord(obj) {
    return obj;
}


function compareInternalSlot(O, N, V) {
    var value = getInternalSlot(O, N);
    return value === V;
}

function getInternalSlot(O, N) {
    return O[N];
}

function setInternalSlot(O, N, V) {
    return O[N] = V;
}

function hasInternalSlot(O, N) {
    return N in O;
}

function callInternalSlot(name, object, a, b, c, d) {
    return object[name](a,b,c,d);
}

//
//
// This table is just the prequel of the original table
// pointing from the typed memory to the object with the native functions
// marked by a "native" flag and an offset into a hashtable with these objects
// the tostrign is simulation and not just slowdown
//

var function_table = {
    __proto__:null,
    "[object OrdinaryObject]": OrdinaryObject.prototype, // rename to ordinaryobjectfunctions and fix (this) parameter and call in callInternalSlot
    "[object ArrayExoticObject]": ArrayExoticObject.prototype,
    "[object OrdinaryFunction]": OrdinaryFunction.prototype,
    "[object ArgumentsExoticObject]": ArgumentsExoticObject.prototype,
    "[object StringExoticObject]": StringExoticObject.prototype,
    "[object ProxyExoticObject]": ProxyExoticObject.prototype,
    "[object PromiseExoticObject]": OrdinaryObject.prototype,
    "[object SymbolPrimitiveType]": SymbolPrimitiveType.prototype,
    "[object EddiesDOMObjectWrapper]": NativeJSObjectWrapper.prototype,
    "[object EddiesDOMFunctionWrapper]": NativeJSFunctionWrapper.prototype,
    "[object IntegerIndexedExoticObject]": IntegerIndexedExoticObject.prototype,
    "[object TypeExoticObject]": TypeExoticObject.prototype,
    "[object TypeDescriptorExoticObject]": TypeDescriptorExoticObject.prototype
};

function getFunction(obj, name) {
    var func;
    console.log("name="+name);
    var proto = function_table[obj.toString()];
    if (proto && (func = proto[name])) return func;
    proto = OrdinaryObject.prototype;
    func = proto[name];
    return func;
}

// ===========================================================================================================
// raw read and write property descriptor (string and symbol assign to bindings/symbol)
// ===========================================================================================================

function readPropertyDescriptor(object, name) {
    if (IsSymbol(name)) {
        return object["Symbols"][name.es5id];
    } else {
        return object["Bindings"][name];
    }
    /*if (IsSymbol(name)) {
     return getInternalSlot(getInternalSlot(object, "Symbols"), getInternalSlot(name,"es5id"));
     } else {
     return getInternalSlot(getInternalSlot(object,"Bindings"),name);
     }*/
}

exports.writePropertyDescriptor = writePropertyDescriptor;

function writePropertyDescriptor(object, name, value) {
    if (IsSymbol(name)) {

        // adding a backref to the symbol
        // value.symbol = name;
        // i can not list them if i don´t (Object.getOwnPropertySymbols)
        // (until i can be sure that globalsymbolregistry got them all)

        return object["Symbols"][name.es5id] = value;

    } else {
        return object["Bindings"][name] = value;
    }
    /*if (IsSymbol(name)) {
     return setInternalSlot(getInternalSlot(object, "Symbols"), getInternalSlot(name,"es5id"),  value);
     } else {
     return setInternalSlot(getInternalSlot(object,"Bindings"), name, value);
     }*/
}




// ===========================================================================================================
//
// Some MakeConstructor like (delete)

function assignConstructorAndPrototype(Function, Prototype) {
    setInternalSlot(Function, "Prototype", Prototype);
    DefineOwnProperty(Function, "prototype", {
        value: Prototype,
        enumerable: false,
        writable: true,
        configurable: true
    });
    DefineOwnProperty(Prototype, "constructor", {
        value: Function,
        enumerable: false,
        writable: true,
        configurable: true
    });
}

// ===========================================================================================================
// assign (copies properties)
// ===========================================================================================================

function addMissingProperties(target, mixin) {
    for (var k in mixin) {
        if (Object.hasOwnProperty.call(mixin, k)) {
            if (!Object.hasOwnProperty.call(target, k)) Object.defineProperty(target, k, Object.getOwnPropertyDescriptor(mixin, k));
        }
    }
    return target;
}

function assign(obj, obj2) {
    for (var k in obj2) {
        obj[k] = obj2[k];
    }
    return obj;
}


// ===========================================================================================================
// LazyDefineProperty (used intermediary)
// ===========================================================================================================

function LazyDefineFalseTrueFalse(O, name, value) {
    return callInternalSlot("DefineOwnProperty", O, name, {
        configurable: false,
        enumerable: true,
        value: value,
        writable: false
    });
}

function LazyDefineBuiltinConstant(O, name, value) {
    return callInternalSlot("DefineOwnProperty", O, name, {
        configurable: false,
        enumerable: false,
        value: value,
        writable: false
    });
}

// noch was vereinfacht
function LazyDefineBuiltinFunction(O, name, arity, fproto, e, w, c) {
    if (e === undefined) e = false;
    if (w === undefined) w = true;
    if (c === undefined) c = true;
    return callInternalSlot("DefineOwnProperty", O, name, {
        configurable: c,
        enumerable: e,
        value: CreateBuiltinFunction(getRealm(),fproto, arity, name),
        writable: w
    });
}

exports.LazyDefineAccessorFunction = LazyDefineAccessorFunction;
function LazyDefineAccessorFunction(O, name, arity, g, s, e, c) {
    if (e === undefined) e = false;
    if (c === undefined) c = true;
    var fname = name;
    if (IsSymbol(name)) fname = "["+(getInternalSlot(name, "Description")||"")+"]";
    return callInternalSlot("DefineOwnProperty", O, name, {
        configurable: c,
        enumerable: e,
        get: g ? CreateBuiltinFunction(getRealm(), g, arity, "get "+fname) : undefined,
        set: s ? CreateBuiltinFunction(getRealm(), s, arity, "set "+fname) : undefined
    });
}

function LazyDefineAccessor(obj, name, g, s, e, c) {
    if (e === undefined) e = false;
    if (c === undefined) c = true;
    return callInternalSlot("DefineOwnProperty", obj, name, {
        configurable: c,
        enumerable: e,
        get: g,
        set: s
    });
}

function LazyDefineProperty(O, P, V, w, e, c) {
    var desc;
    if (w === undefined) w = true;
    if (e === undefined) e = false;
    if (c === undefined) c = true;
    if (IsDataDescriptor(V) || IsAccessorDescriptor(V)) {
        desc = V;
    } else {
        desc = {
            configurable: c,
            enumerable: e,
            value: V,
            writable: w
        };
    }
    //return callInternalSlot("DefineOwnProperty", O, P, desc);
    return OrdinaryDefineOwnProperty(O, P, desc);
}

/*

 getting context. stack, realm
 */




function getContext() {
    var stack = realm.stack;
    return stack[stack.length-1];
}
function getEventQueue() {
    return realm.eventQueue;
}

function getGlobalThis() {
    //return globalThis;
    return realm.globalThis;
}

function getGlobalEnv() {
    //return globalEnv;
    return realm.globalEnv;
}

function getIntrinsics() {
    //return intrinsics;
    return realm.intrinsics;
}

function getIntrinsic(name) {
    var desc = realm.intrinsics.Bindings[name];
    return desc && desc.value;
}

function getIntrinsicFromRealm(name, otherRealm) {
    var desc = otherRealm.intrinsics.Bindings[name];
    return desc && desc.value;
}

function getRealm() {
    return realm;
}

function getLexEnv() {
    var cx = getContext();
    return cx && cx.LexEnv;
    //    return getGlobalEnv().LexEnv;
}

function getVarEnv() {
    var cx = getContext();
    return cx && cx.VarEnv;
    //    return getGlobalEnv().objEnv;
}


function getStack() {
    return realm.stack;
}






// ===========================================================================================================
// Error Stack
// ===========================================================================================================


function printException (error) {
    var name = Get(error, "name");
    var message = Get(error, "message");
    var stack = Get(error, "stack");
    var text = makeMyExceptionText(name, message, callstack);
    console.log(text);
}

function makeMyExceptionText(name, message, callstack) {
    var text = "\n";
    text += "An "+name+" exception was thrown!\n";
    text += "message: '" + message + "'\n";
    text += "callstack: " + callstack + "\n";
    return text;
}

function stringifyErrorStack(type, message) {
    var callStack = getStack();
    var len = callStack.length || 0;
    var frame = getContext();
    var start = 0;
    var node, ntype, line ,column, pos, fn, clr;
    var stackTraceLimit = realm.xs.stackTraceLimit;
    var url = realm.xs.scriptLocation;
    var cnt = 1;

    if (type === undefined) {
        type = ""; message = ""; stack = "";
    } else {
        if (message === undefined) message = "";
        stack = type+": ";
        stack += message;
        stack += "\r\n";
    }

    if (len > stackTraceLimit) start = len - stackTraceLimit;

    for (pos = len - 1; pos >= start; pos--) {
        if (frame = callStack[pos]) {
            node = frame.state.node;
            ntype = node && node.type;
            line = frame.line;
            column = frame.column;
            fn = frame.callee;
            clr = frame.caller;
            stack += cnt + ". ";
            stack += fn + " at " + ntype + "  at line " + line + ", column " + column + " ";
            stack += "[caller " + clr + " @ "+url+"]";
            stack += "\r\n";
            cnt = cnt + 1;
        }
    }
    return stack;
}

function isWindow() {
    return typeof window !== "undefined";
}

function isNode() {
    return typeof process !== "undefined";
}

function isWorker() {
    return typeof importScripts === "function" && !isWindow();
}




/*
 var object_types = {
 "1": "[object OrdinaryObject]",
 "2": "[object ArrayExoticObject]",
 "3": "[object OrdinaryFunction]",
 "4": "[object ArgumentsExoticObject]",
 "5": "[object StringExoticObject]",
 "6": "[object ProxyExoticObject]",
 "7": "[object SymbolPrimitiveType]",
 "8": "[object IndegerIndexedExoticObject]"
 };

 function getType(object) {
 return object_types[object[0]] || "[object OrdinaryObject]";
 }
 var type_table = {
 "1": "object",
 "2": "object",
 "3": "object",
 "4": "object",
 "5": "object",
 "6": "object",
 "7": "symbol"
 };
 var internals_encode = {
 // Objects
 "Type": 0,
 "Extensible": 1,
 "Bindings": 2,
 "Symbols": 3,
 "es5id": 4,
 // Functions
 "FunctionKind": 5,
 "Environment": 6,
 "FormalParameters": 7,
 "Code": 8,
 "HomeObject": 9,
 "MethodName": 10,
 // Bound Functions
 "BoundTargetFunction": 11,
 "BoundThis": 12,
 "BoundParameters": 13,
 // Object Wrappers
 "StringData": 14,
 "NumberData": 14,
 "DateValue": 14,
 "JSONTag": 14,
 "MathTag": 14,
 // Generator
 "GeneratorState": 14,
 "GeneratorContext": 15,
 // Maps
 "MapData": 16,
 "MapComparator": 17,
 "__mapSetInternalUniqueKey__": 18,
 // Promises
 "IsPromise": 19,
 // Observe
 "Notifier": 20
 };

 var internals_decode = Object.create(null);
 for (var k in internals_encode) {
 internals_decode[internals_encode[k]] = k;

 }
 */


/*

 moved up from runtime
 */

var byteCodeMap = {
    "type": 0,
    "body": 1,  // body is always field 0 in the array
    "id": 2,
    "left": 1,
    "right": 2
};
var astCodeMap = {
    "type":"type",
    "body":"body",
    "id":"id",
    "left":"left",
    "right":"right",
    "argument": "argument",
    "computed": "computed"
};
var codeMap = astCodeMap;
function getCode(code, field) {
    if (code) {
        return code[field];
    }
}
function isCodeType(code, type) {
    if (code) {
        return code["type"] === type;
    }
}

exports.getCode = getCode;
exports.isCodeType = isCodeType;
exports.codeMap = codeMap;
exports.astCodeMap = astCodeMap;
exports.byteCodeMap = byteCodeMap;



function makeNativeException (error) {
    if (Type(error) != OBJECT) return error;
    var name = unwrap(Get(error, "name"));
    var message = unwrap(Get(error, "message"));
    var callstack = unwrap(Get(error, "stack"));
    var text = makeMyExceptionText(name, message, callstack);

    var nativeError = new Error(name);
    nativeError.name = name;
    nativeError.message = message;
    nativeError.stack = text;
    return nativeError;
}

exports.makeNativeException = makeNativeException;


function CreateSelfHostingFunction(realm, name, arity, source) {
    var parseGoal = require("parser").parseGoal;

    var fn = parseGoal("FunctionDeclaration", source);
    var F = OrdinaryFunction();
    setInternalSlot("Code", fn.body);
    setInternalSlot("FormalParameters", fn.params);
    setInternalSlot("Realm", realm);
    SetFunctionName(F, name);
    SetFunctionLength(F, arity);
    return F;
}


function LazyDefineSelfHostingFunction(O, name, arity, fproto, e, w, c) {
    if (e === undefined) e = false;
    if (w === undefined) w = true;
    if (c === undefined) c = true;
    return callInternalSlot("DefineOwnProperty", O, name, {
        configurable: c,
        enumerable: e,
        value: CreateSelfHostingFunction(getRealm(), name, arity, fproto),
        writable: w
    });
}

exports.CreateSelfHostingFunction = CreateSelfHostingFunction;
exports.LazyDefineSelfHostingFunction = LazyDefineSelfHostingFunction;

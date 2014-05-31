var DefineOwnProperty = OrdinaryDefineOwnProperty;
var GetOwnProperty = OrdinaryGetOwnProperty;
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
function assignConstructorAndPrototype(Function, Prototype) {
    setInternalSlot(Function, SLOTS.PROTOTYPE, Prototype);
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
function NowDefineFalseTrueFalse(O, name, value) {
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, name, {
        configurable: false,
        enumerable: true,
        value: value,
        writable: false
    });
}
function NowDefineBuiltinConstant(O, name, value) {
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, name, {
        configurable: false,
        enumerable: false,
        value: value,
        writable: false
    });
}
function NowDefineBuiltinFunction(O, name, arity, fproto, e, w, c) {
    if (e === undefined) e = false;
    if (w === undefined) w = true;
    if (c === undefined) c = true;
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, name, {
        configurable: c,
        enumerable: e,
        value: CreateBuiltinFunction(getRealm(),fproto, arity, name),
        writable: w
    });
}
exports.NowDefineAccessorFunction = NowDefineAccessorFunction;
function NowDefineAccessorFunction(O, name, arity, g, s, e, c) {
    if (e === undefined) e = false;
    if (c === undefined) c = true;
    var fname = name;
    if (IsSymbol(name)) fname = "["+(getInternalSlot(name, SLOTS.DESCRIPTION)||"")+"]";
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, name, {
        configurable: c,
        enumerable: e,
        get: g ? CreateBuiltinFunction(getRealm(), g, arity, "get "+fname) : undefined,
        set: s ? CreateBuiltinFunction(getRealm(), s, arity, "set "+fname) : undefined
    });
}
function NowDefineAccessor(obj, name, g, s, e, c) {
    if (e === undefined) e = false;
    if (c === undefined) c = true;
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, name, {
        configurable: c,
        enumerable: e,
        get: g,
        set: s
    });
}
function NowDefineProperty(O, P, V, w, e, c) {
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
    //return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, P, desc);
    return OrdinaryDefineOwnProperty(O, P, desc);
}
function getContext() {
    var stack = realm.stack;
    return stack[stack.length-1];
}
function getEventQueue() {
    return realm.eventQueue;
}
function getGlobalThis() {
    return realm.globalThis;
}
function getGlobalEnv() {
    return realm.globalEnv;
}
function getIntrinsics() {
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
function printException (error) {
    var name = Get(error, "name");
    var message = Get(error, "message");
    var callstack = Get(error, "stack");
    var text = createExceptionTextOutput(name, message, callstack);
    console.log(text);
}
function createExceptionTextOutput(name, message, callstack) {
    var text = "\n";
    text += format("S_EXCEPTION_THROWN", name) + "\n";
    text += format("EXCEPTION_MESSAGE_S", message) + "\n";
    text += format("EXCEPTION_STACK_S", callstack) + "\n";
    return text;
}
function stringifyErrorStack(type, message) {
    var callStack = getStack();
    var len = callStack.length || 0;
    var frame = getContext();
    var start = 0;
    var node, ntype, line ,column, pos, fn, clr;
    var stackTraceLimit = realm.stackTraceLimit;
    var url = realm.scriptLocation;
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
            ntype = node && node.type;
            line = frame.line;
            column = frame.column;
            fn = frame.callee;
            clr = frame.caller;
            stack += cnt + ". ";
            stack += fn + "/" + ntype + "  " + format("AT_LINE_S_COLUMN_S", line, column);
            stack += "[caller " + clr + " @ "+url+"]";
            stack += "\r\n";
            cnt = cnt + 1;
        }
    }
    return stack;
}
function makeNativeException (error) {
    if (Type(error) != OBJECT) return error;
    var name = unwrap(Get(error, "name"));
    var message = unwrap(Get(error, "message"));
    var callstack = unwrap(Get(error, "stack"));
    var text = createExceptionTextOutput(name, message, callstack);

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
    setInternalSlot(F, SLOTS.CODE, fn.body);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, fn.params);
    setInternalSlot(F, SLOTS.REALM, realm);
    SetFunctionName(F, name);
    SetFunctionLength(F, arity);
    return F;
}
function NowDefineSelfHostingFunction(O, name, arity, fproto, e, w, c) {
    if (e === undefined) e = false;
    if (w === undefined) w = true;
    if (c === undefined) c = true;
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, name, {
        configurable: c,
        enumerable: e,
        value: CreateSelfHostingFunction(getRealm(), name, arity, fproto),
        writable: w
    });
}
exports.CreateSelfHostingFunction = CreateSelfHostingFunction;
exports.NowDefineSelfHostingFunction = NowDefineSelfHostingFunction;
var VMObject_eval = function (thisArg, argList) {
    var code = argList[0];
    var realm = argList[1];
    var realmObject;
    if (realm === undefined) realmObject = getRealm();
    else if (!(realmObject = getInternalSlot(realm, SLOTS.REALMOBJECT))) return newTypeError( "Sorry, only realm objects are accepted as realm object");
    return require("asm-runtime").CompileAndRun(realmObject, code);
};

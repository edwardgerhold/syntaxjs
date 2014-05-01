/**
 * Created by root on 30.03.14.
 */
// ===========================================================================================================
    // Ordinary Function
    // ===========================================================================================================

function OrdinaryFunction() {
    var F = Object.create(OrdinaryFunction.prototype);
    setInternalSlot(F, "Bindings", Object.create(null));
    setInternalSlot(F, "Symbols", Object.create(null));
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Realm", undefined);
    setInternalSlot(F, "Extensible", true);
    setInternalSlot(F, "Environment", undefined);
    setInternalSlot(F, "NeedsSuper", undefined);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, undefined);
    setInternalSlot(F, SLOTS.CODE, undefined);
    return F;
}

OrdinaryFunction.prototype = {
    constructor: OrdinaryFunction,
    type: "object",
    toString: function () {
        return "[object OrdinaryFunction]";
    },
    Get: function (P, R) {
        var v = OrdinaryObjectGet(this, P, R);
        if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) return null;
        return v;
    },
    GetOwnProperty: function (P) {
        var d = GetOwnProperty(this, P);
        if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) d.value = null;
        return d;
    },
    Call: function () {
        // MODULE INTERDEPENDENCY -> call is from "runtime"
        return exports.Call.apply(this, arguments);
    },
    Construct: function (argList) {
        return OrdinaryConstruct(this, argList);
    }
};
addMissingProperties(OrdinaryFunction.prototype, OrdinaryObject.prototype);


// ===========================================================================================================
// BoundFunctionCreate
// ===========================================================================================================

function BoundFunctionCreate(B, T, argList) {
    var F = OrdinaryFunction();
    setInternalSlot(F, SLOTS.BOUNDTARGETFUNCTION, B);
    setInternalSlot(F, SLOTS.BOUNDTHIS, T);
    setInternalSlot(F, SLOTS.BOUNDARGUMENTS, argList.slice());
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Extensible", true);
    setInternalSlot(F, SLOTS.CALL, function (thisArg, argList) {
        var B = getInternalSlot(F, SLOTS.BOUNDTARGETFUNCTION);
        var T = getInternalSlot(F, SLOTS.BOUNDTHIS);
        var A = getInternalSlot(F, SLOTS.BOUNDARGUMENTS).concat(argList);
        return callInternalSlot(SLOTS.CALL, B, T, A);
    });
    return F;
}



function IsCallable(O) {
    if (O instanceof CompletionRecord) return IsCallable(O.value);
    return Type(O) === OBJECT && O.Call;
}

function IsConstructor(F) {
    if (F instanceof CompletionRecord) return IsConstructor(F.value);
    return F && F.Construct;
}

function SetFunctionLength(F, L) {
    L = ToLength(L);
    // if (isAbrupt(L)) return L;
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, F, "length", {
        value: L,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

function SetFunctionName(F, name, prefix) {
    var success;
    var t = Type(name);
    Assert(t === STRING || t === SYMBOL, "SetFunctionName: name must be a symbol or a string ("+name+" is "+t+")");
    Assert(IsCallable(F), "SetFunctionName: F has to be an EcmaScript Function Object");
    Assert(!HasOwnProperty(F, "name"), "SetFunctionName: Function may not have a name property");
    if (t === SYMBOL) {
        var desc = getInternalSlot(name, "Description");
        if (desc === undefined) name = "";
        else name = "[" + desc + "]";
    }
    if (name !== "" && prefix !== undefined) {
        name = prefix + " " + name;
    }
    success = DefineOwnProperty(F, "name", {
        value: name,
        writable: false,
        enumerable: false,
        configurable: false
    });
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return withError("Type", "Sorry, can not set name property of a non function");
    return NormalCompletion(undefined);
}

function GeneratorFunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
    if (!fProto) fProto = Get(getIntrinsics(), "%Generator%");
    var F = FunctionAllocate(fProto, "generator");
    return FunctionInitialize(F, kind, paramList, body, scope, strict, homeObject, methodName);
}

function FunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
    if (!fProto) fProto = Get(getIntrinsics(), "%FunctionPrototype%");
    var F = FunctionAllocate(fProto);
    return FunctionInitialize(F, kind, paramList, body, scope, strict, homeObject, methodName);
}

function FunctionAllocate(fProto, kind) {
    var F;
    Assert(Type(fProto) === OBJECT, "fproto has to be an object");
    if (kind) {
        Assert((kind === "generator" || kind === "normal"), "kind must be generator or normal");
    } else {
        kind = "normal";
    }
    F = OrdinaryFunction();
    setInternalSlot(F, "FunctionKind", kind);
    setInternalSlot(F, "Prototype", fProto);
    setInternalSlot(F, "Extensible", true);
    setInternalSlot(F, SLOTS.CONSTRUCT, undefined);
    setInternalSlot(F, "Realm", getRealm());
    return F;
}

function FunctionInitialize(F, kind, paramList, body, scope, strict, homeObject, methodName) {
    setInternalSlot(F, "FunctionKind", kind);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, paramList);
    setInternalSlot(F, SLOTS.CODE, body);
    setInternalSlot(F, "Environment", scope);
    setInternalSlot(F, "Strict", strict);
    setInternalSlot(F, "Realm", getRealm());
    if (homeObject) setInternalSlot(F, SLOTS.HOMEOBJECT, homeObject);
    if (methodName) setInternalSlot(F, SLOTS.METHODNAME, methodName);
    setInternalSlot(F, "Strict", strict);
    if (kind === "arrow") setInternalSlot(F, "ThisMode", "lexical");
    else if (strict) setInternalSlot(F, "ThisMode", "strict");
    else setInternalSlot(F, "ThisMode", "global");
    return F;
}

function GetPrototypeFromConstructor(C, intrinsicDefaultProto) {
    var realm, intrinsics;
    Assert((typeof intrinsicDefaultProto === "string"), "intrinsicDefaultProto has to be a string");
    if (!IsConstructor(C)) return withError("Type", "GetPrototypeFromConstructor: C is no constructor");
    var proto = Get(C, "prototype");
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    if (Type(proto) !== OBJECT) {
        var realm = getInternalSlot(C, "Realm");
        if (realm) intrinsics = realm.intrinsics;
        else intrinsics = getIntrinsics();
        proto = Get(getIntrinsics(), intrinsicDefaultProto);
    }
    return proto;
}

function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto, internalDataList) {
    Assert(HasProperty(getIntrinsics(), intrinsicDefaultProto), "the chosen intrinsic default proto has to be defined in the intrinsic");
    var O, result;
    var proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    return ObjectCreate(proto, internalDataList);
}

// 20. Januar

function CreateFromConstructor(F) {
    var creator = Get(F, $$create);
    if (isAbrupt(creator = ifAbrupt(creator))) return creator;
    if (creator === undefined) return undefined;
    if (IsCallable(creator) === false) return withError("Type", "CreateFromConstructor: creator has to be callable");
    var obj = callInternalSlot(SLOTS.CALL, creator, F, []);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (Type(obj) !== OBJECT) return withError("Type", "CreateFromConstructor: obj has to be an object");
    return obj;
}

function Construct(F, argList) {
    Assert(Type(F) === OBJECT, "essential Construct: F is not an object");
    var obj = CreateFromConstructor(F);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (obj === undefined) {
        obj = OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        if (Type(obj) !== OBJECT) return withError("Type", "essential Construct: obj is not an object");
    }
    var result = callInternalSlot(SLOTS.CALL, F, obj, argList);
    if (isAbrupt(result = ifAbrupt(result))) return result;
    if (Type(result) === OBJECT) return result;
    return obj;
}

// vorher
function OrdinaryConstruct(F, argList) {
    var creator = Get(F, $$create);
    var obj;
    if (creator) {
        if (!IsCallable(creator)) return withError("Type", "OrdinaryConstruct: creator is not callable");
        obj = callInternalSlot(SLOTS.CALL, creator, F, argList);
    } else {
        obj = OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
    }
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (Type(obj) !== OBJECT) return withError("Type", "OrdinaryConstruct: Type(obj) is not object");
    var result = callInternalSlot(SLOTS.CALL, F, obj, argList);
    if (isAbrupt(result = ifAbrupt(result))) return result;
    if (Type(result) === OBJECT) return result;
    return obj;
}

function MakeConstructor(F, writablePrototype, prototype) {
    var installNeeded = false;

    if (!prototype) {
        installNeeded = true;
        prototype = ObjectCreate();
    }
    if (writablePrototype === undefined) writablePrototype = true;
    setInternalSlot(F, SLOTS.CONSTRUCT, function Construct(argList) {
        return OrdinaryConstruct(this, argList);
    });
    if (installNeeded) callInternalSlot(SLOTS.DEFINEOWNPROPERTY, prototype, "constructor", {
        value: F,
        writable: writablePrototype,
        enumerable: false,
        configurable: writablePrototype
    });
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, F, "prototype", {
        value: prototype,
        writable: writablePrototype,
        enumerable: false,
        configurable: writablePrototype
    });
    return F;
}

function OrdinaryHasInstance(C, O) {
    var BC, P;
    if (!IsCallable(C)) return false;
    if (BC = getInternalSlot(C, SLOTS.BOUNDTARGETFUNCTION)) {
        return OrdinaryHasInstance(BC, O);
    }
    if (Type(O) !== OBJECT) return false;
    P = Get(C, "prototype");
    if (isAbrupt(P = ifAbrupt(P))) return P;
    if (Type(P) !== OBJECT) return withError("Type", "OrdinaryHasInstance: P not object");
    while (O = GetPrototypeOf(O)) {
        if (isAbrupt(O = ifAbrupt(O))) return O;
        if (O === null) return false;
        if (SameValue(P, O) === true) return true;
    }
    return false;
}


// ===========================================================================================================
// AddRestricted FPs
// ===========================================================================================================

function AddRestrictedFunctionProperties(F) {
    var thrower = getIntrinsic("%ThrowTypeError%");
    var status = DefineOwnPropertyOrThrow(F, "caller", {
        get: thrower,
        set: thrower,
        enumerable: false,
        configurable: false
    });
    if (isAbrupt(status)) return status;
    return DefineOwnPropertyOrThrow(F, "arguments", {
        get: thrower,
        set: thrower,
        enumerable: false,
        configurable: false
    });
}

// ===========================================================================================================
// Create Builtin (Intrinsic Module)
// ===========================================================================================================

function CreateBuiltinFunction(realm, steps, len, name, internalSlots) {

    var tmp;
    var realm = getRealm();
    var F = OrdinaryFunction();

    // this is probably/oc unneccessary, coz all builtins have make no use of the environments anyways
    // because they are plain javascript functions
    function Call() {
        var result;
        var oldContext = getContext();
        var callContext = ExecutionContext(getLexEnv(), realm);
        var stack = getStack();
        stack.push(callContext);
        result = steps.apply(this, arguments);
        Assert(callContext === stack.pop(), "CreateBuiltinFunction: Wrong Context popped from the Stack.");
        return result;
    }
    // the .steps reference is needed by function.prototype.toString to put out the right function
    Call.steps = steps;

    setInternalSlot(F, SLOTS.CALL, Call);
    setInternalSlot(F, SLOTS.CODE, undefined);
    setInternalSlot(F, SLOTS.CONSTRUCT, undefined);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, undefined);
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Environment", undefined);
    setInternalSlot(F, "NeedsSuper", undefined);
    setInternalSlot(F, "Strict", true);
    setInternalSlot(F, "Realm", realm);
    AddRestrictedFunctionProperties(F);
    if (typeof len === "string") {
        tmp = name;
        name = len;
        len = tmp;
    }
    if (typeof name !== "string") name = steps.name;
    if (name) SetFunctionName(F, name);
    if (typeof len !== "number") len = 0;
    SetFunctionLength(F, len);
    if (typeof internalSlots === "object" && internalSlots) {
	Object.keys(internalSlots).forEach(function (slot) {
	    setInternalSlot(F, slot, undefined);
	});
    }    
    return F;
}


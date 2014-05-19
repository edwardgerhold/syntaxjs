
function OrdinaryFunction() {
    var F = Object.create(OrdinaryFunction.prototype);
    setInternalSlot(F, SLOTS.BINDINGS, Object.create(null));
    setInternalSlot(F, SLOTS.SYMBOLS, Object.create(null));
    setInternalSlot(F, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.FUNCTIONPROTOTYPE));
    setInternalSlot(F, SLOTS.REALM, undefined);
    setInternalSlot(F, SLOTS.EXTENSIBLE, true);
    setInternalSlot(F, SLOTS.ENVIRONMENT, undefined);
    setInternalSlot(F, SLOTS.NEEDSSUPER, undefined);
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
        if (P === "caller" && IsCallable(v) && getInternalSlot(v, SLOTS.STRICT)) return null;
        return v;
    },
    GetOwnProperty: function (P) {
        var d = GetOwnProperty(this, P);
        if (P === "caller" && IsCallable(v) && getInternalSlot(v, SLOTS.STRICT)) d.value = null;
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

function BoundFunctionCreate(B, T, argList) {
    var F = OrdinaryFunction();
    setInternalSlot(F, SLOTS.BOUNDTARGETFUNCTION, B);
    setInternalSlot(F, SLOTS.BOUNDTHIS, T);
    setInternalSlot(F, SLOTS.BOUNDARGUMENTS, argList.slice());
    setInternalSlot(F, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.FUNCTIONPROTOTYPE));
    setInternalSlot(F, SLOTS.EXTENSIBLE, true);
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
        var desc = getInternalSlot(name, SLOTS.DESCRIPTION);
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
    if (success === false) return newTypeError( "Sorry, can not set the f.name property");
    return NormalCompletion(undefined);
}

function GeneratorFunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
    if (!fProto) fProto = Get(getIntrinsics(), INTRINSICS.GENERATOR);
    var F = FunctionAllocate(fProto, "generator");
    return FunctionInitialize(F, kind, paramList, body, scope, strict, homeObject, methodName);
}

function FunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
    if (!fProto) fProto = Get(getIntrinsics(), INTRINSICS.FUNCTIONPROTOTYPE);
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
    setInternalSlot(F, SLOTS.FUNCTIONKIND, kind);
    setInternalSlot(F, SLOTS.PROTOTYPE, fProto);
    setInternalSlot(F, SLOTS.EXTENSIBLE, true);
    setInternalSlot(F, SLOTS.CONSTRUCT, undefined);
    setInternalSlot(F, SLOTS.REALM, getRealm());
    return F;
}

function FunctionInitialize(F, kind, paramList, body, scope, strict, homeObject, methodName) {
    setInternalSlot(F, SLOTS.FUNCTIONKIND, kind);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, paramList);
    setInternalSlot(F, SLOTS.CODE, body);
    setInternalSlot(F, SLOTS.ENVIRONMENT, scope);
    setInternalSlot(F, SLOTS.STRICT, strict);
    setInternalSlot(F, SLOTS.REALM, getRealm());
    if (homeObject) setInternalSlot(F, SLOTS.HOMEOBJECT, homeObject);
    if (methodName) setInternalSlot(F, SLOTS.METHODNAME, methodName);
    setInternalSlot(F, SLOTS.STRICT, strict);
    if (kind === "arrow") setInternalSlot(F, SLOTS.THISMODE, "lexical");
    else if (strict) setInternalSlot(F, SLOTS.THISMODE, "strict");
    else setInternalSlot(F, SLOTS.THISMODE, "global");
    return F;
}

function GetPrototypeFromConstructor(C, intrinsicDefaultProto) {
    var realm, intrinsics;
    Assert((typeof intrinsicDefaultProto === "string"), "intrinsicDefaultProto has to be a string");
    if (!IsConstructor(C)) return newTypeError( "GetPrototypeFromConstructor: C is no constructor");
    var proto = Get(C, "prototype");
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    if (Type(proto) !== OBJECT) {
        var realm = getInternalSlot(C, SLOTS.REALM);
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
    if (IsCallable(creator) === false) return newTypeError( "CreateFromConstructor: creator has to be callable");
    var obj = callInternalSlot(SLOTS.CALL, creator, F, []);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (Type(obj) !== OBJECT) return newTypeError( "CreateFromConstructor: obj has to be an object");
    return obj;
}

function Construct(F, argList) {
    Assert(Type(F) === OBJECT, "essential Construct: F is not an object");
    var obj = CreateFromConstructor(F);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (obj === undefined) {
        obj = OrdinaryCreateFromConstructor(F, INTRINSICS.OBJECTPROTOTYPE);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        if (Type(obj) !== OBJECT) return newTypeError( "essential Construct: obj is not an object");
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
        if (!IsCallable(creator)) return newTypeError( "OrdinaryConstruct: creator is not callable");
        obj = callInternalSlot(SLOTS.CALL, creator, F, argList);
    } else {
        obj = OrdinaryCreateFromConstructor(F, INTRINSICS.OBJECTPROTOTYPE);
    }
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (Type(obj) !== OBJECT) return newTypeError( "OrdinaryConstruct: Type(obj) is not object");
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
    if (Type(P) !== OBJECT) return newTypeError( "OrdinaryHasInstance: P not object");
    while (O = GetPrototypeOf(O)) {
        if (isAbrupt(O = ifAbrupt(O))) return O;
        if (O === null) return false;
        if (SameValue(P, O) === true) return true;
    }
    return false;
}

function AddRestrictedFunctionProperties(F) {
    var thrower = getIntrinsic(INTRINSICS.THROWTYPEERROR);
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

function CreateBuiltinFunction(realm, steps, len, name, internalSlots) {
    var tmp;
    realm = realm || getRealm();
    var F = OrdinaryFunction();

    // this is probably/oc unneccessary, coz all builtins have make no use of the environments anyways
    // because they are plain javascript functions
    /*
    function Call() {
        var result;
        var oldContext = getContext();
        var callContext = ExecutionContext(getContext(), realm);
        var stack = getStack();
        stack.push(callContext);
        result = steps.apply(this, arguments);
        Assert(callContext === stack.pop(), "CreateBuiltinFunction: Wrong Context popped from the Stack.");
        return result;
    }
*/
    steps = steps || function () {return NormalCompletion(undefined);};
    // var Call = steps;
    // the .steps reference is needed by function.prototype.toString to put out the right function
    //Call.steps = steps;

    setInternalSlot(F, SLOTS.CALL, steps);
    setInternalSlot(F, SLOTS.CODE, undefined);
    setInternalSlot(F, SLOTS.CONSTRUCT, undefined);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, undefined);
    setInternalSlot(F, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.FUNCTIONPROTOTYPE));
    setInternalSlot(F, SLOTS.ENVIRONMENT, undefined);
    setInternalSlot(F, SLOTS.NEEDSSUPER, undefined);
    setInternalSlot(F, SLOTS.STRICT, true);
    setInternalSlot(F, SLOTS.REALM, realm);
    AddRestrictedFunctionProperties(F);
    if (typeof len === "string") {
        tmp = name;
        name = len;
        len = tmp;
    }
    // if (typeof name !== "string") name = steps.name;
    if (name) SetFunctionName(F, name);
    if (typeof len !== "number") len = 0;
    SetFunctionLength(F, len);
    if (internalSlots) {
        if (Array.isArray(internalSlots)) {
            for (var i = 0, j = internalSlots.length; i < j; i++) {
                setInternalSlot(F, internalSlots[i], undefined);
            }
        }
        else if (typeof internalSlots === "object") {
            Object.keys(internalSlots).forEach(function (slot) {
                setInternalSlot(F, slot, undefined);
            });
        }
    }    
    return F;
}

var FunctionPrototype_apply = function (thisArg, argList) {
    var func = thisArg;
    if (!IsCallable(func)) return newTypeError( "fproto.apply: func is not callable");
    var T = argList[0];
    if (T !== undefined && T !== null) T = ToObject(argList[0]);
    var argArray = argList[1] || ArrayCreate(0);
    var argList2 = CreateListFromArrayLike(argArray);
    if (isAbrupt(argList2 = ifAbrupt(argList2))) return argList2;
    return callInternalSlot(SLOTS.CALL, func, T, argList2);
};

var FunctionPrototype_bind = function (thisArg, argList) {
    var boundTarget = thisArg;
    var thisArgument = argList[0];
    var listOfArguments = arraySlice(argList, 1, argList.length);
    return BoundFunctionCreate(boundTarget, thisArgument, listOfArguments);
};

var FunctionPrototype_call = function (thisArg, argList) {
    var func = thisArg;
    if (!IsCallable(func)) return newTypeError("fproto.call: func is not callable");
    var T = argList[0];
    if (T !== undefined && T !== null) T = ToObject(argList[0]);
    var args = arraySlice(argList, 1);
    return callInternalSlot(SLOTS.CALL, func, T, args);
};

var FunctionPrototype_$$hasInstance = function (thisArg, argList) {
    var V = argList[0];
    var F = thisArg;
    return OrdinaryHasInstance(F, V);
};

var FunctionPrototype_toMethod = function (thisArg, argList) {
    var superBinding = argList[0];
    var methodName = argList[1];
    if (!IsCallable(thisArg)) return newTypeError( "this value is not callable");
    if (Type(superBinding) !== OBJECT) return newTypeError( "superBinding is not an object");
    if (methodName !== undefined) {
        methodName = ToPropertyKey(methodName);
        if (isAbrupt(methodName = ifAbrupt(methodName))) return methodName;
    }
    return CloneMethod(thisArg, superBinding, methodName);
};

var FunctionPrototype_valueOf = function (thisArg, argList) {
    return thisArg;
};

var FunctionConstructor_call = function (thisArg, argList) {
    var argCount = argList.length;
    var P = "";
    var bodyText;
    var firstArg, nextArg;
    if (argCount === 0) bodyText = "";
    else if (argCount === 1) bodyText = argList[0];
    else if (argCount > 1) {
        firstArg = argList[0];
        P = ToString(firstArg);
        if (isAbrupt(firstArg = ifAbrupt(firstArg))) return firstArg;
        var k = 1;
        while (k < argCount - 1) {
            nextArg = argList[k];
            nextArg = ToString(nextArg);
            if (isAbrupt(nextArg = ifAbrupt(nextArg))) return nextArg;
            P = P + "," + nextArg;
            k += 1;
        }
        bodyText = argList[argCount - 1];
    }
    bodyText = ToString(bodyText);
    if (isAbrupt(bodyText = ifAbrupt(bodyText))) return bodyText;
    var parameters = parseGoal("FormalParameterList", P);
    var funcBody = parseGoal("FunctionBody", bodyText);


    /* old and from july draf */
    var boundNames = BoundNames(parameters);
    if (!IsSimpleParameterList(parameters)) {
        if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return newSyntaxError( "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
    }
    if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return newSyntaxError( "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");
    /* one of the few edge cases to recall static semantics */


    var scope = getRealm().globalEnv;
    var F = thisArg;
    if (F === undefined || !hasInternalSlot(F, SLOTS.CODE)) {
        var C = FunctionConstructor;
        var proto = GetPrototypeFromConstructor(C, INTRINSICS.FUNCTIONPROTOTYPE);
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        F = FunctionAllocate(C);
    }
    if (getInternalSlot(F, SLOTS.FUNCTIONKIND) !== "normal") return newTypeError( "function object not a 'normal' function");
    FunctionInitialize(F, "normal", parameters, funcBody, scope, true);
    proto = ObjectCreate();
    var status = MakeConstructor(F);
    if (isAbrupt(status)) return status;
    SetFunctionName(F, "anonymous");
    return NormalCompletion(F);
};

var FunctionConstructor_construct = function (argList) {
    var F = this;
    return OrdinaryConstruct(F, argList);
};

var FunctionConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var proto = GetPrototypeFromConstructor(F, INTRINSICS.FUNCTIONPROTOTYPE);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    var obj = FunctionAllocate(proto);
    return obj;
};

var FunctionPrototype_$$create = function (thisArg, argList) {
    return OrdinaryCreateFromConstructor(thisArg, INTRINSICS.OBJECTPROTOTYPE);
};

var FunctionPrototype_toString = function (thisArg, argList) {
    var codegen = require("js-codegen");
    var F = thisArg;
    if (!IsCallable(F)) return newTypeError(format("FUNCTION_TOSTRING_ERROR"));

    var name = Get(F, "name") || "anonymous";
    var P, C;
    P = getInternalSlot(F, SLOTS.FORMALPARAMETERS);
    C = getInternalSlot(F, SLOTS.CODE);
    var kind = getInternalSlot(F, SLOTS.FUNCTIONKIND);
    var star = kind === "generator" ? "*" : "";
    var callfn;
    if (!C && (callfn=getInternalSlot(F, SLOTS.CALL))) {
        var code = "// [[Builtin Function native JavaScript Code]]\r\n";
        // createbuiltin wraps the builtin
        if (callfn.steps) callfn = callfn.steps;
        // setinternalslot call has no wrapper
        // this requires a double check here
        code += callfn.toString();
        return code;
    }
    var paramString, bodyString;
    paramString = codegen.builder.formalParameters(P);
    if (kind === "arrow") {
        if (Array.isArray(C)) {
            bodyString = codegen.builder.functionBody(C);
        } else bodyString = codegen.callBuilder(C);
        return NormalCompletion(paramString + " => " + bodyString);
    } else {
        bodyString = codegen.builder.functionBody(C);
        return NormalCompletion("function" + star + " " + name + " " + paramString + " " + bodyString);
    }
};


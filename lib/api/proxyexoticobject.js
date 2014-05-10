    
function ProxyExoticObject(handler, target) {
    var P = Object.create(ProxyExoticObject.prototype);
    setInternalSlot(P, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.PROXYPROTOTYPE));
    setInternalSlot(P, SLOTS.EXTENSIBLE, true);
    setInternalSlot(P, SLOTS.PROXYHANDLER, handler);
    setInternalSlot(P, SLOTS.PROXYTARGET, target);
    return P;
}

ProxyExoticObject.prototype = {
    constructor: ProxyExoticObject,
    type: "object",
    toString: function () {
        return "[object ProxyExoticObject]";
    },
    GetPrototypeOf: function () {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "getPrototypeOf");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return GetPrototypeOf(T);
        var handlerProto = callInternalSlot(SLOTS.CALL, trap, handler, [T]);
        if (isAbrupt(handlerProto = ifAbrupt(handlerProto))) return handlerProto;
        var targetProto = GetPrototypeOf(T);
        if (isAbrupt(targetProto = ifAbrupt(targetProto))) return targetProto;
        if (!SameValue(handlerProto, targetProto)) return newTypeError( "handler and target protos differ");
        return handlerProto;
    },

    SetPrototypeOf: function (V) {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "setPrototypeOf");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return SetPrototypeOf(T, V);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, V]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        trapResult = ToBoolean(trapResult);
        var extensibleTarget = IsExtensible(T);
        if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
        if (extensibleTarget === true) return trapResult;
        var targetProto = GetPrototypeOf(T);
        if (isAbrupt(targetProto = ifAbrupt(targetProto))) return targetProto;
        if (!SameValue(V, targetProto)) return newTypeError( "prototype argument and targetProto differ");
        return trapResult;
    },

    IsExtensible: function () {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "isExtensible");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return IsExtensible(T);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        trapResult = ToBoolean(trapResult);
        var booleanTrapResult = ToBoolean(trapResult);
        if (isAbrupt(booleanTrapResult = ifAbrupt(booleanTrapResult))) return booleanTrapResult;
        var targetResult = IsExtensible(T);
        if (isAbrupt(targetResult = ifAbrupt(targetResult))) return targetResult;
        if (!SameValue(booleanTrapResult, targetResult)) return newTypeError( "trap and target boolean results differ");
        return booleanTrapResult;
    },

    PreventExtensions: function () {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "preventExtensions");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return PreventExtensions(T);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        var booleanTrapResult = ToBoolean(trapResult);
        if (isAbrupt(booleanTrapResult = ifAbrupt(booleanTrapResult))) return booleanTrapResult;
        var targetIsExtensible = IsExtensible(T);
        if (isAbrupt(targetIsExtensible = ifAbrupt(targetIsExtensible))) return targetIsExtensible;
        if (booleanTrapResult === true && targetIsExtensible === true) return newTypeError( "target still extensible");
        return targetIsExtensible;
    },

    HasOwnProperty: function (P) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "hasOwn");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return HasOwnProperty(T, P);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, P]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        var success = ToBoolean(trapResult);
        var extensibleTarget;
        var targetDesc;
        if (!success) {
            targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            if (targetDesc) {
                if (targetDesc.configurable === false) return newTypeError( "targetDesc.configurable is false");
                extensibleTarget = IsExtensible(T);
                if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
                if (ToBoolean(extensibleTarget) === false) return newTypeError( "target is not extensible");
            }
        } else {
            extensibleTarget = IsExtensible(T);
            if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
            if (ToBoolean(extensibleTarget) === true) return success;
            targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            if (targetDesc === undefined) return newTypeError( "target descriptor is undefined");
        }
        return success;
    },

    GetOwnProperty: function (P) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "getOwnPropertyDescriptor");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return GetOwnProperty(T, P);
        var trapResultObj = callInternalSlot(SLOTS.CALL, trap, H, [T, P]);
        if (isAbrupt(trapResultObj = ifAbrupt(trapResultObj))) return trapResultObj;
        if (Type(trapResultObj) !== OBJECT && Type(trapResultObj) !== UNDEFINED) return newTypeError( "getown - neither object nor undefined");
        var targetDesc = GetOwnProperty(T, P);
        if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
        var extensibleTarget;
        if (Type(trapResultObj) === UNDEFINED) {
            if (targetDesc === undefined) return undefined;
            if (targetDesc.configurable === false) return newTypeError( "inconfigurable target problem");
            extensibleTarget = IsExtensible(T);
            if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
            if ((extensibleTarget = ToBoolean(extensibleTarget)) === false) return newTypeError( "target is not extensible");
            return undefined;
        }
        extensibleTarget = IsExtensible(T);
        if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
        extensibleTarget = ToBoolean(extensibleTarget);
        var resultDesc = ToPropertyDescriptor(trapResultObj);
        CompletePropertyDescriptor(resultDesc, targetDesc);
        var valid = IsCompatiblePropertyDescriptor(extensibleTarget, resultDesc, targetDesc);
        if (!valid) return newTypeError( "invalid property descriptor");
        if (resultDesc.configurable === false) {
            if (targetDesc === undefined || targetDesc.configurable === true) return newTypeError( "descriptor configurability mismatch");
        }
        return resultDesc;
    },

    DefineOwnProperty: function (P, D) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "defineProperty");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return DefineOwnProperty(T, P, D);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, P, D]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        var targetDesc = GetOwnProperty(T, P);
        if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
        var extensibleTarget = ToBoolean(extensibleTarget);
        var settingConfigFalse;
        settingConfigFalse = D.configurable !== undefined && !D.configurable;
        if (targetDesc === undefined) {
            if (!extensibleTarget) return newTypeError( "target not extensible");
            if (settingConfigFalse) return newTypeError( "not configurable descriptor or undefined and no target descriptor?!");
        } else {
            if (!IsCompatiblePropertyDescriptor(extensibleTarget, D, targetDesc)) return newTypeError( "incompatible descriptors");
            if (settingConfigFalse && targetDesc.configurable) return newTypeError( "configurability incomptatiblity");
        }
        return true;
    },

    HasProperty: function (P) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "has");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return HasProperty(T, P);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, P]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        var success = ToBoolean(trapResult);
        if (!success) {
            var targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            if (targetDesc) {
                if (targetDesc.configurable === false) return newTypeError( "targetDesc.configurable is false");
                extensibleTarget = IsExtensible(T);
                if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
                if (ToBoolean(extensibleTarget) === false) return newTypeError( "target is not extensible");
            }
        }
        return success;
    },

    Get: function (P) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "get");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return Get(T, P);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, P]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;

        var targetDesc = GetOwnProperty(T, P);
        if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
        if (targetDesc) {
            if (IsDataDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.writable === false) {
                if (!SameValue(trapResult, targetDesc.value)) return newTypeError( "trap and target values differ");
            } else if (IsAccessorDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.get === undefined) {
                if (trapResult) return newTypeError( "Getter problem, undefined and not configurable");
            }
        }
        return trapResult;
    },
    Set: function (P, V, R) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "set");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return Set(T, P, V, R);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, P, V, R]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        if (ToBoolean(trapResult) === false) return newTypeError( "cant set value with trap");
        var targetDesc = GetOwnProperty(T, P);
        if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
        if (targetDesc) {
            if (IsDataDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.writable === false) {
                if (!SameValue(trapResult, targetDesc.value)) return newTypeError( "trap and target values differ");
            } else if (IsAccessorDescriptor(targetDesc) && targetDesc.configurable === false) {
                if (targetDesc.set === undefined) return newTypeError( "Getter problem, undefined and not configurable");
            }
        }
        return true;
    },
    Invoke: function (P, A, R) {
        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "invoke");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return Invoke(T, P, A, R);
        var argArray = CreateArrayFromList(A);
        return callInternalSlot(SLOTS.CALL, trap, H, [T, P, argArray, R]);
    },
    Delete: function (P) {

        Assert(IsPropertyKey(P) === true);
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "deleteProperty");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return Delete(T, P);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T, P]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;

        if (ToBoolean(trapResult) === false) return false;
        var targetDesc = GetOwnProperty(T, P);
        if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
        if (targetDesc === undefined) return true;
        if (targetDesc.configurable === false) return newTypeError( "property is not configurable");
        return true;

    },

    Enumerate: function () {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "enumerate");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return Enumerate(T);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        if (Type(trapResult) !== OBJECT) return newTypeError( "trapResult is not an object");
        return trapResult;
    },
    OwnPropertyKeys: function () {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "ownKeys");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return OwnPropertyKeys(T);
        var trapResult = callInternalSlot(SLOTS.CALL, trap, H, [T]);
        if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
        if (Type(trapResult) !== OBJECT) return newTypeError( "trapResult is not an object");
        return trapResult;
    },

    Call: function (thisArg, argList) {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "apply");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return callInternalSlot(SLOTS.CALL,T, thisArg, argList);
        var argArray = CreateArrayFromList(argList);
        return callInternalSlot(SLOTS.CALL, trap, H, [T, thisArg, argArray]);
    },

    Construct: function (argList) {
        var T = getInternalSlot(this, SLOTS.PROXYTARGET);
        var H = getInternalSlot(this, SLOTS.PROXYHANDLER);
        var trap = GetMethod(H, "construct");
        if (isAbrupt(trap = ifAbrupt(trap))) return trap;
        if (trap === undefined) return callInternalSlot(SLOTS.CONSTRUCT, T, argList);
        var argArray = CreateArrayFromList(argList);
        var newObj = callInternalSlot(SLOTS.CALL, trap, H, [T, argArray]);
        if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
        if (Type(newObj) !== OBJECT) return newTypeError( "returned value is not an object");
        return newObj;
    }
};
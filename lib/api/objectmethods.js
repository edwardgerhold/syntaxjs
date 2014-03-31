/**
 * Created by root on 30.03.14.
 */



function SetIntegrityLevel(O, level) {
    Assert(Type(O) === "object", "object expected");
    Assert(level === "sealed" || level === "frozen", "level must be sealed or frozen");
    var desc;
    if (level === "sealed" || level === "frozen") {
        var pendingException;
        var keys = OwnPropertyKeysAsList(O); // Array statt iterator
        var key;
        var status;
        if (level === "sealed") {
            for (var k in keys) {
                key = keys[k];
                desc = OrdinaryGetOwnProperty(O, key);
                if (desc && desc.configurable) {
                    desc.configurable = false;
                    status = DefineOwnPropertyOrThrow(O, key, desc);
                    if (isAbrupt(status)) {
                        if (!pendingException) pendingException = status;
                    }
                }
            }
        } else if (level === "frozen") {
            for (var k in keys) {
                key = keys[k];
                status = GetOwnProperty(O, k);
                if (isAbrupt(status)) {
                    if (!pendingException) pendingException = status;
                } else {
                    var currentDesc = unwrap(status);
                    if (currentDesc) {
                        if (IsAccessorDescriptor(currentDesc)) {
                            desc = Object.create(null);
                            desc.get = currentDesc.get;
                            desc.set = currentDesc.set;
                            desc.enumerable = currentDesc.enumerable;
                            desc.configurable = false;
                            status = DefineOwnPropertyOrThrow(O, key, desc);
                            if (isAbrupt(status)) {
                                if (!pendingException) pendingException = status;
                            }
                        } else {
                            desc = Object.create(null);
                            desc.value = currentDesc.value;
                            desc.writable = false;
                            desc.enumerable = currentDesc.enumerable;
                            desc.configurable = false;

                            status = DefineOwnPropertyOrThrow(O, key, desc);
                            if (isAbrupt(status)) {
                                if (!pendingException) pendingException = status;
                            }
                        }
                    }
                }
            }
        }
        if (pendingException) return pendingException;
        return PreventExtensions(O);
    }
}

function TestIntegrityLevel(O, level) {
    Assert(Type(O) === "object", "object expected");
    Assert(level === "sealed" || level === "frozen", "level must be sealed or frozen");
    var status = IsExtensible(O);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === true) return false;
    var keys = OwnPropertyKeysAsList(O); // Array statt iterator
    if (isAbrupt(keys = ifAbrupt(keys))) return keys;
    var pendingException = undefined;
    var key;
    var configurable = false,
        writable = false;
    for (var k in keys) {
        key = keys[k];
        status = GetOwnProperty(O, key);
        if (isAbrupt(status = ifAbrupt(status))) {
            if (!pendingException) pendingException = status;
            configurable = true;
        } else {
            var currentDesc = unwrap(status);
            if (currentDesc !== undefined) {
                configurable = configurable && currentDesc.configurable;
                if (IsDataDescriptor(currentDesc)) {
                    writable = writable && currentDesc.writable;
                }
            }
        }
    }
    if (pendingException) return pendingException;
    if (level === "frozen" && writable) return false;
    if (configurable) return false;
}



// ===========================================================================================================
// essential methods
// ===========================================================================================================

function GetPrototypeOf(V) {
    if (Type(V) !== "object") return withError("Type", "argument is not an object");
    return getInternalSlot(V, "Prototype") || null;
}

function SetPrototypeOf(O, V) {
    if (Type(V) !== "object" && V !== null) return withError("Type", "Assertion: argument is either object or null, but it is not.");
    var extensible = getInternalSlot(O, "Extensible");
    var current = getInternalSlot(O, "Prototype");
    if (SameValue(V, current)) return true;
    if (!extensible) return false;
    if (V !== null) {
        var p = V;
        while (p !== null) {
            if (SameValue(p, O)) return false;
            var nextp = GetPrototypeOf(p);
            if (isAbrupt(nextp = ifAbrupt(nextp))) return nextp;
            p = nextp;
        }
    }
    setInternalSlot(O, "Prototype", V);
    return true;
}

function Delete(O, P) {
    var v;
    if (IsSymbol(P)) v = O.Symbols[P.es5id];
    else(v = O.Bindings[P]);
    if (v) {
        if (v.configurable) {
            if (IsSymbol(P)) {
                O.Symbols[P.es5id] = undefined;
                delete O.Symbols[P.es5id];
            } else {
                O.Bindings[P] = undefined;
                delete O.Bindings[P];
            }
            return true;
        }
    }
    return false;
}

function Get(O, P) {
    Assert(Type(O) === "object", "Get(O,P): expecting object");
    Assert(IsPropertyKey(P));
    return callInternalSlot("Get", O, P, O);
    //var func = getFunction(O, "Get");
    //return func.call(O,P,O);
}

function OrdinaryObjectGet(O, P, R) {
    Assert(IsPropertyKey(P), "Get (object) expects a valid Property Key (got " + P + ")")
    var desc = callInternalSlot("GetOwnProperty", O, P);
    if (isAbrupt(desc = ifAbrupt(desc))) return desc;
    if (desc === undefined) {
        var parent = GetPrototypeOf(O);
        if (isAbrupt(parent)) return parent;
        parent = ifAbrupt(parent);
        if (parent === null) return undefined;
        return parent.Get(P, R);
    }
    var getter;
    if (IsDataDescriptor(desc)) return desc.value;
    else if (IsAccessorDescriptor(desc)) {
        getter = desc.get;
        if (getter === undefined) return undefined;
        else return callInternalSlot("Call", getter, R, []);
    }
    return undefined;
}

function Set(O, P, V, R) {
    var ownDesc, parent, setter;
    Assert(IsPropertyKey(P), "Set (object) expects a valid Property Key")
    ownDesc = callInternalSlot("GetOwnProperty", O, P); // readPropertyDescriptor(O, P);
    if (isAbrupt(ownDesc = ifAbrupt(ownDesc))) return ownDesc;
    if (ownDesc === undefined) {
        parent = GetPrototypeOf(O);
        if (isAbrupt(parent = ifAbrupt(parent))) return parent;
        if (parent !== null) {
            return parent.Set(P, V, R);
        }
    }
    // von unter isdata hoch gehoben
    else if (IsAccessorDescriptor(ownDesc)) {
        var setter = ownDesc.set;
        if (setter === undefined) return false;
        var setterResult = callInternalSlot("Call", setter, R, [V]);
        if (isAbrupt(setterResult)) return setterResult;
        return true;
    }
    ownDesc = {
        value: undefined,
        writable: true,
        configurable: true,
        enumerable: true
    };
    if (IsDataDescriptor(ownDesc)) {
        if (ownDesc.writable == false) return false;
        if (Type(R) !== "object") return false;
        var existingDescriptor = R.GetOwnProperty(P);
        if (isAbrupt(existingDescriptor = ifAbrupt(existingDescriptor))) return existingDescriptor;

        if (existingDescriptor !== undefined) {
            var valueDesc = {
                value: V
            };
            return R.DefineOwnProperty(P, valueDesc);
        } else {
            return CreateDataProperty(R, P, V);
        }

    }
    return false;
}

function Invoke(O, P, args) {
    var obj;
    Assert(IsPropertyKey(P), "Invoke: expecting property key");
    if (!Array.isArray(args)) args = [];
    obj = ToObject(O);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var func = callInternalSlot("Get", obj, P, O);
    if (!IsCallable(func)) return withError("Type", "Invoke: expected function is not callable");
    if (isAbrupt(func = ifAbrupt(func))) return func;
    return callInternalSlot("Call", func, O, args);
}

function OrdinaryObjectInvoke(O, P, A, R) {
    Assert(IsPropertyKey(P), "expecting property key");
    Assert(Array.isArray(A), "expecting arguments list");
    var method = O.Get(P, R);
    if (isAbrupt(method = ifAbrupt(method))) return method;
    if (Type(method) !== "object") return withError("Type", "Invoke: method " + P + " is not an object");
    if (!IsCallable(method)) return withError("Type", "Invoke: method " + P + " is not callable");
    return method.Call(R, A);
}

function DefineOwnProperty(O, P, Desc) {
    return OrdinaryDefineOwnProperty(O, P, Desc);
}

function HasOwnProperty(O, P) {
    Assert(Type(O) === "object", "HasOwnProperty: first argument has to be an object");
    Assert(IsPropertyKey(P), "HasOwnProperty: second argument has to be a valid property key, got " + P);
    var desc = callInternalSlot("GetOwnProperty", O, P);
    if (desc === undefined) return false;
    return true;
}

function HasProperty(O, P) {
    do {
        if (HasOwnProperty(O, P)) return true;
    } while (O = GetPrototypeOf(O));
    return false;
}

function Enumerate(O) {
    var propList, name, proto, bindings, desc, index, denseList, isSparse;
    var duplicateMap = Object.create(null);
    propList = [];

    var chain = [];
    proto = O;
    while (proto != null) {
        chain.push(proto);
        proto = GetPrototypeOf(proto);
    }
    // 1) protoypes
    // dupes werden undefined gesetzt
    for (var k = chain.length -1; k >= 0; k--) {
        var obj = chain[k];
        bindings = obj.Bindings;
        for (name in bindings) {
            if (Type(name) === "string") {
                desc = OrdinaryGetOwnProperty(obj, name);
                if (desc.enumerable === true) {
                    if ((index = duplicateMap[name]) !== undefined) {
                        propList[index] = undefined;
                        isSparse = true;
                    }
                    duplicateMap[name] = propList.push(name) - 1;
                }
            }
        }
    }

    if (isSparse) {
        denseList = [];
        for (var i = 0, j = propList.length; i < j; i++) {
            if ((name = propList[i]) !== undefined) denseList.push(name);
        }
        return MakeListIterator(denseList);
    }
    return MakeListIterator(propList);
}

function OwnPropertyKeys(O) {
    var keys = [];
    var bindings = O.Bindings;
    var key;
    for (key in bindings) {
        keys.push(key);
    }
    //return keys;
    return MakeListIterator(keys);
}

function OwnPropertyKeysAsList(O) {
    var keys = [];
    var bindings = O.Bindings;
    var key;
    for (key in bindings) {
        keys.push(key);
    }
    return keys;
}

function IsExtensible(O) {
    if (Type(O) === "object") return !!getInternalSlot(O, "Extensible");
    return false;
}

function PreventExtensions(O) {
    setInternalSlot(O, "Extensible", false);
}
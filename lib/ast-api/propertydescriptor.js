function readPropertyDescriptor(object, name) {
    if (IsSymbol(name)) return object[SLOTS.SYMBOLS][name.es5id];
    return object[SLOTS.BINDINGS][name];
}
function writePropertyDescriptor(object, name, value) {
    if (IsSymbol(name))    return object[SLOTS.SYMBOLS][name.es5id] = value;
    return object[SLOTS.BINDINGS][name] = value;
}
function CreateOwnAccessorProperty(O, P, G, S) {
    Assert(Type(O) === OBJECT, "CreateAccessorProperty1");
    Assert(IsPropertyKey(P), "CreateAccessorProperty2");
    var D = Object.create(null);
    D.get = G;
    D.set = S;
    D.enumerable = true;
    D.configurable = true;
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, P, D);
}
function CreateDataProperty(O, P, V) {
    Assert(Type(O) === OBJECT, "CreateDataProperty1");
    Assert(IsPropertyKey(P), "CreateDataProperty2");
    var newDesc = Object.create(null);
    newDesc.value = V;
    newDesc.writable = true;
    newDesc.enumerable = true;
    newDesc.configurable = true;
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, P, newDesc);
}
function CreateDataPropertyOrThrow(O, P, V) {
    Assert(Type(O) === OBJECT, "CreateDataPropertyOrThrow1");
    Assert(IsPropertyKey(P), "CreateDataPropertyOrThrow2");
    var success = CreateDataProperty(O, P, V);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return newTypeError(format("CREATEDATAPROPERTYORTHROW_FAILED"));
    return success;
}
function IsPropertyKey(P) {
    return (typeof P === "string") || (P instanceof SymbolPrimitiveType);
}
function PropertyDescriptor(V, W, E, C) {
    var D = Object.create(null);
    D.value = V;
    D.writable = W !== undefined ? W : true;
    D.enumerable = E !== undefined ? E : true;
    D.configurable = C !== undefined ? C : true;
    return D;
}
function IsAccessorDescriptor(desc) {
    if (desc == null) return false;
    if (typeof desc !== "object") return false;
    return ("get" in desc) || ("set" in desc);
}
function IsDataDescriptor(desc) {
    if (desc == null) return false;
    if (typeof desc !== "object") return false;
    return ("value" in desc) || ("writable" in desc);
}
function IsGenericDescriptor(desc) {    // hat nur enum oder config props
    if (desc === null) return false;
    if (typeof desc !== "object") return false;
    return !IsAccessorDescriptor(desc) && !IsDataDescriptor(desc) &&
        (("configurable" in desc) || ("enumerable" in desc));
}
function FromPropertyDescriptor(desc) {
    if (desc == undefined) return undefined;
    if (desc.Origin) return desc.Origin;
    var obj = ObjectCreate();
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, "value", PropertyDescriptor(desc.value, true, true, true));
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, "writable", PropertyDescriptor(desc.writable, true, true, true));
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, "get", PropertyDescriptor(desc.get, true, true, true));
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, "set", PropertyDescriptor(desc.set, true, true, true));
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, "enumerable", PropertyDescriptor(desc.enumerable, true, true, true));
    callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, "configurable", PropertyDescriptor(desc.configurable, true, true, true));
    return obj;
}
function ToPropertyDescriptor(O) {
    if (isAbrupt(O = ifAbrupt(O))) return O;
    if (Type(O) !== OBJECT) return newTypeError(format("S_NOT_OBJECT", "ToPropertyDescriptor: argument"));
    var desc = Object.create(null);
    if (HasProperty(O, "enumerable")) {
        var enume = Get(O, "enumerable");
        if (isAbrupt(enume = ifAbrupt(enume))) return enume;
        desc.enumerable = enume;
    }
    if (HasProperty(O, "writable")) {
        var write = Get(O, "writable");
        if (isAbrupt(write = ifAbrupt(write))) return write;
        desc.writable = write;
    }
    if (HasProperty(O, "configurable")) {
        var conf = Get(O, "configurable");
        if (isAbrupt(conf = ifAbrupt(conf))) return conf;
        desc.configurable = conf;
    }
    if (HasProperty(O, "value")) {
        var value = Get(O, "value");
        if (isAbrupt(value = ifAbrupt(value))) return value;
        desc.value = value;
    }
    if (HasProperty(O, "get")) {
        var get = Get(O, "get");
        if (isAbrupt(get = ifAbrupt(get))) return get;
        desc.get = get;
    }
    if (HasProperty(O, "set")) {
        var set = Get(O, "set");
        if (isAbrupt(set = ifAbrupt(set))) return set;
        desc.set = set;
    }
    desc.Origin = O;
    return desc;
}
function IsCompatiblePropertyDescriptor(extensible, Desc, current) {
    return ValidateAndApplyPropertyDescriptor(undefined, undefined, extensible, Desc, current);
}
function CompletePropertyDescriptor(Desc, LikeDesc) {
    Assert(typeof LikeDesc === "object" || LikeDesc === undefined, "LikeDesc has to be object or undefined");
    Assert(typeof Desc === "object");
    if (LikeDesc === undefined) LikeDesc = {
        value: undefined,
        writable: false,
        get: undefined,
        set: undefined,
        enumerable: false,
        configurable: false
    };
    if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
        if (typeof Desc.writable === "undefined") Desc.writable = LikeDesc.writable;
        if (typeof Desc.value === "undefined") Desc.value = LikeDesc.value;
    } else {
        if (typeof Desc.get === "undefined") Desc.get = LikeDesc.get;
        if (typeof Desc.set === "undefined") Desc.set = LikeDesc.set;
    }
    if (typeof Desc.enumerable === "undefined") Desc.enumerable = LikeDesc.enumerable;
    if (typeof Desc.configurable === "undefined") Desc.configurable = LikeDesc.configurable;
    return Desc;
}
function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current) {
    var same = true, d;
    var isDataDesc = IsDataDescriptor(Desc);
    var isGenericDesc = IsGenericDescriptor(Desc);
    var isAccessorDesc = IsAccessorDescriptor(Desc);

    if (O) Assert(IsPropertyKey(P), "ValidateAndApplyPropertyDescriptor: expecting property key if object is present");

    Assert(typeof Desc === "object", "ValidateAndApplyPropertyDescriptor: Desc must be a descriptor object (btw. !!current is " + ( !!current) + ")");

    var changeType = "reconfigure"; // o.observe
    if (!current) {
        if (!extensible) return false;
        Assert(extensible, "object has to be extensible");
        if (isGenericDesc || isDataDesc || isAccessorDesc) {
            if (O !== undefined) {
                writePropertyDescriptor(O, P, Desc);
            }
        }
        // observe start
        // var R = CreateChangeRecord("add", O, P, current, Desc);
        // EnqueueChangeRecord(O, R);
        // observe end
        return true;
    } else if (current && Desc) {
        var isDataCurrent = IsDataDescriptor(current);
        var isGenericCurrent = IsGenericDescriptor(current);
        var isAccessorCurrent = IsAccessorDescriptor(current);
        if (Desc.get === undefined &&
            Desc.set === undefined &&
            Desc.writable === undefined &&
            Desc.enumerable === undefined &&
            Desc.configurable === undefined &&
            Desc.value === undefined) {
            return true;
        }
        for (d in Desc) {
            if (Object.hasOwnProperty.call(Desc, d))
                if (current[d] !== Desc[d]) same = false;
        }
        if (same) return true;
        if (current.configurable === false) {
            if (Desc.configurable === true) return false;
            if (Desc.enumerable === !current.enumerable) return false;
        }
        if (isDataCurrent && isDataDesc) {
            if (current.configurable === false) {
                if (!current.writable === Desc.writable) return false;
                if (!current.writable) {
                    if (("value" in Desc) && (current.value !== Desc.value)) return false;
                }
            }
        } else if (isAccessorCurrent && isAccessorDesc) {
            if (current.configurable === false) {
                if (("set" in Desc) && (Desc.set !== current.set)) return false;
                if (("get" in Desc) && (Desc.get !== current.get)) return false;
            }
        } else if (isGenericDesc) {
            if (current.configurable === false) return false;
            // convert to accessor
            if (isDataCurrent) {
                if (O !== undefined) {
                    writePropertyDescriptor(O, P, {
                        get: undefined,
                        set: undefined,
                        enumerable: current.enumerable,
                        configurable: current.configurable
                    });
                    return true;
                }
                // convert to data
            } else if (isAccessorCurrent) {
                if (O !== undefined) {
                    writePropertyDescriptor(O, P, {
                        value: undefined,
                        writable: false,
                        enumerable: current.enumerable,
                        configurable: current.configurable
                    });
                    return true;
                }
            }
        }
        if (O !== undefined) {
            if (isDataDesc && !current.writable) return false;
            for (d in Desc) {
                if (Object.hasOwnProperty.call(Desc, d)) {
                    current[d] = Desc[d];
                }
            }
            writePropertyDescriptor(O, P, current);
        }
        return true;
    }
}
/**
 * Created by root on 30.03.14.
 */
    // ===========================================================================================================
    // CreateDataProperty
    // ===========================================================================================================

function CreateOwnAccessorProperty(O, P, G, S) {
    Assert(Type(O) === "object", "CreateAccessorProperty: first argument has to be an object.");
    Assert(IsPropertyKey(P), "CreateAccessorProperty: second argument has to be a valid property key.");
    var D = Object.create(null);
    D.get = G;
    D.set = S;
    D.enumerable = true;
    D.configurable = true;
    return callInternalSlot("DefineOwnProperty", O, P, D);
}

function CreateDataProperty(O, P, V) {
    Assert(Type(O) === "object", "CreateDataProperty: first argument has to be an object.");
    Assert(IsPropertyKey(P), "CreateDataProperty: second argument has to be a valid property key.");
    var newDesc = Object.create(null);
    newDesc.value = V;
    newDesc.writable = true;
    newDesc.enumerable = true;
    newDesc.configurable = true;
    return callInternalSlot("DefineOwnProperty", O, P, newDesc);
}

function CreateDataPropertyOrThrow(O, P, V) {
    Assert(Type(O) === "object", "CreateDataPropertyOrThrow: first argument has to be an object.");
    Assert(IsPropertyKey(P), "CreateDataPropertyOrThrow: second argument has to be a valid property key.");
    var success = CreateDataProperty(O, P, V);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return withError("Type", "CreateDataPropertyOrThrow: CreateDataProperty failed and returned false.");
    return success;
}

function IsPropertyKey(P) {
    if (typeof P === "string") return true;
    if (P instanceof SymbolPrimitiveType) return true;
    return false;
}

function PropertyDescriptor(V, W, E, C) {
    var D = Object.create(null); //Object.create(null);
    D.value = V;
    D.writable = W !== undefined ? W : true;
    D.enumerable =  E !== undefined ? E : true;
    D.configurable =  C !== undefined ? C : true;
    return D;
}

function IsAccessorDescriptor(desc) {
    if (desc == null) return false;
    if (typeof desc !== "object") return false;
    if (("get" in desc) || ("set" in desc)) return true;
    return false;
}

function IsDataDescriptor(desc) {
    if (desc == null) return false;
    if (typeof desc !== "object") return false;
    if (("value" in desc) || ("writable" in desc)) return true;
    return false;
}

function IsGenericDescriptor(desc) {    // hat nur enum oder config props
    if (desc === null) return false;
    if (typeof desc !== "object") return false;
    if (!IsAccessorDescriptor(desc) && !IsDataDescriptor(desc) &&
        (("configurable" in desc) || ("enumerable" in desc))) return true;
    return false;
}

function FromPropertyDescriptor(desc) {
    if (desc == undefined) return undefined;
    if (desc.Origin) return desc.Origin;
    var obj = ObjectCreate();
    callInternalSlot("DefineOwnProperty", obj,"value",        PropertyDescriptor(desc.value, true, true, true));
    callInternalSlot("DefineOwnProperty", obj,"writable",     PropertyDescriptor(desc.writable, true, true, true));
    callInternalSlot("DefineOwnProperty", obj,"get",          PropertyDescriptor(desc.get, true, true, true));
    callInternalSlot("DefineOwnProperty", obj,"set",          PropertyDescriptor(desc.set, true, true, true));
    callInternalSlot("DefineOwnProperty", obj,"enumerable",   PropertyDescriptor(desc.enumerable, true, true, true));
    callInternalSlot("DefineOwnProperty", obj,"configurable", PropertyDescriptor(desc.configurable, true, true, true));
    return obj;
}

function ToPropertyDescriptor(O) {
    if (isAbrupt(O = ifAbrupt(O))) return O;
    if (Type(O) !== "object") return withError("Type", "ToPropertyDescriptor: argument is not an object");
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

    Assert(typeof Desc === "object", "ValidateAndApplyPropertyDescriptor: Desc must be a descriptor object (btw. current is " + ( !! current) + ")");

    var changeType = "reconfigure"; // o.observe

    if (!current) {

        if (!extensible) return false;

        Assert(extensible, "object has to be extensible");

        if (isGenericDesc || isDataDesc || isAccessorDesc) {
            if (O !== undefined) {
                writePropertyDescriptor(O, P, Desc);
            }
        }
        //  var R = CreateChangeRecord("add", O, P, current, Desc);
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

            /*if (current.writable) {
             writePropertyDescriptor(O, P, Desc);
             return true;
             }*/

        } else if (isAccessorCurrent && isAccessorDesc) {

            if (current.configurable === false) {
                if (("set" in Desc) && (Desc.set !== current.set)) return false;
                if (("get" in Desc) && (Desc.get !== current.get)) return false;
            }/* else {
             if (Desc.set === undefined) Desc.set === current.set;
             if (Desc.get === undefined) Desc.get === current.get;
             writePropertyDescriptor(O, P, Desc);
             return true;
             }*/

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


function GetMethod(O, P) {
    Assert(Type(O) === "object" && IsPropertyKey(P) === true, "o has to be object and p be a valid key");
    var method = callInternalSlot("Get", O, P, O);
    if (isAbrupt(method = ifAbrupt(method))) return method;
    if (IsCallable(method)) return method;
    else return withError("Type", "GetMethod: " + P + " can not be retrieved");
}

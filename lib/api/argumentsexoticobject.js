
// ===========================================================================================================
// Arguments Object
// ===========================================================================================================

function ArgumentsExoticObject() {
    var O = Object.create(ArgumentsExoticObject.prototype);

    setInternalSlot(O, "Bindings", Object.create(null));
    setInternalSlot(O, "Symbols", Object.create(null));

    setInternalSlot(O, "Prototype", getIntrinsic("%ArrayPrototype%"));

    var map = ObjectCreate();
    setInternalSlot(map, "toString", function () {
        return "[object ParameterMap]";
    });
    setInternalSlot(O, "ParameterMap", map);

    return O;
}
ArgumentsExoticObject.prototype = assign(ArgumentsExoticObject.prototype, {

    type: "object",

    toString: function () {
        return "[object ArgumentsExoticObject]";
    },

    Get: function (P) {
        var ao = this;
        var map = getInternalSlot(ao, "ParameterMap");
        var isMapped = map.GetOwnProperty(P);
        if (!isMapped) {
            var v = OrdinaryGetOwnProperty(ao, P);
            if (v !== undefined) v = v.value;
            if (P === "caller" && (Type(v) === "object" && (IsCallable(v) || IsConstructor(v))) && getInternalSlot(v, "Strict")) {
                return withError("Type", "Arguments.Get: Can not access 'caller' in strict mode");
            }
            return v;
        } else {
            return Get(map, P);
        }

    },
    GetOwnProperty: function (P) {
        var ao = this;
        var desc = readPropertyDescriptor(this, P);
        if (desc === undefined) return desc;
        var map = getInternalSlot(ao, "ParameterMap");
        var isMapped = callInternalSlot("GetOwnProperty", map, P);
        if (isMapped) desc.value = Get(map, P);
        return desc;
    },


    // Muss definitiv einen Bug haben.
    DefineOwnProperty: function (P, Desc) {
        var ao = this;
        var map = getInternalSlot(ao, "ParameterMap");
        var isMapped = callInternalSlot("GetOwnProperty", map, P);
        var allowed = OrdinaryDefineOwnProperty(ao, P, Desc);

        var putStatus;
        if (isAbrupt(allowed = ifAbrupt(allowed))) return allowed;

        if (!allowed) return allowed;

        if (isMapped) {

            if (IsAccessorDescriptor(Desc)) {
                callInternalSlot("Delete", map, P);
            } else {
                if (Desc["value"] !== undefined) putStatus = Put(map, P, Desc.value, false);
                Assert(putStatus === true, "Arguments::DefineOwnProperty: putStatus has to be true");
                if (Desc.writable === false) callInternalSlot("Delete", map, P);
            }
        }
        return true;
    },
    Delete: function (P) {
        var map = getInternalSlot(this, "ParameterMap");
        var isMapped = callInternalSlot("GetOwnProperty", map, P);
        var result = Delete(this, P);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        if (result && isMapped) callInternalSlot("Delete", map, P);
    },

    constructor: ArgumentsExoticObject
});

addMissingProperties(ArgumentsExoticObject.prototype, OrdinaryObject.prototype);

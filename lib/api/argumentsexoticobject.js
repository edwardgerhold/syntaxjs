
function ArgumentsExoticObject() {
    var O = Object.create(ArgumentsExoticObject.prototype);

    setInternalSlot(O, SLOTS.BINDINGS, Object.create(null));
    setInternalSlot(O, SLOTS.SYMBOLS, Object.create(null));

    setInternalSlot(O, SLOTS.PROTOTYPE, getIntrinsic("%ArrayPrototype%"));

    var map = ObjectCreate();
    setInternalSlot(map, "toString", function () {
        return "[object ParameterMap]";
    });
    setInternalSlot(O, SLOTS.PARAMETERMAP, map);

    return O;
}
ArgumentsExoticObject.prototype = {

    toString: function () {
        return "[object ArgumentsExoticObject]";
    },

    Get: function (P) {
        var ao = this;
        var map = getInternalSlot(ao, SLOTS.PARAMETERMAP);
        var isMapped = map.GetOwnProperty(P);
        if (!isMapped) {
            var v = OrdinaryGetOwnProperty(ao, P);
            if (v !== undefined) v = v.value;
            if (P === "caller" && (Type(v) === OBJECT && (IsCallable(v) || IsConstructor(v))) && getInternalSlot(v, SLOTS.STRICT)) {
                return newTypeError( "Arguments.Get: Can not access 'caller' in strict mode");
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
        var map = getInternalSlot(ao, SLOTS.PARAMETERMAP);
        var isMapped = callInternalSlot(SLOTS.GETOWNPROPERTY, map, P);
        if (isMapped) desc.value = Get(map, P);
        return desc;
    },


    DefineOwnProperty: function (P, Desc) {
        var ao = this;
        var map = getInternalSlot(ao, SLOTS.PARAMETERMAP);
        var isMapped = callInternalSlot(SLOTS.GETOWNPROPERTY, map, P);
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
        var map = getInternalSlot(this, SLOTS.PARAMETERMAP);
        var isMapped = callInternalSlot(SLOTS.GETOWNPROPERTY, map, P);
        var result = Delete(this, P);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        if (result && isMapped) callInternalSlot("Delete", map, P);

    },

    constructor: ArgumentsExoticObject
};

addMissingProperties(ArgumentsExoticObject.prototype, OrdinaryObject.prototype);

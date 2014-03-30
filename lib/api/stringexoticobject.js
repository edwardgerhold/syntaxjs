// ===========================================================================================================
// String Exotic Object
// ===========================================================================================================

function StringExoticObject() {
    var S = Object.create(StringExoticObject.prototype);
    setInternalSlot(S, "Bindings", Object.create(null));
    setInternalSlot(S, "Symbols", Object.create(null));
    setInternalSlot(S, "Extensible", true);
    return S;
}

StringExoticObject.prototype = assign(StringExoticObject.prototype, {
    HasOwnProperty: function (P) {
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var has = HasOwnProperty(O, P);
        if (isAbrupt(has = ifAbrupt(has))) return has;
        if (has) return has;
        if (Type(P) !== "string") return false;
        var index = ToInteger(P);
        if (isAbrupt(index = ifAbrupt(index))) return index;
        var absIndex = ToString(abs(index));
        if (SameValue(absIndex, P) === false) return false;
        var str = this.StringData;
        var len = str.length;
        if (len <= index) return false;
        return true;
    },
    GetOwnProperty: function (P) {
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var desc = OrdinaryGetOwnProperty(this, P);
        if (isAbrupt(desc = ifAbrupt(desc))) return desc;
        if (desc !== undefined) return desc;
        if (Type(P) !== "string") return undefined;
        var index = ToInteger(P);
        if (isAbrupt(index = ifAbrupt(index))) return index;
        var absIndex = ToString(abs(index));
        if (SameValue(absIndex, P) === false) return undefined;
        var str = getInternalSlot(this, "StringData");
        var len = str.length;
        if (len <= index) return undefined;
        var resultStr = str[index];
        return {
            value: resultStr,
            enumerable: true,
            writable: false,
            configurable: false
        };
    },
    DefineOwnProperty: function (P, D) {
        var O = this;
        var current = callInternalSlot("GetOwnProperty", O, P);
        var extensible = IsExtensible(this);
        return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
    },
    Enumerate: function () {
        return Enumerate(this);
    },
    OwnPropertyKeys: function () {
        return OwnPropertyKeys(this);
    },
    toString: function () {
        return "[object StringExoticObject]";
    },
    type: "object"
});
addMissingProperties(StringExoticObject.prototype, OrdinaryObject.prototype);

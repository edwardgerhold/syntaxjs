function StringExoticObject() {
    var S = Object.create(StringExoticObject.prototype);
    setInternalSlot(S, SLOTS.BINDINGS, Object.create(null));
    setInternalSlot(S, SLOTS.SYMBOLS, Object.create(null));
    setInternalSlot(S, SLOTS.EXTENSIBLE, true);
    return S;
}
StringExoticObject.prototype = assign(StringExoticObject.prototype, {
    HasOwnProperty: function (P) {
        Assert(IsPropertyKey(P), translate("P_HAS_TO_BE_A_VALID_PROPERTY_KEY"));
        var has = HasOwnProperty(O, P);
        if (isAbrupt(has = ifAbrupt(has))) return has;
        if (has) return has;
        if (Type(P) !== STRING) return false;
        var index = ToInteger(P);
        if (isAbrupt(index = ifAbrupt(index))) return index;
        var absIndex = ToString(abs(index));
        if (SameValue(absIndex, P) === false) return false;
        var str = this.StringData;
        var len = str.length;
        return len > index;

    },
    GetOwnProperty: function (P) {
        Assert(IsPropertyKey(P), translate("P_HAS_TO_BE_A_VALID_PROPERTY_KEY"));
        var desc = OrdinaryGetOwnProperty(this, P);
        if (isAbrupt(desc = ifAbrupt(desc))) return desc;
        if (desc !== undefined) return desc;
        if (Type(P) !== STRING) return undefined;
        var index = ToInteger(P);
        if (isAbrupt(index = ifAbrupt(index))) return index;
        var absIndex = ToString(abs(index));
        if (SameValue(absIndex, P) === false) return undefined;
        var str = getInternalSlot(this, SLOTS.STRINGDATA);
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
        var current = callInternalSlot(SLOTS.GETOWNPROPERTY, O, P);
        var extensible = IsExtensible(this);
        return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
    },
    Enumerate: function () {
        var keys = [];
        var O = this;
        var str = getInternalSlot(O, SLOTS.STRINGDATA);
        var len = str.length;
        for (var i = 0; i < len; i++) keys.push(ToString(i));
        var iterator = Enumerate(this);
        var list = getInternalSlot(iterator, SLOTS.ITERATEDLIST);
        list = keys.concat(list);
        setInternalSlot(iterator, SLOTS.ITERATEDLIST, list);
        return NormalCompletion(list);
    },
    OwnPropertyKeys: function () {
        // just a thrown up
        var keys = [];
        var O = this;
        var str = getInternalSlot(O, SLOTS.STRINGDATA);
        var len = str.length;
        for (var i = 0; i < len; i++) keys.push(ToString(i));
        var bindings = getInternalSlot(O, SLOTS.BINDINGS);
        for (var p in bindings) {
            var P = +p;
            if (ToInteger(P) >= len) keys.push(P);
        }
        for (p in bindings) {
            P = +p;
            if (P != P)
                keys.push(p);
        }
        var symbols = getInternalSlot(O, SLOTS.SYMBOLS)
        for (p in symbols) {
            var s = symbols[p];
            if (s && s.symbol) {	// have to add and
                keys.push(s.symbol);	// repair
            }				// a ES5KEY-SYMBOL-REGISTRY
            // to remove .symbol backref from desc
            // (couldnt get from es5id the sym back w/o reggi)
        }
        return CreateArrayFromList(keys);
    },
    toString: function () {
        return "[object StringExoticObject]";
    },
    type: "object"
});
addMissingProperties(StringExoticObject.prototype, OrdinaryObject.prototype);
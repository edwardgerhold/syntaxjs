
// ===========================================================================================================
// Boolean Constructor and Prototype
// ===========================================================================================================

setInternalSlot(BooleanConstructor, "Call", function Call(thisArg, argList) {
    var O = thisArg;
    var value = argList[0];
    var b = ToBoolean(value);
    if (Type(O) === OBJECT && hasInternalSlot(O, "BooleanData") && getInternalSlot(O, "BooleanData") === undefined) {
        setInternalSlot(O, "BooleanData", b);
        return NormalCompletion(O);
    }
    return NormalCompletion(b);
});
setInternalSlot(BooleanConstructor, "Construct", function Construct(argList) {
    return OrdinaryConstruct(this, argList);
});
MakeConstructor(BooleanConstructor, true, BooleanPrototype);
DefineOwnProperty(BooleanConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = thisArg;
        var obj = OrdinaryCreateFromConstructor(F, "%BooleanPrototype%", {
            "BooleanData": undefined
        });
        return obj;
    }),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(BooleanConstructor, "length", {
    value: 1,
    enumerable: false,
    writable: false,
    configurable: false
});
DefineOwnProperty(BooleanPrototype, "constructor", {
    value: BooleanConstructor,
    enumerable: false,
    writable: false,
    configurable: false
});
DefineOwnProperty(BooleanPrototype, "toString", {
    value: CreateBuiltinFunction(realm, function toString(thisArg, argList) {
        var b = thisBooleanValue(thisArg);
        if (isAbrupt(b)) return b;
        if (b === true) return "true";
        if (b === false) return "false";
    }),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(BooleanPrototype, "valueOf", {
    value: CreateBuiltinFunction(realm, function valueOf(thisArg, argList) {
        return thisBooleanValue(thisArg);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});
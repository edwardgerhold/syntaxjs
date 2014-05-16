/**
 * Created by root on 31.03.14.
 */
function thisBooleanValue(value) {
    if (value instanceof CompletionRecord) return thisBooleanValue(value.value);
    if (typeof value === "boolean") return value;
    if (Type(value) === BOOLEAN) return value;
    if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.BOOLEANDATA)) {
        var b = getInternalSlot(value, SLOTS.BOOLEANDATA);
        if (typeof b === "boolean") return b;
    }
    return newTypeError( "thisBooleanValue: value is not a Boolean");
}


var BooleanConstructor_call = function (thisArg, argList) {
    var O = thisArg;
    var value = argList[0];
    var b = ToBoolean(value);
    if (Type(O) === OBJECT && hasInternalSlot(O, SLOTS.BOOLEANDATA) && getInternalSlot(O, SLOTS.BOOLEANDATA) === undefined) {
        setInternalSlot(O, SLOTS.BOOLEANDATA, b);
        return NormalCompletion(O);
    }
    return NormalCompletion(b);
}

var BooleanConstructor_construct = function (argList) {
    return OrdinaryConstruct(this, argList);
};

var BooleanConstructor_$$create = function (thisArg, argList) {
    return OrdinaryCreateFromConstructor(thisArg, INTRINSICS.BOOLEANPROTOTYPE,[SLOTS.BOOLEANDATA]);
};

var BooleanPrototype_toString = function toString(thisArg, argList) {
    var b = thisBooleanValue(thisArg);
    if (isAbrupt(b)) return b;
    if (b === true) return "true";
    if (b === false) return "false";
};

var BooleanPrototype_valueOf = function (thisArg, argList) {
    return thisBooleanValue(thisArg);
};

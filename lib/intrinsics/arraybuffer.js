


// ===========================================================================================================
// ArrayBuffer
// ===========================================================================================================

setInternalSlot(ArrayBufferConstructor, "Call", function (thisArg, argList) {
    var length = argList[0];
    var O = thisArg;
    if (Type(O) !== "object" || (!hasInternalSlot(O, "ArrayBufferData")) || (getInternalSlot(O, "ArrayBufferData") !== undefined)) {
        return withError("Type", "Can not initialise the this argument as an ArrayBuffer or it is already initialised!");
    }
    Assert(getInternalSlot(O, "ArrayBufferData") === undefined, "ArrayBuffer has already to be initialised here but it is not.");
    var numberLength = ToNumber(length);
    var byteLength = ToInteger(numberLength);
    if (isAbrupt(byteLength = ifAbrupt(byteLength))) return byteLength;
    if ((numberLength != byteLength) || (byteLength < 0)) return withError("Range", "invalid byteLength");
    return SetArrayBufferData(O, byteLength);
});

setInternalSlot(ArrayBufferConstructor, "Construct", function (argList) {
    var F = ArrayBufferConstructor;
    return OrdinaryConstruct(F, argList);
});


setInternalSlot(ArrayBufferConstructor, "Prototype", FunctionPrototype);
DefineOwnProperty(ArrayBufferConstructor, "prototype", {
    value: ArrayBufferPrototype,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(ArrayBufferConstructor, "isView", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var arg = argList[0];
        if (Type(arg) !== "object") return false;
        return hasInternalSlot(arg, "ViewedArrayBuffer");

    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(ArrayBufferConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = thisArg;
        return AllocateArrayBuffer(F);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(ArrayBufferPrototype, "constructor", {
    value: ArrayBufferConstructor,
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(ArrayBufferPrototype, $$toStringTag, {
    value: "ArrayBuffer",
    writable: false,
    enumerable: false,
    configurable: false
});
setInternalSlot(ArrayBufferPrototype, "Prototype", ObjectPrototype);
DefineOwnProperty(ArrayBufferPrototype, "byteLength", {
    get: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var O = thisArg;
        if (!hasInternalSlot(O, "ArrayBufferData")) return withError("Type", "The this argument hasnÂ´t [[ArrayBufferData]]");
        if (getInternalSlot(O, "ArrayBufferData") === undefined) return withError("Type", "The this arguments [[ArrayBufferData]] is not initialised");
        var length = getInternalSlot(O, "ArrayBufferByteLength");
        return length;
    }),
    set: undefined,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(ArrayBufferPrototype, "slice", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var start = argList[0];
        var end = argList[1];
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

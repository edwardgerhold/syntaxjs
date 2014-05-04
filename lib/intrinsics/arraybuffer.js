


// ===========================================================================================================
// ArrayBuffer
// ===========================================================================================================

setInternalSlot(ArrayBufferConstructor, SLOTS.CALL, function (thisArg, argList) {
    var length = argList[0];
    var O = thisArg;
    if (Type(O) !== OBJECT || (!hasInternalSlot(O, SLOTS.ARRAYBUFFERDATA)) || (getInternalSlot(O, SLOTS.ARRAYBUFFERDATA) !== undefined)) {
        return newTypeError( "Can not initialize the this argument as an ArrayBuffer or it is already initialized!");
    }
    Assert(getInternalSlot(O, SLOTS.ARRAYBUFFERDATA) === undefined, "ArrayBuffer has already to be initialized here but it is not.");
    var numberLength = ToNumber(length);
    var byteLength = ToInteger(numberLength);
    if (isAbrupt(byteLength = ifAbrupt(byteLength))) return byteLength;
    if ((numberLength != byteLength) || (byteLength < 0)) return newRangeError( "invalid byteLength");
    return SetArrayBufferData(O, byteLength);
});

setInternalSlot(ArrayBufferConstructor, SLOTS.CONSTRUCT, function (argList) {
    var F = ArrayBufferConstructor;
    return OrdinaryConstruct(F, argList);
});


setInternalSlot(ArrayBufferConstructor, SLOTS.PROTOTYPE, FunctionPrototype);
DefineOwnProperty(ArrayBufferConstructor, "prototype", {
    value: ArrayBufferPrototype,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(ArrayBufferConstructor, "isView", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var arg = argList[0];
        if (Type(arg) !== OBJECT) return false;
        return hasInternalSlot(arg, SLOTS.VIEWEDARRAYBUFFER);

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
setInternalSlot(ArrayBufferPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
DefineOwnProperty(ArrayBufferPrototype, "byteLength", {
    get: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var O = thisArg;
        if (!hasInternalSlot(O, SLOTS.ARRAYBUFFERDATA)) return newTypeError( "The this argument hasnÂ´t [[ArrayBufferData]]");
        if (getInternalSlot(O, SLOTS.ARRAYBUFFERDATA) === undefined) return newTypeError( "The this arguments [[ArrayBufferData]] is not initialized");
        var length = getInternalSlot(O, SLOTS.ARRAYBUFFERBYTELENGTH);
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

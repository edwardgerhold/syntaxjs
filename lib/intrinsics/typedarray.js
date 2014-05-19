function createTypedArrayPrototype(proto) {
    NowDefineAccessor(proto, "buffer", CreateBuiltinFunction(realm, TypedArrayPrototype_get_buffer, 0, "get buffer"));
    NowDefineAccessor(proto, "byteLength", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteLength, 0, "get byteLength"));
    NowDefineAccessor(proto, "byteOffset", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteOffset, 0, "get byteOffset"));
    NowDefineAccessor(proto, $$toStringTag, CreateBuiltinFunction(realm, TypedArrayPrototype_get_$$toStringTag, 0, "get [Symbol.toStringTag]"));
    NowDefineBuiltinFunction(proto, "forEach", 1, TypedArrayPrototype_map);
    NowDefineBuiltinFunction(proto, "map", 1, TypedArrayPrototype_map);
    NowDefineBuiltinFunction(proto, "reduce", 1, TypedArrayPrototype_reduce);
    return proto;
}
function createTypedArrayVariant(_type, _bpe, _ctor, _proto, ctorName) {
    setInternalSlot(_ctor, SLOTS.REALM, getRealm());
    setInternalSlot(_ctor, SLOTS.TYPEDARRAYCONSTRUCTOR, ctorName);
    setInternalSlot(_ctor, SLOTS.PROTOTYPE, TypedArrayConstructor);
    setInternalSlot(_ctor, SLOTS.CALL, function (thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT) return newTypeError( "O is not an object");
        if (!hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return newTypeError( "[[TypedArrayName]] is missing");
        var suffix = "Array";
        if (_type === "Uint8C") suffix = "lamped" + suffix;
        setInternalSlot(O, SLOTS.TYPEDARRAYNAME, _type + suffix);
        var F = this;
        var realmF = getInternalSlot(F, SLOTS.REALM);
        var sup = Get(realmF.intrinsics, INTRINSICS.TYPEDARRAY);
        var args = argList;
        return callInternalSlot(SLOTS.CALL, sup, O, args);
    });
    setInternalSlot(_ctor, SLOTS.CONSTRUCT, function (argList) {
        return OrdinaryConstruct(this, argList);
    });
    NowDefineBuiltinConstant(_ctor, "BYTES_PER_ELEMENT", _bpe);
    NowDefineBuiltinConstant(_ctor, "prototype", _proto);
    NowDefineBuiltinConstant(_proto, "constructor", _ctor);
    createTypedArrayPrototype(_proto);
    return _ctor;
}
setInternalSlot(TypedArrayConstructor, SLOTS.CALL, TypedArrayConstructor_Call);
NowDefineProperty(TypedArrayConstructor, $$create, CreateBuiltinFunction(realm, TypedArrayConstructor_$$create, 0, "[Symbol.create]"));
NowDefineProperty(TypedArrayConstructor, "from", CreateBuiltinFunction(realm, TypedArrayConstructor_from, 1, "from"));
NowDefineProperty(TypedArrayConstructor, "of", CreateBuiltinFunction(realm, TypedArrayConstructor_of, 2, "of"));
createTypedArrayVariant("Int8", 1, Int8ArrayConstructor, Int8ArrayPrototype, "Int8Array");
createTypedArrayVariant("Uint8", 1, Uint8ArrayConstructor, Int8ArrayPrototype, "Uint8Array");
createTypedArrayVariant("Uint8C", 1, Uint8ClampedArrayConstructor, Uint8ClampedArrayPrototype, "Uint8Clamped");
createTypedArrayVariant("Int16", 2, Int16ArrayConstructor, Int16ArrayPrototype, "Int16Array");
createTypedArrayVariant("Uint16", 2, Uint16ArrayConstructor, Uint16ArrayPrototype, "Uint16Array");
createTypedArrayVariant("Int32", 4, Int32ArrayConstructor, Int32ArrayPrototype, "Int32Array");
createTypedArrayVariant("Uint32", 4, Uint32ArrayConstructor, Uint32ArrayPrototype, "Uint32Array");
createTypedArrayVariant("Float32", 8, Float32ArrayConstructor, Float32ArrayPrototype, "Float32Array");
createTypedArrayVariant("Float64", 8, Float64ArrayConstructor, Float64ArrayPrototype, "Float64Array");
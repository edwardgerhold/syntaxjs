
var DataViewConstructor_Call= function (thisArg, argList) {
    var O = thisArg;
    var buffer = argList[0];
    var byteOffset = argList[1];
    var byteLength = argList[2];
    if (byteOffset === undefined) byteOffset = 0;
    if (Type(O) !== "object" || !hasInternalSlot(O, "DataView")) return withError("Type", "DataView object expected");
    Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "O has to have a ViewedArrayBuffer slot.");
    var viewedArrayBuffer = getInternalSlot(O, "ViewedArrayBuffer");
    if (viewedArrayBuffer !== undefined) return withError("Type", "ViewedArrayBuffer of DataView has to be undefined.");
    if (Type(buffer) !== "object") return withError("Type", "buffer has to be an arraybuffer object");
    var arrayBufferData;
    if (!hasInternalSlot(buffer, "ArrayBufferData")) return withError("Type", "In DataView(buffer), buffer has to have ArrayBufferData slot");
    arrayBufferData = getInternalSlot(buffer, "ArrayBufferData");
    if (arrayBufferData === undefined) return withError("Type", "arrayBufferData of buffer may not be undefined");
    var numberOffset = ToNumber(byteOffset);
    var offset = ToInteger(numberOffset);
    if (isAbrupt(offset=ifAbrupt(offset))) return offset;
    if (numberOffset !== offset || offset < 0) return withError("Range", "numberOffset is not equal to offset or is less than 0.");
    var byteBufferLength = getInternalSlot(buffer, "ArrayBufferByteLength");
    if (offset > byteBufferLength) return withError("Range", "offset > byteBufferLength");
    if (byteLength === undefined) {
        var viewByteLength = byteBufferLength - offset;
    } else {
        var numberLength = ToNumber(byteLength);
        var viewLength = ToInteger(numberLength);
        if (isAbrupt(viewLength=ifAbrupt(viewLength))) return viewLength;
        if ((numberLength != viewLength) || viewLength < 0) return withError("Range","numberLength != viewLength or viewLength < 0");
        var viewByteLength = viewLength;
        if ((offset+viewByteLength) > byteBufferLength) return withError("Range","offset + viewByteLength > byteBufferLength");
    }
    if (getInternalSlot(O, "ViewedArrayBuffer") !== undefined) return withError("Type", "ViewedArrayBuffer of O has to be undefined here");
    setInternalSlot(O, "ViewedArrayBuffer", buffer);
    setInternalSlot(O, "ByteLength", viewByteLength);
    setInternalSlot(O, "ByteOffset", offset);
    return NormalCompletion(O);
};

var DataViewConstructor_Construct = function (thisArg, argList) {
    return OrdinaryConstruct(this, argList);
};

var DataViewConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var obj = OrdinaryCreateFromConstructor(F, "%DataViewPrototype%", {
        "DataView": undefined,
        "ViewedArrayBuffer": undefined,
        "ByteLength": undefined,
        "ByteOffset": undefined
    });
    setInternalSlot(obj, "DataView", true);
    return obj;
};

var DataViewPrototype_get_buffer = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== "object") return withError("Type", "O is not an object");
    if (!hasInternalSlot(O, "ViewedArrayBuffer")) return withError("Type", "O has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined but must not");
    return NormalCompletion(buffer);
};

var DataViewPrototype_get_byteLength = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== "object") return withError("Type", "O is not an object");
    if (!hasInternalSlot(O, "ViewedArrayBuffer")) return withError("Type", "O has no ViewedArrayBuffer property");
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined");
    var size = getInternalSlot(O, "ByteLength");
    return NormalCompletion(size);
};

var DataViewPrototype_get_byteOffset = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== "object") return withError("Type", "O is not an object");
    if (!hasInternalSlot(O, "ViewedArrayBuffer")) return withError("Type", "O has no ViewedArrayBuffer property");
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined");
    var offset = getInternalSlot(O, "ByteOffset");
    return NormalCompletion(offset);
};


var DataViewPrototype_getFloat32 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var littleEndian = argList[1];
    if (littleEndian == undefined) littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Float32");
};

var DataViewPrototype_getFloat64 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var littleEndian = argList[1];
    if (littleEndian == undefined) littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Float64");
};

var DataViewPrototype_getInt8 = function (thisArg, argList) {
    var byteOffset = argList[0];
    var v = thisArg;
    return GetViewValue(v, byteOffset, undefined, "Int8");
};

var DataViewPrototype_getInt16 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var littleEndian = argList[1];
    if (littleEndian == undefined) littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Int16");
};


var DataViewPrototype_getInt32 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var littleEndian = argList[1];
    if (littleEndian == undefined) littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Int32");
};


var DataViewPrototype_getUint8 = function (thisArg, argList) {
    var byteOffset = argList[0];
    var v = thisArg;
    return GetViewValue(v, byteOffset, undefined, "Uint8");
};

var DataViewPrototype_getUint16 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var littleEndian = argList[1];
    if (littleEndian == undefined) littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Uint16");
};
var DataViewPrototype_getUint32 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var littleEndian = argList[1];
    if (littleEndian == undefined) littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Uint32");
};

var DataViewPrototype_setFloat32 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    var littleEndian = argList[2];
    if (littleEndian == undefined) littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Float32", value);
};

var DataViewPrototype_setFloat64 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    var littleEndian = argList[2];
    if (littleEndian == undefined) littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Float64", value);
};

var DataViewPrototype_setInt8 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    return SetViewValue(v, byteOffset, undefined, "Int8", value);
};
var DataViewPrototype_setInt16 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    var littleEndian = argList[2];
    if (littleEndian == undefined) littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Int16", value);
};

var DataViewPrototype_setInt32 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    var littleEndian = argList[2];
    if (littleEndian == undefined) littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Int32", value);
};

var DataViewPrototype_setUint8 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    return SetViewValue(v, byteOffset, undefined, "Uint8", value);
};
var DataViewPrototype_setUint16 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    var littleEndian = argList[2];
    if (littleEndian == undefined) littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Uint16", value);
};

var DataViewPrototype_setUint32 = function (thisArg, argList) {
    var v = thisArg;
    var byteOffset = argList[0];
    var value = argList[1];
    var littleEndian = argList[2];
    if (littleEndian == undefined) littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Uint32", value);
};



MakeConstructor(DataViewConstructor, true, DataViewPrototype);
setInternalSlot(DataViewConstructor, "Call", DataViewConstructor_Call);
setInternalSlot(DataViewConstructor, "Construct", DataViewConstructor_Construct);
LazyDefineBuiltinFunction(DataViewConstructor, $$create, 1, DataViewConstructor_$$create);
LazyDefineAccessor(DataViewPrototype, "buffer", CreateBuiltinFunction(realm, DataViewPrototype_get_buffer, 0, "get buffer"));
LazyDefineAccessor(DataViewPrototype, "byteLength", CreateBuiltinFunction(realm, DataViewPrototype_get_byteLength, 0, "get byteLength"));
LazyDefineAccessor(DataViewPrototype, "byteOffset", CreateBuiltinFunction(realm, DataViewPrototype_get_byteOffset, 0, "get byteOffset"));
LazyDefineBuiltinFunction(DataViewPrototype, "getFloat32", 1, DataViewPrototype_getFloat32);
LazyDefineBuiltinFunction(DataViewPrototype, "getFloat64", 1, DataViewPrototype_getFloat64);
LazyDefineBuiltinFunction(DataViewPrototype, "getInt8", 1, DataViewPrototype_getInt8);
LazyDefineBuiltinFunction(DataViewPrototype, "getInt16", 1, DataViewPrototype_getInt16);
LazyDefineBuiltinFunction(DataViewPrototype, "getInt32", 1, DataViewPrototype_getInt32);
LazyDefineBuiltinFunction(DataViewPrototype, "getUint8", 1, DataViewPrototype_getUint8);
LazyDefineBuiltinFunction(DataViewPrototype, "getUint16", 1, DataViewPrototype_getUint16);
LazyDefineBuiltinFunction(DataViewPrototype, "getUint32", 1, DataViewPrototype_getUint32);
LazyDefineBuiltinFunction(DataViewPrototype, "setFloat32", 2, DataViewPrototype_setFloat32);
LazyDefineBuiltinFunction(DataViewPrototype, "setFloat64", 2, DataViewPrototype_setFloat64);
LazyDefineBuiltinFunction(DataViewPrototype, "setInt8", 2, DataViewPrototype_setInt8);
LazyDefineBuiltinFunction(DataViewPrototype, "setInt16", 2, DataViewPrototype_setInt16);
LazyDefineBuiltinFunction(DataViewPrototype, "setInt32", 2, DataViewPrototype_setInt32);
LazyDefineBuiltinFunction(DataViewPrototype, "setUint8", 2, DataViewPrototype_setUint8);
LazyDefineBuiltinFunction(DataViewPrototype, "setUint16", 2, DataViewPrototype_setUint16);
LazyDefineBuiltinFunction(DataViewPrototype, "setUint32", 2, DataViewPrototype_setUint32);
LazyDefineBuiltinConstant(DataViewConstructor, $$toStringTag, "DataView");

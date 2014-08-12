var DataViewConstructor_Call = function (thisArg, argList) {
    var O = thisArg;
    var buffer = argList[0];
    var byteOffset = argList[1];
    var byteLength = argList[2];
    if (byteOffset === undefined) byteOffset = 0;
    if (Type(O) !== OBJECT || !hasInternalSlot(O, SLOTS.DATAVIEW)) return newTypeError("DataView object expected");
    Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "O has to have a ViewedArrayBuffer slot.");
    var viewedArrayBuffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (viewedArrayBuffer !== undefined) return newTypeError("ViewedArrayBuffer of DataView has to be undefined.");
    if (Type(buffer) !== OBJECT) return newTypeError("buffer has to be an arraybuffer object");
    var arrayBufferData;
    if (!hasInternalSlot(buffer, SLOTS.ARRAYBUFFERDATA)) return newTypeError("In DataView(buffer), buffer has to have ArrayBufferData slot");
    arrayBufferData = getInternalSlot(buffer, SLOTS.ARRAYBUFFERDATA);
    if (arrayBufferData === undefined) return newTypeError("arrayBufferData of buffer may not be undefined");
    var numberOffset = ToNumber(byteOffset);
    var offset = ToInteger(numberOffset);
    if (isAbrupt(offset = ifAbrupt(offset))) return offset;
    if (numberOffset !== offset || offset < 0) return newRangeError("numberOffset is not equal to offset or is less than 0.");
    var byteBufferLength = getInternalSlot(buffer, SLOTS.ARRAYBUFFERBYTELENGTH);
    if (offset > byteBufferLength) return newRangeError("offset > byteBufferLength");
    if (byteLength === undefined) {
        var viewByteLength = byteBufferLength - offset;
    } else {
        var numberLength = ToNumber(byteLength);
        var viewLength = ToInteger(numberLength);
        if (isAbrupt(viewLength = ifAbrupt(viewLength))) return viewLength;
        if ((numberLength != viewLength) || viewLength < 0) return newRangeError("numberLength != viewLength or viewLength < 0");
        var viewByteLength = viewLength;
        if ((offset + viewByteLength) > byteBufferLength) return newRangeError("offset + viewByteLength > byteBufferLength");
    }
    if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) !== undefined) return newTypeError("ViewedArrayBuffer of O has to be undefined here");
    setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, buffer);
    setInternalSlot(O, SLOTS.BYTELENGTH, viewByteLength);
    setInternalSlot(O, SLOTS.BYTEOFFSET, offset);
    return NormalCompletion(O);
};
var DataViewConstructor_Construct = function (argList) {
    return OrdinaryConstruct(this, argList);
};
var DataViewConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var obj = OrdinaryCreateFromConstructor(F, INTRINSICS.DATAVIEWPROTOTYPE, [
        SLOTS.DATAVIEW,
        SLOTS.VIEWEDARRAYBUFFER,
        SLOTS.BYTELENGTH,
        SLOTS.BYTEOFFSET
    ]);
    setInternalSlot(obj, SLOTS.DATAVIEW, true);
    return obj;
};
var DataViewPrototype_get_buffer = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError("O is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return newTypeError("O has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError("buffer is undefined but must not");
    return NormalCompletion(buffer);
};
var DataViewPrototype_get_byteLength = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError("O is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return newTypeError("O has no ViewedArrayBuffer property");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError("buffer is undefined");
    var size = getInternalSlot(O, SLOTS.BYTELENGTH);
    return NormalCompletion(size);
};
var DataViewPrototype_get_byteOffset = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError("O is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return newTypeError("O has no ViewedArrayBuffer property");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError("buffer is undefined");
    var offset = getInternalSlot(O, SLOTS.BYTEOFFSET);
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
function CopyDataBlockBytes(toBlock, toIndex, fromBlock, fromIndex, count) {
    for (var i = fromIndex, j = fromIndex + count, k = toIndex; i < j; i++, k++) toBlock[k] = fromBlock[i];
}
function CreateByteArrayBlock(bytes) {
    var dataBlock = new ArrayBuffer(bytes);
    return { block: dataBlock, dv: new DataView(dataBlock) }
}
function SetArrayBufferData(arrayBuffer, bytes) {
    Assert(hasInternalSlot(arrayBuffer, SLOTS.ARRAYBUFFERDATA), "[[ArrayBufferData]]");
    Assert(bytes > 0, "bytes != positive int");
    var block = CreateByteArrayBlock(bytes); // hehe
    setInternalSlot(arrayBuffer, SLOTS.ARRAYBUFFERDATA, block);
    setInternalSlot(arrayBuffer, SLOTS.ARRAYBUFFERBYTELENGTH, bytes);
    return arrayBuffer;
}
function AllocateArrayBuffer(F) {
    var obj = OrdinaryCreateFromConstructor(F, INTRINSICS.ARRAYBUFFERPROTOTYPE,
        [
            SLOTS.ARRAYBUFFERDATA,
            SLOTS.ARRAYBUFFERBYTELENGTH
        ]
    );
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    setInternalSlot(obj, SLOTS.ARRAYBUFFERBYTELENGTH, 0);
    return obj;
}
function GetValueFromBuffer(arrayBuffer, byteIndex, type, isLittleEndian) {
    var length = getInternalSlot(arrayBuffer, SLOTS.ARRAYBUFFERBYTELENGTH); 
    var block = getInternalSlot(arrayBuffer, SLOTS.ARRAYBUFFERDATA);
    if (block === undefined || block === null) return newTypeError(format("SLOT_NOT_AVAILABLE_S", "[[ArrayBufferData]]"));
    var elementSize = arrayType2elementSize[type];
    var rawValue, intValue;
    rawValue = block.dv["get"+type](byteIndex, isLittleEndian);
    return NormalCompletion(rawValue);
}
function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isLittleEndian) {
    //var length = getInternalSlot(arrayBuffer, SLOTS.BYTELENGTH);
    var block = getInternalSlot(arrayBuffer, SLOTS.ARRAYBUFFERDATA);
    if (block === undefined || block === null) return newTypeError(format("SLOT_NOT_AVAILABLE_S", "[[ArrayBufferData]]"));
    //var elementSize = arrayType2elementSize[type];
    var numValue = +value;
    if (isAbrupt(numValue = ifAbrupt(numValue))) return numValue;
    block.dv["set"+type](byteIndex, numValue, isLittleEndian);
    return NormalCompletion(undefined);
}
function SetViewValue(view, requestIndex, isLittleEndian, type, value) {
    var v = ToObject(view);
    if (isAbrupt(v = ifAbrupt(v))) return v;
    if (!hasInternalSlot(v, SLOTS.DATAVIEW)) return newTypeError(format("HAS_NO_SLOT_S", "[[ArrayBufferData]]"));
    var buffer = getInternalSlot(v, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError(format("S_IS_UNDEFINED", "buffer"));
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
    if ((numberIndex !== getIndex) || (getIndex < 0)) return newRangeError(format("S_OUT_OF_RANGE", "index"));
    var littleEndian = ToBoolean(isLittleEndian);
    if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
    var viewOffset = getInternalSlot(v, SLOTS.BYTEOFFSET);
    var viewSize = getInternalSlot(v, SLOTS.BYTELENGTH);
    var elementSize = typedArrayElementSize[type];
    if (getIndex + elementSize > viewSize) return newRangeError(format("S_OUT_OF_RANGE", "viewsize"));
    var bufferIndex = getIndex + viewOffset;
    return SetValueInBuffer(buffer, bufferIndex, type, value, littleEndian);
}
function GetViewValue(view, requestIndex, isLittleEndian, type) {
    var v = ToObject(view);
    if (isAbrupt(v = ifAbrupt(v))) return v;
    if (!hasInternalSlot(v, SLOTS.DATAVIEW)) return newTypeError(format("SLOT_CONTAINS_NO_S", "[[ArrayBufferData]]"));
    var buffer = getInternalSlot(v, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError(format("S_IS_UNDEFINED", "buffer"));
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
    if ((numberIndex !== getIndex) || (getIndex < 0)) return newRangeError(format("S_OUT_OF_RANGE", "index"));
    var littleEndian = ToBoolean(isLittleEndian);
    if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
    var viewOffset = getInternalSlot(v, SLOTS.BYTEOFFSET);
    var viewSize = getInternalSlot(v, SLOTS.BYTELENGTH);
    var elementSize = typedArrayElementSize[type];
    if (getIndex + elementSize > viewSize) return newRangeError(format("S_OUT_OF_RANGE", "viewsize"));
    var bufferIndex = getIndex + viewOffset;
    return GetValueFromBuffer(buffer, bufferIndex, type, littleEndian);
}
var arrayType2elementSize = {
    "Float64": 8,
    "Float32": 4,
    "Int32": 4,
    "Uint32": 4,
    "Int16": 2,
    "Uint16": 2,
    "Int8": 1,
    "Uint8": 1,
    "Uint8Clamped": 1
};
var typedConstructors = {
    "Float64": Float64Array,
    "Float32": Float32Array,
    "Int32": Int32Array,
    "Uint32": Uint32Array,
    "Int16": Int16Array,
    "Uint16": Uint16Array,
    "Int8": Int8Array,
    "Uint8": Uint8Array,
    "Uint8Clamped": Uint8ClampedArray
};
var typedConstructorNames = {
    "Float64": INTRINSICS.FLOAT64ARRAYPROTOTYPE,
    "Float32": INTRINSICS.FLOAT32ARRAYPROTOTYPE,
    "Int32": INTRINSICS.INT32ARRAYPROTOTYPE,
    "Uint32": INTRINSICS.UINT32ARRAYPROTOTYPE,
    "Int16": INTRINSICS.INT16ARRAYPROTOTYPE,
    "Uint16": INTRINSICS.UINT16ARRAYPROTOTYPE,
    "Int8": INTRINSICS.INT8ARRAYPROTOTYPE,
    "Uint8": INTRINSICS.UINT8ARRAYPROTOTYPE,
    "Uint8Clamped": INTRINSICS.UINT8CLAMPEDARRAYPROTOTYPE
};
var ArrayBufferConstructor_call = function (thisArg, argList) {
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
};
var ArrayBufferConstructor_construct = function (argList) {
    return OrdinaryConstruct(this, argList);
};
var ArrayBufferConstructor_isView = function (thisArg, argList) {
    var arg = argList[0];
    if (Type(arg) !== OBJECT) return false;
    return hasInternalSlot(arg, SLOTS.VIEWEDARRAYBUFFER);
};
var ArrayBufferConstructor_$$create = function (thisArg, argList) {
    return AllocateArrayBuffer(thisArg);
};
var ArrayBufferPrototype_get_byteLength = function (thisArg, argList) {
    var O = thisArg;
    if (!hasInternalSlot(O, SLOTS.ARRAYBUFFERDATA)) return newTypeError( "The this argument has no [[ArrayBufferData]]");
    if (getInternalSlot(O, SLOTS.ARRAYBUFFERDATA) === undefined) return newTypeError( "The this arguments [[ArrayBufferData]] is not initialized");
    var length = getInternalSlot(O, SLOTS.ARRAYBUFFERBYTELENGTH);
    return length;
};
var ArrayBufferPrototype_slice = function (thisArg, argList) {
    var start = argList[0];
    var end = argList[1];
};
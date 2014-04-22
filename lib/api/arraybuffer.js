

function CreateByteDataBlock(bytes) {
    var dataBlock = new ArrayBuffer(bytes);
    return dataBlock;
}

function CopyDataBlockBytes(toBlock, toIndex, fromBlock, fromIndex, count) {
    for (var i = fromIndex, j = fromIndex + count, k = toIndex; i < j; i++, k++) {
        var value = fromBlock[i];
        toBlock[k] = value;
    }
}

// ===========================================================================================================
// ArrayBuffer
// ===========================================================================================================

function CreateByteArrayBlock(bytes) {
    return new ArrayBuffer(bytes); //spaeter alloziere auf eigenem heap
}

function SetArrayBufferData(arrayBuffer, bytes) {
    Assert(hasInternalSlot(arrayBuffer, "ArrayBufferData"), "[[ArrayBufferData]] has to exist");
    Assert(bytes > 0, "bytes must be a positive integer");
    var block = CreateByteArrayBlock(bytes); // hehe
    setInternalSlot(arrayBuffer, "ArrayBufferData", block);
    setInternalSlot(arrayBuffer, "ArrayBufferByteLength", bytes);
    return arrayBuffer;
}

function AllocateArrayBuffer(F) {
    var obj = OrdinaryCreateFromConstructor(F, "%ArrayBufferPrototype%", {
        "ArrayBufferData": undefined,
        "ArrayBufferByteLength": undefined
    });
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    setInternalSlot(obj, "ArrayBufferByteLength", 0);
    return obj;
}



function GetValueFromBuffer(arrayBuffer, byteIndex, type, isLittleEndian) {
    var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
    var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
    if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialized or available.");
    
    var elementSize = arrayType2elementSize[type];
    var rawValue, intValue;
    
    var dv = new DataView(block);
    rawValue = dv["get"+type](byteIndex, isLittleEndian);

    return NormalCompletion(rawValue);
}

function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isLittleEndian) {
    var length = getInternalSlot(arrayBuffer, "ByteLength");
    var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
    if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialized or available.");
    var elementSize = arrayType2elementSize[type];
    var numValue = +value;
/*
    switch(type) {
	case "Int8":
	    numValue = ToInt8(value);
	    break;
	case "Uint8":
	    numValue = ToUint8(value);
	    break;
	case "Int32":
	    numValue = ToInt32(value);
	    break;
	case "Float32":
	    numValue = ToNumber(value);
	    break;
	case "Float64":
	    numValue = ToNumber(value);
	    break;
	default:
	    break;
    }
    */
    if (isAbrupt(numValue = ifAbrupt(numValue))) return numValue;
    var dv = new DataView(block);
    dv["set"+type](byteIndex, numValue, isLittleEndian);
    return NormalCompletion(undefined);
    
}

function SetViewValue(view, requestIndex, isLittleEndian, type, value) {
    var v = ToObject(view);
    if (isAbrupt(v = ifAbrupt(v))) return v;
    if (!hasInternalSlot(v, "DataView")) return withError("Type", "object has no [[ArrayBufferData]]");
    var buffer = getInternalSlot(v, "ViewedArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined");
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
    if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
    var littleEndian = ToBoolean(isLittleEndian);
    if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
    var viewOffset = getInternalSlot(v, "ByteOffset");
    var viewSize = getInternalSlot(v, "ByteLength");
    var elementSize = TypedArrayElementSize[type];
    if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
    var bufferIndex = getIndex + viewOffset;
    return SetValueInBuffer(buffer, bufferIndex, type, value, littleEndian);
}

function GetViewValue(view, requestIndex, isLittleEndian, type) {
    var v = ToObject(view);
    if (isAbrupt(v = ifAbrupt(v))) return v;
    if (!hasInternalSlot(v, "DataView")) return withError("Type", "not a ArrayBufferData");
    var buffer = getInternalSlot(v, "ViewedArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined");
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
    if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
    var littleEndian = ToBoolean(isLittleEndian);
    if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
    var viewOffset = getInternalSlot(v, "ByteOffset");
    var viewSize = getInternalSlot(v, "ByteLength");
    var elementSize = TypedArrayElementSize[type];
    if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
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
    "Float64": "%Float64ArrayPrototype%",
    "Float32": "%Float32ArrayPrototype%",
    "Int32": "%Int32ArrayPrototype%",
    "Uint32": "%Uint32ArrayPrototype%",
    "Int16": "%Int16ArrayPrototype%",
    "Uint16": "%Uint16ArrayPrototype%",
    "Int8": "%Int8ArrayPrototype%",
    "Uint8": "%Uint8ArrayPrototype%",
    "Uint8Clamped": "%Uint8ClampedArrayPrototype%"
};


var TypedArrayConstructor_Call = function (thisArg, argList) {
    var array, typedArray, length, O,
    elementType,    numberLength,    elementLength,    elementSize,    byteLength,
    status,    data,    constructorName;
    array = argList[0];
    O = thisArg;

        if (IsArray(array)) {
            
            Assert((Type(array) === OBJECT) && !hasInternalSlot(array, SLOTS.TYPEDARRAYNAME) && !hasInternalSlot(array, SLOTS.ARRAYBUFFERDATA),
                "array has to be an object without [[TypedArrayName]] or [[ArrayBufferData]] slots");
            var srcArray = array;
            if (Type(O) != OBJECT || !hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return withError(
                "Type", "this value is no object or has no [[TypedArrayName]] slot"
            );
            Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "this value has no [[ViewedArrayBuffer]] slot");
            var constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
            var elementType = typedArrayElementType[constructorName];
            var arrayLength = Get(srcArray, "length");
            if (isAbrupt(arrayLength=ifAbrupt(arrayLength))) return arrayLength;
            var elementLength = ToLength(arrayLength);
            if (isAbrupt(elementLength=ifAbrupt(elementLength))) return elementLength;
            var data = AllocateArrayBuffer(getIntrinsic(INTRINSICS.ARRAYBUFFER));
            if (isAbrupt(data=ifAbrupt(data))) return data;
            //var elementSize = typedArrayElementSize[elementType];
            elementSize = arrayType2elementSize[elementType];
            var byteLength = elementSize * elementLength;
            var status = SetArrayBufferData(data, byteLength);
            if (isAbrupt(status)) return status;
            var k = 0;
            while (k < elementLength) {
                var Pk = ToString(k);
                var kValue = Get(srcArray, Pk);
                var kNumber = ToNumber(k);
                if (isAbrupt(kNumber=ifAbrupt(kNumber))) return kNumber;
                SetValueInBuffer(data, k * elementSize, elementType, kNumber);
                k = k + 1;
            }
            if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) !== undefined) return newTypeError( "the this values [[ViewedArrayBuffer]] may not be initialized here");
            setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, data);
            setInternalSlot(O, SLOTS.BYTELENGTH, byteLength);
            setInternalSlot(O, SLOTS.BYTEOFFSET, 0);
            setInternalSlot(O, SLOTS.ARRAYLENGTH, elementLength);
            return NormalCompletion(O);
        } else if ((typedArray = array) instanceof IntegerIndexedExoticObject) {
            
            Assert((Type(typedArray) === OBJECT) && hasInternalSlot(typedArray, SLOTS.TYPEDARRAYNAME), "typedArray has to be an object and to have a TypedArrayName slot");
            var srcArray = typedArray;
            O = thisArg;
            if ((Type(O) !== OBJECT) || getInternalSlot(O, SLOTS.TYPEDARRAYNAME)===undefined) return newTypeError( "this value has to be object and to have a defined TypedArrayName slot");
            Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "this value has to have a ViewedArrayBuffer slot");
            if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) === undefined) return newTypeError( "ViewedArrayBuffer may not be undefined");
            var constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
            var elementType = typedArrayElementType[constructorName];
            var elementLength = getInternalSlot(srcArray, SLOTS.ARRAYLENGTH);
            var srcName = getInternalSlot(srcArray, SLOTS.TYPEDARRAYNAME);
            var srcType = typedArrayElementType[srcName];
            var srcElementSize = typedArrayElementSize[srcType];
            var srcData = getInternalSlot(srcArray, SLOTS.VIEWEDARRAYBUFFER);
            var srcByteOffset = getInternalSlot(srcArray, SLOTS.BYTEOFFSET);
            //var elementSize = typedArrayElementSize[constructorName];
            elementSize = arrayType2elementSize[elementType];
            var byteLength = elementSize * elementLength;
            if (SameValue(elementType, srcType)) {
                var data = CloneArrayBuffer(srcData, srcByteOffset);
                if (isAbrupt(data=ifAbrupt(data))) return data;
            } else {
                var bufferConstructor = Get(srcBuffer, "constructor");
                if (isAbrupt(bufferConstructor=ifAbrupt(bufferConstructor))) return bufferConstructor;
                if (bufferConstructor === undefined) bufferConstructor = getIntrinsic(INTRINSICS.ARRAYBUFFER);
                var data = AllocateArrayBuffer(bufferConstructor);
                var status = SetArrayBufferData(data, byteLength);
                if (isAbrupt(status=ifAbrupt(status))) return status;
                var srcByteIndex = srcByteOffset;
                var targetByteIndex = 0;
                var count = elementLength;
                while (count > 0) {
                    var value = GetValueFromBuffer(srcData, srcByteIndex, srcType);
                    status = SetValueInBuffer(data, targetByteIndex, elementType, value);
                    srcByteIndex = srcByteIndex + srcElementSize;
                    targetByteIndex = targetByteIndex + elementSize;
                    count = count - 1;
                }
            }
            if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) !== undefined) return newTypeError( "ViewedArrayBuffer may not be defined at this point");
            setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, data);
            setInternalSlot(O, SLOTS.BYTELENGTH, byteLength);
            setInternalSlot(O, SLOTS.BYTEOFFSET, 0);
            setInternalSlot(O, SLOTS.ARRAYLENGTH, elementLength);
            return NormalCompletion(O);
    } else if (typeof (length = array) == "number") {
        
        O = thisArg;
        if (Type(O) !== OBJECT) return newTypeError( "this value is not an object");
        if (!hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return newTypeError( "object has no TypedArrayName property");
        Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "object has to have a ViewedArrayBuffer property");
        if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) === undefined) return newTypeError( "object has to have a well defined ViewedArrayBuffer property");
        constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
        elementType = typedArrayElementType[constructorName];
        numberLength = ToNumber(length);
        elementLength = ToLength(numberLength);
        if (isAbrupt(elementLength = ifAbrupt(elementLength))) return elementLength;
        if (SameValueZero(numberLength, elementLength) === false) return newRangeError( "TypedArray: numberLength and elementLength are not equal");
        data = AllocateArrayBuffer(getIntrinsic(INTRINSICS.ARRAYBUFFER));
        if (isAbrupt(data = ifAbrupt(data))) return data;
        //elementSize = typedArrayElementSize[elementType];
            elementSize = arrayType2elementSize[elementType];
        byteLength = elementSize * elementLength;
        status = SetArrayBufferData(data, byteLength);
        if (isAbrupt(status = ifAbrupt(status))) return status;
        setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, data);
        setInternalSlot(O, SLOTS.BYTELENGTH, byteLength);
        setInternalSlot(O, SLOTS.BYTEOFFSET, 0);
        setInternalSlot(O, SLOTS.ARRAYLENGTH, elementLength);
        return NormalCompletion(O);
    } else {
        

        Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "O has to have [[ViewedArrayBuffer]]");
        var buffer = argList[0];
        var byteOffset = argList[1];
        if (byteOffset === undefined) byteOffset = 0;
        length = argList[2];
        Assert((Type(buffer) === OBJECT) && hasInternalSlot(buffer, SLOTS.ARRAYBUFFERDATA), "buffer has to be an object and to have [[ArrayBufferData]]");
        O = thisArg;
        var arrayBufferData = getInternalSlot(buffer, SLOTS.ARRAYBUFFERDATA);
        if (arrayBufferData === undefined) return newTypeError( "[[ArrayBufferData]] is undefined");
        if (Type(O) !== OBJECT || !hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return newTypeError( "O has to be object and to have [[TypedArrayName]]");
        var viewedArrayBuffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
        var typedArrayName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
        if (typedArrayName === undefined) return newTypeError( "O has to have a well defined [[TypedArrayName]]");
        constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
        elementType = typedArrayElementType[constructorName];
        elementSize = arrayType2elementSize[elementType];
        var offset = ToInteger(byteOffset);
        if (isAbrupt(offset = ifAbrupt(offset))) return offset;
        if (offset < 0) return newRangeError( "offset is smaller 0");
        if ((offset % elementSize) !== 0) return newRangeError( "offset mod elementSize is not 0");

        var byteBufferLength = getInternalSlot(buffer, SLOTS.ARRAYBUFFERBYTELENGTH);
        if (offset + elementSize >= byteBufferLength) return newRangeError( "offset + elementSize is >= byteBufferLength");
        var newByteLength;
        if (length === undefined) {
            if (byteBufferLength % elementSize !== 0) return newRangeError( "byteBufferLength mod elementSize is not 0");
            newByteLength = byteBufferLength + offset;
            if (newByteLength < 0) return newRangeError( "newByteLength < 0 underflow when adding offset to byteBufferLength");
        } else {
            var newLength = ToLength(length);
            if (isAbrupt(newLength = ifAbrupt(newLength))) return newLength;
            newByteLength = newLength * elementSize;
            if (offset + newByteLength > byteBufferLength) return newRangeError( "offset + newByteLength is larger than byteBufferLength");
        }
        if (viewedArrayBuffer !== undefined) return newTypeError( "the [[ViewedArrayBuffer]] of O is not empty");

        setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, buffer);
        setInternalSlot(O, SLOTS.BYTELENGTH, newByteLength);
        setInternalSlot(O, SLOTS.BYTEOFFSET, offset);
        setInternalSlot(O, SLOTS.ARRAYLENGTH, Math.floor(newByteLength / elementSize));

    }
    return NormalCompletion(O);
};

var typedArrayPrototypeNames = {
    "Float64Array": INTRINSICS.FLOAT64ARRAYPROTOTYPE,
    "Float32Array": INTRINSICS.FLOAT32ARRAYPROTOTYPE,
    "Int32Array": INTRINSICS.INT32ARRAYPROTOTYPE,
    "Uint32Array": INTRINSICS.UINT32ARRAYPROTOTYPE,
    "Int16Array": INTRINSICS.INT16ARRAYPROTOTYPE,
    "Uint16Array": INTRINSICS.UINT16ARRAYPROTOTYPE,
    "Int8Array": INTRINSICS.INT8ARRAYPROTOTYPE,
    "Uint8Array": INTRINSICS.UINT8ARRAYPROTOTYPE,
    "Uint8Clamped": INTRINSICS.UINT8CLAMPEDARRAYPROTOTYPE
};

var TypedArrayConstructor_$$create = function $$create(thisArg, argList) {
    var F = thisArg;
    if (Type(F) !== OBJECT) return newTypeError( "the this value is not an object");
    if (!hasInternalSlot(F, SLOTS.TYPEDARRAYCONSTRUCTOR)) return newTypeError( "The this value has no [[TypedArrayConstructor]] property");
    var proto = GetPrototypeFromConstructor(F, typedArrayPrototypeNames[getInternalSlot(F, SLOTS.TYPEDARRAYCONSTRUCTOR)]);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    var obj = IntegerIndexedObjectCreate(proto);
    setInternalSlot(obj, SLOTS.VIEWEDARRAYBUFFER, undefined);
    setInternalSlot(obj, SLOTS.TYPEDARRAYNAME, getInternalSlot(F, SLOTS.TYPEDARRAYCONSTRUCTOR));
    setInternalSlot(obj, SLOTS.BYTELENGTH, 0);
    setInternalSlot(obj, SLOTS.BYTEOFFSET, 0);
    setInternalSlot(obj, SLOTS.ARRAYLENGTH, 0);
    return obj;
};

var TypedArrayConstructor_from = function from(thisArg, argList) {
    "use strict";
    var source = argList[0];
    var mapfn = argList[1];
    var tArg = argList[2];
    var T;
    var C = thisArg;
    var newObj;
    var putStatus;
    if (!IsConstructor(C)) return newTypeError(format("S_NO_CONSTRUCTOR", "the this value"));
    var items = ToObject(source);
    if (isAbrupt(items = ifAbrupt(items))) return items;
    var mapping;
    var k;
    var nextValue, kValue, Pk;
    if (mapfn === undefined) {
        mapping = false;
    } else {
        if (!IsCallable(mapfn)) return newTypeError(format("S_NOT_CALLABLE", "mapfn"));
        T = tArg;
        mapping = true;
    }
    var usingIterator = HasProperty(items, $$iterator);
    if (isAbrupt(usingIterator = ifAbrupt(usingIterator))) return usingIterator;
    if (usingIterator) {
        var iterator = Get(items, $$iterator);
        iterator = unwrap(iterator);
        var values = [];
        var next = true;
        while (next != false) {
            next = IteratorStept(iterator);
            if (next !== false) {
                nextValue = IteratorValue(next);
                if (isAbrupt(nextValue = ifAbrupt(nextValue))) return nextValue;
                values.push(nextValue);
            }
        }
        var len = values.length;
        newObj = callInternalSlot(SLOTS.CONSTRUCT, C, C, [len]);
        if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
        k = 0;
        while (k < len) {
            Pk = ToString(k);
            kValue = values[k];
            if (mapping) {
                mappedValue = callInternalSlot(SLOTS.CALL, mapfn, T, [kValue]);
                if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
            } else mappedValue = kValue;
            putStatus = Put(newObj, Pk, mappedValue, true);
            if (isAbrupt(putStatus)) return putStatus;
            k = k + 1;
        }
        return NormalCompletion(newObj);
    }
    Assert(HasProperty(items, "length"), format("EXPECTING_ARRAYLIKE"));
    var lenValue = Get(items, "length");
    len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    newObj = callInternalSlot(SLOTS.CONSTRUCT, C, C, [len]);
    if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;

    var mappedValue;
    k = 0;
    while (k < len) {
        Pk = ToString(k);
        kValue = Get(items, Pk);
        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
        if (mapping) {
            mappedValue = callInternalSlot(SLOTS.CALL, mapfn, T, [kValue, k, items]);
            if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
        } else {
            mappedValue = kValue;
        }
        putStatus = Put(newObj, Pk, mappedValue, true);
        if (isAbrupt(putStatus)) return putStatus;
        k = k + 1;
    }
    return NormalCompletion(newObj);
};
var TypedArrayConstructor_of = function of(thisArg, argList) {
    var items = CreateArrayFromList(argList);
    var lenValue = Get(items, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len=ifAbrupt(length))) return length;
    var C = thisArg;
    if (IsConstructor(C)) {
        var newObj = callInternalSlot(SLOTS.CONSTRUCT, C, C, [len]);
        if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
    } else {
        return newTypeError( "The thisValue has to be a constructor");
    }
    var k = 0;
    var status;
    var Pk, kValue;
    while (k < len) {
        Pk = ToString(k);
        kValue = Get(items, Pk);
        //if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
        status = Put(newObj, Pk, kValue, true);
        if (isAbrupt(status = ifAbrupt(status))) return status;
        k = k + 1;
    }
    return NormalCompletion(newObj);
};

var TypedArrayPrototype_get_byteLength = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return newTypeError( "has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError( "slot value for viewed array buffer is undefined");
    var length = getInternalSlot(O, SLOTS.BYTELENGTH);
    return NormalCompletion(length);
};
var TypedArrayPrototype_get_byteOffset = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return newTypeError( "has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError( "slot value for viewed array buffer is undefined");
    var offset = getInternalSlot(O, SLOTS.BYTEOFFSET);
    return NormalCompletion(offset);
};
var TypedArrayPrototype_get_buffer = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return newTypeError( "has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return newTypeError( "slot value for viewed array buffer is undefined");
    return NormalCompletion(buffer);
};

var TypedArrayPrototype_filter = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_find = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_findIndex = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_forEach = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_indexOf = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_join = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_keys = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_lastIndexOf = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_length = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_map = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_reduce = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_reduceRight = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_reverse = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_set = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_slice = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_some = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_sort = function subarray(thisArg, argList) {
};
var TypedArrayPrototype_subarray = function subarray(thisArg, argList) {
};


var TypedArrayPrototype_$$iterator = function iterator(thisArg, argList) {
    return CreateArrayIterator(thisArg, "value");
};

// $$toStringTag
var TypedArrayPrototype_get_$$toStringTag = function get_toStringTag(thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "the this value is not an object");
    if (!hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return newTypeError( "the this value has no [[TypedArrayName]] slot");
    var name = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
    Assert(Type(name) == STRING, "name has to be a string value");
    return NormalCompletion(name);
};

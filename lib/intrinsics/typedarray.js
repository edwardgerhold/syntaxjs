
var TypedArrayConstructor_Call = function (thisArg, argList) {
    var array, typedArray, length;
    array = argList[0];
    var O;
    var elementType;
    var numberLength;
    var elementLength;
    var elementSize;
    var byteLength;
    var status;
    var data;
    var constructorName;
    if (Type(array) === OBJECT) {
        if (IsArray(array)) {
            Assert((Type(array) === OBJECT) && !hasInternalSlot(array, SLOTS.TYPEDARRAYNAME) && !hasInternalSlot(array, SLOTS.ARRAYBUFFERDATA),
                "array has to be an object without [[TypedArrayName]] or [[ArrayBufferData]] slots");
            O = thisArg;
            var srcArray = array;
            if (Type(O) != OBJECT || !hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return withError(
                "Type", "this value is no object or has no [[TypedArrayName]] slot"
            );
            Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "this value has no [[ViewedArrayBuffer]] slot");
            var constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
            var elementType = TypedArrayElementType[constructorName];
            var arrayLength = Get(srcArray, "length");
            if (isAbrupt(arrayLength=ifAbrupt(arrayLength))) return arrayLength;
            var elementLength = ToLength(arrayLength);
            if (isAbrupt(elementLength=ifAbrupt(elementLength))) return elementLength;
            var data = AllocateArrayBuffer(getIntrinsic("%ArrayBuffer%"));
            if (isAbrupt(data=ifAbrupt(data))) return data;
            var elementSize = TypedArrayElementSize[elementType];
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
            if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) !== undefined) return withError("Type", "the this values [[ViewedArrayBuffer]] may not be initialized here");
            setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, data);
            setInternalSlot(O, SLOTS.BYTELENGTH, byteLength);
            setInternalSlot(O, SLOTS.BYTEOFFSET, 0);
            setInternalSlot(O, SLOTS.ARRAYLENGTH, elementLength);
            return NormalCompletion(O);
        } else if ((typedArray = array) instanceof IntegerIndexedExoticObject) {
            Assert((Type(typedArray) === OBJECT) && hasInternalSlot(typedArray, SLOTS.TYPEDARRAYNAME), "typedArray has to be an object and to have a TypedArrayName slot");
            var srcArray = typedArray;
            O = thisArg;
            if ((Type(O) !== OBJECT) || getInternalSlot(O, SLOTS.TYPEDARRAYNAME)===undefined) return withError("Type", "this value has to be object and to have a defined TypedArrayName slot");
            Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "this value has to have a ViewedArrayBuffer slot");
            if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) === undefined) return withError("Type", "ViewedArrayBuffer may not be undefined");
            var constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
            var elementType = TypedArrayElementType[constructorName];
            var elementLength = getInternalSlot(srcArray, SLOTS.ARRAYLENGTH);
            var srcName = getInternalSlot(srcArray, SLOTS.TYPEDARRAYNAME);
            var srcType = TypedArrayElementType[srcName];
            var srcElementSize = TypedArrayElementSize[srcType];
            var srcData = getInternalSlot(srcArray, SLOTS.VIEWEDARRAYBUFFER);
            var srcByteOffset = getInternalSlot(srcArray, SLOTS.BYTEOFFSET);
            var elementSize = TypedArrayElementSize[constructorName];
            var byteLength = elementSize * elementLength;
            if (SameValue(elementType, srcType)) {
                var data = CloneArrayBuffer(srcData, srcByteOffset);
                if (isAbrupt(data=ifAbrupt(data))) return data;
            } else {
                var bufferConstructor = Get(srcBuffer, "constructor");
                if (isAbrupt(bufferConstructor=ifAbrupt(bufferConstructor))) return bufferConstructor;
                if (bufferConstructor === undefined) bufferConstructor = getIntrinsic("%ArrayBuffer%");
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
            if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) !== undefined) return withError("Type", "ViewedArrayBuffer may not be defined at this point");
            setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, data);
            setInternalSlot(O, SLOTS.BYTELENGTH, byteLength);
            setInternalSlot(O, SLOTS.BYTEOFFSET, 0);
            setInternalSlot(O, SLOTS.ARRAYLENGTH, elementLength);
            return NormalCompletion(O);
        }
    } else if (typeof (length = array) == "number") {
        O = thisArg;
        if (Type(O) !== OBJECT) return withError("Type", "this value is not an object");
        if (!hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return withError("Type", "object has no TypedArrayName property");
        Assert(hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER), "object has to have a ViewedArrayBuffer property");
        if (getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER) === undefined) return withError("Type", "object has to have a well defined ViewedArrayBuffer property");
        constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
        elementType = TypedArrayElementType[constructorName];
        numberLength = ToNumber(length);
        elementLength = ToLength(numberLength);
        if (isAbrupt(elementLength = ifAbrupt(elementLength))) return elementLength;
        if (SameValueZero(numberLength, elementLength) === false) return withError("Range", "TypedArray: numberLength and elementLength are not equal");
        data = AllocateArrayBuffer(getIntrinsic("%ArrayBuffer%"));
        if (isAbrupt(data = ifAbrupt(data))) return data;
        elementSize = TypedArrayElementSize[elementType];
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
        if (arrayBufferData === undefined) return withError("Type", "[[ArrayBufferData]] is undefined");
        if (Type(O) !== OBJECT || !hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return withError("Type", "O has to be object and to have [[TypedArrayName]]");
        var viewedArrayBuffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
        var typedArrayName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
        if (typedArrayName === undefined) return withError("Type", "O has to have a well defined [[TypedArrayName]]");
        constructorName = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
        elementType = TypedArrayElementType[constructorName];
        elementSize = TypedArrayElementSize[elementType];
        var offset = ToInteger(byteOffset);
        if (isAbrupt(offset = ifAbrupt(offset))) return offset;
        if (offset < 0) return withError("Range", "offset is smaller 0");
        if ((offset % elementSize) !== 0) return withError("Range", "offset mod elementSize is not 0");
        var byteBufferLength = getInternalSlot(buffer, SLOTS.ARRAYBUFFERBYTELENGTH);
        if (offset + elementSize >= byteBufferLength) return withError("Range", "offset + elementSize is >= byteBufferLength");
        var newByteLength;
        if (length === undefined) {
            if (byteBufferLength % elementSize !== 0) return withError("Range", "byteBufferLength mod elementSize is not 0");
            newByteLength = byteBufferLength + offset;
            if (newByteLength < 0) return withError("Range", "newByteLength < 0 underflow when adding offset to byteBufferLength");
        } else {
            var newLength = ToLength(length);
            if (isAbrupt(newLength = ifAbrupt(newLength))) return newLength;
            newByteLength = newLength * elementSize;
            if (offset + newByteLength > byteBufferLength) return withError("Range", "offset + newByteLength is larger than byteBufferLength");
        }
        if (viewedArrayBuffer !== undefined) return withError("Type", "the [[ViewedArrayBuffer]] of O is not empty");
        setInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER, buffer);
        setInternalSlot(O, SLOTS.BYTELENGTH, newByteLength);
        setInternalSlot(O, SLOTS.BYTEOFFSET, offset);
        setInternalSlot(O, SLOTS.ARRAYLENGTH, Math.floor(newByteLength / elementSize));
    }
    return NormalCompletion(O);
};

var typedArrayPrototypeNames = {
    "Float64Array": "%Float64ArrayPrototype%",
    "Float32Array": "%Float32ArrayPrototype%",
    "Int32Array": "%Int32ArrayPrototype%",
    "Uint32Array": "%Uint32ArrayPrototype%",
    "Int16Array": "%Int16ArrayPrototype%",
    "Uint16Array": "%Uint16ArrayPrototype%",
    "Int8Array": "%Int8ArrayPrototype%",
    "Uint8Array": "%Uint8ArrayPrototype%",
    "Uint8Clamped": "%Uint8ClampedArrayProtoype%"
};

var TypedArrayConstructor_$$create = function $$create(thisArg, argList) {
    var F = thisArg;
    if (Type(F) !== OBJECT) return withError("Type", "the this value is not an object");
    if (!hasInternalSlot(F, SLOTS.TYPEDARRAYCONSTRUCTOR)) return withError("Type", "The this value has no [[TypedArrayConstructor]] property");
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
    if (!IsConstructor(C)) return withError("Type", "The this value is no constructor function.");
    var items = ToObject(source);
    if (isAbrupt(items = ifAbrupt(items))) return items;
    var mapping;
    var k;
    var nextValue, kValue, Pk;
    if (mapfn === undefined) {
        mapping = false;
    } else {
        if (!IsCallable(mapfn)) return withError("Type", "mapfn is not a callable object");
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
    Assert(HasProperty(items, "length"), "items has to be an array like object");
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
        return withError("Type", "The thisValue has to be a constructor");
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

setInternalSlot(TypedArrayConstructor, SLOTS.CALL, TypedArrayConstructor_Call);
LazyDefineProperty(TypedArrayConstructor, $$create, CreateBuiltinFunction(realm, TypedArrayConstructor_$$create, 0, "[Symbol.create]"));
LazyDefineProperty(TypedArrayConstructor, "from", CreateBuiltinFunction(realm, TypedArrayConstructor_from, 1, "from"));
LazyDefineProperty(TypedArrayConstructor, "of", CreateBuiltinFunction(realm, TypedArrayConstructor_of, 2, "of"));

// ------------------------------------------------------------------------------------------
// 22.2.6. Typed Array Prototype
// ------------------------------------------------------------------------------------------

var TypedArrayPrototype_get_byteLength = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return withError("Type", "this value is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return withError("Type", "has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return withError("Type", "slot value for viewed array buffer is undefined");
    var length = getInternalSlot(O, SLOTS.BYTELENGTH);
    return NormalCompletion(length);
};
var TypedArrayPrototype_get_byteOffset = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return withError("Type", "this value is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return withError("Type", "has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return withError("Type", "slot value for viewed array buffer is undefined");
    var offset = getInternalSlot(O, SLOTS.BYTEOFFSET);
    return NormalCompletion(offset);
};
var TypedArrayPrototype_get_buffer = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return withError("Type", "this value is not an object");
    if (!hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER)) return withError("Type", "has no ViewedArrayBuffer slot");
    var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
    if (buffer === undefined) return withError("Type", "slot value for viewed array buffer is undefined");
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
    if (Type(O) !== OBJECT) return withError("Type", "the this value is not an object");
    if (!hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return withError("Type", "the this value has no [[TypedArrayName]] slot");
    var name = getInternalSlot(O, SLOTS.TYPEDARRAYNAME);
    Assert(Type(name) == STRING, "name has to be a string value");
    return NormalCompletion(name);
};

function createTypedArrayPrototype(proto) {
    LazyDefineAccessor(proto, "buffer", CreateBuiltinFunction(realm, TypedArrayPrototype_get_buffer, 0, "get buffer"));
    LazyDefineAccessor(proto, "byteLength", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteLength, 0, "get byteLength"));
    LazyDefineAccessor(proto, "byteOffset", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteOffset, 0, "get byteOffset"));
    LazyDefineAccessor(proto, $$toStringTag, CreateBuiltinFunction(realm, TypedArrayPrototype_get_$$toStringTag, 0, "get [Symbol.toStringTag]"));
    LazyDefineBuiltinFunction(proto, "forEach", 1, TypedArrayPrototype_map);
    LazyDefineBuiltinFunction(proto, "map", 1, TypedArrayPrototype_map);
    LazyDefineBuiltinFunction(proto, "reduce", 1, TypedArrayPrototype_reduce);
    return proto;
}

function createTypedArrayVariant(_type, _bpe, _ctor, _proto, ctorName) {
    setInternalSlot(_ctor, SLOTS.REALM, getRealm());
    setInternalSlot(_ctor, SLOTS.TYPEDARRAYCONSTRUCTOR, ctorName);
    setInternalSlot(_ctor, SLOTS.PROTOTYPE, TypedArrayConstructor);
    setInternalSlot(_ctor, SLOTS.CALL, function (thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT) return withError("Type", "O is not an object");
        if (!hasInternalSlot(O, SLOTS.TYPEDARRAYNAME)) return withError("Type", "[[TypedArrayName]] is missing");
        //if (getInternalSlot(O, SLOTS.TYPEDARRAYNAME) != undefined) return withError("Type", "[[TypedArrayName]] isnt undefined");
        var suffix = "Array";
        if (_type === "Uint8C") suffix = "lamped" + suffix;
        setInternalSlot(O, SLOTS.TYPEDARRAYNAME, _type + suffix);
        var F = this;
        var realmF = getInternalSlot(F, SLOTS.REALM);
        var sup = Get(realmF.intrinsics, "%TypedArray%");
        var args = argList;
        return callInternalSlot(SLOTS.CALL, sup, O, args);
    });
    setInternalSlot(_ctor, SLOTS.CONSTRUCT, function (argList) {
        return OrdinaryConstruct(this, argList);
    });
    LazyDefineBuiltinConstant(_ctor, "BYTES_PER_ELEMENT", _bpe);
    LazyDefineBuiltinConstant(_ctor, "prototype", _proto);
    LazyDefineBuiltinConstant(_proto, "constructor", _ctor);
    createTypedArrayPrototype(_proto);
    return _ctor;
}

createTypedArrayVariant("Int8", 1, Int8ArrayConstructor, Int8ArrayPrototype, "Int8Array");
createTypedArrayVariant("Uint8", 1, Uint8ArrayConstructor, Int8ArrayPrototype, "Uint8Array");
createTypedArrayVariant("Uint8C", 1, Uint8ClampedArrayConstructor, Uint8ClampedArrayPrototype, "Uint8Clamped");
createTypedArrayVariant("Int16", 2, Int16ArrayConstructor, Int16ArrayPrototype, "Int16Array");
createTypedArrayVariant("Uint16", 2, Uint16ArrayConstructor, Uint16ArrayPrototype, "Uint16Array");
createTypedArrayVariant("Int32", 4, Int32ArrayConstructor, Int32ArrayPrototype, "Int32Array");
createTypedArrayVariant("Uint32", 4, Uint32ArrayConstructor, Uint32ArrayPrototype, "Uint32Array");
createTypedArrayVariant("Float32", 8, Float32ArrayConstructor, Float32ArrayPrototype, "Float32Array");
createTypedArrayVariant("Float64", 8, Float64ArrayConstructor, Float64ArrayPrototype, "Float64Array");


// ===========================================================================================================
// TypedArray
// ===========================================================================================================
// ------------------------------------------------------------------------------------------
// Der %TypedArray% Constructor (Superklasse)
// ------------------------------------------------------------------------------------------

var TypedArrayConstructor_Call = function (thisArg, argList) {
    var array, typedArray, length;
    array = argList[0];
    var F = thisArg;
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
        if (array instanceof ArrayExoticObject) {

        } else if ((typedArray = array) instanceof IntegerIndexedExoticObject) {

        }
    } else if (typeof (length = array) == "number") {
        O = thisArg;
        if (Type(O) !== OBJECT) return withError("Type", "this value is not an object");
        if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "object has no TypedArrayName property");
        Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "object has to have a ViewedArrayBuffer property");
        if (getInternalSlot(O, "ViewedArrayBuffer") === undefined) return withError("Type", "object has to have a well defined ViewedArrayBuffer property");
        constructorName = getInternalSlot(O, "TypedArrayName");
        elementType = TypedArrayElementType[constructorName];
        numberLength = ToNumber(length);
        elementLength = ToLength(numberLength);
        if (isAbrupt(elementLength = ifAbrupt(elementLength))) return elementLength;
        if (SameValueZero(numberLength, elementLength) === false) return withError("Range", "TypedArray: numberLength and elementLength are not equal");
        data = AllocateArrayBuffer("%ArrayBuffer%");
        if (isAbrupt(data = ifAbrupt(data))) return data;
        elementSize = TypedArrayElementSize[elementType];
        byteLength = elementSize * elementLength;
        status = SetArrayBufferData(data, byteLength);
        if (isAbrupt(status = ifAbrupt(status))) return status;
        setInternalSlot(O, "ViewedArrayBuffer", data);
        setInternalSlot(O, "ByteLength", byteLength);
        setInternalSlot(O, "ByteOffset", 0);
        setInternalSlot(O, "ArrayLength", elementLength);
        return O;
    } else {
        Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "O has to have [[ViewedArrayBuffer]]");
        var buffer = argList[0];
        var byteOffset = argList[1];
        if (byteOffset === undefined) byteOffset = 0;
        length = argList[2];
        Assert((Type(buffer) === OBJECT) && hasInternalSlot(buffer, "ArrayBufferData"), "buffer has to be an object and to have [[ArrayBufferData]]");
        O = thisArg;
        var arrayBufferData = getInternalSlot(buffer, "ArrayBufferData");
        if (arrayBufferData === undefined) return withError("Type", "[[ArrayBufferData]] is undefined");
        if (Type(O) !== OBJECT || !hasInternalSlot(O, "TypedArrayName")) return withError("Type", "O has to be object and to have [[TypedArrayName]]");
        var viewedArrayBuffer = getInternalSlot(O, "ViewedArrayBuffer");
        var typedArrayName = getInternalSlot(O, "TypedArrayName");
        if (typedArrayName === undefined) return withError("Type", "O has to have a well defined [[TypedArrayName]]");
        constructorName = getInternalSlot(O, "TypedArrayName");
        elementType = TypedArrayElementType[constructorName];
        elementSize = TypedArrayElementSize[elementType];
        var offset = ToInteger(byteOffset);
        if (isAbrupt(offset = ifAbrupt(offset))) return offset;
        if (offset < 0) return withError("Range", "offset is smaller 0");
        if ((offset % elementSize) !== 0) return withError("Range", "offset mod elementSize is not 0");
        var byteBufferLength = getInternalSlot(buffer, "ArrayBufferByteLength");
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
        setInternalSlot(O, "ViewedArrayBuffer", buffer);
        setInternalSlot(O, "ByteLength", newByteLength);
        setInternalSlot(O, "ByteOffset", offset);
        setInternalSlot(O, "ArrayLength", Math.floor(newByteLength / elementSize));
    }
    return O;
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
    if (!hasInternalSlot(F, "TypedArrayConstructor")) return withError("Type", "The this value has no [[TypedArrayConstructor]] property");
    var proto = GetPrototypeFromConstructor(F, typedArrayPrototypeNames[getInternalSlot(F, "TypedArrayConstructor")]);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    var obj = IntegerIndexedObjectCreate(proto);
    setInternalSlot(obj, "ViewedArrayBuffer", undefined);
    setInternalSlot(obj, "TypedArrayName", getInternalSlot(F, "TypedArrayConstructor"));
    setInternalSlot(obj, "ByteLength", 0);
    setInternalSlot(obj, "ByteOffset", 0);
    setInternalSlot(obj, "ArrayLength", 0);
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
        newObj = callInternalSlot("Construct", C, C, [len]);
        if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
        k = 0;
        while (k < len) {
            Pk = ToString(k);
            kValue = values[k];
            if (mapping) {
                mappedValue = callInternalSlot("Call", mapfn, T, [kValue]);
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
    var len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    newObj = callInternalSlot("Construct", C, C, [len]);
    if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;

    var mappedValue;
    k = 0;
    while (k < len) {
        Pk = ToString(k);
        kValue = Get(items, Pk);
        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
        if (mapping) {
            mappedValue = callInternalSlot("Call", mapfn, T, [kValue, k, items]);
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
    var C = thisArg;

    if (IsConstructor(C)) {
        var newObj = callInternalSlot("Construct", C, C, [len]);
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

setInternalSlot(TypedArrayConstructor, "Call", TypedArrayConstructor_Call);
LazyDefineProperty(TypedArrayConstructor, $$create, CreateBuiltinFunction(realm, TypedArrayConstructor_$$create, 0, "[Symbol.create]"));
LazyDefineProperty(TypedArrayConstructor, "from", CreateBuiltinFunction(realm, TypedArrayConstructor_from, 1, "from"));
LazyDefineProperty(TypedArrayConstructor, "of", CreateBuiltinFunction(realm, TypedArrayConstructor_of, 2, "of"));

// ------------------------------------------------------------------------------------------
// 22.2.6. Typed Array Prototype
// ------------------------------------------------------------------------------------------

var TypedArrayPrototype_get_buffer = function (thisArg, argList) {

};
var TypedArrayPrototype_get_byteLength = function (thisArg, argList) {

};
var TypedArrayPrototype_get_byteOffset = function (thisArg, argList) {

};
var TypedArrayPrototype_get_buffer = function (thisArg, argList) {

};

var tap_subarray = function subarray(thisArg, argList) {

};

// filter
// find
// findIndex
// forEach
// indexOf
// join
// keys
// lastIndexOf
// length
// map
// reduce
// reduceRight
// reverse
// set
// slice
// some
// sort
// subarray
// toLocaleString
// toString
// values
// $$iterator
var TypedArrayPrototype_$$iterator = function iterator(thisArg, argList) {

};

// $$toStringTag
var TypedArrayPrototype_get_$$toStringTag = function get_toStringTag(thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return withError("Type", "the this value is not an object");
    if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "the this value has no [[TypedArrayName]] slot");
    var name = getInternalSlot(O, "TypedArrayName");
    Assert(Type(name) == STRING, "name has to be a string value");
    return NormalCompletion(name);
};

function createTypedArrayPrototype(proto) {
    LazyDefineAccessor(proto, "buffer", CreateBuiltinFunction(realm, TypedArrayPrototype_get_buffer, 0, "get buffer"));
    LazyDefineAccessor(proto, "byteLength", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteLength, 0, "get byteLength"));
    LazyDefineAccessor(proto, "byteOffset", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteOffset, 0, "get byteOffset"));
    LazyDefineAccessor(proto, $$toStringTag, CreateBuiltinFunction(realm, TypedArrayPrototype_get_$$toStringTag, 0, "get [Symbol.toStringTag]"));
    return proto;
}

// ===========================================================================================================
// Create Typed Arrays
// ===========================================================================================================

function createTypedArrayVariant(_type, _bpe, _ctor, _proto) {

    //    setInternalSlot(_ctor, "TypedArrayConstructor", _type + "Array");

    setInternalSlot(_ctor, "Prototype", TypedArrayConstructor);

    setInternalSlot(_ctor, "Call", function (thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT) return withError("Type", "O is not an object");
        if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "[[TypedArrayName]] is missing");
        if (getInternalSlot(O, "TypedArrayName") != undefined) return withError("Type", "[[TypedArrayName]] isnt undefined");
        setInternalSlot(O, "TypedArrayName", _type + "Array");
        var F = this;
        var realmF = getInternalSlot(F, "Realm");
        var sup = Get(realmF.intrinsics, "%TypedArray%");
        var args = argList;
        return callInternalSlot("Call", sup, O, args);
    });

    setInternalSlot(_ctor, "Construct", function (argList) {
        return OrdinaryConstruct(this, argList);
    });
    DefineOwnProperty(_ctor, "BYTES_PER_ELEMENT", {
        value: _bpe,
        writable: false,
        enumerable: false,
        configurable: false
    });
    DefineOwnProperty(_ctor, "prototype", {
        value: _proto,
        writable: false,
        enumerable: true,
        configurable: false
    });
    DefineOwnProperty(_proto, "constructor", {
        value: _ctor,
        writable: false,
        enumerable: true,
        configurable: false
    });

    return _ctor;
}

createTypedArrayVariant("Int8", 1, Int8ArrayConstructor, Int8ArrayPrototype);
createTypedArrayVariant("Uint8", 1, Uint8ArrayConstructor, Int8ArrayPrototype);
createTypedArrayVariant("Uint8C", 1, Uint8ClampedArrayConstructor, Uint8ClampedArrayPrototype);
createTypedArrayVariant("Int16", 2, Int16ArrayConstructor, Int16ArrayPrototype);
createTypedArrayVariant("Uint16", 2, Uint16ArrayConstructor, Uint16ArrayPrototype);
createTypedArrayVariant("Int32", 4, Int32ArrayConstructor, Int32ArrayPrototype);
createTypedArrayVariant("Uint32", 4, Uint32ArrayConstructor, Uint32ArrayPrototype);
createTypedArrayVariant("Float32", 8, Float32ArrayConstructor, Float32ArrayPrototype);
createTypedArrayVariant("Float64", 8, Float64ArrayConstructor, Float64ArrayPrototype);

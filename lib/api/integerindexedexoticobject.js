/**
 * Created by root on 30.03.14.
 */
// ===========================================================================================================
// Integer Indexed Exotic Object
// ===========================================================================================================

function IntegerIndexedExoticObject() {
    var O = Object.create(IntegerIndexedExoticObject.prototype);
    setInternalSlot(O, "ArrayBufferData", undefined);
    return O;
}
IntegerIndexedExoticObject.prototype = assign(IntegerIndexedExoticObject.prototype, {
    DefineOwnProperty: function (P, Desc) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
        if (Type(P) === "string") {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) {
                if (intIndex < 0) return false;
                var len = O.ArrayLength;
                if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                if (intIndex >= len) return false;
                if (IsAccessorDescriptor(Desc)) return false;
                if (Desc.configurable) return false;
                if (Desc.enumerable === false) return false;
                var writable = true; // oder nicht... korrigiere hier
                var makeReadOnly = false;
                if (Desc.writable !== undefined) {
                    if (Desc.writable && !writable) return false;
                    if (!Desc.writable && writable) makeReadOnly = true;
                }
                if (Desc.value !== undefined) {
                    if (!writable) {
                        var oldValue = IntegerIndexedElementGet(O, intIndex);
                        if (isAbrupt(oldValue = ifAbrupt(oldValue))) return oldValue;
                        if (value === undefined) return false;
                        if (!SameValue(value, oldValue)) return false;
                    }
                }
                var status = IntegerIndexedElementSet(O, intIndex, value);
                if (isAbrupt(status = ifAbrupt(status))) return status;
                if (makeReadOnly) {
                    // mark as non-writable
                }
                return true;
            }
        }
        // ordinarygetownproperty im draft, maybe fehler
        return OrdinaryDefineOwnProperty(O, P);
    },
    Get: function (P, R) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        if ((Type(P) === "string") && SameValue(O, R)) {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) return IntegerIndexedElementGet(O, intIndex);
        }
        return Get(O, P, R);
    },
    Set: function (P, V, R) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        if ((Type(P) === "string") && SameValue(O, R)) {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) return ToBoolean(IntegerIndexedElementSet(O, intIndex, V));
        }
        return Set(O, P, V, R);

    },
    GetOwnProperty: function (P) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
        if (Type(P) === "string") {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) {
                var value = IntegerIndexedElementGet(O, intIndex);
                if (isAbrupt(value = ifAbrupt(value))) return value;
                if (value === undefined) return undefined;
                var writable = true;
                // setze falsch, falls sie es nciht sind, die props vom integerindexed
                return {
                    value: value,
                    enumerable: true,
                    writable: writable,
                    configurable: false
                };
            }
        }
        return OrdinaryGetOwnProperty(O, P);
    },
    HasOwnProperty: function (P) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
        if (Type(P) === "string") {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) {
                if (intIndex < 0) return false;
                var len = O.ArrayLength;
                if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                if (intIndex >= len) return false;
            }
        }
        return HasOwnProperty(O, P);
    },
    Enumerate: function () {
        return Enumerate(this);
    },
    OwnPropertyKeys: function () {
        return OwnPropertyKeys(this);
    },
    constructor: IntegerIndexedExoticObject,
    toString: function () {
        return "[object IntegerIndexedExoticObject]";
    },
    type: "object"
});
addMissingProperties(IntegerIndexedExoticObject.prototype, OrdinaryObject.prototype);

function IntegerIndexedElementGet(O, index) {
    Assert(Type(index) === "number", "index type has to be number");
    Assert(index === ToInteger(index), "index has to be tointeger of index");
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    var length = getInternalSlot(O, "ArrayLength");
    if (index < 0 || index >= length) return undefined;
    var offset = O.ByteOffset;
    var arrayTypeName = O.TypedArrayName;
    var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
    var indexedPosition = (index * elementSize) + offset;
    var elementType = TypedArrayElementType[arrayTypeName];
    return GetValueFromBuffer(buffer, indexedPosition, elementType);
}

function IntegerIndexedElementSet(O, index, value) {
    Assert(Type(index) === "number", "index type has to be number");
    Assert(index === ToInteger(index), "index has to be tointeger of index");
    var O = ToObject(ThisResolution());
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    if (!buffer) return withError("Type", "object is not a viewed array buffer");
    var length = getInternalSlot(O, "ArrayLength");
    var numValue = ToNumber(value);
    if (isAbrupt(numValue = ifAbrupt(numValue))) return numValue;
    if (index < 0 || index >= length) return numValue;
    var offset = O.ByteOffset;
    var arrayTypeName = O.TypedArrayName;
    var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
    var indexedPosition = (index * elementSize) + offset;
    var elementType = TypedArrayElementType[arrayTypeName];
    var status = SetValueInBuffer(buffer, indexedPosition, elementType, numValue);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    return numValue;
}

var TypedArrayElementSize = {
    "Float64Array": 8,
    "Float32Array": 4,
    "Int32Array": 4,
    "Uint32Array": 4,
    "Int16Array": 2,
    "Uint16Array": 2,
    "Int8Array": 1,
    "Uint8Array": 1,
    "Uint8ClampedArray": 1
};

var TypedArrayElementType = {
    "Float64Array": "Float64",
    "Float32Array": "Float32",
    "Int32Array": "Int32",
    "Uint32Array": "Uint32",
    "Int16Array": "Int16",
    "Uint16Array": "Uint16",
    "Int8Array": "Int8",
    "Uint8Array": "Uint8",
    "Uint8ClampedArray": "Uint8C"
};



function IntegerIndexedObjectCreate(prototype) {
    var O = IntegerIndexedExoticObject();
    setInternalSlot(O, "Extensible", true);
    setInternalSlot(O, "Prototype", prototype);
    setInternalSlot(O, "hiddenBuffer", undefined);
    return O;
}

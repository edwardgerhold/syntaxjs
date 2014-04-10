/**
 * Created by root on 04.04.14.
 */
var TypePrototypePrototype_get = function (thisArg, argList) {
    var O = thisArg;
    if (!hasInternalSlot(O, "TypeDescriptor")) return withError("Type", "has no type descriptor");
    return NormalCompletion(getInternalSlot(O, "TypeDescriptor"));
};

var TypePrototype_arrayType = function (thisArg, argList) {
    var O = thisArg;
    var length = argList[0];
    if (!TypeObject(O)) return withError("Type", "not a typed object");
    var typeDescriptor = getInternalSlot(O, "TypeDescriptor");
    var numberLength = ToNumber(length);
    var elementLength = ToLength(numberLength);
    if (isAbrupt(elementLength=ifAbrupt(elementLength))) return elementLength;
    if (SameValueZero(numberLength, elementLength)) return withError("Range", "");
    var arrayDescriptor = GetOrCreateArrayTypeDescriptor(typeDescriptor);
    if (isAbrupt(arrayDescriptor=ifAbrupt(arrayDescriptor))) return arrayDescriptor;
    var R = TypeExoticObject();
    setInternalSlot(R, "TypeDescriptor", arrayDescriptor);
    var newDimensions = Cons(N, dimension);
    setInternalSlot(R, "Dimensions", newDimensions);
    return NormalCompletion(R);
};

var TypePrototype_opaqueType = function (thisArg, argList) {
    var O = thisArg;
    if (!IsTypeObject(O)) return withError("Type","is not a typed object");
    var typeDescriptor = getInternalSlot(O, "TypeDescriptor");
    var dimensions = setInternalSlot(O, "Dimensions");
    var opaqueDescriptor = GetOrCreateOpaqueTypeDescriptor(typeDescriptor);
    if (isAbrupt(opaqueDescriptor = ifAbrupt(opaqueDescriptor))) return opaqueDescriptor;
    var R = TypeObject();
    setInternalSlot(R, "TypeDescriptor", opaqueDescriptor);
    setInternalSlot(R, "Dimensions", dimensions);
    return NormalCompletion(R);
};



var StructType_Call = function (thisArg, argList) {
    var object = argList[0];
    if (Type(object) !== "object") return withError("Type", "");
    var O = thisArg;
    if (!IsTypeObject(O)) return withError("Type", "");
    var currentOffset = 0;
    var maxAlignment = 1;
    var structure = [];
    for (var P in object.Bindings) {
        var fieldType = Get(object, P);
        if (isAbrupt(fieldType=ifAbrupt(fieldType))) return fieldType;
        if (!IsTypeObject(fieldType)) return withError("Type", "");
        var alignment = Alignment(fieldType);
        var maxAlignment = Math.max(alignment, maxAlignment);
        var currentOffset = AlignTo(currentOffset, alignment);

        var r = FieldRecord(fieldName, byteOffset, currentOffset, fieldType);
        structure.push(r);
        var s = Size(fieldType);
        if (isAbrupt(s=ifAbrupt(s))) return s;
        currentOffset = currentOffset + s;
    }
    var size = AlignTo(currentOffset, maxAlignment);
    var typeDescriptor = CreateStructTypeDescriptor(structure);
    setInternalSlot(O, "TypeDescriptor", typeDescriptor);
    OrdinaryDefineOwnProperty(O, "prototype", {
        configurable: false,
        enumerable: false,
        value: typeDescriptor,
        writable: false
    });
    return NormalCompletion(O);
};

// The above must be moved out of intrinsics/ into api for more speed creating realms.
// that all "objects" gonna be refactored for typed memory is some other topic.

// StructType
setInternalSlot(StructTypeConstructor, "Call", StructType_Call);
// StructType.prototype



// Type.prototype
LazyDefineAccessor(TypePrototype, "prototype", TypePrototypePrototype_get);
LazyDefineBuiltinFunction(TypePrototype, "arrayType", 1, TypePrototype_arrayType);
LazyDefineBuiltinFunction(TypePrototype, "opaqueType", 1, TypePrototype_opaqueType);














/**
 * Created by root on 04.04.14.
 */
var TypePrototypePrototype;

var TypePrototype_arrayType = function (thisArg, argList) {
};

var TypePrototype_opaqueType = function (thisArg, argList) {
};

var StructType_Call = function (thisArg, argList) {
};

// The above must be moved out of intrinsics/ into api for more speed creating realms.
// that all "objects" gonna be refactored for typed memory is some other topic.

// Type.prototype
LazyDefineBuiltinFunction(TypePrototype, "arrayType", 1, TypePrototype_arrayType);
LazyDefineBuiltinFunction(TypePrototype, "opaqueType", 1, TypePrototype_opaqueType);

// StructType
setInternalSlot(StructTypeConstructor, "Call", StructType_Call);
// StructType.prototype

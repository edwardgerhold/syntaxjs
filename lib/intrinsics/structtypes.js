// StructType
setInternalSlot(StructTypeConstructor, SLOTS.CALL, StructTypeConstructor_Call);
setInternalSlot(StructTypeConstructor, SLOTS.CONSTRUCT, StructTypeConstructor_Construct);
LazyDefineBuiltinFunction(StructTypePrototype, $$create, 1, StructTypeConstructor_$$create)
// StructType.prototype
// Type.prototype
LazyDefineAccessor(TypePrototype, "prototype", TypePrototypePrototype_get);
LazyDefineBuiltinFunction(TypePrototype, "arrayType", 1, TypePrototype_arrayType);
LazyDefineBuiltinFunction(TypePrototype, "opaqueType", 1, TypePrototype_opaqueType);
// StructType
setInternalSlot(StructTypeConstructor, SLOTS.CALL, StructTypeConstructor_Call);
setInternalSlot(StructTypeConstructor, SLOTS.CONSTRUCT, StructTypeConstructor_Construct);
NowDefineBuiltinFunction(StructTypePrototype, $$create, 1, StructTypeConstructor_$$create)
// StructType.prototype
// Type.prototype
NowDefineAccessor(TypePrototype, "prototype", TypePrototypePrototype_get);
NowDefineBuiltinFunction(TypePrototype, "arrayType", 1, TypePrototype_arrayType);
NowDefineBuiltinFunction(TypePrototype, "opaqueType", 1, TypePrototype_opaqueType);
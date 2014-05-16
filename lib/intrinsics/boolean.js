setInternalSlot(BooleanConstructor, SLOTS.CALL, BooleanConstructor_call);
setInternalSlot(BooleanConstructor, SLOTS.CONSTRUCT, BooleanConstructor_construct);
MakeConstructor(BooleanConstructor, true, BooleanPrototype);
LazyDefineBuiltinFunction(BooleanConstructor, $$create, 1, BooleanConstructor_$$create);
LazyDefineBuiltinFunction(BooleanPrototype, "toString", 0, BooleanPrototype_toString)
LazyDefineBuiltinFunction(BooleanPrototype, "valueOf", 0, BooleanPrototype_valueOf)
LazyDefineBuiltinConstant(BooleanConstructor, "prototype", BooleanPrototype);
LazyDefineBuiltinConstant(BooleanConstructor, "constructor", BooleanConstructor);

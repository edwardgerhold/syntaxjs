setInternalSlot(BooleanConstructor, SLOTS.CALL, BooleanConstructor_call);
setInternalSlot(BooleanConstructor, SLOTS.CONSTRUCT, BooleanConstructor_construct);
MakeConstructor(BooleanConstructor, true, BooleanPrototype);
NowDefineBuiltinFunction(BooleanConstructor, $$create, 1, BooleanConstructor_$$create);
NowDefineBuiltinFunction(BooleanPrototype, "toString", 0, BooleanPrototype_toString)
NowDefineBuiltinFunction(BooleanPrototype, "valueOf", 0, BooleanPrototype_valueOf)
NowDefineBuiltinConstant(BooleanConstructor, "prototype", BooleanPrototype);
NowDefineBuiltinConstant(BooleanConstructor, "constructor", BooleanConstructor);
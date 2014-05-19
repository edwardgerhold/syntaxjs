// %Realm%
setInternalSlot(RealmConstructor, SLOTS.CALL, RealmConstructor_Call);
setInternalSlot(RealmConstructor, SLOTS.CONSTRUCT, RealmConstructor_Construct);
NowDefineProperty(RealmConstructor, $$create, CreateBuiltinFunction(realm,RealmConstructor_$$create, 0, "[Symbol.create]"));
MakeConstructor(RealmConstructor, false, RealmPrototype);
NowDefineBuiltinFunction(RealmPrototype, "intrinsics", 2, RealmPrototype_intrinsics);
NowDefineBuiltinFunction(RealmPrototype, "indirectEval", 2, RealmPrototype_indirectEval);
NowDefineBuiltinFunction(RealmPrototype, "initGlobal", 2, RealmPrototype_initGlobal);
NowDefineAccessorFunction(RealmPrototype, "stdlib", 3, RealmPrototype_stdlib_get);
// %RealmPrototype%
NowDefineAccessor(RealmPrototype, "global", CreateBuiltinFunction(realm,RealmPrototype_get_global, 0, "get global"));
NowDefineProperty(RealmPrototype, "eval", CreateBuiltinFunction(realm,RealmPrototype_eval, 1, "eval"));
NowDefineProperty(RealmPrototype, $$toStringTag, "Reflect.Realm");
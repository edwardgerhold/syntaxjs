// %Realm%
setInternalSlot(RealmConstructor, SLOTS.CALL, RealmConstructor_Call);
setInternalSlot(RealmConstructor, SLOTS.CONSTRUCT, RealmConstructor_Construct);
LazyDefineProperty(RealmConstructor, $$create, CreateBuiltinFunction(realm,RealmConstructor_$$create, 0, "[Symbol.create]"));
MakeConstructor(RealmConstructor, false, RealmPrototype);
LazyDefineBuiltinFunction(RealmPrototype, "intrinsics", 2, RealmPrototype_intrinsics);
LazyDefineBuiltinFunction(RealmPrototype, "indirectEval", 2, RealmPrototype_indirectEval);
LazyDefineBuiltinFunction(RealmPrototype, "initGlobal", 2, RealmPrototype_initGlobal);
LazyDefineAccessorFunction(RealmPrototype, "stdlib", 3, RealmPrototype_stdlib_get);
// %RealmPrototype%
LazyDefineAccessor(RealmPrototype, "global", CreateBuiltinFunction(realm,RealmPrototype_get_global, 0, "get global"));
LazyDefineProperty(RealmPrototype, "eval", CreateBuiltinFunction(realm,RealmPrototype_eval, 1, "eval"));
LazyDefineProperty(RealmPrototype, $$toStringTag, "Reflect.Realm");
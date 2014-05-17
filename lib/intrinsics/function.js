MakeConstructor(FunctionConstructor, true, FunctionPrototype);
setInternalSlot(FunctionPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
LazyDefineProperty(FunctionPrototype, $$toStringTag, "Function");
LazyDefineBuiltinFunction(FunctionPrototype, "valueOf", 0, FunctionPrototype_valueOf);
setInternalSlot(FunctionConstructor, SLOTS.CALL, FunctionPrototype_call);
setInternalSlot(FunctionConstructor, SLOTS.CONSTRUCT, FunctionConstructor_construct);
LazyDefineProperty(FunctionConstructor, $$create, CreateBuiltinFunction(realm, FunctionConstructor_$$create, 1, "[Symbol.create]"));
LazyDefineProperty(FunctionPrototype, $$create, CreateBuiltinFunction(realm, FunctionPrototype_$$create, 1, "[Symbol.create]"));
LazyDefineProperty(FunctionPrototype, "constructor", FunctionConstructor);
LazyDefineBuiltinFunction(FunctionPrototype, "toString", 0, FunctionPrototype_toString);
LazyDefineBuiltinFunction(FunctionPrototype, "apply", 1, FunctionPrototype_apply);
LazyDefineBuiltinFunction(FunctionPrototype, "bind", 1, FunctionPrototype_bind);
LazyDefineBuiltinFunction(FunctionPrototype, "call", 1, FunctionPrototype_call);
LazyDefineProperty(FunctionPrototype, $$hasInstance, CreateBuiltinFunction(realm, FunctionPrototype_$$hasInstance, 1, "[Symbol.hasInstance]"));
LazyDefineBuiltinFunction(FunctionPrototype, "toMethod", 1, FunctionPrototype_toMethod /*, realm  !!!*/);


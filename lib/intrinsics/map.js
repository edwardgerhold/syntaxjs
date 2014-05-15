
setInternalSlot(MapConstructor, SLOTS.PROTOTYPE, FunctionPrototype);
setInternalSlot(MapPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
setInternalSlot(MapConstructor, SLOTS.CALL, MapConstructor_call);
setInternalSlot(MapConstructor, SLOTS.CONSTRUCT, MapConstructor_construct);
LazyDefineProperty(MapConstructor, $$create, CreateBuiltinFunction(realm, MapConstructor_$$create, 1, "[Symbol.create]"));
LazyDefineBuiltinConstant(MapConstructor, "prototype", MapPrototype);
LazyDefineBuiltinFunction(MapPrototype, "get", 1, MapPrototype_get);
LazyDefineBuiltinFunction(MapPrototype, "has", 1, MapPrototype_has);
LazyDefineBuiltinFunction(MapPrototype, "set", 2, MapPrototype_set);
LazyDefineBuiltinFunction(MapPrototype, "delete", 1, MapPrototype_delete);
LazyDefineBuiltinConstant(MapPrototype, "constructor", MapConstructor);
LazyDefineBuiltinFunction(MapPrototype, "entries", 0, MapPrototype_entries);
LazyDefineBuiltinFunction(MapPrototype, "keys", 0, MapPrototype_keys);
LazyDefineBuiltinFunction(MapPrototype, "values", 0, MapPrototype_values);
LazyDefineBuiltinFunction(MapPrototype, $$iterator, 0, MapPrototype_entries);
LazyDefineBuiltinConstant(MapPrototype, $$toStringTag, "Map");


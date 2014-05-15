
MakeConstructor(RegExpConstructor, true, RegExpPrototype);



setInternalSlot(RegExpConstructor, SLOTS.CALL, RegExp_Call);
setInternalSlot(RegExpConstructor, SLOTS.CONSTRUCT, RegExp_Construct);

LazyDefineBuiltinConstant(RegExpConstructor, "prototype", RegExpPrototype);
LazyDefineBuiltinConstant(RegExpPrototype, "constructor", RegExpConstructor);

LazyDefineBuiltinConstant(RegExpPrototype, $$isRegExp, true);
LazyDefineBuiltinConstant(RegExpPrototype, $$toStringTag, "RegExp");
LazyDefineBuiltinFunction(RegExpConstructor, $$create, 1, RegExp_$$create);

LazyDefineAccessorFunction(RegExpPrototype, "ignoreCase",  0, RegExpPrototype_get_ignoreCase);
LazyDefineAccessorFunction(RegExpPrototype, "global",  0, RegExpPrototype_get_global);
LazyDefineAccessorFunction(RegExpPrototype, "multiline",  0, RegExpPrototype_get_multiline);
LazyDefineAccessorFunction(RegExpPrototype, "source",  0, RegExpPrototype_get_source);
LazyDefineAccessorFunction(RegExpPrototype, "sticky",  0, RegExpPrototype_get_sticky);
LazyDefineAccessorFunction(RegExpPrototype, "unicode", 0, RegExpPrototype_get_unicode);

LazyDefineProperty(RegExpPrototype, "lastIndex", 0);

LazyDefineBuiltinFunction(RegExpPrototype, "compile", 1, RegExpPrototype_compile);
LazyDefineBuiltinFunction(RegExpPrototype, "exec", 1, RegExpPrototype_exec);
LazyDefineBuiltinFunction(RegExpPrototype, "match", 1, RegExpPrototype_match);
LazyDefineBuiltinFunction(RegExpPrototype, "replace", 1, RegExpPrototype_replace);
LazyDefineBuiltinFunction(RegExpPrototype, "search", 1, RegExpPrototype_search);
LazyDefineBuiltinFunction(RegExpPrototype, "split", 1, RegExpPrototype_split);
LazyDefineBuiltinFunction(RegExpPrototype, "test", 1, RegExpPrototype_test);
LazyDefineBuiltinFunction(RegExpPrototype, "toString", 1, RegExpPrototype_toString);


setInternalSlot(DateConstructor, SLOTS.CALL, DateConstructor_call);
setInternalSlot(DateConstructor, SLOTS.CONSTRUCT, DateConstructor_construct);
LazyDefineBuiltinConstant(DateConstructor, "prototype", DatePrototype);
LazyDefineBuiltinConstant(DatePrototype, "constructor", DateConstructor);
LazyDefineBuiltinFunction(DateConstructor, "parse", DateConstructor_parse)
LazyDefineBuiltinFunction(DateConstructor, "now", DateConstructor_now)
LazyDefineBuiltinFunction(DatePrototype, "getDate", 0, DatePrototype_getDate);
LazyDefineBuiltinFunction(DatePrototype, "getDay", 0, DatePrototype_getDay);
LazyDefineBuiltinFunction(DatePrototype, "getFullYear", 0, DatePrototype_getFullYear);
LazyDefineBuiltinFunction(DatePrototype, "getMonth", 0, DatePrototype_getMonth);
LazyDefineBuiltinFunction(DatePrototype, "getHours", 0, DatePrototype_getHours);
LazyDefineBuiltinFunction(DatePrototype, "getMinutes", 0, DatePrototype_getMinutes);
LazyDefineBuiltinFunction(DatePrototype, "getMilliSeconds", 0, DatePrototype_getMilliSeconds);
LazyDefineBuiltinFunction(DatePrototype, "getTimeZoneOffset", 0, DatePrototype_getTimeZoneOffset);
LazyDefineBuiltinFunction(DatePrototype, "getUTCDay", 0, DatePrototype_getUTCDay);
LazyDefineBuiltinFunction(DatePrototype, "getUTCFullYear", 0, DatePrototype_getUTCFullYear);
LazyDefineBuiltinFunction(DatePrototype, "getUTCHours", 0, DatePrototype_getUTCHours);
LazyDefineBuiltinFunction(DatePrototype, "getUTCMinutes", 0, DatePrototype_getUTCMinutes);
LazyDefineBuiltinFunction(DatePrototype, "getUTCSeconds", 0, DatePrototype_getUTCSeconds);
LazyDefineBuiltinFunction(DatePrototype, "getUTCMilliSeconds", 0, DatePrototype_getUTCMilliSeconds);
LazyDefineBuiltinConstant(DatePrototype, $$toStringTag, "Date");
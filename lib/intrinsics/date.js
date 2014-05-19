setInternalSlot(DateConstructor, SLOTS.CALL, DateConstructor_call);
setInternalSlot(DateConstructor, SLOTS.CONSTRUCT, DateConstructor_construct);
NowDefineBuiltinConstant(DateConstructor, "prototype", DatePrototype);
NowDefineBuiltinFunction(DateConstructor, $$create, 0, DateConstructor_$$create);
NowDefineBuiltinConstant(DatePrototype, "constructor", DateConstructor);
NowDefineBuiltinFunction(DateConstructor, "parse", DateConstructor_parse)
NowDefineBuiltinFunction(DateConstructor, "now", DateConstructor_now)
NowDefineBuiltinFunction(DatePrototype, "getDate", 0, DatePrototype_getDate);
NowDefineBuiltinFunction(DatePrototype, "setDate", 0, DatePrototype_setDate);
NowDefineBuiltinFunction(DatePrototype, "getDay", 0, DatePrototype_getDay);
NowDefineBuiltinFunction(DatePrototype, "getFullYear", 0, DatePrototype_getFullYear);
NowDefineBuiltinFunction(DatePrototype, "getMonth", 0, DatePrototype_getMonth);
NowDefineBuiltinFunction(DatePrototype, "getHours", 0, DatePrototype_getHours);
NowDefineBuiltinFunction(DatePrototype, "getMinutes", 0, DatePrototype_getMinutes);
NowDefineBuiltinFunction(DatePrototype, "getMilliSeconds", 0, DatePrototype_getMilliSeconds);
NowDefineBuiltinFunction(DatePrototype, "getTimeZoneOffset", 0, DatePrototype_getTimeZoneOffset);
NowDefineBuiltinFunction(DatePrototype, "getUTCDay", 0, DatePrototype_getUTCDay);
NowDefineBuiltinFunction(DatePrototype, "getUTCFullYear", 0, DatePrototype_getUTCFullYear);
NowDefineBuiltinFunction(DatePrototype, "getUTCHours", 0, DatePrototype_getUTCHours);
NowDefineBuiltinFunction(DatePrototype, "getUTCMinutes", 0, DatePrototype_getUTCMinutes);
NowDefineBuiltinFunction(DatePrototype, "getUTCSeconds", 0, DatePrototype_getUTCSeconds);
NowDefineBuiltinFunction(DatePrototype, "getUTCMilliSeconds", 0, DatePrototype_getUTCMilliSeconds);
NowDefineBuiltinConstant(DatePrototype, $$toStringTag, "Date");
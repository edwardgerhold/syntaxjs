MakeConstructor(CollatorConstructor, true, CollatorPrototype);
MakeConstructor(NumberFormatConstructor, true, NumberFormatPrototype);
MakeConstructor(DateTimeFormatConstructor, true, DateTimeFormatPrototype);
NowDefineProperty(IntlObject, "Collator", CollatorConstructor)
NowDefineProperty(IntlObject, "NumberFormat", NumberFormatConstructor)
NowDefineProperty(IntlObject, "DateTimeFormat", DateTimeFormatConstructor)
setInternalSlot(CollatorConstructor, SLOTS.CALL, CollatorConstructor_call);
setInternalSlot(CollatorConstructor, SLOTS.CONSTRUCT, CollatorConstructor_construct);
setInternalSlot(NumberFormatConstructor, SLOTS.CALL, NumberFormatConstructor_call);
setInternalSlot(NumberFormatConstructor, SLOTS.CONSTRUCT, NumberFormatConstructor_construct);
setInternalSlot(DateTimeFormatConstructor, SLOTS.CALL, DateTimeFormatConstructor_call);
setInternalSlot(DateTimeFormatConstructor, SLOTS.CONSTRUCT, DateTimeFormatConstructor_construct);
NowDefineBuiltinConstant(IntlObject, $$toStringTag, "Intl");
NowDefineBuiltinConstant(CollatorPrototype, $$toStringTag, "Intl.Collator");
NowDefineBuiltinConstant(NumberFormatPrototype, $$toStringTag, "Intl.NumberFormat");
NowDefineBuiltinConstant(DateTimeFormatPrototype, $$toStringTag, "Intl.DateTimeFormat");
MakeConstructor(ProxyConstructor, true, ProxyPrototype);
LazyDefineBuiltinFunction(ProxyConstructor, "revocable", 2, ProxyConstructor_revocable);
setInternalSlot(ProxyConstructor, SLOTS.CALL, ProxyConstructor_Call);
setInternalSlot(ProxyConstructor, SLOTS.CONSTRUCT, ProxyConstructor_Construct);
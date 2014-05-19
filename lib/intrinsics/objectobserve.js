NowDefineBuiltinFunction(NotifierPrototype, "notify", 1, NotifierPrototype_notify);
NowDefineBuiltinFunction(NotifierPrototype, "performChange", 2, NotifierPrototype_performChange);
NowDefineBuiltinFunction(ObjectConstructor, "observe", 3, ObjectConstructor_observe);
NowDefineBuiltinFunction(ObjectConstructor, "unobserve", 1, ObjectConstructor_unobserve);
NowDefineBuiltinFunction(ObjectConstructor, "deliverChangeRecords", 1, ObjectConstructor_deliverChangeRecords);
NowDefineBuiltinFunction(ObjectConstructor, "getNotifier", 1, ObjectConstructor_getNotifier);
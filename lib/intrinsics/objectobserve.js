LazyDefineBuiltinFunction(NotifierPrototype, "notify", 1, NotifierPrototype_notify);
LazyDefineBuiltinFunction(NotifierPrototype, "performChange", 2, NotifierPrototype_performChange);
LazyDefineBuiltinFunction(ObjectConstructor, "observe", 3, ObjectConstructor_observe);
LazyDefineBuiltinFunction(ObjectConstructor, "unobserve", 1, ObjectConstructor_unobserve);
LazyDefineBuiltinFunction(ObjectConstructor, "deliverChangeRecords", 1, ObjectConstructor_deliverChangeRecords);
LazyDefineBuiltinFunction(ObjectConstructor, "getNotifier", 1, ObjectConstructor_getNotifier);
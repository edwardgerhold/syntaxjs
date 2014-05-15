LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptors", 1, ObjectConstructor_getOwnPropertyDescriptors);
MakeConstructor(ObjectConstructor, true, ObjectPrototype);
setInternalSlot(ObjectPrototype, SLOTS.PROTOTYPE, null);
var ObjectPrototype_proto_ = {
    __proto__:null,
    configurable: true,
    enumerable: false,
    get: CreateBuiltinFunction(realm, ObjectPrototype_get_proto, "get __proto__", 0),
    set: CreateBuiltinFunction(realm, ObjectPrototype_set_proto, "set __proto___", 0)
};
DefineOwnProperty(ObjectPrototype, "__proto__", ObjectPrototype_proto_);
setInternalSlot(ObjectConstructor, SLOTS.CALL, ObjectConstructor_call);
setInternalSlot(ObjectConstructor, SLOTS.CONSTRUCT, ObjectConstructor_construct);
LazyDefineBuiltinFunction(ObjectConstructor, "assign", 2, ObjectConstructor_assign);
LazyDefineBuiltinFunction(ObjectConstructor, "create", 0, ObjectConstructor_create);
LazyDefineBuiltinFunction(ObjectConstructor, "defineProperty", 0, ObjectConstructor_defineProperty);
LazyDefineBuiltinFunction(ObjectConstructor, "defineProperties", 0, ObjectConstructor_defineProperties);
LazyDefineBuiltinFunction(ObjectConstructor, "freeze", 1, ObjectConstructor_freeze);
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptor", 2, ObjectConstructor_getOwnPropertyDescriptor);
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyNames", 1, ObjectConstructor_getOwnPropertyNames);
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertySymbols", 1, ObjectConstructor_getOwnPropertySymbols);
LazyDefineBuiltinFunction(ObjectConstructor, "getPrototypeOf", 1, ObjectConstructor_getPrototypeOf);
LazyDefineBuiltinFunction(ObjectConstructor, "keys", 1, ObjectConstructor_keys);
LazyDefineBuiltinFunction(ObjectConstructor, "mixin", 2, ObjectConstructor_mixin);
LazyDefineBuiltinFunction(ObjectConstructor, "is", 1, ObjectConstructor_is);
LazyDefineBuiltinFunction(ObjectConstructor, "isExtensible", 1, ObjectConstructor_isExtensible);
LazyDefineBuiltinFunction(ObjectConstructor, "isSealed", 1, ObjectConstructor_isSealed);
LazyDefineBuiltinFunction(ObjectConstructor, "isFrozen", 1, ObjectConstructor_isFrozen);
LazyDefineBuiltinFunction(ObjectConstructor, "preventExtensions", 1, ObjectConstructor_preventExtensions);
LazyDefineBuiltinFunction(ObjectConstructor, "seal", 2, ObjectConstructor_seal);
LazyDefineBuiltinFunction(ObjectPrototype, $$create, 0, ObjectPrototype_$$create);
LazyDefineBuiltinFunction(ObjectPrototype, "hasOwnProperty", 0, ObjectPrototype_hasOwnProperty);
LazyDefineBuiltinFunction(ObjectPrototype, "isPrototypeOf", 0, ObjectPrototype_isPrototypeOf);
LazyDefineBuiltinFunction(ObjectPrototype, "propertyIsEnumerable", 0, ObjectPrototype_propertyIsEnumerable);
LazyDefineBuiltinFunction(ObjectPrototype, "toString", 0, ObjectPrototype_toString);
LazyDefineBuiltinFunction(ObjectPrototype, "valueOf", 0, ObjectPrototype_valueOf);
LazyDefineProperty(ObjectPrototype, $$toStringTag, "Object");
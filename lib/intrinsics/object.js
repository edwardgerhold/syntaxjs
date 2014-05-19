NowDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptors", 1, ObjectConstructor_getOwnPropertyDescriptors);
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
NowDefineBuiltinFunction(ObjectConstructor, "assign", 2, ObjectConstructor_assign);
NowDefineBuiltinFunction(ObjectConstructor, "create", 0, ObjectConstructor_create);
NowDefineBuiltinFunction(ObjectConstructor, "defineProperty", 0, ObjectConstructor_defineProperty);
NowDefineBuiltinFunction(ObjectConstructor, "defineProperties", 0, ObjectConstructor_defineProperties);
NowDefineBuiltinFunction(ObjectConstructor, "freeze", 1, ObjectConstructor_freeze);
NowDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptor", 2, ObjectConstructor_getOwnPropertyDescriptor);
NowDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyNames", 1, ObjectConstructor_getOwnPropertyNames);
NowDefineBuiltinFunction(ObjectConstructor, "getOwnPropertySymbols", 1, ObjectConstructor_getOwnPropertySymbols);
NowDefineBuiltinFunction(ObjectConstructor, "getPrototypeOf", 1, ObjectConstructor_getPrototypeOf);
NowDefineBuiltinFunction(ObjectConstructor, "keys", 1, ObjectConstructor_keys);
NowDefineBuiltinFunction(ObjectConstructor, "mixin", 2, ObjectConstructor_mixin);
NowDefineBuiltinFunction(ObjectConstructor, "is", 1, ObjectConstructor_is);
NowDefineBuiltinFunction(ObjectConstructor, "isExtensible", 1, ObjectConstructor_isExtensible);
NowDefineBuiltinFunction(ObjectConstructor, "isSealed", 1, ObjectConstructor_isSealed);
NowDefineBuiltinFunction(ObjectConstructor, "isFrozen", 1, ObjectConstructor_isFrozen);
NowDefineBuiltinFunction(ObjectConstructor, "preventExtensions", 1, ObjectConstructor_preventExtensions);
NowDefineBuiltinFunction(ObjectConstructor, "seal", 2, ObjectConstructor_seal);
NowDefineBuiltinFunction(ObjectPrototype, $$create, 0, ObjectPrototype_$$create);
NowDefineBuiltinFunction(ObjectPrototype, "hasOwnProperty", 0, ObjectPrototype_hasOwnProperty);
NowDefineBuiltinFunction(ObjectPrototype, "isPrototypeOf", 0, ObjectPrototype_isPrototypeOf);
NowDefineBuiltinFunction(ObjectPrototype, "propertyIsEnumerable", 0, ObjectPrototype_propertyIsEnumerable);
NowDefineBuiltinFunction(ObjectPrototype, "toString", 0, ObjectPrototype_toString);
NowDefineBuiltinFunction(ObjectPrototype, "valueOf", 0, ObjectPrototype_valueOf);
NowDefineProperty(ObjectPrototype, $$toStringTag, "Object");
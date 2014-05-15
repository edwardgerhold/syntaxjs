
setInternalSlot(ArrayBufferConstructor, SLOTS.CALL, ArrayBufferConstructor_call);
setInternalSlot(ArrayBufferConstructor, SLOTS.CONSTRUCT, ArrayBufferConstructor_construct);
setInternalSlot(ArrayBufferConstructor, SLOTS.PROTOTYPE, FunctionPrototype);
LazyDefineBuiltinConstant(ArrayBufferConstructor, "prototype", ArrayBufferPrototype);
LazyDefineBuiltinFunction(ArrayBufferConstructor, "isView", 1, ArrayBufferConstructor_isView);
LazyDefineBuiltinConstant(ArrayBufferPrototype, "constructor", ArrayBufferConstructor);
LazyDefineBuiltinConstant(ArrayBufferPrototype, $$toStringTag, "ArrayBuffer");
LazyDefineBuiltinFunction(ArrayBufferConstructor, $$create, 1, ArrayBufferConstructor_$$create)
setInternalSlot(ArrayBufferPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
LazyDefineAccessorFunction(ArrayBufferPrototype, "byteLength", 0, ArrayBufferPrototype_get_byteLength);
LazyDefineBuiltinFunction(ArrayBufferPrototype, "slice", 1, ArrayBufferPrototype_slice);
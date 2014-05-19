setInternalSlot(ArrayBufferConstructor, SLOTS.CALL, ArrayBufferConstructor_call);
setInternalSlot(ArrayBufferConstructor, SLOTS.CONSTRUCT, ArrayBufferConstructor_construct);
setInternalSlot(ArrayBufferConstructor, SLOTS.PROTOTYPE, FunctionPrototype);
NowDefineBuiltinConstant(ArrayBufferConstructor, "prototype", ArrayBufferPrototype);
NowDefineBuiltinFunction(ArrayBufferConstructor, "isView", 1, ArrayBufferConstructor_isView);
NowDefineBuiltinConstant(ArrayBufferPrototype, "constructor", ArrayBufferConstructor);
NowDefineBuiltinConstant(ArrayBufferPrototype, $$toStringTag, "ArrayBuffer");
NowDefineBuiltinFunction(ArrayBufferConstructor, $$create, 1, ArrayBufferConstructor_$$create)
setInternalSlot(ArrayBufferPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
NowDefineAccessorFunction(ArrayBufferPrototype, "byteLength", 0, ArrayBufferPrototype_get_byteLength);
NowDefineBuiltinFunction(ArrayBufferPrototype, "slice", 1, ArrayBufferPrototype_slice);



MakeConstructor(DataViewConstructor, true, DataViewPrototype);
setInternalSlot(DataViewConstructor, SLOTS.CALL, DataViewConstructor_Call);
setInternalSlot(DataViewConstructor, SLOTS.CONSTRUCT, DataViewConstructor_Construct);
LazyDefineBuiltinFunction(DataViewConstructor, $$create, 1, DataViewConstructor_$$create);
LazyDefineAccessorFunction(DataViewPrototype, "buffer", 0, DataViewPrototype_get_buffer);
LazyDefineAccessorFunction(DataViewPrototype, "byteLength", 0, DataViewPrototype_get_byteLength);
LazyDefineAccessorFunction(DataViewPrototype, "byteOffset", 0, DataViewPrototype_get_byteOffset);
LazyDefineBuiltinFunction(DataViewPrototype, "getFloat32", 1, DataViewPrototype_getFloat32);
LazyDefineBuiltinFunction(DataViewPrototype, "getFloat64", 1, DataViewPrototype_getFloat64);
LazyDefineBuiltinFunction(DataViewPrototype, "getInt8", 1, DataViewPrototype_getInt8);
LazyDefineBuiltinFunction(DataViewPrototype, "getInt16", 1, DataViewPrototype_getInt16);
LazyDefineBuiltinFunction(DataViewPrototype, "getInt32", 1, DataViewPrototype_getInt32);
LazyDefineBuiltinFunction(DataViewPrototype, "getUint8", 1, DataViewPrototype_getUint8);
LazyDefineBuiltinFunction(DataViewPrototype, "getUint16", 1, DataViewPrototype_getUint16);
LazyDefineBuiltinFunction(DataViewPrototype, "getUint32", 1, DataViewPrototype_getUint32);
LazyDefineBuiltinFunction(DataViewPrototype, "setFloat32", 2, DataViewPrototype_setFloat32);
LazyDefineBuiltinFunction(DataViewPrototype, "setFloat64", 2, DataViewPrototype_setFloat64);
LazyDefineBuiltinFunction(DataViewPrototype, "setInt8", 2, DataViewPrototype_setInt8);
LazyDefineBuiltinFunction(DataViewPrototype, "setInt16", 2, DataViewPrototype_setInt16);
LazyDefineBuiltinFunction(DataViewPrototype, "setInt32", 2, DataViewPrototype_setInt32);
LazyDefineBuiltinFunction(DataViewPrototype, "setUint8", 2, DataViewPrototype_setUint8);
LazyDefineBuiltinFunction(DataViewPrototype, "setUint16", 2, DataViewPrototype_setUint16);
LazyDefineBuiltinFunction(DataViewPrototype, "setUint32", 2, DataViewPrototype_setUint32);
LazyDefineBuiltinConstant(DataViewConstructor, $$toStringTag, SLOTS.DATAVIEW);

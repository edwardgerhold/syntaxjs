
LazyDefineBuiltinFunction(ArrayPrototype, "indexOf", 0, ArrayPrototype_indexOf);
LazyDefineBuiltinFunction(ArrayPrototype, "lastIndexOf", 0, ArrayPrototype_lastIndexOf);
LazyDefineBuiltinFunction(ArrayPrototype, "forEach", 0, ArrayPrototype_forEach);
LazyDefineBuiltinFunction(ArrayPrototype, "map", 0, ArrayPrototype_map);
LazyDefineBuiltinFunction(ArrayPrototype, "filter", 0, ArrayPrototype_filter);
LazyDefineBuiltinFunction(ArrayPrototype, "every", 0, ArrayPrototype_every);
LazyDefineBuiltinFunction(ArrayPrototype, "some", 0, ArrayPrototype_some);

LazyDefineBuiltinFunction(ArrayConstructor, $$create, 1, ArrayConstructor_$$create);
LazyDefineBuiltinFunction(ArrayConstructor, "from", 1, ArrayConstructor_from);
LazyDefineBuiltinFunction(ArrayConstructor, "isArray", 1, ArrayConstructor_isArray);
LazyDefineBuiltinFunction(ArrayConstructor, "of", 1, ArrayConstructor_of);

LazyDefineBuiltinConstant(ArrayPrototype, "constructor", ArrayConstructor);
LazyDefineBuiltinConstant(ArrayConstructor, "prototype", ArrayPrototype);


LazyDefineBuiltinFunction(ArrayPrototype, "pop", 0, ArrayPrototype_pop);
LazyDefineBuiltinFunction(ArrayPrototype, "push", 1, ArrayPrototype_push);
LazyDefineBuiltinFunction(ArrayPrototype, "join", 0, ArrayPrototype_join);
LazyDefineBuiltinFunction(ArrayPrototype, "reverse", 0, ArrayPrototype_reverse);
LazyDefineBuiltinFunction(ArrayPrototype, "shift", 0, ArrayPrototype_shift);

LazyDefineBuiltinFunction(ArrayPrototype, "slice", 0, ArrayPrototype_slice);

// -
LazyDefineBuiltinFunction(ArrayPrototype, "sort", 1, ArrayPrototype_sort);
defaultCompareFn = OrdinaryFunction();
setInternalSlot(defaultCompareFn, SLOTS.CALL, defaultCompareFn_call);
// -

LazyDefineBuiltinFunction(ArrayPrototype, "entries", 0, ArrayPrototype_entries);
LazyDefineBuiltinFunction(ArrayPrototype, "keys", 0, ArrayPrototype_keys);
LazyDefineBuiltinFunction(ArrayPrototype, $$iterator, 0, ArrayPrototype_$$iterator);
LazyDefineProperty(ArrayPrototype, $$unscopables, (function () {
        var blackList = ObjectCreate();
        CreateDataProperty(blackList, "find", true);
        CreateDataProperty(blackList, "findIndex", true);
        CreateDataProperty(blackList, "fill", true);
        CreateDataProperty(blackList, "copyWithin", true);
        CreateDataProperty(blackList, "entries", true);
        CreateDataProperty(blackList, "keys", true);
        CreateDataProperty(blackList, "values", true);
        return blackList;
}()));
setInternalSlot(ArrayProto_values, SLOTS.CALL, ArrayPrototype_values);
setInternalSlot(ArrayProto_values, SLOTS.CONSTRUCT, undefined);
LazyDefineProperty(ArrayPrototype, "values", ArrayProto_values);

MakeConstructor(ArrayConstructor, true, ArrayPrototype);
setInternalSlot(ArrayConstructor, SLOTS.CALL, ArrayConstructor_call);
setInternalSlot(ArrayConstructor, SLOTS.CONSTRUCT, ArrayConstructor_construct);
LazyDefineBuiltinConstant(ArrayConstructor, "length", 1);

setInternalSlot(ArrayPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
LazyDefineBuiltinConstant(ArrayConstructor, "prototype", ArrayPrototype);
LazyDefineBuiltinFunction(ArrayPrototype, "concat", 1, ArrayPrototype_concat);
LazyDefineBuiltinFunction(ArrayPrototype, "copyWithin", 2, ArrayPrototype_copyWithin);
LazyDefineBuiltinFunction(ArrayPrototype, "fill", 1, ArrayPrototype_fill);
LazyDefineBuiltinFunction(ArrayPrototype, "find", 1, ArrayPrototype_find);
LazyDefineBuiltinFunction(ArrayPrototype, "findIndex", 1, ArrayPrototype_findIndex);

LazyDefineBuiltinFunction(ArrayPrototype, "reduce", 1, ArrayPrototype_reduce);
LazyDefineBuiltinFunction(ArrayPrototype, "reduceRight", 1, ArrayPrototype_reduceRight);
LazyDefineBuiltinFunction(ArrayPrototype, "splice", 2, ArrayPrototype_splice);
LazyDefineBuiltinFunction(ArrayPrototype, "toLocaleString", 2, ArrayPrototype_toLocaleString);
LazyDefineBuiltinFunction(ArrayPrototype, "unshift", 1, ArrayPrototype_unshift);
LazyDefineBuiltinConstant(ArrayPrototype, $$toStringTag, "Array");
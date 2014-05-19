setInternalSlot(ArrayIteratorPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
LazyDefineBuiltinFunction(ArrayIteratorPrototype, $$iterator, 0, ArrayIteratorPrototype_$$iterator);
LazyDefineBuiltinConstant(ArrayIteratorPrototype, $$toStringTag, "Array Iterator");
LazyDefineBuiltinFunction(ArrayIteratorPrototype, "next", 0, ArrayIteratorPrototype_next);
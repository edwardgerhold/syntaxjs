setInternalSlot(ArrayIteratorPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
NowDefineBuiltinFunction(ArrayIteratorPrototype, $$iterator, 0, ArrayIteratorPrototype_$$iterator);
NowDefineBuiltinConstant(ArrayIteratorPrototype, $$toStringTag, "Array Iterator");
NowDefineBuiltinFunction(ArrayIteratorPrototype, "next", 0, ArrayIteratorPrototype_next);
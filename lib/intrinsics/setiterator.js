NowDefineBuiltinConstant(SetIteratorPrototype, "constructor", undefined);
NowDefineBuiltinConstant(SetIteratorPrototype, $$toStringTag, "Set Iterator");
NowDefineBuiltinFunction(SetIteratorPrototype, $$iterator, 0, SetIteratorPrototype_$$iterator);
NowDefineBuiltinFunction(SetIteratorPrototype, "next", 0, SetIteratorPrototype_next);
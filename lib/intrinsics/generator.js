NowDefineBuiltinFunction(GeneratorPrototype, $$iterator, 0, GeneratorPrototype_$$iterator);
NowDefineProperty(GeneratorPrototype, $$toStringTag, "Generator");
// GeneratorFunction.[[Prototype]] = FunctionPrototype
setInternalSlot(GeneratorFunction, SLOTS.PROTOTYPE, FunctionConstructor);
MakeConstructor(GeneratorFunction, true, GeneratorObject);
// GeneratorFunction.prototype = %Generator%
// GeneratorFunction.prototype.constructor = GeneratorFunction
NowDefineProperty(GeneratorPrototype, "constructor", GeneratorFunction);
NowDefineProperty(GeneratorObject, "constructor", GeneratorFunction);
NowDefineProperty(GeneratorObject, "prototype", GeneratorPrototype);
// GeneratorFunction.prototype.prototype = GeneratorPrototype
setInternalSlot(GeneratorObject, SLOTS.PROTOTYPE, GeneratorPrototype);
// NowDefineProperty(GeneratorPrototype, "constructor", GeneratorObject);
NowDefineBuiltinFunction(GeneratorPrototype, "next", 0, GeneratorPrototype_next);
NowDefineBuiltinFunction(GeneratorPrototype, "throw", 0, GeneratorPrototype_throw);
setInternalSlot(GeneratorFunction, SLOTS.CALL, GeneratorFunction_call);
setInternalSlot(GeneratorFunction, SLOTS.CONSTRUCT, GeneratorFunction_construct);
NowDefineBuiltinFunction(GeneratorFunction, $$create, 0, GeneratorFunction_$$create);
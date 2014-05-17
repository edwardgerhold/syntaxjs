LazyDefineBuiltinFunction(GeneratorPrototype, $$iterator, 0, GeneratorPrototype_$$iterator);
LazyDefineProperty(GeneratorPrototype, $$toStringTag, "Generator");
// GeneratorFunction.[[Prototype]] = FunctionPrototype
setInternalSlot(GeneratorFunction, SLOTS.PROTOTYPE, FunctionConstructor);
MakeConstructor(GeneratorFunction, true, GeneratorObject);
// GeneratorFunction.prototype = %Generator%
// GeneratorFunction.prototype.constructor = GeneratorFunction
LazyDefineProperty(GeneratorPrototype, "constructor", GeneratorFunction);
LazyDefineProperty(GeneratorObject, "constructor", GeneratorFunction);
LazyDefineProperty(GeneratorObject, "prototype", GeneratorPrototype);
// GeneratorFunction.prototype.prototype = GeneratorPrototype
setInternalSlot(GeneratorObject, SLOTS.PROTOTYPE, GeneratorPrototype);
// LazyDefineProperty(GeneratorPrototype, "constructor", GeneratorObject);
LazyDefineBuiltinFunction(GeneratorPrototype, "next", 0, GeneratorPrototype_next);
LazyDefineBuiltinFunction(GeneratorPrototype, "throw", 0, GeneratorPrototype_throw);
setInternalSlot(GeneratorFunction, SLOTS.CALL, GeneratorFunction_call);
setInternalSlot(GeneratorFunction, SLOTS.CONSTRUCT, GeneratorFunction_construct);
LazyDefineBuiltinFunction(GeneratorFunction, $$create, 0, GeneratorFunction_$$create);
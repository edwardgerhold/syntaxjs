
setInternalSlot(MathObject, SLOTS.MATHTAG, true);
setInternalSlot(MathObject, SLOTS.PROTOTYPE, ObjectPrototype);

LazyDefineBuiltinConstant(MathObject, "PI", PI);
LazyDefineBuiltinConstant(MathObject, "LOG2E", LOG2E);
LazyDefineBuiltinConstant(MathObject, "SQRT1_2", SQRT1_2);
LazyDefineBuiltinConstant(MathObject, "SQRT2", SQRT2);
LazyDefineBuiltinConstant(MathObject, "LN10", LN10);
LazyDefineBuiltinConstant(MathObject, "LN2", LN2);
LazyDefineBuiltinConstant(MathObject, "E", E);
LazyDefineBuiltinConstant(MathObject, "LOG10E", LOG10E);
LazyDefineBuiltinConstant(MathObject, $$toStringTag, "Math");

LazyDefineBuiltinFunction(MathObject, "atan", 2, MathObject_atan);
LazyDefineBuiltinFunction(MathObject, "atan2", 1, MathObject_atan2);
LazyDefineBuiltinFunction(MathObject, "ceil", 1, MathObject_ceil);
LazyDefineBuiltinFunction(MathObject, "clz", 1, MathObject_clz);
LazyDefineBuiltinFunction(MathObject, "cos", 1, MathObject_cos);
LazyDefineBuiltinFunction(MathObject, "exp", 1, MathObject_exp);
LazyDefineBuiltinFunction(MathObject, "floor", 1, MathObject_floor);
LazyDefineBuiltinFunction(MathObject, "hypot", 2, MathObject_hypot);
LazyDefineBuiltinFunction(MathObject, "imul", 2, MathObject_imul);
LazyDefineBuiltinFunction(MathObject, "log", 1, MathObject_log);
LazyDefineBuiltinFunction(MathObject, "log1p", 1, MathObject_log1p);
LazyDefineBuiltinFunction(MathObject, "max", 0, MathObject_max);
LazyDefineBuiltinFunction(MathObject, "min", 0, MathObject_min);
LazyDefineBuiltinFunction(MathObject, "pow", 2, MathObject_pow);
LazyDefineBuiltinFunction(MathObject, "sin", 1, MathObject_sin);
LazyDefineBuiltinFunction(MathObject, "sign", 1, MathObject_sign);
LazyDefineBuiltinFunction(MathObject, "tan", 1, MathObject_tan);
LazyDefineBuiltinFunction(MathObject, "random", 0, MathObject_random);


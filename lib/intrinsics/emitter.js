MakeConstructor(EmitterConstructor, true, EmitterPrototype);
setInternalSlot(EmitterPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
setInternalSlot(EmitterConstructor, SLOTS.CALL, EmitterConstructor_call);
setInternalSlot(EmitterConstructor, SLOTS.CONSTRUCT, EmitterConstructor_construct);
LazyDefineBuiltinFunction(EmitterConstructor, $$create, 1, EmitterConstructor_$$create);
LazyDefineBuiltinConstant(EmitterConstructor, "prototype", EmitterPrototype);
LazyDefineBuiltinConstant(EmitterPrototype, "constructor", EmitterConstructor);
LazyDefineBuiltinFunction(EmitterPrototype, "on", 2, EmitterPrototype_on);
LazyDefineBuiltinFunction(EmitterPrototype, "once", 2, EmitterPrototype_once);
LazyDefineBuiltinFunction(EmitterPrototype, "remove", 2, EmitterPrototype_remove);
LazyDefineBuiltinFunction(EmitterPrototype, "removeAll", 2, EmitterPrototype_removeAll);
LazyDefineBuiltinFunction(EmitterPrototype, "emit", 2, EmitterPrototype_emit);
LazyDefineBuiltinConstant(EmitterPrototype, $$toStringTag, "Emitter");


MakeConstructor(EventConstructor, true, EventPrototype);
MakeConstructor(EventTargetConstructor, true, EventTargetPrototype);
MakeConstructor(MessagePortConstructor, true, MessagePortPrototype);
LazyDefineBuiltinFunction(EventTargetPrototype, "addEventListener", 3, EventTargetPrototype_addEventListener);
LazyDefineBuiltinFunction(EventTargetPrototype, "dispatchEvent", 1, EventTargetPrototype_dispatchEvent);
LazyDefineBuiltinFunction(EventTargetPrototype, "removeEventListener", 2, EventTargetPrototype_removeEventListener);
LazyDefineBuiltinFunction(MessagePortPrototype, "close", 0, MessagePortPrototype_close);
LazyDefineBuiltinFunction(MessagePortPrototype, "open", 0, MessagePortPrototype_open);
LazyDefineBuiltinFunction(MessagePortPrototype, "postMessage", 0, MessagePortPrototype_postMessage);

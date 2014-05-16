
setInternalSlot(JSONObject, SLOTS.PROTOTYPE, ObjectPrototype);
setInternalSlot(JSONObject, SLOTS.JSONTAG, true);
LazyDefineBuiltinFunction(JSONObject, "parse", 2, JSONObject_parse);
LazyDefineBuiltinFunction(JSONObject, "stringify", 2, JSONObject_stringify);
LazyDefineBuiltinConstant(JSONObject, $$toStringTag, "JSON");
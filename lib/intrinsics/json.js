setInternalSlot(JSONObject, SLOTS.PROTOTYPE, ObjectPrototype);
setInternalSlot(JSONObject, SLOTS.JSONTAG, true);
NowDefineBuiltinFunction(JSONObject, "parse", 2, JSONObject_parse);
NowDefineBuiltinFunction(JSONObject, "stringify", 2, JSONObject_stringify);
NowDefineBuiltinConstant(JSONObject, $$toStringTag, "JSON");
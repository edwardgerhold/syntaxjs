
LazyDefineBuiltinConstant(ConsoleObject, $$toStringTag, "Console");
LazyDefineBuiltinFunction(ConsoleObject, "log", 1, ConsoleObject_log);
LazyDefineBuiltinFunction(ConsoleObject, "dir", 1, ConsoleObject_dir);
LazyDefineBuiltinFunction(ConsoleObject, "error", 1, ConsoleObject_error);
LazyDefineBuiltinFunction(ConsoleObject, "html", 1, ConsoleObject_html);
NowDefineBuiltinConstant(ConsoleObject, $$toStringTag, "Console");
NowDefineBuiltinFunction(ConsoleObject, "log", 1, ConsoleObject_log);
NowDefineBuiltinFunction(ConsoleObject, "dir", 1, ConsoleObject_dir);
NowDefineBuiltinFunction(ConsoleObject, "error", 1, ConsoleObject_error);
NowDefineBuiltinFunction(ConsoleObject, "html", 1, ConsoleObject_html);
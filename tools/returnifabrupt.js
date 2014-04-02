function replaceReturnIfAbrupt(source) {
	return source.replace(/ReturnifAbrupt\(([\w]+)\)/, function (all, name) {
		return "if isAbrupt("+name+"=ifAbrupt("+name+")) return "+name+";";
	});
}
function replaceReturnIfAbrupt(source) {
	return source.replace(/ReturnifAbrupt\(([\w]+)\)/)/, function (all, name) {
		return "if (("+name+"=ifAbrupt("+name+")) && isAbrupt("+name+")) return "+name+";";
	});
}
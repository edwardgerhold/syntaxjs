function RegExpInitialize(obj, pattern, flags) {
	var P, F, BMP;;
	if (pattern === undefined) P = "";
	else P = ToString(pattern);
	if (isAbrupt(P=ifAbrupt(P))) return P;

	if (flags === undefined) F = "";
	BMP = !(F.indexOf("u") >-1)

}

function RegExpAllocate(constructor) {

	var obj = OrdinaryCreateFromConstructor(constructor, "%RegExpPrototype",{
		"RegExpMatcher": undefined,
		"OriginalSource": undefined,
		"OriginalFlags": undefined
	});
	var status = DefinePropertyOrThrow(obj, "lastIndex", {
		writable: true,
		configurable: false,
		enumerable: false,
		value: undefined

	});	
	if (isAbrupt(status = ifAbrupt(status))) return status;
	return NormalCompletion(obj);		
}
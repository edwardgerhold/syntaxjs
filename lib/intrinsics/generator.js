
LazyDefineProperty(GeneratorPrototype, $$iterator, CreateBuiltinFunction(realm, function (thisArg, argList) {
    return thisArg;
}));

LazyDefineProperty(GeneratorPrototype, $$toStringTag, "Generator");

// GeneratorFunction.[[Prototype]] = FunctionPrototype
setInternalSlot(GeneratorFunction, SLOTS.PROTOTYPE, FunctionConstructor);
MakeConstructor(GeneratorFunction, true, GeneratorObject);
// GeneratorFunction.prototype = %Generator%

DefineOwnProperty(GeneratorFunction, "prototype", {
    value: GeneratorPrototype,
    enumerable: false
});
// GeneratorFunction.prototype.constructor = GeneratorFunction
LazyDefineProperty(GeneratorPrototype, "constructor", GeneratorFunction);
LazyDefineProperty(GeneratorObject, "constructor", GeneratorFunction);
LazyDefineProperty(GeneratorObject, "prototype", GeneratorPrototype);

// GeneratorFunction.prototype.prototype = GeneratorPrototype
setInternalSlot(GeneratorObject, SLOTS.PROTOTYPE, GeneratorPrototype);

//    LazyDefineProperty(GeneratorPrototype, "constructor", GeneratorObject);

LazyDefineProperty(GeneratorPrototype, "next", CreateBuiltinFunction(realm, function (thisArg, argList) {
    var value = argList[0];
    var G = thisArg;
    return GeneratorResume(G, value);
}));

LazyDefineProperty(GeneratorPrototype, "throw", CreateBuiltinFunction(realm, function (thisArg, argList) {
    var g = thisArg;
    var exception = argList[0];
    if (Type(g) !== OBJECT) return newTypeError( "throw: Generator is not an object");
    if (!hasInternalSlot(g, SLOTS.GENERATORSTATE)) return newTypeError( "throw: generator has no GeneratorState property");
    var state = getInternalSlot(g, SLOTS.GENERATORSTATE);
    Assert(hasInternalSlot(g, SLOTS.GENERATORCONTEXT), "generator has to have a GeneratorContext property");
    if (state !== "suspendedStart" && state != "suspendedYield") return newTypeError( "GeneratorState is neither suspendedStart nor -Yield");
    var E = CompletionRecord("throw", exception);
    if (state === "suspendedStart") {
        setInternalSlot(g, SLOTS.GENERATORSTATE, "completed");
        setInternalSlot(g, SLOTS.GENERATORCONTEXT, undefined);
        return E;
    }
    var genContext = getInternalSlot(g, SLOTS.GENERATORCONTEXT);
    var methodContext = getCurrentExectionContext();
    setInternalSlot(g, SLOTS.GENERATORSTATE, "executing");
    getStack().push(genContext);
    var result = genContext.generatorCallback(E);
    Assert(genContext !== getContext());
    Assert(methodContext === getContext());
    return result;
}));

setInternalSlot(GeneratorFunction, SLOTS.CALL, function Call(thisArg, argList) {
    // GeneratorFunction(p1...pn, body)
    var argCount = argList.length;
    var P = "";
    var bodyText;
    var firstArg, nextArg;
    if (argCount === 0) bodyText = "";
    else if (argCount === 1) bodyText = argList[0];
    else if (argCount > 1) {
        firstArg = argList[0];
        P = ToString(firstArg);
        if (isAbrupt(firstArg = ifAbrupt(firstArg))) return firstArg;
        var k = 1;
        while (k < argCount - 1) {
            nextArg = argList[k];
            nextArg = ToString(nextArg);
            if (isAbrupt(nextArg = ifAbrupt(nextArg))) return nextArg;
            P = P + "," + nextArg;
            k += 1;
        }
        bodyText = argList[argCount - 1];
    }

    bodyText = ToString(bodyText);
    if (isAbrupt(bodyText = ifAbrupt(bodyText))) return bodyText;
    var parameters = parseGoal("FormalParameterList", P);

    var funcBody = parseGoal("GeneratorBody", bodyText);

    /*  this is very slow, asking for static semantics here with having to analyse the tree
    * this should be captured by the ecmascript compliant parser */

     if (!Contains(funcBody, "YieldExpression")) return newSyntaxError( "GeneratorFunctions require some yield expression");
    var boundNames = BoundNames(parameters);
    if (!IsSimpleParameterList(parameters)) {
        if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return newSyntaxError( "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
    }
    if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return newSyntaxError( "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");



    var scope = getRealm().globalEnv;
    var F = thisArg;
    if (F == undefined || !hasInternalSlot(F, SLOTS.CODE)) {
        F = FunctionAllocate(GeneratorFunction, "generator");
    }
    if (getInternalSlot(F, SLOTS.FUNCTIONKIND) !== "generator") return newTypeError( "function object not a generator");
    FunctionInitialize(F, "generator", parameters, funcBody, scope, true);
    var proto = ObjectCreate(GeneratorPrototype);
    MakeConstructor(F, true, proto);
    SetFunctionLength(F, ExpectedArgumentCount(F.FormalParameters));
    return NormalCompletion(F);
});

setInternalSlot(GeneratorFunction, SLOTS.CONSTRUCT, function (argList) {
    var F = GeneratorFunction;
    return OrdinaryConstruct(F, argList);
});

LazyDefineProperty(GeneratorFunction, $$create, CreateBuiltinFunction(realm, function (thisArg, argList) {
    var F = thisArg;
    var proto = GetPrototypeFromConstructor(F, INTRINSICS.GENERATOR);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    var obj = FunctionAllocate(proto, "generator");
    return obj;
}));

LazyDefineProperty(GeneratorPrototype, $$create, CreateBuiltinFunction(realm, function (thisArg, argList) {
    var F = thisArg;
    var obj = OrdinaryCreateFromConstructor(F, INTRINSICS.GENERATOR, {
        GeneratorState: null,
        GeneratorContext: null
    });
    return obj;
}));


// ==========================rc=================================================================================
// Function
// ===========================================================================================================

//
// Function
//

MakeConstructor(FunctionConstructor, true, FunctionPrototype);
setInternalSlot(FunctionPrototype, "Prototype", ObjectPrototype);
LazyDefineProperty(FunctionPrototype, $$toStringTag, "Function");

LazyDefineBuiltinFunction(FunctionPrototype, "valueOf", 0, function valueOf(thisArg, argList) {
    return thisArg;
});

setInternalSlot(FunctionConstructor, "Call", function (thisArg, argList) {

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
    var parameters = parseGoal("FormalParameterList", P); // () sind fehlerhaft bei
    var funcBody = parseGoal("FunctionBody", bodyText);

    //if (Contains(funcBody, "YieldExpression")) return withError("Syntax", "regular function may not contain a yield expression");

    var boundNames = BoundNames(parameters);

    if (!IsSimpleParameterList(parameters)) {
        if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
    }
    if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");

    var scope = getRealm().globalEnv;
    var F = thisArg;
    if (F === undefined || !hasInternalSlot(F, "Code")) {
        var C = FunctionConstructor;
        var proto = GetPrototypeFromConstructor(C, "%FunctionPrototype%");
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        F = FunctionAllocate(C);
    }

    if (getInternalSlot(F, "FunctionKind") !== "normal") return withError("Type", "function object not a 'normal' function");
    FunctionInitialise(F, "normal", parameters, funcBody, scope, true);
    var proto = ObjectCreate();
    var status = MakeConstructor(F);
    if (isAbrupt(status)) return status;
    SetFunctionName(F, "anonymous");
    return NormalCompletion(F);

});

setInternalSlot(FunctionConstructor, "Construct", function (argList) {
    var F = this;
    return OrdinaryConstruct(F, argList);
});

DefineOwnProperty(FunctionConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = thisArg;
        var proto = GetPrototypeFromConstructor(F, "%FunctionPrototype%");
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        var obj = FunctionAllocate(proto);
        return obj;
    }),
    enumerable: false,
    writable: false,
    configurable: true
});

LazyDefineProperty(FunctionPrototype, $$create, CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
    var F = thisArg;
    return OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
}));

DefineOwnProperty(FunctionPrototype, "constructor", {
    value: FunctionConstructor,
    enumerable: false,
    configurable: true,
    writable: true
});

// ===
// Function.prototype.toString uses codegen module ===>>> var codegen = require("js-codegen");
// ====

CreateDataProperty(FunctionPrototype, "toString", CreateBuiltinFunction(realm, function (thisArg, argList) {
    var codegen = require("js-codegen");
    var F = thisArg;
    if (!IsCallable(F)) return withError("Type", "Function.prototype.toString only applies to functions!");
    var name = Get(F, "name") || "(anonymous)";
    var P, C;
    P = getInternalSlot(F, "FormalParameters");
    C = getInternalSlot(F, "Code");
    var kind = getInternalSlot(F, "FunctionKind");
    var star = kind === "generator" ? "*" : "";
    var callfn;
    if (!C && (callfn=getInternalSlot(F, "Call"))) {
        var code = "// [[Builtin Function native JavaScript Code]]\r\n";
        // createbuiltin wraps the builtin
        if (callfn.steps) callfn = callfn.steps;
        // setinternalslot call has no wrapper
        // this requires a double check here
        code += callfn.toString();
        return code;
    }
    var paramString, bodyString;
    var p, c, t;
    paramString = codegen.builder.formalParameters(P);
    if (kind === "arrow") {
        if (Array.isArray(C)) {
            bodyString = codegen.builder.functionBody(C);
        } else bodyString = codegen.callBuilder(C);
        return paramString + " => " + bodyString;
    } else {
        bodyString = codegen.builder.functionBody(C);
        return "function" + star + " " + name + " " + paramString + " " + bodyString;
    }
}));


DefineOwnProperty(FunctionPrototype, "apply", {
    value: CreateBuiltinFunction(realm, function apply(thisArg, argList) {
        var func = thisArg;
        if (!IsCallable(func)) return withError("Type", "fproto.apply: func is not callable");
        var T;
        if (T !== undefined && T !== null) T = ToObject(argList[0]);
        else T = argList[0];
        var argArray = argList[1] || ArrayCreate(0);
        var argList2 = CreateListFromArrayLike(argArray);
        if (isAbrupt(argList2 = ifAbrupt(argList2))) return argList2;
        return callInternalSlot("Call", func, T, argList2);
    }),
    enumerable: false,
    configurable: true,
    writable: true
});
DefineOwnProperty(FunctionPrototype, "bind", {
    value: CreateBuiltinFunction(realm, function bind(thisArg, argList) {
        var boundTarget = thisArg;
        var thisArgument = argList[0];
        var listOfArguments = argList.slice(1, argList.length - 1);
        return BoundFunctionCreate(boundTarget, thisArgument, listOfArguments);
    }),
    writable: true,
    enumerable: false,
    configurable: true

});
DefineOwnProperty(FunctionPrototype, "call", {
    value: CreateBuiltinFunction(realm, function call(thisArg, argList) {
        var func = thisArg;
        if (!IsCallable(func)) return withError("Type", "fproto.call: func is not callable");
        var T = ToObject(argList[0]);
        var args = argList.slice(1);
        return callInternalSlot("Call", func, T, args);
    }),
    writable: true,
    enumerable: false,
    configurable: true
});
DefineOwnProperty(FunctionPrototype, $$hasInstance, {
    value: CreateBuiltinFunction(realm, function $$hasInstance(thisArg, argList) {
        var V = argList[0];
        var F = thisArg;
        return OrdinaryHasInstance(F, V);
    }, 1, "[Symbol.hasInstance]"),
    writable: true,
    enumerable: false,
    configurable: true

});

var FunctionPrototype_toMethod = function (thisArg, argList) {
    var superBinding = argList[0];
    var methodName = argList[1];
    if (!IsCallable(thisArg)) return withError("Type", "this value is not callable");
    if (Type(superBinding) !== "object") return withError("Type", "superBinding is not an object");
    if (methodName !== undefined) {
        methodName = ToPropertyKey(methodName);
        if (isAbrupt(methodName = ifAbrupt(methodName))) return methodName;
    }
    return CloneMethod(thisArg, superBinding, methodName);
};

LazyDefineBuiltinFunction(FunctionPrototype, "toMethod", 1, FunctionPrototype_toMethod /*, realm  !!!*/);


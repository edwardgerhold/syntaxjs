
// ==========================rc=================================================================================
// Function
// ===========================================================================================================

//
// Function
//

MakeConstructor(FunctionConstructor, true, FunctionPrototype);
setInternalSlot(FunctionPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
LazyDefineProperty(FunctionPrototype, $$toStringTag, "Function");

LazyDefineBuiltinFunction(FunctionPrototype, "valueOf", 0, function valueOf(thisArg, argList) {
    return thisArg;
});

setInternalSlot(FunctionConstructor, SLOTS.CALL, function (thisArg, argList) {

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


    /* old and from july draf */
    var boundNames = BoundNames(parameters);
    if (!IsSimpleParameterList(parameters)) {
        if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return newSyntaxError( "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
    }
    if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return newSyntaxError( "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");
    /* one of the few edge cases to recall static semantics */

    var scope = getRealm().globalEnv;
    var F = thisArg;
    if (F === undefined || !hasInternalSlot(F, SLOTS.CODE)) {
        var C = FunctionConstructor;
        var proto = GetPrototypeFromConstructor(C, INTRINSICS.FUNCTIONPROTOTYPE);
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        F = FunctionAllocate(C);
    }

    if (getInternalSlot(F, SLOTS.FUNCTIONKIND) !== "normal") return newTypeError( "function object not a 'normal' function");
    FunctionInitialize(F, "normal", parameters, funcBody, scope, true);
    proto = ObjectCreate();
    var status = MakeConstructor(F);
    if (isAbrupt(status)) return status;
    SetFunctionName(F, "anonymous");
    return NormalCompletion(F);

});

setInternalSlot(FunctionConstructor, SLOTS.CONSTRUCT, function (argList) {
    var F = this;
    return OrdinaryConstruct(F, argList);
});

DefineOwnProperty(FunctionConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = thisArg;
        var proto = GetPrototypeFromConstructor(F, INTRINSICS.FUNCTIONPROTOTYPE);
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
    return OrdinaryCreateFromConstructor(F, INTRINSICS.OBJECTPROTOTYPE);
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
    if (!IsCallable(F)) return newTypeError( "Function.prototype.toString only applies to functions!");
    var name = Get(F, "name") || "(anonymous)";
    var P, C;
    P = getInternalSlot(F, SLOTS.FORMALPARAMETERS);
    C = getInternalSlot(F, SLOTS.CODE);
    var kind = getInternalSlot(F, SLOTS.FUNCTIONKIND);
    var star = kind === "generator" ? "*" : "";
    var callfn;
    if (!C && (callfn=getInternalSlot(F, SLOTS.CALL))) {
        var code = "// [[Builtin Function native JavaScript Code]]\r\n";
        // createbuiltin wraps the builtin
        if (callfn.steps) callfn = callfn.steps;
        // setinternalslot call has no wrapper
        // this requires a double check here
        code += callfn.toString();
        return code;
    }
    var paramString, bodyString;
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
        if (!IsCallable(func)) return newTypeError( "fproto.apply: func is not callable");
        var T;
        if (T !== undefined && T !== null) T = ToObject(argList[0]);
        else T = argList[0];
        var argArray = argList[1] || ArrayCreate(0);
        var argList2 = CreateListFromArrayLike(argArray);
        if (isAbrupt(argList2 = ifAbrupt(argList2))) return argList2;
        return callInternalSlot(SLOTS.CALL, func, T, argList2);
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
        if (!IsCallable(func)) return newTypeError( "fproto.call: func is not callable");
        var T = ToObject(argList[0]);
        var args = argList.slice(1);
        return callInternalSlot(SLOTS.CALL, func, T, args);
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
    if (!IsCallable(thisArg)) return newTypeError( "this value is not callable");
    if (Type(superBinding) !== OBJECT) return newTypeError( "superBinding is not an object");
    if (methodName !== undefined) {
        methodName = ToPropertyKey(methodName);
        if (isAbrupt(methodName = ifAbrupt(methodName))) return methodName;
    }
    return CloneMethod(thisArg, superBinding, methodName);
};

LazyDefineBuiltinFunction(FunctionPrototype, "toMethod", 1, FunctionPrototype_toMethod /*, realm  !!!*/);


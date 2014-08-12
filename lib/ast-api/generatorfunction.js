/**
 * Created by root on 22.05.14.
 */

var GeneratorFunction_call = function (thisArg, argList) {

    var GeneratorFunction = this;
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
    if (P != "") {
        var parameters = parseGoal("FormalParameterList", P);
    } else {
        parameters = [];
    }
    if (bodyText != "") {
        var funcBody = parseGoal("GeneratorBody", bodyText);
    } else {
        funcBody = [];
    }

    //if (!Contains(funcBody, "YieldExpression")) return newSyntaxError("GeneratorFunctions require some yield expression");

    var boundNames = BoundNames(parameters);
    if (!IsSimpleParameterList(parameters)) {
        if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return newSyntaxError("Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
    }
    if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return newSyntaxError("Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");

    var scope = getRealm().globalEnv;
    var F = thisArg;
    if (F == undefined || !hasInternalSlot(F, SLOTS.CODE)) {
        F = FunctionAllocate(GeneratorFunction, "generator");
    }
    if (getInternalSlot(F, SLOTS.FUNCTIONKIND) !== "generator") return newTypeError("function object not a generator");
    FunctionInitialize(F, "generator", parameters, funcBody, scope, true);
    var proto = ObjectCreate(getIntrinsic(INTRINSICS.GENERATORPROTOTYPE));
    MakeConstructor(F, true, proto);
    SetFunctionLength(F, ExpectedArgumentCount(parameters));
    return NormalCompletion(F);
};
var GeneratorFunction_construct = function (argList) {
    return OrdinaryConstruct(this, argList);
};
var GeneratorFunction_$$create = function (thisArg, argList) {
    var F = thisArg;
    var proto = GetPrototypeFromConstructor(F, INTRINSICS.GENERATOR);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    var obj = FunctionAllocate(proto, "generator");
    return obj;
};

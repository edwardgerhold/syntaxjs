/**
 * Created by root on 30.03.14.
 */

function MakeMethod (F, methodName, homeObject) {
    Assert(IsCallable(F), "MakeMethod: method is not a function");
    Assert(methodName === undefined || IsPropertyKey(methodName), "MakeMethod: methodName is neither undefined nor a valid property key");
    var hoType = Type(homeObject);
    Assert(hoType === "undefined" || hoType === "object", "MakeMethod: HomeObject is neither undefined nor object.");
    setInternalSlot(F, "NeedsSuper", true);
    setInternalSlot(F, "HomeObject", homeObject);
    setInternalSlot(F, "MethodName", methodName);
    return NormalCompletion(undefined);
}

function MakeSuperReference(propertyKey, strict) {
    var env = GetThisEnvironment();
    if (!env.HasSuperBinding()) return withError("Reference", "Can not make super reference.");
    var actualThis = env.GetThisBinding();
    var baseValue = env.GetSuperBase();
    var bv = CheckObjectCoercible(baseValue);
    if (isAbrupt(bv = ifAbrupt(bv))) return bv;
    if (propertyKey === undefined) propertyKey = env.GetMethodName();
    return Reference(propertyKey, bv, strict, actualThis);
}

function GetSuperBinding(obj) {
    if (Type(obj) !== "object") return undefined;
    if (getInternalSlot(obj, "NeedsSuper") !== true) return undefined;
    //if (!hasInternalSlot(obj, "HomeObject")) return undefined;
    return getInternalSlot(obj, "HomeObject");
}

function cloneFunction (func) {
    var newFunc = OrdinaryFunction();
    setInternalSlot(newFunc, "Environment", getInternalSlot(func, "Environment"));
    setInternalSlot(newFunc, "Code", getInternalSlot(func, "Code"));
    setInternalSlot(newFunc, "FormalParameterList", getInternalSlot(func, "FormalParameterList"));
    setInternalSlot(newFunc, "ThisMode", getInternalSlot(func, "ThisMode"));
    setInternalSlot(newFunc, "FunctionKind", getInternalSlot(func, "FunctionKind"));
    setInternalSlot(newFunc, "Strict", getInternalSlot(func, "Strict"));
    return newFunc;
}

function CloneMethod(func, newHome, newName) {
    Assert(IsCallable(func), "CloneMethod: function has to be callable");
    Assert(Type(newHome) == "object", "CloneMethod: newHome has to be an object");
    Assert(Type(newName) === "undefined" || IsPropertyKey(newName), "CloneMethod: newName has to be undefined or object");
    var newFunc = cloneFunction(func);
    if (getInternalSlot(func, "NeedsSuper") === true) {
        setInternalSlot(newFunc, "HomeObject", newHome);
        if (newName !== undefined) setInternalSlot(newFunc, "MethodName", newName);
        else setInternalSlot(newFunc, "MethodName", getInternalSlot(func, "MethodName"));
    }
    return newFunc;
}

function RebindSuper(func, newHome) {
    Assert(IsCallable(func) && func.HomeObject, "func got to be callable and have a homeobject");
    Assert(Type(newHome) === "object", "newhome has to be an object");
    var nu = OrdinaryFunction();
    setInternalSlot(nu, "FunctionKind", getInternalSlot(func, "FunctionKind"));
    setInternalSlot(nu, "Environment", getInternalSlot(func, "Environment"));
    setInternalSlot(nu, "Code", getInternalSlot(func, "Code"));
    setInternalSlot(nu, "FormalParameters", getInternalSlot(func, "FormalParameters"));
    setInternalSlot(nu, "Strict", getInternalSlot(func, "Strict"));
    setInternalSlot(nu, "ThisMode", getInternalSlot(func, "ThisMode"));
    setInternalSlot(nu, "MethodName", getInternalSlot(func, "MethodName"));
    setInternalSlot(nu, "Realm", getInternalSlot(func, "Realm"));
    setInternalSlot(nu, "HomeObject", newHome);
    return nu;
}


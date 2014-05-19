function MakeMethod (F, methodName, homeObject) {
    Assert(IsCallable(F), "MakeMethod: method is not a function");
    Assert(methodName === undefined || IsPropertyKey(methodName), "MakeMethod: methodName is neither undefined nor a valid property key");
    var homeObjectType = Type(homeObject);
    Assert(homeObjectType === UNDEFINED || homeObjectType === OBJECT, "MakeMethod: HomeObject is neither undefined nor object.");
    setInternalSlot(F, SLOTS.NEEDSSUPER, true);
    setInternalSlot(F, SLOTS.HOMEOBJECT, homeObject);
    setInternalSlot(F, SLOTS.METHODNAME, methodName);
    return NormalCompletion(undefined);
}
function MakeSuperReference(propertyKey, strict) {
    var env = GetThisEnvironment();
    if (!env.HasSuperBinding()) return newReferenceError(format("CAN_NOT_MAKE_SUPER_REF"));
    var actualThis = env.GetThisBinding();
    var baseValue = env.GetSuperBase();
    var bv = CheckObjectCoercible(baseValue);
    if (isAbrupt(bv = ifAbrupt(bv))) return bv;
    if (propertyKey === undefined) propertyKey = env.GetMethodName();
    return Reference(propertyKey, bv, strict, actualThis);
}
function GetSuperBinding(obj) {
    if (Type(obj) !== OBJECT) return undefined;
    if (getInternalSlot(obj, SLOTS.NEEDSSUPER) !== true) return undefined;
    if (!hasInternalSlot(obj, SLOTS.HOMEOBJECT)) return undefined;
    return getInternalSlot(obj, SLOTS.HOMEOBJECT);
}
function cloneFunction (func) {
    var newFunc = OrdinaryFunction();
    setInternalSlot(newFunc, SLOTS.ENVIRONMENT, getInternalSlot(func, SLOTS.ENVIRONMENT));
    setInternalSlot(newFunc, SLOTS.CODE, getInternalSlot(func, SLOTS.CODE));
    setInternalSlot(newFunc, SLOTS.FORMALPARAMETERS, getInternalSlot(func, SLOTS.FORMALPARAMETERS));
    setInternalSlot(newFunc, SLOTS.THISMODE, getInternalSlot(func, SLOTS.THISMODE));
    setInternalSlot(newFunc, SLOTS.FUNCTIONKIND, getInternalSlot(func, SLOTS.FUNCTIONKIND));
    setInternalSlot(newFunc, SLOTS.STRICT, getInternalSlot(func, SLOTS.STRICT));
    return newFunc;
}
function CloneMethod(func, newHome, newName) {
    Assert(IsCallable(func), "CloneMethod: function has to be callable");
    Assert(Type(newHome) === OBJECT, "CloneMethod: newHome has to be an object");
    Assert(Type(newName) === UNDEFINED || IsPropertyKey(newName), "CloneMethod: newName has to be undefined or object");
    var newFunc = cloneFunction(func);
    if (getInternalSlot(func, SLOTS.NEEDSSUPER) === true) {
        setInternalSlot(newFunc, SLOTS.HOMEOBJECT, newHome);
        if (newName !== undefined) setInternalSlot(newFunc, SLOTS.METHODNAME, newName);
        else setInternalSlot(newFunc, SLOTS.METHODNAME, getInternalSlot(func, SLOTS.METHODNAME));
    }
    if (getInternalSlot(newFunc, SLOTS.STRICT) === true) {
        var status = AddRestrictedFunctionProperties(newFunc);
        if (isAbrupt(status)) return status;
    }
    return newFunc;
}
function RebindSuper(func, newHome) {
    Assert(IsCallable(func) && func.HomeObject, "func got to be callable and have a homeobject");
    Assert(Type(newHome) === OBJECT, "newhome has to be an object");
    var nu = OrdinaryFunction();
    setInternalSlot(nu, SLOTS.FUNCTIONKIND, getInternalSlot(func, SLOTS.FUNCTIONKIND));
    setInternalSlot(nu, SLOTS.ENVIRONMENT, getInternalSlot(func, SLOTS.ENVIRONMENT));
    setInternalSlot(nu, SLOTS.CODE, getInternalSlot(func, SLOTS.CODE));
    setInternalSlot(nu, SLOTS.FORMALPARAMETERS, getInternalSlot(func, SLOTS.FORMALPARAMETERS));
    setInternalSlot(nu, SLOTS.STRICT, getInternalSlot(func, SLOTS.STRICT));
    setInternalSlot(nu, SLOTS.THISMODE, getInternalSlot(func, SLOTS.THISMODE));
    setInternalSlot(nu, SLOTS.METHODNAME, getInternalSlot(func, SLOTS.METHODNAME));
    setInternalSlot(nu, SLOTS.REALM, getInternalSlot(func, SLOTS.REALM));
    setInternalSlot(nu, SLOTS.HOMEOBJECT, newHome);
    return nu;
}
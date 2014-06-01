
function FunctionRecord() {
    /*
        move the typed memory into the ast-api range
        or don´t place the record here
     */
}


function FunctionEnvironment(F, T) {
    var fe = Object.create(FunctionEnvironment.prototype);
    fe.BoundFunction = F;
    fe.thisValue = T;
    fe.Bindings = Object.create(null);
    fe.outer = getInternalSlot(F,SLOTS.ENVIRONMENT);
    return fe;
}
FunctionEnvironment.prototype = assign(FunctionEnvironment.prototype, {
    HasThisBinding: function () {
        return true;
    },
    GetThisBinding: function () {
        return this.thisValue;
    },
    HasSuperBinding: function () {
        return !!this.BoundFunction.HomeObject;
    },
    GetSuperBase: function () {
        return this.BoundFunction.HomeObject;
    },
    GetMethodName: function () {
        return this.BoundFunction.MethodName;
    },
    WithBaseObject: function () {
        debug("FunctionEnv: WithBaseObject");
        return undefined;
    },
    toString: function () {
        return "[object FunctionEnvironment]";
    },
    constructor: FunctionEnvironment
});
addMissingProperties(FunctionEnvironment.prototype, DeclarativeEnvironment.prototype);
function NewFunctionEnvironment(F, T) {
    Assert(getInternalSlot(F, SLOTS.THISMODE) !== "lexical", "thisMode === 'lexical'?");
    var env = FunctionEnvironment(F, T);
    env.thisValue = T;
    if (getInternalSlot(F, SLOTS.NEEDSSUPER) === true) {
        var home = getInternalSlot(F, SLOTS.HOMEOBJECT);
        if (home === undefined) return newReferenceError(format("S_IS_UNDEFINED", "[[HomeObject]]"));
        env.HomeObject = home;
        env.MethodName = getInternalSlot(F, SLOTS.METHODNAME);
    } else {
        env.HomeObject = undefined;
    }
    env.outer = getInternalSlot(F, SLOTS.ENVIRONMENT);
    return env;
}
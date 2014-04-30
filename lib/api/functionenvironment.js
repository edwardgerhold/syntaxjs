/**
 * Created by root on 30.03.14.
 */

    // ===========================================================================================================
    // Function Environment
    // ===========================================================================================================

function FunctionEnvironment(F, T) {
    var fe = Object.create(FunctionEnvironment.prototype);
    fe.BoundFunction = F;
    fe.thisValue = T;
    fe.Bindings = Object.create(null);
    fe.outer = getInternalSlot(F,"Environment");
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
    Assert(getInternalSlot(F, "ThisMode") !== "lexical", "NewFunctionEnvironment: ThisMode is lexical");
    var env = FunctionEnvironment(F, T); // ist Lexical Environment and environment record in eins
    env.thisValue = T;
    if (getInternalSlot(F, "NeedsSuper") === true) {
        var home = getInternalSlot(F, SLOTS.HOMEOBJECT);
        if (home === undefined) return withError("Reference", "NewFunctionEnvironment: HomeObject is undefined");
        env.HomeObject = home;
        env.MethodName = getInternalSlot(F, SLOTS.METHODNAME);
    } else {
        env.HomeObject = undefined;
    }
    env.outer = getInternalSlot(F, "Environment"); // noch in [[Environment]] umbenennen
    return env;
}

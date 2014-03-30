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


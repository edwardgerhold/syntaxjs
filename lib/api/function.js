/**
 * Created by root on 30.03.14.
 */
// ===========================================================================================================
    // Ordinary Function
    // ===========================================================================================================

function OrdinaryFunction() {
    var F = Object.create(OrdinaryFunction.prototype);
    setInternalSlot(F, "Bindings", Object.create(null));
    setInternalSlot(F, "Symbols", Object.create(null));
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Realm", undefined);
    setInternalSlot(F, "Extensible", true);
    setInternalSlot(F, "Environment", undefined);
    setInternalSlot(F, "Code", undefined);
    setInternalSlot(F, "FormalParameters", undefined);
    return F;
}

OrdinaryFunction.prototype = {
    constructor: OrdinaryFunction,
    type: "object",
    toString: function () {
        return "[object OrdinaryFunction]";
    },
    Get: function (P, R) {
        var v = OrdinaryObjectGet(this, P, R);
        if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) return null;
        return v;
    },
    GetOwnProperty: function (P) {
        var d = GetOwnProperty(this, P);
        if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) d.value = null;
        return d;
    },
    Call: function () {
        // MODULE INTERDEPENDENCY -> call is from "runtime"
        return exports.Call.apply(this, arguments);
    },
    Construct: function (argList) {
        return OrdinaryConstruct(this, argList);
    }
};
addMissingProperties(OrdinaryFunction.prototype, OrdinaryObject.prototype);


// ===========================================================================================================
// BoundFunctionCreate
// ===========================================================================================================

function BoundFunctionCreate(B, T, argList) {
    var F = OrdinaryFunction();
    setInternalSlot(F, "BoundTargetFunction", B);
    setInternalSlot(F, "BoundThis", T);
    setInternalSlot(F, "BoundArguments", argList.slice());
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Extensible", true);
    setInternalSlot(F, "Call", function (thisArg, argList) {
        var B = getInternalSlot(F, "BoundTargetFunction");
        var T = getInternalSlot(F, "BoundThis");
        var A = getInternalSlot(F, "BoundArguments").concat(argList);
        return callInternalSlot("Call", B, T, A);
    });
    return F;
}



function IsCallable(O) {
    if (O instanceof CompletionRecord) return IsCallable(O.value);
    if (Type(O) === "object" && O.Call) return true;
    return false;
}

function IsConstructor(F) {
    if (F instanceof CompletionRecord) return IsConstructor(F.value);
    if (F && F.Construct) return true;
    return false;
}



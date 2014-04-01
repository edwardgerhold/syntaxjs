/**
 * Created by root on 30.03.14.
 */

function ExoticDOMObjectWrapper(object) {
    var O = Object.create(ExoticDOMObjectWrapper.prototype);

    setInternalSlot(O, "Target", object);
    setInternalSlot(O, "Symbols", Object.create(null));
    setInternalSlot(O, "Prototype", getIntrinsic("%ObjectPrototype%"));
    setInternalSlot(O, "Extensible", true);
    return O;
}
ExoticDOMObjectWrapper.prototype = {
    constructor: ExoticDOMObjectWrapper,
    type: "object",
    toString: function () {
        return "[object EddiesDOMObjectWrapper]";
    },
    Get: function (P) {
        var o = this.Target;
        var p = o[P];
        if (typeof p === "object" && p) {
            return ExoticDOMObjectWrapper(p);
        } else if (typeof p === "function") {
            return ExoticDOMFunctionWrapper(p, o);
        }
        return p;
    },
    Set: function (P, V, R) {
        var o = this.Target;
        return o[P] = V;
    },
    Invoke: function (P, argList, Rcv) {
        var f = this.Target;
        var o = this.Target;

        if ((f = this.Get(P)) && (typeof f === "function")) {
            var result = f.apply(o, argList);
            if (typeof result === "object" && result) {
                result = ExoticDOMObjectWrapper(result);
            } else if (typeof result === "function") {
                result = ExoticDOMFunctionWrapper(result, o);
            }
            return result;
        } else if (IsCallable(f)) {
            callInternalSlot("Call", f, o, argList);
        }
    },
    Delete: function (P) {
        var o = this.Target;
        return (delete o[P]);
    },
    DefineOwnProperty: function (P, D) {
        return Object.defineProperty(this.Target, P, D);
    },
    GetOwnProperty: function (P) {
        return Object.getOwnPropertyDescriptor(this.Target, P);
    },
    HasProperty: function (P) {
        return !!(P in this.Target);
    },
    HasOwnProperty: function (P) {
        var o = this.Target;
        return Object.hasOwnProperty.call(o, P);
    },
    GetPrototypeOf: function () {
        var o = this.Target;
        return Object.getPrototypeOf(o);
    },
    SetPrototypeOf: function (P) {
        var o = this.Target;
        return (o.__proto__ = P);
    },
    IsExtensible: function () {
        var o = this.Target;
        return Object.isExtensible(o);
    },
};

function ExoticDOMFunctionWrapper(func, that) {
    var F = Object.create(ExoticDOMFunctionWrapper.prototype);
    setInternalSlot(F, "NativeThat", that);
    setInternalSlot(F, "Symbols", Object.create(null));
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Extensible", true);
    return F;
}
ExoticDOMFunctionWrapper.prototype = assign(ExoticDOMFunctionWrapper.prototype, ExoticDOMObjectWrapper.prototype);

ExoticDOMFunctionWrapper.prototype = {
    constructor: ExoticDOMFunctionWrapper,
    toString: function () {
        return "[object EddiesDOMFunctionWrapper]";
    },
    Call: function (thisArg, argList) {
        var f = this.Target;
        var that = this.NativeThat;
        var result = f.apply(that, argList);
        if (typeof result === "object" && result) {
            result = ExoticDOMObjectWrapper(result);
        } else if (typeof result === "function") {
            result = ExoticDOMFunctionWrapper(result, that);
        }
        return result;
    }
};

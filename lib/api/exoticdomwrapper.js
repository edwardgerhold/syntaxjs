/**
 * Created by root on 30.03.14.
 */

function ExoticDOMObjectWrapper(object) {
    if (object instanceof ExoticDOMObjectWrapper || object instanceof ExoticDOMFunctionWrapper) return object;
    var O = Object.create(ExoticDOMObjectWrapper.prototype);
    setInternalSlot(O, "Wrapped", object);
    setInternalSlot(O, "Bindings", Object.create(null));        
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
        var o = this.Wrapped;
        var p = o[P];
        if (typeof p === "object" && p) {
            return ExoticDOMObjectWrapper(p);
        } else if (typeof p === "function") {
            return ExoticDOMFunctionWrapper(p, o);
        }
        return p;
    },
    Set: function (P, V, R) {
        var o = this.Wrapped;
        return o[P] = V;
    },
    Invoke: function (P, argList, Rcv) {
        var f;
        var o = this.Wrapped;
        Rcv = Rcv || this;

        if ((f = this.Get(P)) && (typeof f === "function")) {
            var result = f.apply(o, argList);

            if (typeof result === "object" && result) {
                result = ExoticDOMObjectWrapper(result);
            } else if (typeof result === "function") {
                result = ExoticDOMFunctionWrapper(result, o);
            }
            return result;
        } else if (IsCallable(f)) {
            return callInternalSlot("Call", f, Rcv, argList);
        }
    },
    Delete: function (P) {
        var o = this.Wrapped;
        return (delete o[P]);
    },
    DefineOwnProperty: function (P, D) {
        return Object.defineProperty(this.Wrapped, P, D);
    },
    GetOwnProperty: function (P) {
        return Object.getOwnPropertyDescriptor(this.Wrapped, P);
    },
    HasProperty: function (P) {
        return !!(P in this.Wrapped);
    },
    HasOwnProperty: function (P) {
        var o = this.Wrapped;
        return Object.hasOwnProperty.call(o, P);
    },
    GetPrototypeOf: function () {
        var o = this.Wrapped;
        return Object.getPrototypeOf(o);
    },
    SetPrototypeOf: function (P) {
        var o = this.Wrapped;
        return (o.__proto__ = P);
    },
    IsExtensible: function () {
        var o = this.Wrapped;
        return Object.isExtensible(o);
    },
};

function ExoticDOMFunctionWrapper(func, that) {
    var F = Object.create(ExoticDOMFunctionWrapper.prototype);
    setInternalSlot(F, "Wrapped", func);
    setInternalSlot(F, "NativeThis", that);
    setInternalSlot(F, "Bindings", Object.create(null));    
    setInternalSlot(F, "Symbols", Object.create(null));
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Extensible", true);
    return F;
}
ExoticDOMFunctionWrapper.prototype = {
    constructor: ExoticDOMFunctionWrapper,

    toString: function () {
        return "[object EddiesDOMFunctionWrapper]";
    },
    Call: function (thisArg, argList) {

        var f = this.Wrapped;
        var that = this.NativeThis;
        console.log("arglist");
        console.dir(argList);
        var result = f.apply(that, argList);
        
        
        if (typeof result === "object" && result) {
            result = ExoticDOMObjectWrapper(result);
        } else if (typeof result === "function") {
            result = ExoticDOMFunctionWrapper(result, that);
        }
        return NormalCompletion(result);
    }
};
addMissingProperties(ExoticDOMFunctionWrapper.prototype, ExoticDOMObjectWrapper.prototype);

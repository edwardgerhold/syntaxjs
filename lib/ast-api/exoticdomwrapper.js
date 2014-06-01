function NativeJSObjectWrapper(object) {
    if (object instanceof NativeJSObjectWrapper || object instanceof NativeJSFunctionWrapper) return object;
    var O = Object.create(NativeJSObjectWrapper.prototype);
    setInternalSlot(O, SLOTS.WRAPPEDOBJECT, object);
    setInternalSlot(O, SLOTS.BINDINGS, Object.create(null));
    setInternalSlot(O, SLOTS.SYMBOLS, Object.create(null));
    setInternalSlot(O, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.OBJECTPROTOTYPE));
    setInternalSlot(O, SLOTS.EXTENSIBLE, true);
    return O;
}
NativeJSObjectWrapper.prototype = {
    constructor: NativeJSObjectWrapper,
    type: "object",
    toString: function () {
        return "[object NativeJSObjectWrapper]";
    },
    Get: function (P) {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        var p = o[P];
        if (typeof p === "object" && p) {
            return NativeJSObjectWrapper(p);
        } else if (typeof p === "function") {
            return NativeJSFunctionWrapper(p, o);
        }
        return p;
    },
    Set: function (P, V, R) {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        return o[P] = V;
    },
    Invoke: function (P, argList, Rcv) {
        var f;
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        Rcv = Rcv || this;

        if ((f = this.Get(P)) && (typeof f === "function")) {
            var result = f.apply(o, argList);

            if (typeof result === "object" && result) {
                result = NativeJSObjectWrapper(result);
            } else if (typeof result === "function") {
                result = NativeJSFunctionWrapper(result, o);
            }
            return result;
        } else if (IsCallable(f)) {
            return callInternalSlot(SLOTS.CALL, f, Rcv, argList);
        }
    },
    Delete: function (P) {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        return (delete o[P]);
    },
    DefineOwnProperty: function (P, D) {
        return Object.defineProperty(getInternalSlot(this, SLOTS.WRAPPEDOBJECT), P, D);
    },
    GetOwnProperty: function (P) {
        return Object.getOwnPropertyDescriptor(getInternalSlot(this, SLOTS.WRAPPEDOBJECT), P);
    },
    HasProperty: function (P) {
        return !!(P in getInternalSlot(this, SLOTS.WRAPPEDOBJECT));
    },
    HasOwnProperty: function (P) {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        return Object.hasOwnProperty.call(o, P);
    },
    GetPrototypeOf: function () {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        return Object.getPrototypeOf(o);
    },
    SetPrototypeOf: function (P) {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        return (o.__proto__ = P);
    },
    IsExtensible: function () {
        var o = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        return Object.isExtensible(o);
    }
};
function NativeJSFunctionWrapper(func, that) {
    var F = Object.create(NativeJSFunctionWrapper.prototype);
    setInternalSlot(F, SLOTS.WRAPPEDOBJECT, func);
    setInternalSlot(F, SLOTS.NATIVETHIS, that);
    setInternalSlot(F, SLOTS.BINDINGS, Object.create(null));
    setInternalSlot(F, SLOTS.SYMBOLS, Object.create(null));
    setInternalSlot(F, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.FUNCTIONPROTOTYPE));
    setInternalSlot(F, SLOTS.EXTENSIBLE, true);
    return F;
}
NativeJSFunctionWrapper.prototype = {
    constructor: NativeJSFunctionWrapper,
    toString: function () {
        return "[object NativeJSFunctionWrapper]";
    },
    Call: function (thisArg, argList) {
        var f = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        var that = this.NativeThis;
        var result = f.apply(that, argList);
        if (typeof result === "object" && result) {
            result = NativeJSObjectWrapper(result);
        } else if (typeof result === "function") {
            result = NativeJSFunctionWrapper(result, that);
        }
        return NormalCompletion(result);
    },
    Construct: function (argList) {
        var f = getInternalSlot(this, SLOTS.WRAPPEDOBJECT);
        var that = this.NativeThis;
        var result = f.apply(that, argList);
        if (typeof result === "object" && result) {
            result = NativeJSObjectWrapper(result);
        } else if (typeof result === "function") {
            result = NativeJSFunctionWrapper(result, that);
        }
        return NormalCompletion(result);
    }
};
addMissingProperties(NativeJSFunctionWrapper.prototype, NativeJSObjectWrapper.prototype);
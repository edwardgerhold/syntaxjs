function ObjectEnvironment(O, E) {
    var oe = Object.create(ObjectEnvironment.prototype);
    oe.Unscopables = Object.create(null);
    oe.BoundObject = O;
    oe.outer = E;
    return oe;
}
ObjectEnvironment.prototype = {
    constructor: ObjectEnvironment,
    toString: function () {
        return "[object ObjectEnvironment]";
    },
    HasBinding: function (N) {
        var bindings = this.BoundObject;
        if (this.Unscopables[N]) return false;
        if (this.withEnvironment) {
            var unscopables = callInternalSlot(SLOTS.GET, bindings, $$unscopables, bindings);
            if (isAbrupt(unscopables = ifAbrupt(unscopables))) return unscopables;
            if (Type(unscopables) === OBJECT) {
                var found = HasOwnProperty(unscopables, N);
                if (isAbrupt(found = ifAbrupt(found))) return found;
                if (found === true) return false;
            }
        }
        return HasProperty(bindings, N);
    },
    CreateMutableBinding: function (N, D) {
        var O = this.BoundObject;
        var configValue = D === true;
        return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, N, {
            value: undefined,
            writable: true,
            enumerable: false,
            configurable: configValue
        });
    },
    CreateImmutableBinding: function (N) {
        var O = this.BoundObject;
        return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, N, {
            value: undefined,
            writable: false,
            enumerable: false,
            configurable: false
        });
    },
    GetBindingValue: function (N) {
        var O = this.BoundObject;
        Assert(Type(O) === OBJECT, "ObjectEnvironment: BoundObject has to be of Type Object");
        return O.Get(N, O);
    },

    InitializeBinding: function (N, V) {
        var O = this.BoundObject;
        return O.Set(N, V, O);
    },
    SetMutableBinding: function (N, V) {
        var O = this.BoundObject;
        return O.Set(N, V, O);
    },
    DeleteBinding: function (N) {
        var O = this.BoundObject;
        return O.Delete(N);
    },

    HasThisBinding: function () {
        return true;
    },

    HasSuperBinding: function () {
        return !!this.HomeObject;
    },
    GetSuperBase: function () {
        return this.HomeObject;
    },

    WithBaseObject: function () {
        var O = this.BoundObject;
        return O;
    },
    GetThisBinding: function () {
        var O = this.BoundObject;
        return O;
    }
};
function NewObjectEnvironment(O, E) {
    return ObjectEnvironment(O, E);
}
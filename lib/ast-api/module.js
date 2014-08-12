function NewModuleEnvironment(global) {
    return DeclarativeEnvironment(global);
}
function ModuleExoticObject(environment, exports) {
    var m = Object.create(ModuleExoticObject.prototype);
    setInternalSlot(m, "ModuleEnvironment", environment);
    setInternalSlot(m, "Exports", exports);
    return m;
}
ModuleExoticObject.prototype = {
    constructor: "ModuleExoticObject",
    toString: function () {
        return "[ModuleExoticObject]";
    },
    Get: function (P, R) {
        var O = this;
        Assert(IsPropertyKey(P), "[[Delete]] expecting P to be a valid property key");
        var exports = getInternalSlot(O, "Exports");
        if (exports.indexOf(P) > -1) return undefined;
        var env = getInternalSlot(O, "ModuleEnvironment");
        return env.GetBindingValue(P, true);
    },
    Set: function () {
        return false;
    },
    Delete: function (P) {
        Assert(IsPropertyKey(P), "[[Delete]] expecting P to be a valid property key");
        var exports = getInternalSlot(O, "Exports");
        return exports.indexOf(P) <= -1;

    },
    Enumerate: function () {
        var O = this;
        var exports = getInternalSlot(O, "Exports");
        return CreateListIterator(exports);
    },
    OwnPropertyKeys: function () {
        var O = this;
        var exports = getInternalSlot(O, "Exports");
        return CreateArrayFromList(exports);
    },
    HasProperty: function (P) {
        var O = this;
        var exports = getInternalSlot(O, "Exports");
        return exports.indexOf(P) > -1;

    },
    GetOwnProperty: function () {
        return newTypeError("The [[GetOwnProperty]] of ModuleExoticObjects is supposed to throw a TypeError.")
    },
    DefineOwnProperty: function () {
        return false;
    },
    GetPrototypeOf: function () {
        return null;
    },
    SetPrototypeOf: function (O) {
        Assert(Type(O) === OBJECT || Type(O) === NULL, "Module.SetPrototypeOf: Expecting object or null before returning false anyways");
        return false;
    },
    IsExtensible: function () {
        return false;
    }
};
addMissingProperties(ModuleExoticObject.prototype, OrdinaryObject.prototype);
function ModuleObjectCreate(environment, exports) {
    Assert(environment.Bindings, "environment has to be a declarative record");
    Assert(Array.isArray(exports), "exports has to be a list of string values");
    // in a typed mem there will the pointers to the methods be set coz there is no
    // prototype. we can point to native hashes, too, by just knowing the meaning of
    // the pointer.
    var m = ModuleExoticObject(environment, exports);
    return m;
}
exports.ModuleObjectCreate = ModuleObjectCreate;
exports.ModuleExoticObject = ModuleExoticObject;
exports.NewModuleEnvironment = NewModuleEnvironment;
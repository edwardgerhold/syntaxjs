/**
 * Created by root on 30.03.14.
 */


    // ===========================================================================================================
    // Declarative Environment
    // ===========================================================================================================

function DeclarativeEnvironment(outer) {
    var de = Object.create(DeclarativeEnvironment.prototype);
    de.Bindings = Object.create(null);
    de.outer = outer || null;
    return de;
}
DeclarativeEnvironment.prototype = {
    constructor: DeclarativeEnvironment,
    toString: function () {
        return "[object DeclarativeEnvironment]";
    },
    HasBinding: function HasBinding(N) {
        debug("hasbinding of decl called with " + N);
        return (N in this.Bindings);
    },
    CreateMutableBinding: function CreateMutableBinding(N, D) {
        var envRec = this.Bindings;
        debug("declenv create mutablebinding: " + N);
        var configValue = D === true || D === undefined ? true : false;
        if (N in envRec) return withError("Reference", N + " is bereits deklariert");
        else createIdentifierBinding(envRec, N, undefined, configValue);
        return NormalCompletion();
    },
    CreateImmutableBinding: function CreateImmutableBinding(N) {
        debug("declenv create immutablebinding: " + N);
        var envRec = this.Bindings;
        var configValue = false;
        if (N in envRec) return withError("Reference", N + " is bereits deklariert");
        else createIdentifierBinding(envRec, N, undefined, configValue, false);
        return NormalCompletion();
    },
    InitialiseBinding: function (N, V) {
        debug("declenv initialise: " + N);
        var b, outerEnv;
        if (this.HasBinding(N)) {
            b = this.Bindings[N];
            if (!b.initialised) {
                b.value = V;
                b.initialised = true;
                return true;
            }
            return false;
        } else if (outerEnv = this.outer) return outerEnv.InitialiseBinding(N, V);
        return false;
    },
    SetMutableBinding: function (N, V, S) {
        var b, o;
        if (this.HasBinding(N)) {
            b = this.Bindings[N];
            if (b.writable || !b.initialised) {
                b.value = V;
                if (!b.initialised) b.initialised = true;
            }
            //          else if (!b.writable) return withError("Reference", "Trying to set immutable binding.");
            //          else if (!b.initialised) return withError("Reference", "Trying to set uninitialised binding.");
            return NormalCompletion(b.value);
        } else if (o = this.outer) return o.SetMutableBinding(N, V, S);
    },
    GetBindingValue: function (N, S) {
        var b;
        if (this.HasBinding(N)) {
            b = this.Bindings[N];
            if (!b.initialised) return NormalCompletion(undefined);
            return NormalCompletion(b.value);
        } else if (this.outer) return this.outer.GetBindingValue(N, S);
        return withError("Reference", "GetBindingValue: Can not find " + N);
    },
    DeleteBinding: function DeleteBinding(N) {
        if (this.HasBinding[N]) {
            this.Bindings[N] = undefined;
            delete this.Bindings[N];
        } else if (this.outer) return this.outer.DeleteBinding(N);
    },
    GetIdentifierReference: function (name, strict) {
        return GetIdentifierReference(this, name, strict);
    },
    HasThisBinding: function () {
        return false;
    },
    HasSuperBinding: function () {
        return false;
    },
    WithBaseObject: function () {
        return undefined;
    }
};

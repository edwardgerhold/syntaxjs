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
        return (N in this.Bindings);
    },
    CreateMutableBinding: function CreateMutableBinding(N, D) {
        var envRec = this.Bindings;
        var configValue = !!(D === true || D === undefined);
        if (N in envRec) return newReferenceError("CreateMutableBinding: "+ N + " is already declared");
        else createIdentifierBinding(envRec, N, undefined, configValue);
        return NormalCompletion();
    },
    CreateImmutableBinding: function CreateImmutableBinding(N) {
        var envRec = this.Bindings;
        var configValue = false;
        if (N in envRec) return newReferenceError( "CreateMutableBinding: " +N + " is already declared");
        else createIdentifierBinding(envRec, N, undefined, configValue, false);
        return NormalCompletion();
    },
    InitializeBinding: function (N, V) {
        var b, outerEnv;
        if (this.HasBinding(N)) {
            b = this.Bindings[N];
            if (!b.initialized) {
                b.value = V;
                b.initialized = true;
                return true;
            }
            return false;
        } else if (outerEnv = this.outer) return outerEnv.InitializeBinding(N, V);
        return false;
    },
    SetMutableBinding: function (N, V, S) {
        var b, o;
        if (this.HasBinding(N)) {
            b = this.Bindings[N];
            if (b.writable || !b.initialized) {
                b.value = V;
                if (!b.initialized) b.initialized = true;
            }
            return NormalCompletion(b.value);
        } else if (o = this.outer) return o.SetMutableBinding(N, V, S);
    },
    GetBindingValue: function (N, S) {
        var b;
        if (this.HasBinding(N)) {
            b = this.Bindings[N];
            if (!b.initialized) return NormalCompletion(undefined);
            //return newReferenceError( "unitialized binding '" + N+ "'");
            return NormalCompletion(b.value);
        } else if (this.outer) return this.outer.GetBindingValue(N, S);
        return newReferenceError( "GetBindingValue: Can not find " + N);
    },
    DeleteBinding: function (N) {
        if (this.HasBinding[N]) {
            this.Bindings[N] = undefined;
            delete this.Bindings[N];
        } else if (this.outer) return this.outer.DeleteBinding(N);
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

function NewDeclarativeEnvironment(E) {
    return DeclarativeEnvironment(E);
}

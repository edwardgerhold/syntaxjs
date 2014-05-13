
function GlobalEnvironment(globalThis, intrinsics) {
    var ge = Object.create(GlobalEnvironment.prototype);
    ge.outer = null;
    ge.objEnv = NewObjectEnvironment(globalThis, ge.outer);
    ge.objEnv.toString = function () {
        return "[object GlobalVariableEnvironment]";
    };
    ge.LexEnv = DeclarativeEnvironment(ge.objEnv);
    ge.LexEnv.toString = function () {
        return "[object GlobalLexicalEnvironment]";
    };
    var varNames = ge.VarNames = Object.create(null);
    for (var k in globalThis.Bindings) {
        if (HasOwnProperty(globalThis, k)) varNames[k] = true;
    }
    return ge;
}
GlobalEnvironment.prototype = {
    constructor: GlobalEnvironment,
    toString: function () {
        return "[object GlobalEnvironment]";
    },
    HasBinding: function (N) {
        if (this.LexEnv.HasBinding(N)) return true;
        return this.objEnv.HasBinding(N);
    },
    CreateMutableBinding: function (N, D) {
        return this.LexEnv.CreateMutableBinding(N, D);
    },
    CreateImmutableBinding: function (N) {
        return this.LexEnv.CreateImmutableBinding(N);
    },
    GetBindingValue: function (N, S) {
        if (this.LexEnv.HasBinding(N)) return this.LexEnv.GetBindingValue(N, S);
        else if (this.objEnv.HasBinding(N)) return this.objEnv.GetBindingValue(N, S);
    },
    InitializeBinding: function (N, V, S) {
        if (this.LexEnv.HasBinding(N)) return this.LexEnv.InitializeBinding(N, V, S);
        else if (this.objEnv.HasBinding(N)) return this.objEnv.InitializeBinding(N, V, S);
        return false;
    },
    SetMutableBinding: function (N, V, S) {
        if (this.LexEnv.HasBinding(N)) return this.LexEnv.SetMutableBinding(N, V, S);
        else if (this.objEnv.HasBinding(N)) return this.objEnv.SetMutableBinding(N, V, S);
        return false;
    },
    DeleteBinding: function (N) {
        if (this.LexEnv.HasBinding(N)) {
            return this.LexEnv.DeleteBinding(N);
        } else if (this.objEnv.HasBinding(N)) {
            var status = this.objEnv.DeleteBinding(N);
            if (status === true) {
                this.VarNames[N] = undefined;
            }
            return status;
        }
        return false;
    },
    HasThisBinding: function () {
        return true;
    },
    HasSuperBinding: function () {
        return false;
    },
    WithBaseObject: function () {
        return this.objEnv;
    },
    GetThisBinding: function () {
        return this.objEnv.GetThisBinding();
    },
    HasVarDeclaration: function (N) {
        return this.VarNames[N];

    },
    HasLexicalDeclaration: function (N) {
        return this.LexEnv.HasBinding(N);

    },
    CanDeclareGlobalVar: function (N) {
        if (this.objEnv.HasBinding(N)) return true;
        return this.objEnv.BoundObject.IsExtensible();
    },
    CanDeclareGlobalFunction: function (N) {
        var objRec = this.objEnv;
        var globalObject = objRec.BoundObject;
        var extensible = globalObject.IsExtensible();
        if (isAbrupt(extensible = ifAbrupt(extensible))) return extensible;
        if (objRec.HasBinding(N) === false) return extensible;
        var existingProp = globalObject.GetOwnProperty(N);
        if (!existingProp) return extensible;
        if (IsDataDescriptor(existingProp) && existingProp.writable && existingProp.enumerable) return true;
        return false;
    },
    CreateGlobalVarBinding: function (N, D) {
        var cpl = this.objEnv.CreateMutableBinding(N, D);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        cpl = this.objEnv.InitializeBinding(N, undefined);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        this.VarNames[N] = true;
    },
    CreateGlobalFunctionBinding: function (N, V, D) {
        var cpl = this.objEnv.CreateMutableBinding(N, D);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        cpl = this.objEnv.InitializeBinding(N, V);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        this.VarNames[N] = true;
    }
};

function NewGlobalEnvironment(global) {
    return GlobalEnvironment(global);
}

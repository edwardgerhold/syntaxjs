/**
 * Created by root on 30.03.14.
 */

    // ===========================================================================================================
    // Global Environment
    // ====================================console.log("sfds")=======================================================================

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
        if (this.objEnv.HasBinding(N)) return true;
        return false;
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
    InitialiseBinding: function (N, V, S) {
        if (this.LexEnv.HasBinding(N)) return this.LexEnv.InitialiseBinding(N, V, S);
        else if (this.objEnv.HasBinding(N)) return this.objEnv.InitialiseBinding(N, V, S);
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
        if (this.VarNames[N]) return true;
        return false;
    },
    HasLexicalDeclaration: function (N) {
        if (this.LexEnv.HasBinding(N)) return true;
        return false;
    },
    CanDeclareGlobalVar: function (N) {
        debug("candeclarevar");
        if (this.objEnv.HasBinding(N)) return true;
        return this.objEnv.BoundObject.IsExtensible();
    },
    CanDeclareGlobalFunction: function (N) {
        debug("candeclarefunc");
        var objRec = this.objEnv;
        var globalObject = objRec.BoundObject;
        var extensible = globalObject.IsExtensible();
        if (isAbrupt(extensible = ifAbrupt(extensible))) return extensible;
        if (objRec.HasBinding(N) === false) return extensible;
        var existingProp = globalObject.GetOwnProperty(N);
        if (!existingProp) return extensible;
        if (IsDataDescriptor(existingProp) && existingProp.writable && existingProp.enumerable) return true;
        debug("returning false");
        return false;
    },
    CreateGlobalVarBinding: function (N, D) {
        debug("createglobalvar");
        var cpl = this.objEnv.CreateMutableBinding(N, D);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        cpl = this.objEnv.InitialiseBinding(N, undefined);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        this.VarNames[N] = true;
    },
    CreateGlobalFunctionBinding: function (N, V, D) {
        debug("createglobalfunction");
        var cpl = this.objEnv.CreateMutableBinding(N, D);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        cpl = this.objEnv.InitialiseBinding(N, V);
        if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
        this.VarNames[N] = true;
    }
};

function NewGlobalEnvironment(global) {
    return GlobalEnvironment(global);
}

/**
 * Created by root on 31.03.14.
 */

function IdentifierBinding(N, V, D, W) {
    var ib = Object.create(null);
    ib.name = N;
    ib.value = V;
    ib.writable = W === undefined ? true : W;
    ib.initialized = false;
    ib.configurable = !!D;
    return ib;
}

function createIdentifierBinding(envRec, N, V, D, W) {
    return (envRec[N] = IdentifierBinding(N, V, D, W));
}

function GetIdentifierReference(lex, name, strict) {
    if (lex === null) {
        // unresolvable ref.
        return Reference(name, undefined, strict);
    }
    var exists = lex.HasBinding(name);
    var outer;
    if (exists) {
        return Reference(name, lex, strict);
    } else {
        outer = lex.outer;
        return GetIdentifierReference(outer, name, strict);
    }

}


function GetThisEnvironment () {
    var env = getLexEnv();
    do {
        if (env.HasThisBinding()) return env;
    } while (env = env.outer);
}

function ThisResolution () {
    var env = GetThisEnvironment();
    return env.GetThisBinding();
}

function GetGlobalObject () {
    var realm = getRealm();
    return realm.globalThis;
}
function createIdentifierBinding(envRec, N, V, D, W) {
    return envRec[N] = {
        __proto__: null,
        name: N,
        value: V,
        writable: W === undefined ? true : W,
        configurable: !!D
    };
}
function GetIdentifierReference(lex, name, strict) {
    if (lex === null) return Reference(name, undefined, strict);
    var exists = lex.HasBinding(name);
    var outer;
    if (exists) return Reference(name, lex, strict);
    else {
        outer = lex.outer;
        return GetIdentifierReference(outer, name, strict);
    }
}
function GetThisEnvironment() {
    var env = getLexEnv();
    do {
        if (env.HasThisBinding()) return env;
    } while (env = env.outer);
}
function ThisResolution() {
    var env = GetThisEnvironment();
    return env.GetThisBinding();
}

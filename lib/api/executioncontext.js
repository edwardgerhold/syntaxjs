function ExecutionContext(outer, realm, state, generator) {
    "use strict";
    var VarEnv = NewDeclarativeEnvironment(outer);
    return {
        __proto__: ExecutionContext.prototype,
        state: [], // depr.
        stack: [],
        realm: realm,
        outer: outer||null,
        VarEnv: VarEnv,
        LexEnv: VarEnv,
        generator: generator
    };
}
ExecutionContext.prototype.toString = ExecutionContext_toString;
ExecutionContext.prototype.constructor = ExecutionContext;
function ExecutionContext_toString() {
    return "[object ExecutionContext]";
}

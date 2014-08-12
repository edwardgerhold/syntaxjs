function ExecutionContext(outerCtx, realm, state, generator) {
    "use strict";
    var VarEnv = NewDeclarativeEnvironment((outerCtx && outerCtx.LexEnv) || null);
    return {
        __proto__: ExecutionContext.prototype,
        stack: [],
        operands: [],
        pc: -1,
        sp: -1,
        realm: realm,
        outer: outerCtx || null,
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
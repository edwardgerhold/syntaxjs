function ExecutionContext(outerCtx, realm, state, generator) {
    "use strict";
    var VarEnv = NewDeclarativeEnvironment((outerCtx && outerCtx.VarEnv)||null);
    return {
        __proto__: ExecutionContext.prototype,
        state: [], // depr.
        stack: [],
        pc: 0,
        operandStack: [],
        sp: -1,
        realm: realm,
        outer: outerCtx||null,
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

function ExecutionContext(outer, realm, state, generator) {
    "use strict";
    var ec = Object.create(ExecutionContext.prototype);
    ec.state = [];
    ec.realm = realm;
    outer = outer || null;
    ec.VarEnv = NewDeclarativeEnvironment(outer);
    ec.LexEnv = ec.VarEnv;
    ec.generator = generator;
    return ec;
}
ExecutionContext.prototype.toString = ExecutionContext_toString;
ExecutionContext.prototype.constructor = ExecutionContext;
function ExecutionContext_toString() {
    return "[object ExecutionContext]";
}

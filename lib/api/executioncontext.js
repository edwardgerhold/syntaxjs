/**
 * Created by root on 30.03.14.
 */

function ExecutionContext(outer, realm, state, generator) {
    "use strict";
    var ec = Object.create(ExecutionContext.prototype);
    ec.state = [];
    ec.realm = realm;
    outer = outer || null;
    ec.VarEnv = NewDeclarativeEnvironment(outer);
    ec.LexEnv = ec.VarEnv;
    ec.generator = generator;
    if (realm) realm.cx = ec;
    return ec;
}

ExecutionContext.prototype.toString = ExecutionContext_toString;
ExecutionContext.prototype.constructor = ExecutionContext;
function ExecutionContext_toString() {
    return "[object ExecutionContext]";
}


// ===========================================================================================================
// eval("let x = 10"); Function calls the parser and exports.Evaluate
// ===========================================================================================================

setInternalSlot(EvalFunction, SLOTS.CALL, function (thisArg, argList) {

    var input, strict, direct, strictCaller, evalRealm, directCallToEval,
        ctx, value, result, script, evalCxt, LexEnv, VarEnv, strictVarEnv,
        strictScript;

    var Evaluate = require("runtime").Evaluate;

    input = GetValue(argList[0]);
    if (isAbrupt(input=ifAbrupt(input))) return input;

    if (Type(input) !== STRING) return input;
    try {
        script = parse(input);
    } catch (ex) {
        return newSyntaxError( ex.message);
    }

    if (script.type !== "Program") return undefined;

    if (script.strict) {
        strict = true;
    }

    if (directCallToEval) direct = true;
    strictCaller = !!direct;
    ctx = getContext();
    if (strict) ctx.strict = true;
    evalRealm = ctx.realm;

    if (direct) {

        // 1. if the code that made the call is function code
        // and ValidInFunction is false throw SyntaxError
        // 2. If the code is module code and
        // ValidInModule ist false throw SyntaxError
    }
    if (direct) {
        LexEnv = ctx.LexEnv;
        VarEnv = ctx.VarEnv;
    } else {
        LexEnv = evalRealm.globalEnv;
        VarEnv = evalRealm.globalEnv;
    }
    if (strictScript || (direct && strictCaller)) {
        strictVarEnv = NewDeclarativeEnvironment(LexEnv);
        LexEnv = strictVarEnv;
        VarEnv = strictVarEnv;
    }

    evalCxt = ExecutionContext(getContext());
    evalCxt.realm = evalRealm;
    evalCxt.VarEnv = VarEnv;
    evalCxt.LexEnv = LexEnv;
    getStack().push(evalCxt);
    result = Evaluate(script);
    getStack().pop();
    return result;
});

setInternalSlot(EvalFunction, SLOTS.CONSTRUCT, null);

function BetterComplicatedResumableEvaluationAlgorithmForASTVisitorsWithoutStack(generator, body) {
    /*
     Here is Space to handle all relevant nodes
     to reenter, where to restore pointer, what
     to pop of the code eval stack getContext().state
     */

    return exports.Evaluate(body);
}
function printCodeEvaluationState() {
}
function Steps_GeneratorStart(generator, body) {
    var result = BetterComplicatedResumableEvaluationAlgorithmForASTVisitorsWithoutStack(generator, body);

    if (isAbrupt(result = ifAbrupt(result))) return result;
    if (isAbrupt(result = ifAbrupt(result)) && result.type === "return") {
        setInternalSlot(generator, SLOTS.GENERATORSTATE, "completed");
        if (isAbrupt(result = ifAbrupt(result))) return result;
        getContext().resumeGenerator = undefined;
        return CreateItrResultObject(result, true);
    }
    return NormalCompletion(result);
}
function GeneratorStart(generator, body) {
    if (hasConsole) console.log("##GeneratorStart()##");
    Assert(getInternalSlot(generator, SLOTS.GENERATORSTATE) === undefined, "GeneratorStart: GeneratorState has to be undefined");
    var cx = getContext();
    cx.generator = generator;
    cx.resumeGenerator = function () {
        return Steps_GeneratorStart(generator, body);
    };
    setInternalSlot(generator, SLOTS.GENERATORCONTEXT, cx);
    setInternalSlot(generator, SLOTS.GENERATORSTATE, "suspendedStart");
    return generator;
}
function GeneratorResume(generator, value) {
    if (Type(generator) !== OBJECT) return newTypeError("resume: Generator is not an object");
    if (!hasInternalSlot(generator, SLOTS.GENERATORSTATE)) return newTypeError("resume: Generator has no GeneratorState property");
    var state = getInternalSlot(generator, SLOTS.GENERATORSTATE);
    if (state !== "suspendedStart" && state !== "suspendedYield") return newTypeError("Generator is neither in suspendedStart nor suspendedYield state");
    var genContext = getInternalSlot(generator, SLOTS.GENERATORCONTEXT);
    var methodContext = getContext();
    getStack().push(genContext);
    setInternalSlot(generator, SLOTS.GENERATORSTATE, "executing");
    var resumeGenerator = genContext.resumeGenerator;
    var result = resumeGenerator(NormalCompletion(value));
    setInternalSlot(generator, SLOTS.GENERATORSTATE, "suspendedYield");
    var x = getContext();
    if (x !== methodContext) {
        return newTypeError("GeneratorContext mismatch at GeneratorResume")
    }
    return result;
}
function GeneratorYield(itrNextObj) {
    Assert(HasOwnProperty(itrNextObj, "value") && HasOwnProperty(itrNextObj, "done"), "expecting itrNextObj to have value and done properties");
    var genContext = getContext();
    var generator = genContext.generator;
    setInternalSlot(generator, SLOTS.GENERATORSTATE, "suspendedYield");
    var x = getStack().pop();
    if (x !== genContext) {
        return newTypeError("GeneratorContext mismatch at GeneratorYield")
    }
    // compl = yield smth;
    genContext.resumeGenerator = function (compl) {
        return compl;
    };
    return NormalCompletion(itrNextObj);
}
var GeneratorPrototype_$$iterator = function (thisArg, argList) {
    return thisArg;
};
var GeneratorPrototype_next = function (thisArg, argList) {
    var value = argList[0];
    var G = thisArg;
    return GeneratorResume(G, value);
};
var GeneratorPrototype_throw = function (thisArg, argList) {
    var g = thisArg;
    var exception = argList[0];
    if (Type(g) !== OBJECT) return newTypeError("throw: Generator is not an object");
    if (!hasInternalSlot(g, SLOTS.GENERATORSTATE)) return newTypeError("throw: generator has no GeneratorState property");
    var state = getInternalSlot(g, SLOTS.GENERATORSTATE);
    Assert(hasInternalSlot(g, SLOTS.GENERATORCONTEXT), "generator has to have a GeneratorContext property");
    if (state !== "suspendedStart" && state != "suspendedYield") return newTypeError("GeneratorState is neither suspendedStart nor -Yield");
    var E = CompletionRecord("throw", exception);
    if (state === "suspendedStart") {
        setInternalSlot(g, SLOTS.GENERATORSTATE, "completed");
        setInternalSlot(g, SLOTS.GENERATORCONTEXT, undefined);
        return E;
    }
    var genContext = getInternalSlot(g, SLOTS.GENERATORCONTEXT);
    var methodContext = getCurrentExectionContext();
    setInternalSlot(g, SLOTS.GENERATORSTATE, "executing");
    getStack().push(genContext);
    var result = genContext.generatorCallback(E);
    Assert(genContext !== getContext());
    Assert(methodContext === getContext());
    return result;
};
var GeneratorPrototype_$$create = function (thisArg, argList) {
    var F = thisArg;
    var obj = OrdinaryCreateFromConstructor(F, INTRINSICS.GENERATOR, [
        SLOTS.GENERATORSTATE, SLOTS.GENERATORCONTEXT
    ]);
    return obj;
};
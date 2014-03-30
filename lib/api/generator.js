
function printCodeEvaluationState() {

    var state = getContext().state;
    var node;
    for (var i = state.length-1; i >= 0; i--) {
        var node = state[i].node;
        var index = state[i].instructionIndex;
        console.log(i + ". ("+index+") " + node.type);
    }

}

function generatorCallbackWrong(generator, body) {

    printCodeEvaluationState();
    var result = exports.ResumeEvaluate(body);

    if (isAbrupt(result = ifAbrupt(result))) return result;

    // if (IteratorComplete(result)) {
    if (isAbrupt(result = ifAbrupt(result)) && result.type === "return") {
        //Assert(isAbrupt(result) && result.type === "return", "expecting abrupt return completion");
        setInternalSlot(generator, "GeneratorState", "completed");
        if (isAbrupt(result = ifAbrupt(result))) return result;
        getContext().generatorCallback = undefined;
        return CreateItrResultObject(result, true);
    }

    //}

    //
    //return result;
}

function GeneratorStart(generator, body) {

    Assert(getInternalSlot(generator, "GeneratorState") === undefined, "GeneratorStart: GeneratorState has to be undefined");

    var cx = getContext();
    cx.generator = generator;
    cx.generatorCallback = function () {
        // this has to be transferred into a kind of machine.
        // a little piece, how to obtain the right node from the stack has to be cleared
        return generatorCallbackWrong(generator, body);
    };

    setInternalSlot(generator, "GeneratorContext", cx);
    setInternalSlot(generator, "GeneratorState", "suspendedStart");
    return generator;
}

function GeneratorResume(generator, value) {

    if (Type(generator) !== "object") return withError("Type", "resume: Generator is not an object");
    if (!hasInternalSlot(generator, "GeneratorState")) return withError("Type", "resume: Generator has no GeneratorState property");
    var state = getInternalSlot(generator, "GeneratorState");
    if (state !== "suspendedStart" && state !== "suspendedYield") return withError("Type", "Generator is neither in suspendedStart nor suspendedYield state");
    var genContext = getInternalSlot(generator, "GeneratorContext");

    var methodContext = getContext();
    getStack().push(genContext);

    setInternalSlot(generator, "GeneratorState", "executing");
    var generatorCallback = genContext.generatorCallback;

    var result = generatorCallback(NormalCompletion(value));
    setInternalSlot(generator, "GeneratorState", "suspendedYield");


    var x = getContext();
    if (x !== methodContext) {
        console.log("GENERATOR ACHTUNG 2: CONTEXT MISMATCH TEST NICHT BESTANDEN - resume");
    }
    return result;
}

function GeneratorYield(itrNextObj) {
    Assert(HasOwnProperty(itrNextObj, "value") && HasOwnProperty(itrNextObj, "done"), "expecting itrNextObj to have value and done properties");

    var genContext = getContext();
    var generator = genContext.generator;

    setInternalSlot(generator, "GeneratorState", "suspendedYield");

    var x = getStack().pop();
    if (x !== genContext) {
        console.log("GENERATOR ACHTUNG 1: CONTEXT MISMATCH TEST NICHT BESTANDEN - yield");
    };

    // compl = yield smth;
    genContext.generatorCallback = function (compl) {
        return compl;
    };
    return NormalCompletion(itrNextObj);
}
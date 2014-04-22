
function printCodeEvaluationState() {

    var stack = getContext().state;
    var state = state[state.length-1];
    var node = state[0];
    var instructionIndex = state[1];
    var parent = state[2];
    var str = "["+(node&&node.type)+" === "+instructionIndex+"] of ["+(parent&&parent.type)+"]";
    if (hasConsole) console.log(str);
}

function Steps_GeneratorStart(generator, body) {
    printCodeEvaluationState();
    var result = exports.Evaluate(body);
    if (isAbrupt(result = ifAbrupt(result))) return result;
    if (isAbrupt(result = ifAbrupt(result)) && result.type === "return") {
        if (hasConsole) console.log("##resumeGeneratorWrong() Condition##");
        setInternalSlot(generator, "GeneratorState", "completed");
        if (isAbrupt(result = ifAbrupt(result))) return result;
        getContext().resumeGenerator = undefined;
        return CreateItrResultObject(result, true);
    }
    return NormalCompletion(result);
}

function GeneratorStart(generator, body) {
    if (hasConsole) console.log("##GeneratorStart()##");
    Assert(getInternalSlot(generator, "GeneratorState") === undefined, "GeneratorStart: GeneratorState has to be undefined");
    var cx = getContext();
    cx.generator = generator;
    cx.resumeGenerator = function () {
        return Steps_GeneratorStart(generator, body);
    };
    setInternalSlot(generator, "GeneratorContext", cx);
    setInternalSlot(generator, "GeneratorState", "suspendedStart");
    return generator;
}

function GeneratorResume(generator, value) {
    if (hasConsole) console.log("##GeneratorResume()##");

    if (Type(generator) !== OBJECT) return withError("Type", "resume: Generator is not an object");
    if (!hasInternalSlot(generator, "GeneratorState")) return withError("Type", "resume: Generator has no GeneratorState property");
    var state = getInternalSlot(generator, "GeneratorState");
    if (state !== "suspendedStart" && state !== "suspendedYield") return withError("Type", "Generator is neither in suspendedStart nor suspendedYield state");
    var genContext = getInternalSlot(generator, "GeneratorContext");

    var methodContext = getContext();
    getStack().push(genContext);
    setInternalSlot(generator, "GeneratorState", "executing");
    var resumeGenerator = genContext.resumeGenerator;
   
    var result = resumeGenerator(NormalCompletion(value));
    setInternalSlot(generator, "GeneratorState", "suspendedYield");    
    var x = getContext();
    if (x !== methodContext) {
        if (hasConsole) console.log("GENERATOR ACHTUNG 2: CONTEXT MISMATCH TEST NICHT BESTANDEN - resume");
    }
    return result;
}

function GeneratorYield(itrNextObj) {
    if (hasConsole) console.log("##GeneratorYield()##");
    Assert(HasOwnProperty(itrNextObj, "value") && HasOwnProperty(itrNextObj, "done"), "expecting itrNextObj to have value and done properties");

    var genContext = getContext();
    var generator = genContext.generator;
    setInternalSlot(generator, "GeneratorState", "suspendedYield");

    var x = getStack().pop();
    if (x !== genContext) {
        if (hasConsole) console.log("GENERATOR ACHTUNG 1: CONTEXT MISMATCH TEST NICHT BESTANDEN - yield");
    }
    // compl = yield smth;
    genContext.resumeGenerator = function (compl) {        
        return compl;
    };

    return NormalCompletion(itrNextObj);
}
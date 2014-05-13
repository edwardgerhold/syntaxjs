/*

    // completion re-use



var completion = newCompletionRecord();

function newCompletionRecord(type, value, target) {
    "use strict";
    return {
        __proto__:CompletionRecord.prototype,
        type: type,
        value: value,
        target: target
    };
}

function cloneCompletion(completion) {
    // pending exceptions would get lost, so we got to clone the completion
    return newCompletionRecord(completion.type, completion.value, completion.target);
}

function CompletionRecord(type, value, target) {
    "use strict";
    completion.type = type;
    completion.value = value;
    completion.target = target;
    return completion;
}

*/

function CompletionRecord(type, value, target) {
    "use strict";
    return {
        __proto__:CompletionRecord.prototype,
        type: type,
        value: value,
        target: target
    };
}


CompletionRecord.prototype.toString = CompletionRecord_toString;
CompletionRecord.prototype.constructor = CompletionRecord;

function CompletionRecord_toString() {
    return "[object CompletionRecord]";
}

function NormalCompletion(argument, label) {
    var completion;
    if (argument instanceof CompletionRecord) {
        completion = argument;
    } else {
        completion = CompletionRecord();
        completion.value = argument;
        completion.type = "normal";
        completion.target = label;
    }
    return completion;
}

function Completion(type, argument, target) {
    var completion;
    if (argument instanceof CompletionRecord) {
        completion = argument;
    } else {
        // if (type == "normal")
        completion = CompletionRecord();
        // else completion = newCompletionRecord();
        completion.value = argument;
    }
    completion.type = type || "normal";
    completion.target = target;
    return completion;
}

function unwrap(arg) {
    if (arg instanceof CompletionRecord) return arg.value;
    return arg;
}

function ifAbrupt(argument) {
    if (!(argument instanceof CompletionRecord) || argument.type !== "normal") return argument;
    return argument.value;
}

function isAbrupt(completion) {
    return (completion instanceof CompletionRecord && completion.type !== "normal");
}

function newReferenceError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic(INTRINSICS.REFERENCEERROR), [message]));
}

function newRangeError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic(INTRINSICS.RANGEERROR), [message]));
}

function newSyntaxError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic(INTRINSICS.SYNTAXERROR), [message]));
}

function newTypeError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic(INTRINSICS.TYPEERROR), [message]));
}

function newURIError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic(INTRINSICS.URIERROR), [message]));
}

function newEvalError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic(INTRINSICS.EVALERROR), [message]));
}



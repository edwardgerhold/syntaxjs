/**
 * Created by root on 30.03.14.
 */

    // ===========================================================================================================
    // Completion Record
    // ===========================================================================================================

function CompletionRecord(type, value, target) {
    "use strict";
    return {
        __proto__:CompletionRecord.prototype,
        type: undefined,
        value: undefined,
        target: undefined
    }
    return cr;
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
//    realm.completion = completion; // i removed saving them and just using one. why is that here again?
    return completion;
}

function Completion(type, argument, target) {
    var completion;
    if (argument instanceof CompletionRecord) {
        completion = argument;
    } else {
        completion = CompletionRecord();
        completion.value = argument;
    }
    completion.type = type || "normal";
    completion.target = target;
//    realm.completion = completion;
    return completion;
}

// ===========================================================================================================
// ReturnIfAbrupt(argument) ==> if (isAbrupt(value = ifAbrupt(value)))return value;
// ===========================================================================================================

function unwrap(arg) {
    if (arg instanceof CompletionRecord) return arg.value;
    return arg;
}

// unwrap the argument, if it not abrupt
function ifAbrupt(argument) {
    if (!(argument instanceof CompletionRecord) || argument.type !== "normal") return argument;
    return argument.value;
}
//if (argument && (typeof argument === "object") && (argument.toString() === "[object CompletionRecord]") && argument.type === "normal") return argument.value;
//if (typeof argument !== "object" || !argument) return argument;
//if (argument.toString() === "[object CompletionRecord]" && argument.type !== "normal") return argument;
//return argument.value;

// return finally true, if abrupt
function isAbrupt(completion) {
    return (completion instanceof CompletionRecord && completion.type !== "normal");
}
// return (completion && typeof completion === "object" && (""+completion === "[object CompletionRecord]") && completion.type !== "normal");
//if (completion && typeof completion === "object" && completion.toString() === "[object CompletionRecord]" && completion.type !== "normal") return true;
//if (completion instanceof CompletionRecord && completion.type !== "normal") return true;


function newReferenceError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%ReferenceError%"), [message]));
}

function newRangeError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%RangeError%"), [message]));
}

function newSyntaxError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%SyntaxError%"), [message]));
}

function newTypeError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%TypeError%"), [message]));
}

function newURIError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%URIError%"), [message]));
}

function newEvalError(message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%EvalError%"), [message]));
}

function withError(type, message) {
    return Completion("throw", OrdinaryConstruct(getIntrinsic("%" + type + "Error%"), [message]), "");
}


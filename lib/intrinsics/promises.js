
/*
    move to SLOTS.*
 */
var PROMISE_CONST = Object.create(null);
PROMISE_CONST.PROMISESTATE = "PromiseState";
PROMISE_CONST.PROMISEREJECTREACTIONS = "PromiseRejectReactions";
PROMISE_CONST.PROMISERESOLVEREACTIONS = "PromiseResolveReactions";
PROMISE_CONST.INDEX = "Index";
PROMISE_CONST.VALUES = "Values";
PROMISE_CONST.CAPABILITIES = "Capability";
PROMISE_CONST.REMAININGELEMENTS = "RemainingElements";
PROMISE_CONST.FULFILLMENTHANDLER = "FulfillmentHandler";
PROMISE_CONST.REJECTIONHANDLER = "RejectionHandler";
PROMISE_CONST.FULFILLED = "fulfilled";
PROMISE_CONST.REJECTED = "rejected";

var PromiseConstructor_call = function (thisArg, argList) {
    var executor = argList[0];
    var promise = thisArg;
    if (Type(promise) !== OBJECT) return withError("Type", "promise is not an object");
    if (!IsCallable(executor)) return withError("Type", "executor argument is not a callable");
    if (!hasInternalSlot(promise, "PromiseState")) return withError("Type", "promise has no PromiseState Property");
    if (getInternalSlot(promise, "PromiseState") !== undefined) return withError("Type", "promise´s PromiseState is not undefined");
    return InitializePromise(promise, executor);
};
var PromiseConstructor_Construct = function (argList) {
    return Construct(this, argList);
};
var PromiseConstructor_$$create = function (thisArg, argList) {
    return AllocatePromise(thisArg);
};
var PromiseConstructor_resolve = function (thisArg, argList) {
    var x = argList[0];
    var C = thisArg;
    if (IsPromise(x)) {
        var constructor = getInternalSlot(x, "PromiseConstructor");
        if (SameValue(x, C)) return x;
    }
    var promiseCapability = NewPromiseCapability(C);
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
    var resolveResult = callInternalSlot(SLOTS.CALL, promiseCapability.Resolve, undefined, [x]);
    if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
    return NormalCompletion(promiseCapability.Promise);
};
var PromiseConstructor_reject = function (thisArg, argList) {
    var r = argList[0];
    var C = thisArg;
    var promiseCapability = NewPromiseCapability(C);
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
    var rejectResult = callInternalSlot(SLOTS.CALL, promiseCapability.Reject, undefined, [r]);
    if (isAbrupt(rejectResult = ifAbrupt(rejectResult))) return rejectResult;
    return NormalCompletion(promiseCapability.Promise)
};
var PromiseConstructor_cast = function (thisArg, argList) {
    var x = argList[0];
    var C = thisArg;
    if (IsPromise(x)) {
        var constructor = getInternalSlot(x, "PromiseConstructor");
        if (SameValue(constructor, C)) return NormalCompletion(x);
    }
    var promiseCapability = NewPromiseCapability(C);
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
    var resolveResult = callInternalSlot(SLOTS.CALL, promiseCapability.Resolve, undefined, [x]);
    if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
    return NormalCompletion(promiseCapability.Promise);
};
var PromiseConstructor_race = function (thisArg, argList) {
    var iterable = argList[0];
    var C = thisArg;
    var promiseCapability = NewPromiseCapability(C);
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
    var iterator = GetIterator(iterable);
    iterator = IfAbruptRejectPromise(iterator, promiseCapability);
    if (isAbrupt(iterator)) return iterator;
    for (;;) {
        var next = IteratorStep(iterator);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        if ((next = IfAbruptRejectPromise(next, promiseCapability)) &&isAbrupt(next)) return next;
        if (next === false) return NormalCompletion(promiseCapability.Promise);
        var nextValue = IteratorValue(next);
        if ((nextValue=IfAbruptRejectPromise(nextValue, promiseCapability)) && isAbrupt(nextValue)) return nextValue;
        var nextPromise = Invoke(C, "cast", [nextValue]);
        if ((nextPromise=IfAbruptRejectPromise(nextPromise, promiseCapability)) && isAbrupt(nextPromise)) return nextPromise;
        var result = Invoke(nextPromise, "then", [promiseCapability.Resolve, promiseCapability.Reject]);
        if ((result = IfAbruptRejectPromise(result, promiseCapability)) && isAbrupt(result)) return result;
    }

};
function makePromiseAllResolveElementsFunction () {
    var PromiseAllResolveElements_call = function (thisArg, argList) {
        var x = argList[0];
        var index = getInternalSlot(F, "Index");
        var values = getInternalSlot(F, "Values");
        var promiseCapability = getInternalSlot(F, "Capability");
        var remainingElementsCount = getInternalSlot(F, "RemainingElements");
        var result = CreateDataProperty(values, ToString(index), x);
        if ((result = IfAbruptRejectPromise(result, promiseCapability)) && isAbrupt(result)) return result;
        remainingElementsCount.value -= 1;
        if (remainingElementsCount.value === 0) {
            return callInternalSlot(SLOTS.CALL, promiseCapability.Resolve, undefined, [values]);
        }
        return NormalCompletion(undefined);
    };
    //var F = CreateBuiltinFunction(getRealm(), "Promise.all Resolve Elements", 1, PromiseAllResolveElements_call);
    var F = OrdinaryFunction();
    setInternalSlot(F, SLOTS.CALL, PromiseAllResolveElements_call);
    return F;
}
var PromiseConstructor_all = function (thisArg, argList) {
    var iterable = argList[0];
    var C = thisArg;
    var promiseCapability = NewPromiseCapability(C);
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
    var iterator = GetIterator(iterable);
    if ((iterator=IfAbruptRejectPromise(iterator, promiseCapability)) && isAbrupt(iterator)) return iterator;
    var values = ArrayCreate(0);
    var remainingElementsCount = { value: 0 };
    var index = 0;
    for (;;) {
        var next = IteratorStep(iterator);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        if ((next=IfAbruptRejectPromise(next, promiseCapability)) && isAbrupt(next)) return next;
        if (next === false) {
            if (index == 0) {
                var resolveResult = callInternalSlot(SLOTS.CALL, promiseCapability.Resolve, undefined, [values]);
                if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
            }
            return NormalCompletion(promiseCapability.Promise)
        }
        var nextValue = IteratorValue(next);
        if (isAbrupt(nextValue = IfAbruptRejectPromise(nextValue, promiseCapability)))  return nextValue;
        var nextPromise = Invoke(C, "cast", [nextValue]);
        if (isAbrupt(nextPromise=IfAbruptRejectPromise(nextPromise, promiseCapability))) return nextPromise;
        var resolveElement = makePromiseAllResolveElementsFunction();
        setInternalSlot(resolveElement, "Index", index);
        setInternalSlot(resolveElement, "Values", values);
        setInternalSlot(resolveElement, "Capability", resolveElement, promiseCapability);
        setInternalSlot(resolveElement, "RemainingElements", remainingElementsCount);
        var result = Invoke(nextPromise, "then", [resolveElement, promiseCapability.Reject]);
        if (isAbrupt(result = IfAbruptRejectPromise(result, promiseCapability))) return result;
        index = index + 1;
        remainingElementsCount.value += 1;
    }
};
var PromisePrototype_then = function (thisArg, argList) {
    var onFulfilled = argList[0];
    var onRejected = argList[1];
    var promise = thisArg;
    if (!IsPromise(promise)) return withError("Type", "then: this is not a promise object");
    if (onFulfilled === undefined || onFulfilled === null) onFulfilled = makeIdentityFunction();
    if (onRejected === undefined || onRejected === null) onRejected = makeThrowerFunction();
    var C = Get(promise, "constructor");
    if (isAbrupt(C = ifAbrupt(C))) return C;

    var promiseCapability = NewPromiseCapability(C);
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;

    var resolveReaction = PromiseReaction(promiseCapability, onFulfilled);
    var rejectReaction = PromiseReaction(promiseCapability, onRejected);

    var PromiseState = getInternalSlot(promise, "PromiseState");
    if (PromiseState === "pending") {
        getInternalSlot(promise, "PromiseResolveReactions").push(resolveReaction);
        getInternalSlot(promise, "PromiseRejectReactions").push(rejectReaction);

    } else if (PromiseState === "fulfilled") {
        var resolution = getInternalSlot(promise, "PromiseResult");
        EnqueueTask("PromiseTasks", PromiseReactionTask(), [resolveReaction, resolution]);
    } else if (PromiseState === "rejected") {
        var reason = getInternalSlot(promise, "PromiseResult");
        EnqueueTask("PromiseTasks", PromiseReactionTask(), [rejectReaction, reason]);
    }
    return NormalCompletion(promiseCapability.Promise);
};
var PromisePrototype_catch = function (thisArg, argList) {
    var onRejected = argList[0];
    return Invoke(thisArg, "then", [undefined, onRejected]);
};
//SetFunctionName(PromiseConstructor, "Promise");
MakeConstructor(PromiseConstructor, true, PromisePrototype);
setInternalSlot(PromiseConstructor, SLOTS.CALL, PromiseConstructor_call);
setInternalSlot(PromiseConstructor, SLOTS.CONSTRUCT, PromiseConstructor_Construct);
LazyDefineProperty(PromiseConstructor, $$create, CreateBuiltinFunction(realm, PromiseConstructor_$$create, 0, "[Symbol.create]"));
LazyDefineBuiltinFunction(PromiseConstructor, "resolve", 1, PromiseConstructor_resolve);
LazyDefineBuiltinFunction(PromiseConstructor, "reject", 1, PromiseConstructor_reject);
LazyDefineBuiltinFunction(PromiseConstructor, "cast", 1, PromiseConstructor_cast);
LazyDefineBuiltinFunction(PromiseConstructor, "race", 1, PromiseConstructor_race);
LazyDefineProperty(PromiseConstructor, "all", CreateBuiltinFunction(realm, PromiseConstructor_all, 0, "all"));
LazyDefineProperty(PromisePrototype, "then", CreateBuiltinFunction(realm, PromisePrototype_then, 2, "then"));
LazyDefineProperty(PromisePrototype, "catch", CreateBuiltinFunction(realm, PromisePrototype_catch, 1, "catch"));
LazyDefineProperty(PromisePrototype, "constructor", PromiseConstructor);
LazyDefineProperty(PromisePrototype, $$toStringTag, "Promise");


/*
    move into lib/api/promise.js
 */

function PromiseNew (executor) {
    var promise = AllocatePromise(getIntrinsic("%Promise%"));
    return InitializePromise(promise, executor);
}
function PromiseBuiltinCapability() {
    var promise = AllocatePromise(getIntrinsic("%Promise%"));
    return CreatePromiseCapabilityRecord(promise, getIntrinsic("%Promise%"));
}
function PromiseOf(value) {
    var capability = NewPromiseCapability();
    if (isAbrupt(capability = ifAbrupt(capability))) return capability;
    var resolveResult = callInternalSlot(SLOTS.CALL, capability.Resolve, undefined, [value]);
    if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
    return NormalCompletion(capability.Promise);
}
function PromiseCapability(promise, resolve, reject) {
    var pc = Object.create(PromiseCapability.prototype);
    pc.Promise = promise;
    pc.Resolve = resolve;
    pc.Reject = reject;
    return pc;
}
PromiseCapability.prototype.toString = function () {
    return "[object PromiseCapability]";
};
function makePromiseReaction(capabilites, handler) {
    return PromiseReaction(capabilites, handler);
}
function PromiseReaction(caps, hdl) {
    var pr = Object.create(PromiseReaction.prototype);
    pr.Capability = caps;
    pr.Handler = hdl;
    return pr;
}
PromiseReaction.prototype.toString = function () {
    return "[object PromiseReaction]";
};
function UpdatePromiseFromPotentialThenable(x, promiseCapability) {
    if (Type(x) !== OBJECT) return NormalCompletion("not a thenable");
    var then = Get(x, "then");
    if (isAbrupt(then = ifAbrupt(then))) {
        var rejectResult = callInternalSlot(SLOTS.CALL, promiseCapability.Reject, undefined, [then.value]);
        if (isAbrupt(rejectResult = ifAbrupt(rejectResult))) return rejectResult;
        return NormalCompletion(null);
    }
    if (!IsCallable(then)) return NormalCompletion("not a thenable");
    var thenCallResult = callInternalSlot(SLOTS.CALL, then, x, [promiseCapability.Resolve, promiseCapability.Reject]);
    if (isAbrupt(thenCallResult = ifAbrupt(thenCallResult))) {
        rejectResult = callInternalSlot(SLOTS.CALL, promiseCapability.Reject, undefined, [thenCallResult.value]);
        if (isAbrupt(rejectResult = ifAbrupt(rejectResult))) return rejectResult;
    }
    return NormalCompletion(null);
}
function TriggerPromiseReactions(reactions, argument) {
    if (Array.isArray(reactions)) {
        for (var i = 0, j = reactions.length; i < j; i++) {
            var reaction = reactions[i];
            EnqueueTask("PromiseTasks", PromiseReactionTask(), [reaction, argument])
        }
	}
    return NormalCompletion(undefined);
}
function PromiseReactionTask() {
    var F;
    var PromiseReactionTask_call = function (thisArg, argList) {
        var reaction = argList[0];
        var argument = argList[1];
        Assert(reaction && reaction.Capability && reaction.Handler, "reaction must be a PromiseReaction record");
        var promiseCapability = reaction.Capability;
        var handler = reaction.Handler;
        var PromiseTaskQueue = getTasks(getRealm(), "Promise");
        var handlerResult = callInternalSlot(SLOTS.CALL, handler, undefined, [argument]);
        if (isAbrupt(handlerResult = ifAbrupt(handlerResult))) {
            var status = callInternalSlot(SLOTS.CALL, promiseCapability.Reject, undefined, [handlerResult.value]);
            return NextTask(status, PromiseTaskQueue);
        }
        status = callInternalSlot(SLOTS.CALL, promiseCapability.Resolve, undefined, [handlerResult]);
        return NextTask(status, PromiseTaskQueue);
    };
    F = CreateBuiltinFunction(getRealm(), PromiseReactionTask_call, "PromiseReactionTask", 2);
    return F;
}
function IfAbruptRejectPromise(value, capability) {
    if (isAbrupt(value=ifAbrupt(value))) {
        var rejectedResult = callInternalSlot(SLOTS.CALL, capability.Reject, undefined, [value.value]);
        if (isAbrupt(rejectedResult = ifAbrupt(rejectedResult))) return rejectedResult;
        return NormalCompletion(capability.Promise);
    }
    return value;
}
function makePromiseRejectFunction() {
    var F = OrdinaryFunction();
    SetFunctionName(F, "reject");
    SetFunctionLength(F, 1);
    var PromiseRejectFunction_call = function (thisArg, argList) {
        Assert(Type(getInternalSlot(F, "Promise")) === OBJECT, "[[Promise]] has to be an object");
        var reason = argList[0];
        var promise = getInternalSlot(F, "Promise");
        var alreadyResolved = getInternalSlot(F, "AlreadyResolved");
        if (alreadyResolved.value === true) return NormalCompletion(undefined);
        alreadyResolved.value = true;
        return RejectPromise(promise, reason);
    };
    setInternalSlot(F, SLOTS.CALL, PromiseRejectFunction_call);
    return F;
}
function makePromiseResolveFunction() {
    var F = OrdinaryFunction();
    SetFunctionName(F, "resolve");
    SetFunctionLength(F, 1);

    var PromiseResolveFunction_call = function (thisArg, argList) {
        Assert(Type(getInternalSlot(F, "Promise")) === OBJECT, "[[Promise]] has to be an object");
        var resolution = argList[0];
        var promise = getInternalSlot(F, "Promise");
        var alreadyResolved = getInternalSlot(F, "AlreadyResolved");
        alreadyResolved.value = true;
        if (SameValue(resolution, promise)) {
            var selfResolutionError = withError("Type", "self resolution handler");
            return RejectPromise(promise, selfResolutionError);
        }
        if (Type(resolution) !== OBJECT) {
            return FulfillPromise(promise, resolution);
        }
        var then = Get(resolution, "then");
        if (isAbrupt(then=ifAbrupt(then))) {
            return RejectPromise(promise, then.value);
        }
        if (!IsCallable(then)) {
            return FulfillPromise(promise, resolution);
        }
        var resolvingFunctions = CreateResolvingFunctions(promise);
        var thenCallResult = callInternalSlot(SLOTS.CALL, then, resolution, [resolvingFunctions.Resolve, resolvingFunctions.Reject]);

        if (isAbrupt(thenCallResult=ifAbrupt(thenCallResult))) {
            return callInternalSlot(SLOTS.CALL, resolvingFunctions.Reject, undefined, [thenCallResult.value]);
        }

        return NormalCompletion(thenCallResult);

    };
    setInternalSlot(F, SLOTS.CALL, PromiseResolveFunction_call);
    return F;
}
function CreateResolvingFunctions (promise) {
    var alreadyResolved = {value:false};
    var resolve = makePromiseResolveFunction();
    setInternalSlot(resolve, "Promise", promise);
    setInternalSlot(resolve, "AlreadyResolved", alreadyResolved);
    var reject = makePromiseRejectFunction();
    setInternalSlot(reject, "Promise", promise);
    setInternalSlot(reject, "AlreadyResolved", alreadyResolved);
    return { Resolve: resolve, Reject: reject };
}
function FulfillPromise (promise, value) {
    Assert(getInternalSlot(promise, "PromiseState") === "pending", "[[PromiseState]] must be pending");
    var reactions = getInternalSlot(promise, "PromiseFulfillReactions");
    setInternalSlot(promise, "PromiseResult", value);
    setInternalSlot(promise, "PromiseFulfillReactions", []);
    setInternalSlot(promise, "PromiseRejectReactions", []);
    setInternalSlot(promise, "PromiseState", "fulfilled");
    return TriggerPromiseReactions(reactions, value);
}
function RejectPromise (promise, reason) {
    Assert(getInternalSlot(promise, "PromiseState") === "pending", "[[PromiseState]] must not be pending");
    var reactions = getInternalSlot(promise, "PromiseRejectReactions");
    setInternalSlot(promise, "PromiseResult", reason);
    setInternalSlot(promise, "PromiseFulfillReactions", []);
    setInternalSlot(promise, "PromiseRejectReactions", []);
    setInternalSlot(promise, "PromiseState", "rejected");
    return TriggerPromiseReactions(reactions, reason);
}
function NewPromiseCapability(C) {
    if (!IsConstructor(C)) return withError("Type", "C is no constructor");
    // Assertion Step 2 missing 25.4.3.1
    var promise = CreateFromConstructor(C);
    if (isAbrupt(promise = ifAbrupt(promise))) return promise;
    return CreatePromiseCapabilityRecord(promise, C);
}
function CreatePromiseCapabilityRecord(promise, constructor) {
    var promiseCapability = PromiseCapability(promise, undefined, undefined);
    var executor = GetCapabilitiesExecutor();
    setInternalSlot(executor, "Capability", promiseCapability);
    var constructorResult = callInternalSlot(SLOTS.CALL, constructor, promise, [executor]);
    if (isAbrupt(constructorResult = ifAbrupt(constructorResult))) return constructorResult;
    if (!IsCallable(promiseCapability.Resolve)) return withError("Type", "capability.[[Resolve]] is not a function");
    if (!IsCallable(promiseCapability.Reject)) return withError("Type", "capability.[[Reject]] is not a function");
    if (Type(constructorResult) === OBJECT && (SameValue(promise, constructorResult) === false)) return withError("Type","constructorResult is not the same as promise");
    return promiseCapability;
}
function GetCapabilitiesExecutor () {
    var F = OrdinaryFunction();
    var GetCapabilitiesExecutor_call = function (thisArg, argList) {
        var resolve = argList[0];
        var reject = argList[1];
        var promiseCapability = getInternalSlot(F, "Capability");
        Assert(promiseCapability !== undefined, "executor has to have a capability slot");
        if (promiseCapability.Resolve !== undefined) return withError("Type", "promiseCapability has to have some undefined fields");
        if (promiseCapability.Reject !== undefined) return withError("Type", "promiseCapability has to have some undefined fields");
        promiseCapability.Resolve = resolve;
        promiseCapability.Reject = reject;
        return NormalCompletion(undefined);
    };
    setInternalSlot(F, SLOTS.CALL, GetCapabilitiesExecutor_call);
    return F;
}
function InitializePromise(promise, executor) {
    Assert(hasInternalSlot(promise, "PromiseState") && (getInternalSlot(promise, "PromiseState") === undefined), "InitializePromise: PromiseState doesnt exist or isnt undefined");
    Assert(IsCallable(executor), "executor has to be callable");
    setInternalSlot(promise, "PromiseState", "pending");
    setInternalSlot(promise, "PromiseResolveReactions", []);
    setInternalSlot(promise, "PromiseRejectReactions", []);
    var resolvingFunctions = CreateResolvingFunctions(promise);
    var completion = callInternalSlot(SLOTS.CALL, executor, undefined, [resolvingFunctions.Resolve, resolvingFunctions.Reject]);
    if (isAbrupt(completion=ifAbrupt(completion))) {
        var status = callInternalSlot(SLOTS.CALL, resolvingFunctions.Reject, undefined, [completion.value]);
        if (isAbrupt(status)) return status;
    }
    return NormalCompletion(promise);
}
function AllocatePromise(constructor) {
    var obj = OrdinaryCreateFromConstructor(constructor, "%PromisePrototype%", {
        "PromiseState": undefined,
        "PromiseConstructor": constructor,
        "PromiseResult": undefined,
        "PromiseResolveReactions": undefined,
        "PromiseRejectReactions" : undefined,
        toString: function () {
            return "[object PromiseExoticObject]";
        }
    });
    return obj;
}
function IsPromise(x) {
    if (Type(x) !== OBJECT) return false;
    if (!hasInternalSlot(x, "PromiseState")) return false;
    return getInternalSlot(x, "PromiseState") !== undefined;
}
function makeIdentityFunction () {
    var F = OrdinaryFunction();
    var Identity_call = function (thisArg, argList) {
        var x = argList[0];
        return NormalCompletion(x);
    };
    setInternalSlot(F, SLOTS.CALL, Identity_call);
    SetFunctionName(F, "IdentityFunction");
    SetFunctionLength(F, 1);
    return F;
}
function makeResolutionHandlerFunction () {
    var handler = OrdinaryFunction();
    var handler_call = function (thisArg, argList) {
        var x = argList[0];
        var promise = getInternalSlot(handler, "Promise");
        var fulfillmentHandler = getInternalSlot(handler, "FulfillmentHandler");
        var rejectionHandler = getInternalSlot(handler, "RejectionHandler");
        if (SameValue(x, promise)) {
            var selfResolutionError = withError("Type", "selfResolutionError");
            return callInternalSlot(SLOTS.CALL, rejectionHandler, undefined, [selfResolutionError]);
        }
        var C = getInternalSlot(promise, "PromiseConstructor");
        var promiseCapability = NewPromiseCapability(C);
        if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
        var updateResult = UpdatePromiseFromPotentialThenable(x, promiseCapability);
        if (isAbrupt(updateResult = ifAbrupt(updateResult))) return updateResult;
        if (updateResult !== "not a thenable") {
            return Invoke(promiseCapability.Promise, "then", [fulfillmentHandler, rejectionHandler]);
        }
        return callInternalSlot(SLOTS.CALL, fulfillmentHandler, undefined, [x]);
    };
    setInternalSlot(handler, SLOTS.CALL, handler_call);
    return handler;
}
function makeThrowerFunction () {
    var F = OrdinaryFunction();
    var ThrowerFunction_call = function (thisArg, argList) {
        var e = argList[0];
        return Completion("throw", e, empty);
    };
    setInternalSlot(F, SLOTS.CALL, ThrowerFunction_call);
    SetFunctionName(F, "ThrowerFunction");
    SetFunctionLength(F, 1);
    return F;
}
function PromiseAll(promiseList) {
}
function PromiseCatch(promise, rejectedAction) {
}
function PromiseThen(promise, resolvedAction, rejectedAction) {
}
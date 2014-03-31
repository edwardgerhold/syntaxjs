// ===========================================================================================================
// set Timeout
// ===========================================================================================================

setInternalSlot(SetTimeoutFunction, "Call", function (thisArg, argList) {
    var func = argList[0];
    var timeout = argList[1] || 0;
    var task;
    if (!IsCallable(func)) return withError("Type", "setTimeout: function argument expected");
    task = {
        time: Date.now(),
        timeout: timeout,
        func: func
    };
    eventQueue.push(task);
    return task;
});

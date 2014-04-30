// ===========================================================================================================
// set Timeout
// ===========================================================================================================

setInternalSlot(SetTimeoutFunction, SLOTS.CALL, function (thisArg, argList) {
    var func = argList[0];
    var timeout = argList[1] || 0;
    var task;
    if (!IsCallable(func)) return withError("Type", "setTimeout: function argument expected");
    task = {
        time: Date.now(),
        timeout: timeout,
        func: func
    };
    getEventQueue().push(task);
    return task;
});


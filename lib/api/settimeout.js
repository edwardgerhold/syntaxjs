/**
 * Created by root on 16.05.14.
 */
var SetTimeoutFunction_call = function (thisArg, argList) {
    var func = argList[0];
    var timeout = argList[1] | 0;
    var task;
    if (!IsCallable(func)) return newTypeError( "setTimeout: function argument expected");
    task = {
        time: Date.now(),
        timeout: timeout,
        func: func
    };
    getEventQueue().push(task);
    return task;
};
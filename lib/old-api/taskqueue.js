function evalTasks() {
    var PromiseTasks = getTasks(getRealm(), "PromiseTasks")
    var taskResults = NextTask(undefined, PromiseTasks);
    var TimerTasks = getTasks(getRealm(), "TimerTasks")
    var taskResults = NextTask(undefined, TimerTasks);
    var LoadingTasks = getTasks(getRealm(), "LoadingTasks")
    var taskResults = NextTask(undefined, LoadingTasks);
    /*
        managing multiple queues like this looks like errors,

        will be changed soon
     */
}

function PendingTaskRecord_toString () {
    return "[object PendingTaskRecord]";
}
function PendingTaskRecord (task, args, realm, hostDefined) {
    var pendingTaskRecord = Object.create(PendingTaskRecord.prototype);
    pendingTaskRecord.Task = task;
    pendingTaskRecord.Arguments = args;
    pendingTaskRecord.Realm = realm;
    pendingTaskRecord.HostDefined = hostDefined;
    return pendingTaskRecord;
}
PendingTaskRecord.prototype = Object.create(null);
PendingTaskRecord.prototype.constructor = PendingTaskRecord;
PendingTaskRecord.prototype.toString = PendingTaskRecord_toString;
function TaskQueue() {
    return [];
}
function makeTaskQueues(realm) {
    realm.LoadingTasks = TaskQueue();
    realm.PromiseTasks = TaskQueue();
    realm.ScriptTasks = TaskQueue();
    realm.TimerTasks = TaskQueue();
}
function getTasks(realm, name) {
    if (realm) return realm[name];
}
var queueNames = {
    __proto__:null,
    "LoadingTasks": true,
    "PromiseTasks": true,
    "ScriptTasks": true,
    "TimerTasks": true
};
function EnqueueTask(queueName, task, args, hostDefined) {
    Assert(Type(queueName) === STRING && queueNames[queueName], "EnqueueTask: queueName has to be valid");
    Assert(Array.isArray(args), "arguments have to be a list and to be equal in the number of arguments of task");
    var callerRealm = getRealm();
    var pending = PendingTaskRecord(task, args, callerRealm, hostDefined);
    switch(queueName) {
        case "PromiseTasks": callerRealm.PromiseTasks.push(pending);
            break;
        case "LoadingTasks": callerRealm.LoadingTasks.push(pending);
            break;
        case "ScriptTasks": callerRealm.ScriptTasks.push(pending);
            break;
        case "TimerTasks": callerRealm.TimerTasks.push(pending);
            break;
    }
    return NormalCompletion(empty);
}
/**
 * TO DO: Change nextTask to main loop of the runtime.
 *
 *
 * NextTask shall become the main event loop
 *
 * instead of a "function" calling next Task recursivly
 *
 * an "iteration" popping the next Task off the queue(s).
 *
 * Then ScriptTasks make sense
 *
 * And of course nothing else was said than that. It´s the main event loop.
 *
 * I wrote this down as this recursive function, but-
 * that´s the loop controlling the event stacks
 * and stopping if all queues are empty.
 *
 * @param result
 * @param nextQueue
 * @returns {*}
 * @constructor
 */

function NextTask (result, nextQueue) {
    if (!nextQueue || !nextQueue.length) return;
    if (isAbrupt(result = ifAbrupt(result))) {
        // performing implementation defined unhandled exception processing
        console.log("NextTask: Got exception - which will remain unhandled - for debugging, i print them out." );
        printException(result);
    }
//  Assert(getStack().length === 0, "NextTask: The execution context stack has to be empty");
    var nextPending = nextQueue.shift();
    if (!nextPending) return;
    var newContext = ExecutionContext(null, getRealm());
    newContext.realm = nextPending.Realm;
    getStack().push(newContext);
    var result = callInternalSlot(SLOTS.CALL, nextPending.Task, undefined, nextPending.Arguments);
    if (isAbrupt(result=ifAbrupt(result))) {
        if (hasConsole) {
            var ex = makeNativeException(ex);
            console.log("NextTask got abruptly completed on [[Call]] of nextPending.Task");
            if (typeof ex == "object") {
                console.log(ex.name);
                console.log(ex.message);
                console.log(ex.stack);
            }
        }
    }
    getStack().pop();
    return NextTask(result, nextQueue);
}

function ScriptEvaluationTask (source) {
    Assert(typeof source === "string", "ScriptEvaluationTask: Source has to be a string");
    var status = NormalCompletion(undefined);
    try {
        var script = parse(source);
    } catch (ex) {
        return newSyntaxError(ex.message);
    }
    var realm = getRealm();
    status = ScriptEvaluation(script, realm, false); // evaluation.Program(ast)
    return NextTask(status)
}


/**
 * this is my personal old handler, not from the docs
 * and is subject for removal, very soon
 * @type {handleEventQueue}
 */
exports.HandleEventQueue = handleEventQueue;
function handleEventQueue(shellMode, initialized) {
    var task, func, time, result;
    var LoadingTasks = getRealm().LoadingTasks;
    var PromiseTasks = getRealm().PromiseTasks;
    var result = NextTask(undefined, PromiseTasks); // PRomises are resolved here, is right
    function handler() {
        var eventQueue = getEventQueue();
        if (task = eventQueue.shift()) {
            func = task.func;
            time = Date.now();
            if (time >= (task.time + task.timeout)) {
                if (IsCallable(func)) result = callInternalSlot(SLOTS.CALL, func, undefined, []);
                if (isAbrupt(result)) {
                    try {
                        throw makeNativeException(result.value);
                    } catch (ex) {
                        consoleLog("Exception: happend async and is just a print of the exception´s object");
                        consoleLog(ex.name);
                        consoleLog(ex.message);
                        consoleLog(ex.stack);
                    }
                }
            } else eventQueue.push(task);
        }
        if (eventQueue.length) setTimeout(handler, 0);
        else {
            // if (!shellMode && initialized) exports.endRuntime();
            // this will make a failure, but the function will be removed anyways very soon
        }
    }
    setTimeout(handler, 0);
}
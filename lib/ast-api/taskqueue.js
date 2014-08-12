function evalJobs() {
    var PromiseJobs = getJobs(getRealm(), "PromiseJobs")
    var taskResults = NextJob(undefined, PromiseJobs);
    var TimerJobs = getJobs(getRealm(), "TimerJobs")
    var taskResults = NextJob(undefined, TimerJobs);
    var LoadingJobs = getJobs(getRealm(), "LoadingJobs")
    var taskResults = NextJob(undefined, LoadingJobs);
    /*
     managing multiple queues like this looks like errors,

     will be changed soon
     */
}

function PendingJobRecord_toString() {
    return "[object PendingJobRecord]";
}
function PendingJobRecord(task, args, realm, hostDefined) {
    var pendingJobRecord = Object.create(PendingJobRecord.prototype);
    pendingJobRecord.Job = task;
    pendingJobRecord.Arguments = args;
    pendingJobRecord.Realm = realm;
    pendingJobRecord.HostDefined = hostDefined;
    return pendingJobRecord;
}
PendingJobRecord.prototype = Object.create(null);
PendingJobRecord.prototype.constructor = PendingJobRecord;
PendingJobRecord.prototype.toString = PendingJobRecord_toString;
function JobQueue() {
    return [];
}
function makeJobQueues(realm) {
    realm.LoadingJobs = JobQueue();
    realm.PromiseJobs = JobQueue();
    realm.ScriptJobs = JobQueue();
    realm.TimerJobs = JobQueue();
}
function getJobs(realm, name) {
    if (realm) return realm[name];
}
var queueNames = {
    __proto__: null,
    "LoadingJobs": true,
    "PromiseJobs": true,
    "ScriptJobs": true,
    "TimerJobs": true
};
function EnqueueJob(queueName, task, args, hostDefined) {
    Assert(Type(queueName) === STRING && queueNames[queueName], "EnqueueJob: queueName has to be valid");
    Assert(Array.isArray(args), "arguments have to be a list and to be equal in the number of arguments of task");
    var callerRealm = getRealm();
    var pending = PendingJobRecord(task, args, callerRealm, hostDefined);
    switch (queueName) {
        case "PromiseJobs":
            callerRealm.PromiseJobs.push(pending);
            break;
        case "LoadingJobs":
            callerRealm.LoadingJobs.push(pending);
            break;
        case "ScriptJobs":
            callerRealm.ScriptJobs.push(pending);
            break;
        case "TimerJobs":
            callerRealm.TimerJobs.push(pending);
            break;
    }
    return NormalCompletion(empty);
}
/**
 * TO DO: Change nextJob to main loop of the runtime.
 *
 *
 * NextJob shall become the main event loop
 *
 * instead of a "function" calling next Job recursivly
 *
 * an "iteration" popping the next Job off the queue(s).
 *
 * Then ScriptJobs make sense
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

function NextJob(result, nextQueue) {
    if (!nextQueue || !nextQueue.length) return;
    if (isAbrupt(result = ifAbrupt(result))) {
        // performing implementation defined unhandled exception processing
        console.log("NextJob: Got exception - which will remain unhandled - for debugging, i print them out.");
        printException(result);
    }
//  Assert(getStack().length === 0, "NextJob: The execution context stack has to be empty");
    var nextPending = nextQueue.shift();
    if (!nextPending) return;
    var newContext = ExecutionContext(null, getRealm());
    newContext.realm = nextPending.Realm;
    getStack().push(newContext);
    var result = callInternalSlot(SLOTS.CALL, nextPending.Job, undefined, nextPending.Arguments);
    if (isAbrupt(result = ifAbrupt(result))) {
        if (hasConsole) {
            var ex = makeNativeException(ex);
            console.log("NextJob got abruptly completed on [[Call]] of nextPending.Job");
            if (typeof ex == "object") {
                console.log(ex.name);
                console.log(ex.message);
                console.log(ex.stack);
            }
        }
    }
    getStack().pop();
    return NextJob(result, nextQueue);
}

function ScriptEvaluationJob(source) {
    Assert(typeof source === "string", "ScriptEvaluationJob: Source has to be a string");
    var status = NormalCompletion(undefined);
    try {
        var script = parse(source);
    } catch (ex) {
        return newSyntaxError(ex.message);
    }
    var realm = getRealm();
    status = ScriptEvaluation(script, realm, false); // evaluation.Program(ast)
    return NextJob(status)
}


/**
 * this is my personal old handler, not from the docs
 * and is subject for removal, very soon
 * @type {handleEventQueue}
 */
exports.HandleEventQueue = handleEventQueue;
function handleEventQueue(shellMode, initialized) {
    var task, func, time, result;
    var LoadingJobs = getRealm().LoadingJobs;
    var PromiseJobs = getRealm().PromiseJobs;
    var result = NextJob(undefined, PromiseJobs); // PRomises are resolved here, is right
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
/**
 * Created by root on 31.03.14.
 */

    // ===========================================================================================================
    // 8.4 Tasks and Task Queues
    // ===========================================================================================================

function PendingTaskRecord_toString () {
    return "[object PendingTaskRecord]";
}

function PendingTaskRecord (task, args, realm) {
    var pendingTaskRecord = Object.create(PendingTaskRecord.prototype);
    pendingTaskRecord.Task = task;
    pendingTaskRecord.Arguments = args;
    pendingTaskRecord.Realm = realm;
    return pendingTaskRecord;
}
PendingTaskRecord.prototype = Object.create(null);
PendingTaskRecord.prototype.constructor = PendingTaskRecord;
PendingTaskRecord.prototype.toString = PendingTaskRecord_toString;

function TaskQueue() {
    // use it like an array
    // and use .nextIndex and .nextOne for iteration
    // without the need for a shift() to go forward
    // or to write the code down manually
    var queue = Object.create(Array.prototype);
    Object.defineProperty(queue, "length", {
        value: 0,
        enumerable: false
    });
    // set queue.nextIndex = 0 to start Iteration
    Object.defineProperty(queue, "nextIndex", {
        value: 0,
        enumerable: false
    });
    // test queue.done convenient, wether it´s over
    Object.defineProperty(queue, "done", {
        get: function () {
            return queue.nextIndex >= queue.length;
        },
        enumerable: false
    });
    // use nextOne to get the value at nextIndex and increase
    Object.defineProperty(queue, "nextOne", {
        value: function () {
            if (!queue.done) {
                var value = queue[queue.nextIndex];
                queue.nextIndex += 1;
                return value;
            }
            return undefined;
        },
        enumerable: false
    })
    return queue;
}


function makeTaskQueues(realm) {
    realm.LoadingTasks = TaskQueue();
    realm.PromiseTasks = TaskQueue();
}
function getTasks(realm, name) {
    return realm[name];
}

var queueNames = {
    __proto__:null,
    "LoadingTasks": true,
    "PromiseTasks": true
};

function EnqueueTask(queueName, task, args) {
    Assert(Type(queueName) === "string" && queueNames[queueName], "EnqueueTask: queueName has to be valid");
    // Assert(isTaskName[task])
    Assert(Array.isArray(args), "arguments have to be a list and to be equal in the number of arguments of task");
    var callerContext = getContext();
    var callerRealm = callerContext.realm;
    var pending = PendingTaskRecord(task, arguments, callerRealm);
    switch(queueName) {
        case "PromiseTasks": realm.PromiseTasks.push(pending);
            break;
        case "LoadingTasks": realm.LoadingTasks.push(pending);
            break;
    }
    return NormalCompletion(empty);
}

function NextTask (result, nextQueue) {

    if (isAbrupt(result = ifAbrupt(result))) {
        // performing implementation defined unhandled exception processing
        console.log("NextTask: Got exception - which will remain unhandled - for debugging, i print them out." )
        printException(result);
    }

    Assert(getStack().length === 0, "NextTask: The execution context stack has to be empty");
    var nextPending = nextQueue.shift();
    var newContext = ExecutionContext(null, getRealm());
    newContext.realm = nextPending.realm;
    getStack().push(newContext);
    callInternalSlot("Call", nextPending.Task, undefined, nextPending.Arguments);
}


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
    return [];
}

function makeTaskQueues(realm) {
    realm.LoadingTasks = TaskQueue();
    realm.PromiseTasks = TaskQueue();
}

function getTasks(realm, name) {
    if (realm) return realm[name];
}

var queueNames = {
    __proto__:null,
    "LoadingTasks": true,
    "PromiseTasks": true
};

function EnqueueTask(queueName, task, args) {
    Assert(Type(queueName) === STRING && queueNames[queueName], "EnqueueTask: queueName has to be valid");
    // Assert(isTaskName[task])
    Assert(Array.isArray(args), "arguments have to be a list and to be equal in the number of arguments of task");

    var callerContext = getContext();
    var callerRealm = getRealm();

    var pending = PendingTaskRecord(task, args, callerRealm);
    
    switch(queueName) {
        case "PromiseTasks": realm.PromiseTasks.push(pending);
            break;
        case "LoadingTasks": realm.LoadingTasks.push(pending);
            break;
    }
    return NormalCompletion(empty);
}

function NextTask (result, nextQueue) {
    if (!nextQueue || !nextQueue.length) return;
    if (isAbrupt(result = ifAbrupt(result))) {
        // performing implementation defined unhandled exception processing
        console.log("NextTask: Got exception - which will remain unhandled - for debugging, i print them out." );
        printException(result);
    }
//    Assert(getStack().length === 0, "NextTask: The execution context stack has to be empty");
    var nextPending = nextQueue.shift();
    if (!nextPending) return;
    var newContext = ExecutionContext(null, getRealm());
    newContext.realm = nextPending.Realm;
    getStack().push(newContext);
    
//    console.dir(nextPending);
    var result = callInternalSlot("Call", nextPending.Task, undefined, nextPending.Arguments);
    
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
}

// ===========================================================================================================
// Object.observe
// ===========================================================================================================

// Object.observe
// http://wiki.ecmascript.org/doku.php?id=harmony:observe
// var NotifierPrototype is defined with all other intrinsics above

DefineOwnProperty(NotifierPrototype, "notify", {
    value: CreateBuiltinFunction(realm, function notify(thisArg, argList) {
        var changeRecord = argList[0];
        var notifier = thisArg;
        if (Type(notifier) !== "object") return withError("Type", "Notifier is not an object.");
        var target = getInternalSlot(notifier, "Target");
        var newRecord = ObjectCreate();
        var status = callInternalSlot("DefineOwnProperty", newRecord, "object", {
            value: target,
            writable: false,
            enumerable: true,
            configurable: false
        });
        //if (isAbrupt(status)) return status;

        var bindings = getInternalSlot(changeRecord, "Bindings");
        var value;
        for (var N in bindings) {
            if (Object.hasOwnProperty.call(bindings, N)) {
                if (N !== "object") {
                    value = callInternalSlot("Get", changeRecord, N, changeRecord);
                    if (isAbrupt(value = ifAbrupt(value))) return value;
                    status = callInternalSlot("DefineOwnProperty", newRecord, N, {
                        value: value,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });
                    //if (isAbrupt(status)) return status;
                }

            }
        }
        setInternalSlot(newRecord, "Extensible", false);
        status = EnqueueChangeRecord(target, newRecord);
        //if (isAbrupt(status)) return status;
        return NormalCompletion();
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(NotifierPrototype, "performChange", {
    value: CreateBuiltinFunction(realm, function notify(thisArg, argList) {
        var changeType = argList[0];
        var changeFn = argList[1];
        var notifier = thisArg;
        var status;
        if (Type(notifier) !== "object") return withError("Type", "notifier is not an object");
        var target = getInternalSlot(notifier, "Target");
        if (target === undefined) return NormalCompletion(undefined);
        if (Type(changeType) !== "string") return withError("Type", "changeType has to be a string");
        if (!IsCallable(changeFn)) return withError("Type", "changeFn is not a callable");
        status = BeginChange(target, changeType);
        var changeRecord = callInternalSlot("Call", changeFn, undefined, []);
        status = EndChange(target, changeType);
        var changeObservers = getInternalSlot(notifier, "ChangeObservers");
        if (!changeObservers.length) return NormalCompletion();
        var newRecord = ObjectCreate();
        status = callInternalSlot("DefineOwnProperty", newRecord, "object", {
            value: target,
            writable: false,
            enumerable: true,
            configurable: false
        });
        status = callInternalSlot("DefineOwnProperty", newRecord, "type", {
            value: changeType,
            writable: false,
            enumerable: true,
            configurable: false
        });
        var bindings = getInternalSlot(changeRecord, "Bindings");
        var value;
        for (var N in bindings) {
            if (Object.hasOwnProperty.call(bindings, N)) {
                if (N !== "object" && N !== "type") {
                    value = callInternalSlot("Get", changeRecord, N, changeRecord);
                    if (isAbrupt(value = ifAbrupt(value))) return value;
                    status = callInternalSlot("DefineOwnProperty", newRecord, N, {
                        value: value,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });
                    //if (isAbrupt(status)) return status;
                }
            }
        }
        setInternalSlot(newRecord, "Extensible", false);
        status = EnqueueChangeRecord(target, newRecord);
        return NormalCompletion(undefined);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

function GetNotifier(O) {
    var proto;
    var notifier = getInternalSlot(O, "Notifier");
    if (notifier === undefined) {
        proto = Get(getIntrinsics(), "NotifierPrototype%")
        notifier = ObjectCreate(proto);
        setInternalSlot(notifier, "Target", O);
        setInternalSlot(notifier, "ChangeObservers", []);
        setInternalSlot(notifier, "ActiveChanges", ObjectCreate(null));
        setInternalSlot(O, "Notifier", notifier);
    }
    return notifier;
}

function BeginChange(O, changeType) {
    var notifier = GetNotifier(O);
    var activeChanges = getInternalSlot(notifier, "ActiveChanges");
    var changeCount = Get(activeChanges, changeType);
    if (changeCount === undefined) changeCount = 1;
    else changeCount = changeCount + 1;
    CreateDataProperty(activeChanges, changeType, changeCount);
}

function EndChange(O, changeType) {
    var notifier = GetNotifier(O);
    var activeChanges = getInternalSlot(notifier, "ActiveChanges");
    var changeCount = Get(activeChanges, changeType);
    Assert(changeCount > 0, "changeCount has to be bigger than 0");
    changeCount = changeCount - 1;
    CreateDataProperty(activeChanges, changeType, changeCount);
}

function ShouldDeliverToObserver(activeChanges, acceptList, changeType) {
    var doesAccept = false;
    for (var i = 0, j = acceptList.length; i < j; i++) {
        var accept = acceptList[i];
        if (activeChanges[accept] > 0) return false;
        if (accept === changeType) doesAccept = true;
    }
    return doesAccept;
}

function EnqueueChangeRecord(O, changeRecord) {
    var notifier = GetNotifier(O);
    var changeType = Get(changeRecord, "type");
    var activeChanges = getInternalSlot(notifier, "ActiveChanges");
    var changeObservers = getInternalSlot(notifier, "ChangeObservers");
    var observerRecord;
    for (var i = 0, j = changeObservers.length; i < j; i++) {
        if (observerRecord = changeObservers[i]) {
            var acceptList = Get(oserverRecord, "accept");
            var deliver = ShouldDeliverToObserver(activeChanges, acceptList, changeType);
            if (deliver === false) continue;
            var observer = Get(observerRecord, "callback");
            var pendingRecords = getInternalSlot(observer, "PendingChangeRecords");
            pendingRecords.push(changeRecord);
        }
    }
}

function DeliverChangeRecords(C) {
    var changeRecords = getInternalSlot(C, "PendingChangeRecords");
    setInternalSlot(C, "PendingChangeRecords", []);
    var array = ArrayCreate(0);
    var n = 0;
    var status;
    var record;
    for (var i = 0, j = changeRecords.length; i < j; i++) {
        if (record = changeRecords[i]) {
            status = callInternalSlot("DefineOwnProperty", array, ToString(n), {
                value: record,
                writable: true,
                enumerable: true,
                configurable: true
            });
            n = n + 1;
        }
    }
    if (Get(array, "length") === 0) return false;
    callInternalSlot("Call", C, undefined, [array]);
    return true;
}

function DeliverAllChangeRecords() {
    var observers = ObserverCallbacks;
    var anyWorkDone = false;
    var observer;
    for (var i = 0, j = observers.length; i < j; i++) {
        if (observer = observers[i]) {
            var result = DeliverChangeRecords(observer);
            if (result === true) anyWorkDone = true;
        }
    }
    return anyWorkDone;
}

function CreateChangeRecord(type, object, name, oldDesc, newDesc) {
    var changeRecord = ObjectCreate();
    var status;
    status = callInternalSlot("DefineOwnProperty", changeRecord, "type", {
        value: type,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot("DefineOwnProperty", changeRecord, "object", {
        value: object,
        writable: false,
        enumerable: true,
        configurable: false
    });
    if (Type(name) === "string") {
        status = callInternalSlot("DefineOwnProperty", changeRecord, "name", {
            value: name,
            writable: false,
            enumerable: true,
            configurable: false
        });
    }
    if (IsDataDescriptor(oldDesc)) {
        if (!IsDataDescriptor(newDesc) || !SameValue(oldDesc.value, newDesc.value)) {
            status = callInternalSlot("DefineOwnProperty", changeRecord, "oldValue", {
                value: oldDesc,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }
    }
    setInternalSlot(changeRecord, "Extensible", false);
    return changeRecord;
}

function CreateSpliceChanceRecord(object, index, removed, addedCount) {
    var changeRecord = ObjectCreate();
    var status = callInternalSlot("DefineOwnProperty", changeRecord, "type", {
        value: "splice",
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot("DefineOwnProperty", changeRecord, "object", {
        value: object,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot("DefineOwnProperty", changeRecord, "index", {
        value: index,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot("DefineOwnProperty", changeRecord, "removed", {
        value: removed,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot("DefineOwnProperty", changeRecord, "addedCount", {
        value: addedCount,
        writable: false,
        enumerable: true,
        configurable: false
    });
}

DefineOwnProperty(ObjectConstructor, "observe", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var O = argList[0];
        var callback = argList[1];
        var accept = argList[2];
        if (Type(O) !== "object") return withError("Type", "first argument is not an object");
        if (!IsCallable(callback)) return withError("Type", "second argument is not callable");
        if (TestIntegrityLevel(callback, "frozen")) return withError("Type", "second argument is frozen");
        if (accept === undefined) {
            accept = ["add", "updata", "delete", "reconfigure", "setPrototype", "preventExtensions"];
        } else {
            accept = CreateListFromArray(accept);
        }
        var notifier = GetNotifier(O);
        var changeObservers = getInternalSlot(notifier, "ChangeObservers");
        var observer;
        for (var i = 0, j = changeObservers.length; i < j; i++) {
            if (observer = changeObservers[i]) {
                if (Get(observer, "callback") === callback) {
                    CreateDataProperty(record, "accept", acceptList);
                    return NormalCompletion(O);
                }
            }
        }
        var observerRecord = ObjectCreate();
        CreateDataProperty(observerRecord, "callback", callback);
        CreateDataProperty(observerRecord, "accept", acceptList);
        changeObservers.push(observerRecord);
        var observerCallbacks = ObserverCallbacks;
        if (observerCallbacks.indexOf(callback)) return NormalCompletion(O);
        observerCallbacks.push(calllback);
        return NormalCompletion(O);
    }),
    writable: true,
    enumerable: true,
    configurable: true
});

DefineOwnProperty(ObjectConstructor, "unobserve", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var O = argList[0];
        var callback = argList[1];
        if (Type(O) !== "object") return withError("Type", "first argument is not an object");
        if (!IsCallable(callback)) return withError("Type", "second argument is not callable");
        var notifier = GetNotifier(O);
        var changeObservers = getInternalSlot(notifier, "ChangeObservers");
        changeObservers = changeObservers.filter(function (record) {
            return (Get(record, "callback") !== callback);
        });
        return NormalCompletion(O);
    }),
    writable: true,
    enumerable: true,
    configurable: true
});

DefineOwnProperty(ObjectConstructor, "deliverChangeRecords", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var callback = argList[0];
        if (!IsCallable(callback)) return withError("Type", "first argument is not callable.");
        var status;
        for (;;) {
            status = DeliverChangeRecords(callback);
            status = ifAbrupt(status);
            if (status === false || isAbrupt(status)) break;
        }
        if (isAbrupt(status)) return status;
        return NormalCompletion(undefined);
    }),
    writable: true,
    enumerable: true,
    configurable: true
});

DefineOwnProperty(ObjectConstructor, "getNotifier", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var O = argList[0];
        if (Type(O) !== "object") return withError("Type", "first argument is not an object");
        if (TestIntegrityLevel(O, "frozen")) return NormalCompletion(null);
        return GetNotifier(O);
    }),
    writable: true,
    enumerable: true,
    configurable: true
});

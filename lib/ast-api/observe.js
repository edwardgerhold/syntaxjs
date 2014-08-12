function GetNotifier(O) {
    var proto;
    var notifier = getInternalSlot(O, SLOTS.NOTIFIER);
    if (notifier === undefined) {
        proto = getIntrinsic(INTRINSICS.NOTIFIERPROTOTYPE);
        notifier = ObjectCreate(proto);
        setInternalSlot(notifier, SLOTS.TARGET, O);
        setInternalSlot(notifier, SLOTS.CHANGEOBSERVERS, []);
        setInternalSlot(notifier, SLOTS.ACTIVECHANGES, ObjectCreate(null));
        setInternalSlot(O, SLOTS.NOTIFIER, notifier);
    }
    return notifier;
}
function BeginChange(O, changeType) {
    var notifier = GetNotifier(O);
    var activeChanges = getInternalSlot(notifier, SLOTS.ACTIVECHANGES);
    var changeCount = Get(activeChanges, changeType);
    if (changeCount === undefined) changeCount = 1;
    else changeCount = changeCount + 1;
    CreateDataProperty(activeChanges, changeType, changeCount);
}
function EndChange(O, changeType) {
    var notifier = GetNotifier(O);
    var activeChanges = getInternalSlot(notifier, SLOTS.ACTIVECHANGES);
    var changeCount = Get(activeChanges, changeType);
    Assert(changeCount > 0, "changeCount has to be bigger than 0");
    changeCount = changeCount - 1;
    CreateDataProperty(activeChanges, changeType, changeCount);
}
function ShouldDeliverToObserver(activeChanges, acceptList, changeType) {
    var doesAccept = false;
    for (var i = 0, j = acceptList.length; i < j; i++) {
        var accept = acceptList[i];
        if (Get(activeChanges, accept) > 0) return false;
        if (accept === changeType) doesAccept = true;
    }
    return doesAccept;
}
function EnqueueChangeRecord(O, changeRecord) {
    var notifier = GetNotifier(O);
    var changeType = Get(changeRecord, "type");
    var activeChanges = getInternalSlot(notifier, SLOTS.ACTIVECHANGES);
    var changeObservers = getInternalSlot(notifier, SLOTS.CHANGEOBSERVERS);
    var observerRecord;
    for (var i = 0, j = changeObservers.length; i < j; i++) {
        if (observerRecord = changeObservers[i]) {
            var acceptList = Get(observerRecord, "accept");
            var deliver = ShouldDeliverToObserver(activeChanges, acceptList, changeType);
            if (deliver === false) continue;
            var observer = Get(observerRecord, "callback");
            var pendingRecords = getInternalSlot(observer, SLOTS.PENDINGCHANGERECORDS);
            pendingRecords.push(changeRecord);
        }
    }
}
function DeliverChangeRecords(C) {
    var changeRecords = getInternalSlot(C, SLOTS.PENDINGCHANGERECORDS);
    setInternalSlot(C, SLOTS.PENDINGCHANGERECORDS, []);
    var array = ArrayCreate(0);
    var n = 0;
    var status;
    var record;
    for (var i = 0, j = changeRecords.length; i < j; i++) {
        if (record = changeRecords[i]) {
            status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, array, ToString(n), {
                value: record,
                writable: true,
                enumerable: true,
                configurable: true
            });
            n = n + 1;
        }
    }
    if (Get(array, "length") === 0) return false;
    callInternalSlot(SLOTS.CALL, C, undefined, [array]);
    return true;
}
function DeliverAllChangeRecords() {
    var observers = getRealm().ObserverCallbacks;
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
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "type", {
        value: type,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "object", {
        value: object,
        writable: false,
        enumerable: true,
        configurable: false
    });
    if (Type(name) === STRING) {
        status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "name", {
            value: name,
            writable: false,
            enumerable: true,
            configurable: false
        });
    }
    if (IsDataDescriptor(oldDesc)) {
        if (!IsDataDescriptor(newDesc) || !SameValue(oldDesc.value, newDesc.value)) {
            status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "oldValue", {
                value: oldDesc,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }
    }
    setInternalSlot(changeRecord, SLOTS.EXTENSIBLE, false);
    return changeRecord;
}
function CreateSpliceChanceRecord(object, index, removed, addedCount) {
    var changeRecord = ObjectCreate();
    var status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "type", {
        value: "splice",
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "object", {
        value: object,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "index", {
        value: index,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "removed", {
        value: removed,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, changeRecord, "addedCount", {
        value: addedCount,
        writable: false,
        enumerable: true,
        configurable: false
    });
}
var NotifierPrototype_notify = function notify(thisArg, argListdgn) {
    var changeRecord = argList[0];
    var notifier = thisArg;
    if (Type(notifier) !== OBJECT) return newTypeError("Notifier is not an object.");
    var target = getInternalSlot(notifier, SLOTS.TARGET);
    var newRecord = ObjectCreate();
    var status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, newRecord, "object", {
        value: target,
        writable: false,
        enumerable: true,
        configurable: false
    });
    //if (isAbrupt(status)) return status;
    var bindings = getInternalSlot(changeRecord, SLOTS.BINDINGS);
    var value;
    for (var N in bindings) {
        if (Object.hasOwnProperty.call(bindings, N)) {
            if (N !== "object") {
                value = callInternalSlot(SLOTS.GET, changeRecord, N, changeRecord);
                if (isAbrupt(value = ifAbrupt(value))) return value;
                status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, newRecord, N, {
                    value: value,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                //if (isAbrupt(status)) return status;
            }
        }
    }
    setInternalSlot(newRecord, SLOTS.EXTENSIBLE, false);
    status = EnqueueChangeRecord(target, newRecord);
    //if (isAbrupt(status)) return status;
    return NormalCompletion();
};
var NotifierPrototype_performChange = function performChange(thisArg, argList) {
    var changeType = argList[0];
    var changeFn = argList[1];
    var notifier = thisArg;
    var status;
    if (Type(notifier) !== OBJECT) return newTypeError("notifier is not an object");
    var target = getInternalSlot(notifier, SLOTS.TARGET);
    if (target === undefined) return NormalCompletion(undefined);
    if (Type(changeType) !== STRING) return newTypeError("changeType has to be a string");
    if (!IsCallable(changeFn)) return newTypeError("changeFn is not a callable");
    status = BeginChange(target, changeType);
    var changeRecord = callInternalSlot(SLOTS.CALL, changeFn, undefined, []);
    status = EndChange(target, changeType);
    var changeObservers = getInternalSlot(notifier, SLOTS.CHANGEOBSERVERS);
    if (!changeObservers.length) return NormalCompletion();
    var newRecord = ObjectCreate();
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, newRecord, "object", {
        value: target,
        writable: false,
        enumerable: true,
        configurable: false
    });
    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, newRecord, "type", {
        value: changeType,
        writable: false,
        enumerable: true,
        configurable: false
    });
    var bindings = getInternalSlot(changeRecord, SLOTS.BINDINGS);
    var value;
    for (var N in bindings) {
        if (Object.hasOwnProperty.call(bindings, N)) {
            if (N !== "object" && N !== "type") {
                value = callInternalSlot(SLOTS.GET, changeRecord, N, changeRecord);
                if (isAbrupt(value = ifAbrupt(value))) return value;
                status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, newRecord, N, {
                    value: value,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
            }
        }
    }
    setInternalSlot(newRecord, SLOTS.EXTENSIBLE, false);
    status = EnqueueChangeRecord(target, newRecord);
    return NormalCompletion(undefined);
};
var ObjectConstructor_observe = function (thisArg, argList) {
    var O = argList[0];
    var callback = argList[1];
    var accept = argList[2];
    if (Type(O) !== OBJECT) return newTypeError(format("S_NOT_OBJECT", "arg0"));
    if (!IsCallable(callback)) return newTypeError("S_NOT_CALLABLE", "arg1");
    if (TestIntegrityLevel(callback, "frozen")) return newTypeError("S_IS_FROZEN", "arg1");
    if (accept === undefined) {
        accept = ["add", "updata", "delete", "reconfigure", "setPrototype", "preventExtensions"];
    } else {
        accept = CreateListFromArrayLike(accept);
    }
    var notifier = GetNotifier(O);
    var changeObservers = getInternalSlot(notifier, SLOTS.CHANGEOBSERVERS);
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
    var observerCallbacks = getRealm().ObserverCallbacks;
    if (observerCallbacks.indexOf(callback)) return NormalCompletion(O);
    observerCallbacks.push(calllback);
    return NormalCompletion(O);
};
var ObjectConstructor_unobserve = function (thisArg, argList) {
    var O = argList[0];
    var callback = argList[1];
    if (Type(O) !== OBJECT) return newTypeError("first argument is not an object");
    if (!IsCallable(callback)) return newTypeError("second argument is not callable");
    var notifier = GetNotifier(O);
    var changeObservers = getInternalSlot(notifier, SLOTS.CHANGEOBSERVERS);
    changeObservers = changeObservers.filter(function (record) {
        return (Get(record, "callback") !== callback);
    });
    setInternalSlot(notifier, SLOTS.CHANGEOBSERVERS, changeObservers);
    return NormalCompletion(O);
};
var ObjectConstructor_deliverChangeRecords = function (thisArg, argList) {
    var callback = argList[0];
    if (!IsCallable(callback)) return newTypeError("first argument is not callable.");
    var status;
    for (; ;) {
        status = DeliverChangeRecords(callback);
        status = ifAbrupt(status);
        if (status === false || isAbrupt(status)) break;
    }
    if (isAbrupt(status)) return status;
    return NormalCompletion(undefined);
};
var ObjectConstructor_getNotifier = function (thisArg, argList) {
    var O = argList[0];
    if (Type(O) !== OBJECT) return newTypeError("first argument is not an object");
    if (TestIntegrityLevel(O, "frozen")) return NormalCompletion(null);
    return GetNotifier(O);
};
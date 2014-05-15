
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
function BeginChange(O,changeType) {
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
        if (Get(activeChanges,accept) > 0) return false;
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

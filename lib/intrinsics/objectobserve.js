var NotifierPrototype_notify = function notify(thisArg, argListdgn) {
    var changeRecord = argList[0];
    var notifier = thisArg;
    if (Type(notifier) !== OBJECT) return newTypeError( "Notifier is not an object.");
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
var NotifierPrototype_performChange =  function performChange(thisArg, argList) {
    var changeType = argList[0];
    var changeFn = argList[1];
    var notifier = thisArg;
    var status;
    if (Type(notifier) !== OBJECT) return newTypeError( "notifier is not an object");
    var target = getInternalSlot(notifier, SLOTS.TARGET);
    if (target === undefined) return NormalCompletion(undefined);
    if (Type(changeType) !== STRING) return newTypeError( "changeType has to be a string");
    if (!IsCallable(changeFn)) return newTypeError( "changeFn is not a callable");
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
        accept = CreateListFromArray(accept);
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
    if (Type(O) !== OBJECT) return newTypeError( "first argument is not an object");
    if (!IsCallable(callback)) return newTypeError( "second argument is not callable");
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
    if (!IsCallable(callback)) return newTypeError( "first argument is not callable.");
    var status;
    for (;;) {
        status = DeliverChangeRecords(callback);
        status = ifAbrupt(status);
        if (status === false || isAbrupt(status)) break;
    }
    if (isAbrupt(status)) return status;
    return NormalCompletion(undefined);
};
var ObjectConstructor_getNotifier = function (thisArg, argList) {
    var O = argList[0];
    if (Type(O) !== OBJECT) return newTypeError( "first argument is not an object");
    if (TestIntegrityLevel(O, "frozen")) return NormalCompletion(null);
    return GetNotifier(O);
};
// this shall be in lib/intrinsics
LazyDefineBuiltinFunction(NotifierPrototype, "notify", 1, NotifierPrototype_notify);
LazyDefineBuiltinFunction(NotifierPrototype, "performChange", 2, NotifierPrototype_performChange);
LazyDefineBuiltinFunction(ObjectConstructor, "observe", 3, ObjectConstructor_observe);
LazyDefineBuiltinFunction(ObjectConstructor, "unobserve", 1, ObjectConstructor_unobserve);
LazyDefineBuiltinFunction(ObjectConstructor, "deliverChangeRecords", 1, ObjectConstructor_deliverChangeRecords);
LazyDefineBuiltinFunction(ObjectConstructor, "getNotifier", 1, ObjectConstructor_getNotifier);
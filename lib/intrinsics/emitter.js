
// ===========================================================================================================
// Event Emitter (nodejs emitter like with equal interfaces)
// ===========================================================================================================

setInternalSlot(EmitterPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
setInternalSlot(EmitterConstructor, SLOTS.CALL, function Call(thisArg, argList) {
    var O = thisArg;
    var type = Type(O);
    var has, listeners;
    if (type === OBJECT) {
        has = hasInternalSlot(O, SLOTS.EVENTLISTENERS);
        if (!has) {
            return withError("Type", "this argument has to have a [[Listeners]] Property");
        } else {
            listeners = getInternalSlot(O, SLOTS.EVENTLISTENERS);
            if (!listeners) {
                listeners = Object.create(null);
                setInternalSlot(O, SLOTS.EVENTLISTENERS, listeners);

            }
        }
    } else {
        return withError("Type", "this argument is not an object");
    }
    return O;
});

setInternalSlot(EmitterConstructor, SLOTS.CONSTRUCT, function Call(argList) {
    var F = this;
    var args = argList;
    return OrdinaryConstruct(F, args);
});

DefineOwnProperty(EmitterConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = EmitterConstructor;
        var proto = GetPrototypeFromConstructor(F, "%EmitterPrototype%");
        return ObjectCreate(proto, [SLOTS.EVENTLISTENERS]);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(EmitterConstructor, "prototype", {
    value: EmitterPrototype,
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(EmitterPrototype, "constructor", {
    value: EmitterConstructor,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(EmitterPrototype, "on", {
    value: CreateBuiltinFunction(realm, function on(thisArg, argList) {
        var E = thisArg,
            listeners, callback, event;

        if (Type(E) !== OBJECT) return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);

        var event = argList[0];
        var callback = argList[1];
        if (Type(event) !== STRING) return withError("Type", "Your argument 1 is not a event name string.");
        if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

        var list = listeners[event];
        if (list == undefined) list = listeners[event] = [];
        list.push(callback);

        return NormalCompletion(undefined);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(EmitterPrototype, "once", {
    value: CreateBuiltinFunction(realm, function once(thisArg, argList) {
        var E = thisArg,
            listeners, callback, event;

        if (Type(E) !== OBJECT) return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);

        event = argList[0];
        callback = argList[1];
        if (Type(event) !== STRING) return withError("Type", "Your argument 1 is not a event name string.");
        if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

        var list = listeners[event];
        if (list == undefined) list = listeners[event] = [];

        list.push(
            function (callback) {

                return CreateBuiltinFunction(realm, function once_callback(thisArg, argList) {
                    if (callback) {
                        callInternalSlot(SLOTS.CALL, callback, thisArg, argList);
                        callback = null;
                    }
                });

            }(callback)
        );

        return NormalCompletion(undefined);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(EmitterPrototype, "remove", {
    value: CreateBuiltinFunction(realm, function remove(thisArg, argList) {

        var E = thisArg,
            listeners, callback, event, values;

        if (Type(E) !== OBJECT) return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);

        event = argList[0];
        callback = argList[1];

        if (Type(event) !== STRING) return withError("Type", "Your argument 1 is not a event name string.");
        if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a function.");

        var list = listeners[event];
        if (list == undefined) return NormalCompletion(undefined);

        var newList = [];
        var fn;
        for (var i = 0, j = list.length; i < j; i++) {
            if (fn = list[i]) {
                if (fn !== callback) newList.push(fn);
            }
        }

        listeners[event] = newList;

        return NormalCompletion(undefined);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(EmitterPrototype, "removeAll", {
    value: CreateBuiltinFunction(realm, function removeAll(thisArg, argList) {
        var E = thisArg,
            listeners, event;

        if (Type(E) !== OBJECT) return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);

        event = argList[0];

        if (Type(event) !== STRING) return withError("Type", "Your argument 1 is not a event name string.");

        var list = listeners[event];
        if (list == undefined) return NormalCompletion(undefined);
        else listeners[event] = [];

        return NormalCompletion(undefined);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(EmitterPrototype, "emit", {
    value: CreateBuiltinFunction(realm, function emit(thisArg, argList) {
        var E = thisArg,
            listeners, callback, event, values;

        if (Type(E) !== OBJECT) return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);
        event = argList[0];
        values = argList.slice(1);
        if (Type(event) !== STRING) return withError("Type", "Your argument 1 is not a event name string.");
        var list = listeners[event];
        if (list == undefined) return NormalCompletion(undefined);

        //setTimeout(function () {
        var F = OrdinaryFunction();
        var status = callInternalSlot(SLOTS.CALL, SetTimeoutFunction, null, [F, 0]);
        setInternalSlot(F, SLOTS.CALL, function (thisArg, argList) {
        var result;
        for (var i = 0, j = list.length; i < j; i++) {
            if (callback = list[i]) {
                result = callInternalSlot(SLOTS.CALL, callback, thisArg, values);
            //    if (isAbrupt(result)) return result;
            }
        }
        });
        //});

        return NormalCompletion(undefined);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

LazyDefineBuiltinConstant(EmitterPrototype, $$toStringTag, "Emitter");


/*
  Emitter,
  Event
  EventTarget
  MessagePort
 */


MakeConstructor(EventConstructor, true, EventPrototype);
MakeConstructor(EventTargetConstructor, true, EventTargetPrototype);
MakeConstructor(MessagePortConstructor, true, MessagePortPrototype);

var EventConstructor_Call = function (thisArg, argList) {
};


var EventTargetConstructor_Call = function (thisArg, argList) {
};
var EventTargetPrototype_addEventListener = function (thisArg, argList) {
};
var EventTargetPrototype_dispatchEvent = function (thisArg, argList) {
};
var EventTargetPrototype_removeEventListener = function (thisArg, argList) {
};
LazyDefineBuiltinFunction(EventTargetPrototype, "addEventListener", 3, EventTargetPrototype_addEventListener);
LazyDefineBuiltinFunction(EventTargetPrototype, "dispatchEvent", 1, EventTargetPrototype_dispatchEvent);
LazyDefineBuiltinFunction(EventTargetPrototype, "removeEventListener", 2, EventTargetPrototype_removeEventListener);

var MessagePortPrototype_close = function (thisArg, argList) {
};
var MessagePortPrototype_open = function (thisArg, argList) {
};
var MessagePortPrototype_postMessage = function (thisArg, argList) {
};
LazyDefineBuiltinFunction(MessagePortPrototype, "close", 0, MessagePortPrototype_close);
LazyDefineBuiltinFunction(MessagePortPrototype, "open", 0, MessagePortPrototype_open);
LazyDefineBuiltinFunction(MessagePortPrototype, "postMessage", 0, MessagePortPrototype_postMessage);


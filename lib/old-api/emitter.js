var EmitterConstructor_call = function (thisArg, argList) {
    var O = thisArg;
    var type = Type(O);
    var has, listeners;
    if (type === OBJECT) {
        has = hasInternalSlot(O, SLOTS.EVENTLISTENERS);
        if (!has) {
            return newTypeError( "this argument has to have a [[Listeners]] Property");
        } else {
            listeners = getInternalSlot(O, SLOTS.EVENTLISTENERS);
            if (!listeners) {
                listeners = Object.create(null);
                setInternalSlot(O, SLOTS.EVENTLISTENERS, listeners);
            }
        }
    } else {
        return newTypeError( "this argument is not an object");
    }
    return O;
};
var EmitterConstructor_construct = function (argList) {
    var F = this;
    var args = argList;
    return OrdinaryConstruct(F, args);
};
var EmitterConstructor_$$create = function (thisArg, argList) {
    var proto = GetPrototypeFromConstructor(thisArg, INTRINSICS.EMITTERPROTOTYPE);
    return ObjectCreate(proto, [SLOTS.EVENTLISTENERS]);
};
var EmitterPrototype_on = function (thisArg, argList) {
    var E = thisArg,
        listeners, callback, event;

    if (Type(E) !== OBJECT) return newTypeError( "this argument is not an object");

    if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return newTypeError( "[[Listeners]] missing on this argument");
    else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);
    var event = argList[0];
    var callback = argList[1];
    if (Type(event) !== STRING) return newTypeError( "Your argument 1 is not an event name string.");
    if (!IsCallable(callback)) return newTypeError( "Your argument 2 is not a callback function");

    var list = listeners[event];
    if (list == undefined) list = listeners[event] = [];
    list.push(callback);

    return NormalCompletion(undefined);
};
var EmitterPrototype_once = function (thisArg, argList) {
    var E = thisArg,
        listeners, callback, event;
    if (Type(E) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return newTypeError( "[[Listeners]] missing on this argument");
    else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);
    event = argList[0];
    callback = argList[1];
    if (Type(event) !== STRING) return newTypeError( "Your argument 1 is not an event name string.");
    if (!IsCallable(callback)) return newTypeError( "Your argument 2 is not a callback function");
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
};
var EmitterPrototype_remove = function (thisArg, argList) {
    var E = thisArg,
        listeners, callback, event, values;
    if (Type(E) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return newTypeError( "[[Listeners]] missing on this argument");
    else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);
    event = argList[0];
    callback = argList[1];
    if (Type(event) !== STRING) return newTypeError( "Your argument 1 is not an event name string.");
    if (!IsCallable(callback)) return newTypeError( "Your argument 2 is not a function.");
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
};
var EmitterPrototype_removeAll = function (thisArg, argList) {
    var E = thisArg,
        listeners, event;
    if (Type(E) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return newTypeError( "[[Listeners]] missing on this argument");
    else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);
    event = argList[0];
    if (Type(event) !== STRING) return newTypeError( "Your argument 1 is not a event name string.");
    var list = listeners[event];
    if (list == undefined) return NormalCompletion(undefined);
    else listeners[event] = [];
    return NormalCompletion(undefined);
};
var EmitterPrototype_emit = function (thisArg, argList) {
    var E = thisArg,
        listeners, callback, event, values;
    if (Type(E) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(E, SLOTS.EVENTLISTENERS)) return newTypeError( "[[Listeners]] missing on this argument");
    else listeners = getInternalSlot(E, SLOTS.EVENTLISTENERS);
    event = argList[0];
    values = arraySlice(argList, 1);
    if (Type(event) !== STRING) return newTypeError( "Your argument 1 is not a event name string.");
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
};
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
var MessagePortPrototype_close = function (thisArg, argList) {
};
var MessagePortPrototype_open = function (thisArg, argList) {
};
var MessagePortPrototype_postMessage = function (thisArg, argList) {
};
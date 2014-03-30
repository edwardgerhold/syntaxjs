
// ===========================================================================================================
// Event Emitter (nodejs emitter like with equal interfaces)
// ===========================================================================================================

setInternalSlot(EmitterPrototype, "Prototype", ObjectPrototype);
setInternalSlot(EmitterConstructor, "Call", function Call(thisArg, argList) {
    var O = thisArg;
    var type = Type(O);
    var has, listeners;
    if (type === "object") {
        var has = hasInternalSlot(O, "EventListeners");
        if (!has) {
            return withError("Type", "this argument has to have a [[Listeners]] Property");
        } else {
            var listeners = getInternalSlot(O, "EventListeners");
            if (!listeners) {
                listeners = Object.create(null);
                setInternalSlot(O, "EventListeners", listeners);

            }
        }
    } else {
        return withError("Type", "this argument is not an object");
    }
    return O;
});

setInternalSlot(EmitterConstructor, "Construct", function Call(argList) {
    var F = this;
    var args = argList;
    return OrdinaryConstruct(F, args);
});

DefineOwnProperty(EmitterConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = EmitterConstructor;
        var proto = GetPrototypeFromConstructor(F, "%EmitterPrototype%");
        var O = ObjectCreate(proto, {
            "EventListeners": undefined
        });
        return O;
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

        if (Type(E) !== "object") return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, "EventListeners");

        var event = argList[0];
        var callback = argList[1];
        if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
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

        if (Type(E) !== "object") return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, "EventListeners");

        var event = argList[0];
        var callback = argList[1];
        if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
        if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

        var list = listeners[event];
        if (list == undefined) list = listeners[event] = [];

        list.push(
            function (callback) {

                return CreateBuiltinFunction(realm, function once_callback(thisArg, argList) {
                    if (callback) {
                        callInternalSlot("Call", callback, thisArg, argList);
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

        if (Type(E) !== "object") return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, "EventListeners");

        event = argList[0];
        callback = argList[1];

        if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
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

        if (Type(E) !== "object") return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, "EventListeners");

        event = argList[0];

        if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");

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

        if (Type(E) !== "object") return withError("Type", "this argument is not an object");

        if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
        else listeners = getInternalSlot(E, "EventListeners");
        event = argList[0];
        values = argList.slice(1);
        if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
        var list = listeners[event];
        if (list == undefined) return NormalCompletion(undefined);

        //setTimeout(function () {
        var result;
        for (var i = 0, j = list.length; i < j; i++) {
            if (callback = list[i]) {
                result = callInternalSlot("Call", callback, thisArg, values);
                if (isAbrupt(result)) return result;
            }
        }
        //},0);

        return NormalCompletion(undefined);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

LazyDefineBuiltinConstant(EmitterPrototype, $$toStringTag, "Emitter");


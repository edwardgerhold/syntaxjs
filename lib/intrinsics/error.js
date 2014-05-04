// ===========================================================================================================
// Error
// ===========================================================================================================

setInternalSlot(ErrorPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
MakeConstructor(ErrorConstructor, true, ErrorPrototype);
LazyDefineBuiltinConstant(ErrorConstructor, "prototype", ErrorPrototype);
LazyDefineBuiltinConstant(ErrorPrototype, "constructor", ErrorConstructor);
LazyDefineBuiltinConstant(ErrorPrototype, "name", "Error");

setInternalSlot(ErrorConstructor, SLOTS.CALL, function (thisArg, argList) {
    var func = ErrorConstructor;
    var message = argList[0];
    var name = "Error";
    var O = thisArg;
    var isObject = Type(O) === OBJECT;
    // This is different from the others in the spec
    if (!isObject || (isObject &&
        (!hasInternalSlot(O, "ErrorData") || (getInternalSlot(O, "ErrorData") === undefined)))) {
        O = OrdinaryCreateFromConstructor(func, "%ErrorPrototype%", {
            "ErrorData": undefined
        });
        if (isAbrupt(O = ifAbrupt(O))) return O;
    }
    // or i read it wrong
    Assert(Type(O) === OBJECT);
    setInternalSlot(O, "ErrorData", "Error");
    if (message !== undefined) {
        var msg = ToString(message);
        if (isAbrupt(msg = ifAbrupt(msg))) return msg;
        var msgDesc = {
            value: msg,
            writable: true,
            enumerable: false,
            configurable: true
        };
        var status = DefineOwnPropertyOrThrow(O, "message", msgDesc);
        if (isAbrupt(status)) return status;
    }

    CreateDataProperty(O, "stack", stringifyErrorStack());
    setInternalSlot(O, "toString", function () { return "[object Error]"; });
    return O;
});

setInternalSlot(ErrorConstructor, SLOTS.CONSTRUCT, function (argList) {
    var F = this;
    var argumentsList = argList;
    return OrdinaryConstruct(F, argumentsList);
});

DefineOwnProperty(ErrorConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var F = thisArg;
        var obj = OrdinaryCreateFromConstructor(F, "%ErrorPrototype%", {
            "ErrorData": undefined
        });
        return obj;
    }),
    writable: false,
    configurable: false,
    enumerable: false
});

DefineOwnProperty(ErrorPrototype, "toString", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT) return newTypeError( "Error.prototype.toString: O is not an object.");
        var name = Get(O, "name");
        if (isAbrupt(name)) return name;
        name = ifAbrupt(name);
        var msg = Get(O, "message");
        if (isAbrupt(msg)) return msg;
        msg = ifAbrupt(msg);
        if (msg === undefined) msg = "";
        else msg = ToString(msg);
        if (name === "") return msg;
        if (msg === "") return name;
        return name + ": " + msg;
    }),
    writable: false,
    configurable: false,
    enumerable: false

});

function createNativeError(nativeType, ctor, proto) {
    var name = nativeType + "Error";
    var intrProtoName = "%" + nativeType + "ErrorPrototype%";
    //SetFunctionName(ctor, name);
    setInternalSlot(ctor, SLOTS.CALL, function (thisArg, argList) {
        var func = this;
        var O = thisArg;
        var message = argList[0];
        if (Type(O) !== OBJECT ||
            (Type(O) === OBJECT && getInternalSlot(O, "ErrorData") == undefined)) {
            O = OrdinaryCreateFromConstructor(func, intrProtoName);
            if (isAbrupt(O)) return O;
            O = ifAbrupt(O);
        }
        if (Type(O) !== OBJECT) return withError("Assert: NativeError: O is an object: failed");
        setInternalSlot(O, "ErrorData", name);
        if (message !== undefined) {
            var msg = ToString(message);
            var msgDesc = {
                value: msg,
                writable: true,
                enumerable: false,
                configurable: true
            };
            var status = DefineOwnPropertyOrThrow(O, "message", msgDesc);
            if (isAbrupt(status)) return status;
        }

        CreateDataProperty(O, "stack", stringifyErrorStack());

        // interne representation
        setInternalSlot(O, "toString", function () {
            return "[object "+name+"]";
        });
        return O;

    });

    setInternalSlot(ctor, SLOTS.CONSTRUCT, function (thisArg, argList) {
        var F = ctor;
        var argumentsList = argList;
        return OrdinaryCreateFromConstructor(F, argumentsList);
    });

    DefineOwnProperty(ctor, "length", {
        value: 1,
        enumerable: false,
        configurable: false,
        writable: false
    });
    DefineOwnProperty(ctor, $$create, {
        value: CreateBuiltinFunction(realm, function (thisArg, argList) {
            var F = thisArg;
            var obj = OrdinaryCreateFromConstructor(F, intrProtoName);
            return obj;
        }),
        enumerable: false,
        configurable: false,
        writable: false
    });

    LazyDefineBuiltinConstant(ctor, "prototype", proto);
    LazyDefineBuiltinConstant(proto, "constructor", ctor);
    LazyDefineBuiltinConstant(proto, "name", name);
    LazyDefineBuiltinConstant(proto, "message", "");
    MakeConstructor(ctor, false, proto);
}

// ===========================================================================================================
// SyntaxError, TypeError, ReferenceError, URIError, RangeError, EvalError
// ===========================================================================================================

createNativeError("Syntax", SyntaxErrorConstructor, SyntaxErrorPrototype);
createNativeError("Type", TypeErrorConstructor, TypeErrorPrototype);
createNativeError("Reference", ReferenceErrorConstructor, ReferenceErrorPrototype);
createNativeError("Range", RangeErrorConstructor, RangeErrorPrototype);
createNativeError("URI", URIErrorConstructor, URIErrorPrototype);
createNativeError("Eval", EvalErrorConstructor, EvalErrorPrototype);

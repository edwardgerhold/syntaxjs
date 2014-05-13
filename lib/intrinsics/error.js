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
        (!hasInternalSlot(O, SLOTS.ERRORDATA) || (getInternalSlot(O, SLOTS.ERRORDATA) === undefined)))) {
        O = OrdinaryCreateFromConstructor(func, INTRINSICS.ERRORPROTOTYPE, [
            SLOTS.ERRORDATA
        ]);
        if (isAbrupt(O = ifAbrupt(O))) return O;
    }
    // or i read it wrong
    Assert(Type(O) === OBJECT);
    setInternalSlot(O, SLOTS.ERRORDATA, "Error");
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
        var obj = OrdinaryCreateFromConstructor(F, INTRINSICS.ERRORPROTOTYPE, [
            SLOTS.ERRORDATA
    ]);
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
    //var name = nativeType + "Error";
    // var intrProtoName = "%" + nativeType + "ErrorPrototype%";
    var name;
    var intrProtoName;
    switch(nativeType) {
        case "URI": name = "URIError"; intrProtoName = INTRINSICS.URIERROR; break;
        case "Range": name = "RangeError"; intrProtoName = INTRINSICS.RANGEERROR; break;
        case "Type": name = "TypeError"; intrProtoName = INTRINSICS.TYPEERROR; break;
        case "Reference": name = "ReferenceError"; intrProtoName = INTRINSICS.REFERENCEERROR; break;
        case "Syntax": name = "SyntaxError"; intrProtoName = INTRINSICS.SYNTAXERROR; break;
        case "Eval": name = "EvalError"; intrProtoName = INTRINSICS.EVALERROR; break;
    }

    //SetFunctionName(ctor, name);
    setInternalSlot(ctor, SLOTS.CALL, function (thisArg, argList) {
        var func = this;
        var O = thisArg;
        var message = argList[0];
        if (Type(O) !== OBJECT ||
            (Type(O) === OBJECT && getInternalSlot(O, SLOTS.ERRORDATA) == undefined)) {
            O = OrdinaryCreateFromConstructor(func, intrProtoName);
            if (isAbrupt(O=ifAbrupt(O))) return O;
        }
        if (Type(O) !== OBJECT) return newTypeError(format("S_NOT_OBJECT", "O"));
        setInternalSlot(O, SLOTS.ERRORDATA, name);
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
        var cx = getContext();
        if (cx && cx.line != undefined) {
            var lineNumber = cx.line;
            var columnNumber = cx.column;
            CreateDataProperty(O, "lineNumber", lineNumber);
            CreateDataProperty(O, "columnNumber", columnNumber);
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

/**
 * Created by root on 17.05.14.
 * Created by root on 17.05.14.
 */
var PrintFunction_call = function (thisArg, argList) {
    var str = "";
    var j = argList.length - 1;
    if (j === 0) str = argList[0];
    else {
        for (var i = 0; i < j; i++) {
            str += argList[i] + " ";
        }
        str += argList[j];
    }
    if (hasConsole) console.log(str);
    else if (hasPrint) print(str);
    return NormalCompletion(undefined);
};
var DebugFunction_call = function (thisArg, argList) {

    var TAB = "\t";
    var O = argList[0];
    var type = Type(O);

    console.log("Type() results in " + type);

    function printProps(name) {
        var desc = this[name];
        console.log(TAB + TAB + name + ": (" + Type(desc.value) + ") " + (desc.enumerable ? "e" : "-") + "" + (desc.configurable ? "c" : "-") + "" + (desc.writable ? "w" : "-"));
    }

    if (type == OBJECT) {

        var isCallable = IsCallable(O);

        if (!isCallable) {
            var toString = Invoke(O, "toString", []);
            if (isAbrupt(toString = ifAbrupt(toString))) return toString;
        } else {
            var funcName = Get(O, "name");
            console.log("[object Function]: " + funcName);
        }
        console.log(toString);
        console.log("{");

        var bindings = getInternalSlot(O, SLOTS.BINDINGS);
        var symbols = getInternalSlot(O, SLOTS.SYMBOLS);
        var isExtensible = getInternalSlot(O, SLOTS.EXTENSIBLE);
        var proto = GetPrototypeOf(O);
        var prototypeInfo;

        if (proto == null) prototypeInfo = "null";
        else prototypeInfo = Invoke(proto, "toString", []);
        if (isAbrupt(prototypeInfo = ifAbrupt(prototypeInfo))) return prototypeInfo;

        console.log(TAB + "[[Prototype]]: " + prototypeInfo);
        console.log(TAB + "[[Extensible]]: " + isExtensible);

        console.log(TAB + "[[Bindings]]:");
        var printer = printProps.bind(bindings);
        Object.keys(bindings).forEach(printer);

        console.log(TAB + "[[Symbols]]:");
        printer = printProps.bind(symbols);
        Object.keys(symbols).forEach(printer);

        if (IsCallable(O)) {
            var strict = getInternalSlot(O, SLOTS.STRICT);
            console.log(TAB + "[[Strict]]:" + strict);

            var thisMode = getInternalSlot(O, SLOTS.THISMODE);
            console.log(TAB + "[[ThisMode]]: " + thisMode);

            var formals = getInternalSlot(O, SLOTS.FORMALPARAMETERS);
            console.log(TAB + "[[FormalParameters]]:");
            console.log(formals.join(","));

            console.log(TAB + "[[Code]]:");

            var code = getInternalSlot(O, SLOTS.CODE);
            console.log(JSON.stringify(code, null, 4));
        }

        console.log("}");

        return NormalCompletion();
    }

    if (type == NUMBER) {
        console.log("Number");
        console.log("binary (base 2): " + O.toString(2));
        console.log("decimal (base 10): " + O.toString(10));
        console.log("hex (base 16): " + O.toString(16));

    } else if (type == STRING) {
        var len = O.length;
        console.log("String");
        console.log("value: " + O);
        console.log("length: " + len);

    } else if (type == SYMBOL) {
        console.log("Symbol");
        var descr = getInternalSlot(O, SLOTS.DESCRIPTION);
        console.log("[[Description]]: " + descr);
    } else if (type == BOOLEAN) {
        console.log("Boolean");
        console.log("value: " + !!O);
    } else if (type === NULL) {
        console.log("it´s null");
    } else if (type === UNDEFINED) {
        console.log("it´s undefined");
    }
    return NormalCompletion();
}
var LoadFunction_call = function (thisArg, argList) {
    var file = argList[0];
    try {
        var data = loaderAdapter(file);
    } catch (ex) {
        return newTypeError("loaderAdaper fails with a " + ex.name + ": " + ex.message + "\n" + ex.stack)
    }
    return data;
};
var RequestFunction_call = function (thisArg, argList) {
    if (detector.isNode) {

    } else if (detector.isWorker || detector.isBrowser) {

    }
};


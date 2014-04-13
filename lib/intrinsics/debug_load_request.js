/**
 *
 * debug(val) is some util.inspect() with now just less styling
 *
 *
 */

setInternalSlot(DebugFunction, "Call", function debugfunc (thisArg, argList)  {

    var TAB = "\t";
    var O = argList[0];
    var type = Type(O);

    console.log("Type() results in " + type);

    function printProps(name) {
        var desc = this[name];
        console.log(TAB+TAB+name+": ("+Type(desc.value)+") "+(desc.enumerable?"e":"-")+""+(desc.configurable?"c":"-")+""+(desc.writable?"w":"-"));
    }

    if (type == "object") {
        var isCallable = IsCallable(O);

        if (!isCallable)  {
            var toString = Invoke(O, "toString", []);
            if (isAbrupt(toString=ifAbrupt(toString))) return toString;
        } else {
            var funcName = Get(O, "name");
            console.log("[object Function]: "+funcName);
        }
        console.log(toString);
        console.log("{");

        var bindings = getInternalSlot(O, "Bindings");
        var symbols = getInternalSlot(O, "Symbols");
        var isExtensible = getInternalSlot(O, "Extensible");
        var proto = GetPrototypeOf(O);
        var prototypeInfo;

        if (proto == null) prototypeInfo = "null";
        else prototypeInfo = Invoke(proto, "toString", []);
        if (isAbrupt(prototypeInfo=ifAbrupt(prototypeInfo))) return prototypeInfo;

        console.log(TAB+"[[Prototype]]: " + prototypeInfo);
        console.log(TAB+"[[Extensible]]: " +isExtensible);

        console.log(TAB+"[[Bindings]]:");
        Object.keys(bindings).forEach(printProps.bind(bindings));

        console.log(TAB+"[[Symbols]]");
        Object.keys(symbols).forEach(printProps.bind(symbols));

        if (IsCallable(O)) {
            var strict = getInternalSlot(O, "Strict");
            console.log(TAB+"[[Strict]]:" + strict);

            var thisMode = getInternalSlot(O, "ThisMode");
            console.log(TAB+"[[ThisMode]]: "+thisMode);

            var formals = getInternalSlot(O, "FormalParameters");
            console.log(TAB+"[[FormalParameters]]:");
            console.log(formals.join(","));

            console.log(TAB+"[[Code]]:");

            var code = getInternalSlot(O, "Code");
            console.log(JSON.stringify(code, null, 4));
        }

        console.log("}");

        return NormalCompletion();
    }

    if (type == "number") {
        console.log("Number");
        console.log("binary (base 2): "+O.toString(2));
        console.log("decimal (base 10): "+O.toString(10));
        console.log("hex (base 16): "+O.toString(16));

    } else if (type == "string") {
        var len = O.length;
        console.log("String");
        console.log("value: "+O);
        console.log("length: "+len);

    } else if (type == "symbol") {
        console.log("Symbol");
        var descr = getInternalSlot(O, "Description");
        console.log("[[Description]]: " +descr);
    } else if (type == "boolean") {
        console.log("Boolean");
        console.log("value: "+!!O);
    }


    return NormalCompletion();

});
/**
 *
 *  load(file);
 *
 *
 */
var loaderAdapter = require("filesystem").makeAdapter({
    test: {
        "node": typeof process === "object" && typeof window === "undefined",
        "browser": typeof window === "object" && typeof XMLHttpRequest === "function",
        "worker": typeof window == "undefined" && typeof importScripts === "function" && typeof XMLHttpRequest === "function",
        "sm": typeof load === "function" && typeof print === "function"
    },
    work: (function () {
        function xmlHTTPrequest(file) {
            var xhr;
            try {
                xhr = new XMLHttpRequest();
                xhr.open("GET", file, false);
                xhr.send(null);
                return xhr.responseText;
            } catch (ex) {
                return withError("Type", "can not xml http request " + file);
            }
        }

        return {
            "node": function (file) {
                var data;
                var fs = module.require("fs");
                try {
                    data = fs.readFileSync(file, "utf8");
                } catch (ex) {
                    return withError("Type", "fs.readFileSync threw a "+ex.name+" exception "+ ex.message+"\n"+ (ex.stack&&ex.stack.toString()));
                }
                return data;
            },
            "browser": xmlHTTPrequest,
            "worker": xmlHTTPrequest,
            "sm": function (file) {
                return load(file)
            }
        };


    }())

});

setInternalSlot(LoadFunction, "Call", function load(thisArg, argList) {
    var file = argList[0];
    try {
        var data = loaderAdapter(file);
    } catch (ex) {
        return withError("Type", "loaderAdaper fails with a " + ex.name + ": " + ex.message + "\n" + ex.stack)
    }
    return data;
});

/**
 *
 * request
 *
 *
 *
 *
 */

    setInternalSlot(RequestFunction, "Call", function request(thisArg, argList) {
        var url = argList[0];
        var d, p;
        if (isWindow()) {

            var handler = CreateBuiltinFunction(realm, function handler(thisArg, argList) {
                var resolve = argList[0];
                var reject = argList[1];
            });

            d = OrdinaryConstruct(PromiseConstructor, [handler]);

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function (e) {
                if (xhr.status !== 200 || xhr.status === 301) {}
            };

            xhr.send();

            return xhr.responseText;

        } else if (isNode()) {

        } else if (isWorker()) {

        } else {
            return withError("Type", "Unknown architecture. Request function not available.");
        }
    });

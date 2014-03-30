
setInternalSlot(LoadFunction, "Call", function load(thisArg, argList) {
    var file = argList[0];
    var fs, xhr, data;
    if (isWindow()) {
        try {
            xhr = new XMLHttpRequest();
            xhr.open("GET", file, false);
            xhr.send(null);
            return xhr.responseText;
        } catch (ex) {
            return withError("Type", "can not xml http request " + file);
        }
    } else if (isNode()) {
        fs = syntaxjs._nativeModule.require("fs");
        try {
            data = fs.readFileSync(file, "utf8");
            return data;
        } catch (ex) {
            return withError("Type", "fs.readFileSync threw an exception");
        }
    } else if (isWorker()) {
        try {
            xhr = new XMLHttpRequest();
            xhr.open("GET", file, false);
            xhr.send(null);
            return xhr.responseText;
        } catch (ex) {
            return withError("Type", "can not xml http request " + file);
        }
    } else {
        return withError("Type", "Unknown architecture. Load function not available.");
    }
});

setInternalSlot(RequestFunction, "Call", function request(thisArg, argList) {
    var url = argList[0];
    var d, p;
    if (isWindow()) {

        var handler = CreateBuiltinFunction(realm, function handler(thisArg, argList) {
            var resolve = argList[0];
            var reject = argList[1];
        })

        d = OrdinaryConstruct(PromiseConstructor, [handler]);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function (e) {
            if (xhr.status !== 200 || xhr.status === 301) {}
        };

        xhr.send();

        return xhr.responseText;
        return d;
    } else if (isNode()) {

    } else if (isWorker()) {

    } else {
        return withError("Type", "Unknown architecture. Request function not available.");
    }
});

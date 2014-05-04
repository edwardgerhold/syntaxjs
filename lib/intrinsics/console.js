// ===========================================================================================================
// Console (add-on, with console.log);
// ===========================================================================================================

LazyDefineBuiltinConstant(ConsoleObject, $$toStringTag, "Console");

DefineOwnProperty(ConsoleObject, "log", {
    value: CreateBuiltinFunction(realm, function log(thisArg, argList) {
        console.log.apply(console, argList);
    }),
    writable: true,
    enumerable: false,
    configurable: true

});
DefineOwnProperty(ConsoleObject, "dir", {
    value: CreateBuiltinFunction(realm, function dir(thisArg, argList) {
        console.dir.apply(console, argList);
    }),
    writable: true,
    enumerable: false,
    configurable: true

});

DefineOwnProperty(ConsoleObject, "error", {
    value: CreateBuiltinFunction(realm, function error(thisArg, argList) {
        console.error.apply(console, argList);
    }),
    writable: true,
    enumerable: false,
    configurable: true

});
DefineOwnProperty(ConsoleObject, "html", {
    value: CreateBuiltinFunction(realm, function html(thisArg, argList) {
        var selector = argList[0];
        var html = "";
        if (Type(selector) !== STRING) return newTypeError( "First argument of console.html should be a valid css selector string.");
        if (typeof document !== "undefined") {
            var element = document.querySelector(selector);
        } else {
            if (typeof process !== "undefined") {
                console.log.apply(console, argList.slice(1));
            } else
                return newReferenceError( "Can not select element. document.querySelector is not supported in the current environment.");
        }
        if (element) {
            html += argList[1];
            for (var i = 2, j = argList.length; i < j; i++) {
                html += ", " + argList[i];
            }
            html += "<br>\n";
        } else {
            return newReferenceError( "document.querySelector could not find the element " + selector);
        }
        element.innerHTML += html;
        return NormalCompletion(undefined);
    }),
    writable: true,
    enumerable: false,
    configurable: true
});

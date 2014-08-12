var ConsoleObject_log = function log(thisArg, argList) {
    if (hasConsole) console.log.apply(console, argList);
};
var ConsoleObject_dir = function dir(thisArg, argList) {
    if (hasConsole) console.dir.apply(console, argList);
};
var ConsoleObject_error = function error(thisArg, argList) {
    if (hasConsole) console.error.apply(console, argList);
};
var ConsoleObject_html = function html(thisArg, argList) {
    var selector = argList[0];
    var html = "";
    if (Type(selector) !== STRING) return newTypeError("First argument of console.html should be a valid css selector string.");
    if (typeof document !== "undefined") {
        var element = document.querySelector(selector);
    } else {
        if (typeof process !== "undefined") {
            if (hasConsole) console.log.apply(console, argList.slice(1));
        } else {
            return newReferenceError("Can not select element. document.querySelector is not supported in the current environment.");
        }
    }
    if (element) {
        html += argList[1];
        for (var i = 2, j = argList.length; i < j; i++) {
            html += ", " + argList[i];
        }
        html += "<br>\n";
    } else {
        return newReferenceError("document.querySelector could not find the element " + selector);
    }
    element.innerHTML += html;
    return NormalCompletion(undefined);
};
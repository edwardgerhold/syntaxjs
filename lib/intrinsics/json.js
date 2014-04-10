// ===========================================================================================================
// JSON
// ===========================================================================================================

function Str(key, holder, _state) {
    var replacer = _state.ReplaceFunction;
    var stack = _state.stack;
    var indent = _state.indent;
    var gap = _state.gap;

    var value = Get(holder, key);
    if (isAbrupt(value = ifAbrupt(value))) return value;
    if (Type(value) === "object") {
        var toJSON = Get(value, "toJSON");
        if (IsCallable(toJSON)) {
            value = callInternalSlot("Call", toJSON, value, [key]);
        }
    }
    if (IsCallable(replacer)) {
        value = callInternalSlot("Call", replacer, holder, [key, value]);
    }
    if (Type(value) === "object") {

        if (hasInternalSlot(value, "NumberData")) {
            value = ToNumber(value);
        } else if (hasInternalSlot(value, "StringData")) {
            value = ToString(value);
        } else if (hasInternalSlot(value, "BooleanData")) {
            value = ToBoolean(value);
        }

    }
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    if (Type(value) === "string") return Quote(value);
    if (Type(value) === "number") {
        if (value <= Math.pow(2, 53) - 1) return ToString(value);
        else return "null";
    }
    if (Type(value) === "object" && !IsCallable(value)) {
        if (value instanceof ArrayExoticObject) return JA(value, _state);
        else return JO(value, _state);
    }
    return undefined;
}

function Quote(value) {
    var ch, la;
    var product = "\"";
    for (var i = 0, j = value.length; i < j; i++) {
        ch = value[i];
        la = value[i + 1];
        product += ch;
    }
    return product + "\"";
}

function JA(value, _state) {
    var replacer = _state.ReplacerFunction;
    var stack = _state.stack;
    var indent = _state.indent;
    var gap = _state.gap;
    var PropertyList = _state.PropertyList;
    if (stack.indexOf(value) > -1) {
        return withError("Type", "Because the structure is cyclical!");
    }

    stack.push(value);
    var stepback = indent;
    var len = Get(value, "length");
    var index = 0;
    var partial = [];

    while (index < len) {
        var strP = Str(ToString(index), value, _state);
        if (isAbrupt(strP = ifAbrupt(strP))) return strP;
        if (strP == undefined) {
            partial.push("null");
        } else {
            partial.push(strP);
        }
        index = index + 1;
    }
    var final = "";
    var properties;
    if (!partial.length) {
        final = "{}";
    } else {
        if (gap === "") {
            properties = partial.join(",");
            final = "[" + properties + "]";
        } else {
            var separator = ",\u000A" + indent;
            properties = partial.join(separator);
            final = "[\u000A" + indent + properties + "\u000A" + stepback + "]";
        }
    }
    stack.pop();
    _state.indent = stepback;
    return final;
}

function JO(value, _state) {
    var replacer = _state.ReplacerFunction;
    var stack = _state.stack;
    var indent = _state.indent;
    var gap = _state.gap;
    var PropertyList = _state.PropertyList;
    if (stack.indexOf(value) > -1) {
        return withError("Type", "Because the structure is cyclical!");
    }

    stack.push(value);
    var stepback = indent;
    var K;

    if (PropertyList && PropertyList.length) {
        K = MakeListIterator(PropertyList);
    } else {
        K = OwnPropertyKeys(value);
    }

    var partial = [];
    var done, nextResult, P;

    while (!done) {
        nextResult = IteratorNext(K);
        if (isAbrupt(nextResult = ifAbrupt(nextResult))) return nextResult;
        P = IteratorValue(nextResult);
        if (isAbrupt(P = ifAbrupt(P))) return P;
        var strP = Str(P, value, _state);
        if (isAbrupt(strP = ifAbrupt(strP))) return strP;
        if (strP !== undefined) {
            var member = Quote(P);
            member = member + ":";
            if (gap != "") {
                member = member + " ";
            }
            member = member + strP;
            partial.push(member);
        }
        done = IteratorComplete(nextResult);
    }
    var final = "";
    var properties;
    if (!partial.length) {
        final = "{}";
    } else {
        if (gap === "") {
            properties = partial.join(",");
            final = "{" + properties + "}";
        } else {
            var separator = ",\u000A" + indent;
            properties = partial.join(separator);
            final = "{\u000A" + indent + properties + "\u000A" + stepback + "}";
        }
    }
    stack.pop();
    _state.indent = stepback;
    return final;
}

function Walk(holder, name) {
    var val = Get(holder, name);
    var done;
    var nextResult;
    var nextValue;
    var status;
    var newElement;
    if (isAbrupt(val = ifAbrupt(val))) return val;
    if (Type(val) === "object") {
        if (val instanceof ArrayExoticObject) {
            var I = 0;
            var len = Get(val, "length");
            if (isAbrupt(len = ifAbrupt(len))) return len;
            while (I < len) {
                newElement = Walk(val, ToString(I));
                if (newElement === undefined) {
                    status = Delete(val, P);
                } else {
                    status = val.DefineOwnProperty(ToString(I), {
                        value: newElement,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                if (isAbrupt(status = ifAbrupt(status))) return status;
                I = I + 1;
            }
        } else {
            var keys = OwnPropertyKeys(val);
            while (!done) {
                var nextResult = IteratorNext(keys);
                if (isAbrupt(nextResult = ifAbrupt(nextResult))) return nextResult;
                var P = IteratorResult(nextResult);
                newElement = Walk(val, P);
                if (newElement === undefined) {
                    status = Delete(val, P);
                } else {
                    status = val.DefineOwnProperty(P, {
                        value: newElement,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                if (isAbrupt(status = ifAbrupt(status))) return status;
                done = IteratorComplete(nextResult);
            }
        }
    }
    return callInternalSlot("Call",reviver, holder, [name, val]);
}

DefineOwnProperty(JSONObject, "parse", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var text = GetValue(argList[0]);
        var reviver = argList[1];
        var JText = ToString(text);

        var tree = parseGoal("JSONText", text);

        if (isAbrupt(tree = ifAbrupt(tree))) return tree;

        var scriptText = parseGoal("ParenthesizedExpression", text);
        var exprRef = require("runtime").Evaluate(scriptText);
        if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;

        var unfiltered = GetValue(exprRef);
        if (IsCallable(reviver) === true) {
            var cx = getContext();
            var proto = Get(getIntrinsics(), "%ObjectPrototype%");
            var root = ObjectCreate(proto);
            CreateDataProperty(root, "", unfiltered);
            return Walk(root, "");
        }

        return unfiltered;
    }, 2),
    enumerable: false,
    configurable: false,
    writable: false
});
DefineOwnProperty(JSONObject, "stringify", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var value = argList[0];
        var replacer = argList[1];
        var space = argList[2];
        var stack = [];
        var indent = "";
        var ReplacerFunction, PropertyList = []; // slow arrays
        var _state = {
            stack: stack,
            indent: indent,
            ReplacerFunction: undefined,
            PropertyList: undefined
        };
        var gap, i;
        if (Type(replacer) === "object") {
            if (IsCallable(replacer)) {
                _state.ReplacerFunction = ReplacerFunction = replacer;
            } else if (replacer instanceof ArrayExoticObject) {
                var len = Get(replacer, "length");
                var item, v;
                for (i = 0; i < len; i++) {
                    item = undefined;
                    v = Get(replacer, ToString(i));
                    if (Type(v) === "string") item = v;
                    else if (Type(v) === "number") item = ToString(v);
                    else if (Type(v) === "object") {
                        if (hasInternalSlot(v, "NumberData") || hasInternalSlot(v, "StringData")) item = ToString(v);
                        if (item != undefined && PropertyList.indexOf(item) < 0) {
                            _state.PropertyList = PropertyList;
                            PropertyList.push(item);
                        }
                    }
                }
            }
        }
        if (Type(space) === "object") {
            if (hasInternalSlot(space, "NumberData")) space = ToNumber(space);
            else if (hasInternalSlot(space, "StringData")) space = ToString(space);
        }
        if (Type(space) === "number") {
            space = min(10, ToInteger(space));
            gap = "";
            for (i = 0; i < space; i++) {
                gap += " ";
            }
        } else if (Type(space) === "string") {
            if (space.length < 11) gap = space;
            else {
                for (i = 0; i < 10; i++) {
                    gap += space[i];
                }
            }
        } else gap = "";
        var cx = getContext();
        var proto = Get(getIntrinsics(), "%ObjectPrototype%");
        var wrapper = ObjectCreate(proto);
        CreateDataProperty(wrapper, "", value);
        return Str("", wrapper, _state);
    }),
    enumerable: false,
    configurable: false,
    writable: false
});
DefineOwnProperty(JSONObject, $$toStringTag, {
    value: "JSON",
    enumerable: false,
    configurable: false,
    writable: false
});

setInternalSlot(JSONObject, "Prototype", ObjectPrototype);
setInternalSlot(JSONObject, "JSONTag", true);

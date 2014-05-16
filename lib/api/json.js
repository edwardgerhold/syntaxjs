/**
 * Created by root on 16.05.14.
 */

function Str(key, holder, _state) {
    var replacer = _state.ReplaceFunction;
    var value = Get(holder, key);
    if (isAbrupt(value=ifAbrupt(value))) return value;
    if (Type(value) === OBJECT) {
        var toJSON = Get(value, "toJSON");
        if (IsCallable(toJSON)) {
            value = callInternalSlot(SLOTS.CALL, toJSON, value, [key]);
        }
    }
    if (IsCallable(replacer)) {
        value = callInternalSlot(SLOTS.CALL, replacer, holder, [key, value]);
    }
    if (Type(value) === OBJECT) {
        if (hasInternalSlot(value, SLOTS.NUMBERDATA)) {
            value = ToNumber(value);
        } else if (hasInternalSlot(value, SLOTS.STRINGDATA)) {
            value = ToString(value);
        } else if (hasInternalSlot(value, SLOTS.BOOLEANDATA)) {
            value = ToBoolean(value);
        }
    }
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    if (Type(value) === STRING) return Quote(value);
    if (Type(value) === NUMBER) {
        if (value <= Math.pow(2, 53) - 1) return ToString(value);
        else return "null";
    }
    if (Type(value) === OBJECT && !IsCallable(value)) {
        if (IsArray(value)) return JA(value, _state);
        return JO(value, _state);
    }
    return undefined;
}

function Quote(value) {
    var ch;
    var product = "\"";
    for (var i = 0, j = value.length; i < j; i++) {
        ch = value[i];
        product += ch;
    }
    return product + "\"";
}

function JA(value, _state) {
    var stack = _state.stack;
    var indent = _state.indent;
    var gap = _state.gap;
    if (stack.indexOf(value) > -1) {
        return newTypeError( "Because the structure is cyclical!");
    }
    stack.push(value);
    var stepback = indent;
    var len = Get(value, "length");
    if (isAbrupt(len=ifAbrupt(len))) return len;
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
        final = "[]";
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
    var stack = _state.stack;
    var indent = _state.indent;
    var gap = _state.gap;
    var PropertyList = _state.PropertyList;
    if (stack.indexOf(value) > -1) {
        return newTypeError( "Because the structure is cyclical!");
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

function Walk(holder, name, reviver) {
    var val = Get(holder, name);
    var done;
    var status;
    var newElement;
    if (isAbrupt(val = ifAbrupt(val))) return val;
    if (Type(val) === OBJECT) {

        if (IsArray(val)) {
            var I = 0;
            var len = Get(val, "length");
            if (isAbrupt(len = ifAbrupt(len))) return len;
            while (I < len) {
                newElement = Walk(val, ToString(I));
                if (newElement === undefined) {
                    status = Delete(val, I);
                } else {
                    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, val, ToString(I), {
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
                if (isAbrupt(P=ifAbrupt(P))) return P;
                newElement = Walk(val, P);
                if (newElement === undefined) {
                    status = Delete(val, P);
                } else {
                    status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, val, P, {
                        value: newElement,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                if (isAbrupt(status = ifAbrupt(status))) return status;
                done = IteratorComplete(nextResult);
                if (isAbrupt(done=ifAbrupt(done))) return done;
            }
        }
    }
    return callInternalSlot(SLOTS.CALL, reviver, holder, [name, val]);
}


var JSONObject_parse = function (thisArg, argList) {
    var text = argList[0];
    var reviver = argList[1];
    var JText = ToString(text);
    var tree = parseGoal("JSONText", JText /* , "JSONparse" */);
    if (isAbrupt(tree = ifAbrupt(tree))) return tree;
    var scriptText = parseGoal("ParenthesizedExpression", JText);
    var exprRef = require("runtime").Evaluate(scriptText);
    var unfiltered = GetValue(exprRef);
    if (isAbrupt(unfiltered = ifAbrupt(unfiltered))) return unfiltered;
    if (IsCallable(reviver) === true) {
        var proto = getIntrinsic(INTRINSICS.OBJECTPROTOTYPE);
        var root = ObjectCreate(proto);
        CreateDataProperty(root, "", unfiltered);
        return Walk(root, "", reviver);
    }
    return NormalCompletion(unfiltered);
};

var JSONObject_stringify = function (thisArg, argList) {
    var value = argList[0];
    var replacer = argList[1];
    var space = argList[2];
    var stack = [];
    var indent = "";
    var ReplacerFunction, PropertyList = [];
    var _state = {
        stack: stack,
        indent: indent,
        ReplacerFunction: undefined,
        PropertyList: undefined
    };
    var gap = "", i;
    if (Type(replacer) === OBJECT) {
        if (IsCallable(replacer)) {
            _state.ReplacerFunction = ReplacerFunction = replacer;
        } else if (IsArray(replacer)) {
            var len = Get(replacer, "length");
            if (isAbrupt(len=ifAbrupt(len))) return len;
            var item, v;
            for (i = 0; i < len; i++) {
                item = undefined;
                v = Get(replacer, ToString(i));
                if (isAbrupt(v=ifAbrupt(v))) return v;
                if (Type(v) === STRING) item = v;
                else if (Type(v) === NUMBER) item = ToString(v);
                else if (Type(v) === OBJECT) {
                    if (hasInternalSlot(v, SLOTS.NUMBERDATA) || hasInternalSlot(v, SLOTS.STRINGDATA)) item = ToString(v);

                    if (item != undefined && PropertyList.indexOf(item) < 0) {
                        _state.PropertyList = PropertyList;
                        PropertyList.push(item);
                    }
                }
            }
        }
    }
    if (Type(space) === OBJECT) {
        if (hasInternalSlot(space, SLOTS.NUMBERDATA)) space = ToNumber(space);
        else if (hasInternalSlot(space, SLOTS.STRINGDATA)) space = ToString(space);
    }
    if (Type(space) === NUMBER) {
        space = min(10, ToInteger(space));
        gap = "";
        for (i = 0; i < space; i++) {
            gap += " ";
        }
    } else if (Type(space) === STRING) {
        if (space.length < 11) gap = space;
        else {
            for (i = 0; i < 10; i++) {
                gap += space[i];
            }
        }
    } else gap = "";
    _state.gap = gap;
    var proto = getIntrinsic(INTRINSICS.OBJECTPROTOTYPE);
    var wrapper = ObjectCreate(proto);
    var status = CreateDataProperty(wrapper, "", value);
    if (isAbrupt(status=ifAbrupt(status))) return status;
    if (status === false) return newTypeError( "status may not be wrong here");
    var result = Str("", wrapper, _state);
    if (isAbrupt(result=ifAbrupt(result))) return result;
    return NormalCompletion(result);
};

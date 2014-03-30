
define("api", function (require, exports, module) {

    "use strict";

    var heap = require("heap");
    var i18n = require("i18n-messages");

    // I had these variables at the beginning, i return to;
    var realm, intrinsics, globalEnv, globalThis;
    var stack, eventQueue, cx;


    // ===========================================================================================================
    // all and empty are special objects
    // ===========================================================================================================

    var all = {
        toString: function () {
            return "[all imports/exports value]";
        }
    };
    var empty = {
        toString: function () {
            return "[empty completion value]";
        }
    };

    exports.all = all;
    exports.empty = empty;

    var statics = require("slower-static-semantics");
    var Contains = statics.Contains;
    var BoundNames = statics.BoundNames;
    var IsSimpleParameterList = statics.IsSimpleParameterList;
    var VarDeclaredNames = statics.VarDeclaredNames;
    var LexicallyDeclaredNames = statics.LexicallyDeclaredNames;
    var dupesInTheTwoLists = statics.dupesInTheTwoLists
    var ExpectedArgumentCount = statics.ExpectedArgumentCount;
    var ModuleRequests = statics.ModuleRequests;

    var parse = require("parser");
    var parseGoal = parse.parseGoal;
    var debugmode = false;

    function debug() {
        if (debugmode && typeof importScripts !== "function") console.log.apply(console, arguments);
    }

    function debug2() {
        if (typeof importScripts !== "function") console.log.apply(console, arguments);
    }


    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }

    // ===========================================================================================================
    // quick getters for realm, env, intrnscs
    // ===========================================================================================================


    exports.getEventQueue = getEventQueue;

    function getContext() {
        var stack = realm.stack;
        return stack[stack.length-1];
    }
    function getEventQueue() {
        return realm.eventQueue;
    }

    function getGlobalThis() {
        //return globalThis;
        return realm.globalThis;
    }

    function getGlobalEnv() {
        //return globalEnv;
        return realm.globalEnv;
    }

    function getIntrinsics() {
        //return intrinsics;
        return realm.intrinsics;
    }

    function getIntrinsic(name) {
        var desc = realm.intrinsics.Bindings[name];
        return desc && desc.value;
    }

    function getIntrinsicFromRealm(name, otherRealm) {
        var desc = otherRealm.intrinsics.Bindings[name];
        return desc && desc.value;
    }

    function getRealm() {
        return realm;
    }

    function getLexEnv() {
        var cx = getContext();
        return cx && cx.LexEnv;
        //    return getGlobalEnv().LexEnv;
    }

    function getVarEnv() {
        var cx = getContext();
        return cx && cx.VarEnv;
        //    return getGlobalEnv().objEnv;
    }


    function getStack() {
        return realm.stack;
    }

    // ===========================================================================================================
    // notes for the encoder 
    // ===========================================================================================================
/*
    var object_types = {
        "1": "[object OrdinaryObject]",
        "2": "[object ArrayExoticObject]",
        "3": "[object OrdinaryFunction]",
        "4": "[object ArgumentsExoticObject]",
        "5": "[object StringExoticObject]",
        "6": "[object ProxyExoticObject]",
        "7": "[object SymbolPrimitiveType]",
        "8": "[object IndegerIndexedExoticObject]"
    };

    function getType(object) {
        return object_types[object[0]] || "[object OrdinaryObject]";
    }
    var type_table = {
        "1": "object",
        "2": "object",
        "3": "object",
        "4": "object",
        "5": "object",
        "6": "object",
        "7": "symbol"
    };
    var internals_encode = {
        // Objects
        "Type": 0,
        "Extensible": 1,
        "Bindings": 2,
        "Symbols": 3,
        "es5id": 4,
        // Functions
        "FunctionKind": 5,
        "Environment": 6,
        "FormalParameters": 7,
        "Code": 8,
        "HomeObject": 9,
        "MethodName": 10,
        // Bound Functions
        "BoundTargetFunction": 11,
        "BoundThis": 12,
        "BoundParameters": 13,
        // Object Wrappers
        "StringData": 14,
        "NumberData": 14,
        "DateValue": 14,
        "JSONTag": 14,
        "MathTag": 14,
        // Generator
        "GeneratorState": 14,
        "GeneratorContext": 15,
        // Maps
        "MapData": 16,
        "MapComparator": 17,
        "__mapSetInternalUniqueKey__": 18,
        // Promises
        "IsPromise": 19,
        // Observe
        "Notifier": 20
    };

    var internals_decode = Object.create(null);
    for (var k in internals_encode) {
        internals_decode[internals_encode[k]] = k;

    }
*/
    exports.Push = Push;
    exports.Length = Length;
    exports.getField = getField;
    exports.setField = setField;
    exports.setRec = setRec;
    exports.getRec = getRec;
    exports.genericArray = genericArray;
    exports.genericRecord = genericRecord;

    function Push(array, data) {
        return array.push(data);
    }
    function Length(array) {
        return array.length;
    }
    function getField(array, index) {
        return array[index];
    }
    function setField(array, index, value) {
        return array[index] = value;
    }
    function getRec(obj, key) {
        return obj[key];
    }
    function setRec(obj, key, value) {
        return obj[key] = value;
    }

    function genericArray(arr) {
        return arr;
    }

    function genericRecord(obj) {
        return obj;
    }


    function compareInternalSlot(O, N, V) {
        var value = getInternalSlot(O, N);
        return value === V;
    }

    function getInternalSlot(O, N) {
        return O[N];
    }

    function setInternalSlot(O, N, V) {
        return O[N] = V;
    }

    function hasInternalSlot(O, N) {
        return N in O;
    }

    function callInternalSlot(name, object, a, b, c, d) {
        return object[name](a,b,c,d);
    }

    //
    // choose right internal function of object (got no polymorphism and auto type detection)
    //

    var function_table = {
        "[object OrdinaryObject]": OrdinaryObject.prototype, // rename to ordinaryobjectfunctions and fix (this) parameter and call in callInternalSlot 
        "[object ArrayExoticObject]": ArrayExoticObject.prototype,
        "[object OrdinaryFunction]": OrdinaryFunction.prototype,
        "[object ArgumentsExoticObject]": ArgumentsExoticObject.prototype,
        "[object StringExoticObject]": StringExoticObject.prototype,
        "[object ProxyExoticObject]": ProxyExoticObject.prototype,
        "[object PromiseExoticObject]": OrdinaryObject.prototype,
        "[object SymbolPrimitiveType]": SymbolPrimitiveType.prototype,
        "[object EddiesDOMObjectWrapper]": ExoticDOMObjectWrapper.prototype,
        "[object EddiesDOMFunctionWrapper]": ExoticDOMFunctionWrapper.prototype,
        "[object IntegerIndexedExoticObject]": IntegerIndexedExoticObject.prototype
    };

    function getFunction(obj, name) {
        var func;
        var proto = function_table[obj.toString()];
        if (proto && (func = proto[name])) return func;
        proto = OrdinaryObject.prototype;
        func = proto[name];
        return func;
    }

    // ===========================================================================================================
    // raw read and write property descriptor (string and symbol assign to bindings/symbol)
    // ===========================================================================================================

    function readPropertyDescriptor(object, name) {
        if (IsSymbol(name)) {
            return object["Symbols"][name.es5id];
        } else {
            return object["Bindings"][name];
        }
        /*if (IsSymbol(name)) {
         return getInternalSlot(getInternalSlot(object, "Symbols"), getInternalSlot(name,"es5id"));
         } else {
         return getInternalSlot(getInternalSlot(object,"Bindings"),name);
         }*/
    }

    exports.writePropertyDescriptor = writePropertyDescriptor;

    function writePropertyDescriptor(object, name, value) {
        if (IsSymbol(name)) {
            return object["Symbols"][name.es5id] = value;
        } else {
            return object["Bindings"][name] = value;
        }
        /*if (IsSymbol(name)) {
         return setInternalSlot(getInternalSlot(object, "Symbols"), getInternalSlot(name,"es5id"),  value);
         } else {
         return setInternalSlot(getInternalSlot(object,"Bindings"), name, value);
         }*/
    }



    // ===========================================================================================================
    // Assert
    // ===========================================================================================================

    function Assert(act, message) {
        var cx, node;
        if (!act) {
            if (cx = getContext()) {
                node = cx.state.node;
            }
            if (node) {
                var loc = node.loc;
                if (loc) {
                    var line = loc.start.line;
                    var col = loc.start.column;
                }
            }
            throw new Error("Assertion failed: " + message + " (at: line " + line + ", column " + col + ")");
        }
    }

    // ===========================================================================================================
    // A List? Unused
    // ===========================================================================================================

    function List() {
        var list = Object.create(List.prototype);
        var sentinel = {};
        sentinel.next = sentinel;
        sentinel.prev = sentinel;
        list.sentinel = sentinel;
        list.size = 0;
        return list;
    }
    List.prototype.insertFirst = function (item) {
        var rec = {
            value: item
        };
        rec.next = this.sentinel;
        rec.prev = this.sentinel.prev;
        this.sentinel.prev.next = rec;
        this.sentinel.prev = rec;
        this.size += 1;
        return this;
    };
    List.prototype.insertLast = function (item) {
        var rec = {
            value: item
        };
        rec.prev = this.sentinel;
        rec.next = this.sentinel.next;
        this.sentinel.next.prev = rec;
        this.sentinel.next = rec;
        this.size += 1;
        return this;
    };
    List.prototype.iterate = function (f) {
        var rec = this.sentinel.next;
        while (rec !== this.sentinel) {
            f(rec.value);
            rec = rec.next;
        }
        return this;
    };
    List.prototype.reverse = function (f) {
        var rec = this.sentinel.prev;
        while (rec !== this.sentinel) {
            f(rec.value);
            rec = rec.prev;
        }
    };
    List.prototype.nth = function (n) {
        var rec, i;
        if (n > this.size - 1 || n < 0) return null;
        if (n < this.size / 2) {
            i = 0;
            rec = this.sentinel;
            do {
                rec = rec.next;
                if (i === n) return rec.value;
                i += 1;
            } while (i <= n);
        } else {
            i = this.size - 1;
            rec = this.sentinel;
            do {
                rec = rec.prev;
                if (i === n) return rec.value;
                i -= 1;
            } while (i >= n);
        }
        return null;
    };
    List.prototype.removeFirst = function () {
        var rec = this.sentinel.next;
        if (rec != this.sentinel) {
            this.sentinel.next = rec.next;
            this.sentinel.next.prev = this.sentinel;
            rec.next = null;
            rec.prev = null;
            this.size -= 1;
            return rec.value;
        }
        return null;
    };
    List.prototype.removeLast = function () {
        var rec = this.sentinel.prev;
        if (rec != this.sentinel) {
            this.sentinel.prev = rec.prev;
            this.sentinel.prev.next = this.sentinel;
            rec.next = null;
            rec.prev = null;
            this.size -= 1;
            return rec.value;
        }
        return null;
    };
    List.prototype.push = List.prototype.insertLast;
    List.prototype.pop = List.prototype.removeLast;
    List.prototype.shift = List.prototype.removeFirst;



//#include "lib/api/coderealm.js";
//#include "lib/api/executioncontext.js";
//#include "lib/api/completionrecord.js";
//#include "lib/api/reference.js";
//#include "lib/api/object.js";
//#include "lib/api/declarativeenvironment.js";
//#include "lib/api/functionenvironment.js";
//#include "lib/api/objectenvironment.js";
//#include "lib/api/globalenvironment.js";
//#include "lib/api/conversions.js";
//#include "lib/api/propertydescriptor.js";
//#include "lib/api/getownproperty.js";
//#include "lib/api/objectmethods.js";
//#include "lib/api/function.js";
//#include "lib/api/supermethods.js";




    function SameValue(x, y) {
        if (isAbrupt(x = ifAbrupt(x))) return x;
        if (isAbrupt(y = ifAbrupt(y))) return y;
        if (Type(x) !== Type(y)) return false;
        if (Type(x) === "null") return true;
        if (Type(x) === "undefined") return true;
        if (Type(x) === "number") {
            if (x === y) return true;
            if (x === "NaN" && y === "NaN") return true;
            if (x === +0 && y === -0) return false;
            if (x === -0 && y === +0) return false;
            return false;
        }
        if (Type(x) === "string") {
            if ((x.length === y.length) && x === y) return true;
            return false;
        }
        if (Type(x) === "boolean") {
            if ((x && y) || (!x && !y)) return true;
            return false;
        }

        if (Type(x) === "symbol") {
            return x === y;
        }

        if (x === y) return true;
        return false;
    }

    function SameValueZero(x, y) {
        if (isAbrupt(x = ifAbrupt(x))) return x;
        if (isAbrupt(y = ifAbrupt(y))) return y;
        if (Type(x) !== Type(y)) return false;
        if (Type(x) === "null") return true;
        if (Type(x) === "undefined") return true;
        if (Type(x) === "number") {
            if (x === y) return true;
            if (x === "NaN" && y === "NaN") return true;
            if (x === +0 && y === -0) return true;
            if (x === -0 && y === +0) return true;
            return false;
        }
        if (Type(x) === "string") {
            if ((x.length === y.length) && x === y) return true;
            return false;
        }
        if (Type(x) === "boolean") {
            if ((x && y) || (!x && !y)) return true;
            return false;
        }

        if (Type(x) === "symbol") {
            return x === y;
        }
        if (x === y) return true;
        return false;
    }



    function CreateArrayFromList(list) {
        var array = ArrayCreate(list.length);
        for (var i = 0, j = list.length; i < j; i++) {
            array.Set(ToString(i), list[i], array);
        }
        return array;
    }

    function CreateListFromArrayLike(arrayLike) {
        var list = [];
        for (var i = 0, j = arrayLike.length; i < j; i++) {
            list.push(arrayLike.Get(ToString(i), arrayLike))
        }
        return list;
    }

    function GetThisEnvironment() {
        var env = getLexEnv();
        do {
            if (env.HasThisBinding()) return env;
        } while (env = env.outer);
    }

    function ThisResolution() {
        var env = GetThisEnvironment();
        return env.GetThisBinding();
    }

    function GetGlobalObject() {
        var realm = getRealm();
        var globalThis = realm.globalThis;
        return globalThis;
    }

    function CreateByteDataBlock(bytes) {
        var dataBlock = new ArrayBuffer(bytes);
        return dataBlock;
    }

    function CopyDataBlockBytes(toBlock, toIndex, fromBlock, fromIndex, count) {
        for (var i = fromIndex, j = fromIndex + count, k = toIndex; i < j; i++, k++) {
            var value = fromBlock[i];
            toBlock[k] = value;
        }
    }


    function CreateListIterator(list) {

    }

    function MakeListIterator(list) {
        var nextPos = 0;
        var len = list.length;

        var listIteratorNext = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var value, done;
            if (nextPos < len) {
                value = list[nextPos];
                nextPos = nextPos + 1;
                done = (nextPos === len);
                return CreateItrResultObject(value, done);
            }
            return CreateItrResultObject(undefined, true);
        });

        var obj = ObjectCreate();
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        CreateDataProperty(obj, "next", listIteratorNext);
        return obj;
    }


    // 
    // Boolean, String, NumberValue
    //    

    function thisBooleanValue(value) {
        if (value instanceof CompletionRecord) return thisBooleanValue(value.value);
        if (typeof value === "boolean") return value;
        if (Type(value) === "boolean") return value;
        if (Type(value) === "object" && hasInternalSlot(value, "BooleanData")) {
            var b = getInternalSlot(value, "BooleanData");
            if (typeof b === "boolean") return b;
        }
        return withError("Type", "thisBooleanValue: value is not a Boolean");
    }

    function thisStringValue(value) {

        if (value instanceof CompletionRecord) return thisStringValue(value.value);
        if (typeof value === "string") return value;
        if (Type(value) === "string") return value;
        if (Type(value) === "object" && hasInternalSlot(value, "StringData")) {
            var b = getInternalSlot(value, "StringData");
            if (typeof b === "string") return b;
        }
        return withError("Type", "thisStringValue: value is not a String");
    }

    function thisNumberValue(value) {
        if (value instanceof CompletionRecord) return thisNumberValue(value.value);
        if (typeof value === "number") return value;
        if (Type(value) === "number") return value;
        if (Type(value) === "object" && hasInternalSlot(value, "NumberData")) {
            var b = getInternalSlot(value, "NumberData");
            if (typeof b === "number") return b;
        }
        return withError("Type", "thisNumberValue: value is not a Number");
    }

    //
    // **Create Functions (ObjectCreate, ProxyCreate, PromiseCreate)
    //


    function ObjectCreate(proto, internalDataList) {
        if (proto === undefined) proto = Get(getIntrinsics(), "%ObjectPrototype%");
        var O = OrdinaryObject(proto);
        if (internalDataList && typeof internalDataList === "object") {
            for (var k in internalDataList) {
                if (Object.hasOwnProperty.call(internalDataList, k)) {
                    O[k] = internalDataList[k];
                }
            }
        }
        return O;
    }

    function StringCreate(StringData) {
        return OrdinaryConstruct(StringConstructor, [StringData]);
    }

    function IntegerIndexedObjectCreate(prototype) {
        var O = IntegerIndexedExoticObject();
        setInternalSlot(O, "Extensible", true);
        setInternalSlot(O, "Prototype", prototype);
        setInternalSlot(O, "hiddenBuffer", undefined);
        return O;
    }

    function CreateArrayIterator(array, kind) {
        var O = ToObject(array);
        var proto = getIntrinsic("%ArrayIteratorPrototype%");
        var iterator = ObjectCreate(proto);
        setInternalSlot(iterator, "IteratedObject", O);
        setInternalSlot(iterator, "ArrayIterationNextIndex", 0);
        setInternalSlot(iterator, "ArrayIterationKind", kind);
        return iterator;
    }

    // ===========================================================================================================
    // More essential methods
    // ===========================================================================================================


    function OrdinaryHasInstance(C, O) {
        var BC, P;

        if (!IsCallable(C)) return false;

        if (BC = getInternalSlot(C, "BoundTargetFunction")) {
            return OrdinaryHasInstance(BC, O);
        }

        if (Type(O) !== "object") return false;

        P = Get(C, "prototype");
        if (isAbrupt(P = ifAbrupt(P))) return P;

        if (Type(P) !== "object") return withError("Type", "OrdinaryHasInstance: P not object");

        while (O = GetPrototypeOf(O)) {
            if (isAbrupt(O = ifAbrupt(O))) return O;
            if (O === null) return false;
            if (SameValue(P, O) === true) return true;
        }
        return false;
    }


    function CheckObjectCoercible(argument) {

        if (argument instanceof CompletionRecord) return CheckObjectCoercible(argument.value);
        else if (argument === undefined) return withError("Type", "CheckObjectCoercible: undefined is not coercible");
        else if (argument === null) return withError("Type", "CheckObjectCoercible: null is not coercible");

        var type = Type(argument);
        switch (type) {
            case "boolean":
            case "number":
            case "string":
            case "symbol":
            case "object":
                return argument;
                break;
            default:
                break;
        }
        return argument;
    }


    function NewDeclarativeEnvironment(E) {
        return DeclarativeEnvironment(E);
    }

    function NewObjectEnvironment(O, E) {
        return ObjectEnvironment(O, E);
    }

    function NewGlobalEnvironment(global) {
        return GlobalEnvironment(global);
    }

    function NewModuleEnvironment(global) {
        return DeclarativeEnvironment(global);
    }


    function NewFunctionEnvironment(F, T) {
        Assert(getInternalSlot(F, "ThisMode") !== "lexical", "NewFunctionEnvironment: ThisMode is lexical");
        var env = FunctionEnvironment(F, T); // ist Lexical Environment and environment record in eins
        env.thisValue = T;
        if (getInternalSlot(F, "NeedsSuper") === true) {
            var home = getInternalSlot(F, "HomeObject");
            if (home === undefined) return withError("Reference", "NewFunctionEnvironment: HomeObject is undefined");
            env.HomeObject = home;
            env.MethodName = getInternalSlot(F, "MethodName");
        } else {
            env.HomeObject = undefined;
        }
        env.outer = getInternalSlot(F, "Environment"); // noch in [[Environment]] umbenennen
        return env;
    }

    function createIdentifierBinding(envRec, N, V, D, W) {
        return (envRec[N] = IdentifierBinding(N, V, D, W));
    }

    function IdentifierBinding(N, V, D, W) {
        var ib = Object.create(null);
        ib.name = N;
        ib.value = V;
        ib.writable = W === undefined ? true : W;
        ib.initialised = false;
        ib.configurable = !!D;
        return ib;
    }

    function GetIdentifierReference(lex, name, strict) {
        if (lex == null) {
            // unresolvable ref.
            return Reference(name, undefined, strict);
        }
        var exists = lex.HasBinding(name);
        var outer;
        if (exists) {
            return Reference(name, lex, strict);
        } else {
            outer = lex.outer;
            return GetIdentifierReference(outer, name, strict);
        }
    }





    // ===========================================================================================================
    // floor, ceil, abs, min, max
    // ===========================================================================================================

    var floor = Math.floor;
    var ceil = Math.ceil;
    var abs = Math.abs;
    var min = Math.min;
    var max = Math.max;

    function _floor(x) {
        return x - (x % 1);
    }

    function _ceil(x) {
        return x - (x % 1) + 1;
    }

    function _abs(x) {
        return x < 0 ? -x : x;
    }

    function sign(x) {
        return x < 0 ? -1 : 1;
    }

    function _min() {
        var min = Infinity;
        var n;
        for (var i = 0, j = arguments.length; i < j; i++)
            if ((n = arguments[i]) < min) min = n;
        return min;
    }

    function _max() {
        var max = -Infinity;
        var n;
        for (var i = 0, j = arguments.length; i < j; i++)
            if ((n = arguments[i]) > max) max = n;
        return max;
    }

    // ===========================================================================================================
    // assign (copies properties)
    // ===========================================================================================================

    function addMissingProperties(target, mixin) {
        for (var k in mixin) {
            if (Object.hasOwnProperty.call(mixin, k)) {
                if (!Object.hasOwnProperty.call(target, k)) Object.defineProperty(target, k, Object.getOwnPropertyDescriptor(mixin, k));
            }
        }
        return target;
    }

    function assign(obj, obj2) {
        for (var k in obj2) {
            obj[k] = obj2[k];
        }
        return obj;
    }

    // ===========================================================================================================
    // Error Stack
    // ===========================================================================================================


    function printException (error) {
        var name = Get(error, "name");
        var message = Get(error, "message");
        var stack = Get(error, "stack");
        var text = makeMyExceptionText(name, message, callstack);
        console.log(text);
    }

    function makeMyExceptionText(name, message, callstack) {
        var text = "\n";
        text += "An [[exception]] has been thrown!\n";
        text += "[name]: "+ name + "\n";
        text += "[message]: " + message + "\n";
        text += "[stack]: " + callstack + "\n";
        return text;
    }




    function stringifyErrorStack(type, message) {
        var callStack = getStack();
        var len = callStack.length || 0;
        var frame = getContext();
        var start = 0;
        var node, ntype, line ,column, pos, fn, clr;
        var stackTraceLimit = realm.xs.stackTraceLimit;
        var url = realm.xs.scriptLocation;
        var cnt = 1;

        if (type === undefined) type = "", message = "", stack = "";
        else {
            if (message === undefined) message = "";
            stack = type+": ";
            stack += message;
            stack += "\r\n";
        }

        if (len > stackTraceLimit) start = len - stackTraceLimit;

        for (pos = len - 1; pos >= start; pos--) {
            if (frame = callStack[pos]) {
                node = frame.state.node;
                ntype = node && node.type;
                line = frame.line;
                column = frame.column;
                fn = frame.callee;
                clr = frame.caller;
                stack += cnt + ". ";
                stack += fn + " at " + ntype + "  at line " + line + ", column " + column + " ";
                stack += "[caller " + clr + " @ "+url+"]";
                stack += "\r\n";
                cnt = cnt + 1;
            }
        }
        return stack;
    }

    // ===========================================================================================================
    // return withError
    // ===========================================================================================================

    // This Function returns the Errors, say the spec says "Throw a TypeError", then return withError("Type", message);

    function withReferenceError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%ReferenceError%"), [message]));
    }

    function withRangeError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%RangeError%"), [message]));
    }

    function withSyntaxError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%SyntaxError%"), [message]));
    }

    function withTypeError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%TypeError%"), [message]));
    }

    function withURIError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%URIError%"), [message]));
    }

    function withEvalError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%EvalError%"), [message]));
    }

    function withError(type, message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%" + type + "Error%"), [message]), "");
    }


//#include "lib/api/encode.js";
//#include "lib/api/date.js";
//#include "lib/api/generator.js";
//#include "lib/api/iterator.js";
//#include "lib/api/arraybuffer.js";
//#include "lib/api/integerindexedexoticobject.js";
//#include "lib/api/exoticdomwrapper.js";
//#include "lib/api/symbolprimitivetype.js";
//#include "lib/api/stringexoticobject.js";
//#include "lib/api/arrayexoticobject.js";
//#include "lib/api/argumentsexoticobject.js";
//#include "lib/api/proxyexoticobject.js";


    // ===========================================================================================================
    //
    // some functions...

    function assignConstructorAndPrototype(Function, Prototype) {
        setInternalSlot(Function, "Prototype", Prototype);
        DefineOwnProperty(Function, "prototype", {
            value: Prototype,
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(Prototype, "constructor", {
            value: Function,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }

    function ObjectDefineProperty(O, P, Desc) {
        if (IsDataDescriptor(Desc)) {
            callInternalSlot("DefineOwnProperty", O,P, Desc);
        } else if (IsAccessorDescriptor(Desc)) {
            callInternalSlot("DefineOwnProperty", O,P, Desc);
        }
        return O;
    }

    function ObjectDefineProperties(O, Properties) {
        var pendingException;
        if (Type(O) !== "object") return withError("Type", "first argument is not an object");
        var props = ToObject(Properties);
        var names = OwnPropertyKeysAsList(props);
        var P, descriptors = [];
        var descObj, desc;
        for (P in names) {
            descObj = Get(props, names[P]);
            if (isAbrupt(descObj = ifAbrupt(descObj))) return descObj;
            desc = ToPropertyDescriptor(descObj);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            descriptors.push({
                P: names[P],
                desc: desc
            });
        }
        var pair, status;
        for (var i in descriptors) {
            pair = descriptors[i];
            P = pair.P;
            desc = pair.desc;
            status = DefineOwnPropertyOrThrow(O, P, desc);
            if (isAbrupt(status)) pendingException = status;
        }
        if (isAbrupt(pendingException = ifAbrupt(pendingException))) return pendingException;
        return O;
    }

    // ===========================================================================================================
    // add missing properties (used often)
    // ===========================================================================================================

    function addMissingProperties(target, mixin) {
        for (var k in mixin) {
            if (Object.hasOwnProperty.call(mixin, k)) {
                if (!Object.hasOwnProperty.call(target, k)) Object.defineProperty(target, k, Object.getOwnPropertyDescriptor(mixin, k));
            }
        }
        return target;
    }

    // ===========================================================================================================
    // assign (copies properties)
    // ===========================================================================================================

    function assign(obj, obj2) {
        for (var k in obj2) {
            obj[k] = obj2[k];
        }
        return obj;
    }

    // ===========================================================================================================
    // LazyDefineProperty (used intermediary)
    // ===========================================================================================================

    function LazyDefineFalseTrueFalse(O, name, value) {
        return callInternalSlot("DefineOwnProperty", O, name, {
            configurable: false,
            enumerable: true,
            value: value,
            writable: false
        });
    }

    function LazyDefineBuiltinConstant(O, name, value) {
        return callInternalSlot("DefineOwnProperty", O, name, {
            configurable: false,
            enumerable: false,
            value: value,
            writable: false
        });
    }

    // noch was vereinfacht
    function LazyDefineBuiltinFunction(O, name, arity, fproto, e, w, c) {
        if (e === undefined) e = false;
        if (w === undefined) w = true;
        if (c === undefined) c = true;
        return callInternalSlot("DefineOwnProperty", O, name, {
            configurable: c,
            enumerable: e,
            value: CreateBuiltinFunction(getRealm(),fproto, arity, name),
            writable: w
        });
    }

    function LazyDefineAccessor(obj, name, g, s, e, c) {
        if (e === undefined) e = false;
        if (c === undefined) c = true;
        return callInternalSlot("DefineOwnProperty", obj, name, {
            configurable: c,
            enumerable: e,
            get: g,
            set: s
        });
    }

    function LazyDefineProperty(O, P, V, w, e, c) {
        var desc;
        if (w === undefined) w = true;
        if (e === undefined) e = false;
        if (c === undefined) c = true;
        if (IsDataDescriptor(V) || IsAccessorDescriptor(V)) {
            desc = V;
        } else {
            desc = {
                configurable: c,
                enumerable: e,
                value: V,
                writable: w
            };
        }
        //return callInternalSlot("DefineOwnProperty", O, P, desc);
        return OrdinaryDefineOwnProperty(O, P, desc);
    }

    // ===========================================================================================================
    // AddRestricted FPs
    // ===========================================================================================================

    function AddRestrictedFunctionProperties(F) {
        var thrower = getIntrinsic("%ThrowTypeError%");
        var status = DefineOwnPropertyOrThrow(F, "caller", {
            get: thrower,
            set: thrower,
            enumerable: false,
            configurable: false
        });
        if (isAbrupt(status)) return status;
        return DefineOwnPropertyOrThrow(F, "arguments", {
            get: thrower,
            set: thrower,
            enumerable: false,
            configurable: false
        });
    }

    // ===========================================================================================================
    // Create Builtin (Intrinsic Module)
    // ===========================================================================================================

    function CreateBuiltinFunction(realm, steps, len, name) {

        var tmp;
        var realm = getRealm();
        var F = OrdinaryFunction();

        // this is probably unneccessary, coz all builtins have no access to the environments anyways
        // because they are plain javascript functions
        function Call() {
            var result;
            var oldContext = getContext();
            var callContext = ExecutionContext(getLexEnv(), realm);
            var stack = getStack();
            stack.push(callContext);
            result = steps.apply(this, arguments);
            Assert(callContext === stack.pop(), "CreateBuiltinFunction: Wrong Context popped from the Stack.");
            return result;
        }
        // the .steps reference is needed by function.prototype.toString to put out the right function
        Call.steps = steps;

        setInternalSlot(F, "Call", Call);
        setInternalSlot(F, "Code", undefined);
        setInternalSlot(F, "Construct", undefined);
        setInternalSlot(F, "FormalParameters", undefined);
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Environment", undefined);
        setInternalSlot(F, "Strict", true);
        setInternalSlot(F, "Realm", realm);
        AddRestrictedFunctionProperties(F);
        if (typeof len === "string") {
            tmp = name;
            name = len;
            len = tmp;
        }
        if (typeof name !== "string") name = steps.name;
        if (name) SetFunctionName(F, name);
        if (typeof len !== "number") len = 0;
        SetFunctionLength(F, len);
        return F;
    }




    //
    //
    //
    exports.printException = printException;
    exports.makeMyExceptionText = makeMyExceptionText;



    // ===========================================================================================================
    // 8.4 Tasks and Task Queues
    // ===========================================================================================================

    function PendingTaskRecord_toString () {
        return "[object PendingTaskRecord]";
    }

    function PendingTaskRecord (task, args, realm) {
        var pendingTaskRecord = Object.create(PendingTaskRecord.prototype);
        pendingTaskRecord.Task = task;
        pendingTaskRecord.Arguments = args;
        pendingTaskRecord.Realm = realm;
        return pendingTaskRecord;
    }
    PendingTaskRecord.prototype = Object.create(null);
    PendingTaskRecord.prototype.constructor = PendingTaskRecord;
    PendingTaskRecord.prototype.toString = PendingTaskRecord_toString;

    function TaskQueue() {
        // use it like an array
        // and use .nextIndex and .nextOne for iteration
        // without the need for a shift() to go forward
        // or to write the code down manually
        var queue = Object.create(Array.prototype);
        Object.defineProperty(queue, "length", {
            value: 0,
            enumerable: false
        });
        // set queue.nextIndex = 0 to start Iteration
        Object.defineProperty(queue, "nextIndex", {
            value: 0,
            enumerable: false
        });
        // test queue.done convenient, wether it´s over
        Object.defineProperty(queue, "done", {
            get: function () {
                return queue.nextIndex >= queue.length;
            },
            enumerable: false
        });
        // use nextOne to get the value at nextIndex and increase
        Object.defineProperty(queue, "nextOne", {
            value: function () {
                if (!queue.done) {
                    var value = queue[queue.nextIndex];
                    queue.nextIndex += 1;
                    return value;
                }
                return undefined;
            },
            enumerable: false
        })
        return queue;
    }


    function makeTaskQueues(realm) {
        realm.LoadingTasks = TaskQueue();
        realm.PromiseTasks = TaskQueue();
    }
    function getTasks(realm, name) {
        return realm[name];
    }

    var queueNames = {
        __proto__:null,
        "LoadingTasks": true,
        "PromiseTasks": true
    };

    function EnqueueTask(queueName, task, args) {
        Assert(Type(queueName) === "string" && queueNames[queueName], "EnqueueTask: queueName has to be valid");
        // Assert(isTaskName[task])
        Assert(Array.isArray(args), "arguments have to be a list and to be equal in the number of arguments of task");
        var callerContext = getContext();
        var callerRealm = callerContext.realm;
        var pending = PendingTaskRecord(task, arguments, callerRealm);
        switch(queueName) {
            case "PromiseTasks": realm.PromiseTasks.push(pending);
                break;
            case "LoadingTasks": realm.LoadingTasks.push(pending);
                break;
        }
        return NormalCompletion(empty);
    }

    function NextTask (result, nextQueue) {

        if (isAbrupt(result = ifAbrupt(result))) {
            // performing implementation defined unhandled exception processing
            console.log("NextTask: Got exception - which will remain unhandled - for debugging, i print them out." )
            printException(result);
        }

        Assert(getStack().length === 0, "NextTask: The execution context stack has to be empty");
        var nextPending = nextQueue.shift();
        var newContext = ExecutionContext(null, getRealm());
        newContext.realm = nextPending.realm;
        getStack().push(newContext);
        callInternalSlot("Call", nextPending.Task, undefined, nextPending.Arguments);
    }

    //
    // Realm und Loader
    //
    function IndirectEval(realm, source) {
        saveCodeRealm();
        setCodeRealm(realm);
        if (typeof source === "string") {
            var code = parse(source);
        } else code = source;
        var result = exports.Evaluate(code);
        restoreCodeRealm();
        return result;
        //return realm.toValue(source);
    }

    exports.IndirectEval = IndirectEval;
    exports.CreateRealm = CreateRealm;
    exports.createPublicCodeRealm = createPublicCodeRealm;
    
    function CreateRealm () {

        saveCodeRealm();

        var realmRec = CodeRealm();
        setCodeRealm(realmRec);
        // i have to have a stack, realm, intriniscs
        // and to remove the dependency
        //var context = newContext(null);

        var context = ExecutionContext(null);
        context.realm = realmRec;
        realmRec.stack.push(context);


        var intrinsics = createIntrinsics(realmRec);

        var loader = OrdinaryConstruct(getIntrinsic("%Loader%"), []);
        if (isAbrupt(loader = ifAbrupt(loader))) return loader;

        realmRec.loader = loader;
        var newGlobal = createGlobalThis(realmRec, ObjectCreate(null), intrinsics);
        var newGlobalEnv = GlobalEnvironment(newGlobal);
        // i think this is a bug and no execution context should be required
        context.VarEnv = newGlobalEnv;
        context.LexEnv = newGlobalEnv;

        realmRec.globalThis = newGlobal;
        realmRec.globalEnv = newGlobalEnv;
        realmRec.directEvalTranslate = undefined;
        realmRec.directEvalFallback = undefined;
        realmRec.indirectEval = undefined;
        realmRec.Function = undefined;
        realmRec.GlobalSymbolRegistry = Object.create(null);
        makeTaskQueues(realmRec);

        // my programming mistakes fixed.
        // there are variables realm, intrinsics, stack, ..
        // in the other module
        // i think hiding behind ONE function will help
        // or adding it to it´s modules exports and let
        // them use exports would be another. I favor
        // the function. but from my p3/933mhz i know i kill
        // the program with

        restoreCodeRealm();

        return realmRec;
    }


    var realms = [];
    function saveCodeRealm() {
        realms.push(realm);
    }
    function restoreCodeRealm() {
        setCodeRealm(realms.pop());
    }
    function setCodeRealm(r) {  // CREATE REALM (API)

        if (r) {
            realm = r;
            stack = realm.stack;
            intrinsics = realm.intrinsics;
            globalEnv = realm.globalEnv;
            globalThis = realm.globalThis;
        } else {
            // solution: REMOVE stack, intr, global*
            // in favor of realm.*, too. Until it´s
            // finished and optimize THEN, not now.
            realm = "check for bugs";
            stack = "check for bugs";
            intrinsics = "check for bugs";
            globalEnv = "check for bugs";
            globalThis = "check for bugs";
        }
        require("runtime").setCodeRealm(r);
    }

//#include "lib/api/structuredclone.js";


    // ##################################################################
    // DefineBuiltinProperties::: Modules and Loaders (linking.docx)
    // ##################################################################

    var standard_properties = {
        __proto__: null,
        "Array": true,
        "Error": true,
        "Function": true,
        "Object": true,
        "Symbol": true
    };

    function DefineBuiltinProperties(O) {
        var globalThis = getGlobalThis();
        for (var name in standard_properties) {
            if (standard_properties[name] === true) {
                var desc = callInternalSlot("GetOwnProperty", globalThis, name);
                var status = callInternalSlot("DefineOwnProperty", O, name, desc);
                if (isAbrupt(status)) return status;
            }
        }
        return O;
    }


    // ===========================================================================================================
    // exports
    // ===========================================================================================================

    var $$unscopables        = SymbolPrimitiveType("@@unscopables",         "Symbol.unscopables");
    var $$create             = SymbolPrimitiveType("@@create",              "Symbol.create");
    var $$toPrimitive        = SymbolPrimitiveType("@@toPrimitive",         "Symbol.toPrimitive");
    var $$toStringTag        = SymbolPrimitiveType("@@toStringTag",         "Symbol.toStringTag");
    var $$hasInstance        = SymbolPrimitiveType("@@hasInstance",         "Symbol.hasInstance");
    var $$iterator           = SymbolPrimitiveType("@@iterator",            "Symbol.iterator");
    var $$isRegExp           = SymbolPrimitiveType("@@isRegExp",            "Symbol.isRegExp");
    var $$isConcatSpreadable = SymbolPrimitiveType("@@isConcatSpreadable",  "Symbol.isConcatSpreadable");

    exports.$$unscopables        = $$unscopables;
    exports.$$create             = $$create;
    exports.$$toPrimitive        = $$toPrimitive;
    exports.$$hasInstance        = $$hasInstance;
    exports.$$toStringTag        = $$toStringTag;
    exports.$$iterator           = $$iterator;
    exports.$$isRegExp           = $$isRegExp;
    exports.$$isConcatSpreadable = $$isConcatSpreadable;
    exports.IndirectEval = IndirectEval;

    exports.CreateBuiltinFunction = CreateBuiltinFunction;
    exports.AddRestrictedFunctionProperties = AddRestrictedFunctionProperties;
    exports.LazyDefineProperty = LazyDefineProperty;
    exports.uriReserved = uriReserved;
    exports.uriUnescaped = uriUnescaped;
    exports.Encode = Encode;
    exports.Decode = Decode;
    exports.UTF8Encode = UTF8Encode;
    exports.SetFunctionName = SetFunctionName;
    exports.List = List;
    exports.SetFunctionLength = SetFunctionLength;
    exports.HasOwnProperty = HasOwnProperty;
    exports.Put = Put;
    exports.Invoke = Invoke;

    exports.withError = withError; // This Function returns the Errors, say the spec says "Throw a TypeError", then return withError("Type", message);
    exports.getContext = getContext;
    exports.getRealm = getRealm;
    exports.getLexEnv = getLexEnv;
    exports.getVarEnv = getVarEnv;
    exports.getIntrinsic = getIntrinsic;
    exports.getIntrinsics = getIntrinsics;
    exports.getGlobalEnv = getGlobalEnv;
    exports.getGlobalThis = getGlobalThis;
    exports.getStack = getStack;

    exports.getInternalSlot = getInternalSlot;
    exports.setInternalSlot = setInternalSlot;
    exports.hasInternalSlot = hasInternalSlot;
    exports.callInternalSlot = callInternalSlot;

    exports.CreateArrayIterator = CreateArrayIterator;
    exports.CreateByteDataBlock = CreateByteDataBlock;
    exports.CopyDataBlockBytes = CopyDataBlockBytes;
    exports.GetThisEnvironment = GetThisEnvironment;
    exports.GeneratorStart = GeneratorStart;
    exports.GeneratorYield = GeneratorYield;
    exports.GeneratorResume = GeneratorResume;
    exports.CreateItrResultObject = CreateItrResultObject;
    exports.IteratorNext = IteratorNext;
    exports.IteratorComplete = IteratorComplete;
    exports.IteratorValue = IteratorValue;
    exports.GetIterator = GetIterator;
    exports.CreateDataProperty = CreateDataProperty;
    exports.CreateOwnAccessorProperty = CreateOwnAccessorProperty;
    exports.stringifyErrorStack = stringifyErrorStack;
    exports.addMissingProperties = addMissingProperties;
    exports.NormalCompletion = NormalCompletion;

    exports.Completion = Completion;
    exports.NewDeclarativeEnvironment = NewDeclarativeEnvironment;
    exports.NewObjectEnvironment = NewObjectEnvironment;
    exports.NewFunctionEnvironment = NewFunctionEnvironment;
    exports.createIdentifierBinding = createIdentifierBinding;
    exports.GetIdentifierReference = GetIdentifierReference;
    exports.FunctionCreate = FunctionCreate;
    exports.FunctionAllocate = FunctionAllocate;
    exports.FunctionInitialise = FunctionInitialise;
    exports.GeneratorFunctionCreate = GeneratorFunctionCreate;
    exports.OrdinaryHasInstance = OrdinaryHasInstance;
    exports.GetPrototypeFromConstructor = GetPrototypeFromConstructor;
    exports.OrdinaryCreateFromConstructor = OrdinaryCreateFromConstructor;
    exports.OrdinaryConstruct = OrdinaryConstruct;
    exports.Construct = Construct;
    exports.CreateFromConstructor = CreateFromConstructor;
    exports.MakeConstructor = MakeConstructor;
    exports.CreateEmptyIterator = CreateEmptyIterator;
    exports.ArgumentsExoticObject = ArgumentsExoticObject;
    exports.ArrayCreate = ArrayCreate;
    exports.ArraySetLength = ArraySetLength;
    exports.ExoticDOMObjectWrapper = ExoticDOMObjectWrapper;
    exports.ExoticDOMFunctionWrapper = ExoticDOMFunctionWrapper;
    exports.BoundFunctionCreate = BoundFunctionCreate;
    exports.GeneratorFunctionCreate = GeneratorFunctionCreate;
    exports.ObjectDefineProperties = ObjectDefineProperties;
    exports.DeclarativeEnvironment = DeclarativeEnvironment;
    exports.ObjectEnvironment = ObjectEnvironment;
    exports.GlobalEnvironment = GlobalEnvironment;
    exports.ToPropertyKey = ToPropertyKey;
    exports.IsPropertyKey = IsPropertyKey;
    exports.IsSymbol = IsSymbol;
    exports.CreateDataProperty = CreateDataProperty;
    exports.PropertyDescriptor = PropertyDescriptor;
    exports.IsAccessorDescriptor = IsAccessorDescriptor;
    exports.IsDataDescriptor = IsDataDescriptor;
    exports.IsGenericDescriptor = IsGenericDescriptor;
    exports.FromPropertyDescriptor = FromPropertyDescriptor;
    exports.ToPropertyDescriptor = ToPropertyDescriptor;
    exports.CompletePropertyDescriptor = CompletePropertyDescriptor;
    exports.ValidateAndApplyPropertyDescriptor = ValidateAndApplyPropertyDescriptor;
    exports.OrdinaryObject = OrdinaryObject;
    exports.ObjectCreate = ObjectCreate;
    exports.IsCallable = IsCallable;
    exports.IsConstructor = IsConstructor;
    exports.OrdinaryFunction = OrdinaryFunction;
    exports.FunctionEnvironment = FunctionEnvironment;
    exports.DeclarativeEnvironment = DeclarativeEnvironment;
    exports.GlobalEnvironment = GlobalEnvironment;
    exports.ObjectEnvironment = ObjectEnvironment;
    exports.SymbolPrimitiveType = SymbolPrimitiveType;
    exports.CodeRealm = CodeRealm;
    exports.ExecutionContext = ExecutionContext;
    exports.CompletionRecord = CompletionRecord;
    exports.NormalCompletion = NormalCompletion;
    exports.IdentifierBinding = IdentifierBinding;
    exports.floor = floor;
    exports.ceil = ceil;
    exports.sign = sign;
    exports.abs = abs;
    exports.min = min;
    exports.max = max;
    exports.Type = Type;
    exports.ToPrimitive = ToPrimitive;
    exports.ToString = ToString;
    exports.ToBoolean = ToBoolean;
    exports.ToUint32 = ToUint32;
    exports.ToNumber = ToNumber;
    exports.ToObject = ToObject;
    exports.GetValue = GetValue;
    exports.PutValue = PutValue;
    exports.GetBase = GetBase;
    exports.MakeSuperReference = MakeSuperReference;
    exports.IsSuperReference = IsSuperReference;
    exports.IsUnresolvableReference = IsUnresolvableReference;
    exports.IsPropertyReference = IsPropertyReference;
    exports.IsStrictReference = IsStrictReference;
    exports.GetReferencedName = GetReferencedName;
    exports.GetThisValue = GetThisValue;
    exports.HasPrimitiveBase = HasPrimitiveBase;
    exports.ifAbrupt = ifAbrupt;
    exports.isAbrupt = isAbrupt;
    exports.Assert = Assert;
    exports.unwrap = unwrap;
    exports.SameValue = SameValue;
    exports.SameValueZero = SameValueZero;
    exports.Type = Type;
    exports.Reference = Reference;
    exports.ToPrimitive = ToPrimitive;
    exports.ToInteger = ToInteger;
    exports.ToNumber = ToNumber;
    exports.ToUint16 = ToUint16;
    exports.ToInt32 = ToInt32;
    exports.ToUint32 = ToUint32;
    exports.OrdinaryHasInstance = OrdinaryHasInstance;
    exports.GetGlobalObject = GetGlobalObject;
    exports.ThisResolution = ThisResolution;
    exports.CreateArrayFromList = CreateArrayFromList;
    exports.CreateListFromArrayLike = CreateListFromArrayLike;
    exports.TestIntegrityLevel = TestIntegrityLevel;
    exports.SetIntegrityLevel = SetIntegrityLevel;
    exports.CheckObjectCoercible = CheckObjectCoercible;
    exports.HasProperty = HasProperty;
    exports.GetMethod = GetMethod;
    exports.Get = Get;
    exports.Set = Set;
    exports.DefineOwnProperty = DefineOwnProperty;
    exports.GetOwnProperty = GetOwnProperty;
    exports.OwnPropertyKeys = OwnPropertyKeys;
    exports.OwnPropertyKeysAsList = OwnPropertyKeysAsList;
    exports.GetOwnPropertyKeys = GetOwnPropertyKeys;
    exports.MakeListIterator = MakeListIterator;
    exports.DefineOwnPropertyOrThrow = DefineOwnPropertyOrThrow;
    exports.Delete = Delete;
    exports.Enumerate = Enumerate;
    exports.OwnPropertyKeys = OwnPropertyKeys;
    exports.SetPrototypeOf = SetPrototypeOf;
    exports.GetPrototypeOf = GetPrototypeOf;
    exports.PreventExtensions = PreventExtensions;
    exports.IsExtensible = IsExtensible;
    exports.CreateByteArrayBlock = CreateByteArrayBlock;
    exports.SetArrayBufferData = SetArrayBufferData;
    exports.AllocateArrayBuffer = AllocateArrayBuffer;
    exports.IntegerIndexedObjectCreate = IntegerIndexedObjectCreate;
    exports.StringExoticObject = StringExoticObject;
    exports.thisTimeValue = thisTimeValue;
    exports.thisNumberValue = thisNumberValue;
    exports.thisBooleanValue = thisBooleanValue;
    exports.thisStringValue = thisStringValue;
    exports.MakeMethod = MakeMethod;
    exports.CloneMethod = CloneMethod;

    // #################################################################################################################################################################################################
    // #################################################################################################################################################################################################

//#include "lib/intrinsics/create_intrinsics.js";

    // #################################################################################################################################################################################################
    // #################################################################################################################################################################################################

    exports.createIntrinsics = createIntrinsics;
    exports.setCodeRealm = setCodeRealm;
    exports.saveCodeRealm = saveCodeRealm;
    exports.restoreCodeRealm = restoreCodeRealm;

    return exports;
});

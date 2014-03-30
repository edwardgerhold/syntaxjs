
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
    // ReturnIfAbrupt(argument) ==> if (isAbrupt(value = ifAbrupt(value)))return value;
    // ===========================================================================================================

    function unwrap(arg) {
        if (arg instanceof CompletionRecord) return arg.value;
        return arg;
    }

    // unwrap the argument, if it not abrupt

    function ifAbrupt(argument) {
        if (!(argument instanceof CompletionRecord) || argument.type !== "normal") return argument;
        return argument.value;
    }
    //if (argument && (typeof argument === "object") && (argument.toString() === "[object CompletionRecord]") && argument.type === "normal") return argument.value;

    //if (typeof argument !== "object" || !argument) return argument;
    //if (argument.toString() === "[object CompletionRecord]" && argument.type !== "normal") return argument;

    //return argument.value;

    // return finally true, if abrupt
    function isAbrupt(completion) {
        return (completion instanceof CompletionRecord && completion.type !== "normal");
    }
    // return (completion && typeof completion === "object" && (""+completion === "[object CompletionRecord]") && completion.type !== "normal");
    //if (completion && typeof completion === "object" && completion.toString() === "[object CompletionRecord]" && completion.type !== "normal") return true;
    //if (completion instanceof CompletionRecord && completion.type !== "normal") return true;

    // ===========================================================================================================
    // Ordinary Object
    // ===========================================================================================================

    function OrdinaryObject(prototype) {
        var O = Object.create(OrdinaryObject.prototype);
        prototype = prototype === undefined ? getIntrinsic("%ObjectPrototype%") || null : prototype;
        setInternalSlot(O,"Bindings",Object.create(null));
        setInternalSlot(O,"Symbols",Object.create(null));
        setInternalSlot(O,"Prototype",prototype || null);
        setInternalSlot(O,"Extensible", true);
        return O;
    }
    OrdinaryObject.prototype = {
        constructor: OrdinaryObject,
        type: "object",
        toString: function () {
            return "[object OrdinaryObject]";
        },
        Get: function (P, R) {
            return OrdinaryObjectGet(this, P, R);
        },
        Set: function (P, V, R) {
            return Set(this, P, V, R);
        },
        Invoke: function (P, A, R) {
            return OrdinaryObjectInvoke(this, P, A, R);
        },
        Delete: function (P) {
            return Delete(this, P);
        },
        DefineOwnProperty: function (P, D) {
            return DefineOwnProperty(this, P, D);
        },
        GetOwnProperty: function (P) {
            return GetOwnProperty(this, P);
        },
        OwnPropertyKeys: function () {
            return OwnPropertyKeys(this);
        },
        Enumerate: function () {
            return Enumerate(this);
        },
        HasProperty: function (P) {
            return HasProperty(this, P);
        },
        HasOwnProperty: function (P) {
            if (IsPropertyKey(P)) {
                //P = unwrap(P);
                if (IsSymbol(P)) {
                    if (this.Symbols[P.es5id] !== undefined) return true;
                } else {
                    P = ToString(P);
                    if (this.Bindings[P]) return true;
                }
            }
            return false;

        },
        GetPrototypeOf: function () {
            // return GetPrototypeOf(this);
            return this.Prototype;
        },
        SetPrototypeOf: function (P) {
            //    return SetPrototypeOf(this, P);
            this.Prototype = unwrap(P);
        },
        IsExtensible: function () {
            return IsExtensible(this);
        },
        PreventExtensions: function () {
            return PreventExtensions(this);
        }
    };

    // ===========================================================================================================
    // essential methods
    // ===========================================================================================================

    function GetPrototypeOf(V) {
        if (Type(V) !== "object") return withError("Type", "argument is not an object");
        return getInternalSlot(V, "Prototype") || null;
    }

    function SetPrototypeOf(O, V) {
        if (Type(V) !== "object" && V !== null) return withError("Type", "Assertion: argument is either object or null, but it is not.");
        var extensible = getInternalSlot(O, "Extensible");
        var current = getInternalSlot(O, "Prototype");
        if (SameValue(V, current)) return true;
        if (!extensible) return false;
        if (V !== null) {
            var p = V;
            while (p !== null) {
                if (SameValue(p, O)) return false;
                var nextp = GetPrototypeOf(p);
                if (isAbrupt(nextp = ifAbrupt(nextp))) return nextp;
                p = nextp;
            }
        }
        setInternalSlot(O, "Prototype", V);
        return true;
    }

    function Delete(O, P) {
        var v;
        if (IsSymbol(P)) v = O.Symbols[P.es5id];
        else(v = O.Bindings[P]);
        if (v) {
            if (v.configurable) {
                if (IsSymbol(P)) {
                    O.Symbols[P.es5id] = undefined;
                    delete O.Symbols[P.es5id];
                } else {
                    O.Bindings[P] = undefined;
                    delete O.Bindings[P];
                }
                return true;
            }
        }
        return false;
    }

    function Get(O, P) {
        Assert(Type(O) === "object", "Get(O,P): expecting object");
        Assert(IsPropertyKey(P));
        return callInternalSlot("Get", O, P, O);
        //var func = getFunction(O, "Get");
        //return func.call(O,P,O);
    }

    function OrdinaryObjectGet(O, P, R) {
        Assert(IsPropertyKey(P), "Get (object) expects a valid Property Key (got " + P + ")")
        var desc = callInternalSlot("GetOwnProperty", O, P);
        if (isAbrupt(desc = ifAbrupt(desc))) return desc;
        if (desc === undefined) {
            var parent = GetPrototypeOf(O);
            if (isAbrupt(parent)) return parent;
            parent = ifAbrupt(parent);
            if (parent === null) return undefined;
            return parent.Get(P, R);
        }
        var getter;
        if (IsDataDescriptor(desc)) return desc.value;
        else if (IsAccessorDescriptor(desc)) {
            getter = desc.get;
            if (getter === undefined) return undefined;
            else return callInternalSlot("Call", getter, R, []);
        }
        return undefined;
    }

    function Set(O, P, V, R) {
        var ownDesc, parent, setter;
        Assert(IsPropertyKey(P), "Set (object) expects a valid Property Key")
        ownDesc = callInternalSlot("GetOwnProperty", O, P); // readPropertyDescriptor(O, P);
        if (isAbrupt(ownDesc = ifAbrupt(ownDesc))) return ownDesc;
        if (ownDesc === undefined) {
            parent = GetPrototypeOf(O);
            if (isAbrupt(parent = ifAbrupt(parent))) return parent;
            if (parent !== null) {
                return parent.Set(P, V, R);
            }
        }
        // von unter isdata hoch gehoben
        else if (IsAccessorDescriptor(ownDesc)) {
            var setter = ownDesc.set;
            if (setter === undefined) return false;
            var setterResult = callInternalSlot("Call", setter, R, [V]);
            if (isAbrupt(setterResult)) return setterResult;
            return true;
        }
        ownDesc = {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: true
        };
        if (IsDataDescriptor(ownDesc)) {
            if (ownDesc.writable == false) return false;
            if (Type(R) !== "object") return false;
            var existingDescriptor = R.GetOwnProperty(P);
            if (isAbrupt(existingDescriptor = ifAbrupt(existingDescriptor))) return existingDescriptor;

            if (existingDescriptor !== undefined) {
                var valueDesc = {
                    value: V
                };
                return R.DefineOwnProperty(P, valueDesc);
            } else {
                return CreateDataProperty(R, P, V);
            }

        }
        return false;
    }

    function Invoke(O, P, args) {
        var obj;
        Assert(IsPropertyKey(P), "Invoke: expecting property key");
        if (!Array.isArray(args)) args = [];
        obj = ToObject(O);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        var func = callInternalSlot("Get", obj, P, O);
        if (!IsCallable(func)) return withError("Type", "Invoke: expected function is not callable");
        if (isAbrupt(func = ifAbrupt(func))) return func;
        return callInternalSlot("Call", func, O, args);
    }

    function OrdinaryObjectInvoke(O, P, A, R) {
        Assert(IsPropertyKey(P), "expecting property key");
        Assert(Array.isArray(A), "expecting arguments list");
        var method = O.Get(P, R);
        if (isAbrupt(method = ifAbrupt(method))) return method;
        if (Type(method) !== "object") return withError("Type", "Invoke: method " + P + " is not an object");
        if (!IsCallable(method)) return withError("Type", "Invoke: method " + P + " is not callable");
        return method.Call(R, A);
    }

    function DefineOwnProperty(O, P, Desc) {
        return OrdinaryDefineOwnProperty(O, P, Desc);
    }

    function HasOwnProperty(O, P) {
        Assert(Type(O) === "object", "HasOwnProperty: first argument has to be an object");
        Assert(IsPropertyKey(P), "HasOwnProperty: second argument has to be a valid property key, got " + P);
        var desc = callInternalSlot("GetOwnProperty", O, P);
        if (desc === undefined) return false;
        return true;
    }

    function HasProperty(O, P) {
        do {
            if (HasOwnProperty(O, P)) return true;
        } while (O = GetPrototypeOf(O));
        return false;
    }

    function Enumerate(O) {
        var propList, name, proto, bindings, desc, index, denseList, isSparse;
        var duplicateMap = Object.create(null);
        propList = [];

        var chain = [];
        proto = O;
        while (proto != null) {
            chain.push(proto);
            proto = GetPrototypeOf(proto);
        }
        // 1) protoypes
        // dupes werden undefined gesetzt
        for (var k = chain.length -1; k >= 0; k--) {
            var obj = chain[k];
            bindings = obj.Bindings;
            for (name in bindings) {
                if (Type(name) === "string") {
                    desc = OrdinaryGetOwnProperty(obj, name);
                    if (desc.enumerable === true) {
                        if ((index = duplicateMap[name]) !== undefined) {
                            propList[index] = undefined;
                            isSparse = true;
                        }
                        duplicateMap[name] = propList.push(name) - 1;
                    }
                }
            }
        }

        if (isSparse) {
            denseList = [];
            for (var i = 0, j = propList.length; i < j; i++) {
                if ((name = propList[i]) !== undefined) denseList.push(name);
            }
            return MakeListIterator(denseList);
        }
        return MakeListIterator(propList);
    }

    function OwnPropertyKeys(O) {
        var keys = [];
        var bindings = O.Bindings;
        var key;
        for (key in bindings) {
            keys.push(key);
        }
        //return keys;
        return MakeListIterator(keys);
    }

    function OwnPropertyKeysAsList(O) {
        var keys = [];
        var bindings = O.Bindings;
        var key;
        for (key in bindings) {
            keys.push(key);
        }
        return keys;
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

    function IsExtensible(O) {
        if (Type(O) === "object") return !!getInternalSlot(O, "Extensible");
        return false;
    }

    function PreventExtensions(O) {
        setInternalSlot(O, "Extensible", false);
    }

    // ===========================================================================================================
    // Ordinary Function
    // ===========================================================================================================

    function OrdinaryFunction() {
        var F = Object.create(OrdinaryFunction.prototype);
        setInternalSlot(F, "Bindings", Object.create(null));
        setInternalSlot(F, "Symbols", Object.create(null));
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Realm", undefined);
        setInternalSlot(F, "Extensible", true);
        setInternalSlot(F, "Environment", undefined);
        setInternalSlot(F, "Code", undefined);
        setInternalSlot(F, "FormalParameters", undefined);
        return F;
    }

    OrdinaryFunction.prototype = {
        constructor: OrdinaryFunction,
        type: "object",
        toString: function () {
            return "[object OrdinaryFunction]";
        },
        Get: function (P, R) {
            var v = OrdinaryObjectGet(this, P, R);
            if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) return null;
            return v;
        },
        GetOwnProperty: function (P) {
            var d = GetOwnProperty(this, P);
            if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) d.value = null;
            return d;
        },
        Call: function () {
            // MODULE INTERDEPENDENCY -> call is from "runtime"
            return exports.Call.apply(this, arguments);
        },
        Construct: function (argList) {
            return OrdinaryConstruct(this, argList);
        }
    };
    addMissingProperties(OrdinaryFunction.prototype, OrdinaryObject.prototype);

    // ===========================================================================================================
    // Declarative Environment
    // ===========================================================================================================

    function DeclarativeEnvironment(outer) {
        var de = Object.create(DeclarativeEnvironment.prototype);
        de.Bindings = Object.create(null);
        de.outer = outer || null;
        return de;
    }
    DeclarativeEnvironment.prototype = {
        constructor: DeclarativeEnvironment,
        toString: function () {
            return "[object DeclarativeEnvironment]";
        },
        HasBinding: function HasBinding(N) {
            debug("hasbinding of decl called with " + N);
            return (N in this.Bindings);
        },
        CreateMutableBinding: function CreateMutableBinding(N, D) {
            var envRec = this.Bindings;
            debug("declenv create mutablebinding: " + N);
            var configValue = D === true || D === undefined ? true : false;
            if (N in envRec) return withError("Reference", N + " is bereits deklariert");
            else createIdentifierBinding(envRec, N, undefined, configValue);
            return NormalCompletion();
        },
        CreateImmutableBinding: function CreateImmutableBinding(N) {
            debug("declenv create immutablebinding: " + N);
            var envRec = this.Bindings;
            var configValue = false;
            if (N in envRec) return withError("Reference", N + " is bereits deklariert");
            else createIdentifierBinding(envRec, N, undefined, configValue, false);
            return NormalCompletion();
        },
        InitialiseBinding: function (N, V) {
            debug("declenv initialise: " + N);
            var b, outerEnv;
            if (this.HasBinding(N)) {
                b = this.Bindings[N];
                if (!b.initialised) {
                    b.value = V;
                    b.initialised = true;
                    return true;
                }
                return false;
            } else if (outerEnv = this.outer) return outerEnv.InitialiseBinding(N, V);
            return false;
        },
        SetMutableBinding: function (N, V, S) {
            var b, o;
            if (this.HasBinding(N)) {
                b = this.Bindings[N];
                if (b.writable || !b.initialised) {
                    b.value = V;
                    if (!b.initialised) b.initialised = true;
                }
                //          else if (!b.writable) return withError("Reference", "Trying to set immutable binding.");
                //          else if (!b.initialised) return withError("Reference", "Trying to set uninitialised binding.");
                return NormalCompletion(b.value);
            } else if (o = this.outer) return o.SetMutableBinding(N, V, S);
        },
        GetBindingValue: function (N, S) {
            var b;
            if (this.HasBinding(N)) {
                b = this.Bindings[N];
                if (!b.initialised) return NormalCompletion(undefined);
                return NormalCompletion(b.value);
            } else if (this.outer) return this.outer.GetBindingValue(N, S);
            return withError("Reference", "GetBindingValue: Can not find " + N);
        },
        DeleteBinding: function DeleteBinding(N) {
            if (this.HasBinding[N]) {
                this.Bindings[N] = undefined;
                delete this.Bindings[N];
            } else if (this.outer) return this.outer.DeleteBinding(N);
        },
        GetIdentifierReference: function (name, strict) {
            return GetIdentifierReference(this, name, strict);
        },
        HasThisBinding: function () {
            return false;
        },
        HasSuperBinding: function () {
            return false;
        },
        WithBaseObject: function () {
            return undefined;
        }
    };

    // ===========================================================================================================
    // BoundFunctionCreate
    // ===========================================================================================================

    function BoundFunctionCreate(B, T, argList) {
        var F = OrdinaryFunction();
        setInternalSlot(F, "BoundTargetFunction", B);
        setInternalSlot(F, "BoundThis", T);
        setInternalSlot(F, "BoundArguments", argList.slice());
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Extensible", true);
        setInternalSlot(F, "Call", function (thisArg, argList) {
            var B = getInternalSlot(F, "BoundTargetFunction");
            var T = getInternalSlot(F, "BoundThis");
            var A = getInternalSlot(F, "BoundArguments").concat(argList);
            return callInternalSlot("Call", B, T, A);
        });
        return F;
    }

    // ===========================================================================================================
    // Function Environment
    // ===========================================================================================================

    function FunctionEnvironment(F, T) {
        var fe = Object.create(FunctionEnvironment.prototype);
        fe.BoundFunction = F;
        fe.thisValue = T;
        fe.Bindings = Object.create(null);
        fe.outer = getInternalSlot(F,"Environment");
        return fe;
    }
    FunctionEnvironment.prototype = assign(FunctionEnvironment.prototype, {
        HasThisBinding: function () {
            return true;
        },
        GetThisBinding: function () {
            return this.thisValue;
        },
        HasSuperBinding: function () {
            return !!this.BoundFunction.HomeObject;
        },
        GetSuperBase: function () {
            return this.BoundFunction.HomeObject;
        },
        GetMethodName: function () {
            return this.BoundFunction.MethodName;
        },
        WithBaseObject: function () {
            debug("FunctionEnv: WithBaseObject");
            return undefined;
        },
        toString: function () {
            return "[object FunctionEnvironment]";
        },
        constructor: FunctionEnvironment
    });
    addMissingProperties(FunctionEnvironment.prototype, DeclarativeEnvironment.prototype);

    // ===========================================================================================================
    // Object Environment
    // ===========================================================================================================

    function ObjectEnvironment(O, E) {
        var oe = Object.create(ObjectEnvironment.prototype);
        oe.Unscopables = Object.create(null);
        oe.BoundObject = O;
        oe.outer = E;
        return oe;
    }
    ObjectEnvironment.prototype = {
        constructor: ObjectEnvironment,
        toString: function () {
            return "[object ObjectEnvironment]";
        },
        HasBinding: function (N) {
            debug("objectenv: hasbinding mit key: " + N);
            var bindings = this.BoundObject;
            if (this.Unscopables[N]) return false;
            if (this.withEnvironment) {
                var unscopables = bindings.Get($$unscopables, bindings);
                if (isAbrupt(unscopables = ifAbrupt(unscopables))) return unscopables;
                if (Type(unscopables) === "object") {
                    var found = HasOwnProperty(unscopables, N);
                    if (isAbrupt(found = ifAbrupt(found))) return found;
                    if (found === true) return false;
                }
            }
            return HasProperty(bindings, N);
        },
        CreateMutableBinding: function (N, D) {
            debug("object env: createmutablebinding mit key: " + N);
            var O = this.BoundObject;
            var configValue = D === true ? true : false;
            return callInternalSlot("DefineOwnProperty", O,N, {
                value: undefined,
                writable: true,
                enumerable: false,
                configurable: configValue
            });
        },
        CreateImmutableBinding: function (N) {
            var O = this.BoundObject;
            return callInternalSlot("DefineOwnProperty", O,N, {
                value: undefined,
                writable: false,
                enumerable: false,
                configurable: false
            });
        },
        GetBindingValue: function (N) {
            var O = this.BoundObject;
            Assert(Type(O) === "object", "ObjectEnvironment: BoundObject has to be of Type Object");
            return O.Get(N, O);
        },

        InitialiseBinding: function (N, V) {
            var O = this.BoundObject;
            return O.Set(N, V, O);
        },
        SetMutableBinding: function (N, V) {
            var O = this.BoundObject;
            return O.Set(N, V, O);
        },
        DeleteBinding: function (N) {
            var O = this.BoundObject;
            return O.Delete(N);
        },

        HasThisBinding: function () {
            return true;
        },

        HasSuperBinding: function () {
            return !!this.HomeObject;
        },
        GetSuperBase: function () {
            return this.HomeObject;
        },

        WithBaseObject: function () {
            var O = this.BoundObject;
            return O;
        },
        GetThisBinding: function () {
            var O = this.BoundObject;
            return O;
        }
    };
    // ===========================================================================================================
    // Global Environment
    // ====================================console.log("sfds")=======================================================================

    function GlobalEnvironment(globalThis, intrinsics) {
        var ge = Object.create(GlobalEnvironment.prototype);

        ge.outer = null;
        ge.objEnv = NewObjectEnvironment(globalThis, ge.outer);
        ge.objEnv.toString = function () {
            return "[object GlobalVariableEnvironment]";
        };
        ge.LexEnv = DeclarativeEnvironment(ge.objEnv);
        ge.LexEnv.toString = function () {
            return "[object GlobalLexicalEnvironment]";
        };
        var varNames = ge.VarNames = Object.create(null);
        for (var k in globalThis.Bindings) {
            if (HasOwnProperty(globalThis, k)) varNames[k] = true;
        }

        return ge;
    }
    GlobalEnvironment.prototype = {
        constructor: GlobalEnvironment,

        toString: function () {
            return "[object GlobalEnvironment]";
        },

        HasBinding: function (N) {
            if (this.LexEnv.HasBinding(N)) return true;
            if (this.objEnv.HasBinding(N)) return true;
            return false;
        },
        CreateMutableBinding: function (N, D) {
            return this.LexEnv.CreateMutableBinding(N, D);
        },
        CreateImmutableBinding: function (N) {
            return this.LexEnv.CreateImmutableBinding(N);
        },
        GetBindingValue: function (N, S) {
            if (this.LexEnv.HasBinding(N)) return this.LexEnv.GetBindingValue(N, S);
            else if (this.objEnv.HasBinding(N)) return this.objEnv.GetBindingValue(N, S);
        },
        InitialiseBinding: function (N, V, S) {
            if (this.LexEnv.HasBinding(N)) return this.LexEnv.InitialiseBinding(N, V, S);
            else if (this.objEnv.HasBinding(N)) return this.objEnv.InitialiseBinding(N, V, S);
            return false;
        },
        SetMutableBinding: function (N, V, S) {
            if (this.LexEnv.HasBinding(N)) return this.LexEnv.SetMutableBinding(N, V, S);
            else if (this.objEnv.HasBinding(N)) return this.objEnv.SetMutableBinding(N, V, S);
            return false;
        },
        DeleteBinding: function (N) {
            if (this.LexEnv.HasBinding(N)) {
                return this.LexEnv.DeleteBinding(N);
            } else if (this.objEnv.HasBinding(N)) {
                var status = this.objEnv.DeleteBinding(N);
                if (status === true) {
                    this.VarNames[N] = undefined;
                }
                return status;
            }
            return false;
        },
        HasThisBinding: function () {
            return true;
        },
        HasSuperBinding: function () {
            return false;
        },
        WithBaseObject: function () {
            return this.objEnv;
        },
        GetThisBinding: function () {
            return this.objEnv.GetThisBinding();
        },
        HasVarDeclaration: function (N) {
            if (this.VarNames[N]) return true;
            return false;
        },
        HasLexicalDeclaration: function (N) {
            if (this.LexEnv.HasBinding(N)) return true;
            return false;
        },
        CanDeclareGlobalVar: function (N) {
            debug("candeclarevar");
            if (this.objEnv.HasBinding(N)) return true;
            return this.objEnv.BoundObject.IsExtensible();
        },
        CanDeclareGlobalFunction: function (N) {
            debug("candeclarefunc");
            var objRec = this.objEnv;
            var globalObject = objRec.BoundObject;
            var extensible = globalObject.IsExtensible();
            if (isAbrupt(extensible = ifAbrupt(extensible))) return extensible;
            if (objRec.HasBinding(N) === false) return extensible;
            var existingProp = globalObject.GetOwnProperty(N);
            if (!existingProp) return extensible;
            if (IsDataDescriptor(existingProp) && existingProp.writable && existingProp.enumerable) return true;
            debug("returning false");
            return false;
        },
        CreateGlobalVarBinding: function (N, D) {
            debug("createglobalvar");
            var cpl = this.objEnv.CreateMutableBinding(N, D);
            if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
            cpl = this.objEnv.InitialiseBinding(N, undefined);
            if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
            this.VarNames[N] = true;
        },
        CreateGlobalFunctionBinding: function (N, V, D) {
            debug("createglobalfunction");
            var cpl = this.objEnv.CreateMutableBinding(N, D);
            if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
            cpl = this.objEnv.InitialiseBinding(N, V);
            if (isAbrupt(cpl = ifAbrupt(cpl))) return cpl;
            this.VarNames[N] = true;
        }
    };

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

    // ===========================================================================================================
    // CodeRealm Object
    //
    // assignIntrinsics
    // createGlobalThis
    // createGlobalEnv
    // sollten zu diesem Objekt gebracht werden
    // wenn ich das erzeuge,
    // erzeuge ich intrinsics, global, env, loader....
    //
    // ===========================================================================================================

    function createPublicCodeRealm () {
    	var realm = CreateRealm();
	return { 
	    eval: function toValue() {
		return realm.toValue.apply(realm, arguments);
	    },
	    evalFile: function fileToValue() {
		return realm.fileToValue.apply(realm, arguments);
	    },
	    evalAsync: function evalAsync() {
		return realm.evalAsync.apply(realm, arguments);
	    }
	};
    }

    function CodeRealm(intrinsics, gthis, genv, ldr) {
        "use strict";
        var cr = Object.create(CodeRealm.prototype);
        cr.intrinsics = intrinsics;
        cr.globalThis = gthis;
        cr.globalEnv = genv;
        cr.directEvalTranslate = undefined;
        cr.directEvalFallback = undefined;
        cr.indirectEval = undefined;
        cr.Function = undefined;
        cr.loader = ldr;

        // self defined

        cr.stack = [];
        cr.eventQueue = [];
        cr.xs = Object.create(null);
        return cr;
    }
    CodeRealm.prototype.toString = CodeRealm_toString;
    CodeRealm.prototype.constructor = CodeRealm;

    CodeRealm.prototype.fileToValue =
    CodeRealm.prototype.evalFile = function (filename) {
	var rf = require("fswraps").readFileSync;
	if (typeof rf === "function") {
	    var code = rf(filename);
	    return this.eval(code);
	} else {
	    throw new TypeError("can not read file "+filename+" with fswraps module");
	}
    };

    CodeRealm.prototype.eval =
    CodeRealm.prototype.toValue = function (code) {
	// overhead save realm
        saveCodeRealm();
        setCodeRealm(this);
        
        // evaluate code
        // 1st stage parser
        if (typeof code === "string") code = parse(code);
        // 2nd stage evaluation
        var result = exports.Evaluate(code);    // here the realm argument...hmm. already in use all over
        if (isAbrupt(result=ifAbrupt(result))) {
    	    var error = result.value;
    	    var ex = new Error(Get(error, "message"));
    	    ex.name = Get(error, "name");
    	    throw ex;
        } else {
    	    result = GetValue(result);
        }
        // overhead restore realm
        restoreCodeRealm();
        return result;
    };
    
    // change name with eval

    CodeRealm.prototype.evalAsync =
    CodeRealm.prototype.evalFileAsync = function (file) {
	var realm = this;
	return require("fswraps").readFileP(name).then(function (code) {
	    return realm.toValue(code);
	}, function (err) { 
	    throw err; 
	});
    };

    function CodeRealm_toString() {
        return "[object CodeRealm]";
    }



    // ===========================================================================================================
    // Execution Context
    // - has got a stack
    // xs.stack = [ctx1, .., ctxn];
    // ===========================================================================================================

    function ExecutionContext(outer, realm, state, generator) {
        "use strict";
        var ec = Object.create(ExecutionContext.prototype);
        ec.state = [];
        ec.realm = realm;
        outer = outer || null;
        ec.VarEnv = NewDeclarativeEnvironment(outer);
        ec.LexEnv = ec.VarEnv;
        ec.generator = generator;
        if (realm) realm.cx = ec;
        return ec;
    }

    ExecutionContext.prototype.toString = ExecutionContext_toString;
    ExecutionContext.prototype.constructor = ExecutionContext;
    function ExecutionContext_toString() {
        return "[object ExecutionContext]";
    }

    // ===========================================================================================================
    // Completion Record
    // ===========================================================================================================

    function CompletionRecord(type, value, target) {
        "use strict";
        var cr = Object.create(CompletionRecord.prototype);
        cr.type = type;
        cr.value = value;
        cr.target = target;
        return cr;
    }

    CompletionRecord.prototype.toString = CompletionRecord_toString;
    CompletionRecord.prototype.constructor = CompletionRecord;

    function CompletionRecord_toString() {
        return "[object CompletionRecord]";
    }


    function NormalCompletion(argument, label) {
        var completion;

        if (argument instanceof CompletionRecord) {
            completion = argument;
        } else {
            completion = CompletionRecord(); // realm.completion;
            completion.value = argument;
            completion.type = "normal"
            completion.target = label;
        }
        realm.completion = completion;
        return completion;
    }

    function Completion(type, argument, target) {
        var completion = CompletionRecord();
        if (argument instanceof CompletionRecord) {
            completion = argument;
        } else completion.value = argument;
        completion.type = type || "normal";
        completion.target = target;
        realm.completion = completion;
        return completion;
    }


//#include "lib/api/reference.js";


    // ===========================================================================================================
    // CreateDataProperty
    // ===========================================================================================================

    function CreateOwnAccessorProperty(O, P, G, S) {
        Assert(Type(O) === "object", "CreateAccessorProperty: first argument has to be an object.");
        Assert(IsPropertyKey(P), "CreateAccessorProperty: second argument has to be a valid property key.");
        var D = Object.create(null);
        D.get = G;
        D.set = S;
        D.enumerable = true;
        D.configurable = true;
        return callInternalSlot("DefineOwnProperty", O, P, D);
    }

    function CreateDataProperty(O, P, V) {
        Assert(Type(O) === "object", "CreateDataProperty: first argument has to be an object.");
        Assert(IsPropertyKey(P), "CreateDataProperty: second argument has to be a valid property key.");
        var newDesc = Object.create(null);
        newDesc.value = V;
        newDesc.writable = true;
        newDesc.enumerable = true;
        newDesc.configurable = true;
        return callInternalSlot("DefineOwnProperty", O, P, newDesc);
    }

    function CreateDataPropertyOrThrow(O, P, V) {
        Assert(Type(O) === "object", "CreateDataPropertyOrThrow: first argument has to be an object.");
        Assert(IsPropertyKey(P), "CreateDataPropertyOrThrow: second argument has to be a valid property key.");
        var success = CreateDataProperty(O, P, V);
        if (isAbrupt(success = ifAbrupt(success))) return success;
        if (success === false) return withError("Type", "CreateDataPropertyOrThrow: CreateDataProperty failed and returned false.");
        return success;
    }

    function IsPropertyKey(P) {
        if (typeof P === "string") return true;
        if (P instanceof SymbolPrimitiveType) return true;
        return false;
    }

    function PropertyDescriptor(V, W, E, C) {
        var D = Object.create(null); //Object.create(null);
        D.value = V;
        D.writable = W !== undefined ? W : true;
        D.enumerable =  E !== undefined ? E : true;
        D.configurable =  C !== undefined ? C : true;
        return D;
    }

    function IsAccessorDescriptor(desc) {
        if (desc == null) return false;
        if (typeof desc !== "object") return false;
        if (("get" in desc) || ("set" in desc)) return true;
        return false;
    }

    function IsDataDescriptor(desc) {
        if (desc == null) return false;
        if (typeof desc !== "object") return false;
        if (("value" in desc) || ("writable" in desc)) return true;
        return false;
    }

    function IsGenericDescriptor(desc) {    // hat nur enum oder config props
        if (desc === null) return false;
        if (typeof desc !== "object") return false;
        if (!IsAccessorDescriptor(desc) && !IsDataDescriptor(desc) &&
            (("configurable" in desc) || ("enumerable" in desc))) return true;
        return false;
    }

    function FromPropertyDescriptor(desc) {
        if (desc == undefined) return undefined;
        if (desc.Origin) return desc.Origin;
        var obj = ObjectCreate();
        callInternalSlot("DefineOwnProperty", obj,"value",        PropertyDescriptor(desc.value, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"writable",     PropertyDescriptor(desc.writable, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"get",          PropertyDescriptor(desc.get, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"set",          PropertyDescriptor(desc.set, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"enumerable",   PropertyDescriptor(desc.enumerable, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"configurable", PropertyDescriptor(desc.configurable, true, true, true));
        return obj;
    }

    function ToPropertyDescriptor(O) {
        if (isAbrupt(O = ifAbrupt(O))) return O;
        if (Type(O) !== "object") return withError("Type", "ToPropertyDescriptor: argument is not an object");
        var desc = Object.create(null);

        if (HasProperty(O, "enumerable")) {
            var enume = Get(O, "enumerable");
            if (isAbrupt(enume = ifAbrupt(enume))) return enume;
            desc.enumerable = enume;
        }
        if (HasProperty(O, "writable")) {
            var write = Get(O, "writable");
            if (isAbrupt(write = ifAbrupt(write))) return write;
            desc.writable = write;
        }
        if (HasProperty(O, "configurable")) {
            var conf = Get(O, "configurable");
            if (isAbrupt(conf = ifAbrupt(conf))) return conf;
            desc.configurable = conf;
        }
        if (HasProperty(O, "value")) {
            var value = Get(O, "value");
            if (isAbrupt(value = ifAbrupt(value))) return value;
            desc.value = value;
        }

        if (HasProperty(O, "get")) {
            var get = Get(O, "get");
            if (isAbrupt(get = ifAbrupt(get))) return get;
            desc.get = get;
        }
        if (HasProperty(O, "set")) {
            var set = Get(O, "set");
            if (isAbrupt(set = ifAbrupt(set))) return set;
            desc.set = set;
        }
        desc.Origin = O;
        return desc;
    }

    function IsCompatiblePropertyDescriptor(extensible, Desc, current) {
        return ValidateAndApplyPropertyDescriptor(undefined, undefined, extensible, Desc, current);
    }

    function CompletePropertyDescriptor(Desc, LikeDesc) {
        Assert(typeof LikeDesc === "object" || LikeDesc === undefined, "LikeDesc has to be object or undefined");
        Assert(typeof Desc === "object");
        if (LikeDesc === undefined) LikeDesc = {
            value: undefined,
            writable: false,
            get: undefined,
            set: undefined,
            enumerable: false,
            configurable: false
        };
        if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
            if (typeof Desc.writable === "undefined") Desc.writable = LikeDesc.writable;
            if (typeof Desc.value === "undefined") Desc.value = LikeDesc.value;
        } else {
            if (typeof Desc.get === "undefined") Desc.get = LikeDesc.get;
            if (typeof Desc.set === "undefined") Desc.set = LikeDesc.set;
        }
        if (typeof Desc.enumerable === "undefined") Desc.enumerable = LikeDesc.enumerable;
        if (typeof Desc.configurable === "undefined") Desc.configurable = LikeDesc.configurable;
        return Desc;
    }

    function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current) {
        var same = true, d;
        var isDataDesc = IsDataDescriptor(Desc);
        var isGenericDesc = IsGenericDescriptor(Desc);
        var isAccessorDesc = IsAccessorDescriptor(Desc);

        if (O) Assert(IsPropertyKey(P), "ValidateAndApplyPropertyDescriptor: expecting property key if object is present");

        Assert(typeof Desc === "object", "ValidateAndApplyPropertyDescriptor: Desc must be a descriptor object (btw. current is " + ( !! current) + ")");

        var changeType = "reconfigure"; // o.observe

        if (!current) {

            if (!extensible) return false;

            Assert(extensible, "object has to be extensible");

            if (isGenericDesc || isDataDesc || isAccessorDesc) {
                if (O !== undefined) {
                    writePropertyDescriptor(O, P, Desc);
                }
            }
            //  var R = CreateChangeRecord("add", O, P, current, Desc);
            return true;

        } else if (current && Desc) {

            var isDataCurrent = IsDataDescriptor(current);
            var isGenericCurrent = IsGenericDescriptor(current);
            var isAccessorCurrent = IsAccessorDescriptor(current);

            if (Desc.get === undefined &&
                Desc.set === undefined &&
                Desc.writable === undefined &&
                Desc.enumerable === undefined &&
                Desc.configurable === undefined &&
                Desc.value === undefined) {
                return true;
            }

            for (d in Desc) {
                if (Object.hasOwnProperty.call(Desc, d))
                    if (current[d] !== Desc[d]) same = false;
            }
            if (same) return true;

            if (current.configurable === false) {
                if (Desc.configurable === true) return false;
                if (Desc.enumerable === !current.enumerable) return false;
            }

            if (isDataCurrent && isDataDesc) {

                if (current.configurable === false) {
                    if (!current.writable === Desc.writable) return false;
                    if (!current.writable) {
                        if (("value" in Desc) && (current.value !== Desc.value)) return false;
                    }
                }

                /*if (current.writable) {
                 writePropertyDescriptor(O, P, Desc);
                 return true;
                 }*/

            } else if (isAccessorCurrent && isAccessorDesc) {

                if (current.configurable === false) {
                    if (("set" in Desc) && (Desc.set !== current.set)) return false;
                    if (("get" in Desc) && (Desc.get !== current.get)) return false;
                }/* else {
                 if (Desc.set === undefined) Desc.set === current.set;
                 if (Desc.get === undefined) Desc.get === current.get;
                 writePropertyDescriptor(O, P, Desc);
                 return true;
                 }*/

            } else if (isGenericDesc) {
                if (current.configurable === false) return false;
                // convert to accessor
                if (isDataCurrent) {
                    if (O !== undefined) {
                        writePropertyDescriptor(O, P, {
                            get: undefined,
                            set: undefined,
                            enumerable: current.enumerable,
                            configurable: current.configurable
                        });
                        return true;
                    }
                    // convert to data
                } else if (isAccessorCurrent) {
                    if (O !== undefined) {
                        writePropertyDescriptor(O, P, {
                            value: undefined,
                            writable: false,
                            enumerable: current.enumerable,
                            configurable: current.configurable
                        });
                        return true;
                    }
                }
            }

            if (O !== undefined) {
                if (isDataDesc && !current.writable) return false;

                for (d in Desc) {
                    if (Object.hasOwnProperty.call(Desc, d)) {
                        current[d] = Desc[d];
                    }
                }
                writePropertyDescriptor(O, P, current);

            }

            return true;
        }
    }

    function IsSymbol(P) {
        return P instanceof SymbolPrimitiveType;
    }

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

    function GetMethod(O, P) {
        Assert(Type(O) === "object" && IsPropertyKey(P) === true, "o has to be object and p be a valid key");
        var method = callInternalSlot("Get", O, P, O);
        if (isAbrupt(method = ifAbrupt(method))) return method;
        if (IsCallable(method)) return method;
        else return withError("Type", "GetMethod: " + P + " can not be retrieved");
    }

    function SetIntegrityLevel(O, level) {
        Assert(Type(O) === "object", "object expected");
        Assert(level === "sealed" || level === "frozen", "level must be sealed or frozen");
        var desc;
        if (level === "sealed" || level === "frozen") {
            var pendingException;
            var keys = OwnPropertyKeysAsList(O); // Array statt iterator
            var key;
            var status;
            if (level === "sealed") {
                for (var k in keys) {
                    key = keys[k];
                    desc = OrdinaryGetOwnProperty(O, key);
                    if (desc && desc.configurable) {
                        desc.configurable = false;
                        status = DefineOwnPropertyOrThrow(O, key, desc);
                        if (isAbrupt(status)) {
                            if (!pendingException) pendingException = status;
                        }
                    }
                }
            } else if (level === "frozen") {
                for (var k in keys) {
                    key = keys[k];
                    status = GetOwnProperty(O, k);
                    if (isAbrupt(status)) {
                        if (!pendingException) pendingException = status;
                    } else {
                        var currentDesc = unwrap(status);
                        if (currentDesc) {
                            if (IsAccessorDescriptor(currentDesc)) {
                                desc = Object.create(null);
                                desc.get = currentDesc.get;
                                desc.set = currentDesc.set;
                                desc.enumerable = currentDesc.enumerable;
                                desc.configurable = false;
                                status = DefineOwnPropertyOrThrow(O, key, desc);
                                if (isAbrupt(status)) {
                                    if (!pendingException) pendingException = status;
                                }
                            } else {
                                desc = Object.create(null);
                                desc.value = currentDesc.value;
                                desc.writable = false;
                                desc.enumerable = currentDesc.enumerable;
                                desc.configurable = false;

                                status = DefineOwnPropertyOrThrow(O, key, desc);
                                if (isAbrupt(status)) {
                                    if (!pendingException) pendingException = status;
                                }
                            }
                        }
                    }
                }
            }
            if (pendingException) return pendingException;
            return PreventExtensions(O);
        }
    }

    function TestIntegrityLevel(O, level) {
        Assert(Type(O) === "object", "object expected");
        Assert(level === "sealed" || level === "frozen", "level must be sealed or frozen");
        var status = IsExtensible(O);
        if (isAbrupt(status = ifAbrupt(status))) return status;
        if (status === true) return false;
        var keys = OwnPropertyKeysAsList(O); // Array statt iterator
        if (isAbrupt(keys = ifAbrupt(keys))) return keys;
        var pendingException = undefined;
        var key;
        var configurable = false, 
            writable = false;
        for (var k in keys) {
            key = keys[k];
            status = GetOwnProperty(O, key);
            if (isAbrupt(status = ifAbrupt(status))) {
                if (!pendingException) pendingException = status;
                configurable = true;
            } else {
                var currentDesc = unwrap(status);
                if (currentDesc !== undefined) {
                    configurable = configurable && currentDesc.configurable;
                    if (IsDataDescriptor(currentDesc)) {
                        writable = writable && currentDesc.writable;
                    }
                }
            }
        }
        if (pendingException) return pendingException;
        if (level === "frozen" && writable) return false;
        if (configurable) return false;
    }



//#include "lib/api/conversions.js";


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

    function SetFunctionLength(F, L) {
        L = ToLength(L);
        // if (isAbrupt(L)) return L;
        return callInternalSlot("DefineOwnProperty", F, "length", {
            value: L,
            writable: false,
            enumerable: false,
            configurable: false
        });
    }

    function SetFunctionName(F, name, prefix) {
        var success;
        var t = Type(name);
        Assert(t === "string" || t === "symbol", "SetFunctionName: name must be a symbol or a string ("+name+" is "+t+")");
        Assert(IsCallable(F), "SetFunctionName: F has to be an EcmaScript Function Object");
        Assert(!HasOwnProperty(F, "name"), "SetFunctionName: Function may not have a name property");
        if (t === "symbol") {
            var desc = getInternalSlot(name, "Description");
            if (desc === undefined) name = "";
            else name = "[" + desc + "]";
        }
        if (name !== "" && prefix !== undefined) {
            name = prefix + " " + name;
        }
        success = DefineOwnProperty(F, "name", {
            value: name,
            writable: false,
            enumerable: false,
            configurable: false
        });
        if (isAbrupt(success = ifAbrupt(success))) return success;
        if (success === false) return withError("Type", "Sorry, can not set name property of a non function");
        return NormalCompletion(undefined);
    }

    function GeneratorFunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
        if (!fProto) fProto = Get(getIntrinsics(), "%Generator%");
        var F = FunctionAllocate(fProto, "generator");
        return FunctionInitialise(F, kind, paramList, body, scope, strict, homeObject, methodName);
    }

    function FunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
        if (!fProto) fProto = Get(getIntrinsics(), "%FunctionPrototype%");
        var F = FunctionAllocate(fProto);
        return FunctionInitialise(F, kind, paramList, body, scope, strict, homeObject, methodName);
    }

    function FunctionAllocate(fProto, kind) {
        var F;
        Assert(Type(fProto) === "object", "fproto has to be an object");
        if (kind) {
            Assert((kind === "generator" || kind === "normal"), "kind must be generator or normal");
        } else {
            kind = "normal";
        }
        F = OrdinaryFunction();
        setInternalSlot(F, "FunctionKind", kind);
        setInternalSlot(F, "Prototype", fProto);
        setInternalSlot(F, "Extensible", true);
        setInternalSlot(F, "Construct", undefined);
        setInternalSlot(F, "Realm", getRealm());
        return F;
    }

    function FunctionInitialise(F, kind, paramList, body, scope, strict, homeObject, methodName) {
        setInternalSlot(F, "FunctionKind", kind);
        setInternalSlot(F, "FormalParameters", paramList);
        setInternalSlot(F, "Code", body);
        setInternalSlot(F, "Environment", scope);
        setInternalSlot(F, "Strict", strict);
        setInternalSlot(F, "Realm", getRealm());
        if (homeObject) setInternalSlot(F, "HomeObject", homeObject);
        if (methodName) setInternalSlot(F, "MethodName", methodName);
        setInternalSlot(F, "Strict", strict);
        if (kind === "arrow") setInternalSlot(F, "ThisMode", "lexical");
        else if (strict) setInternalSlot(F, "ThisMode", "strict");
        else setInternalSlot(F, "ThisMode", "global");
        return F;
    }

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

    function GetPrototypeFromConstructor(C, intrinsicDefaultProto) {
        var realm, intrinsics;
        Assert((typeof intrinsicDefaultProto === "string"), "intrinsicDefaultProto has to be a string");

        if (!IsConstructor(C)) return withError("Type", "GetPrototypeFromConstructor: C is no constructor");

        var proto = Get(C, "prototype");
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;

        if (Type(proto) !== "object") {
            var realm = getInternalSlot(C, "Realm");
            if (realm) intrinsics = realm.intrinsics;
            else intrinsics = getIntrinsics();
            proto = Get(getIntrinsics(), intrinsicDefaultProto);
        }

        return proto;
    }

    function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto, internalDataList) {

        Assert(HasProperty(getIntrinsics(), intrinsicDefaultProto), "the chosen intrinsic default proto has to be defined in the intrinsic");
        var O, result;
        var proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        return ObjectCreate(proto, internalDataList);
    }

    // 20. Januar

    function CreateFromConstructor(F) {
        var creator = Get(F, $$create);
        if (isAbrupt(creator = ifAbrupt(creator))) return creator;
        if (creator === undefined) return undefined;
        if (IsCallable(creator) === false) return withError("Type", "CreateFromConstructor: creator has to be callable");
        var obj = callInternalSlot("Call", creator, F, []);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        if (Type(obj) !== "object") return withError("Type", "CreateFromConstructor: obj has to be an object");
        return obj;
    }

    function Construct(F, argList) {
        Assert(Type(F) === "object", "essential Construct: F is not an object");
        var obj = CreateFromConstructor(F);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        if (obj === undefined) {
            obj = OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            if (Type(obj) !== "object") return withError("Type", "essential Construct: obj is not an object");
        }
        var result = callInternalSlot("Call", F, obj, argList);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        if (Type(result) === "object") return result;
        return obj;
    }


    function MakeMethod (F, methodName, homeObject) {
        Assert(IsCallable(F), "MakeMethod: method is not a function");
        Assert(methodName === undefined || IsPropertyKey(methodName), "MakeMethod: methodName is neither undefined nor a valid property key");
        var hoType = Type(homeObject);
        Assert(hoType === "undefined" || hoType === "object", "MakeMethod: HomeObject is neither undefined nor object.");
        setInternalSlot(F, "NeedsSuper", true);
        setInternalSlot(F, "HomeObject", homeObject);
        setInternalSlot(F, "MethodName", methodName);
        return NormalCompletion(undefined);
    }

    // vorher 
    function OrdinaryConstruct(F, argList) {
        var creator = Get(F, $$create);
        var obj;
        if (creator) {
            if (!IsCallable(creator)) return withError("Type", "OrdinaryConstruct: creator is not callable");
            obj = callInternalSlot("Call", creator, F, argList);
        } else {
            obj = OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
        }
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        if (Type(obj) !== "object") return withError("Type", "OrdinaryConstruct: Type(obj) is not object");
        var result = callInternalSlot("Call", F, obj, argList);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        if (Type(result) === "object") return result;
        return obj;
    }


    function MakeConstructor(F, writablePrototype, prototype) {
        var installNeeded = false;

        if (!prototype) {
            installNeeded = true;
            prototype = ObjectCreate();
        }
        if (writablePrototype === undefined) writablePrototype = true;
        setInternalSlot(F, "Construct", function Construct(argList) {
            return OrdinaryConstruct(this, argList);
        });
        if (installNeeded) callInternalSlot("DefineOwnProperty", prototype, "constructor", {
            value: F,
            writable: writablePrototype,
            enumerable: false,
            configurable: writablePrototype
        });
        callInternalSlot("DefineOwnProperty", F, "prototype", {
            value: prototype,
            writable: writablePrototype,
            enumerable: false,
            configurable: writablePrototype
        });
        return F;
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

    function MakeSuperReference(propertyKey, strict) {
        var env = GetThisEnvironment();
        if (!env.HasSuperBinding()) return withError("Reference", "Can not make super reference.");
        var actualThis = env.GetThisBinding();
        var baseValue = env.GetSuperBase();
        var bv = CheckObjectCoercible(baseValue);
        if (isAbrupt(bv = ifAbrupt(bv))) return bv;
        if (propertyKey === undefined) propertyKey = env.GetMethodName();
        return Reference(propertyKey, bv, strict, actualThis);
    }

    function GetSuperBinding(obj) {
        if (Type(obj) !== "object") return undefined;
        if (getInternalSlot(obj, "NeedsSuper") !== true) return undefined;
        //if (!hasInternalSlot(obj, "HomeObject")) return undefined;
        return getInternalSlot(obj, "HomeObject");
    }

    function cloneFunction (func) {
        var newFunc = OrdinaryFunction();
        setInternalSlot(newFunc, "Environment", getInternalSlot(func, "Environment"));
        setInternalSlot(newFunc, "Code", getInternalSlot(func, "Code"));
        setInternalSlot(newFunc, "FormalParameterList", getInternalSlot(func, "FormalParameterList"));
        setInternalSlot(newFunc, "ThisMode", getInternalSlot(func, "ThisMode"));
        setInternalSlot(newFunc, "FunctionKind", getInternalSlot(func, "FunctionKind"));
        setInternalSlot(newFunc, "Strict", getInternalSlot(func, "Strict"));
        return newFunc;
    }

    function CloneMethod(func, newHome, newName) {
        Assert(IsCallable(func), "CloneMethod: function has to be callable");
        Assert(Type(newHome) == "object", "CloneMethod: newHome has to be an object");
        Assert(Type(newName) === "undefined" || IsPropertyKey(newName), "CloneMethod: newName has to be undefined or object");
        var newFunc = cloneFunction(func);
        if (getInternalSlot(func, "NeedsSuper") === true) {
            setInternalSlot(newFunc, "HomeObject", newHome);
            if (newName !== undefined) setInternalSlot(newFunc, "MethodName", newName);
            else setInternalSlot(newFunc, "MethodName", getInternalSlot(func, "MethodName"));
        }
        return newFunc;
    }

    function RebindSuper(func, newHome) {
        Assert(IsCallable(func) && func.HomeObject, "func got to be callable and have a homeobject");
        Assert(Type(newHome) === "object", "newhome has to be an object");
        var nu = OrdinaryFunction();
        setInternalSlot(nu, "FunctionKind", getInternalSlot(func, "FunctionKind"));
        setInternalSlot(nu, "Environment", getInternalSlot(func, "Environment"));
        setInternalSlot(nu, "Code", getInternalSlot(func, "Code"));
        setInternalSlot(nu, "FormalParameters", getInternalSlot(func, "FormalParameters"));
        setInternalSlot(nu, "Strict", getInternalSlot(func, "Strict"));
        setInternalSlot(nu, "ThisMode", getInternalSlot(func, "ThisMode"));
        setInternalSlot(nu, "MethodName", getInternalSlot(func, "MethodName"));
        setInternalSlot(nu, "Realm", getInternalSlot(func, "Realm"));
        setInternalSlot(nu, "HomeObject", newHome);
        return nu;
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

    function Put(O, P, V, Throw) {
        Assert(Type(O) === "object", "o has to be an object");
        Assert(IsPropertyKey(P), "property key p expected");
        Assert(Throw === true || Throw === false, "throw has to be false or true");
        var success = callInternalSlot("Set", O, P, V, O);
        if (isAbrupt(success = ifAbrupt(success))) return success;
        if (success === false && Throw === true) return withError("Type", "Put: success false and throw true at P=" + P);
        return success;
    }

    function DefineOwnPropertyOrThrow(O, P, D) {
        Assert(Type(O) === "object", "object expected");
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var success = callInternalSlot("DefineOwnProperty", O, P, D);
        if (isAbrupt(success = ifAbrupt(success))) return success;
        if (success === false) return withError("Type", "DefinePropertyOrThrow: DefineOwnProperty has to return true. But success is false. At P="+P);
        return success;
    }

    function DeletePropertyOrThrow(O, P) {
        Assert(Type(O) === "object", "object expected");
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var success = Delete(O, P);
        if (isAbrupt(success = ifAbrupt(success))) return success;
        if (success === false) return withError("Type", "DeletePropertyOrThrow: Delete failed.");
        return success;
    }

    function OrdinaryDefineOwnProperty(O, P, D) {
        var current = OrdinaryGetOwnProperty(O, P);
        var extensible = getInternalSlot(O, "Extensible");
        return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
    }

    function GetOwnProperty(O, P) {
        return OrdinaryGetOwnProperty(O, P);
    }

    function OrdinaryGetOwnProperty(O, P) {
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var D = Object.create(null); // value: undefined, writable: true, enumerable: true, configurable: true };

        var X = readPropertyDescriptor(O, P);

        if (X === undefined) return;

        if (IsDataDescriptor(X)) {
            D.value = X.value;
            D.writable = X.writable;
        } else if (IsAccessorDescriptor(X)) {
            D.set = X.set;
            D.get = X.get;
        }

        D.configurable = X.configurable;
        D.enumerable = X.enumerable;
        return D;
    }

    function IsCallable(O) {
        if (O instanceof CompletionRecord) return IsCallable(O.value);
        if (Type(O) === "object" && O.Call) return true;
        return false;
    }

    function IsConstructor(F) {
        if (F instanceof CompletionRecord) return IsConstructor(F.value);
        if (F && F.Construct) return true;
        return false;
    }

    function ToPropertyKey(P) {
        if ((P = ifAbrupt(P)) && (isAbrupt(P) || P instanceof SymbolPrimitiveType)) return P;
        return ToString(P);
    }




    function GetOwnPropertyKeys(O, type) {
        var obj = ToObject(O);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        var keys = OwnPropertyKeys(O);
        if (isAbrupt(keys = ifAbrupt(keys))) return keys;
        var nameList = [];
        var gotAllNames = false;
        var next, nextKey;
        while (!gotAllNames) {
            next = IteratorStep(keys);
            if (isAbrupt(next = ifAbrupt(next))) return next;
            if (!next) gotAllNames = true;
            else {
                nextKey = IteratorValue(next);
                if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
                if (Type(nextKey) === type)
                    nameList.push(nextKey);
            }
        }
        return CreateArrayFromList(nameList);
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



//#include "lib/api/types_pre_split.js";


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

    // Structured Clone Algorithms
    // strawman for es7 
    // https://github.com/dslomov-chromium/ecmascript-structured-clone
    function StructuredClone (input, transferList, targetRealm) {
        var memory = []; //mapping 
        for (var i = 0, j = transferList.length; i< j; i++) {
            var transferable = transferList[i];
            if (!hasInternalSlot(transferable, "Transfer")) {
                return withError("Range", "DataCloneError: transferable has no [[Transfer]] slot");
            }
            var Transfer = getInternalSlot(transferable, "Transfer");
            var transferResult = callInternalSlot("Call", Transfer, transferable, [targetRealm]);
            if (isAbrupt(transferResult = ifAbrupt(transferResult))) return transferResult;
            memory.push({ input: transferable, output: transferResult });
        }
        var clone = InternalStructuredClone(input, memory, targetRealm);
        if (isAbrupt(clone = ifAbrupt(clone))) return clone;
        for (var i = 0, j = transferList.length; i < j; i++) {
            var mapping = memory[i];
            transferResult = mapping.output;
            transferable = mapping.input;
            var OnSuccessTransfer = getInternalSlot(transferable, "OnSuccessTransfer");
            callInternalSlot("Call", OnSuccessTransfer, transferable, [transferResult, targetRealm]);
        }
        return NormalCompletion(clone);
    }

    function InternalStructuredClone (input, memory, targetRealm) {
        var output;
        for (var i = 0, j = memory.length; i < j; i++) {
            if (memory[i].transferable === input) return NormalCompletion(memory[i].output);
        }
        if (getInternalSlot(input, "Transfer") === "neutered") return withError("Range", "DataCloneError: inputs [[Transfer]] is neutered.");
        var value;
        if ((value = getInternalSlot(input, "BooleanData")) !== undefined) {
            output = OrdinaryConstruct(getIntrinsic("%Boolean%", targetRealm), [value]);
        }
        else if ((value = getInternalSlot(input, "NumberData")) !== undefined) {
            output = OrdinaryConstruct(getIntrinsic("%Number%", targetRealm), [value]);
        }
        else if ((value = getInternalSlot(input, "StringData")) !== undefined) {
            output = OrdinaryConstruct(getIntrinsic("%String%", targetRealm), [value]);
        }
        else if ((value = getInternalSlot(input, "RegExpMatcher")) !== undefined) {
            output = OrdinaryConstruct(getIntrinsic("%RegExp%", targetRealm), []);
            setInternalSlot(output, "RegExpMatcher", value);
            setInternalSlot(output, "OriginalSource", getInternalSlot(input, "OriginalSource"));
            setInternalSlot(output, "OriginalFlags", getInternalSlot(input, "OriginalFlags"));
        } else if ((value = getInternalSlot(input, "ArrayBufferData")) !== undefined) {
            output = CopyArrayBufferToRealm(input, targetRealm);
            if (isAbrupt(output = ifAbrupt(output))) return output;
        } else if ((value = getInternalSlot(input, "ViewedArrayBuffer")) !== undefined) {
            var arrayBuffer = value;
            //if (OrdinaryHasInstance(getIntrinsic("%DataView%")), input) { // assumes i´m in source realm
            if (!hasInternalSlot(input, "TypedArrayConstructor")) {
                output = OrdinaryConstruct(getIntrinsicFromRealm("%DataView%", targetRealm), []);
                setInternalSlot(output, "ViewedArrayBuffer", getInternalSlot(input, "ViewedArrayBuffer"));
                setInternalSlot(output, "ByteOffset", getInternalSlot(input, "ByteOffset"));
                setInternalSlot(output, "ByteLength", getInternalSlot(input, "ByteLength"));
            } else {
                output = OrdinaryConstruct(getIntrinsicFromRealm("%"+getInternalSlot(input, "TypedArrayConstructor")+"%", targetRealm), []);
                setInternalSlot(output, "ViewedArrayBuffer", getInternalSlot(input, "ViewedArrayBuffer"));
                setInternalSlot(output, "ByteOffset", getInternalSlot(input, "ByteOffset"));
                setInternalSlot(output, "ByteLength", getInternalSlot(input, "ByteLength"));
            }
        } else if (hasInternalSlot(input, "MapData")) {
            // hmmm missing
            // structured clone of values or what is the problem?
        } else if (hasInternalSlot(input, "SetData")) {
            // hmm missing
            // this can be quite hard to have copy all values, but it would be correct to create them again.
        } else if (input instanceof ArrayExoticObject) {
            // i need to know when i am in which realm, first. The functions will not work like they are supposed to now.
            output = ArrayCreate(0); // how do i create them in targetRealm?
            // shall i switch with setRealm(targetRealm), setRealm(sourceRealm) for demo? it has no effect in memory anyways for me yet.
            var len = Get(input, "length", input);
            Set(output, "length", len, output);

        } else if (IsCallable(input)) {
            return withError("Range", "DataCloneError: Can not clone a function.");
        } else if (hasInternalSlot(input, "ErrorData")) {
            return withError("Range", "DataCloneError: Can not clone error object.");
        } else if (Type(input) === "object" && input.toString() !== "[object OrdinaryObject]") {
            return withError("Range", "DataCloneError: Can only copy ordinary objects, no exotic objects");
        } else {
            // setRealm() img.
            output = ObjectCreate();
            // unsetRealm() img.
            var deepClone = true;
        }
        memory.push({ input: input, output: output })
        if (deepClone) {
            var keys = OwnPropertyKeysAsList(output);
            var outputKey;
            for (var i = 0, j = keys.length; i < j; i++) {
                if (Type(key) === "string") outputKey = key;
                // if (Type(key) === "symbol") outputKey = key;
                var sourceValue = Get(input, key);
                if (isAbrupt(sourceValue = ifAbrupt(sourceValue))) return sourceValue;
                var clonedValue = InternalStructuredClone(sourceValue, memory);
                if (isAbrupt(clonedValue = ifAbrupt(clonedValue))) return clonedValue;
                var outputSet = Set(output, outputKey, clonedValue, output)
                if (isAbrupt(outputSet)) return outputSet;
            }
        }
        return NormalCompletion(output);
    }

    // object.[[Transfer]](targetRealm)
    var Transfer_Call = function (thisArg, argList) {
        var targetRealm = argList[0];
        var object = thisArg;
        if (hasInternalSlot(object, "ArrayBufferData"))
            return CopyArrayBufferToRealm(object, targetRealm);
    };

    function CopyArrayBufferToRealm(arrayBuffer, targetRealm) {
        var ArrayBufferConstructor = getIntrinsicFromRealm("%ArrayBuffer%", targetRealm);
        var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
        var srcBlock = getInternalSlot(arrayBuffer, "ArrayBufferData");
        var result = OrdinaryConstruct(ArrayBufferConstructor, []);
        var setStatus = SetArrayBufferData(result, length);
        if (isAbrupt(setStatus)) return setStatus;
        var copyStatus = CopyDataBlockBytes(targetBlock, 0, srcBlock, 0, length);
        if (isAbrupt(copyStatus)) return copyStatus;
        return NormalCompletion(result);
    }

    // object.[[OnSuccessfulTransfer]](transferResult, targetRealm);
    var OnSuccessfulTransfer_Call = function (thisArg, argList) {
        var transferResult = argList[0];
        var targetRealm = argList[1];
        var object = thisArg;
        if (hasInternalProperty(object, "ArrayBufferData")) {
            var neuteringResult = SetArrayBufferData(object, 0);
            if (isAbrupt(neuteringResult = ifAbrupt(neuteringResult))) return neuteringResult;
            setInternalSlot(object, "Transfer", "neutered");
        }
    };


    /* Missing: MessagePort and postMessage and open und close */

    /*
     DataCloneError error object
     Indicates failure of the structured clone algorithm.
     {Rationale: typically, ECMAScript operations throw RangeError for similar failures, but we need to preserve DOM compatibnility}
     */


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

// This is an include directive:
// DO NOT REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//#include "lib/intrinsics/create_intrinsics.js";

    // #################################################################################################################################################################################################
    // #################################################################################################################################################################################################

    exports.createIntrinsics = createIntrinsics;
    exports.setCodeRealm = setCodeRealm;
    exports.saveCodeRealm = saveCodeRealm;
    exports.restoreCodeRealm = restoreCodeRealm;

    return exports;
});

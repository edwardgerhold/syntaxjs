
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

    CodeRealm.prototype.toValue = function (code) {

        saveCodeRealm();
        setCodeRealm(this);
        var result = exports.Evaluate(code);    // here the realm argument...hmm. already in use all over
        // maybe remove the module barriers and simply concat the file.
        restoreCodeRealm();
        return result;
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

    // ===========================================================================================================
    // Reference 
    // ===========================================================================================================

    function Reference(N, V, S, T) {
        var r = Object.create(Reference.prototype);
        r.name = N;
        r.base = V;
        r.strict = S;
        //if (T !== undefined) 
        r.thisValue = T;
        return r;
    }

    Reference.prototype = {
        constructor: Reference,
        toString: function () {
            return "[object Reference]";
        } /*,
         GetValue: function () {
         return GetValue(this);
         },
         PutValue: function (W) {
         return PutValue(this, W);
         },
         IsPropertyReference: function () {
         return IsPropertyReference(this);
         },
         IsSuperReference: function () {
         return IsSuperReference(this);
         },
         IsStrictReference: function () {
         return IsStrictReference(this);
         },
         IsUnresolvableReference: function () {
         return IsUnresolvableReference(this);
         },
         GetReferencedName: function () {
         return GetReferencedName(this);
         },
         GetReferencedKey: function () {
         return GetReferencedKey(this);
         },
         GetBase: function () {
         return GetBase(this);
         },
         HasPrimitiveBase: function () {
         return HasPrimitiveBase(this);
         },
         GetThisValue: function () {
         return GetThisValue(this);
         }*/

    };

    function GetValue(V) {

        if (isAbrupt(V = ifAbrupt(V))) return V;
        if (Type(V) !== "reference") return V;

        var base = V.base;

        if (IsUnresolvableReference(V)) return withError("Reference", "GetValue: '" + V.name + "' is an unresolvable reference");

        if (IsPropertyReference(V)) {

            if (HasPrimitiveBase(V)) {
                Assert(base !== null && base !== undefined, "base never null or undefined");
                base = ToObject(base);
            }

            // object
            return callInternalSlot("Get", base, V.name, GetThisValue(V));
        } else {
            // environment record
            return base.GetBindingValue(V.name, V.strict);
        }

    }

    function PutValue(V, W) {
        if (isAbrupt(V = ifAbrupt(V))) return V;
        if (isAbrupt(W = ifAbrupt(W))) return W;
        if (Type(V) !== "reference") return withError("Reference", "PutValue: V is not a reference");
        var base = V.base;

        if (IsUnresolvableReference(V)) {

            //console.log("unresolvable "+V.name);
            if (V.strict) return withError("Reference", "PutValue: unresolvable Reference");
            var globalObj = GetGlobalObject();
            return Put(globalObj, V.name, W, false);

        } else if (IsPropertyReference(V)) {

            if (HasPrimitiveBase(V)) {
                Assert(base !== null && base !== undefined, "PutValue: base is never null nor undefined");
                base = ToObject(base);
                var succeeded = base.Set(V.name, W, GetThisValue(V));
                if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
                if (succeeded === false && V.strict) return withError("Type", "PutValue: succeeded false but strict true");
                return NormalCompletion();
            }

        } else {

            debug("base setmutable " + V.name);

            return base.SetMutableBinding(V.name, W, V.strict);
        }

    }

    function IsPropertyReference(V) {
        var base = GetBase(V);
        if (Type(base) === "object" || HasPrimitiveBase(V)) return true;
        return false;
    }

    function IsSuperReference(V) {
        if (V.thisValue) return true;
        return false;
    }

    function IsUnresolvableReference(V) {
        if (V.base === undefined) return true;
        return false;
    }

    function IsStrictReference(V) {
        return V.strict === true;
    }

    function GetReferencedName(V) {
        return V.name;
    }

    function GetBase(V) {
        return V.base;
    }

    function HasPrimitiveBase(V) {
        var type = Type(GetBase(V));
        if (type === "string" || type === "boolean" || type === "number" || type === "symbol") return true;
        return false;
    }

    function GetThisValue(V) {
        if (isAbrupt(V = ifAbrupt(V))) return V;
        if (Type(V) !== "reference") return V;
        if (IsUnresolvableReference(V)) return withError("Reference", "GetThisValue: unresolvable reference");
        if (IsSuperReference(V)) return V.thisValue;
        return GetBase(V);
    }

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

    var object_tostring_to_type_table = {
        "[object Reference]": "reference",
        "[object CompletionRecord]": "completion",
        "[object GlobalEnvironment]": "environment",
        "[object GlobalVariableEnvironment]": "environment",
        "[object GlobalLexicalEnvironment]": "environment",
        "[object ObjectEnvironment]": "environment",
        "[object FunctionEnvironment]": "environment",
        "[object DeclarativeEnvironment]": "environment",
        "[object OrdinaryObject]": "object",
        "[object OrdinaryFunction]": "object",
        "[object ProxyExoticObject]": "object",
        "[object PromiseExoticObject]": "object",
        "[object IntegerIndexedExoticObject]": "object",
        "[object StringExoticObject]": "object",
        "[object ArrayExoticObject]": "object",
        "[object ArgumentsExoticObject]": "object",
        "[object SymbolPrimitiveType]": "symbol"
    };

    var primitive_type_string_table = {
        "[object SymbolPrimitiveType]": "symbol",
        "number": "number",
        "string": "string",
        "boolean": "boolean",
        "undefined": "undefined"
    };

    // ===========================================================================================================
    // Type Conversions
    // ===========================================================================================================

    function Type(O) {
        var type = typeof O;
        var tostring;
        if (type === "object") {
            if (O === null) return "null";
            tostring = O.toString();
            if (tostring === "[object CompletionRecord]") return Type(O.value);
            return object_tostring_to_type_table[tostring] || "object";
        }
        return type; // primitive_type_string_table[type];
    }

    function ToPrimitive(V, prefType) {
        var type = typeof V;

        if (V === null) return V;
        if (V === undefined) return V;
        if (type === "object") {

            var s = V.toString();
            if (s === "[object CompletionRecord]") {

                return ToPrimitive(V.value, prefType);

            }
            /* else if (s === "[object OrdinaryObject]") {*/

            else if (hasInternalSlot(V, "NumberData")) return thisNumberValue(V);
            else if (hasInternalSlot(V, "StringData")) return thisStringValue(V);
            else if (hasInternalSlot(V, "BooleanData")) return thisBooleanValue(V);
            else if (hasInternalSlot(V, "SymbolData")) return getInternalSlot(V, "SymbolData");

            else if (s === "[object SymbolPrimitiveType]") {

                return V;

            } else if ((/Environment/).test(s)) {
                throw "Can not convert an environment to a primitive";
            }

            var v = V.valueOf();
            if (v === false) return false;
            if (v === true) return true;
            if (typeof v === "string") return v;
            if (typeof v === "number") return v;

        } else {

            if (type === "boolean") return !!V;
            if (type === "string") return "" + V;
            if (type === "number") return +V;
        }

        if (Type(V) === "symbol") return V;
        var hint;
        var exoticToPrim;
        if (!prefType) hint = "default";
        if (prefType === "string") hint = "string";
        if (prefType === "number") hint = "number";
        exoticToPrim = Get(V, $$toPrimitive);
        if (isAbrupt(exoticToPrim = ifAbrupt(exoticToPrim))) return exoticToPrim;
        var result;
        if (exoticToPrim !== undefined) {
            if (!IsCallable(exoticToPrim)) return withError("Type", "exotic ToPrimitive of object is not a function");
            result = exoticToPrim.Call(V, [hint]);
            if (isAbrupt(result = ifAbrupt(result))) return result;
            if (result !== undefined && Type(result) !== "object") return result;
            else return withError("Type", "Can not convert the object to a primitive with exotic ToPrimitive")
        }
        if (hint === "default") hint === "number";
        return OrdinaryToPrimitive(V, hint);
    }

    function OrdinaryToPrimitive(O, hint) {
        Assert(Type(O) === "object", "o must be an object");
        Assert(Type(hint) === "string" && (hint === "string" || hint === "number"), "hint must be a string equal to the letters string or number");
        var tryFirst;
        var trySecond;

        var list = (hint === "string") ? ["toString", "valueOf"] : ["valueOf", "toString"];

        var func, result;

        for (var i = 0; i < 2; i++) {
            func = Get(O, list[i]);
            if (isAbrupt(func = ifAbrupt(func))) return func;
            if (IsCallable(func)) {
                result = func.Call(O, []);
                if (isAbrupt(result = ifAbrupt(result))) return result;
                if (result !== undefined && Type(result) !== "object") return result;
                else return withError("Type", "Can not convert the object to a primitive with OrdinaryToPrimitive by calling " + list[i]);
            }
        }
        return withError("Type", "Can not convert object to primitive with OrdinaryToPrimitive (end)");
    }

    var ReturnZero = {
        "NaN": true,
        "Infinity": true,
        "-Infinity": true,
        "0": true
    };

    var ReturnNaN = {
        "NaN": true
    };

    var ReturnNum = {
        "Infinity": true,
        "-Infinity": true,
        "0": true
    };

    function ToInt8(V) {
        var view = Int8Array(1);
        view[0] = V;
        return view[0];
    }

    function ToUint8(V) {
        var view = Uint8Array(1);
        view[0] = V;
        return view[0];
    }

    function ToUint8Clamp(V) {
        var view = Uint8ClampedArray(1);
        view[0] = V;
        return view[0];
    }

    function ToUint16(V) {
        var number = ToNumber(V);
        if (isAbrupt(number = ifAbrupt(number))) return number;
        if (ReturnZero[number]) return +0;
        var int = sign(number) * floor(abs(number));
        var int16bit = int % (Math.pow(2, 16));
        return int16Bit;
    }

    function ToInt32(V) {
        var number = ToNumber(V);
        if (isAbrupt(number = ifAbrupt(number))) return number;
        if (ReturnZero[number]) return +0;
        var int = sign(number) * floor(abs(number));
        var int32bit = int % (Math.pow(2, 32));
        if (int >= (Math.pow(2, 31))) return int32bit - (Math.pow(2, 32));
        else return int32bit;
    }

    function ToUint32(V) {
        /*
         var view = new Uint32Array(1);
         view[0] = ToNumber(V);
         return view[0];
         */
        var number = ToNumber(V);
        if (isAbrupt(number = ifAbrupt(number))) return number;
        if (ReturnZero[number]) return +0;
        var int = sign(number) * floor(abs(number));
        var int32bit = int % (Math.pow(2, 32));
        return int32bit;
    }

    function ToInteger(V) {
        var number = ToNumber(V);
        if (isAbrupt(number = ifAbrupt(number))) return number;
        if (ReturnNaN[number]) return +0;
        if (ReturnNum[number]) return number;
        // return sign(number) * floor(abs(number));
        return number|0;
    }

    function ToLength(V) {
        var len = ToInteger(V);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        if (len <= 0) return Completion("normal", 0, "");
        return Completion("normal", min(len, (Math.pow(2, 53)) - 1), "");
    }

    function ToBoolean(V) {
        var type = Type(V);

        if (V instanceof CompletionRecord) return ToBoolean(V.value);

        if (V === undefined) return false;
        if (V === null) return false;

        if (type === "boolean") V = thisBooleanValue(V);
        if (typeof V === "boolean") {
            return V;
        }
        if (type === "number") V = thisNumberValue(V);
        if (typeof V === "number") {
            if (V === +0 || V === -0 || V !== V) return false;
            else return true;
        }

        if (type === "string") V = thisStringValue(V);
        if (typeof V === "string") {
            if (V === "" || V.length === 0) return false;
            return true;
        }

        if (V instanceof SymbolPrimitiveType) return true;
        if (Type(V) === "object") return true;
        return false;
    }

    function ToNumber(V) {
        var T;

        if (V instanceof CompletionRecord) return ToNumber(V.value);

        if (V === undefined) return NaN;
        if (V === null) return +0;
        if (V === true) return 1;
        if (V === false) return 0;

        if ((T = Type(V)) === "number") return V;

        if (T === "string") return +V;

        if (T === "object") {
            var primVal = ToPrimitive(V, "number");
            return ToNumber(primVal);
        }

        return +V;
    }

    function ToString(V) {
        var t;
        var n, k, s;
        if (V instanceof CompletionRecord) return ToString(V.value);
        if (V === null) return "null";
        if (V === false) return "false";
        if (V === true) return "true";
        if (V !== V) return "NaN";
        if ((t = Type(V)) === "number" || typeof v === "number") {
            if (V == 0) return "0";
            if (V < 0) return "-" + ToString(-V);
            if (V === Infinity) return "Infinity";
            return "" + V;
        }
        if (t === "symbol") {
            return withError("Type", "Can not convert symbol to string");
        }
        if (t === "object") {
            if (hasInternalSlot(V, "SymbolData"))
                return withError("Type", "Can not convert symbol to string");

            var primVal = ToPrimitive(V, "string");
            return ToString(primVal);
        }
        return "" + V;
    }

    function ToObject(V) {
        if (isAbrupt(V)) return V;
        if (V instanceof CompletionRecord) return ToObject(V.value);
        if (V === undefined) return withError("Type", "ToObject: can not convert undefined to object");
        if (V === null) return withError("Type", "ToObject: can not convert null to object");

        if (Type(V) === "object") return V;

        if (V instanceof SymbolPrimitiveType) {
            var s = SymbolPrimitiveType();
            setInternalSlot(s, "Prototype", getIntrinsic("%SymbolPrototype%"));
            setInternalSlot(s, "SymbolData", V);
            return s;
        }

        if (typeof V === "number") {
            return OrdinaryConstruct(getIntrinsic("%Number%"), [V]);
        }
        if (typeof V === "string") {
            return OrdinaryConstruct(getIntrinsic("%String%"), [V]);
        }
        if (typeof V === "boolean") {
            return OrdinaryConstruct(getIntrinsic("%Boolean%"), [V]);
        }

        // return V;
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
    // Personal DOM Wrapper (wrap native js into this big bullshit)
    // ===========================================================================================================

    function ExoticDOMObjectWrapper(object) {
        var O = Object.create(ExoticDOMObjectWrapper.prototype);

        setInternalSlot(O, "Target", object);
        setInternalSlot(O, "Symbols", Object.create(null));
        setInternalSlot(O, "Prototype", getIntrinsic("%ObjectPrototype%"));
        setInternalSlot(O, "Extensible", true);
        return O;
    }
    ExoticDOMObjectWrapper.prototype = {
        constructor: ExoticDOMObjectWrapper,
        type: "object",
        toString: function () {
            return "[object EddiesDOMObjectWrapper]";
        },
        Get: function (P) {
            var o = this.Target;
            var p = o[P];
            if (typeof p === "object" && p) {
                return ExoticDOMObjectWrapper(p);
            } else if (typeof p === "function") {
                return ExoticDOMFunctionWrapper(p, o);
            }
            return p;
        },
        Set: function (P, V, R) {
            var o = this.Target;
            return o[P] = V;
        },
        Invoke: function (P, argList, Rcv) {
            var f = this.Target;
            var o = this.Target;

            if ((f = this.Get(P)) && (typeof f === "function")) {
                var result = f.apply(o, argList);
                if (typeof result === "object" && result) {
                    result = ExoticDOMObjectWrapper(result);
                } else if (typeof result === "function") {
                    result = ExoticDOMFunctionWrapper(result, o);
                }
                return result;
            } else if (IsCallable(f)) {
                callInternalSlot("Call", f, o, argList);
            }
        },
        Delete: function (P) {
            var o = this.Target;
            return (delete o[P]);
        },
        DefineOwnProperty: function (P, D) {
            return Object.defineProperty(this.Target, P, D);
        },
        GetOwnProperty: function (P) {
            return Object.getOwnPropertyDescriptor(this.Target, P);
        },
        HasProperty: function (P) {
            return !!(P in this.Target);
        },
        HasOwnProperty: function (P) {
            var o = this.Target;
            return Object.hasOwnProperty.call(o, P);
        },
        GetPrototypeOf: function () {
            var o = this.Target;
            return Object.getPrototypeOf(o);
        },
        SetPrototypeOf: function (P) {
            var o = this.Target;
            return (o.__proto__ = P);
        },
        IsExtensible: function () {
            var o = this.Target;
            return Object.isExtensible(o);
        },
    };

    function ExoticDOMFunctionWrapper(func, that) {
        var F = Object.create(ExoticDOMFunctionWrapper.prototype);
        setInternalSlot(F, "NativeThat", that);
        setInternalSlot(F, "Symbols", Object.create(null));
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Extensible", true);
        return F;
    }
    ExoticDOMFunctionWrapper.prototype = assign(ExoticDOMFunctionWrapper.prototype, ExoticDOMObjectWrapper.prototype);

    ExoticDOMFunctionWrapper.prototype = {
        constructor: ExoticDOMFunctionWrapper,
        toString: function () {
            return "[object EddiesDOMFunctionWrapper]";
        },
        Call: function (thisArg, argList) {
            var f = this.Target;
            var that = this.NativeThat;
            var result = f.apply(that, argList);
            if (typeof result === "object" && result) {
                result = ExoticDOMObjectWrapper(result);
            } else if (typeof result === "function") {
                result = ExoticDOMFunctionWrapper(result, that);
            }
            return result;
        }
    };

    // ===========================================================================================================
    // Symbol PrimitiveType / Exotic Object
    // ===========================================================================================================

    var es5id = Math.floor(Math.random() * (1 << 16));

    function SymbolPrimitiveType(id, desc) {
        var O = Object.create(SymbolPrimitiveType.prototype);
        setInternalSlot(O, "Description", desc);
        setInternalSlot(O, "Bindings", Object.create(null));
        setInternalSlot(O, "Symbols", Object.create(null));
        setInternalSlot(O, "Prototype", null);
        setInternalSlot(O, "Extensible", false);
        setInternalSlot(O, "Integrity", "frozen");
        setInternalSlot(O, "es5id", id || (++es5id + Math.random()));
        //setInternalSlot(O, "Private", false);
        return O;
    }

    SymbolPrimitiveType.prototype = {
        constructor: SymbolPrimitiveType,
        type: "symbol",
        GetPrototypeOf: function () {
            return false;
        },
        SetPrototypeOf: function (P) {
            return false;
        },
        Get: function (P) {
            return false;
        },
        Set: function (P, V) {
            return false;
        },
        Invoke: function (P, Rcv) {
            return false;
        },
        Delete: function (P) {
            return false;
        },
        DefineOwnProperty: function (P, D) {
            return false;
        },
        GetOwnProperty: function (P) {
            return false;
        },
        HasProperty: function (P) {
            return false;
        },
        HasOwnProperty: function (P) {
            return false;
        },
        IsExtensible: function () {
            return false;
        },
        toString: function () {
            return "[object SymbolPrimitiveType]";
        }
    };

    // ===========================================================================================================
    // A Definition of all Standard Builtin Objects (one per Realm is per contract)
    // ===========================================================================================================


    // ===========================================================================================================
    // String Exotic Object
    // ===========================================================================================================

    function StringExoticObject() {
        var S = Object.create(StringExoticObject.prototype);
        setInternalSlot(S, "Bindings", Object.create(null));
        setInternalSlot(S, "Symbols", Object.create(null));
        setInternalSlot(S, "Extensible", true);
        return S;
    }

    StringExoticObject.prototype = assign(StringExoticObject.prototype, {
        HasOwnProperty: function (P) {
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            var has = HasOwnProperty(O, P);
            if (isAbrupt(has = ifAbrupt(has))) return has;
            if (has) return has;
            if (Type(P) !== "string") return false;
            var index = ToInteger(P);
            if (isAbrupt(index = ifAbrupt(index))) return index;
            var absIndex = ToString(abs(index));
            if (SameValue(absIndex, P) === false) return false;
            var str = this.StringData;
            var len = str.length;
            if (len <= index) return false;
            return true;
        },
        GetOwnProperty: function (P) {
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            var desc = OrdinaryGetOwnProperty(this, P);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            if (desc !== undefined) return desc;
            if (Type(P) !== "string") return undefined;
            var index = ToInteger(P);
            if (isAbrupt(index = ifAbrupt(index))) return index;
            var absIndex = ToString(abs(index));
            if (SameValue(absIndex, P) === false) return undefined;
            var str = getInternalSlot(this, "StringData");
            var len = str.length;
            if (len <= index) return undefined;
            var resultStr = str[index];
            return {
                value: resultStr,
                enumerable: true,
                writable: false,
                configurable: false
            };
        },
        DefineOwnProperty: function (P, D) {
            var O = this;
            var current = callInternalSlot("GetOwnProperty", O, P);
            var extensible = IsExtensible(this);
            return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
        },
        Enumerate: function () {
            return Enumerate(this);
        },
        OwnPropertyKeys: function () {
            return OwnPropertyKeys(this);
        },
        toString: function () {
            return "[object StringExoticObject]";
        },
        type: "object"
    });
    addMissingProperties(StringExoticObject.prototype, OrdinaryObject.prototype);

    // ===========================================================================================================
    // ArrayBuffer
    // ===========================================================================================================

    function CreateByteArrayBlock(bytes) {
        return new ArrayBuffer(bytes); //spaeter alloziere auf eigenem heap
    }

    function SetArrayBufferData(arrayBuffer, bytes) {
        Assert(hasInternalSlot(arrayBuffer, "ArrayBufferData"), "[[ArrayBufferData]] has to exist");
        Assert(bytes > 0, "bytes must be a positive integer");

        var block = CreateByteArrayBlock(bytes); // hehe
        setInternalSlot(arrayBuffer, "ArrayBufferData", block);
        setInternalSlot(arrayBuffer, "ArrayBufferByteLength", bytes);
        return arrayBuffer;
    }

    function AllocateArrayBuffer(F) {
        var obj = OrdinaryCreateFromConstructor(F, "%ArrayBufferPrototype%", {
            "ArrayBufferData": undefined,
            "ArrayBufferByteLength": undefined
        });
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        setInternalSlot(obj, "ArrayBufferByteLength", 0);
        return obj;
    }

    // ===========================================================================================================
    // Integer Indexed Exotic Object
    // ===========================================================================================================

    function IntegerIndexedExoticObject() {
        var O = Object.create(IntegerIndexedExoticObject.prototype);
        setInternalSlot(O, "ArrayBufferData", undefined);
        return O;
    }
    IntegerIndexedExoticObject.prototype = assign(IntegerIndexedExoticObject.prototype, {
        DefineOwnProperty: function (P, Desc) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
            if (Type(P) === "string") {
                var intIndex = ToInteger(P);
                if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
                if (SameValue(ToString(intIndex), P)) {
                    if (intIndex < 0) return false;
                    var len = O.ArrayLength;
                    if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                    if (intIndex >= len) return false;
                    if (IsAccessorDescriptor(Desc)) return false;
                    if (Desc.configurable) return false;
                    if (Desc.enumerable === false) return false;
                    var writable = true; // oder nicht... korrigiere hier
                    var makeReadOnly = false;
                    if (Desc.writable !== undefined) {
                        if (Desc.writable && !writable) return false;
                        if (!Desc.writable && writable) makeReadOnly = true;
                    }
                    if (Desc.value !== undefined) {
                        if (!writable) {
                            var oldValue = IntegerIndexedElementGet(O, intIndex);
                            if (isAbrupt(oldValue = ifAbrupt(oldValue))) return oldValue;
                            if (value === undefined) return false;
                            if (!SameValue(value, oldValue)) return false;
                        }
                    }
                    var status = IntegerIndexedElementSet(O, intIndex, value);
                    if (isAbrupt(status = ifAbrupt(status))) return status;
                    if (makeReadOnly) {
                        // mark as non-writable
                    }
                    return true;
                }
            }
            // ordinarygetownproperty im draft, maybe fehler
            return OrdinaryDefineOwnProperty(O, P);
        },
        Get: function (P, R) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            if ((Type(P) === "string") && SameValue(O, R)) {
                var intIndex = ToInteger(P);
                if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
                if (SameValue(ToString(intIndex), P)) return IntegerIndexedElementGet(O, intIndex);
            }
            return Get(O, P, R);
        },
        Set: function (P, V, R) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            if ((Type(P) === "string") && SameValue(O, R)) {
                var intIndex = ToInteger(P);
                if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
                if (SameValue(ToString(intIndex), P)) return ToBoolean(IntegerIndexedElementSet(O, intIndex, V));
            }
            return Set(O, P, V, R);

        },
        GetOwnProperty: function (P) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
            if (Type(P) === "string") {
                var intIndex = ToInteger(P);
                if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
                if (SameValue(ToString(intIndex), P)) {
                    var value = IntegerIndexedElementGet(O, intIndex);
                    if (isAbrupt(value = ifAbrupt(value))) return value;
                    if (value === undefined) return undefined;
                    var writable = true;
                    // setze falsch, falls sie es nciht sind, die props vom integerindexed
                    return {
                        value: value,
                        enumerable: true,
                        writable: writable,
                        configurable: false
                    };
                }
            }
            return OrdinaryGetOwnProperty(O, P);
        },
        HasOwnProperty: function (P) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
            if (Type(P) === "string") {
                var intIndex = ToInteger(P);
                if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
                if (SameValue(ToString(intIndex), P)) {
                    if (intIndex < 0) return false;
                    var len = O.ArrayLength;
                    if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                    if (intIndex >= len) return false;
                }
            }
            return HasOwnProperty(O, P);
        },
        Enumerate: function () {
            return Enumerate(this);
        },
        OwnPropertyKeys: function () {
            return OwnPropertyKeys(this);
        },
        constructor: IntegerIndexedExoticObject,
        toString: function () {
            return "[object IntegerIndexedExoticObject]";
        },
        type: "object"
    });
    addMissingProperties(IntegerIndexedExoticObject.prototype, OrdinaryObject.prototype);

    function IntegerIndexedElementGet(O, index) {
        Assert(Type(index) === "number", "index type has to be number");
        Assert(index === ToInteger(index), "index has to be tointeger of index");
        var buffer = getInternalSlot(O, "ViewedArrayBuffer");
        var length = getInternalSlot(O, "ArrayLength");
        if (index < 0 || index >= length) return undefined;
        var offset = O.ByteOffset;
        var arrayTypeName = O.TypedArrayName;
        var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
        var indexedPosition = (index * elementSize) + offset;
        var elementType = TypedArrayElementType[arrayTypeName];
        return GetValueFromBuffer(buffer, indexedPosition, elementType);
    }

    function IntegerIndexedElementSet(O, index, value) {
        Assert(Type(index) === "number", "index type has to be number");
        Assert(index === ToInteger(index), "index has to be tointeger of index");
        var O = ToObject(ThisResolution());
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var buffer = getInternalSlot(O, "ViewedArrayBuffer");
        if (!buffer) return withError("Type", "object is not a viewed array buffer");
        var length = getInternalSlot(O, "ArrayLength");
        var numValue = ToNumber(value);
        if (isAbrupt(numValue = ifAbrupt(numValue))) return numValue;
        if (index < 0 || index >= length) return numValue;
        var offset = O.ByteOffset;
        var arrayTypeName = O.TypedArrayName;
        var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
        var indexedPosition = (index * elementSize) + offset;
        var elementType = TypedArrayElementType[arrayTypeName];
        var status = SetValueInBuffer(buffer, indexedPosition, elementType, numValue);
        if (isAbrupt(status = ifAbrupt(status))) return status;
        return numValue;
    }

    var TypedArrayElementSize = {
        "Float64Array": 8,
        "Float32Array": 4,
        "Int32Array": 4,
        "Uint32Array": 4,
        "Int16Array": 2,
        "Uint16Array": 2,
        "Int8Array": 1,
        "Uint8Array": 1,
        "Uint8ClampedArray": 1
    };

    var TypedArrayElementType = {
        "Float64Array": "Float64",
        "Float32Array": "Float32",
        "Int32Array": "Int32",
        "Uint32Array": "Uint32",
        "Int16Array": "Int16",
        "Uint16Array": "Uint16",
        "Int8Array": "Int8",
        "Uint8Array": "Uint8",
        "Uint8ClampedArray": "Uint8C"
    };

    var arrayType2elementSize = {
        "Float64": 8,
        "Float32": 4,
        "Int32": 4,
        "Uint32": 4,
        "Int16": 2,
        "Uint16": 2,
        "Int8": 1,
        "Uint8": 1,
        "Uint8Clamped": 1
    };

    var typedConstructors = {
        "Float64": Float64Array,
        "Float32": Float32Array,
        "Int32": Int32Array,
        "Uint32": Uint32Array,
        "Int16": Int16Array,
        "Uint16": Uint16Array,
        "Int8": Int8Array,
        "Uint8": Uint8Array,
        "Uint8Clamped": Uint8ClampedArray
    };

    var typedConstructorNames = {
        "Float64": "%Float64ArrayPrototype%",
        "Float32": "%Float32ArrayPrototype%",
        "Int32": "%Int32ArrayPrototype%",
        "Uint32": "%Uint32ArrayPrototype%",
        "Int16": "%Int16ArrayPrototype%",
        "Uint16": "%Uint16ArrayPrototype%",
        "Int8": "%Int8ArrayPrototype%",
        "Uint8": "%Uint8ArrayPrototype%",
        "Uint8Clamped": "%Uint8ClampedArrayProtoype%"
    };

    function GetValueFromBuffer(arrayBuffer, byteIndex, type, isLittleEndian) {
        var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
        var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
        if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialised or available.");
        var elementSize = arrayType2elementSize[type];
        var rawValue, intValue;
        var help;

        help = new(typedConstructors[type])(bock, byteIndex, 1);
        rawValue = help[0];

        return rawValue;
    }

    function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isLittleEndian) {

        var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
        var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
        if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialised or available.");
        var elementSize = arrayType2elementSize[type];
        var rawValue, intValue;
        var help;

        help = new(typedConstructors[type])(bock, byteIndex, 1);
        help[0] = value;

        return NormalCompletion(undefined);
    }

    function SetViewValue(view, requestIndex, isLittleEndian, type, value) {
        var v = ToObject(view);
        if (isAbrupt(v = ifAbrupt(v))) return v;
        if (!hasInternalSlot(v, "DataArrayBuffer")) return withError("Type", "not a DataArrayBuffer");
        var buffer = getInternalSlot(v, "DataArrayBuffer");
        if (buffer === undefined) return withError("Type", "buffer is undefined");
        var numberIndex = ToNumber(requestIndex);
        var getIndex = ToInteger(numberIndex);
        if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
        if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
        var littleEndian = ToBoolean(isLittleEndian);
        if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
        var viewOffset = getInternalSlot(v, "ByteOffset");
        var viewSize = getInternalSlot(v, "ByteLength");
        var elementSize = TypedArrayElementSize[type];
        if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
        var bufferIndex = getIndex + viewOffset;
        return SetValueInBuffer(buffer, bufferIndex, type, littleEndian);
    }

    function GetViewValue(view, requestIndex, isLittleEndian, type) {
        var v = ToObject(view);
        if (isAbrupt(v = ifAbrupt(v))) return v;
        if (!hasInternalSlot(v, "DataArrayBuffer")) return withError("Type", "not a DataArrayBuffer");
        var buffer = getInternalSlot(v, "DataArrayBuffer");
        if (buffer === undefined) return withError("Type", "buffer is undefined");
        var numberIndex = ToNumber(requestIndex);
        var getIndex = ToInteger(numberIndex);
        if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
        if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
        var littleEndian = ToBoolean(isLittleEndian);
        if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
        var viewOffset = getInternalSlot(v, "ByteOffset");
        var viewSize = getInternalSlot(v, "ByteLength");
        var elementSize = TypedArrayElementSize[type];
        if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
        var bufferIndex = getIndex + viewOffset;
        return GetValueFromBuffer(buffer, bufferIndex, type, littleEndian);
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
        var text = "";
        text += "An exception has been thrown!\r\n";
        text += "exception.name: "+ name + "\r\n";
        text += "exception.message: " + message + "\n";
        text += "exception.stack: " + callstack + "\r\n";
        text += "\r\n";
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

    // ===========================================================================================================
    // Generator Algorithms
    // ===========================================================================================================

    function printCodeEvaluationState() {

        var state = getContext().state;
        var node;
        for (var i = state.length-1; i >= 0; i--) {
            var node = state[i].node;
            var index = state[i].instructionIndex;
            console.log(i + ". ("+index+") " + node.type);
        }

    }

    function generatorCallbackWrong(generator, body) {

        printCodeEvaluationState();
        var result = exports.ResumeEvaluate(body);

        if (isAbrupt(result = ifAbrupt(result))) return result;

        // if (IteratorComplete(result)) {
        if (isAbrupt(result = ifAbrupt(result)) && result.type === "return") {
            //Assert(isAbrupt(result) && result.type === "return", "expecting abrupt return completion");
            setInternalSlot(generator, "GeneratorState", "completed");
            if (isAbrupt(result = ifAbrupt(result))) return result;
            getContext().generatorCallback = undefined;
            return CreateItrResultObject(result, true);
        }

        //}

        //
        //return result;
    }

    function GeneratorStart(generator, body) {

        Assert(getInternalSlot(generator, "GeneratorState") === undefined, "GeneratorStart: GeneratorState has to be undefined");

        var cx = getContext();
        cx.generator = generator;
        cx.generatorCallback = function () {
            // this has to be transferred into a kind of machine.
            // a little piece, how to obtain the right node from the stack has to be cleared
            return generatorCallbackWrong(generator, body);
        };

        setInternalSlot(generator, "GeneratorContext", cx);
        setInternalSlot(generator, "GeneratorState", "suspendedStart");
        return generator;
    }

    function GeneratorResume(generator, value) {

        if (Type(generator) !== "object") return withError("Type", "resume: Generator is not an object");
        if (!hasInternalSlot(generator, "GeneratorState")) return withError("Type", "resume: Generator has no GeneratorState property");
        var state = getInternalSlot(generator, "GeneratorState");
        if (state !== "suspendedStart" && state !== "suspendedYield") return withError("Type", "Generator is neither in suspendedStart nor suspendedYield state");
        var genContext = getInternalSlot(generator, "GeneratorContext");

        var methodContext = getContext();
        getStack().push(genContext);

        setInternalSlot(generator, "GeneratorState", "executing");
        var generatorCallback = genContext.generatorCallback;

        var result = generatorCallback(NormalCompletion(value));
        setInternalSlot(generator, "GeneratorState", "suspendedYield");


        var x = getContext();
        if (x !== methodContext) {
            console.log("GENERATOR ACHTUNG 2: CONTEXT MISMATCH TEST NICHT BESTANDEN - resume");
        }
        return result;
    }

    function GeneratorYield(itrNextObj) {
        Assert(HasOwnProperty(itrNextObj, "value") && HasOwnProperty(itrNextObj, "done"), "expecting itrNextObj to have value and done properties");

        var genContext = getContext();
        var generator = genContext.generator;

        setInternalSlot(generator, "GeneratorState", "suspendedYield");

        var x = getStack().pop();
        if (x !== genContext) {
            console.log("GENERATOR ACHTUNG 1: CONTEXT MISMATCH TEST NICHT BESTANDEN - yield");
        };

        // compl = yield smth;
        genContext.generatorCallback = function (compl) {
            return compl;
        };
        return NormalCompletion(itrNextObj);
    }

    // ===========================================================================================================
    // Iterator Algorithms
    // ===========================================================================================================


    function IsIterable (obj) {
        return HasProperty(obj, $$iterator);
    }

    function CreateItrResultObject(value, done) {
        Assert(Type(done) === "boolean");
        var R = ObjectCreate();
        CreateDataProperty(R, "value", value);
        CreateDataProperty(R, "done", done);
        return R;
    }

    function GetIterator(obj) {
        var iterator = Invoke(obj, $$iterator, []);
        if (isAbrupt(iterator = ifAbrupt(iterator))) return iterator;
        if (Type(iterator) !== "object") return withError("Type", "iterator is not an object");
        return iterator;
    }

    function IteratorNext(itr, val) {
        var result;
        if (arguments.length === 1) result = Invoke(itr, "next", []);
        else result = Invoke(itr, "next", [val]);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        if (Type(result) !== "object") return withError("Type", "IteratorNext: result is not an object");
        return result;
    }

    function IteratorComplete(itrResult) {
        Assert(Type(itrResult) === "object");
        var done = Get(itrResult, "done");
        return ToBoolean(done);
    }

    function IteratorValue(itrResult) {
        Assert(Type(itrResult) === "object");
        return Get(itrResult, "value");
    }

    function CreateEmptyIterator() {
        var emptyNextMethod = OrdinaryFunction();
        setInternalSlot(emptyNextMethod, "Call", function (thisArg, argList) {
            return CreateItrResultObject(undefined, true);
        });
        var obj = ObjectCreate();
        CreateDataProperty(obj, "next", emptyNextMethod);
        return obj;
    }

    function IteratorStep(iterator, value) {
        var result = IteratorNext(iterator, value);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        var done = Get(result, "done");
        if (isAbrupt(done = ifAbrupt(done))) return done;
        if (done === true) return false;
        return result;
    }



    // ===========================================================================================================
    // Array Exotic Object
    // ===========================================================================================================

    function ArrayCreate(len, proto) {
        var p = proto || getIntrinsic("%ArrayPrototype%");
        var array = ArrayExoticObject(p);
        array.Extensible = true;
        if (len !== undefined) {
            array.ArrayInitialisationState = true;
        } else {
            array.ArrayInitialisationState = false;
            len = 0;
        }
        OrdinaryDefineOwnProperty(array, "length", {
            value: len,
            writable: true,
            enumerable: false,
            configurable: false
        });
        return array;
    }

    function ArraySetLength(A, Desc) {
        if (Desc.value === undefined) {
            return OrdinaryDefineOwnProperty(A, "length", Desc);
        }
        var newLenDesc = assign({}, Desc);
        var newLen = ToUint32(Desc.value);
        if (newLen != ToNumber(Desc.value)) return withError("Range", "Array length index out of range");
        newLenDesc.value = newLen;
        var oldLenDesc = A.GetOwnProperty("length");
        if (!oldLenDesc) oldLenDesc = Object.create(null);
        var oldLen = Desc.value;
        if (newLen >= oldLen) return OrdinaryDefineOwnProperty(A, "length", newLenDesc);
        if (oldLenDesc.writable === false) return false;
        var newWritable;
        if (newLenDesc.writable === undefined || newLenDesc.writable === true) newWritable = true;
        else {
            newWritable = false;
            newLenDesc.writable = true;
        }
        var succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
        if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
        if (succeeded === false) return false;
        while (newLen < oldLen) {
            oldLen = oldLen - 1;
            succeeded = A.Delete(ToString(oldLen));
            if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
            if (succeeded === false) {
                newLenDesc.value = oldLen + 1;
                if (newWritable === false) newLenDesc.writable = false;
                succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
                if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
                return false;
            }
        }
        if (newWritable === false) {
            OrdinaryDefineOwnProperty(A, "length", {
                writable: false
            });
        }
        return true;
    }

    function ArrayExoticObject(proto) {
        var A = Object.create(ArrayExoticObject.prototype);
        A.Bindings = Object.create(null);
        A.Symbols = Object.create(null);
        A.Extensible = true;
        if (proto) A.Prototype = proto;
        else A.Prototype = ArrayPrototype;
        return A;
    }
    ArrayExoticObject.prototype = assign(ArrayExoticObject.prototype, OrdinaryObject.prototype);
    ArrayExoticObject.prototype = assign(ArrayExoticObject.prototype, {
        constructor: ArrayExoticObject,
        type: "object",
        toString: function () {
            return "[object ArrayExoticObject]";
        },
        DefineOwnProperty: function (P, Desc) {
            if (IsPropertyKey(P)) {

                if (IsSymbol(P)) return OrdinaryDefineOwnProperty(this, P, Desc);

                if (P === "length") {

                    return ArraySetLength(this, Desc);

                } else {

                    var testP = P;

                    if (ToString(ToInteger(testP)) === ToString(testP)) {
                        var oldLenDesc = GetOwnProperty(this, "length");
                        if (!oldLenDesc) oldLenDesc = Object.create(null);
                        var oldLen = oldLenDesc.value;
                        var index = ToUint32(P);
                        if (isAbrupt(index = ifAbrupt(index))) return index;
                        if (index >= oldLen && oldLenDesc.writable === false) return false;
                        var succeeded = OrdinaryDefineOwnProperty(this, P, Desc);
                        if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
                        if (succeeded === false) return false;
                        if (index >= oldLen) {
                            oldLenDesc.value = index + 1;
                            succeeded = this.DefineOwnProperty("length", oldLenDesc);
                            if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
                        }
                        return true;
                    }

                }

                return OrdinaryDefineOwnProperty(this, P, Desc);
            }
            return false;
        }
    });

    // ===========================================================================================================
    // Arguments Object
    // ===========================================================================================================

    function ArgumentsExoticObject() {
        var O = Object.create(ArgumentsExoticObject.prototype);

        setInternalSlot(O, "Bindings", Object.create(null));
        setInternalSlot(O, "Symbols", Object.create(null));

        setInternalSlot(O, "Prototype", getIntrinsic("%ArrayPrototype%"));

        var map = ObjectCreate();
        setInternalSlot(map, "toString", function () {
            return "[object ParameterMap]";
        });
        setInternalSlot(O, "ParameterMap", map);

        return O;
    }
    ArgumentsExoticObject.prototype = assign(ArgumentsExoticObject.prototype, {

        type: "object",

        toString: function () {
            return "[object ArgumentsExoticObject]";
        },

        Get: function (P) {
            var ao = this;
            var map = getInternalSlot(ao, "ParameterMap");
            var isMapped = map.GetOwnProperty(P);
            if (!isMapped) {
                var v = OrdinaryGetOwnProperty(ao, P);
                if (v !== undefined) v = v.value;
                if (P === "caller" && (Type(v) === "object" && (IsCallable(v) || IsConstructor(v))) && getInternalSlot(v, "Strict")) {
                    return withError("Type", "Arguments.Get: Can not access 'caller' in strict mode");
                }
                return v;
            } else {
                return Get(map, P);
            }

        },
        GetOwnProperty: function (P) {
            var ao = this;
            var desc = readPropertyDescriptor(this, P);
            if (desc === undefined) return desc;
            var map = getInternalSlot(ao, "ParameterMap");
            var isMapped = callInternalSlot("GetOwnProperty", map, P);
            if (isMapped) desc.value = Get(map, P);
            return desc;
        },


        // Muss definitiv einen Bug haben.
        DefineOwnProperty: function (P, Desc) {
            var ao = this;
            var map = getInternalSlot(ao, "ParameterMap");
            var isMapped = callInternalSlot("GetOwnProperty", map, P);
            var allowed = OrdinaryDefineOwnProperty(ao, P, Desc);

            var putStatus;
            if (isAbrupt(allowed = ifAbrupt(allowed))) return allowed;

            if (!allowed) return allowed;

            if (isMapped) {

                if (IsAccessorDescriptor(Desc)) {
                    callInternalSlot("Delete", map, P);
                } else {
                    if (Desc["value"] !== undefined) putStatus = Put(map, P, Desc.value, false);
                    Assert(putStatus === true, "Arguments::DefineOwnProperty: putStatus has to be true");
                    if (Desc.writable === false) callInternalSlot("Delete", map, P);
                }
            }
            return true;
        },
        Delete: function (P) {
            var map = getInternalSlot(this, "ParameterMap");
            var isMapped = callInternalSlot("GetOwnProperty", map, P);
            var result = Delete(this, P);
            if (isAbrupt(result = ifAbrupt(result))) return result;
            if (result && isMapped) callInternalSlot("Delete", map, P);
        },

        constructor: ArgumentsExoticObject
    });

    addMissingProperties(ArgumentsExoticObject.prototype, OrdinaryObject.prototype);

    // ===========================================================================================================
    // Proxy
    // ===========================================================================================================

    function ProxyExoticObject(handler, target) {
        var P = Object.create(ProxyExoticObject.prototype);
        setInternalSlot(P, "Prototype",getIntrinsic("%ProxyPrototype%"));
        setInternalSlot(P, "Extensible", true);
        setInternalSlot(P, "ProxyHandler", handler);
        setInternalSlot(P, "ProxyTarget", target);
        return P;
    }

    ProxyExoticObject.prototype = {
        constructor: ProxyExoticObject,
        type: "object",
        toString: function () {
            return "[object ProxyExoticObject]";
        },
        GetPrototypeOf: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "getPrototypeOf");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return GetPrototypeOf(T);
            var handlerProto = callInternalSlot("Call", trap, handler, [T]);
            if (isAbrupt(handlerProto = ifAbrupt(handlerProto))) return handlerProto;
            var targetProto = GetPrototypeOf(T);
            if (isAbrupt(targetProto = ifAbrupt(targetProto))) return targetProto;
            if (!SameValue(handlerProto, targetProto)) return withError("Type", "handler and target protos differ");
            return handlerProto;
        },

        SetPrototypeOf: function (V) {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "setPrototypeOf");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return SetPrototypeOf(T, V);
            var trapResult = callInternalSlot("Call", trap, H, [T, V]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            trapResult = ToBoolean(trapResult);
            var extensibleTarget = IsExtensible(T);
            if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
            if (extensibleTarget === true) return trapResult;
            var targetProto = GetPrototypeOf(T);
            if (isAbrupt(targetProto = ifAbrupt(targetProto))) return targetProto;
            if (!SameValue(V, targetProto)) return withError("Type", "prototype argument and targetProto differ");
            return trapResult;
        },

        IsExtensible: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "isExtensible");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return IsExtensible(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            trapResult = ToBoolean(trapResult);
            var booleanTrapResult = ToBoolean(trapResult);
            if (isAbrupt(booleanTrapResult = ifAbrupt(booleanTrapResult))) return booleanTrapResult;
            var targetResult = IsExtensible(T);
            if (isAbrupt(targetResult = ifAbrupt(targetResult))) return targetResult;
            if (!SameValue(booleanTrapResult, targetResult)) return withError("Type", "trap and target boolean results differ");
            return booleanTrapResult;
        },

        PreventExtensions: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "preventExtensions");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return PreventExtensions(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            var booleanTrapResult = ToBoolean(trapResult);
            if (isAbrupt(booleanTrapResult = ifAbrupt(booleanTrapResult))) return booleanTrapResult;
            var targetIsExtensible = IsExtensible(T);
            if (isAbrupt(targetIsExtensible = ifAbrupt(targetIsExtensible))) return targetIsExtensible;
            if (booleanTrapResult === true && targetIsExtensible === true) return withError("Type", "target still extensible");
            return targetIsExtensible;
        },

        HasOwnProperty: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "hasOwn");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return HasOwnProperty(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            var success = ToBoolean(trapResult);
            var extensibleTarget;
            var targetDesc;
            if (!success) {
                targetDesc = GetOwnProperty(T, P);
                if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
                if (targetDesc) {
                    if (targetDesc.configurable === false) return withError("Type", "targetDesc.configurable is false");
                    extensibleTarget = IsExtensible(T);
                    if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
                    if (ToBoolean(extensibleTarget) === false) return withError("Type", "target is not extensible");
                }
            } else {
                extensibleTarget = IsExtensible(T);
                if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
                if (ToBoolean(extensibleTarget) === true) return success;
                targetDesc = GetOwnProperty(T, P);
                if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
                if (targetDesc === undefined) return withError("Type", "target descriptor is undefined");
            }
            return success;
        },

        GetOwnProperty: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "getOwnPropertyDescriptor");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return GetOwnProperty(T, P);
            var trapResultObj = callInternalSlot("Call", trap, H, [T, P]);
            if (isAbrupt(trapResultObj = ifAbrupt(trapResultObj))) return trapResultObj;
            if (Type(trapResultObj) !== "object" && Type(trapResultObj) !== "undefined") return withError("Type", "getown - neither object nor undefined");
            var targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            var extensibleTarget;
            if (Type(trapResultObj) === "undefined") {
                if (targetDesc === undefined) return undefined;
                if (targetDesc.configurable === false) return withError("Type", "inconfigurable target problem");
                extensibleTarget = IsExtensible(T);
                if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
                if ((extensibleTarget = ToBoolean(extensibleTarget)) === false) return withError("Type", "target is not extensible");
                return undefined;
            }
            extensibleTarget = IsExtensible(T);
            if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
            extensibleTarget = ToBoolean(extensibleTarget);
            var resultDesc = ToPropertyDescriptor(trapResultObj);
            CompletePropertyDescriptor(resultDesc, targetDesc);
            var valid = IsCompatiblePropertyDescriptor(extensibleTarget, resultDesc, targetDesc);
            if (!valid) return withError("Type", "invalid property descriptor");
            if (resultDesc.configurable === false) {
                if (targetDesc === undefined || targetDesc.configurable === true) return withError("Type", "descriptor configurability mismatch");
            }
            return resultDesc;
        },

        DefineOwnProperty: function (P, D) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "defineProperty");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return DefineOwnProperty(T, P, D);
            var trapResult = callInternalSlot("Call", trap, H, [T, P, D]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            var targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            var extensibleTarget = ToBoolean(extensibleTarget);
            var settingConfigFalse;
            if (D.configurable !== undefined && !D.configurable) {
                settingConfigFalse = true;
            } else settingConfigFalse = false;
            if (targetDesc === undefined) {
                if (!extensibleTarget) return withError("Type", "target not extensible");
                if (settingConfigFalse) return withError("Type", "not configurable descriptor or undefined and no target descriptor?!");
            } else {
                if (!IsCompatiblePropertyDescriptor(extensibleTarget, D, targetDesc)) return withError("Type", "incompatible descriptors");
                if (settingConfigFalse && targetDesc.configurable) return withError("Type", "configurability incomptatiblity");
            }
            return true;
        },

        HasProperty: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "has");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return HasProperty(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            var success = ToBoolean(trapResult);
            if (!success) {
                var targetDesc = GetOwnProperty(T, P);
                if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
                if (targetDesc) {
                    if (targetDesc.configurable === false) return withError("Type", "targetDesc.configurable is false");
                    extensibleTarget = IsExtensible(T);
                    if (isAbrupt(extensibleTarget = ifAbrupt(extensibleTarget))) return extensibleTarget;
                    if (ToBoolean(extensibleTarget) === false) return withError("Type", "target is not extensible");
                }
            }
            return success;
        },

        Get: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "get");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return Get(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;

            var targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            if (targetDesc) {
                if (IsDataDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.writable === false) {
                    if (!SameValue(trapResult, targetDesc.value)) return withError("Type", "trap and target values differ");
                } else if (IsAccessorDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.get === undefined) {
                    if (trapResult) return withError("Type", "Getter problem, undefined and not configurable");
                }
            }
            return trapResult;
        },
        Set: function (P, V, R) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "set");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return Set(T, P, V, R);
            var trapResult = callInternalSlot("Call", trap, H, [T, P, V, R]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            if (ToBoolean(trapResult) === false) return withError("Type", "cant set value with trap");
            var targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            if (targetDesc) {
                if (IsDataDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.writable === false) {
                    if (!SameValue(trapResult, targetDesc.value)) return withError("Type", "trap and target values differ");
                } else if (IsAccessorDescriptor(targetDesc) && targetDesc.configurable === false) {
                    if (targetDesc.set === undefined) return withError("Type", "Getter problem, undefined and not configurable");
                }
            }
            return true;
        },
        Invoke: function (P, A, R) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "invoke");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return Invoke(T, P, A, R);
            var argArray = CreateArrayFromList(A);
            return callInternalSlot("Call", trap, H, [T, P, argArray, R]);
        },
        Delete: function (P) {

            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "deleteProperty");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return Delete(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;

            if (ToBoolean(trapResult) === false) return false;
            var targetDesc = GetOwnProperty(T, P);
            if (isAbrupt(targetDesc = ifAbrupt(targetDesc))) return targetDesc;
            if (targetDesc === undefined) return true;
            if (targetDesc.configurable === false) return withError("Type", "property is not configurable");
            return true;

        },

        Enumerate: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "enumerate");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return Enumerate(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            if (Type(trapResult) !== "object") return withError("Type", "trapResult is not an object");
            return trapResult;
        },
        OwnPropertyKeys: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "ownKeys");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return OwnPropertyKeys(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if (isAbrupt(trapResult = ifAbrupt(trapResult))) return trapResult;
            if (Type(trapResult) !== "object") return withError("Type", "trapResult is not an object");
            return trapResult;
        },

        Call: function (thisArg, argList) {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "apply");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return callInternalSlot("Call",T, thisArg, argList);
            var argArray = CreateArrayFromList(argList);
            return callInternalSlot("Call", trap, H, [T, thisArg, argArray]);
        },

        Construct: function (argList) {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "construct");
            if (isAbrupt(trap = ifAbrupt(trap))) return trap;
            if (trap === undefined) return callInternalSlot("Construct", T, argList);
            var argArray = CreateArrayFromList(argList);
            var newObj = callInternalSlot("Call", trap, H, [T, argArray]);
            if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
            if (Type(newObj) !== "object") return withError("Type", "returned value is not an object");
            return newObj;
        }
    };

    // ===========================================================================================================
    // Date Algorithms
    // ===========================================================================================================

    var msPerDay = 1000 * 60 * 60 * 24;
    var msPerHour = 1000 * 60 * 60;
    var msPerMinute = 1000 * 60;
    var msPerSecond = 1000;
    var minutesPerHour = 60;
    var hoursPerDay = 24;
    var secondsPerMinute = 60;
    var msPerYear = msPerDay * 365;

    function UTC() {

    }

    function thisTimeValue(value) {
        if (value instanceof CompletionRecord) return thisTimeValue(value);
        if (Type(value) === "object" && hasInternalSlot(value, "DateValue")) {
            var b = getInternalSlot(value, "DateValue");
            if (b !== undefined) return b;
        }
        return withError("Type", "thisTimeValue: value is not a Date");
    }

    function Day(t) {
        return Math.floor(t / msPerDay);
    }

    function TimeWithinDay(t) {
        return t % msPerDay;
    }

    function DaysInYear(y) {
        var a = y % 4;
        var b = y % 100;
        var c = y % 400;
        if (a !== 0) return 365;
        if (a === 0 && b !== 0) return 366;
        if (b === 0 && c !== 0) return 365;
        if (c === 0) return 366;
    }

    function DayFromYear(y) {
        return msPerDay * DayFromYear(y);
    }

    function YearFromTime(t) {
        var y = t / (60 * 60 * 24 * 365);
        return y;
    }

    function InLeapYear(t) {
        var diy = DaysInYear(YearFromTime(t));
        if (diy == 365) return 0;
        if (diy == 366) return 1;
    }

    var Months = {
        __proto__: null,
        0: "January",
        1: "February",
        2: "March",
        3: "April",
        4: "May",
        5: "June",
        6: "July",
        7: "August",
        8: "September",
        9: "October",
        10: "November",
        11: "December"
    };

    function MonthFromTime(t) {
        var il = InLeapYear(t);
        var dwy = DayWithinYear(t);
        if (0 <= dwy && dwy < 31) return 0;
        else if (31 <= dwy && dwy < 59 + il) return 1;
        else if (59 + il <= dwy && dwy < 90 + il) return 2;
        else if (90 + il <= dwy && dwy < 120 + il) return 3;
        else if (120 + il <= dwy && dwy < 151 + il) return 4;
        else if (151 + il <= dwy && dwy < 181 + il) return 5;
        else if (181 + il <= dwy && dwy < 212 + il) return 6;
        else if (212 + il <= dwy && dwy < 243 + il) return 7;
        else if (243 + il <= dwy && dwy < 273 + il) return 8;
        else if (273 + il <= dwy && dwy < 304 + il) return 9;
        else if (304 + il <= dwy && dwy < 334 + il) return 10;
        else if (334 + il <= dwy && dwy < 365 + il) return 11;
    }

    function DayWithinYear(t) {
        return Day(t) - DayFromYear(YearFromTime(t));
    }

    function HourFromTime(t) {
        return Math.floor(t / msPerHour) % hoursPerDay;
    }

    function MinFromTime(t) {
        return Math.floor(t / msPerMinute) % minutesPerHour;
    }

    function SecFromTime(t) {
        return Math.floor(t / msPerSecond) % secondsPerMinute;
    }

    function msFromTime(t) {
        return t % msPerSecond;
    }

    function MakeTime(hour, min, sec, ms) {
        if (isFinite(hour) === false) return NaN;
        var h = ToInteger(hour);
        var m = ToInteger(min);
        var sec = ToInteger(sec);
        var milli = ToInteger(ms);
        var t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
        return t;
    }

    function MakeDay(year, month, date) {
        if (!isFinite(time)) return NaN;
        var y = ToInteger(year);
        var m = ToInteger(month);
        var dt = ToInteger(date);
        var ym = Math.floor(m / 12);
        var mn = m % 12;
        var t;
        return Day(t) + dt - 1;
    }

    function MakeDate(day, time) {
        if (!isFinite(day)) return NaN;
        return day * msPerDay + time;
    }

    function TimeClip(time) {
        if (!isFinite(time)) return NaN;
        if (Math.abs(time) > (8.64 * Math.pow(10, 15))) return NaN;
        return ToInteger(time) + (+0);
    }

    function WeekDay (t) {
        return ((Day(t) + 4) % 7);
    }

    // ===========================================================================================================
    // Encode, Decode Algorithms
    // ===========================================================================================================

    function Encode(string, unescapedSet) {
        var strLen = string.length;
        var R = "";
        var k = 0;
        var C, S, cu, V, kChar;
        while (k < strLen) {
            if (k === strLen) return NormalCompletion(R);
            C = string[k];
            if (unescapedSet.indexOf(C) > -1) {
                R += C;
            } else {
                cu = C.charCodeAt(0);
                if (!(cu < 0xDC00) && !(cu > 0xDFFF)) return withError("URI", "Encode: Code unit out of Range");
                else if (cu < 0xD800 || cu > 0xDBFF) {
                    V = cu;
                } else {
                    k = k + 1;
                    if (k === strLen) return withError("URI", "Encode: k eq strLen");
                    kChar = string.charCodeAt(k);
                    if (kChar < 0xDC00 || kChar > 0xDFFF) return withError("URI", "kChar code unit is out of range");
                    V = ((cu - 0xD800) * 0x400 + (kChar - 0xDC00) + 0x10000);
                    /*
                     Achtung Oktett encodierung aus Tabelle 32 (rev 16)
                     */
                }
                var octets = UTF8Encode(V);
                var L = octets.length;
                var j = 0;
                var joctets;
                while (j < L) {
                    joctets = octets[j];
                    S = "%" + joctets.toString(16).toUpperCase();
                    j = j + 1;
                    R = R + S;
                }
            }
            k = k + 1;
        }
        return NormalCompletion(R);
    }

    function UTF8Encode(V) {
        return [V];
    }

    var HexDigits = require("tables").HexDigits; // CAUTION: require

    function Decode(string, reservedSet) {
        var strLen = string.length;
        var R = "";
        var k = 0;
        var S;
        for (;;) {
            if (k === strLen) return NormalCompletion(R);
            var C = string[k];
            if (C !== "%") {
                S = "" + C;
            } else {
                var start = k;
                if (k + 2 >= strLen) return withError("URI", "k+2>=strLen");
                if (!HexDigits[string[k + 1]] || !HexDigits[string[k + 2]]) return withError("URI", "%[k+1][k+2] are not hexadecimal letters");
                var hex = string[k + 1] + string[k + 2];
                var B = parseInt(hex, 16);
                k = k + 2;

            }
            R = R + S;
            k = k + 1;
        }
    }
    var uriReserved = ";/?:@&=+$,";
    var uriUnescaped = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~_.!\"*'()";

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
        for (var i = 0, j = memory.length; i < j; i++) {
            if (memory[i].transferable === input) return NormalCompletion(memory[i].output);
        }
        if (getInternalSlot(input, "Transfer") === "neutered") return withError("Range", "DataCloneError: inputs [[Transfer]] is neutered.");
        var value;
        if ((value = getInternalSlot(input, "BooleanData")) !== undefined) {
            var output = OrdinaryConstruct(getIntrinsic("%Boolean%", targetRealm), [value]);
        }
        else if ((value = getInternalSlot(input, "NumberData")) !== undefined) {
            var output = OrdinaryConstruct(getIntrinsic("%Number%", targetRealm), [value]);
        }
        else if ((value = getInternalSlot(input, "StringData")) !== undefined) {
            var output = OrdinaryConstruct(getIntrinsic("%String%", targetRealm), [value]);
        }
        else if ((value = getInternalSlot(input, "RegExpMatcher")) !== undefined) {
            var output = OrdinaryConstruct(getIntrinsic("%RegExp%", targetRealm), []);
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
                var output = OrdinaryConstruct(getIntrinsicFromRealm("%DataView%", targetRealm), []);
                setInternalSlot(output, "ViewedArrayBuffer", getInternalSlot(input, "ViewedArrayBuffer"));
                setInternalSlot(output, "ByteOffset", getInternalSlot(input, "ByteOffset"));
                setInternalSlot(output, "ByteLength", getInternalSlot(input, "ByteLength"));
            } else {
                var output = OrdinaryConstruct(getIntrinsicFromRealm("%"+getInternalSlot(input, "TypedArrayConstructor")+"%", targetRealm), []);
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
            var output = ArrayCreate(0); // how do i create them in targetRealm?
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
    // REALM (intrinsics, globalthis, globalenv, loader) each Process One
    // #################################################################################################################################################################################################
    // #################################################################################################################################################################################################
    var createGlobalThis;

    function define_intrinsic(intrinsics, intrinsicName, value) {
        var descriptor = Object.create(null);
        descriptor.configurable = true;
        descriptor.enumerable = true;
        descriptor.value = value;
        descriptor.writable = true;
        callInternalSlot("DefineOwnProperty", intrinsics, intrinsicName, descriptor);
    }


    function createIntrinsicConstructor (intrinsics, name, len, intrinsicName) {

        var constructor = OrdinaryFunction();
        define_intrinsic(intrinsics, intrinsicName, constructor);
        SetFunctionName(constructor, name);
        SetFunctionLength(constructor, len);
        return constructor;
    }
    function createIntrinsicFunction (intrinsics, name, len, intrinsicName) {
        var constructor = OrdinaryFunction();
        define_intrinsic(intrinsics, intrinsicName, constructor);
        SetFunctionName(constructor, name);
        SetFunctionLength(constructor, len);
        return constructor;
    }
    function createIntrinsicPrototype (intrinsics, intrinsicName) {
        var prototype = OrdinaryObject();
        define_intrinsic(intrinsics, intrinsicName, prototype);
        return prototype;
    }

    function createIntrinsicObject (intrinsics, intrinsicName) {
        var object = OrdinaryObject();
        define_intrinsic(intrinsics, intrinsicName, object);
        return object;
    }

    function createIntrinsics(realm) {

        var intrinsics = OrdinaryObject(null);
        realm.intrinsics = intrinsics;

        var ObjectPrototype = createIntrinsicPrototype(intrinsics, "%ObjectPrototype%");
        setInternalSlot(ObjectPrototype, "Prototype", null);

        var FunctionPrototype = createIntrinsicPrototype(intrinsics, "%FunctionPrototype%");
        setInternalSlot(FunctionPrototype, "Prototype", ObjectPrototype);

        var FunctionConstructor = createIntrinsicConstructor(intrinsics, "Function", 0, "%Function%");
        setInternalSlot(FunctionConstructor, "Prototype", FunctionPrototype);

        var ObjectConstructor = createIntrinsicConstructor(intrinsics, "Object", 0, "%Object%");

        Assert(getInternalSlot(ObjectConstructor, "Prototype") === FunctionPrototype, "ObjectConstructor and FunctionPrototype have to have a link");

        var EncodeURIFunction = createIntrinsicFunction(intrinsics, "encodeURI", 0, "%EncodeURI%");
        var DecodeURIFunction = createIntrinsicFunction(intrinsics, "ecodeURI", 0, "%DecodeURI%");
        var EncodeURIComponentFunction = createIntrinsicFunction(intrinsics, "EncodeURIComponent", 0, "%EncodeURIComponent%");
        var DecodeURIComponentFunction = createIntrinsicFunction(intrinsics, "DecodeURIComponent", 0, "%DecodeURIComponent%");
        var SetTimeoutFunction = createIntrinsicFunction(intrinsics, "SetTimeout", 0, "%SetTimeout%");
        var SetImmediateFunction = createIntrinsicFunction(intrinsics, "SetImmediate", 0, "%SetImmediate%");
        var IsNaNFunction = createIntrinsicFunction(intrinsics, "isNaN", 0, "%IsNaN%");
        var IsFiniteFunction = createIntrinsicFunction(intrinsics, "isFinite", 0, "%IsFinite%");
        var ParseFloatFunction = createIntrinsicFunction(intrinsics, "parseFloat", 0, "%ParseFloat%");
        var ParseIntFunction = createIntrinsicFunction(intrinsics, "parseInt", 0, "%ParseInt%");
        var EscapeFunction = createIntrinsicFunction(intrinsics, "escape", 0, "%Escape%");
        var UnescapeFunction = createIntrinsicFunction(intrinsics, "unescape", 0, "%Unescape%");
        var EvalFunction = createIntrinsicFunction(intrinsics, "eval", 0, "%Eval%");
        var GeneratorFunction = createIntrinsicFunction(intrinsics, "Generator", 0, "%GeneratorFunction%");
        var LoadFunction = createIntrinsicFunction(intrinsics, "load", 0, "%Load%");
        var RequestFunction = createIntrinsicFunction(intrinsics, "Request", 0, "%Request%");
        var ModuleFunction = createIntrinsicFunction(intrinsics, "Module", 0, "%Module%");
        var SymbolFunction = createIntrinsicFunction(intrinsics, "Symbol", 0, "%Symbol%");

        var RegExpConstructor = createIntrinsicConstructor(intrinsics, "RegExp", 0, "%RegExp%");
        var RegExpPrototype = createIntrinsicPrototype(intrinsics, "%RegExpPrototype%");
        var ProxyConstructor = createIntrinsicConstructor(intrinsics, "Proxy", 0, "%Proxy%");
        var ProxyPrototype = createIntrinsicPrototype(intrinsics, "%ProxyPrototype%");
        var BooleanConstructor = createIntrinsicConstructor(intrinsics, "Boolean", 0, "%Boolean%");
        var BooleanPrototype = createIntrinsicPrototype(intrinsics, "%BooleanPrototype%");
        var NumberConstructor = createIntrinsicConstructor(intrinsics, "Number", 0, "%Number%");
        var NumberPrototype = createIntrinsicPrototype(intrinsics, "%NumberPrototype%");
        var StringConstructor = createIntrinsicConstructor(intrinsics, "String", 0, "%String%");

        var StringPrototype = createIntrinsicPrototype(intrinsics, "%StringPrototype%");
        var StringIteratorPrototype = createIntrinsicPrototype(intrinsics, "%StringIteratorPrototype%");
        var DateConstructor = createIntrinsicConstructor(intrinsics, "Date", 0, "%Date%");
        var DatePrototype = createIntrinsicPrototype(intrinsics, "%DatePrototype%");
        var ErrorConstructor = createIntrinsicConstructor(intrinsics, "Error", 0, "%Error%");
        var ErrorPrototype = createIntrinsicPrototype(intrinsics, "%ErrorPrototype%");
        var ArrayConstructor = createIntrinsicConstructor(intrinsics, "Array", 0, "%Array%");
        var ArrayPrototype = createIntrinsicPrototype(intrinsics, "%ArrayPrototype%");
        var ArrayIteratorPrototype = createIntrinsicPrototype(intrinsics, "%ArrayIteratorPrototype%");

        var GeneratorPrototype = createIntrinsicPrototype(intrinsics, "%GeneratorPrototype%");
        var GeneratorObject = createIntrinsicObject(intrinsics, "%Generator%");
        var ReflectObject = createIntrinsicObject(intrinsics, "%Reflect%");
        var SymbolPrototype = createIntrinsicPrototype(intrinsics, "%SymbolPrototype%");
        var TypeErrorConstructor = createIntrinsicConstructor(intrinsics, "TypeError", 0, "%TypeError%");
        var TypeErrorPrototype = createIntrinsicPrototype(intrinsics, "%TypeErrorPrototype%");
        var ReferenceErrorConstructor = createIntrinsicConstructor(intrinsics, "ReferenceError", 0, "%ReferenceError%");
        var ReferenceErrorPrototype = createIntrinsicPrototype(intrinsics, "%ReferenceErrorPrototype%");
        var SyntaxErrorConstructor = createIntrinsicConstructor(intrinsics, "SyntaxError", 0, "%SyntaxError%");
        var SyntaxErrorPrototype = createIntrinsicPrototype(intrinsics, "%SyntaxErrorPrototype%");
        var RangeErrorConstructor = createIntrinsicConstructor(intrinsics, "RangeError", 0, "%RangeError%");
        var RangeErrorPrototype = createIntrinsicPrototype(intrinsics, "%RangeErrorPrototype%");
        var EvalErrorConstructor = createIntrinsicConstructor(intrinsics, "EvalError", 0, "%EvalError%");
        var EvalErrorPrototype = createIntrinsicPrototype(intrinsics, "%EvalErrorPrototype%");
        var URIErrorConstructor = createIntrinsicConstructor(intrinsics, "URIError", 0, "%URIError%");
        var URIErrorPrototype = createIntrinsicPrototype(intrinsics, "%URIErrorPrototype%");
        var PromiseConstructor = createIntrinsicConstructor(intrinsics, "Promise", 0, "%Promise%");
        var PromisePrototype = createIntrinsicPrototype(intrinsics, "%PromisePrototype%");
        var WeakMapConstructor = createIntrinsicConstructor(intrinsics, "WeakMap", 0, "%WeakMap%");
        var WeakMapPrototype = createIntrinsicPrototype(intrinsics, "%WeakMapPrototype%");
        var WeakSetConstructor = createIntrinsicConstructor(intrinsics, "WeakSet", 0, "%WeakSet%");
        var WeakSetPrototype = createIntrinsicPrototype(intrinsics, "%WeakSetPrototype%");
        var MapConstructor = createIntrinsicConstructor(intrinsics, "Map", 0, "%Map%");
        var MapPrototype = createIntrinsicPrototype(intrinsics, "%MapPrototype%");
        var MapIteratorPrototype = createIntrinsicPrototype(intrinsics, "%MapIteratorPrototype%");
        var SetConstructor = createIntrinsicConstructor(intrinsics, "Set", 0, "%Set%");
        var SetPrototype = createIntrinsicPrototype(intrinsics, "%SetPrototype%");
        var SetIteratorPrototype = createIntrinsicPrototype(intrinsics, "%SetIteratorPrototype%");
        var __mapSetUniqueInternalUniqueKeyCounter__ = 0;
        var TypedArrayConstructor = createIntrinsicConstructor(intrinsics, "TypedArray", 0, "%TypedArray%");
        var TypedArrayPrototype = createIntrinsicPrototype(intrinsics, "%TypedArrayPrototype%");
        var Uint8ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint8Array", 0, "%Uint8Array%");
        var Int8ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int8Array", 0, "%Int8Array%");
        var Uint8ClampedArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint8ClampedArray", 0, "%Uint8ClampedArray%");
        var Int16ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int16Array", 0, "%Int16Array%");
        var Uint16ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint16Array", 0, "%Uint16Array%");
        var Int32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int32Array", 0, "%Int32Array%");
        var Uint32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint32Array", 0, "%Uint32Array%");
        var Float32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Float32Array", 0, "%Float32Array%");
        var Float64ArrayConstructor = createIntrinsicConstructor(intrinsics, "Float64Array", 0, "%Float64Array%");
        var Uint8ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint8ArrayPrototype%");
        var Int8ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Int8ArrayPrototype%");
        var Uint8ClampedArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint8ClampedArrayPrototype%");
        var Int16ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Int16ArrayPrototype%");
        var Uint16ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint16ArrayPrototype%");
        var Int32ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Int32ArrayPrototype%");
        var Uint32ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint32ArrayPrototype%");
        var Float32ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Float32ArrayPrototype%");
        var Float64ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Float64ArrayPrototype%");
        var ArrayBufferConstructor = createIntrinsicConstructor(intrinsics, "ArrayBuffer", 0, "%ArrayBuffer%");
        var ArrayBufferPrototype = createIntrinsicPrototype(intrinsics, "%ArrayBufferPrototype%");
        var DataViewConstructor = createIntrinsicConstructor(intrinsics, "DataView", 0, "%DataView%");
        var DataViewPrototype = createIntrinsicPrototype(intrinsics, "%DataViewPrototype%");
        var JSONObject = createIntrinsicObject(intrinsics, "%JSON%");
        var MathObject = createIntrinsicObject(intrinsics, "%Math%");
        var ConsoleObject = createIntrinsicObject(intrinsics, "%Console%");

        var EmitterConstructor = createIntrinsicConstructor(intrinsics, "Emitter", 0, "%Emitter%");
        var EmitterPrototype = createIntrinsicPrototype(intrinsics, "%EmitterPrototype%");
        // Object.observe
        var NotifierPrototype = createIntrinsicPrototype(intrinsics, "%NotifierPrototype%");
        var ObserverCallbacks = [];
        var LoaderConstructor = createIntrinsicConstructor(intrinsics, "Loader", 0, "%Loader%");
        var LoaderPrototype = createIntrinsicPrototype(intrinsics, "%LoaderPrototype%");
        var LoaderIteratorPrototype = createIntrinsicPrototype(intrinsics, "%LoaderIteratorPrototype%");
        var RealmConstructor = createIntrinsicConstructor(intrinsics, "Realm", 0, "%Realm%");
        var RealmPrototype = createIntrinsicPrototype(intrinsics, "%RealmPrototype%");

        var ModulePrototype = null;

        // that is something from the dom, which is useful for communication and its messaging needs structured cloning so i can check out both
        var EventConstructor = createIntrinsicConstructor(intrinsics, "Event", 0, "%Event%");
        var EventPrototype = createIntrinsicPrototype(intrinsics, "%EventPrototype%");
        var EventTargetConstructor = createIntrinsicConstructor(intrinsics, "EventTarget", 0, "%EventTarget%");
        var EventTargetPrototype = createIntrinsicPrototype(intrinsics, "%EventTargetPrototype%");
        var MessagePortConstructor = createIntrinsicConstructor(intrinsics, "MessagePort", 0, "%MessagePort%");
        var MessagePortPrototype = createIntrinsicPrototype(intrinsics, "%MessagePortPrototype%");


        // ##################################################################
        // Das Code Realm als %Realm%
        // ##################################################################

        var RealmPrototype_get_global = function (thisArg, argList) {
            var realmObject = thisArg;
            if ((Type(realmObject) != "object") || !hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value is no realm object");
            var realm = getInternalSlot(realmObject, "Realm");
            var globalThis = realm.globalThis;
            return globalThis;
        };

        var RealmPrototype_eval = function (thisArg, argList) {
            var source = argList[0];
            var realmObject = thisArg;
            if ((Type(realmObject) != "object") || !hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value is no realm object");
            return IndirectEval(getInternalSlot(realmObject, "Realm"), source);
        };

        var RealmConstructor_Call = function (thisArg, argList) {
            var realmObject = thisArg;
            var options = argList[0];
            var initializer = argList[1];
            if (Type(realmObject) !== "object") return withError("Type", "The this value is not an object");
            if (!hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value has not the required properties.");
            if (getInternalSlot(realmObject, "Realm") !== undefined) return withError("Type", "the realm property has to be undefined");
            if (options === undefined) options = ObjectCreate(null);
            else if (Type(options) !== "object") return withError("Type", "options is not an object");
            var realm = CreateRealm();
            var evalHooks = Get(options, "eval");
            if (isAbrupt(evalHooks = ifAbrupt(evalHooks))) return evalHooks;
            if (evalHooks === undefined) evalHooks = ObjectCreate();
            var directEval = Get(evalHooks, "directEval");
            if (isAbrupt(directEval = ifAbrupt(directEval))) return directEval;
            if (directEval === undefined) directEval = ObjectCreate();
            else if (Type(directEval) !== "object") return withError("Type", "directEval is not an object");
            var translate = Get(directEval, "translate");
            if (isAbrupt(translate = ifAbrupt(translate))) return translate;
            if ((translate !== undefined) && !IsCallable(translate)) return withError("Type", "translate has to be a function");
            setInternalSlot(realm, "translateDirectEvalHook", translate);
            var fallback = Get(directEval, "fallback");
            if (isAbrupt(fallback = ifAbrupt(fallback))) return fallback;
            setInternalSlot(realm, "fallbackDirectEvalHook", fallback);
            var indirectEval = Get(options, "indirect");
            if (isAbrupt(indirectEval = ifAbrupt(indirectEval))) return indirectEval;
            if ((indirectEval !== undefined) && !IsCallable(indirectEval)) return withError("Type", "indirectEval should be a function");
            setInternalSlot(realm, "indirectEvalHook", indirectEval);
            var Function = Get(options, "Function");
            if (isAbrupt(Function = ifAbrupt(Function))) return Function;
            if ((Function !== undefined) && !IsCallable(Function)) return withError("Type", "Function should be a function");
            setInternalSlot(realm, "FunctionHook", Function);
            setInternalSlot(realmObject, "Realm", realm);

            realm.directEvalTranslate = translate;
            realm.directEvalFallback = fallback;
            realm.indirectEval = indirectEval;
            realm.Function = Function;

            if (initializer !== undefined) {
                if (!IsCallable(initializer)) return withError("Type", "initializer should be a function");
                var builtins = ObjectCreate();
                DefineBuiltinProperties(realm, builtins);
                var status = callInternalSlot("Call", initializer, realmObject, [builtins]);
                if (isAbrupt(status)) return status;
            }
            return realmObject;
        };

        var RealmConstructor_Construct = function (argList) {
            var F = this;
            var args = argList;
            return Construct(F, argList);
        };

        var RealmConstructor_$$create = function (thisArg, argList) {
            var F = thisArg;
            var realmObject = OrdinaryCreateFromConstructor(F, "%RealmPrototype%", {
                "Realm": undefined
            });
            return realmObject;
        };

        // %Realm%
        setInternalSlot(RealmConstructor, "Call", RealmConstructor_Call);
        setInternalSlot(RealmConstructor, "Construct", RealmConstructor_Construct);
        LazyDefineProperty(RealmConstructor, $$create, CreateBuiltinFunction(realm,RealmConstructor_$$create, 0, "[Symbol.create]"));
        MakeConstructor(RealmConstructor, false, RealmPrototype);
        // %RealmPrototype%
        LazyDefineAccessor(RealmPrototype, "global", CreateBuiltinFunction(realm,RealmPrototype_get_global, 0, "get global"));
        LazyDefineProperty(RealmPrototype, "eval", CreateBuiltinFunction(realm,RealmPrototype_eval, 1, "eval"));
        LazyDefineProperty(RealmConstructor, $$toStringTag, "Realm");

        // ##################################################################
        // %Loader% und Loader.prototype
        // ##################################################################

        function hasRecordInList(list, field, value) {
            if (!list) return false
            for (var i = 0, j = list.length; i < j; i++) {
                var r = list[i];
                if (r[field] === value) return true;
            }
            return false;
        }
        function getRecordFromList(list, field, value) {
            if (!list) return false;
            for (var i = 0, j = list.length; i < j; i++) {
                var r = list[i];
                if (r[field] === value) return r;
            }
            return undefined;
        }

        function thisLoader(value) {
            if (value instanceof CompletionRecord) return thisLoader(value.value);
            var m;
            if (Type(value) === "object" && (m=getInternalSlot(value, "LoaderRecord"))) {
                if (m !== undefined) return value;
            }
            return withError("Type", "thisLoader(value): value is not a valid loader object");
        }


        //
        // Runtime Semantics
        // Loader State
        //

        // 27.1. add
        function LoaderRecord () {
            var lr = Object.create(LoaderRecord.prototype);
            lr.Realm = undefined;
            lr.Modules = undefined; // record { Name, Module }
            lr.Loads = undefined;   // outstanding async requests
            lr.Loader = undefined;  // the loader obj
            return lr;
        }
        LoaderRecord.prototype.toString = function () { return "[object LoaderRecord]"; };

        // 27.1.
        function CreateLoaderRecord(realm, object) {
            var loader = LoaderRecord();
            loader.Realm = realm;
            loader.Modules = [];
            loader.Loads = [];
            loader.LoaderObj = object;
            return loader;
        }

        function LoadRecord() {
            var lr = Object.create(LoadRecord.prototype);
            lr.Status = undefined;
            lr.Name = undefined;
            lr.LinkSets = undefined;
            lr.Metadata = undefined;
            lr.Address = undefined;
            lr.Source = undefined;
            lr.Kind = undefined;
            lr.Body = undefined;
            lr.Execute = undefined;
            lr.Exception = undefined;
            lr.Module = undefined;
            lr.constructor = LoadRecord;
            return lr;
        }
        LoadRecord.prototype.toString = function () { return "[object LoadRecord]"; };

        // 27.1. check
        function CreateLoad(name) {
            var load = LoadRecord();
            var metadata = ObjectCreate();
            load.Status = "loading";
            load.Name = name;
            load.LinkSets = [];
            load.Metadata = metadata;
            // all other fields are exisiting but undefined.
            return load;
        }

        // 27.1.
        function CreateLoadRequestObject(name, metadata, address, source) {
            var obj = ObjectCreate();
            var status, errmsg = "CreateLoadRequest: CreateDataProperty must not fail";
            status = CreateDataProperty(obj, "name", name);
            Assert(!isAbrupt(status), errmsg+ " - 1");
            status = CreateDataProperty(obj, "metadata", metadata);
            Assert(!isAbrupt(status), errmsg+ " - 2");
            if (address !== undefined) {
                status = CreateDataProperty(obj, "address", address);
                Assert(!isAbrupt(status), errmsg+ " - 3");
            }
            if (source !== undefined) {
                status = CreateDataProperty(obj, "source", source);
                Assert(!isAbrupt(status), errmsg + " - 4");
            }
            return obj;
        }

        // 27.1. updated
        function LoadModule(loader, name, options) {
            debug2("loadmodule")
            if (!options) options = ObjectCreate();
            var name = ToString(name);
            if (isAbrupt(name = ifAbrupt(name))) return name;
            var address = GetOption(options, "address");
            if (isAbrupt(address = ifAbrupt(address))) return address;
            var step;
            if (address === undefined) step = "locate";
            else step = "fetch";
            var metadata = ObjectCreate();
            var source;
            return PromiseOfStartLoadPartWayThrough(step, loader, name, metadata, source, address);
        }

        // 27.1. update
        function RequestLoad(loader, request, refererName, refererAddress) {
            var F = CallNormalize();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Request", request);
            setInternalSlot(F, "RefererName", refererName);
            setInternalSlot(F, "RefererAddress", refererAddress);
            var p = PromiseNew(F);
            var G = GetOrCreateLoad();
            setInternalSlot(G, "Loader", loader);
            p = PromiseThen(p, G);
            return p;
        }


        // neu 27.1.
        function CallNormalize() {
            var F = OrdinaryFunction();
            var CallNormalizeFunction_Call = function (thisArg, argList) {
                var resolve = argList[0];
                var reject = argList[1];
                var loader = getInternalSlot(F, "Loader");
                var request = getInternalSlot(F, "Request");
                var refererName = getInternalSlot(F, "RefererName");
                var refererAddress = getInternalSlot(F, "RefererAddress");
                var loaderObj = loader.LoaderObj;
                var normalizeHook = Get(loaderObj, "normalize");
                var name = callInternalSlot("Call", normalizeHook, loaderObj, [request, refererName, refererAddress]);
                if (isAbrupt(name = ifAbrupt(name))) return name;
                return callInternalSlot("Call", resolve, undefined, [name]);
            };
            setInternalSlot(F, "Call", CallNormalizeFunction_Call);
            return F;
        }

        // neu 27.1.
        function GetOrCreateLoad() {
            var F = OrdinaryFunction();
            var GetOrCreateLoad_Call = function (thisArg, argList) {
                var name = argList[0];
                var loader = getInternalSlot(F, "Loader");
                name = ToString(name);
                if (isAbrupt(name = ifAbrupt(name))) return name;
                var modules = loaderRecord.Modules;
                for (var i = 0, j = modules.length; i < j; i++) {
                    var p = modules[i];
                    if (SameValue(p.key, name)) {
                        var existingModule = p.value;
                        var load = CreateLoad(name);
                        load.Status = "linked";
                        load.Module = existingModule;
                        return NormalCompletion(load);
                    }
                }
                for (i = 0, j = loader.Loads.length; i < j; i++) {
                    if (SameValue(load.Name, name)) {
                        Assert(load.Status === "loading" || load.Status === "loaded", "load.Status has to be loading or loaded");
                        return NormalCompletion(load);
                    }
                }
                var load = CreateLoad(name);
                loader.Loads.push(load);
                ProceedToLocate(loader, load);
                return NormalCompletion(load);
            };
            setInternalSlot(F, "Call", GetOrCreateLoad_Call);
            return F;
        }

        // 27.1. update
        function ProceedToLocate(loader, load, p) {
            p = PromiseOf(undefined);
            var F = CallLocate();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            return ProceedToFetch(loader, load, p);
        }

        // 27.1. update    
        function CallLocate() {
            var F = OrdinaryFunction();
            var CallLocate_Call = function (thisArg, argList) {
                var F = this;
                var loader = getInternalSlot(F, "Loader");
                var load = getInternalSlot(F, "Load");
                var loaderObj = loader.LoaderObj;
                var hook = Get(loaderObj, "locate");
                if (isAbrupt(hook = ifAbrupt(hook))) return hook;
                if (!IsCallable(hook)) return withError("Type", "call locate hook is not callable");
                var obj = CreateLoadRequestObject(load.Name, load.Metadata);
                return callInternalSlot("Call", hook, loader, [obj])
            };
            setInternalSlot(F, "Call", CallLocate_Call);
            return F;
        }

        // 27.1.
        function ProceedToFetch(loader, load, p) {
            var F = CallFetch();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            setInternalSlot(F, "AddressPromise", p);
            p = PromiseThen(p, F);
            return ProceedToTranslate(loader, load, p);
        }

        // 27.1.
        function CallFetch() {
            var F = OrdinaryFunction();
            var CallFetch_Call = function (thisArg, argList) {
                var F = this;
                var address = argList[0];
                var loader = getInternalSlot(F, "Loader");
                if (load.LinkSets.length === 0) return NormalCompletion(undefined);
                load.Address = address;
                var loaderObj = loader.LoaderObj;
                var hook = Get(loaderObj, "fetch");
                if (isAbrupt(hook = ifAbrupt(hook))) return hook;
                if (!IsCallable(hook)) return withError("Type", "fetch hook is not a function");
                var obj = CreateLoadRequestObject(load.Name, load.Metadata, address);
                return callInternalSlot("Call", hook, loader, [obj]);
            };
            setInternalSlot(F, "Call", CallFetch_Call);
            return F;
        }

        // 27.1.
        function ProceedToTranslate(loader, load, p) {
            var F = CallTranslate();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            F = CallInstantiate();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            F = InstantiateSucceeded();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            F = LoadFailed();
            setInternalSlot(F, "Load", load);
            return PromiseCatch(p, F);
        }

        // 27.1.
        function CallTranslate() {
            var F = OrdinaryFunction();
            var CallTranslate_Call = function (thisArg, argList) {
                var F = this;
                var source = argList[0];
                var loader = getInternalSlot(F, "Loader");
                var load = getInternalSlot(F, "Load");
                if (load.LinkSets.length === 0) return NormalCompletion(undefined);
                var hook = Get(loader, "translate");
                if (isAbrupt(hook = ifAbrupt(hook))) return hook;
                if (!IsCallable(hook)) return withError("Type", "call translate hook is not callable");
                var obj = CreateLoadRequestObject(load.Name, load.Metadata, load.Address, source);
                return callInternalSlot("Call", hook, loader, [obj]);
            };
            setInternalSlot(F, "Call", CallTranslate_Call);
            return F;
        }


        // 27.1.
        function CallInstantiate() {
            var F = OrdinaryFunction();
            var CallInstantiate_Call = function (thisArg, argList) {
                var F = this;
                var source = argList[0];
                var loader = getInternalSlot(F, "Loader");
                var load = getInternalSlot(F, "Load");
                if (loader.LinkSets.length === 0) return NormalCompletion(undefined);
                var hook = Get(loader, "instantiate");
                if (isAbrupt(hook = ifAbrupt(hook))) return hook;
                if (!IsCallable(hook)) return withError("Type", "call instantiate hook is not callable");
                var obj = CreateLoadRequestObject(load.Name, load.Metadata, load.Address, source);
                return callInternalSlot("Call", hook, loader, [obj]);
            };
            setInternalSlot(F, "Call", CallInstantiate_Call);
            return F;
        }

        // 27.1.
        function InstantiateSucceeded() {
            var F = OrdinaryFunction();
            var InstantiateSucceeded_Call = function (thisArg, argList) {
                var instantiateResult = argList[0];
                var loader = getInternalSlot(F, "Loader");
                var load = getInternalSlot(F, "Load");
                if (load.LinkSets.length === 0) return NormalCompletion(undefined);
                if (instantiateResult === undefined) {
                    try {
                        var body = parseGoal("Module", load.Source);
                    } catch (ex) {
                        return withError("Syntax", ex.message);
                    }
                    load.Body = body;
                    load.Kind = "declarative";
                    var depsList = ModuleRequests(body);
                } else if (Type(instantiateResult) === "object") {
                    var deps = Get(instantiateResult, "deps");
                    if (isAbrupt(deps = ifAbrupt(deps))) return deps;
                    if (deps === undefined) depsList = [];
                    else {
                        depsList = IterableToList(deps); // IterableToArray?
                        if (isAbrupt(depsList = ifAbrupt(depsList))) return depsList;
                    }
                    var execute = Get(instantiateResult, "execute");
                    if (isAbrupt(execute = ifAbrupt(execute))) return execute;
                    load.Execute = execute;
                    load.Kind = "dynamic";
                } else {
                    return withError("Type", "instantiateResult error");
                }
                return ProcessLoadDependencies(load, loader, depsList);
            };
            setInternalSlot(F, "Call", InstantiateSucceeded_Call);
            return F;
        }

        // 27.1.
        function LoadFailed() {
            var LoadFailedFunction_Call = function (thisArg, argList) {
                var exc = argList[0];
                var F = this;
                var load = getInternalSlot(this, "Load");
                Assert(load.Status === "loading", "load.[[Status]] has to be loading at this point");
                load.Status = "failed";
                load.Exception = exc;
                var linkSets = load.LinkSets;
                for (var i = 0, j = linkSets.length; i < j; i++) {
                    LinkSetFailed(linkSets[i], exc);
                }
                Assert(load.LinkSets.length === 0, "load.[[LinkSets]] has to be empty at this point");
            };
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", LoadFailedFunction_Call);
            return F;
        }

        // 27.1.
        function ProcessLoadDependencies(load, loader, depsList) {
            var refererName = load.Name;
            load.Dependencies = [];
            var loadPromises = [];
            for (var i = 0, j = depsList.length; i < j; i++) {
                var request = depsList[i];
                var p = RequestLoad(loader, request, refererName, load.Address);
                var F = AddDependencyLoad();
                setInternalSlot(F, "Load", load);
                setInternalSlot(F, "Request", request);
                p = PromiseThen(p, F);
                loadPromises.push(p);
            }
            var p = PromiseAll(loadPromises);
            var F = LoadSucceeded();
            setInternalSlot(F, "Load", load);
            return PromiseThen(p, F);
        }

        // 27.1.
        function AddDependencyLoad() {
            var AddDependencyLoad_Call = function (thisArg, argList) {
                var depLoad = argList[0];
                var parentLoad = getInternalSlot(F, "ParentLoad");
                var request = getInternalSlot(F, "Request");
                Assert(!hasRecordInList(parentLoad.Dependencies, "Key", request), "there must be no record in parentLoad.Dependencies with key equal to request ");
                parentLoad.Dependences.push({Key: request, Value: depLoad.Name });
                if (depLoad.Status !== "linked") {
                    var linkSets = parentLoad.LinkSets;
                    for (var i = 0, j = linkSets.length; i < j; i++) {
                        AddLoadToLinkSet(linkSets[i], depLoad);
                    }
                }
                return NormalCompletion(undefined);
            };
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", AddDependencyLoad_Call);
            return F;
        }

        // 27.1.
        function LoadSucceeded() {
            var LoadSucceeded_Call = function (thisArg, argList) {
                var load = getInternalSlot(F, "Load");
                Assert(load.Status === "loading", "load.Status should have been loading but isnt");
                load.Status = "loaded";
                var linkSets = load.LinkSets;
                for (var i = 0, j = linkSets.length; i < j; i++) {
                    UpdateLinkSetOnLoad(linkSets[i], load);
                }
                return NormalCompletion(undefined);
            };
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", LoadSucceeded_Call);
            return F;
        }

        // 27.1.
        function PromiseOfStartLoadPartWayThrough(step, loader, name, metadata, source, address) {
            debug2("PromiseOfStartLoadPartWayThrough: start");
            var F = AsyncStartLoadPartwayThrough();
            var state = Object.create(null);
            state.Step = "translate";
            state.Loader = loader;
            state.ModuleName = name;
            state.ModuleMetadata = metadata;
            state.ModuleSource = source;
            state.ModuleAddress = address;
            setInternalSlot(F, "StepState", state);
            return PromiseNew(F);
        }


        // 26.1
        function AsyncStartLoadPartwayThrough() {
            var F = OrdinaryFunction();
            debug2("AsyncStartLoadPartwayThrough: start")
            var AsyncStartLoadPartwayThrough_Call = function (thisArg, argList) {
                debug2("AsyncStartLoadPartwayThrough_Call");
                var resolve = argList[0];
                var reject = argList[1];
                var state = getInternalSlot(F, "StepState");
                var loader = state.Loader;
                var name = state.ModuleName;
                var step = state.Step;
                var source = state.ModuleSource;

                if (hasRecordInList(loader.Modules, "Name", name)) return withError("Type", "Got name in loader.Modules")
                if (hasRecordInList(loader.Loads, "Name", name)) return withError("Type", "loader.Loads contains another entry with name '"+name+"'");
                var load = CreateLoad(name);
                load.Metadata = state.ModuleMetadata;
                var linkSet = CreateLinkSet(loader, load);

                loader.Loads.push(load);
                var result = callInternalSlot("Call", resolve, null, [linkSet.done]);
                if (step === "locate") {
                    ProceedToLocate(loader, load);
                } else if (step === "fetch") {
                    var addressPromise = PromiseOf(address);
                    ProceedToFetch(loader, load, addressPromise);
                } else {
                    Assert(step === "translate", "step has to be translate");
                    load.Address = state.ModuleAddress;
                    var sourcePromise = PromiseOf(source);
                    ProceedToTranslate(loader, load, sourcePromise);
                }
            };
            setInternalSlot(F, "Call", AsyncStartLoadPartwayThrough_Call);
            return F;
        }
        //
        // Module Linkage
        //

        // 27.1.
        function CreateModuleLinkageRecord (loader, body) {
            var M = ObjectCreate(null);
            setInternalSlot(M, "Body", body);
            setInternalSlot(M, "BoundNames", DeclaredNames(body));
            setInternalSlot(M, "KnownExportEntries", KnownExportEntries(body));
            setInternalSlot(M, "UnknownExportEntries", UnknownExportEntries(body));
            setInternalSlot(M, "ExportDefinitions", undefined);
            setInternalSlot(M, "Exports", undefined);
            setInternalSlot(M, "Dependencies", undefined);
            setInternalSlot(M, "UnlinkedDependencies", undefined);
            setInternalSlot(M, "ImportEntries", ImportEntries(body));
            setInternalSlot(M, "ImportDefinitions", undefined);
            setInternalSlot(M, "LinkErrors", []);
            var realm = loader.Realm;
            var globalEnv = realm.globalEnv;
            var env = NewModuleEnvironment(globalEnv)
            setInternalSlot(M, "Environment", env);
            return M;
        }
        // 27.1.
        function LookupExport(M, exportName) {
            var mExp = getInternalSlot(M, "Exports");
            var exp;
            if (!(exp=getRecordFromList(mExp, "ExportName", exportName))) {
                return NormalCompletion(undefined);
            }
            return exp.Binding;
        }
        // 27.1.
        function LookupModuleDependency(M, requestName) {
            if (requestName === null) return M;
            var deps = getInternalSlot(M, "Dependencies");
            var pair = getRecordFromList(deps, "Key", requestName);
            return pair.Module;
        }

        // 27.1.
        function LinkSet(loader, loads, done, resolve, reject) {
            var ls = Object.create(LinkSet.prototype);
            ls.Loader = loader;
            ls.Loads = loads;
            ls.Done = done;
            ls.Resolve = resolve;
            ls.Reject = reject;
            ls.constructor = LinkSet;
            return ls;
        }
        LinkSet.prototype.toString = function () { return "[object LinkSet]"; }

        // 27.1.
        function CreateLinkSet(loader, startingLoad) {
            debug2("createlinkset")
            if (Type(loader) !== "object") return withError("Type", "CreateLinkSet: loader has to be an object");
            if (!hasInternalSlot(loader, "Load")) return withError("Type", "CreateLinkSet: loader is missing internal properties");
            var promiseCapability = PromiseBuiltinCapability();
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            var linkSet = LinkSet(loader, loads, promiseCapability.Promise, promiseCapability.Resolve, promiseCapability.Reject);
            AddLoadToLinkSet(linkSet, startingLoad);
            return NormalCompletion(linkSet);
        }

        // 27.1.
        function AddLoadToLinkSet(linkSet, load) {
            debug2("add load to linkset");
            Assert(load.Status === "loading" || load.Status === "loaded", "load.Status is either loading or loaded.");
            var loader = linkSet.Loader;
            if (linkSet.indexOf(load) === -1) {     // INDEX-OF (Das ist dieser O(n) den fast jeder bedenkenlos und viel zu oft nimmt)
                linkSet.Loads.push(load);
                load.LinkSets.push(linkSet);
                if (load.Status === "loaded") {
                    for (var i = 0, j = load.Dependencies.length; i < j; i++) {
                        var r = load.Dependencies[i];
                        if (!hasRecordInList(loader.Modules, "Key", name)) {       // Evil cubic stuff.
                            var depLoad;
                            if ((depLoad=getRecordFromList(loader.Loads, "Name", name))) {
                                AddLoadToLinkSet(linkSet, depLoad);
                            }
                        }
                    }
                }
            }
        }


        // 27.1.
        function UpdateLinkSetOnLoad(linkSet, load) {
            debug2("updatelinksetonload")
            var loads = linkSet.Loads;
            Assert(loads.indexOf(loads) > -1, "linkset.Loads has to contain load");
            Assert(load.Status === "loaded" || load.Status === "linked", "load.Status must be one of loaded or linked");
            for (var i = 0, j = loads.length; i < j; i++) {
                var load = loads[i];
                if (load.Status === "loading") return NormalCompletion(undefined);
            }
            var startingLoad = loads[0];
            var status = Link(loads, linkSet.Loader);
            if (isAbrupt(status)) {
                return LinkSetFailed(linkSet, status.value);
            }
            Assert(linkSet.Loads.length === 0, "linkset.Loads has to be empty here");
            var result = callInternalSlot("Call", linkset.Resolve, undefined, [startingLoad]);
            Assert(!isAbrupt(result), "linkSet.resolve had to terminate normally");
            return result;
        }

        // 27.1.
        function LinkSetFailed(linkSet, exc) {
            debug2("linksetfailed")
            var loader = linkSet.Loader;
            var loads = linkSet.Loads;
            for (var i = 0, j = loads.length; i < j; i++) {
                var load = loads[i];
                var idx;
                Assert((idx = load.LinkSets.indexOf(v)) > -1, "load.LinkSets has to contain linkset");
                load.LinkSets.splice(idx,1);    // SPLICE KOSTET EXTRA
                if ((load.LinkSets.length === 0) && ((idx=loader.Loads.indexOf(load)) > -1)) {
                    loader.Loads.splice(idx,1); // SPLICE KOSTET EXTRA
                }
            }
            var result = callInternalSlot("Call", linkset.Reject, undefined, [exc]);
            Assert(!isAbrupt(result), "linkSet.reject had to terminate normally")
            return NormalCompletion(result);
        }

        // 27.1.    USING EXPENSIVE SPLICES to EMPTY the array (and .indexOf Arrays )
        function FinishLoad(loader, load) {
            debug2("finishload")
            var name = load.Name;
            if (name !== undefined) {
                Assert(!hasRecordInList(loader.Modules, "Key", load.Name), "there may be no duplicate records in loader.Modules")
                loader.Modules.push({ key: load.Name, value: load.Module });
            }
            var idx;
            if ((idx=loader.Loads.indexOf(load)) > -1) {
                load.Loads.splice(idx, 1);
            }
            for (var i = 0, j = load.LinkSets.length; i < j; i++) {
                var loads = load.LinkSets[i].Loads;
                idx = loads.indexOf(loads);
                if (idx>-1) {
                    loads.splice(idx, 1);
                }
            }
            load.LinkSets.splice(0, load.linkSets.length);
        }


        //
        // Module Linking Groups
        //


        /*


         1. Ein load record load hat eine "Verknüpfungsabhängigkeit" auf einem load record "load2 ", wenn load2 in
         load1.UnlinkedDependencies enthalten ist, oder ein load record load1.UnlinkedDependencies existiert, dass
         load eine Verknüpfungsabhängigkeit auf load2 hat.

         2. Ein Verknüpfungsgraph einer Liste "list" aus load records ist die MEnge der Load Records load, so daß
         irgendein load record in "list" eine Verknüpfungsabhängigkeit auf load hat.

         3. eine Abhängigkeitskette von load1 zu load2 ist eine Liste von load records, die die transitive
         Verknüpfungsabhängigkeit von load1 nach load2 beweist.

         4. Ein Abhängigkeitscycle ist eine Abhängigkeitskette deren erstes und letztes Elements [[Name]] Felder
         den gleichen Wert haben.

         Eine Abhängigkeitskette ist zyklisch wenn sie eine Subsequence enthält, die ein Abhängigkeitszyklus ist. Eine
         KEtte ist azyklisch wenn sie nicht zyklisch ist.


         Eine dependency chain ist mixed, wenn sie zwei elemente mit unterschiedlichen Kind Feldern enthält. Eine
         dependency-group-transition mit Kind Kind ist eine Zwei-Element-Subsequence load1 und load2 einer
         Abhängigkeitskette, so daß load1.Kind nicht gleich kind ist und load2.Kind gleich kind ist.

         Der dependency group count ist eine dependency kette mit dem ersten element load1 ist die Nummer der unterschiedlichen
         dependencygrouptransitions of kind load1.Kind.

         */

        // 29.1.



        function LinkageGroups(start) {
            Assert(Array.isArray(start), "start has to be a list of LinkSet Records");
            debug2("linkage groups starts")
            var G = start.Loads;
            var kind;
            for (var i = 0, j = G.length; i < j; i++) {
                var load = G[i];
                if (load.Kind != kind) {
                    if (kind === undefined)
                        kind = G[i].Kind;
                    else return withError("Syntax", "all loads must be of the same kind");
                }
            }
            var n = 0;
            for (i = 0, j = G.length; i < j; i++) {
                load = G[i];
                n = max(n, load.UnlinkedDependencies.length);
            }


            var declarativeGroupCount = n;
            var declarativeGroups = [];
            var dynamicGroupCount = 0;
            var declarativeGroups = [];
            var visited = [];

            for (var i = 0, j = G.length; i < j; i++) {
                var load = G[i];
                BuildLinkageGroups(load, declarativeGroups, dynamicGroups, visited);
            }
            var first = declarativeGroups[0];
            if (hasRecordInList(first, "Kind", "dynamic")) {
                var groups = interleaveLists(dynamicGroups, declarativeGroups);
            } else {
                var groups = interleaveLists(declarativeGroups, dynamicGroups);
            }
            return groups;

        }

        function interleaveLists(list1, list2) {
            // temp. doing nothing
            return list1.concat(list2);
        }


        // 28.1.
        function BuildLinkageGroups(load, declarativeGroups, dynamicGroups, visited) {
            if (hasRecordInList(visited, "Name", load.Name)) return NormalCompletion(undefined);
            visited.push(load);
            for (var i = 0, j = load.UnlinkedDependencies.length; i < j; i++) {
                BuildLinkageGroups(dep, declarativeGroups, dynamicGroups, visitied);
            }
            i = load.GroupIndex;
            if (load.Kind === "declarative") {
                var groups = declarativeGroups;
            } else {
                groups = dynamicGroups;
            }
            var group = groups[i];
            group.push(load);
            return NormalCompletion(undefined);
        }


        // 28.1.
        function Link(start, loader) {
            var groups = LinkageGroups(start);
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                if (group[0].Kind === "declarative") {
                    LinkDeclarativeModules(group, loader)
                } else {
                    LinkDynamicModules(group, loader);
                }
            }
        }


        // 28.1
        function LinkImports(M) {
            var envRec = getInternalSlot(M, "Environment");
            var defs = getInternalSlot(M, "ImportDefinitions");
            for (var i = 0; i < defs.length; i++) {
                var def = defs[i];
                if (def.ImportName === "module") {
                    envRec.CreateImmutableBinding(def.LocalName);
                    envRec.InitialiseBinding(def.LocalName, def.Module);
                } else {
                    var binding = ResolveExport(def.Module, def.ImportName);
                    if (binding === undefined) {
                        var error = withError("Reference", "Can not resolve export to a binding record");
                        var linkErrors = getInternalSlot(M, "LinkErrors");
                        linkErrors.push(error);
                        return error;
                    }  else {
                        env.CreateImportBinding(envRec, def.LocalName);
                        // THIS FUNCTION DOES NOT EXIST YET.
                    }
                }
            }
        }


        // 31.1. 
        function ResolveExportEntries(M, visited) {
            var exportDefs = getInternalSlot(M, "ExportDefinitions");
            if (exportDefs != undefined) return exportDefs;
            var defs = [];
            var boundNames = getInternalSlot(M, "BoundNames");
            var knownExportEntries = getInternalSlot(M, "KnownExportEntries");
            var linkErrors = getInternalSlot(M, "LinkErrors");
            for (var i = 0, j = knownExportEntries.length; i < j; i++) {

                var entry = knownExportEntries[i];
                var modReq = entry.ModuleRequest
                var otherMod = LookupModuleDependency(M, modReq);

                if (entry.Module !== null && entry.LocalName !== null && !boundNames[entry.LocalName]) { // caps
                    var error = withError("Reference", "linkError created in ResolveExportEntries");
                    linkErrors.push(error);
                }
                defs.push({ Module: otherMod, ImportName: entry.ImportName, LocalName: entry.LocalName,
                    ExportName: entry.ExportName, Explicit: true });

            }
            var MUEE = M.UnknownExportEntries;
            for (var i = 0; i < MUUE.length; i++) {
                modReq = LookupModuleDependency(M, modReq);
                if (visited.indexOf(otherMod) > -1) {
                    error = withError("Syntax", "otherMod is alreay in visited");
                    linkErrors.push(error);
                } else {
                    visited.push(otherMod);
                    var otherDefs = ResolveExportEntries(otherMod, visited);
                    for (var j = 0, k = otherDefs.length; j < k; j++) {
                        var def = otherDefs[j];
                        defs.push({ Module: otherMod, ImportName: def.ExportName, LocalName: null, ExportName: def.ExportName,
                            Explicit: false });
                    }
                }
            }
            setInteranlSlot(M, "ExportDefinitions", defs);
            return defs;
        }

        // 28.1.
        function ResolveExports(M) {
            debug2("resolve exports");
            var exportDefinitions = getInternalSlot(M, "ExportDefinitions");
            for (var i = 0, j = exportDefinitions.length; i < j; i++) {
                var def = exportDefinitions[i];
                ResolveExport(M, def.exportName, []);
            }
        }

        // 29.1
        function ResolveExport(M, exportName, visited) {
            debug2("resolve export");
            var exports = getInternalSlot(M,"Exports");
            var exported;
            if (exported=getRecordFromList(exports, "ExportName", exportName)) {
                return NormalCompletion(exported.Binding)
            }
            var ref = { Module: M, ExportName: exportName };
            if (visited.indexOf(ref) !== -1) {
                var error = withError("Syntax", "ResolveExport: can not find ref in visited");
                var linkErrors = getInternalSlot(M, "LinkErrors");
                linkErrors.push(error);
            }
            var defs = getInternalSlot(M, "ExportDefinitions");
            var overlappingDefs = [];
            for (var i = 0, j = defs.length; i < j; i++) {
                var def = defs[i];
                if (def.ExportName === exportName) overlappingDefs.push(def);
            }
            if (!overlappingDefs.length) {
                error = withError("Reference", "ResolveExport: overlappingDefs is empty");
                linkErrors = getInternalSlot(M, "LinkErrors");
                linkErrors.push(error);
            }
            var explicits = [];
            for (var i = 0, j = overlappingDefs.length; i < j; i++) {
                var overlappingDef = overlappingDefs[i];
                if (overlappingDef.Explicit === true) explicits.push(overlappingDef);
            }
            if ((explicits.length > 1) || ((overlappingDefs.length > 1) && !explicits.length)) {
                error = withError("Syntax", "");
                linkErrors = getInternalSlot(M, "LinkErrors");
                linkErrors.push(error);
                return error;
            }

            def = getRecordFromList(overlappingDefs, "Explicit", true);
            if (!def) def = overlappingDefs[0];
            Assert(def, "i should have a def here");
            if (def.LocalName !== null) {
                var binding = { Module: M, LocalName: def.LocalName };
                var exported = { ExportName: exportName, Binding: binding };
                exports.push(exported);
                return binding;

            }
            visited.push(ref);
            var binding = ResolveExport(def.Module, def.ImportName);
            return binding;
        }

        // 28.1.
        function ResolveImportEntries(M) {
            var entries = getInternalSlot(M, "ImportEntries");
            var defs = [];
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var modReq = entry.ModuleRequest;
                var otherMod = LookupModuleDependency(M, modReq);
                var record = { Module: otherMod, ImportName: entry.ImportName, localName: entry.LocalName };
                defs.push(record);
            }
            return defs;
        }


        // 28.1.
        function LinkDynamicModules(loads, loader) {
            for (var i = 0; i < loads.length; i++) {
                var load = loads[i];
                var factory = load.Execute;
                var module = callInternalSlot("Call", factory, undefined, []);
                if (isAbrupt(module = ifAbrupt(module))) return module;

                if (!hasInternalSlot(module, "Exports")) {
                    return withError("Type", "module object has not the required internal properties");
                }
                load.Module = module;
                load.Status = "linked";
                var r = FinishLoad(loader, load);
                if (isAbrupt(r)) return r;
            }
        }




        function LinkDeclarativeModules(loads, loader) {
            var unlinked = [];
            for (var i = 0, j = loads.length; i < j; i++) {
                var module =CreateModuleLinkageRecord(loader, load.Body);
                var pair ={ Module: module, Load: load };
                unlinked.push(pair);
            }
            for (i = 0, j = loads.length; i < j; i++) {
                var resolvedDeps = [];
                var unlinkedDeps = [];
                var pair = loads[i]
                var deps = pair.load.Dependencies;
                var pairModule = pair.Module;
                for (var k = 0; k < deps.length; k++) {
                    var dep = deps[k];
                    var requestName = dep.Key;
                    var normalizedName = dep.Value;
                    var load;
                    if (load = getRecordFromList(loads, "Name", normalizedName)) {
                        if (load.Status === "linked") {
                            var resolvedDep = genericRecord({ Key: requestName, Value: load.Module });
                            resolvedDeps.push(resolvedDep);
                        } else {
                            for (var m = 0; m < unlinked.lengh; m++) {
                                var otherPair = unlinked[i];
                                if (otherPair.Load.Name == normalizedName) {
                                    resolvedDeps.push(genericRecord({ Key: requestName, Value: otherPair.Module }));
                                    unlinkedDeps.push(otherPair.Load);
                                }
                            }
                        }
                    } else {
                        var module = LoaderRegistryLookup(loader, normalizedName);
                        if (module === null) {
                            var error = withError("Reference","");
                            pair.Module.LinkErrors.push(error);

                        } else {
                            resolvedDeps.push({ Key: requestName, Value: module });
                        }
                    }
                }
                pairModule.Dependencies = resolvedDeps;
                pairModule.UnlinkedDependencies = unlinkedDeps;
            }
            for (i = 0, j = unlinked.length; i < j; i++) {
                pair = unlinked[i];
                ResolveExportEntries(pair.Module, []);
                ResolveExports(pair.Module);
            }
            for (i = 0, j = unlinked.length; i < j; i++) {
                pair = unlinked[i];
                ResolveExportEntries(pair.Module, []);
                ResolveExports(pair.Module);
            }
        }


        // 29.1
        function EvaluateLoadedModule() {
            var EvaluateLoadedModule_Call = function (thisArg, argList) {
                var F = thisArg;
                var load = argList[0];
                var loader = getInternalSlot(F, "Loader");
                Assert(load.Status === "linked", "load.Status has to be linked here");
                var module = load.Module;
                var result = EnsureEvaluated(module, [], loader);
                if (isAbrupt(result)) return result;
                return NormalCompletion(module);
            };
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", EvaluateLoadedModule_Call);
            return F;
        }



        // 29.1.
        function EnsureEvaluated(mod, seen, loader) {
            seen.push(mod);
            var deps = mod.Dependencies;
            for (var i = 0, j = deps.length; i < j; i++) {
                var pair = deps[i];
                var dep = pair.value;
                if (seen.indexOf(dep) === -1) EnsureEvaluated(dep, seen, loader);
                // index of is so expensive
            }
            if (getInternalSlot(mod, "Evaluated") === true) return NormalCompletion(undefined);
            setInternalSlot(mod, "Evaluated", true);
            var body;
            if ((body=getInternalSlot(mod, "Body")) === undefined) return NormalCompletion(undefined);
            var env = getInternalSlot(mod, "Environment");
            var status = ModuleDeclarationInstantiation(body, env);
            var initContext = ExecutionContext(null);
            initContext.realm = getInternalSlot(loader, "Realm");
            initContext.VarEnv = env;
            initContext.LexEnv = env;
            var stack = getStack();
            if (stack.length) getStack().pop();
            stack.push(initContext);
            cx  = initContext;
            var r = Evaluate(body);
            Assert(stack.pop() === initContext, "EnsureEvaluated: The right context could not be popped off the stack.");
            return r;
        }



        // remaining 


        function IterableToList(iterable) {
            debug2("iterable2list");
            //var A = ArrayCreate();
            var A = [];
            var next, status;
            while (next = IteratorStep(iterable)) {
                A.push(next);
                // status = Invoke(A, "push", [next]);
                //if (isAbrupt(status)) return status;
            }
            return A;
        }

        // Seite 21 von 43

        function GetOption(options, name) {
            debug2("get options")
            if (options == undefined) return undefined;
            if (Type(options) !== "object") return withError("Type", "options is not an object");
            return Get(options, name);
        }

        function OrdinaryModule() {
            debug2("ordinarymodule");
            var mod = ObjectCreate(null, {
                "Environment": undefined,
                "Exports": undefined,
                "Dependencies": undefined
            });
            return mod;
        }
        function Module(obj) {
            if (Type(obj) !== "object") return withError("Type", "module obj is not an object");
            var mod = OrdinaryModule();
            var keys = OwnPropertyKeysAsList(obj);
            for (var k in keys) {
                var key = keys[k];
                var value = Get(obj, key);
                if (isAbrupt(value = ifAbrupt(value))) return value;
                var F = CreateConstantGetter(key, value);
                var desc = {
                    get: F,
                    set: undefined,
                    enumerable: true,
                    configurable: false
                };
                var status = DefineOwnPropertyOrThrow(mod, key, desc);
                if (isAbrupt(status = ifAbrupt(status))) return status;
            }
            callInternalSlot("PreventExtensions", mod, mod, []);
            return mod;
        }


        /************************* unupdated end ****/


        var LoaderConstructor_Call = function (thisArg, argList) {
            var options = argList[0];
            var loader = thisArg;

            if (options === undefined) options = ObjectCreate();
            if (Type(loader) !== "object") return withError("Type", "Loader is not an object");

            if (getInternalSlot(loader, "LoaderRecord") !== undefined) return withError("Type", "loader.[[LoaderRecord]] isnt undefined");
            if (Type(options) !== "object") return withError("Type", "the Loader constructors´ options argument is not an object");

            var realmObject = Get(options, "realm");
            if (isAbrupt(realmObject = ifAbrupt(realmObject))) return realmObject;

            var realm;
            if (realmObject === undefined) realm = getRealm();
            else {
                if ((Type(realmObject) !== "object") || !hasInternalSlot(realmObject, "Realm")) {
                    return withError("Type", "realmObject has to be an object and to have a [[RealmRecord]] internal slot");
                }
                var realm = getInternalSlot(realmObject, "Realm");
                if (realm === undefined) return withError("Type", "[[RealmRecord]] of a realmObject must not be undefined here.")
            }

            var define_loader_pipeline_hook = function (name) {
                var hook = Get(options, name);
                if (isAbrupt(hook = ifAbrupt(hook))) return hook;
                if (hook !== undefined) {
                    var result = callInternalSlot("DefineOwnProperty", loader, name, {
                        value: hook,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    if (isAbrupt(result)) return result;
                }
                return NormalCompletion();
            };
            var status = define_loader_pipeline_hook("normalize");
            if (isAbrupt(status)) return status;
            status = define_loader_pipeline_hook("locate");
            if (isAbrupt(status)) return status;
            status = define_loader_pipeline_hook("fetch");
            if (isAbrupt(status)) return status;
            status = define_loader_pipeline_hook("translate");
            if (isAbrupt(status)) return status;
            status = define_loader_pipeline_hook("instantiate");
            if (isAbrupt(status)) return status;
            if (getInternalSlot(loader, "LoaderRecord") !== undefined) return withError("Type", "loader.[[LoaderRecord]] seems to have been changed, expected the undefined value.")

            var loaderRecord = CreateLoaderRecord(realm, loader);
            setInternalSlot(loader, "LoaderRecord", loaderRecord);
            return NormalCompletion(loader);
        };

        var LoaderConstructor_Construct = function (argList) {
            return Construct(this, argList);
        };

        // 31.1.
        var LoaderConstructor_$$create = function (thisArg, argList) {
            var F = thisArg;
            var loader = OrdinaryCreateFromConstructor(F, "%LoaderPrototype%", {
                "LoaderRecord": undefined
            });
            return loader;
        };

        // 31.1.
        var LoaderPrototype_get_realm = function (thisArg, argList) {
            var loader = thisArg;
            if (Type(loader) !== "object" || !hasInternalSlot(loader, "Realm")) {
                return withError("Type", "the this value is not a valid loader object");
            }
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            var realm = loaderRecord.Realm;
            return NormalCompletion(realm);
        };

        // 31.1.
        var LoaderPrototype_get_global = function (thisArg, argList) {
            var loader = thisArg;
            if (Type(loader) !== "object" || !hasInternalSlot(loader, "Realm")) {
                return withError("Type", "the this value is not a valid loader object");
            }
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            var realm = loaderRecord.Realm;
            var global = realm.globalThis;
            return NormalCompletion(global);
        };

        var ReturnUndefined_Call = function (thisArg, argList) {
            return NormalCompletion(undefined);
        };

        function ReturnUndefined() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", ReturnUndefined_Call);
            return F;
        }

        // 31.1.
        var LoaderPrototype_entries = function (thisArg, argList) {
            var loader = thisLoader(thisArg);
            return CreateLoaderIterator(loader, "key+value");
        };

        var LoaderPrototype_values = function (thisArg, argList) {
            var loader = thisLoader(thisArg);
            return CreateLoaderIterator(loader, "value");
        };

        var LoaderPrototype_keys = function (thisArg, argList) {
            var loader = thisLoader(thisArg);
            return CreateLoaderIterator(loader, "key");
        };
        // 31.1.
        var LoaderPrototype_define = function (thisArg, argList) {
            debug2("loaderprotodefine")
            var name = argList[0];
            var source =argList[1];
            var options = argList[2];
            var loader = thisArg;
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            name = ToString(name);
            if (isAbrupt(name = ifAbrupt(name))) return name;
            var address = GetOption(options, "address");
            if (isAbrupt(address = ifAbrupt(address))) return address;
            var metadata = GetOption(options, "metadata");
            if (isAbrupt(metadata = ifAbrupt(metadata))) return metadata;
            if (metadata === undefined) metadata = ObjectCreate();
            var p = PromiseOfStartLoadPartWayThrough("translate", loaderRecord, name, metadata, source, address);
            if (isAbrupt(p = ifAbrupt(p))) return p;
            var G = ReturnUndefined();
            p = PromiseThen(p, G);
            return p;
        };

        // 31.1.
        var LoaderPrototype_load = function (thisArg, argList) {
            debug2("loaderprotoload")
            var name = argList[0];
            var options = argList[1];
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader,"LoaderRecord");
            var p = LoadModule(loader, name, options);
            if (isAbrupt(p = ifAbrupt(p))) return p;
            var F = ReturnUndefined();
            p = PromiseThen(p, F);
            return p;
        };

        // 31.1.
        var LoaderPrototype_module = function (thisArg, argList) {
            debug2("loaderprotomodule")
            var source = argList[0];
            var options = argList[1];
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            var address = GetOption(options, "address");
            if (isAbrupt(address = ifAbrupt(address))) return address;
            var load = CreateLoad(undefined);
            load.Address = address;
            var linkSet = CreateLinkSet(loaderRecord, load);
            var successCallback = EvaluateLoadedModule();
            setInternalSlot(successCallback, "Loader", loaderRecord);
            setInternalSlot(successCallback, "Load", load);
            var p = PromiseThen(linkSet.Done, successCallback)
            var sourcePromise = PromiseOf(source);
            ProceedToTranslate(loader, load, sourcePromise);
            return NormalCompletion(p);
        };

        // 31.1.
        var LoaderPrototype_import = function (thisArg, argList) {
            debug2("loaderprototypeimport")
            var name = argList[0];
            var options = argList[1];
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            var p = LoadModule(loaderRecord, name, options);
            if (isAbrupt(p = ifAbrupt(p))) return p;
            var F = EvaluateLoadedModule();
            setInternalSlot(F, "Loader", loaderRecord)
            var p = PromiseThen(p, F);
            return p;
        };

        // 31.1.
        var LoaderPrototype_eval = function (thisArg, argList) {
            debug2("loaderprototypeeval")
            var source = argList[0];
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            return IndirectEval(loaderRecord.Realm, source);
        };

        // 31.1.
        var LoaderPrototype_get = function (thisArg, argList) {
            debug2("loaderprototypeget")
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var name = ToString(argList[0]);
            if (isAbrupt(name = ifAbrupt(name))) return name;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");

            var modules = loaderRecord.Modules;
            var record, module;
            if ((record = getRecordFromList(modules, "Key", name))) {
                var module = p.Value;
                var result = EnsureEvaluated(module, [], loaderRecord);
                if (isAbrupt(result = ifAbrupt(result))) return result;
                return NormalCompletion(module);
                // has typo/bug in spec, let module = p.value. ensureenv(module) but return p.value
            }
            return NormalCompletion(undefined);
        };
        // 31.1.
        var LoaderPrototype_has = function (thisArg, argList) {
            debug2("loaderprototypehas")
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var name = ToString(argList[0]);
            if (isAbrupt(name = ifAbrupt(name))) return name;

            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            var modules = loaderRecord.Modules;
            if (hasRecordInList(modules, "Key", name)) return NormalCompletion(true);
            /*  refactoring hasRecord in list. must result in this:
             if (modules[name]) {
             return NormalCompletion(true);
             }*/
            return NormalCompletion(false);

        };
        // 31.1.
        var LoaderPrototype_set = function (thisArg, argList) {
            debug2("loaderprototypeset")
            var name = argList[0];
            var module = argList[1];
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            var name = ToString(name);
            if (isAbrupt(name = ifAbrupt(name))) return name;
            if (Type(module) !== "object") return withError("Type", "module is not an object");
            var modules = loaderRecord.Modules;
            var p;
            if (p=getRecordFromList(modules, "Key", name)) {
                p.Value = module;
                return NormalCompletion(loader);
            }
            p = { Key: name, Value: module };
            loaderRecord.Modules.push(p);
            return NormalCompletion(loader);
        };
        // 31.1.
        var LoaderPrototype_delete = function (thisArg, argList) {
            var name = argList[0];
            var loader = thisLoader(thisArg);
            if (isAbrupt(loader = ifAbrupt(loader))) return loader;
            var loaderRecord = getInternalSlot(loader, "LoaderRecord");
            name = ToString(name);
            if (isAbrupt(name = ifAbrupt(name))) return name;
            var modules = loaderRecord.Modules;
            for (var i = 0, j = modules.length; i < j; i++) {
                var p = modules[i];
                if (SameValue(p.Key, name)) {
                    // remove them from list otherwhere
                    p.Key = empty;
                    p.Value = empty;
                    return NormalCompletion(true);
                }
            }
            return NormalCompletion(false);
        };
        var LoaderPrototype_normalize = function (thisArg, argList) {
            var name = argList[0];
            var refererName = argList[1];
            var refererAddress = argList[2];
            Assert(Type(name) == "string", "Loader.prototype.normalize: name has to be a string.");
            return NormalCompletion(name);
        };
        var LoaderPrototype_locate = function (thisArg, argList) {
            var loadRequest = argList[0];r
            return Get(loadRequest, "name");
        };
        var LoaderPrototype_fetch = function (thisArg, argList) {
            return withError("Type", "The Loader.prototype.fetch function is supposed to throw a type error.");
        };
        var LoaderPrototype_translate = function (thisArg, argList) {
            var load = argList[0];
            return Get(load, "source");
        };

        var LoaderPrototype_instantiate = function (thisArg, argList) {
            var loadRequest = argList[0];
            return NormalCompletion(undefined);
        };
        var LoaderPrototype_$$iterator = LoaderPrototype_entries;

        // Loader

        setInternalSlot(LoaderConstructor, "Prototype", FunctionPrototype);
        setInternalSlot(LoaderConstructor, "Call", LoaderConstructor_Call);
        setInternalSlot(LoaderConstructor, "Construct", LoaderConstructor_Construct);
        LazyDefineProperty(LoaderConstructor, $$create, CreateBuiltinFunction(realm,LoaderConstructor_$$create, 0, "[Symbol.create]"));
        MakeConstructor(LoaderConstructor, false, LoaderPrototype);
        //SetFunctionName(LoaderConstructor, "Loader");

        // Loader.prototype
        LazyDefineProperty(LoaderPrototype, "entries", CreateBuiltinFunction(realm,LoaderPrototype_entries, 0, "entries"));
        LazyDefineProperty(LoaderPrototype, "values", CreateBuiltinFunction(realm,LoaderPrototype_values, 0, "values"));
        LazyDefineProperty(LoaderPrototype, "keys", CreateBuiltinFunction(realm,LoaderPrototype_keys, 0, "keys"));
        LazyDefineProperty(LoaderPrototype, "has", CreateBuiltinFunction(realm,LoaderPrototype_has, 0, "has"));
        LazyDefineProperty(LoaderPrototype, "get", CreateBuiltinFunction(realm,LoaderPrototype_get, 0, "get"));
        LazyDefineProperty(LoaderPrototype, "set", CreateBuiltinFunction(realm,LoaderPrototype_set, 0, "set"));
        LazyDefineProperty(LoaderPrototype, "delete", CreateBuiltinFunction(realm,LoaderPrototype_delete, 0, "delete"));
        LazyDefineProperty(LoaderPrototype, "define", CreateBuiltinFunction(realm,LoaderPrototype_define, 2, "define"));

        LazyDefineProperty(LoaderPrototype, "load", CreateBuiltinFunction(realm,LoaderPrototype_load,    1, "load"));
        LazyDefineProperty(LoaderPrototype, "module", CreateBuiltinFunction(realm,LoaderPrototype_module, 1, "module"));
        LazyDefineProperty(LoaderPrototype, "import", CreateBuiltinFunction(realm,LoaderPrototype_import, 0, "import"));
        LazyDefineProperty(LoaderPrototype, "eval", CreateBuiltinFunction(realm,LoaderPrototype_eval, 0, "eval"));
        LazyDefineProperty(LoaderPrototype, "normalize", CreateBuiltinFunction(realm,LoaderPrototype_normalize, 0, "normalize"));
        LazyDefineProperty(LoaderPrototype, "fetch", CreateBuiltinFunction(realm,LoaderPrototype_fetch, 0, "fetch"));
        LazyDefineProperty(LoaderPrototype, "locate", CreateBuiltinFunction(realm,LoaderPrototype_locate, 0, "locate"));
        LazyDefineProperty(LoaderPrototype, "translate", CreateBuiltinFunction(realm,LoaderPrototype_instantiate, 1, "translate"));
        LazyDefineProperty(LoaderPrototype, "instantiate", CreateBuiltinFunction(realm,LoaderPrototype_instantiate, 0, "instantiate"));
        LazyDefineProperty(LoaderPrototype, $$iterator, CreateBuiltinFunction(realm,LoaderPrototype_$$iterator, 0, "[Symbol.iterator]"));
        LazyDefineProperty(LoaderPrototype, $$toStringTag, "Loader");

        // ##################################################################
        // Der Loader Iterator
        // ##################################################################

        // 31.1.
        function CreateLoaderIterator(loader, kind) {
            var loaderIterator = ObjectCreate(LoaderIteratorPrototype, {
                "Loader": loader,
                "LoaderNextIndex": 0,
                "LoaderIterationKind": kind
            });
            return loaderIterator;
        }
        // 31.1.
        var LoaderIteratorPrototype_next = function next(thisArg, argList) {
            var iterator = thisArg;
            var loaderRecord = getInternalSlot(iterator, "LoaderRecord");
            var m = getInternalSlot(iterator, "Loader");
            var index = getInternalSlot(iterator, "LoaderNextIndex");
            var itemKind = getInternalSlot(iterator, "LoaderIterationKind");
            if (m === undefined) return CreateItrResultObject(undefined, true);
            var result;
            var entries = loaderRecord.Modules;
            while (index < entries.length) {
                var e = entries[index];
                index = index + 1;
                setInternalSlot(iterator, "LoaderNextIndex", index);
                if (e.Key !== empty) {
                    if (itemKind === "key") result = e.Key;
                    else if (itemKind === "value") result = e.Value;
                    else {
                        Assert(itemKind==="key+value", "itemKind has to be key+value here");
                        result = ArrayCreate(2);
                        CreateDataProperty(result, "0", e.Key);
                        CreateDataProperty(result, "1", e.Value);
                    }
                    return CreateItrResultObject(result, false);
                }
            }
            setInternalSlot(iterator, "Loader", undefined);
            return CreateItrResultObject(undefined, true);
        };

        // 31.1.
        var LoaderIteratorPrototype_$$iterator = function $$iterator(thisArg, argList) {
            return thisArg;
        };

        LazyDefineProperty(LoaderIteratorPrototype, $$iterator, CreateBuiltinFunction(realm, LoaderIteratorPrototype_$$iterator, 0, "[Symbol.iterator]"));
        LazyDefineProperty(LoaderIteratorPrototype, "next", CreateBuiltinFunction(realm, LoaderIteratorPrototype_next, 0, "next"));
        LazyDefineProperty(LoaderIteratorPrototype, $$toStringTag, "Loader Iterator");


        // 31.1. 
        function newModule (obj) {
            if (Type(obj) !== "object") return withError("Type", "newModule: obj is not an object");
            var mod = CreateLinkedModuleInstance();
            var keys = OwnPropertyKeysAsList(obj);
            if (isAbrupt(keys = ifAbrupt(keys))) return keys;
            for (var i = 0, j = keys.length; i < j; i++) {
                var key = keys[i];
                var value = Get(obj, key);
                if (isAbrupt(value = ifAbrupt(value))) return value;
                var F = CreateConstantGetter(key, value);
                var desc = {
                    configurable: false,
                    enumerable: true,
                    get: F,
                    set: undefined
                };
                var status = DefinePropertyOrThrow(mod, key, desc);
            }
            callInternalSlot("PreventExtensions", mod);
            return NormalCompletion(mod);
        }

        var ConstantFunction_Call = function (thisArg, argList) {
            return getInternalSlot(this, "ConstantValue");
        };

        function CreateConstantGetter(key, value) {
            var getter = CreateBuiltinFunction(getRealm(), ConstantFunction_Call, 0, "get " + key);
            setInternalSlot(getter, "ConstantValue", value);
            return getter;
        }

        // ===========================================================================================================
        // %ThrowTypeError%
        // ===========================================================================================================

        var ThrowTypeError = FunctionAllocate(FunctionPrototype);
        setInternalSlot(ThrowTypeError, "Call", function (thisArg, argList) {
            return withError("Type", "The system is supposed to throw a Type Error with %ThrowTypeError% here.");
        });
        setInternalSlot(ThrowTypeError, "Construct", undefined);

        // ===========================================================================================================
        // load and request function (load loads file into string and request fetches from network)
        // ===========================================================================================================

        function isWindow() {
            return typeof window !== "undefined";
        }

        function isNode() {
            return typeof process !== "undefined";
        }

        function isWorker() {
            return typeof importScripts === "function" && !isWindow();
        }

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
                if (Type(selector) !== "string") return withError("Type", "First argument of console.html should be a valid css selector string.");
                if (typeof document !== "undefined") {
                    var element = document.querySelector(selector);
                } else {
                    if (typeof process !== "undefined") {
                        console.log.apply(console, argList.slice(1));
                    } else
                        return withError("Reference", "Can not select element. document.querySelector is not supported in the current environment.");
                }
                if (element) {
                    html += argList[1];
                    for (var i = 2, j = argList.length; i < j; i++) {
                        html += ", " + argList[i];
                    }
                    html += "<br>\n";
                } else {
                    return withError("Reference", "document.querySelector could not find the element " + selector);
                }
                element.innerHTML += html;
                return NormalCompletion(undefined);
            }),
            writable: true,
            enumerable: false,
            configurable: true
        });

        // ===========================================================================================================
        // Array Iterator
        // ===========================================================================================================

        setInternalSlot(ArrayIteratorPrototype, "Prototype", ObjectPrototype);
        DefineOwnProperty(ArrayIteratorPrototype, $$iterator, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                return thisArg;
            }, 0, "[Symbol.iterator]"),
            enumerable: false,
            configurable: false,
            writable: false
        });

        DefineOwnProperty(ArrayIteratorPrototype, $$toStringTag, {
            value: "Array Iterator",
            enumerable: false,
            configurable: false,
            writable: false
        });
        DefineOwnProperty(ArrayIteratorPrototype, "next", {
            value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "ArrayIterator.prototype.next: O is not an object. ");

                if (!hasInternalSlot(O, "IteratedObject") || !hasInternalSlot(O, "ArrayIterationNextIndex") || !hasInternalSlot(O, "ArrayIterationKind")) {
                    return withError("Type", "Object has not all ArrayIterator properties.");
                }

                var a = getInternalSlot(O, "IteratedObject");
                var index = getInternalSlot(O, "ArrayIterationNextIndex");
                var itemKind = getInternalSlot(O, "ArrayIterationKind");
                var lenValue = Get(a, "length");
                var len = ToUint32(lenValue);
                var elementKey, found, result, elementValue;
                if (isAbrupt(len = ifAbrupt(len))) return len;
                if ((/sparse/).test(itemKind)) {
                    var found = false;
                    while (!found && (index < len)) {
                        elementKey = ToString(index);
                        found = HasProperty(a, elementKey);
                        if (isAbrupt(found)) return found;
                        if (!(found = ifAbrupt(found))) index = index + 1;
                    }
                }
                if (index >= len) {
                    setInternalSlot(O, "ArrayIterationNextIndex", +Infinity);
                    return CreateItrResultObject(undefined, true);
                }
                elementKey = ToString(index);
                setInternalSlot(O, "ArrayIterationNextIndex", index + 1);

                if (/key\+value/.test(itemKind)) {
                    elementValue = Get(a, elementKey);
                    if (isAbrupt(elementValue = ifAbrupt(elementValue))) return elementValue;

                    result = ArrayCreate(2);

                    result.DefineOwnProperty("0", {
                        value: elementKey,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    result.DefineOwnProperty("1", {
                        value: elementValue,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    result.DefineOwnProperty("length", {
                        value: 2,
                        writable: true,
                        eumerable: false,
                        configurable: false
                    });
                    return CreateItrResultObject(result, false);
                } else if ((/value/).test(itemKind)) {
                    elementValue = Get(a, elementKey);
                    if (isAbrupt(elementValue = ifAbrupt(elementValue))) return elementValue;
                    return CreateItrResultObject(elementValue, false);
                } else if ((/key/).test(itemKind)) {
                    return CreateItrResultObject(elementKey, false);
                }

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        // ===========================================================================================================
        // Array Constructor (not the exotic object type returned by)
        // ===========================================================================================================

        function IsSparseArray(A) {
            var len = Get(A, "length");
            var elem;
            for (var i = 0, j = ToUint32(len); i < j; i++) {
                elem = Get(A, ToString(i));
                if (isAbrupt(elem = ifAbrupt(elem))) return elem;
                if (elem === undefined) return true;
            }
            return false;
        }

        MakeConstructor(ArrayConstructor, true, ArrayPrototype);
        setInternalSlot(ArrayPrototype, "Prototype", ObjectPrototype);

        DefineOwnProperty(ArrayConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
                var F = thisArg;
                var proto = GetPrototypeFromConstructor(F, "%ArrayPrototype%");
                if (isAbrupt(proto = ifAbrupt(proto))) return proto;
                var obj = ArrayCreate(undefined, proto);
                return obj;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayConstructor, $$toStringTag, {
            value: "Array",
            enumerable: false,
            writable: false,
            configurable: false
        });

        setInternalSlot(ArrayConstructor, "Call", function (thisArg, argList) {

            var O = thisArg;
            var array;
            var intLen;
            var F, proto;
            var defineStatus;
            var len;
            var k;
            var putStatus;
            var numberOfArgs;
            var Pk, itemK;
            var items;

            numberOfArgs === argList.length;
            if (numberOfArgs === 1) {
                len = GetValue(argList[0]);
                if (Type(O) === "object" && !getInternalSlot(O, "ArrayInitialisationState")) {
                    setInternalSlot(O, "ArrayInitialisationState", true);
                    array = O;
                } else {
                    F = this;
                    proto = OrdinaryCreateFromConstructor(F, "%ArrayPrototype");
                    if (isAbrupt(proto)) return proto;
                    proto = ifAbrupt(proto);
                    array = ArrayCreate(0, proto);
                }
                array = ifAbrupt(array);
                if (isAbrupt(array)) return array;
                if (Type(len) !== "number") {
                    defineStatus = DefineOwnPropertyOrThrow(array, "0", {
                        value: len,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    if (isAbrupt(defineStatus)) return defineStatus;
                    intLen = 1;
                } else {
                    intLen = ToUint32(len);
                    if (intLen != len) return withError("Range", "Array(len): intLen is not equal to len");
                }
                putStatus = Put(array, "length", intLen, true);
                if (isAbrupt(putStatus)) return putStatus;
                return array;

            } else {
                len = GetValue(argList[0]);
                if (Type(O) === "object" && !getInternalSlot(O, "ArrayInitialisationState")) {
                    setInternalSlot(O, "ArrayInitialisationState", true);
                    array = O;
                } else {
                    F = this;
                    proto = OrdinaryCreateFromConstructor(F, "%ArrayPrototype");
                    if (isAbrupt(proto)) return proto;
                    proto = ifAbrupt(proto);
                    array = ArrayCreate(0, proto);
                }

                array = ifAbrupt(array);
                if (isAbrupt(array)) return array;
                k = 1;
                items = argList;

                while (k < numberOfArgs) {
                    Pk = ToString(k);
                    itemK = items[k];
                    defineStatus = DefineOwnPropertyOrThrow(array, Pk, {
                        value: itemK,
                        writable: true,
                        enumerable: true,
                        configurable: true

                    });
                    if (isAbrupt(defineStatus)) return defineStatus;
                    k = k + 1;
                }
                putStatus = Put(array, "length", numberOfArgs, true);
                if (isAbrupt(putStatus)) return putStatus;
                return array;
            }

        });
        setInternalSlot(ArrayConstructor, "Construct", function (argList) {
            var F = this;
            var argumentsList = argList;
            return OrdinaryConstruct(F, argumentsList);
        });
        DefineOwnProperty(ArrayConstructor, "length", {
            value: 1,
            enumerable: false,
            writable: false,
            configurable: false
        });
        DefineOwnProperty(ArrayConstructor, "prototype", {
            value: ArrayPrototype,
            enumerable: false,
            writable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayConstructor, "isArray", {
            value: CreateBuiltinFunction(realm, function isArray(thisArg, argList) {
                var arg = GetValue(argList[0]);
                // if (Type(arg) !== "object") return false;
                if (arg instanceof ArrayExoticObject) return true;
                return false;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayConstructor, "of", {
            value: CreateBuiltinFunction(realm, function of(thisArg, argList) {
                var items = CreateArrayFromList(argList);
                var lenValue = Get(items, "length");
                var C = thisArg;
                var newObj;
                var A;
                var len = ToInteger(lenValue);
                if (IsConstructor(C)) {
                    newObj = OrdinaryConstruct(C, [len]);
                    A = ToObject(newObj);
                } else {
                    A = ArrayCreate(len);
                }
                if (isAbrupt(A = ifAbrupt(A))) return A;
                var k = 0;
                var Pk, kValue, defineStatus, putStatus;
                while (k < len) {
                    Pk = ToString(k);
                    kValue = Get(items, Pk);
                    defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                        value: kValue,
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                    if (isAbrupt(defineStatus)) return defineStatus;
                    k = k + 1;
                }
                putStatus = Put(A, "length", len, true);
                if (isAbrupt(putStatus)) return putStatus;
                return A;

            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayConstructor, "from", {
            value: CreateBuiltinFunction(realm, function from(thisArg, argList) {
                var C = thisArg;
                var arrayLike = argList[0];
                var mapfn = argList[1];
                var thisArg2 = argList[2];
                var T;
                var items = ToObject(arrayLike);
                var mapping = false;
                var len, lenValue;
                var k;
                var iterator;
                var done, Pk, kValue, defineStatus, putStatus, kPresent, mappedValue;
                var newObj, A;
                if (isAbrupt(items = ifAbrupt(items))) return items;
                if (mapfn == undefined) {
                    mapping = true;
                } else {
                    if (!IsCallable(mapfn)) return withError("Type", "Array.from: mapfn is not callable.");
                    if (thisArg2) T = thisArg2;
                    else T = undefined;
                    mapping = true;

                }
                var usingIterator = HasProperty(items, $$iterator);

                var next, nextValue;
                if (usingIterator) {
                    iterator = GetIterator(items);
                    if (IsConstructor(C)) {
                        newObj = OrdinaryConstruct(C, []);
                        A = ToObject(newObj);
                    } else {
                        A = ArrayCreate(0);
                    }
                    while (!done) {

                        Pk = ToString(k);
                        next = IteratorNext(iterator);
                        if (isAbrupt(next)) return next;
                        next = ifAbrupt(next);
                        done = IteratorComplete(next);
                        if (isAbrupt(done)) return done;
                        done = ifAbrupt(done);
                        if (done) {

                        }
                        nextValue = IteratorValue(next);
                        if (isAbrupt(nextValue)) return nextValue;
                        nextValue = ifAbrupt(nextValue);
                        if (mapping) {
                            mappedValue = mapfn.Call(T, [nextValue]);
                            if (isAbrupt(mappedValue)) return mappedValue;
                            mappedValue = ifAbrupt(mappedValue);

                        } else mappedValue = nextValue;

                        defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                            value: mappedValue,
                            writable: true,
                            enumberable: true,
                            configurable: true
                        });

                        if (isAbrupt(defineStatus)) return defineStatus;

                        k = k + 1;
                    }

                } else {

                    // Assert(items is array like and no iterator)
                    lenValue = Get(items, "length");
                    len = ToInteger(lenValue);
                    if (isAbrupt(len)) return len;
                    if (IsConstructor(C)) {
                        newObj = OrdinaryConstruct(C, [len]);
                        A = ToObject(newObj);
                    } else {
                        A = ArrayCreate(len);
                    }
                    k = 0;
                    while (k < len) {
                        Pk = ToString(k);
                        kPresent = HasProperty(items, Pk);
                        if (isAbrupt(kPresent)) return kPresent;
                        if (kPresent) {
                            kValue = Get(items, Pk);
                            if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                            if (mapping) {
                                mappedValue = mapfn.Call(T, [kValue, k, items]);
                                if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
                                defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                                    value: mappedValue,
                                    writable: true,
                                    configurable: true,
                                    enumerable: true
                                });

                            } else mappedValue = kValue;

                        }
                        k = k + 1;
                    }

                }
                putStatus = Put(A, "length", len, true);
                if (isAbrupt(putStatus)) return putStatus;
                return A;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "constructor", {
            value: ArrayConstructor,
            enumerable: false,
            writable: false,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "toString", {
            value: CreateBuiltinFunction(realm, function toString(thisArg, argList) {
                var array = ToObject(thisArg);
                if (isAbrupt(array = ifAbrupt(array))) return array;
                array = GetValue(array);
                var func = Get(array, "join");
                if (isAbrupt(func = ifAbrupt(func))) return func;
                if (!IsCallable(func)) func = Get(ObjectPrototype, "toString");
                return callInternalSlot("Call", func, array, []);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_toLocaleString = function toLocaleString(thisArg, argList) {

        };
        LazyDefineBuiltinFunction(ArrayPrototype, "toLocaleString", 2, ArrayPrototype_toLocaleString);

        function IsConcatSpreadable(O) {
            if (isAbrupt(O)) return O;
            var spreadable = Get(O, $$isConcatSpreadable);
            if (isAbrupt(spreadable = ifAbrupt(spreadable))) return spreadable;
            if (spreadable !== undefined) return ToBoolean(spreadable);
            if (O instanceof ArrayExoticObject) return true;
            return false;
        }

        DefineOwnProperty(ArrayPrototype, "concat", {
            value: CreateBuiltinFunction(realm, function concat(thisArg, argList) {
                var args = argList;
                var k = 0;
                var len = args.length;
                var spreadable;
                while (k < len) {

                    if (spreadable = IsConcatSpreadable(C)) {

                    }
                    k = k + 1;
                }
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "join", {
            value: CreateBuiltinFunction(realm, function join(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var separator = argList[0];
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;
                if (separator === undefined) separator = ",";
                var sep = ToString(separator);
                if (len === 0) return NormalCompletion("");
                var element0 = Get(O, "0");
                var R;
                if (element0 === undefined) R = "";
                else R = ToString(element0);
                var k = 1;
                while (k < len) {
                    var S = R + sep;
                    var element = Get(O, ToString(k));
                    var next;
                    if (element === undefined || element === null) next = "";
                    else next = ToString(element);
                    if (isAbrupt(next = ifAbrupt(next))) return next;
                    R = S + next;
                    k = k + 1;
                }
                return NormalCompletion(R);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "pop", {
            value: CreateBuiltinFunction(realm, function pop(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;
                var putStatus, deleteStatus;
                if (len === 0) {
                    putStatus = Put(O, "length", 0, true);
                    if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                    return undefined;
                } else {
                    var newLen = len - 1;
                    var index = ToString(newLen);
                    var element = Get(O, index);
                    if (isAbrupt(element = ifAbrupt(element))) return element;
                    deleteStatus = DeletePropertyOrThrow(O, index);
                    if (isAbrupt(deleteStatus = ifAbrupt(deleteStatus))) return deleteStatus;
                    putStatus = Put(O, "length", newLen, true);
                    if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                    return NormalCompletion(element);
                }
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "push", {
            value: CreateBuiltinFunction(realm, function push(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var n = ToUint32(lenVal);
                if (isAbrupt(n = ifAbrupt(n))) return n;
                var items = argList;
                var E, putStatus;
                for (var i = 0, j = items.length; i < j; i++) {
                    E = items[i];
                    putStatus = Put(O, ToString(n), E, true);
                    if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                    n = n + 1;
                }
                putStatus = Put(O, "length", n, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                return NormalCompletion(n);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "reverse", {
            value: CreateBuiltinFunction(realm, function reverse(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;
                var middle = Math.floor(len / 2);
                var lower = 0;
                var putStatus;
                var deleteStatus;
                while (lower < middle) {
                    var upper = len - lower - 1;
                    var upperP = ToString(upper);
                    var lowerP = ToString(lower);
                    var lowerValue = Get(O, lowerP);
                    if (isAbrupt(lowerValue = ifAbrupt(lowerValue))) return lowerValue;
                    var upperValue = Get(O, upperP);
                    if (isAbrupt(upperValue = ifAbrupt(upperValue))) return upperValue;
                    var lowerExists = HasProperty(O, lowerP);
                    if (isAbrupt(lowerExists = ifAbrupt(lowerExists))) return lowerExists;
                    var upperExists = HasProperty(O, upperP);
                    if (isAbrupt(upperExists = ifAbrupt(upperExists))) return upperExists;
                    if (lowerExists === true && upperExists === true) {
                        putStatus = Put(O, lowerP, upperValue, true);
                        if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                        putStatus = Put(O, upperP, lowerValue, true);
                        if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;

                    } else if (lowerExists === false && upperExists === true) {

                        putStatus = Put(O, lowerP, upperValue, true);
                        if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                        deleteStatus = DeletePropertyOrThrow(O, upperP);
                        if (isAbrupt(deleteStatus = ifAbrupt(deleteStatus))) return deleteStatus;

                    } else if (lowerExists === true && upperExists === false) {

                        deleteStatus = DeletePropertyOrThrow(O, lowerP);
                        if (isAbrupt(deleteStatus = ifAbrupt(deleteStatus))) return deleteStatus;
                        putStatus = Put(O, upperP, lowerValue, true);
                        if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;

                    }

                    lower = lower + 1;
                }
                return NormalCompletion(O);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "shift", {
            value: CreateBuiltinFunction(realm, function shift(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;

            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "slice", {
            value: CreateBuiltinFunction(realm, function slice(thisArg, argList) {
                var start = argList[0];
                var end = argList[1];
                var O = ToObject(thisArg);
                var A = ArrayCreate(0);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;

                var relativeStart = ToInteger(start);
                if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;

                var k;
                if (relativeStart < 0) k = max((len + relativeStart), 0);
                else k = min(relativeStart, len);
                var relativeEnd;
                if (end === undefined) relativeEnd = len;
                else relativeEnd = ToInteger(end);
                if (isAbrupt(relativeEnd = ifAbrupt(relativeEnd))) return relativeEnd;
                var final;
                if (relativeEnd < 0) final = max((len + relativeEnd), 0);
                else final = min(relativeEnd, len);
                var n = 0;
                var putStatus, status;
                while (k < final) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                        status = CreateDataProperty(A, ToString(n), kValue);
                        if (isAbrupt(status)) return status;
                        if (status === false) return withError("Type", "slice: CreateDataProperty on new Array returned false");
                    }
                    k = k + 1;
                    n = n + 1;
                }
                putStatus = Put(A, "length", n, true);
                if (isAbrupt(putStatus)) return putStatus;
                return NormalCompletion(A);
            }, 2),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "sort", {
            value: CreateBuiltinFunction(realm, function sort(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;

            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_splice = function splice(thisArg, argList) {
            var start = argList[0];
            var deleteCount = argList[1];
            var items = argList.slice(2);
            var O = ToObject(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var lenVal = Get(O, "length");
            var len = ToLength(lenVal);
            if (isAbrupt(len = ifAbrupt(len))) return len;
            var relativeStart = ToInteger(start);
            if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;
            var actualStart;
            if (relativeStart < 0) actualStart = max((len+relativeStart),0);
            else actualStart=min(relativeStart,len);
            if (start === undefined) {
                var actualDeleteCount = 0;
            } else if (deleteCount === undefined) {
                actualDeleteCount = len - actualStart;
            } else {
                var dc = ToInteger(deleteCount);
                if (isAbrupt(dc = ifAbrupt(dc))) return dc;
                actualDeleteCount = min(max(dc, 0), len - actualStart);
            }
            var A = undefined;
            if (O instanceof ArrayExoticObject) {
                var C = Get(O, "constructor");
                if (isAbrupt(C = ifAbrupt(C))) return C;
                if (IsConstructor(C) === true) {
                    var thisRealm = getRealm();
                    if (SameValue(thisRealm, getInternalSlot(C, "Realm"))) {
                        A = callInternalSlot("Construct", [actualDeleteCount]);
                    }
                }
            }
            if (A === undefined) {
                A = ArrayCreate(actualDeleteCount);
            }
            if (isAbrupt(A = ifAbrupt(A))) return A;
            var k = 0;
            while (k < actualDeleteCount) {
                var from = ToString(actualStart + k);
                var fromPresent = HasProperty(O, from);
                if (isAbrupt(fromPresent = ifAbrupt(fromPresent))) return fromPresent;
                if (fromPresent === true) {
                    var fromValue = Get(O, from);
                    if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
                    var status = CreateDataPropertyOrThrow(A, ToString(k), fromValue);
                    if (isAbrupt(status)) return status;
                }
                k = k + 1;
            }
            var putStatus = Put(A, "length", actualDeleteCount, true);
            if (isAbrupt(putStatus)) return putStatus;
            var itemCount = items.length;
            var k;
            if (itemCount < actualDeleteCount) {
                k = actualStart;
                while (k < (len - actualDeleteCount)) {
                    var from = ToString(k+actualDeleteCount);
                    var to = ToString(k+itemCount);
                    var fromPresent = HasProperty(O, from);
                    if (isAbrupt(fromPresent = ifAbrupt(fromPresent)));
                    if (fromPresent  === true) {
                        var fromValue = Get(O, from);
                        if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
                        putStatus = Put(O, to, fromValue, true);
                        if (isAbrupt(putStatus)) return putStatus;

                    } else {
                        var deleteStatus = DeletePropertyOrThrow(O, to);
                        if (isAbrupt(deleteStatus)) return deleteStatus;
                    }
                    k = k + 1;
                }
            } else if (itemCount > actualDeleteCount) {
                k = len - actualDeleteCount;
                while (k < actualStart) {
                    var from = ToStirng(k + actualDeleteCount - 1);
                    var to = ToString(k + itemCount - 1);
                    var fromPresent = HasProperty(O, from);
                    if (fromPresent === true) {
                        var fromValue = Get(O, from);
                        if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
                        putStatus = Put(O, to, fromValue, true);
                        if (isAbrupt(putStatus)) return putStatus;
                    } else {
                        deleteStatus = DeletePropertyOrThrow(O, to);
                        if (isAbrupt(deleteStatus)) return deleteStatus;
                    }
                    k = k - 1;
                }
            }
            k = actualStart;
            var l = 0;
            while (k < actualStart) {
                var E = items[l];
                putStatus = Put(O, ToString(k), E, true);
                l = l + 1;
                k = k + 1;
                if (isAbrupt(putStatus)) return putStatus;
            }
            putStatus = Put(O, "length", len - actualDeleteCount + itemCount, true);
            if (isAbrupt(putStatus)) return putStatus;
            return NormalCompletion(A);
        };
        var ArrayPrototype_unshift = function unshift(thisArg, argList) {

        };
        LazyDefineBuiltinFunction(ArrayPrototype, "splice", 2, ArrayPrototype_splice);
        LazyDefineBuiltinFunction(ArrayPrototype, "unshift", 1, ArrayPrototype_unshift);

        DefineOwnProperty(ArrayPrototype, "indexOf", {
            value: CreateBuiltinFunction(realm, function indexOf(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var searchElement = argList[0];
                var fromIndex = argList[1];
                var lenValue = Get(O, "length");
                var len = ToUint32(lenValue);
                if (isAbrupt(len = ifAbrupt(len))) return len;
                var n;
                var k;
                if (fromIndex !== undefined) n = ToInteger(fromIndex);
                else n = 0;
                if (isAbrupt(n = ifAbrupt(n))) return n;
                if (len === 0) return -1;
                if (n >= 0) k = n;
                else {
                    k = len - abs(n);
                    if (k < 0) k = 0;
                }
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var elementK = Get(O, Pk);
                        if (isAbrupt(elementK = ifAbrupt(elementK))) return elementK;
                        /* Replace mit Strict EQ Abstract Op */
                        var same = (searchElement === elementK);
                        if (same) return NormalCompletion(k);
                    }
                    k = k + 1;
                }
                return NormalCompletion(-1);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "lastIndexOf", {
            value: CreateBuiltinFunction(realm, function lastIndexOf(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var searchElement = argList[0];
                var fromIndex = argList[1];
                var lenValue = Get(O, "length");
                var len = ToUint32(lenValue);
                if (isAbrupt(len = ifAbrupt(len))) return len;
                var n;
                var k;
                if (len === 0) return -1;
                if (fromIndex !== undefined) n = ToInteger(fromIndex);
                else n = len - 1;
                if (isAbrupt(n = ifAbrupt(n))) return n;
                if (n >= 0) k = min(n, len - 1);
                else {
                    k = len - abs(n);
                }
                while (k > 0) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var elementK = Get(O, Pk);
                        if (isAbrupt(elementK = ifAbrupt(elementK))) return elementK;
                        /* Replace mit Strict EQ Abstract Op */
                        var same = (searchElement === elementK);
                        if (same) return NormalCompletion(k);
                    }
                    k = k - 1;
                }
                return NormalCompletion(-1);

            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "forEach", {
            value: CreateBuiltinFunction(realm, function forEach(thisArg, argList) {
                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (isAbrupt(len = ifAbrupt(len))) return len;
                if (!IsCallable(callback)) return withError("Type", "forEach: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                        var funcResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if (isAbrupt(funcResult)) return funcResult;
                    }
                    k = k + 1;
                }
                return NormalCompletion(undefined);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "map", {
            value: CreateBuiltinFunction(realm, function map(thisArg, argList) {

                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "map: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                var A = ArrayCreate(len);
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                        var mappedValue = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
                        callInternalSlot("DefineOwnProperty", A, Pk, {
                            value: mappedValue,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    k = k + 1;
                }
                return NormalCompletion(A);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "filter", {
            value: CreateBuiltinFunction(realm, function filter(thisArg, argList) {

                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "filter: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                var to = 0;
                var A = ArrayCreate(len);
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;

                        var selected = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if (isAbrupt(selected = ifAbrupt(selected))) return selected;
                        if (ToBoolean(selected) === true) {

                            A.DefineOwnProperty(ToString(to), {
                                value: kValue,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                            to = to + 1;
                        }
                    }
                    k = k + 1;
                }
                return NormalCompletion(A);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_reduce = function reduce(thisArg, argList) {

        };
        var ArrayPrototype_reduceRight = function reduce(thisArg, argList) {

        };

        LazyDefineBuiltinFunction(ArrayPrototype, "reduce", 1, ArrayPrototype_reduce);
        LazyDefineBuiltinFunction(ArrayPrototype, "reduceRight", 1, ArrayPrototype_reduceRight);

        DefineOwnProperty(ArrayPrototype, "every", {
            value: CreateBuiltinFunction(realm, function every(thisArg, argList) {
                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "every: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                        var testResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
                        if (ToBoolean(testResult) === false) return NormalCompletion(false);
                    }
                    k = k + 1;
                }
                return NormalCompletion(true);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "some", {
            value: CreateBuiltinFunction(realm, function some(thisArg, argList) {
                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "some: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                        var testResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
                        if (ToBoolean(testResult) === true) return NormalCompletion(true);
                    }
                    k = k + 1;
                }
                return NormalCompletion(false);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_predicate = function (thisArg, argList) {

        };
        var ArrayPrototype_findIndex = function (thisArg, argList) {

        };

        LazyDefineBuiltinFunction(ArrayPrototype, "predicate", 1, ArrayPrototype_predicate);
        LazyDefineBuiltinFunction(ArrayPrototype, "findIndex", 1, ArrayPrototype_findIndex);


        DefineOwnProperty(ArrayPrototype, "entries", {
            value: CreateBuiltinFunction(realm, function entries(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O)) return O;
                return CreateArrayIterator(O, "key+value");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "keys", {
            value: CreateBuiltinFunction(realm, function keys(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O)) return O;
                return CreateArrayIterator(O, "key");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "values", {
            value: CreateBuiltinFunction(realm, function values(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O)) return O;
                return CreateArrayIterator(O, "value");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, $$iterator, {
            value: CreateBuiltinFunction(realm, function $$iterator(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O = ifAbrupt(O))) return O;
                return CreateArrayIterator(O, "value");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, $$unscopables, {
            value: (function () {
                var blackList = ObjectCreate();
                CreateDataProperty(blackList, "find", true);
                CreateDataProperty(blackList, "findIndex", true);
                CreateDataProperty(blackList, "fill", true);
                CreateDataProperty(blackList, "copyWithin", true);
                CreateDataProperty(blackList, "entries", true);
                CreateDataProperty(blackList, "keys", true);
                CreateDataProperty(blackList, "values", true);
                return blackList;
            }()),
            enumerable: false,
            writable: true,
            configurable: true
        });

        // ===========================================================================================================
        // String Constructor and Prototype
        // ===========================================================================================================

        setInternalSlot(StringConstructor, "Call", function Call(thisArg, argList) {
            var O = thisArg;
            var s;
            if (!argList.length) s = "";
            else s = ToString(argList[0]);
            if (isAbrupt(s = ifAbrupt(s))) return s;
            if (Type(O) === "object" && hasInternalSlot(O, "StringData") && getInternalSlot(O, "StringData") === undefined) {
                var length = s.length;
                var status = DefineOwnPropertyOrThrow(O, "length", {
                    value: length,
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
                if (isAbrupt(status = ifAbrupt(status))) return status;
                setInternalSlot(O, "StringData", s);
                return O;
            }
            return s;
        });
        setInternalSlot(StringConstructor, "Construct", function Construct(argList) {
            var F = StringConstructor;
            return OrdinaryConstruct(F, argList);
        });

        DefineOwnProperty(StringConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
                var F = thisArg;
                var obj = StringExoticObject();
                var proto = GetPrototypeFromConstructor(F, "%StringPrototype%");
                if (isAbrupt(proto = ifAbrupt(proto))) return proto;
                setInternalSlot(obj, "Prototype", proto);
                setInternalSlot(obj, "StringData", undefined);
                return obj;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var StringRawFunction = CreateBuiltinFunction(realm, function raw(thisArg, argList) {
            // String.raw(callSite, ...substitutions)

            var callSite = argList[0];
            // ,...substitions)
            var substitutions = CreateArrayFromList(argList.slice(1));
            var cooked = ToObject(callSite);
            if (isAbrupt(cooked = ifAbrupt(cooked))) return cooked;
            var rawValue = Get(cooked, "raw");
            var raw = ToObject(rawValue);
            if (isAbrupt(raw = ifAbrupt(raw))) return raw;
            var len = Get(raw, "length");
            var literalSegments = ToLength(len);
            if (isAbrupt(literalSegments = ifAbrupt(literalSegments))) return literalSegments;
            if (literalSegments <= 0) return "";
            var stringElements = [];
            var nextIndex = 0;
            for (;;) {
                var nextKey = ToString(nextIndex);
                var next = Get(raw, nextKey);
                var nextSeg = ToString(next);
                if (isAbrupt(nextSeg = ifAbrupt(nextSeg))) return nextSeg;
                stringElements.push(nextSeg);
                if (nextIndex + 1 === literalSegments) {
                    var string = stringElements.join('');
                    return NormalCompletion(string);
                }
                next = Get(substitutions, nextKey);
                var nextSub = ToString(next);
                if (isAbrupt(nextSub = ifAbrupt(nextSub))) return nextSub;
                stringElements.push(nextSub);
                nextIndex = nextIndex + 1;
            }
            if (isAbrupt(cooked = ifAbrupt(cooked))) return cooked;
        });

        DefineOwnProperty(StringConstructor, "raw", {
            value: StringRawFunction,
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(StringConstructor, "fromCharCode", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {}),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(StringConstructor, "fromCodePoint", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {}),
            enumerable: false,
            writable: true,
            configurable: true
        });



        function GetReplaceSubstitution (matched, string, postion, captures) {
            Assert(Type(matched) === "string", "matched has to be a string");
            var matchLength = matched.length;
            Assert(Type(string) === "string");
            var stringLength = string.length;
            Assert(position >= 0, "position isnt a non negative integer");
            Assert(position <= stringLength);
            Assert(Array.isArray(captures), "captures is a possibly empty list but a list");
            var tailPos = position + matchLength;
            var m = captures.length;
            result = matched.replace("$$", "$");
            /*
             Table 39 - Replacement Text Symbol Substitutions missing
             Please fix your skills here
             */
            return result;
        }

        var normalizeOneOfs = {
            "NFC":true,
            "NFD":true,
            "NFKC":true,
            "NFKD":true
        };

        var StringPrototype_normalize = function (thisArg, argList) {
            var form = argList[0];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            if (form === undefined) from = "NFC";
            var f = ToString(form);
            if ((f = ifAbrupt(f)) && ifAbrupt(f)) return f;
            if (!normalizeOneOfs[f]) return withError("Range", "f is not one of nfc, nfd, nfkc, nfkd.")
            if (S.normalize) {
                // powers of native es.
                var ns = S.normalize(f);
            } else {
                // off point, but a fill-in
                ns = ""+S;
            }
            return NormalCompletion(ns);
        };

        var StringPrototype_replace = function (thisArg, argList) {
            var searchValue = argList[0];
            var replaceValue = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            if (Type(searchValue) === "object" && HasProperty(searchValue, $$isRegExp)) {
                return Invoke(searchValue, "replace", [string, replaceValue]);
            }
            var searchString = ToString(searchValue);
            if (isAbrupt(searchString = ifAbrupt(searchString))) return searchString;
            var i = 0;
            var len = S.length;
            var searchLen = searchString.length;
            while (i < len) {
                if ((S[i] == searchString[0]) && (S[i+searchLen-1] == searchString[searchLen-1])) {
                    var k = 0;
                    var match = true;
                    while (k < searchLen) {
                        if (S[k] !== searchString[k]) {
                            match = false;
                            break;
                        }
                        k = k + 1;
                    }

                    if (match) {
                        matched = searchString;
                        if (IsCallable(replaceValue)) {
                            var replValue = callInternalSlot("Call", replaceValue, undefined, [matched, pos, string])
                            if (isAbrupt(replValue = ifAbrupt(replValue))) return replValue;
                            var replStr = ToString(replValue);
                            if (isAbrupt(replStr = ifAbrupt(replStr))) return replStr;

                        } else {
                            var capstures = [];
                            var replStr = GetReplaceSubstitution(matched, string, pos, captures);

                        }
                        var tailPos = pos - matched.length;
                        var newString;


                    }
                }
                i = i + 1;
            }
            return NormalCompletion(string);
        };
        var StringPrototype_match = function (thisArg, argList) {
            var regexp = argList[0];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var rx;
            if (Type(regexp) === "object" && HasProperty(regexp, $$isRegExp)) {
                rx = regexp;
            } else {
                rx = RegExpCreate(regexp, undefined);
            }
            if (isAbrupt(rx = ifAbrupt(rx))) return rx;
            return Invoke(rx, "match", []);
        };
        var StringPrototype_repeat = function (thisArg, argList) {
            var count = argList[0];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var n = ToInteger(count);
            if (isAbrupt(n = ifAbrupt(n))) return n;
            if (n < 0) return withError("Range", "n is less than 0");
            if (n === Infinity) return withError("Range", "n is infinity");
            var T = "";
            for (var i = 0; i < n; i++) T+=S;
            return NormalCompletion(T);
        };

        var StringPrototype_contains = function (thisArg, argList) {
            var searchString = argList[0];
            var position = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var searchStr = ToString(searchString);
            var pos = ToInteger(position);
            var len = S.length;
            var start = min(max(pos, 0), len);
            var searchLen = searchStr.length;
            var i = start;
            var j = len;
            var result = false;
            while (i < len-searchLen) {

                if ((searchStr[0] === S[i]) && (searchStr[searchLen-1] === S[i+searchLen-1])) {
                    result = true;
                    for (var k = i+1, l = i+searchLen-1, m = 1; k < l; k++, m++) {
                        if (searchStr[m] !== S[k]) result = false;
                    }
                    if (result) return true;
                }

                i = i+1;
            }
            return false;
        };

        var StringPrototype_startsWith = function (thisArg, argList) {
            var searchString = argList[0];
            var position = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var searchStr = ToString(searchString);
            var pos = ToInteger(position);
            var len = S.length;
            var start = min(max(pos, 0), len);
            var searchLength = searchString.length;
            if (searchLength+start > len) return false;
            var result = true;
            for (var k = 0, i = start, j = searchLength+start; i < j; i++, k++) {
                if (searchStr[k] !== S[i]) { result = false; break; }
            }
            return result;
        };
        var StringPrototype_endsWith = function (thisArg, argList) {
            var searchString = argList[0];
            var endPosition = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var searchStr = ToString(searchString);
            var pos = endPosition === undefined ? len : ToInteger(endPosition);
            var len = S.length;
            var end = min(max(pos, 0), len);
            var searchLength = searchString.length;
            var start = end - searchLength;
            if (start < 0) return false;
            var result = true;
            for (var i = start, j = start + searchLength, k = 0; i < j; i++, k++) {
                if (searchString[k] !== S[i]) { result = false; break; }
            }
            return result;
        };
        var StringPrototype_valueOf = function valueOf(thisArg, argList) {
            var x = thisStringValue(thisArg);
            return x;
        };
        var StringPrototype_toArray = function (thisArg, argList) {
            var S = CheckObjectCoercible(thisArg);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            S = ToString(S);
            var array = ArrayCreate(0);
            var len = S.length;
            var n = 0;
            while (n < len) {
                var c = S[n];
                callInternalSlot("DefineOwnProperty", array, ToString(n), {
                    configurable: true,
                    enumerable: true,
                    value: c,
                    writable: true
                }, false);
                n = n + 1;
            }
            return NormalCompletion(array);

        };

        var trim_leading_space_expr = /^([\s]*)/;
        var trim_trailing_space_expr = /([\s]*)$/;
        // 31.1.
        var StringPrototype_trim = function (thisArg, argList) {
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var T;
            T = S.replace(trim_leading_space_expr, "");
            T = T.replace(trim_trailing_space_expr, "");
            return NormalCompletion(T);
        };

        // 31.1.
        var StringPrototype_search = function (thisArg, argList) {
            var regexp = argList[0];
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var rx;
            if (Type(regexp) === "object"  && HasProperty(regexp, $$isRegExp)) {
                rx = regexp;
            } else {
                rx = RegExpCreate(regexp, undefined);
            }
            if (isAbrupt(rx = ifAbrupt(rx))) return rx;
            return Invoke(rx, "search", [S]);
        };
        // 31.1.
        var StringPrototype_toUpperCase = function (thisArg, argList) {
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var U = S.toUpperCase();
            return NormalCompletion(U);
        };

        // 31.1.
        var StringPrototype_toLowerCase = function (thisArg, argList) {
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var L = S.toLowerCase();
            return NormalCompletion(L);
        };

        var StringPrototype_charAt = function (thisArg, argList) {
            var index = argList[0];
            index = index|0;
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var V = S.charAt(index);
            return NormalCompletion(V);
        };
        var StringPrototype_charCodeAt = function (thisArg, argList) {
            var index = argList[0];
            index = index|0;
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            if (index < 0) return NormalCompletion(NaN);
            if (index >= S.length) return NormalCompletion(NaN);
            var C = S.charCodeAt(index);
            return NormalCompletion(C);

        };

        var StringPrototype_split = function (thisArg, argList) {
            var separator = argList[0];
            var limit = argList[1];
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            if (Type(separator) === "object" && HasProperty(separator, $$isRegExp)) {
                return Invoke(separator, "split", [O, limit]);
            }
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var A = ArrayCreate(0);
            var lengthA = 0;
            var lim;
            if (limit === undefined) lim = Math.pow(2,53)-1;
            else lim = ToLength(limit);
            var s = S.length;
            var p = 0;
            var R = ToString(separator);

        };

        // http://wiki.ecmascript.org/doku.php?id=strawman:strawman
        // 29.1. i have read a post about es7 timeline and one
        // said for es7 we should look into the strawman namespace except
        // for observe which is in harmony. Here is string_extensions
        // http://wiki.ecmascript.org/doku.php?id=strawman:string_extensions
        // the document defines lpad and rpad
        var StringPrototype_lpad = function (thisArg, argList) {
            var minLength = argList[0];
            var fillStr = argList[1];
            var O = CheckObjectCoercible(thisArg);
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var intMinLength = ToInteger(minLength);
            if (isAbrupt(intMinLength = ifAbrupt(intMinLength))) return intMinLength;
            if (intMinLength === undefined) return NormalCompletion(S);
            var fillLen = intMinLength - S.length;
            if (fillLen < 0) return withError("Range", "lpad: fillLen is smaller than the string"); // maybe auto cut just the string. too?
            if (fillLen == Infinity) return withError("Range", "lpad: fillLen is Infinity");
            var sFillStr;
            if (fillStr === undefined) sFillStr = " ";
            else sFillStr = ""+fillStr;
            var sFillVal = sFillStr;
            var sFillLen;
            do { sFillVal += sFillStr; } while ((sFillLen = (sFillVal.length - S.length)) < fillLen);
            if (sFillLen > fillLen) sFillVal = sFillVal.substr(0, fillLen);
            return NormalCompletion(sFillVal + S)
        };
        var StringPrototype_rpad = function (thisArg, argList) {
            var minLength = argList[0];
            var fillStr = argList[1];
            var O = CheckObjectCoercible(thisArg);
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var intMinLength = ToInteger(minLength);
            if (isAbrupt(intMinLength = ifAbrupt(intMinLength))) return intMinLength;
            if (intMinLength === undefined) return NormalCompletion(S);
            var fillLen = intMinLength - S.length;
            if (fillLen < 0) return withError("Range", "lpad: fillLen is smaller than the string");
            if (fillLen == Infinity) return withError("Range", "lpad: fillLen is Infinity");
            var sFillStr;
            if (fillStr === undefined) sFillStr = " ";
            else sFillStr = ""+fillStr;
            var sFillVal = sFillStr;
            var sFillLen;
            do { sFillVal += sFillStr; } while ((sFillLen = (sFillVal.length - S.length)) < fillLen);
            if (sFillLen > fillLen) sFillVal = sFillVal.substr(0, fillLen);
            return NormalCompletion(S + sFillVal);
        };


        var StringPrototype_codePointAt = function (thisArg, argList) {
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var position = ToInteger(pos);
            var size = S.length;
            if (position < 0 || position >= size) return NormalCompletion(undefined);
            var first = S.charCodeAt(position);
            if (first < 0xD800 || first > 0xDBFF || (position+1===size)) return S;
            var second = S.charCodeAt(position+1);
            if (second < 0xDC00 || second > 0xDFFF) return NormalCompletion(first);
            var result = (((first - 0xD800)*1024) + (second - 0xDC00)) + 0x10000;
            return NormalCompletion(result);
        };

        var StringPrototype_concat = function (thisArg, argList) {
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var R = S;
            var next;
            for (var i = 0, j = argList.length; i < j; i++ ) {
                var next = argList[i];
                var nextString = ToString(next);
                if (isAbrupt(nextString = ifAbrupt(nextString))) return nextString;
                R = R + next;
            }
            return NormalCompletion(R);
        };

        var StringPrototype_indexOf = function (thisArg, argList) {
            var searchString = argList[0];
            var position = argList[1];
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var searchStr = ToString(searchStr);
            var pos = position | 0;
            var len = S.length;
            var start = min(max(pos, 0), len);
            var searchLen = searchStr.length;
            outer:
                for (var i = 0, j = (S.length-searchLen); i < j; i++) {
                    var ch = S[i];
                    if (ch === searchStr[0]) {
                        var k = 0;
                        while (k < searchLen) {
                            if (S[i+k] !== searchStr[k]) continue outer;
                            k = k + 1;
                        }
                        return NormalCompletion(i);
                    }
                }
            return NormalCompletion(-1);
        };


        var StringPrototype_lastIndexOf = function (thisArg, argList)   {
            var searchString = argList[0];
            var position = argList[1];
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var numPos = ToNumber(position);
            if (isAbrupt(numPos = ifAbrupt(numPos))) return numPos;
            var pos;
            if (numPos !== numPos) pos = Infinity;
            else pos = numPos|0;
            var start = min(max(pos, 0), len);
            var searchLen = searchStr.length;


        };

        var StringPrototype_localeCompare = function (thisArg, argList) {
            var that = argList[0];
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var S = ToString(O);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            var That = ToString(that);
            if (isAbrupt(that = ifAbrupt(that))) return that;
            return NormalCompletion(undefined);
        };

        var StringPrototype_at = function (thisArg, argList) {
            var position = argList[0];
            var O = CheckObjectCoercible(thisArg);
            var S = ToString(O);
            if (isAbrupt(S=ifAbrupt(S))) return S;
            var position = ToInteger(pos);
            if (isAbrupt(pos=ifAbrupt(pos))) return pos;
            var size = S.length;
            if (position < size || position > size) return NormalCompletion("");
            var first = S[position];
            var cuFirst = s.charCodeAt(0);
            if (cuFirst < 0xD800 || cuFirst > 0xDBFF || (position + 1 === size)) return NormalCompletion(first);
            var cuSecond = S.charCodeAt[position+1];
            if (cuSecond < 0xDC00 || cuSecond > 0xDFFF) return NormalCompletion(first);
            var second = S.charCodeAt[position+1];
            var cp = (first - 0xD800) * 0x400+(second-0xDC00)+0x1000
            return String.fromCharCode(cuFirst, cuSecond);
        };

        LazyDefineBuiltinFunction(StringPrototype, "at", 1, StringPrototype_at);
        LazyDefineBuiltinFunction(StringPrototype, "charAt", 1, StringPrototype_charAt);
        LazyDefineBuiltinFunction(StringPrototype, "charCode", 1, StringPrototype_charCodeAt);
        LazyDefineBuiltinFunction(StringPrototype, "codePointAt", 1, StringPrototype_codePointAt);
        LazyDefineBuiltinFunction(StringPrototype, "concat", 1, StringPrototype_concat);
        LazyDefineBuiltinFunction(StringPrototype, "contains", 1, StringPrototype_contains);

        LazyDefineBuiltinFunction(StringPrototype, "endsWith", 1, StringPrototype_endsWith);
        LazyDefineBuiltinFunction(StringPrototype, "indexOf", 1, StringPrototype_indexOf);
        LazyDefineBuiltinFunction(StringPrototype, "lpad", 1, StringPrototype_lpad);
        LazyDefineBuiltinFunction(StringPrototype, "rpad", 1, StringPrototype_rpad);
        LazyDefineBuiltinFunction(StringPrototype, "match", 0, StringPrototype_match);
        LazyDefineBuiltinFunction(StringPrototype, "normalize", 0, StringPrototype_normalize);
        LazyDefineBuiltinFunction(StringPrototype, "repeat", 0, StringPrototype_repeat);
        LazyDefineBuiltinFunction(StringPrototype, "replace", 0, StringPrototype_replace);
        LazyDefineBuiltinFunction(StringPrototype, "search", 1, StringPrototype_search);
        LazyDefineBuiltinFunction(StringPrototype, "startsWith", 1, StringPrototype_startsWith);
        LazyDefineBuiltinFunction(StringPrototype, "toArray", 0, StringPrototype_toArray);
        LazyDefineBuiltinFunction(StringPrototype, "toLocaleCompare", 0, StringPrototype_localeCompare);
        LazyDefineBuiltinFunction(StringPrototype, "toLowerCase", 0, StringPrototype_toLowerCase);
        LazyDefineBuiltinFunction(StringPrototype, "toUpperCase", 0, StringPrototype_toUpperCase);
        LazyDefineBuiltinFunction(StringPrototype, "trim", 1, StringPrototype_trim);
        LazyDefineBuiltinFunction(StringPrototype, "valueOf", 0, StringPrototype_valueOf);
        LazyDefineBuiltinConstant(StringPrototype, $$toStringTag, "String");
        MakeConstructor(StringConstructor, true, StringPrototype);
        // ===========================================================================================================
        // String Iterator
        // ===========================================================================================================

        DefineOwnProperty(StringPrototype, $$iterator, {
            value: CreateBuiltinFunction(realm, function iterator(thisArg, argList) {
                return CreateStringIterator(thisArg, "value");
            }, 0, "[Symbol.iterator]"),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringPrototype, "values", {
            value: CreateBuiltinFunction(realm, function values(thisArg, argList) {
                return CreateStringIterator(thisArg, "value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringPrototype, "keys", {
            value: CreateBuiltinFunction(realm, function keys(thisArg, argList) {
                return CreateStringIterator(thisArg, "key");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringPrototype, "entries", {
            value: CreateBuiltinFunction(realm, function entries(thisArg, argList) {
                return CreateStringIterator(thisArg, "key+value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringIteratorPrototype, "next", {
            value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object")
                    return withError("Type", "the this value is not an object");

                if (!hasInternalSlot(O, "IteratedString") || !hasInternalSlot(O, "IteratorNextIndex") || !hasInternalSlot(O, "IterationKind"))
                    return withError("Type", "iterator has not all of the required internal properties");

                var string = getInternalSlot(O, "IteratedString");
                var kind = getInternalSlot(O, "IterationKind");
                var index = getInternalSlot(O, "IteratorNextIndex");
                var result;


                string = ToString(string);
                var len = string.length;

                if (index < len) {
                    var ch = string[index];
                    setInternalSlot(O, "IteratorNextIndex", index + 1);
                    if (kind === "key") result = index;
                    else if (kind === "value") result = ch;
                    else {
                        Assert(kind === "key+value", "string iteration kind has to be key+value");
                        var result = ArrayCreate(2);
                        CreateDataProperty(result, "0", index);
                        CreateDataProperty(result, "1", ch);
                    }
                    return CreateItrResultObject(result, false);
                }
                return CreateItrResultObject(undefined, true);
            }),
            enumerable: false,
            configurable: false,
            writable: false
        });

        function CreateStringIterator(string, kind) {
            var iterator = ObjectCreate(StringIteratorPrototype, {
                "IteratedString": undefined,
                "IteratorNextIndex": undefined,
                "IterationKind": undefined
            });
            // for-of before worked without. there must be a mistake somewhere (found in ToPrimitive)
            // if (string instanceof StringExoticObject) string = getInternalSlot(string, "StringData");
            // ---
            setInternalSlot(iterator, "IteratedString", string);
            setInternalSlot(iterator, "IteratorNextIndex", 0);
            setInternalSlot(iterator, "IterationKind", kind);
            return iterator;
        }

        // ===========================================================================================================
        // Boolean Constructor and Prototype
        // ===========================================================================================================

        setInternalSlot(BooleanConstructor, "Call", function Call(thisArg, argList) {
            var O = thisArg;
            var value = argList[0];
            var b = ToBoolean(value);
            if (Type(O) === "object" && hasInternalSlot(O, "BooleanData") && getInternalSlot(O, "BooleanData") === undefined) {
                setInternalSlot(O, "BooleanData", b);
                return NormalCompletion(O);
            }
            return NormalCompletion(b);
        });
        setInternalSlot(BooleanConstructor, "Construct", function Construct(argList) {
            return OrdinaryConstruct(this, argList);
        });
        MakeConstructor(BooleanConstructor, true, BooleanPrototype);
        DefineOwnProperty(BooleanConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var F = thisArg;
                var obj = OrdinaryCreateFromConstructor(F, "%BooleanPrototype%", {
                    "BooleanData": undefined
                });
                return obj;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(BooleanConstructor, "length", {
            value: 1,
            enumerable: false,
            writable: false,
            configurable: false
        });
        DefineOwnProperty(BooleanPrototype, "constructor", {
            value: BooleanConstructor,
            enumerable: false,
            writable: false,
            configurable: false
        });
        DefineOwnProperty(BooleanPrototype, "toString", {
            value: CreateBuiltinFunction(realm, function toString(thisArg, argList) {
                var b = thisBooleanValue(thisArg);
                if (isAbrupt(b)) return b;
                if (b === true) return "true";
                if (b === false) return "false";
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(BooleanPrototype, "valueOf", {
            value: CreateBuiltinFunction(realm, function valueOf(thisArg, argList) {
                return thisBooleanValue(thisArg);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        // ===========================================================================================================
        // Symbol Constructor and Prototype
        // ===========================================================================================================

        MakeConstructor(SymbolFunction, true, SymbolPrototype);

        var SymbolFunction_Call = function Call(thisArg, argList) {
            var descString;
            var description = argList[0];
            if (description !== undefined) descString = ToString(description);
            if (isAbrupt(descString = ifAbrupt(descString))) return descString;
            var symbol = SymbolPrimitiveType();
            setInternalSlot(symbol, "Description", descString);
            return NormalCompletion(symbol);
        };
        var SymbolFunction_Construct = function Construct(argList) {
            return OrdinaryConstruct(this, argList);
        };

        setInternalSlot(SymbolFunction, "Call", SymbolFunction_Call);
        setInternalSlot(SymbolFunction, "Construct", SymbolFunction_Construct);

        LazyDefineBuiltinConstant(SymbolFunction, "create", $$create);
        LazyDefineBuiltinConstant(SymbolFunction, "toStringTag", $$toStringTag);
        LazyDefineBuiltinConstant(SymbolFunction, "toPrimitive", $$toPrimitive);
        LazyDefineBuiltinConstant(SymbolFunction, "toInstance", $$hasInstance);
        LazyDefineBuiltinConstant(SymbolFunction, "isConcatSpreadable", $$isConcatSpreadable);
        LazyDefineBuiltinConstant(SymbolFunction, "iterator", $$iterator);
        LazyDefineBuiltinConstant(SymbolFunction, "isRegExp", $$isRegExp);
        LazyDefineBuiltinConstant(SymbolFunction, "unscopables", $$unscopables);

        var SymbolFunction_$$create = function (thisArg, argList) {
            return withError("Type", "The Symbol[@@create] method of the Symbol function is supposed to throw a Type Error");
        };

        DefineOwnProperty(SymbolFunction, $$create, {
            value: CreateBuiltinFunction(realm, SymbolFunction_$$create, 0, "[Symbol.create]"),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "prototype", {
            value: SymbolPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        setInternalSlot(SymbolPrototype, "Prototype", ObjectPrototype);
        DefineOwnProperty(SymbolPrototype, "constructor", {
            value: SymbolFunction,
            writable: false,
            enumerable: false,
            configurable: false
        });

        var SymbolPrototype_toString = function toString(thisArg, argList) {
            var s = thisArg;
            if (hasInternalSlot(s, "SymbolData")) return withError("Type", "The this argument has got no [[SymbolData]] property.");
            var sym = getInternalSlot(s, "SymbolData");
            var desc = getInternalSlot(sym, "Description");
            if (desc === undefined) desc = "";
            Assert(Type(desc) === "string", "The [[Description]] field of the symbol of the this argument is not a string");
            var result = "Symbol(" + desc + ")";
            return NormalCompletion(result);
        };

        var SymbolPrototype_valueOf = function valueOf(thisArg, argList) {
            var s = thisArg;
            if (hasInternalSlot(s, "SymbolData")) return withError("Type", "The this argument has got no [[SymbolData]] property.");
            var sym = getInternalSlot(s, "SymbolData");
            return NormalCompletion(sym);
        };

        var SymbolPrototype_$$toPrimitive = function (thisArg, argList) {
            return withError("Type", "Symbol.prototype[@@toPrimitive] is supposed to throw a Type Error!");
        };



        // var GlobalSymbolRegistry = Object.create(null);
        // moved up to the realm


        var SymbolFunction_keyFor = function (thisArg, argList) {
            var sym = argList[0];
            if (Type(sym) !== "symbol") return withError("Type", "keyFor: sym is not a symbol");
            var key = getInternalSlot(sym, "Description");
            var e = GlobalSymbolRegistry[key];
            if (SameValue(e.Symbol, sym)) return NormalCompletion(e.key);
            Assert(getRealm().GlobalSymbolRegistry[key] === undefined, "GlobalSymbolRegistry must not contain an entry for sym");
            return NormalCompletion(undefined);
        };


        var SymbolFunction_for = function (thisArg, argList) {
            var key = argList[0];
            var stringKey = ToString(key)
            if (isAbrupt(stringKey = ifAbrupt(stringKey))) return stringKey;
            var e = getRealm().GlobalSymbolRegistry[key];
            if (e !== undefined && SameValue(e.Key, stringKey)) return NormalCompletion(e.symbol);
            Assert(e === undefined, "GlobalSymbolRegistry must currently not contain an entry for stringKey");
            var newSymbol = SymbolPrimitiveType();
            setInternalSlot(newSymbol, "Description", stringKey);
            getRealm().GlobalSymbolRegistry[stringKey] = { Key: stringKey, Symbol: newSymbol };
            return NormalCompletion(newSymbol); // There is a Typo newSumbol in the Spec. 
        };



        LazyDefineBuiltinFunction(SymbolFunction, "for", 1, SymbolFunction_for);
        LazyDefineBuiltinFunction(SymbolFunction, "keyFor", 1, SymbolFunction_keyFor /* ,realm */);
        LazyDefineBuiltinFunction(SymbolPrototype, "toString", 0, SymbolPrototype_toString);
        LazyDefineBuiltinFunction(SymbolPrototype, "valueOf", 0, SymbolPrototype_valueOf);
        LazyDefineBuiltinConstant(SymbolPrototype, $$toStringTag, "Symbol");
        LazyDefineBuiltinConstant(SymbolPrototype, $$toPrimitive,
            CreateBuiltinFunction(realm, SymbolPrototype_$$toPrimitive, 1, "[Symbol.toPrimitive]"));


        // ===========================================================================================================
        // encodeURI, decodeURI functions
        // ===========================================================================================================

        setInternalSlot(EncodeURIFunction, "Call", function (thisArg, argList) {
            var uri = argList[0];
            var uriString = ToString(uri);
            if (isAbrupt(uriString = ifAbrupt(uriString))) return uriString;
            var unescapedUriSet = "" + uriReserved + uriUnescaped + "#";
            return Encode(uriString, unescapedUriSet);
        });

        setInternalSlot(EncodeURIComponentFunction, "Call", function (thisArg, argList) {
            var uriComponent = argList[0];
            var uriComponentString = ToString(uriComponent);
            if (isAbrupt(uriComponentString = ifAbrupt(uriComponentString))) return uriComponentString;
            var unescapedUriComponentSet = "" + uriUnescaped;
            return Encode(uriComponentString, unescapedUriComponentSet);
        });

        setInternalSlot(DecodeURIFunction, "Call", function (thisArg, argList) {
            var encodedUri = argList[0];
            var uriString = ToString(encodedUri);
            if (isAbrupt(uriString = ifAbrupt(uriString))) return uriString;
            var reservedUriSet = "" + uriReserved + "#";
            return Decode(uriString, reservedUriSet);
        });

        setInternalSlot(DecodeURIComponentFunction, "Call", function (thisArg, argList) {
            var encodedUriComponent = argList[0];
            var uriComponentString = ToString(encodedUriComponent);
            if (isAbrupt(uriComponentString = ifAbrupt(uriComponentString))) return uriComponentString;
            var reservedUriComponentSet = "";
            return Decode(uriComponentString, reservedUriComponentSet);
        });

        // ===========================================================================================================
        // escape, unescape
        // ===========================================================================================================

        setInternalSlot(EscapeFunction, "Call", function (thisArg, argList) {
            return escape(argList[0]);
        });

        setInternalSlot(UnescapeFunction, "Call", function (thisArg, argList) {
            return unescape(argList[0]);
        });

        // ===========================================================================================================
        // parseInt, parseFloat
        // ===========================================================================================================

        setInternalSlot(ParseIntFunction, "Call", function (thisArg, argList) {
            return parseInt(argList[0], argList[1]);
        });

        setInternalSlot(ParseFloatFunction, "Call", function (thisArg, argList) {
            return parseFloat(argList[0], argList[1]);
        });

        // ===========================================================================================================
        // eval("let x = 10"); Function calls the parser and exports.Evaluate
        // ===========================================================================================================

        setInternalSlot(EvalFunction, "Call", function (thisArg, argList) {
            var input, strict, direct, strictCaller, evalRealm, directCallToEval,
                ctx, value, result, script, evalCxt, LexEnv, VarEnv, strictVarEnv,
                strictScript;

            input = GetValue(argList[0]);
            if (Type(input) !== "string") return input;
            try {
                script = parse(input);
            } catch (ex) {
                return withError("Syntax", ex.message);
            }

            if (script.type !== "Program") return undefined;

            if (script.strict) {
                strict = true;
            }

            if (directCallToEval) direct = true;
            if (direct) {
                strictCaller = true;
            } else {
                strictCaller = false;
            }
            ctx = getContext();
            if (strict) ctx.strict = true;
            evalRealm = ctx.realm;

            if (direct) {

                // 1. if the code that made the call is function code
                // and ValidInFunction is false throw SyntaxError
                // 2. If the code is module code and
                // ValidInModule ist false throw SyntaxError
            }
            if (direct) {
                LexEnv = ctx.LexEnv;
                VarEnv = ctx.VarEnv;
            } else {
                LexEnv = evalRealm.globalEnv;
                VarEnv = evalRealm.globalEnv;
            }
            if (strictScript || (direct && strictCaller)) {
                strictVarEnv = NewDeclarativeEnvironment(LexEnv);
                LexEnv = strictVarEnv;
                VarEnv = strictVarEnv;
            }

            evalCxt = ExecutionContext(getLexEnv());
            evalCxt.realm = evalRealm;
            evalCxt.VarEnv = VarEnv;
            evalCxt.LexEnv = LexEnv;
            getStack().push(evalCxt);
            result = require("runtime").Evaluate(script);
            getStack().pop();
            return result;
        });

        setInternalSlot(EvalFunction, "Construct", null);

        // ===========================================================================================================
        // Error
        // ===========================================================================================================

        setInternalSlot(ErrorPrototype, "Prototype", ObjectPrototype);
        MakeConstructor(ErrorConstructor, true, ErrorPrototype);
        LazyDefineBuiltinConstant(ErrorConstructor, "prototype", ErrorPrototype);
        LazyDefineBuiltinConstant(ErrorPrototype, "constructor", ErrorConstructor);
        LazyDefineBuiltinConstant(ErrorPrototype, "name", "Error");

        setInternalSlot(ErrorConstructor, "Call", function (thisArg, argList) {
            var func = ErrorConstructor;
            var message = argList[0];
            var name = "Error";
            var O = thisArg;
            var isObject = Type(O) === "object";
            // This is different from the others in the spec
            if (!isObject || (isObject &&
                (!hasInternalSlot(O, "ErrorData") || (getInternalSlot(O, "ErrorData") === undefined)))) {
                O = OrdinaryCreateFromConstructor(func, "%ErrorPrototype%", {
                    "ErrorData": undefined
                });
                if (isAbrupt(O = ifAbrupt(O))) return O;
            }
            // or i read it wrong
            Assert(Type(O) === "object");
            setInternalSlot(O, "ErrorData", "Error");
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
            setInternalSlot(O, "toString", function () { return "[object Error]"; })
            return O;
        });

        setInternalSlot(ErrorConstructor, "Construct", function (argList) {
            var F = this;
            var argumentsList = argList;
            return OrdinaryConstruct(F, argumentsList);
        });

        DefineOwnProperty(ErrorConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var F = thisArg;
                var obj = OrdinaryCreateFromConstructor(F, "%ErrorPrototype%", {
                    "ErrorData": undefined
                });
                return obj;
            }),
            writable: false,
            configurable: false,
            enumerable: false
        });

        DefineOwnProperty(ErrorPrototype, "toString", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "Error.prototype.toString: O is not an object.");
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
            var name = nativeType + "Error";
            var intrProtoName = "%" + nativeType + "ErrorPrototype%"
            //SetFunctionName(ctor, name);
            setInternalSlot(ctor, "Call", function (thisArg, argList) {
                var func = this;
                var O = thisArg;
                var message = argList[0];
                if (Type(O) !== "object" ||
                    (Type(O) == "object" && getInternalSlot(O, "ErrorData") == undefined)) {
                    O = OrdinaryCreateFromConstructor(func, intrProtoName);
                    if (isAbrupt(O)) return O;
                    O = ifAbrupt(O);
                }
                if (Type(O) !== "object") return withError("Assert: NativeError: O is an object: failed");
                setInternalSlot(O, "ErrorData", name);
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

                CreateDataProperty(O, "stack", stringifyErrorStack())

                // interne representation
                setInternalSlot(O, "toString", function () {
                    return "[object "+name+"]";
                });
                return O;

            });

            setInternalSlot(ctor, "Construct", function (thisArg, argList) {
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

        // ===========================================================================================================
        // Date Constructor and Prototype (algorithms above)
        // ===========================================================================================================

        setInternalSlot(DateConstructor, "Call", function (thisArg, argList) {

            var O = thisArg;
            var numberOfArgs = argList.length;
            var y, m, dt, h, min, milli, finalDate;

            if (numberOfArgs >= 2) {

                var year = argList[0];
                var month = argList[1];
                var date = argList[2];
                var hours = argList[3];
                var minutes = argList[4];
                var seconds = argList[5];
                var ms = argList[6];

                if (Type(O) === "object"
                    && hasInternalSlot(O, "DateValue")
                    && (getInternalSlot(O, "DateValue") === undefined)) {

                    y = ToNumber(year);
                    if (isAbrupt(y)) return y;
                    m = ToNumber(month);
                    if (isAbrupt(m)) return m;
                    if (date) dt = ToNumber(date);
                    else dt = 1;
                    if (isAbrupt(dt)) return dt;
                    if (hours) h = ToNumber(hours);
                    else h = 0;
                    if (minutes) min = ToNumber(minutes);
                    else min = 0;
                    if (isAbrupt(min)) return min;
                    if (ms) milli = ToNumber(ms);
                    else milli = 0;
                    if (isAbrupt(milli)) return milli;
                    finalDate = MakeDate(MakeDay(yr, m, dt), MakeTime(h, min, s, milli));
                    setInternalSlot(O, "DateValue", TimeClip(UTC(finalDate)));
                }
                return O;
            } else if (numberOfArgs === 1) {
                var value = argList[0];
                var tv, v;
                if (Type(O) === "object" && hasInternalSlot(O, "DateValue") && getInternalSlot(O, "DateValue") === undefined) {
                    if (Type(value) === "object" && hasInternalSlot(value, "DateValue")) tv = thisTimeValue(value);
                    else {
                        v = ToPrimitive(value);
                        if (Type(v) === "string") {
                            tv = Invoke(DateConstructor, "parse", [v])
                        } else {
                            tv = ToNumber(v);
                        }
                        if (isAbrupt(tv = ifAbrupt(tv))) return tv;
                        setInternalSlot(O, "DateValue", TimeClip(tv));
                        return O;
                    }
                }
            } else if (numberOfArgs === 0) {
                if (Type(O) === "object" && hasInternalSlot(O, "DateValue") && getInternalSlot(O, "DateValue") === undefined) {
                    setInternalSlot(O, "DateValue", Date.now()/*TimeClip(UTC(Date.now()))*/);
                    return O;
                }
            } else {
                O = OrdinaryConstruct(DateConstructor, []);
                return Invoke(O, "toString", []);
            }
        });

        setInternalSlot(DateConstructor, "Construct", function (thisArg, argList) {
            return OrdinaryConstruct(this, argList);
        });


        DefineOwnProperty(DateConstructor, "prototype", {
            value: DatePrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "constructor", {
            value: DateConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });

        //DatePrototype
        DefineOwnProperty(DateConstructor, "parse", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var string = ToString(argList[0]);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        //DatePrototype
        DefineOwnProperty(DateConstructor, "now", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                return NormalCompletion(Date.now());
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DateConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var obj = OrdinaryCreateFromConstructor(DateConstructor, "%DatePrototype%", {
                    "DateValue" : undefined
                });
                return obj;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getDate", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return DateFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getDay", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return WeekDay(LocalTime(t));
            }),

            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getFullYear", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return YearFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getHours", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return HourFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getMilliSeconds", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return msFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getMinutes", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return MinFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getMonth", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return MonthFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getTimeZoneOffset", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return (t - LocalTime(t));

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCDay", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return WeekDay(t);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCFullYear", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return YearFromTime(t);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCHours", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return HourFromTime(t);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCMilliseconds", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return msFromTime(t);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCMinutes", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return MinFromTime(t);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCSeconds", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return SecFromTime(t);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "setDate", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var date = argList[0];
                var t = LocalTime(thisTimeValue(thisArg));
                var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
                var u = TimeClip(UTC(newDate));
                setInternalSlot(thisArg, "DateValue", u);
                return u;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "", {
            value: null,
            writable: false,
            enumerable: false,
            configurable: false
        });

        LazyDefineBuiltinConstant(DatePrototype, $$toStringTag, "Date");

        //===========================================================================================================
        // Math 
        //============================================================================================================

        var PI = Math.PI;
        var LOG2E = Math.LOG2E;
        var SQRT1_2 = Math.SQRT1_2;
        var SQRT2 = Math.SQRT2;
        var LN10 = Math.LN10;
        var LN2 = Math.LN2;
        var LOG10E = Math.LOG10E;
        var E = Math.E;

        var MathObject_sign = function (thisArg, argList) {
            var x = ToNumber(argList[0]);
            if (isAbrupt(x)) return x;
            return NormalCompletion(x > 0 ? 1 : -1);
        };

        var MathObject_random = function (thisArg, argList) {
            return NormalCompletion(Math.random());
        };

        var MathObject_log = function (thisArg, argList) {
            var x = +argList[0];
            return NormalCompletion(Math.log(x));
        };
        var MathObject_ceil = function (thisArg, argList) {
            var x = +argList[0];
            return NormalCompletion(Math.ceil(x));
        };
        var MathObject_floor = function (thisArg, argList) {
            var x = +argList[0];
            return NormalCompletion(Math.floor(x));
        };
        var MathObject_abs = function (thisArg, argList) {
            var a = +argList[0];
            return NormalCompletion(Math.abs(a));
        };

        var MathObject_pow = function (thisArg, argList) {
            var b = +argList[0];
            var e = +argList[1];
            return NormalCompletion(Math.pow(b, e));
        };
        var MathObject_sin = function (thisArg, argList) {
            var x = +argList[0];
            return NormalCompletion(Math.sin(x));
        };
        var MathObject_cos = function (thisArg, argList) {
            var x = +argList[0];
            return NormalCompletion(Math.cos(x));
        };
        var MathObject_atan = function (thisArg, argList) {
            var x = +argList[0];
            var y = +argList[1];
            return NormalCompletion(Math.atan(x,y));
        };
        var MathObject_atan2 = function (thisArg, argList) {
            var x = +argList[0];
            var y = +argList[1];
            return NormalCompletion(Math.atan2(x,y));
        };
        var MathObject_max = function (thisArg, argList) {
            var args = CreateListFromArray(argList);
            if (isAbrupt(args)) return args;
            return NormalCompletion(Math.max.apply(Math, args));
        };
        var MathObject_min = function (thisArg, argList) {
            var args = CreateListFromArray(argList);
            if (isAbrupt(args)) return args;
            return NormalCompletion(Math.min.apply(Math, args));
        };
        var MathObject_tan = function (thisArg, argList) {
            var x = +argList[0];
            return NormalCompletion(Math.tan(x));
        };
        var MathObject_exp = function (thisArg, argList) {
            var x = argList[0];
            return NormalCompletion(Math.exp(x));
        };
        var MathObject_hypot = function (thisArg, argList) {

        };
        var MathObject_imul = function (thisArg, argList) {

        };

        var MathObject_log1p = function (thisArg, argList) {

        };

        var MathObject_clz = function (thisArg, argList) {
            var x = argList[0];
            x = ToNumber(x);
            if (isAbrupt(x = ifAbrupt(x))) return x;
            var n = ToUint32(x);
            if (isAbrupt(n = ifAbrupt(n))) return n;
            if (n < 0) return 0;
            if (n == 0) return 32;
            var bitlen = Math.ceil(Math.log(Math.pow(n, Math.LOG2E)));
            var p = 32 - bitlen;
            return NormalCompletion(p);
        };

        setInternalSlot(MathObject, "MathTag", true);
        setInternalSlot(MathObject, "Prototype", ObjectPrototype);

        LazyDefineBuiltinConstant(MathObject, "PI", PI);
        LazyDefineBuiltinConstant(MathObject, "LOG2E", LOG2E);
        LazyDefineBuiltinConstant(MathObject, "SQRT1_2", SQRT1_2);
        LazyDefineBuiltinConstant(MathObject, "SQRT2", SQRT2);
        LazyDefineBuiltinConstant(MathObject, "LN10", LN10);
        LazyDefineBuiltinConstant(MathObject, "LN2", LN2);
        LazyDefineBuiltinConstant(MathObject, "E", E);
        LazyDefineBuiltinConstant(MathObject, "LOG10E", LOG10E);
        LazyDefineBuiltinConstant(MathObject, $$toStringTag, "Math");

        LazyDefineBuiltinFunction(MathObject, "atan", 2, MathObject_atan);
        LazyDefineBuiltinFunction(MathObject, "atan2", 1, MathObject_atan2);
        LazyDefineBuiltinFunction(MathObject, "ceil", 1, MathObject_ceil);
        LazyDefineBuiltinFunction(MathObject, "clz", 1, MathObject_clz);
        LazyDefineBuiltinFunction(MathObject, "cos", 1, MathObject_cos);
        LazyDefineBuiltinFunction(MathObject, "exp", 1, MathObject_exp);
        LazyDefineBuiltinFunction(MathObject, "floor", 1, MathObject_floor);
        LazyDefineBuiltinFunction(MathObject, "hypot", 2, MathObject_hypot);
        LazyDefineBuiltinFunction(MathObject, "imul", 2, MathObject_imul);
        LazyDefineBuiltinFunction(MathObject, "log", 1, MathObject_log);
        LazyDefineBuiltinFunction(MathObject, "log1p", 1, MathObject_log1p);
        LazyDefineBuiltinFunction(MathObject, "max", 0, MathObject_max);
        LazyDefineBuiltinFunction(MathObject, "min", 0, MathObject_min);
        LazyDefineBuiltinFunction(MathObject, "pow", 2, MathObject_pow);
        LazyDefineBuiltinFunction(MathObject, "sin", 1, MathObject_sin);
        LazyDefineBuiltinFunction(MathObject, "sign", 1, MathObject_sign);
        LazyDefineBuiltinFunction(MathObject, "tan", 1, MathObject_tan);
        LazyDefineBuiltinFunction(MathObject, "random", 0, MathObject_random);

        // ===========================================================================================================
        // Number 
        // ===========================================================================================================

        MakeConstructor(NumberConstructor, true, NumberPrototype);

        var MIN_INTEGER = Number.MIN_INTEGER;
        var MAX_INTEGER = Number.MAX_INTEGER;
        var EPSILON = Number.EPSILON;
        var MIN_VALUE = Number.MIN_VALUE;
        var MAX_VALUE = Number.MAX_VALUE;
        var NAN = NaN;
        var POSITIVE_INFINITY = Infinity;
        var NEGATIVE_INFINITY = -Infinity;

        setInternalSlot(NumberConstructor, "Call", function (thisArg, argList) {
            var value = argList[0];
            var O = thisArg;
            var n;
            if (argList.length === 0) n = +0;
            else n = ToNumber(value);
            if (isAbrupt(n = ifAbrupt(n))) return n;
            if (Type(O) === "object" /*&& hasInternalSlot(O, "NumberData")*/ && getInternalSlot(O, "NumberData") === undefined) {
                setInternalSlot(O, "NumberData", n);
                return O;
            }
            return n;
        });

        setInternalSlot(NumberConstructor, "Construct", function (argList) {
            var F = NumberConstructor;
            return OrdinaryConstruct(F, argList);
        });

        var NumberConstructor_$$create = function (thisArg, argList) {
            var F = thisArg;
            var obj = OrdinaryCreateFromConstructor(F, "%NumberPrototype%", {
                "NumberData": undefined
            });
            return obj;
        };
        var NumberConstructor_isFinite = function (thisArg, argList) {
            var number = argList[0];
            if (Type(number) !== "number") return NormalCompletion(false);
            if ((number != number) || number === Infinity || number === -Infinity) return NormalCompletion(false);
            return NormalCompletion(true);
        };
        var NumberConstructor_isNaN = function (thisArg, argList) {
            var number = argList[0];
            if (Type(number) !== "number") return NormalCompletion(false);
            if (number != number) return NormalCompletion(true);
            return NormalCompletion(false);
        };

        var NumberConstructor_isInteger = function (thisArg, argList) {
            var number = argList[0];
            if (Type(number) !== "number") return NormalCompletion(false);
            if ((number != number) ||
                number === +Infinity || number === -Infinity) return NormalCompletion(false);
            return NormalCompletion(true);
        };
        var NumberPrototype_clz = function (thisArg, argList) {
            var x = thisNumberValue(thisArg);
            if (isAbrupt(x = ifAbrupt(x))) return x;
            var n = ToUint32(x);
            if (isAbrupt(n = ifAbrupt(n))) return n;
            if (n < 0) return 0;
            if (n === 0) return 32;
            var bitlen = Math.floor(Math.log(Math.pow(n, Math.LOG2E))) + 1;
            var p = 32 - bitlen;
            return NormalCompletion(p);
        };
        var NumberPrototype_toString = function (thisArg, argList) {
            var radix = argList[0];
            var n = thisNumberValue(thisArg);
            if (radix) {
                return (+n).toString(radix);
            }
            return ToString(thisArg);
        };
        var NumberPrototype_valueOf = function (thisArg, argList) {
            var x = thisNumberValue(thisArg);
            return NormalCompletion(x);
        };
        var NumberPrototype_toPrecision = function (thisArg, argList) {
            var precision = argList[0];
            var x = thisNumberValue(thisArg);
            if (isAbrupt(x = ifAbrupt(x))) return x;
            if (precision === undefined) return ToString(x);
            var p = ToInteger(precision);
            if (isAbrupt(p = ifAbrupt(p))) return p;
            if (x !== x) return "NaN";
            var s = "";
            if (x < 0) {
                s = "-";
                x = -x;
            }
            if (x === +Infinity || x === -Infinity) {
                return NormalCompletion(s + "Infinity");

            }

        };


// --> 
        function repeatString (str, times) {
            var concat = "";
            for (var i = 0; i < times; i++) {
                concat += str;
            }
            return concat;
        }

// -->

        var NumberPrototype_toFixed = function (thisArg, argList) {
            var fractionDigits = argList[0];
            var x = thisNumberValue(thisArg);
            if (isAbrupt(x = ifAbrupt(x))) return x;
            if (fractionDigits === undefined) return ToString(x);
            var f = ToInteger(fractionDigits);
            if (isAbrupt(f = ifAbrupt(f))) return f;
            if ((f < 0) || (f > 20)) return withError("Range", "fractionDigits is less or more than 20")
            if (x !== x) return "NaN";
            var s = "";
            if (x < 0) {
                s = "-";
                x = -x;
            }
            if (x >= 1021) {
                var m = ToString(x);
            } else {
                var n;
                if (n === 0) m = "0";
                else m = ""+n;
                if (f != 0) {
                    var k = Math.ceil(Math.log(Math.pow(n, Math.LOG2E))); // = number of elements in n
                    if (k <= f)  {
                        var z = repeatString(0x0030, f+1-k);
                        m = z + m;
                        k = f + 1;
                    }
                    var a = m.substr(0, k-f);
                    var b = m.substr(k-f);
                    m = a + "." + b;
                }
            }
            return NormalCompletion(s + m);
        };
        var NumberPrototype_toExponential = function (thisArg, argList) {
            var fractionDigits = argList[0];
            var x = thisNumberValue(thisArg);
            if (isAbrupt(x = ifAbrupt(x))) return x;
            var f = ToInteger(fractionDigits);
            if (isAbrupt(f = ifAbrupt(f))) return f;
            if (x !== x) return "NaN";
            var s = "";
            if (x < 0) {
                s = "-";
                x = -x;
            }
            var n;
            if (x === Infinity || s === -Infinity) {
                return s + "Infinity";
            }
            if (fractionDigits !== undefined && ((f < 0) || (f > 20))) return withError("Range", "toExponential: fractionDigits < 0 or > 20");
            if (x === 0) {
                if (fractionDigits === undefined) f = 0;
                var m = stringRepeat(0x0030, f+1);
                var e = 0;
            } else {
                if (fractionDigits !== undefined) {

                    // ich konnte das im mcview nicht lesen ob 10f oder 10^f
                    // ich hab das unterwegs geschrieben, todo
                    e;
                    n;
                } else {
                    e;
                    n;
                }
                m = ""+n;
            }
            if (f != 0) {
                var a = m.substr(m, 1);
                var b = m.substr(1);
            }
            if (e === 0) {
                var c = "+";
                var d = "0";
            } else {
                if (e > 0) c = "+";
                else if (e <= 0) {
                    c = "-";
                    e = -e;
                }
                d = ""+e;
                m = m + "e" + c + d;
            }
            return NormalCompletion(s + m)
        };

        LazyDefineBuiltinFunction(NumberConstructor, "isFinite", 0, NumberConstructor_isFinite);
        LazyDefineBuiltinFunction(NumberConstructor, "isNaN", 0, NumberConstructor_isNaN);
        LazyDefineBuiltinFunction(NumberConstructor, "isInteger", 0, NumberConstructor_isInteger);
        LazyDefineBuiltinFunction(NumberConstructor, $$create, 0, NumberConstructor_$$create);
        LazyDefineBuiltinConstant(NumberConstructor, "EPSILON", EPSILON);
        LazyDefineBuiltinConstant(NumberConstructor, "MIN_INTEGER", MIN_INTEGER);
        LazyDefineBuiltinConstant(NumberConstructor, "MIN_VALUE", MIN_VALUE);
        LazyDefineBuiltinConstant(NumberConstructor, "MAX_INTEGER", MAX_INTEGER);
        LazyDefineBuiltinConstant(NumberConstructor, "MAX_VALUE", MAX_VALUE);
        LazyDefineBuiltinConstant(NumberConstructor, "NaN", NAN);
        LazyDefineBuiltinConstant(NumberConstructor, "NEGATIVE_INFINITY", NEGATIVE_INFINITY);

        LazyDefineBuiltinFunction(NumberPrototype, "clz", 0, NumberPrototype_clz);
        LazyDefineBuiltinFunction(NumberPrototype, "toExponential", 0, NumberPrototype_toExponential);
        LazyDefineBuiltinFunction(NumberPrototype, "toFixed", 0, NumberPrototype_toFixed);
        LazyDefineBuiltinFunction(NumberPrototype, "toPrecision", 0, NumberPrototype_toPrecision);
        LazyDefineBuiltinFunction(NumberPrototype, "toString", 0, NumberPrototype_toString);
        LazyDefineBuiltinFunction(NumberPrototype, "valueOf", 0, NumberPrototype_valueOf);

        LazyDefineBuiltinConstant(NumberPrototype, $$toStringTag, "Number");

        // ===========================================================================================================
        // Proxy
        // ===========================================================================================================

        function ProxyCreate(target, handler) {
            var proxy = ProxyExoticObject();
            setInternalSlot(proxy, "Prototype", ProxyPrototype);
            setInternalSlot(proxy, "ProxyTarget", target);
            setInternalSlot(proxy, "ProxyHandler", handler);
            if (!IsConstructor(target)) setInternalSlot(proxy, "Construct", undefined);
            return proxy;
        }

        MakeConstructor(ProxyConstructor, true, ProxyPrototype);

        var ProxyConstructor_revocable = function revocable(thisArg, argList) {
            var target = argList[0];
            var handler = argList[1];

            var revoker = CreateBuiltinFunction(realm, function revoke(thisArg, argList) {
                var p = getInternalSlot(revoker, "RevokableProxy");
                if (p === null) return NormalCompletion(undefined);
                setInternalSlot(revoker, "RevokableProxy", null);
                Assert(p instanceof ProxyExoticObject, "revoke: object is not a proxy");
                setInternalSlot(p, "ProxyTarget", null);
                setInternalSlot(p, "ProxyHandler", null);
                return NormalCompletion(undefined);
            });

            var proxy = ProxyCreate(target, handler);
            setInternalSlot(revoker, "RevokableProxy", proxy);
            var result = ObjectCreate();
            CreateDataProperty(result, "proxy", proxy);
            CreateDataProperty(result, "revoke", revoker);
            return NormalCompletion(result);
        };

        var ProxyConstructor_Call = function (thisArg, argList) {
            return withError("Type", "The Proxy Constructor is supposed to throw when called without new.");
        };

        var ProxyConstructor_Construct = function (argList) {
            var target = argList[0];
            var handler = argList[1];
            return ProxyCreate(target, handler);
        };

        LazyDefineBuiltinFunction(ProxyConstructor, "revocable", 2, ProxyConstructor_revocable);
        setInternalSlot(ProxyConstructor, "Call", ProxyConstructor_Call);
        setInternalSlot(ProxyConstructor, "Construct", ProxyConstructor_Construct);



        // ===========================================================================================================
        // Reflect
        // ===========================================================================================================

        function reflect_parse_transformASTtoOrdinaries(node, options) {
            var success;
            var newNode;
            var loc = options && options.loc;
            if (Array.isArray(node)) newNode = ArrayCreate(0);
            else newNode = ObjectCreate();
            var current;
            var value;
            for (var k in node) {
                if (!loc && k === "loc") continue;

                if (Object.hasOwnProperty.call(node, k)) {
                    current = node[k];
                    if (current && typeof current === "object") {
                        value = reflect_parse_transformASTtoOrdinaries(current);
                    } else {
                        value = current;
                    }
                    success = DefineOwnProperty(newNode, k, {
                        value: value,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    if (isAbrupt(success)) return success;
                }
            }
            return newNode;
        };


        var ReflectObject_parse = function (thisArg, argList) {
            var parse = require("parser");
            var parseGoal = parse.parseGoal;
            var source = argList[0];
            var options = argList[1];
            var jsAst, newAst, message;
            if (Type(source) !== "string") return withError("Type", "String to parse expected");
            try {
                jsAst = parse(source);
            } catch (ex) {
                message = ex.message;
                return withError("Syntax", message);
            }
            newAst = reflect_parse_transformASTtoOrdinaries(jsAst, options);
            if (isAbrupt(newAst = ifAbrupt(newAst))) return newAst;
            return NormalCompletion(newAst);
        };

        var ReflectObject_parseGoal = function (thisArg, argList) {
            var parse = require("parser");
            var parseGoal = parse.parseGoal;
            var source = argList[1];
            var goal = argList[0];
            var jsAst, newAst, message;

            if (Type(goal) !== "string") return withError("Type", "Goal to parse expected");
            if (Type(source) !== "string") return withError("Type", "String to parse expected");
            try {
                jsAst = parseGoal(goal, source);
            } catch (ex) {
                message = ex.message;
                return withError("Syntax", message);
            }
            newAst = reflect_parse_transformASTtoOrdinaries(jsAst);
            if (isAbrupt(newAst = ifAbrupt(newAst))) return newAst;
            return NormalCompletion(newAst);
        };


        var ReflectObject_getPrototypeOf = function (thisArg, argList) {
            var target = argList[0];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            return GetPrototypeOf(obj);
        };

        var ReflectObject_setPrototypeOf = function (thisArg, argList) {
            var target = argList[0];
            var proto = argList[1];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            if (Type(proto) !== "object" && proto !== null) return withError("Type", "Reflect.setPrototypeOf: proto is neither an object nor null!");
            return SetPrototypeOf(obj, proto);
        };


        var ReflectObject_isExtensible = function (thisArg, argList) {
            var target = argList[0];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            return IsExtensible(obj);
        };

        var ReflectObject_preventExtensions = function (thisArg, argList) {
            var target = argList[0];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            return PreventExtensions(obj);
        };
        var ReflectObject_has = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            return HasProperty(obj, key);
        };
        var ReflectObject_hasOwn = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            return HasOwnProperty(obj, key);
        };

        var ReflectObject_getOwnPropertyDescriptor = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            var desc = GetOwnProperty(obj, key);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            return FromPropertyDescriptor(desc);
        };

        var ReflectObject_get = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var receiver = argList[2];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            if (receiver === undefined) receiver = target;
            return obj.Get(key, receiver);
        };

        var ReflectObject_set =function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var V = argList[2];
            var receiver = argList[3];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            if (receiver === undefined) receiver = target;
            return obj.Set(key, V, receiver);
        };
        var ReflectObject_invoke = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var argumentList = argList[2];
            var receiver = argList[3];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            if (receiver === undefined) receiver = target;
            var A = CreateListFromArrayLike(argumentList);
            return obj.Invoke(key, A, receiver);
        };
        var ReflectObject_deleteProperty = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            return obj.Delete(key);
        };
        var ReflectObject_defineProperty = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var attributes = argList[2];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(propertyKey);
            if (isAbrupt(key = ifAbrupt(key))) return key;
            var desc = ToPropertyDescriptor(attributes);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            return callInternalSlot("DefineOwnProperty", obj,key, desc);
        };
        var ReflectObject_enumerate = function (thisArg, argList) {
            var target = argList[0];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            return obj.Enumerate();
        };
        var ReflectObject_ownKeys = function (thisArg, argList) {
            var target = argList[0];
            var obj = ToObject(target);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            return obj.OwnPropertyKeys();
        };


        LazyDefineBuiltinFunction(ReflectObject, "defineProperty", 2, ReflectObject_defineProperty);
        LazyDefineBuiltinFunction(ReflectObject, "deleteProperty", 3, ReflectObject_deleteProperty);
        LazyDefineBuiltinFunction(ReflectObject, "enumerate", 1, ReflectObject_enumerate);
        LazyDefineBuiltinFunction(ReflectObject, "invoke", 3, ReflectObject_invoke);
        LazyDefineBuiltinFunction(ReflectObject, "isExtensible", 1, ReflectObject_isExtensible);
        LazyDefineBuiltinFunction(ReflectObject, "get", 2, ReflectObject_get);
        LazyDefineBuiltinFunction(ReflectObject, "getOwnPropertyDescriptor", 2, ReflectObject_getOwnPropertyDescriptor);
        LazyDefineBuiltinFunction(ReflectObject, "getPrototypeOf", 1, ReflectObject_getPrototypeOf);
        LazyDefineBuiltinFunction(ReflectObject, "has", 2, ReflectObject_has);
        LazyDefineBuiltinFunction(ReflectObject, "hasOwn", 2, ReflectObject_hasOwn);
        LazyDefineBuiltinFunction(ReflectObject, "ownKeys", 1, ReflectObject_ownKeys);
        LazyDefineBuiltinFunction(ReflectObject, "parse", 1, ReflectObject_parse);
        LazyDefineBuiltinFunction(ReflectObject, "parseGoal", 1, ReflectObject_parseGoal);
        LazyDefineBuiltinFunction(ReflectObject, "preventExtensions", 1, ReflectObject_preventExtensions);
        LazyDefineBuiltinFunction(ReflectObject, "set", 3, ReflectObject_set);
        LazyDefineBuiltinFunction(ReflectObject, "setPrototypeOf", 2, ReflectObject_setPrototypeOf);

        LazyDefineBuiltinConstant(ReflectObject, $$toStringTag, "Reflect");

        // ===========================================================================================================
        // IsNaN
        // ===========================================================================================================

        IsNaNFunction = CreateBuiltinFunction(realm, function isNaN(thisArg, argList) {
            var nan = ToNumber(argList[0]);
            return nan !== nan;
        }, 1, "isNaN");

        // ===========================================================================================================
        // IsFinite
        // ===========================================================================================================

        IsFiniteFunction = CreateBuiltinFunction(realm, function isFinite(thisArg, argList) {
            var number = ToNumber(argList[0]);
            if (number == Infinity || number == -Infinity || number != number) return false;
            return true
        }, 1, "isFinite");

        // ===========================================================================================================
        // Object
        // ===========================================================================================================
        var ObjectConstructor_assign = function (thisArg, argList) {
            var target = argList[0];
            var source = argList[1];
            var to = ToObject(target);
            if (isAbrupt(to = ifAbrupt(to))) return to;
            var from = ToObject(source);
            if (isAbrupt(source = ifAbrupt(source))) return source;
            var keys = OwnPropertyKeys(source);
            if (isAbrupt(keys = ifAbrupt(keys))) return keys;
            var gotAllNames = false;
            var pendingException = undefined;
            var next, nextKey, desc, propValue, status;
            while (!gotAllNames) {
                next = IteratorStep(keys);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                if (!next) gotAllNames = true;
                else {
                    nextKey = IteratorValue(next);
                    if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
                    desc = GetOwnProperty(from, nextKey);
                    if (isAbrupt(desc)) pendingException = desc;
                    else if (desc !== undefined && desc.enumerable === true) {
                        propValue = Get(from, nextKey);
                        if (isAbrupt(propValue)) pendingException = propValue;
                        else {
                            status = Put(to, nextKey, propValue, true);
                            if (isAbrupt(status)) pendingException = status;
                        }
                    }
                }
            }
            if (pendingException !== undefined) return pendingException;
            return to;
        };
        var ObjectConstructor_create = function (thisArg, argList) {
            var O = argList[0]
            var Properties = argList[1];
            if (Type(O) !== "object" && Type(O) !== "null") return withError("Type", "create: argument is not an object or null");
            var obj = ObjectCreate(O);
            if (Properties !== undefined) {
                return ObjectDefineProperties(obj, Properties);
            }
            return obj;
        };
        var ObjectConstructor_defineProperty = function (thisArg, argList) {
            var O = argList[0];
            var P = argList[1];
            var Attributes = argList[2];
            if (Type(O) !== "object") return withError("Type", "defineProperty: argument 1 is not an object");
            var key = ToPropertyKey(P);
            var desc = ToPropertyDescriptor(Attributes);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            var success = DefineOwnPropertyOrThrow(O, key, desc);
            if (isAbrupt(success = ifAbrupt(success))) return success;
            return O;
        };
        var ObjectConstructor_defineProperties = function (thisArg, argList) {
            var O = argList[0];
            var Properties = argList[1];
            return ObjectDefineProperties(O, Properties);
        };

        //SetFunctionName(ObjectConstructor, "Object");
        //SetFunctionLength(ObjectConstructor, 1);
        LazyDefineBuiltinFunction(ObjectConstructor, "assign", 2, ObjectConstructor_assign);
        LazyDefineBuiltinFunction(ObjectConstructor, "create", 0, ObjectConstructor_create);
        LazyDefineBuiltinFunction(ObjectConstructor, "defineProperty", 0, ObjectConstructor_defineProperty);
        LazyDefineBuiltinFunction(ObjectConstructor, "defineProperties", 0, ObjectConstructor_defineProperties);



        setInternalSlot(ObjectConstructor, "Call", function Call(thisArg, argList) {
            var value = argList[0];
            if (value === null || value === undefined) return ObjectCreate();
            return ToObject(value);
        });

        setInternalSlot(ObjectConstructor, "Construct", function (argList) {
            var value = argList[0];
            var type = Type(value);
            switch (type) {
                case "object":
                    return value;
                    break;
                case "string":
                case "number":
                case "symbol":
                case "boolean":
                    return ToObject(value);
                    break;
            }
            return ObjectCreate();
        });


        LazyDefineProperty(ObjectConstructor, "seal", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var O;
                O = argList[0];
                if (Type(O) !== "object") return withError("Type", "First argument is object");
                var status = SetIntegrityLevel(O, "sealed");
                if (isAbrupt(status = ifAbrupt(status))) return status;
                if (status === false) return withError("Type", "seal: can not seal object");
                return O;
            }
        ));


        var ObjectConstructor_freeze =function (thisArg, argList) {
            var O;
            O = argList[0];
            if (Type(O) !== "object") return withError("Type", "First argument is object");
            var status = SetIntegrityLevel(O, "frozen");
            if (isAbrupt(status = ifAbrupt(status))) return status;
            if (status === false) return withError("Type", "freeze: can not freeze object");
            return O;
        };

        var ObjectConstructor_getOwnPropertyDescriptor = function (thisArg, argList) {
            var O = argList[0];
            var P = argList[1];
            var obj = ToObject(O);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var key = ToPropertyKey(P);
            var desc = GetOwnProperty(obj, key);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            return FromPropertyDescriptor(desc);
        };
        var ObjectConstructor_getOwnPropertyNames = function (thisArg, argList) {
            var O = argList[0];
            return GetOwnPropertyKeys(O, "string");
        };

        LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptor", 2, ObjectConstructor_getOwnPropertyDescriptor);
        LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyNames", 1, ObjectConstructor_getOwnPropertyNames);
        LazyDefineBuiltinFunction(ObjectConstructor, "freeze", 1, ObjectConstructor_freeze);

        LazyDefineProperty(ObjectConstructor, "getOwnPropertySymbols", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var O = argList[0];
                return GetOwnPropertyKeys(O, "symbol");
            }));

        LazyDefineProperty(ObjectConstructor, "getPrototypeOf", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var O = argList[0];
                var obj = ToObject(O);
                if (isAbrupt(obj = ifAbrupt(obj))) return obj;
                return GetPrototypeOf(obj);
            }));

        LazyDefineProperty(ObjectConstructor, "is", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var value1 = argList[0];
                var value2 = argList[1];
                return SameValue(value1, value2);
            }));

        LazyDefineProperty(ObjectConstructor, "isExtensible", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return false;
                return IsExtensible(O);
            }
        ));

        LazyDefineProperty(ObjectConstructor, "isSealed", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return true;
                return TestIntegrityLevel(O, "sealed");
            }
        ));

        LazyDefineProperty(ObjectConstructor, "isFrozen", CreateBuiltinFunction(realm,
            function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return true;
                return TestIntegrityLevel(O, "frozen");
            }
        ));


        var ObjectConstructor_preventExtensions = function (thisArg, argList) {
            var O = argList[0];
            if (Type(O) !== "object") return withError("Type", "argument is not an object");
            var status = PreventExtensions(O);
            if (isAbrupt(status = ifAbrupt(status))) return status;
            if (status === false) return withError("Type", "can not prevent extensions");
            return O;
        };


        var ObjectConstructor_keys = function (thisArg, argList) {
            var O = argList[0];
            var obj = ToObject(O);
            if (isAbrupt(obj = ifAbrupt(obj))) return obj;
            var keys = OwnPropertyKeys(O);
            if (isAbrupt(keys = ifAbrupt(keys))) return keys;

            var nameList = [];
            var gotAllNames = false;
            var next, nextKey, desc;
            while (!gotAllNames) {
                next = IteratorNext(keys);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                nextKey = IteratorValue(next);
                if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
                if (Type(nextKey) === "string") {
                    desc = GetOwnProperty(O, nextKey);
                    if (isAbrupt(desc = ifAbrupt(desc))) return desc;
                    if (desc !== undefined && desc.enumerable === true) {
                        nameList.push(nextKey);
                    }
                }

                if (IteratorComplete(next)) gotAllNames = true;
            }
            return CreateArrayFromList(nameList);
        };

        var ObjectConstructor_mixin = function (thisArg, argList) {
            var target = argList[0];
            var source = argList[1];
            var to = ToObject(target);
            if (isAbrupt(to = ifAbrupt(to))) return to;
            var from = ToObject(source);
            if (isAbrupt(from = ifAbrupt(from))) return from;
            return MixinProperties(to, from);
        };

        LazyDefineBuiltinFunction(ObjectConstructor, "preventExtensions", 1, ObjectConstructor_preventExtensions);
        LazyDefineBuiltinFunction(ObjectConstructor, "keys", 1, ObjectConstructor_keys);
        LazyDefineBuiltinFunction(ObjectConstructor, "mixin", 2, ObjectConstructor_mixin);


        function MixinProperties(target, source) {
            Assert(Type(target) === "object");
            Assert(Type(source) === "object");
            var keys = OwnPropertyKeys(source);
            if (isAbrupt(keys = ifAbrupt(keys))) return keys;
            var gotAllNames = false;
            var pendingException = undefined;
            var next, nextKey, desc, propValue, newFunc;
            var pendingException, getter, setter;
            while (!gotAllNames) {
                next = IteratorStep(next);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                //    if ((=ifAbrupt()) && isAbrupt()) return ;
                if (!next) gotAllNames = true;
                else {
                    nextKey = IteratorValue(next);
                    if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
                    var desc = GetOwnProperty(source, nextKey);
                    if (isAbrupt(desc)) pendingException = desc;
                    else if (desc !== undefined && desc.enumerable === true) {
                        // possibly neccessary (if desc isnt fresh)
                        // desc = assign({}, desc);
                        if (IsDataDescriptor(desc)) {
                            propValue = desc.Value;
                            if (SameValue(GetSuperBinding(propValue), source)) {
                                newFunc = MixinProperties(RebindSuper(propValue, target), propValue);
                                if (isAbrupt(newFunc)) pendingException = newFunc;
                                else desc.Value = newFunc;
                            }
                        } else {
                            getter = desc.get;
                            if (SameValue(GetSuperBinding(getter), source)) {
                                newFunc = MixinProperties(RebindSuper(propValue, target), getter);
                                if (isAbrupt(newFunc)) pendingException = newFunc;
                                else desc.get = newFunc;
                            }
                            setter = desc.set;
                            if (SameValue(GetSuperBinding(setter), source)) {
                                newFunc = MixinProperties(RebindSuper(propValue, target), setter);
                                if (isAbrupt(newFunc)) pendingException = newFunc;
                                else desc.set = newFunc;
                            }
                        }
                        var status = DefineOwnPropertyOrThrow(target, nextKey, desc);
                        if (isAbrupt(status)) pendingException = status;
                    }
                }
            }
            if (pendingException) return pendingException;
            return target;
        }


        // ===========================================================================================================
        // ObjectPrototype
        // ===========================================================================================================

        MakeConstructor(ObjectConstructor, true, ObjectPrototype);
        setInternalSlot(ObjectPrototype, "Prototype", null);

        var ObjectPrototype_$$create = function (thisArg, argList) {
            var F = thisArg;
            var proto = GetPrototypeFromConstructor(F, "%ObjectPrototype%");
            if (isAbrupt(proto = ifAbrupt(proto))) return proto;
            return ObjectCreate(proto);
        };

        var ObjectPrototype_hasOwnProperty = function (thisArg, argList) {
            var P = ToPropertyKey(argList[0]);
            if (isAbrupt(P = ifAbrupt(P))) return P;
            var O = ToObject(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            return HasOwnProperty(O, P);
        };

        var ObjectPrototype_isPrototypeOf = function (thisArg, argList) {
            var V = argList[0];
            if (Type(O) !== "object") return false;
            var O = ToObject(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            for (;;) {
                V = GetPrototypeOf(V);
                if (V == null) return false;
                if (SameValue(O, V)) return true;
            }
            return false;
        };


        var ObjectPrototype_propertyIsEnumerable = function (thisArg, argList) {
            var V = argList[0];
            var P = ToString(V);
            if (isAbrupt(P = ifAbrupt(P))) return P;
            var O = ToObject(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var desc = GetOwnProperty(O, P);
            if (desc === undefined) return false;
            return desc.enumerable;
        };

        var OneOfTheseTags = {
            __proto__: null,
            "Arguments": true,
            "Array": true,
            "Boolean": true,
            "Date": true,
            "Error": true,
            "Function": true,
            "JSON": true,
            "Math": true,
            "Number": true,
            "RegExp": true,
            "String": true
        };

        var builtinTagsByToString = {
            "[object ArrayExoticObject]": "Array",
            "[object ProxyExoticObject]": "Proxy",
            "[object ArgumentsExoticObject]": "Arguments",
            "[object OrdinaryFunction]": "Function",
            "[object StringExoticObject]": "String",
        };


        var ObjectPrototype_toString = function toString(thisArg, argList) {
            var i = 0;
            if (thisArg === undefined) return "[object Undefined]";
            if (thisArg === null) return "[object Null]";

            var O = ToObject(thisArg);
            var builtinTag, tag;

            var intrToStr = O.toString();

            if (builtinTag = builtinTagsByToString[intrToStr]) {}
            else if (hasInternalSlot(O, "SymbolData")) builtinTag = "Symbol";
            else if (hasInternalSlot(O, "StringData")) builtinTag = "String";
            else if (hasInternalSlot(O, "ErrorData")) builtinTag = "Error";
            else if (hasInternalSlot(O, "BooleanData")) builtinTag = "Boolean";
            else if (hasInternalSlot(O, "NumberData")) builtinTag = "Number";
            else if (hasInternalSlot(O, "DateValue")) builtinTag = "Date";
            else if (hasInternalSlot(O, "RegExpMatcher")) builtinTag = "RegExp";
            else if (hasInternalSlot(O, "MathTag")) builtinTag = "Math";
            else if (hasInternalSlot(O, "JSONTag")) builtinTag = "JSON";
            else builtinTag = "Object";

            var hasTag = HasProperty(O, $$toStringTag);
            if (isAbrupt(hasTag = ifAbrupt(hasTag))) return hasTag;
            if (!hasTag) tag = builtinTag;
            else {
                tag = Get(O, $$toStringTag);
                if (isAbrupt(tag)) tag = NormalCompletion("???");
                tag = unwrap(tag);
                if (Type(tag) !== "string") tag = "???";
                if (OneOfTheseTags[tag] && (!SameValue(tag, builtinTag))) tag = "~" + tag;
            }
            return "[object " + tag + "]";
        };

        var ObjectPrototype_valueOf = function valueOf(thisArg, argList) {
            var O = ToObject(thisArg);
            return O;
        };

        // B.2.2.1  Object.prototype.__proto__

        var ObjectPrototype_get_proto = function (thisArg, argList) {
            var O = ToObject(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            return callInternalSlot("GetPrototypeOf", O);
        };
        var ObjectPrototype_set_proto = function (thisArg, argList) {
            var proto = argList[0];
            var O = CheckObjectCoercible(thisArg);
            if (isAbrupt(O = ifAbrupt(O))) return O;
            var protoType = Type(proto);
            if (protoType !== "object" && protoType !== null) return proto;
            if (Type(O) !== "object") return proto;
            var status = callInternalSlot("SetPrototypeOf", O, proto);
            if (isAbrupt(status = ifAbrupt(status))) return status;
            if (status === false) return withError("Type", "__proto__: SetPrototypeOf failed.");
            return proto;
        };
        var ObjectPrototype_proto_ = {
            __proto__:null,
            configurable: true,
            enumerable: false,
            get: CreateBuiltinFunction(realm, ObjectPrototype_get_proto, "get __proto__", 0),
            set: CreateBuiltinFunction(realm, ObjectPrototype_set_proto, "set __proto___", 0)
        };
        DefineOwnProperty(ObjectPrototype, "__proto__", ObjectPrototype_proto_)


        LazyDefineBuiltinFunction(ObjectPrototype, $$create, 0, ObjectPrototype_$$create);
        LazyDefineBuiltinFunction(ObjectPrototype, "hasOwnProperty", 0, ObjectPrototype_hasOwnProperty);
        LazyDefineBuiltinFunction(ObjectPrototype, "isPrototypeOf", 0, ObjectPrototype_isPrototypeOf);
        LazyDefineBuiltinFunction(ObjectPrototype, "propertyIsEnumerable", 0, ObjectPrototype_propertyIsEnumerable);
        LazyDefineBuiltinFunction(ObjectPrototype, "toString", 0, ObjectPrototype_toString);
        LazyDefineBuiltinFunction(ObjectPrototype, "valueOf", 0, ObjectPrototype_valueOf);
        LazyDefineProperty(ObjectPrototype, $$toStringTag, "Object");

        // ===========================================================================================================
        // Object.observe
        // ===========================================================================================================

        // Object.observe 
        // http://wiki.ecmascript.org/doku.php?id=harmony:observe
        // var NotifierPrototype is defined with all other intrinsics above

        DefineOwnProperty(NotifierPrototype, "notify", {
            value: CreateBuiltinFunction(realm, function notify(thisArg, argList) {
                var changeRecord = argList[0];
                var notifier = thisArg;
                if (Type(notifier) !== "object") return withError("Type", "Notifier is not an object.");
                var target = getInternalSlot(notifier, "Target");
                var newRecord = ObjectCreate();
                var status = callInternalSlot("DefineOwnProperty", newRecord, "object", {
                    value: target,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                //if (isAbrupt(status)) return status;

                var bindings = getInternalSlot(changeRecord, "Bindings");
                var value;
                for (var N in bindings) {
                    if (Object.hasOwnProperty.call(bindings, N)) {
                        if (N !== "object") {
                            value = callInternalSlot("Get", changeRecord, N, changeRecord);
                            if (isAbrupt(value = ifAbrupt(value))) return value;
                            status = callInternalSlot("DefineOwnProperty", newRecord, N, {
                                value: value,
                                writable: false,
                                enumerable: true,
                                configurable: false
                            });
                            //if (isAbrupt(status)) return status;
                        }

                    }
                }
                setInternalSlot(newRecord, "Extensible", false);
                status = EnqueueChangeRecord(target, newRecord);
                //if (isAbrupt(status)) return status;
                return NormalCompletion();
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(NotifierPrototype, "performChange", {
            value: CreateBuiltinFunction(realm, function notify(thisArg, argList) {
                var changeType = argList[0];
                var changeFn = argList[1];
                var notifier = thisArg;
                var status;
                if (Type(notifier) !== "object") return withError("Type", "notifier is not an object");
                var target = getInternalSlot(notifier, "Target");
                if (target === undefined) return NormalCompletion(undefined);
                if (Type(changeType) !== "string") return withError("Type", "changeType has to be a string");
                if (!IsCallable(changeFn)) return withError("Type", "changeFn is not a callable");
                status = BeginChange(target, changeType);
                var changeRecord = callInternalSlot("Call", changeFn, undefined, []);
                status = EndChange(target, changeType);
                var changeObservers = getInternalSlot(notifier, "ChangeObservers");
                if (!changeObservers.length) return NormalCompletion();
                var newRecord = ObjectCreate();
                status = callInternalSlot("DefineOwnProperty", newRecord, "object", {
                    value: target,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                status = callInternalSlot("DefineOwnProperty", newRecord, "type", {
                    value: changeType,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                var bindings = getInternalSlot(changeRecord, "Bindings");
                var value;
                for (var N in bindings) {
                    if (Object.hasOwnProperty.call(bindings, N)) {
                        if (N !== "object" && N !== "type") {
                            value = callInternalSlot("Get", changeRecord, N, changeRecord);
                            if (isAbrupt(value = ifAbrupt(value))) return value;
                            status = callInternalSlot("DefineOwnProperty", newRecord, N, {
                                value: value,
                                writable: false,
                                enumerable: true,
                                configurable: false
                            });
                            //if (isAbrupt(status)) return status;
                        }
                    }
                }
                setInternalSlot(newRecord, "Extensible", false);
                status = EnqueueChangeRecord(target, newRecord);
                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        function GetNotifier(O) {
            var proto;
            var notifier = getInternalSlot(O, "Notifier");
            if (notifier === undefined) {
                proto = Get(getIntrinsics(), "NotifierPrototype%")
                notifier = ObjectCreate(proto);
                setInternalSlot(notifier, "Target", O);
                setInternalSlot(notifier, "ChangeObservers", []);
                setInternalSlot(notifier, "ActiveChanges", ObjectCreate(null));
                setInternalSlot(O, "Notifier", notifier);
            }
            return notifier;
        }

        function BeginChange(O, changeType) {
            var notifier = GetNotifier(O);
            var activeChanges = getInternalSlot(notifier, "ActiveChanges");
            var changeCount = Get(activeChanges, changeType);
            if (changeCount === undefined) changeCount = 1;
            else changeCount = changeCount + 1;
            CreateDataProperty(activeChanges, changeType, changeCount);
        }

        function EndChange(O, changeType) {
            var notifier = GetNotifier(O);
            var activeChanges = getInternalSlot(notifier, "ActiveChanges");
            var changeCount = Get(activeChanges, changeType);
            Assert(changeCount > 0, "changeCount has to be bigger than 0");
            changeCount = changeCount - 1;
            CreateDataProperty(activeChanges, changeType, changeCount);
        }

        function ShouldDeliverToObserver(activeChanges, acceptList, changeType) {
            var doesAccept = false;
            for (var i = 0, j = acceptList.length; i < j; i++) {
                var accept = acceptList[i];
                if (activeChanges[accept] > 0) return false;
                if (accept === changeType) doesAccept = true;
            }
            return doesAccept;
        }

        function EnqueueChangeRecord(O, changeRecord) {
            var notifier = GetNotifier(O);
            var changeType = Get(changeRecord, "type");
            var activeChanges = getInternalSlot(notifier, "ActiveChanges");
            var changeObservers = getInternalSlot(notifier, "ChangeObservers");
            var observerRecord;
            for (var i = 0, j = changeObservers.length; i < j; i++) {
                if (observerRecord = changeObservers[i]) {
                    var acceptList = Get(oserverRecord, "accept");
                    var deliver = ShouldDeliverToObserver(activeChanges, acceptList, changeType);
                    if (deliver === false) continue;
                    var observer = Get(observerRecord, "callback");
                    var pendingRecords = getInternalSlot(observer, "PendingChangeRecords");
                    pendingRecords.push(changeRecord);
                }
            }
        }

        function DeliverChangeRecords(C) {
            var changeRecords = getInternalSlot(C, "PendingChangeRecords");
            setInternalSlot(C, "PendingChangeRecords", []);
            var array = ArrayCreate(0);
            var n = 0;
            var status;
            var record;
            for (var i = 0, j = changeRecords.length; i < j; i++) {
                if (record = changeRecords[i]) {
                    status = callInternalSlot("DefineOwnProperty", array, ToString(n), {
                        value: record,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    n = n + 1;
                }
            }
            if (Get(array, "length") === 0) return false;
            callInternalSlot("Call", C, undefined, [array]);
            return true;
        }

        function DeliverAllChangeRecords() {
            var observers = ObserverCallbacks;
            var anyWorkDone = false;
            var observer;
            for (var i = 0, j = observers.length; i < j; i++) {
                if (observer = observers[i]) {
                    var result = DeliverChangeRecords(observer);
                    if (result === true) anyWorkDone = true;
                }
            }
            return anyWorkDone;
        }

        function CreateChangeRecord(type, object, name, oldDesc, newDesc) {
            var changeRecord = ObjectCreate();
            var status;
            status = callInternalSlot("DefineOwnProperty", changeRecord, "type", {
                value: type,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "object", {
                value: object,
                writable: false,
                enumerable: true,
                configurable: false
            });
            if (Type(name) === "string") {
                status = callInternalSlot("DefineOwnProperty", changeRecord, "name", {
                    value: name,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
            }
            if (IsDataDescriptor(oldDesc)) {
                if (!IsDataDescriptor(newDesc) || !SameValue(oldDesc.value, newDesc.value)) {
                    status = callInternalSlot("DefineOwnProperty", changeRecord, "oldValue", {
                        value: oldDesc,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });
                }
            }
            setInternalSlot(changeRecord, "Extensible", false);
            return changeRecord;
        }

        function CreateSpliceChanceRecord(object, index, removed, addedCount) {
            var changeRecord = ObjectCreate();
            var status = callInternalSlot("DefineOwnProperty", changeRecord, "type", {
                value: "splice",
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "object", {
                value: object,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "index", {
                value: index,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "removed", {
                value: removed,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "addedCount", {
                value: addedCount,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }

        DefineOwnProperty(ObjectConstructor, "observe", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var O = argList[0];
                var callback = argList[1];
                var accept = argList[2];
                if (Type(O) !== "object") return withError("Type", "first argument is not an object");
                if (!IsCallable(callback)) return withError("Type", "second argument is not callable");
                if (TestIntegrityLevel(callback, "frozen")) return withError("Type", "second argument is frozen");
                if (accept === undefined) {
                    accept = ["add", "updata", "delete", "reconfigure", "setPrototype", "preventExtensions"];
                } else {
                    accept = CreateListFromArray(accept);
                }
                var notifier = GetNotifier(O);
                var changeObservers = getInternalSlot(notifier, "ChangeObservers");
                var observer;
                for (var i = 0, j = changeObservers.length; i < j; i++) {
                    if (observer = changeObservers[i]) {
                        if (Get(observer, "callback") === callback) {
                            CreateDataProperty(record, "accept", acceptList);
                            return NormalCompletion(O);
                        }
                    }
                }
                var observerRecord = ObjectCreate();
                CreateDataProperty(observerRecord, "callback", callback);
                CreateDataProperty(observerRecord, "accept", acceptList);
                changeObservers.push(observerRecord);
                var observerCallbacks = ObserverCallbacks;
                if (observerCallbacks.indexOf(callback)) return NormalCompletion(O);
                observerCallbacks.push(calllback);
                return NormalCompletion(O);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        DefineOwnProperty(ObjectConstructor, "unobserve", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var O = argList[0];
                var callback = argList[1];
                if (Type(O) !== "object") return withError("Type", "first argument is not an object");
                if (!IsCallable(callback)) return withError("Type", "second argument is not callable");
                var notifier = GetNotifier(O);
                var changeObservers = getInternalSlot(notifier, "ChangeObservers");
                changeObservers = changeObservers.filter(function (record) {
                    return (Get(record, "callback") !== callback);
                });
                return NormalCompletion(O);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        DefineOwnProperty(ObjectConstructor, "deliverChangeRecords", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var callback = argList[0];
                if (!IsCallable(callback)) return withError("Type", "first argument is not callable.");
                var status;
                for (;;) {
                    status = DeliverChangeRecords(callback);
                    status = ifAbrupt(status);
                    if (status === false || isAbrupt(status)) break;
                }
                if (isAbrupt(status)) return status;
                return NormalCompletion(undefined);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        DefineOwnProperty(ObjectConstructor, "getNotifier", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return withError("Type", "first argument is not an object");
                if (TestIntegrityLevel(O, "frozen")) return NormalCompletion(null);
                return GetNotifier(O);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        // ==========================rc=================================================================================
        // Function
        // ===========================================================================================================

        //  
        // Function
        //

        MakeConstructor(FunctionConstructor, true, FunctionPrototype);
        setInternalSlot(FunctionPrototype, "Prototype", ObjectPrototype);
        LazyDefineProperty(FunctionPrototype, $$toStringTag, "Function");

        LazyDefineBuiltinFunction(FunctionPrototype, "valueOf", 0, function valueOf(thisArg, argList) {
            return thisArg;
        });

        setInternalSlot(FunctionConstructor, "Call", function (thisArg, argList) {

            var argCount = argList.length;
            var P = "";
            var bodyText;
            var firstArg, nextArg;

            if (argCount === 0) bodyText = "";
            else if (argCount === 1) bodyText = argList[0];
            else if (argCount > 1) {
                firstArg = argList[0];
                P = ToString(firstArg);
                if (isAbrupt(firstArg = ifAbrupt(firstArg))) return firstArg;
                var k = 1;
                while (k < argCount - 1) {
                    nextArg = argList[k];
                    nextArg = ToString(nextArg);
                    if (isAbrupt(nextArg = ifAbrupt(nextArg))) return nextArg;
                    P = P + "," + nextArg;
                    k += 1;
                }
                bodyText = argList[argCount - 1];
            }

            bodyText = ToString(bodyText);
            if (isAbrupt(bodyText = ifAbrupt(bodyText))) return bodyText;
            var parameters = parseGoal("FormalParameterList", P); // () sind fehlerhaft bei
            var funcBody = parseGoal("FunctionBody", bodyText);

            //if (Contains(funcBody, "YieldExpression")) return withError("Syntax", "regular function may not contain a yield expression");

            var boundNames = BoundNames(parameters);

            if (!IsSimpleParameterList(parameters)) {
                if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
            }
            if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");

            var scope = getRealm().globalEnv;
            var F = thisArg;
            if (F === undefined || !hasInternalSlot(F, "Code")) {
                var C = FunctionConstructor;
                var proto = GetPrototypeFromConstructor(C, "%FunctionPrototype%");
                if (isAbrupt(proto = ifAbrupt(proto))) return proto;
                F = FunctionAllocate(C);
            }

            if (getInternalSlot(F, "FunctionKind") !== "normal") return withError("Type", "function object not a 'normal' function");
            FunctionInitialise(F, "normal", parameters, funcBody, scope, true);
            var proto = ObjectCreate();
            var status = MakeConstructor(F);
            if (isAbrupt(status)) return status;
            SetFunctionName(F, "anonymous");
            return NormalCompletion(F);

        });

        setInternalSlot(FunctionConstructor, "Construct", function (argList) {
            var F = this;
            return OrdinaryConstruct(F, argList);
        });

        DefineOwnProperty(FunctionConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var F = thisArg;
                var proto = GetPrototypeFromConstructor(F, "%FunctionPrototype%");
                if (isAbrupt(proto = ifAbrupt(proto))) return proto;
                var obj = FunctionAllocate(proto);
                return obj;
            }),
            enumerable: false,
            writable: false,
            configurable: true
        });

        LazyDefineProperty(FunctionPrototype, $$create, CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
            var F = thisArg;
            return OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
        }));

        DefineOwnProperty(FunctionPrototype, "constructor", {
            value: FunctionConstructor,
            enumerable: false,
            configurable: true,
            writable: true
        });

        // ===
        // Function.prototype.toString uses codegen module ===>>> var codegen = require("js-codegen");
        // ====

        CreateDataProperty(FunctionPrototype, "toString", CreateBuiltinFunction(realm, function (thisArg, argList) {
            var codegen = require("js-codegen");
            var F = thisArg;
            if (!IsCallable(F)) return withError("Type", "Function.prototype.toString only applies to functions!");
            var name = Get(F, "name") || "(anonymous)";
            var P, C;
            P = getInternalSlot(F, "FormalParameters");
            C = getInternalSlot(F, "Code");
            var kind = getInternalSlot(F, "FunctionKind");
            var star = kind === "generator" ? "*" : "";
            var callfn;
            if (!C && (callfn=getInternalSlot(F, "Call"))) {
                var code = "// [[Builtin Function native JavaScript Code]]\r\n";
                // createbuiltin wraps the builtin
                if (callfn.steps) callfn = callfn.steps;
                // setinternalslot call has no wrapper
                // this requires a double check here
                code += callfn.toString();
                return code;
            }
            var paramString, bodyString;
            var p, c, t;
            paramString = codegen.builder.formalParameters(P);
            if (kind === "arrow") {
                if (Array.isArray(C)) {
                    bodyString = codegen.builder.functionBody(C);
                } else bodyString = codegen.callBuilder(C);
                return paramString + " => " + bodyString;
            } else {
                bodyString = codegen.builder.functionBody(C);
                return "function" + star + " " + name + " " + paramString + " " + bodyString;
            }
        }));


        DefineOwnProperty(FunctionPrototype, "apply", {
            value: CreateBuiltinFunction(realm, function apply(thisArg, argList) {
                var func = thisArg;
                if (!IsCallable(func)) return withError("Type", "fproto.apply: func is not callable");
                var T;
                if (T !== undefined && T !== null) T = ToObject(argList[0]);
                else T = argList[0];
                var argArray = argList[1] || ArrayCreate(0);
                var argList2 = CreateListFromArrayLike(argArray);
                if (isAbrupt(argList2 = ifAbrupt(argList2))) return argList2;
                return callInternalSlot("Call", func, T, argList2);
            }),
            enumerable: false,
            configurable: true,
            writable: true
        });
        DefineOwnProperty(FunctionPrototype, "bind", {
            value: CreateBuiltinFunction(realm, function bind(thisArg, argList) {
                var boundTarget = thisArg;
                var thisArgument = argList[0];
                var listOfArguments = argList.slice(1, argList.length - 1);
                return BoundFunctionCreate(boundTarget, thisArgument, listOfArguments);
            }),
            writable: true,
            enumerable: false,
            configurable: true

        });
        DefineOwnProperty(FunctionPrototype, "call", {
            value: CreateBuiltinFunction(realm, function call(thisArg, argList) {
                var func = thisArg;
                if (!IsCallable(func)) return withError("Type", "fproto.call: func is not callable");
                var T = ToObject(argList[0]);
                var args = argList.slice(1);
                return callInternalSlot("Call", func, T, args);
            }),
            writable: true,
            enumerable: false,
            configurable: true
        });
        DefineOwnProperty(FunctionPrototype, $$hasInstance, {
            value: CreateBuiltinFunction(realm, function $$hasInstance(thisArg, argList) {
                var V = argList[0];
                var F = thisArg;
                return OrdinaryHasInstance(F, V);
            }, 1, "[Symbol.hasInstance]"),
            writable: true,
            enumerable: false,
            configurable: true

        });

        var FunctionPrototype_toMethod = function (thisArg, argList) {
            var superBinding = argList[0];
            var methodName = argList[1];
            if (!IsCallable(thisArg)) return withError("Type", "this value is not callable");
            if (Type(superBinding) !== "object") return withError("Type", "superBinding is not an object");
            if (methodName !== undefined) {
                methodName = ToPropertyKey(methodName);
                if (isAbrupt(methodName = ifAbrupt(methodName))) return methodName;
            }
            return CloneMethod(thisArg, superBinding, methodName);
        };

        LazyDefineBuiltinFunction(FunctionPrototype, "toMethod", 1, FunctionPrototype_toMethod /*, realm  !!!*/);

        // ===========================================================================================================
        // Generator Prototype and Function
        // ===========================================================================================================

        LazyDefineProperty(GeneratorPrototype, $$iterator, CreateBuiltinFunction(realm, function (thisArg, argList) {
            return thisArg;
        }));

        LazyDefineProperty(GeneratorPrototype, $$toStringTag, "Generator");

        // GeneratorFunction.[[Prototype]] = FunctionPrototype
        setInternalSlot(GeneratorFunction, "Prototype", FunctionConstructor);


        // GeneratorFunction.prototype = %Generator%
        MakeConstructor(GeneratorFunction, true, GeneratorObject);
        DefineOwnProperty(GeneratorFunction, "prototype", {
            value: GeneratorObject,
            enumerable: false
        });

        // GeneratorFunction.prototype.constructor = GeneratorFunction
        LazyDefineProperty(GeneratorObject, "constructor", GeneratorFunction);

        // GeneratorFunction.prototype.prototype = GeneratorPrototype
        setInternalSlot(GeneratorObject, "Prototype", GeneratorPrototype);

        LazyDefineProperty(GeneratorObject, "prototype", GeneratorPrototype);
        //    LazyDefineProperty(GeneratorPrototype, "constructor", GeneratorObject);

        LazyDefineProperty(GeneratorPrototype, "next", CreateBuiltinFunction(realm, function (thisArg, argList) {
            var value = argList[0];
            var G = thisArg;
            return GeneratorResume(G, value);
        }));

        LazyDefineProperty(GeneratorPrototype, "throw", CreateBuiltinFunction(realm, function (thisArg, argList) {
            var g = thisArg;
            var exception = argList[0];
            if (Type(g) !== "object") return withError("Type", "throw: Generator is not an object");
            if (!hasInternalSlot(g, "GeneratorState")) return withError("Type", "throw: generator has no GeneratorState property");
            var state = getInternalSlot(g, "GeneratorState");
            Assert(hasInternalSlot(g, "GeneratorContext"), "generator has to have a GeneratorContext property");
            if (state !== "suspendedStart" && state != "suspendedYield") return withError("Type", "GeneratorState is neither suspendedStart nor -Yield");
            var E = CompletionRecord("throw", exception);
            if (state === "suspendedStart") {
                setInternalSlot(g, "GeneratorState", "completed");
                setInternalSlot(g, "GeneratorContext", undefined);
                return E;
            }
            var genContext = getInternalSlot(g, "GeneratorContext");
            var methodContext = getCurrentExectionContext();
            setInternalSlot(g, "GeneratorState", "executing");
            getStack().push(genContext);
            var result = genContext.generatorCallback(E);
            Assert(genContext !== getContext());
            Assert(methodContext === getContext());
            return result;
        }));

        setInternalSlot(GeneratorFunction, "Call", function Call(thisArg, argList) {
            // GeneratorFunction(p1...pn, body)
            var argCount = argList.length;
            var P = "";
            var bodyText;
            var firstArg, nextArg;
            if (argCount === 0) bodyText = "";
            else if (argCount === 1) bodyText = argList[0];
            else if (argCount > 1) {
                firstArg = argList[0];
                P = ToString(firstArg);
                if (isAbrupt(firstArg = ifAbrupt(firstArg))) return firstArg;
                var k = 1;
                while (k < argCount - 1) {
                    nextArg = argList[k];
                    nextArg = ToString(nextArg);
                    if (isAbrupt(nextArg = ifAbrupt(nextArg))) return nextArg;
                    P = P + "," + nextArg;
                    k += 1;
                }
                bodyText = argList[argCount - 1];
            }

            bodyText = ToString(bodyText);
            if (isAbrupt(bodyText = ifAbrupt(bodyText))) return bodyText;
            var parameters = parseGoal("FormalParameterList", P);

            var funcBody = parseGoal("GeneratorBody", bodyText);
            if (!Contains(funcBody, "YieldExpression")) return withError("Syntax", "GeneratorFunctions require some yield expression");
            var boundNames = BoundNames(parameters);

            if (!IsSimpleParameterList(parameters)) {
                if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
            }
            if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");

            var scope = getRealm().globalEnv;

            var F = thisArg;

            if (F == undefined || !hasInternalSlot(F, "Code")) {
                F = FunctionAllocate(GeneratorFunction, "generator");
            }

            if (getInternalSlot(F, "FunctionKind") !== "generator") return withError("Type", "function object not a generator");
            FunctionInitialise(F, "generator", parameters, funcBody, scope, true);
            var proto = ObjectCreate(GeneratorPrototype);
            MakeConstructor(F, true, proto);
            SetFunctionLength(F, ExpectedArgumentCount(F.FormalParameters));
            return NormalCompletion(F);
        });

        setInternalSlot(GeneratorFunction, "Construct", function (argList) {
            var F = GeneratorFunction;
            return OrdinaryConstruct(F, argList);
        });

        LazyDefineProperty(GeneratorFunction, $$create, CreateBuiltinFunction(realm, function (thisArg, argList) {
            var F = thisArg;
            var proto = GetPrototypeFromConstructor(F, "%Generator%");
            if (isAbrupt(proto = ifAbrupt(proto))) return proto;
            var obj = FunctionAllocate(proto, "generator");
            return obj;
        }));

        LazyDefineProperty(GeneratorPrototype, $$create, CreateBuiltinFunction(realm, function (thisArg, argList) {
            var F = thisArg;
            var obj = OrdinaryCreateFromConstructor(F, "%Generator%", {
                GeneratorState: null,
                GeneratorContext: null
            });
            return obj;
        }));

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
                if (false) {

                } else {
                    product += ch;
                }
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
                                    _state.PropertyList = PropertyList
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

        // ===========================================================================================================
        // Promises
        // ===========================================================================================================


        var PromiseConstructor_Call = function (thisArg, argList) {
            var executor = argList[0];
            var promise = thisArg;
            if (!IsCallable(executor)) return withError("Type", "executor argument is not a callable");
            if (Type(promise) !== "object") return withError("Type", "promise is not an object");
            if (!hasInternalSlot(promise, "PromiseStatus")) return withError("Type", "promise has no PromiseStatus Property");
            if (getInternalSlot(promise, "PromiseStatus") !== undefined) return withError("Type", "promise´s PromiseStatus is not undefined");
            return InitializePromise(promise, executor);
        };

        var PromiseConstructor_Construct = function (argList) {
            return Construct(this, argList);
        };


        var PromiseConstructor_$$create = function (thisArg, argList) {
            return AllocatePromise(thisArg);
        };

        var PromiseConstructor_resolve = function (thisArg, argList) {
            var x = argList[0];
            var C = thisArg;
            var promiseCapability = NewPromiseCapability(C);
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            var resolveResult = callInternalSlot("Call", promiseCapability.Resolve, undefined, [x]);
            if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
            return NormalCompletion(promiseCapability.Promise);
        };
        var PromiseConstructor_reject = function (thisArg, argList) {
            var r = argList[0];
            var C = thisArg;
            var promiseCapability = NewPromiseCapability(C);
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            var rejectResult = callInternalSlot("Call", promiseCapability.Reject, undefined, [r]);
            if (isAbrupt(rejectResult = ifAbrupt(rejectResult))) return rejectResult;
            return NormalCompletion(promiseCapability.Promise)
        };

        var PromiseConstructor_cast = function (thisArg, argList) {
            var x = argList[0];
            var C = thisArg;
            if (IsPromise(x)) {
                var constructor = getInternalSlot(x, "PromiseConstructor");
                if (SameValue(constructor, C)) return NormalCompletion(x);
            }
            var promiseCapability = NewPromiseCapability(C);
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            var resolveResult = callInternalSlot("Call", promiseCapability.Resolve, undefined, [x]);
            if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
            return NormalCompletion(promiseCapability.Promise);
        };

        var PromiseConstructor_race = function (thisArg, argList) {
            var iterable = argList[0];
            var C = thisArg;
            var promiseCapability = NewPromiseCapability(C);
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            var iterator = GetIterator(iterable);
            iterator = IfAbruptRejectPromise(iterator, promiseCapability);
            if (isAbrupt(iterator)) return iterator;
            for (;;) {
                var next = IteratorStep(iterator);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                if ((next = IfAbruptRejectPromise(next, promiseCapability)) &&isAbrupt(next)) return next
                if (next === false) return NormalCompletion(promiseCapability.Promise);
                var nextValue = IteratorValue(next);
                if ((nextValue=IfAbruptRejectPromise(nextValue, promiseCapability)) && isAbrupt(nextValue)) return nextValue;
                var nextPromise = Invoke(C, "cast", [nextValue]);
                if ((nextPromise=IfAbruptRejectPromise(nextPromise, promiseCapability)) && isAbrupt(nextPromise)) return nextPromise;
                var result = Invoke(nextPromise, "then", [promiseCapability.Resolve, promiseCapability.Reject]);
                if ((result = IfAbruptRejectPromise(result, promiseCapability)) && isAbrupt(result)) return result;
            }
            return NormalCompletion(undefined);
        };

        function makePromiseAllResolveElementsFunction () {
            var PromiseAllResolveElements_Call = function (thisArg, argList) {
                var x = argList[0];
                var index = getInternalSlot(F, "Index");
                var values = getInternalSlot(F, "Values");
                var promiseCapability = getInternalSlot(F, "Capabilities");
                var remainingElementsCount = getInternalSlot(F, "RemainingElements");
                var result = CreateDataProperty(values, ToString(index), x);
                if ((result = IfAbruptRejectPromise(result, promiseCapability)) && isAbrupt(result)) return result;
                remainingElementsCount.value -= 1;
                if (remainingElementsCount.value === 0) {
                    return callInternalSlot("Call", promiseCapability.Resolve, undefined, [values]);
                }
                return NormalCompletion(undefined);
            };
            //var F = CreateBuiltinFunction(getRealm(), "Promise.all Resolve Elements", 1, PromiseAllResolveElements_Call);
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", PromiseAllResolveElements_Call);
            return F;
        }

        var PromiseConstructor_all = function (thisArg, argList) {
            var iterable = argList[0];
            var C = thisArg;
            var promiseCapability = NewPromiseCapability(C);
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            var iterator = GetIterator(iterable);
            if ((iterator=IfAbruptRejectPromise(iterator, promiseCapability)) && isAbrupt(iterator)) return iterator;
            var values = ArrayCreate(0);
            var remainingElementsCount = { value: 0 };
            var index = 0;
            for (;;) {
                var next = IteratorStep(iterator);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                if ((next=IfAbruptRejectPromise(next, promiseCapability)) && isAbrupt(next)) return next;
                if (next === false) {
                    if (index == 0) {
                        var resolveResult = callInternalSlot("Call", promiseCapability.Resolve, undefined, [values]);
                        if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
                    }
                    return NormalCompletion(promiseCapability.Promise)
                }
                var nextValue = IteratorValue(next);
                if ((nextValue = IfAbruptRejectPromise(nextValue, promiseCapability)) && isAbrupt(nextValue)) return nextValue;
                var nextPromise = Invoke(C, "cast", [nextValue]);
                if ((nextPromise=IfAbruptRejectPromise(nextPromise, promiseCapability)) && isAbrupt(nextPromise)) return nextPromise;
                var resolveElement = makePromiseAllResolveElementsFunction();
                setInternalSlot(resolveElement, "Index", index);
                setInternalSlot(resolveElement, "Values", values);
                setInternalSlot(resolveElement, "Capabilities", resolveElement, promiseCapability);
                setInternalSlot(resolveElement, "RemainingElements", remainingElementsCount);
                var result = Invoke(nextPromise, "then", [resolveElement, promiseCapability.Reject]);
                if ((result = IfAbruptRejectPromise(result, promiseCapability)) && isAbrupt(result)) return result;
                index = index + 1;
                remainingElementsCount.value += 1;
            }
        };

        var PromisePrototype_then = function (thisArg, argList) {
            var onFulfilled = argList[0];
            var onRejected = argList[1];
            var promise = thisArg;
            if (!IsPromise(promise)) return withError("Type", "then: this is not a promise object");
            var C = Get(promise, "constructor");
            if (isAbrupt(C = ifAbrupt(C))) return C;

            var promiseCapability = NewPromiseCapability(C);
            if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
            if (IsCallable(onRejected)) {
                var rejectionHandler = onRejected;
            } else {
                rejectionHandler = makeThrowerFunction();
            }
            if (IsCallable(onFulfilled)) {
                var fulfillmentHandler = onFulfilled;
            } else {
                fulfillmentHandler = makeIdentityFunction();
            }
            var resolutionHandler = makeResolutionHandlerFunction();
            setInternalSlot(resolutionHandler, "Promise", promise);
            setInternalSlot(resolutionHandler, "FulfillmentHandler", fulfillmentHandler);
            setInternalSlot(resolutionHandler, "RejectionHandler", rejectionHandler);

            var resolveReaction = makePromiseReaction(promiseCapability, resolutionHandler);
            var rejectReaction = makePromiseReaction(promiseCapability, rejectionHandler);
            var promiseStatus = getInternalSlot(promise, "PromiseStatus");
            if (promiseStatus === "unresolved") {
                getInternalSlot(promise, "PromiseResolveReactions").push(resolveReaction);
                getInternalSlot(promise, "PromiseRejectReactions").push(rejectReaction);
            } else if (promiseStatus === "has-resolution") {
                var resolution = getInternalSlot(promise, "PromiseResult");
                EnqueueTask("PromiseTasks", PromiseReactionTask, [resolveReaction, resolution]);
            } else if (promiseStatus === "has-rejection") {
                var reason = getInternalSlot(promise, "PromiseResult");
                EnqueueTask("PromiseTasks", PromiseReactionTask, [rejectReaction, reason]);
            }
            return NormalCompletion(promiseCapability.Promise);
        };

        var PromisePrototype_catch = function (thisArg, argList) {
            var onRejected = argList[0];
            return Invoke(thisArg, "then", [undefined, onRejected]);
        };

        //SetFunctionName(PromiseConstructor, "Promise");
        MakeConstructor(PromiseConstructor, true, PromisePrototype);
        setInternalSlot(PromiseConstructor, "Call", PromiseConstructor_Call);
        setInternalSlot(PromiseConstructor, "Construct", PromiseConstructor_Construct);
        LazyDefineProperty(PromiseConstructor, $$create, CreateBuiltinFunction(realm, PromiseConstructor_$$create, 0, "[Symbol.create]"));

        LazyDefineBuiltinFunction(PromiseConstructor, "resolve", 1, PromiseConstructor_resolve);
        LazyDefineBuiltinFunction(PromiseConstructor, "reject", 1, PromiseConstructor_reject);
        LazyDefineBuiltinFunction(PromiseConstructor, "cast", 1, PromiseConstructor_cast);
        LazyDefineBuiltinFunction(PromiseConstructor, "race", 1, PromiseConstructor_race);

        LazyDefineProperty(PromiseConstructor, "all", CreateBuiltinFunction(realm, PromiseConstructor_all, 0, "all"));
        LazyDefineProperty(PromisePrototype, "then", CreateBuiltinFunction(realm, PromisePrototype_then, 2, "then"));
        LazyDefineProperty(PromisePrototype, "catch", CreateBuiltinFunction(realm, PromisePrototype_catch, 1, "catch"));
        LazyDefineProperty(PromisePrototype, "constructor", PromiseConstructor);
        LazyDefineProperty(PromisePrototype, $$toStringTag, "Promise");


        // got to be moved outside of the createIntrinsics function
        // createIntrinsics has to become the DefineProperty rows only.

        function PromiseNew (executor) {
            debug2("promisenew")
            var promise = AllocatePromise(getIntrinsic("%Promise%"));
            return InitializePromise(promise, executor);
        }

        function PromiseBuiltinCapability() {
            var promise = AllocatePromise(getIntrinsic("%Promise%"));
            return CreatePromiseCapabilityRecord(promise, getIntrinsic("%Promise%"));
        }

        function PromiseOf(value) {
            var capability = NewPromiseCapability();
            if (isAbrupt(capability = ifAbrupt(capability))) return capability;
            var resolveResult = callInternalSlot("Call", capability.Resolve, undefined, [value]);
            if (isAbrupt(resolveResult = ifAbrupt(resolveResult))) return resolveResult;
            return NormalCompletion(capability.Promise);
        }

        function PromiseAll(promiseList) {
        }
        function PromiseCatch(promise, rejectedAction) {
        }
        function PromiseThen(promise, resolvedAction, rejectedAction) {
        }

        function PromiseCapability(promise, resolve, reject) {
            var pc = Object.create(PromiseCapability.prototype);
            pc.Promise = promise;
            pc.Resolve = resolve;
            pc.Reject = reject;
            return pc;
        }
        PromiseCapability.prototype.toString = function () { return "[object PromiseCapability]"; };

        function makePromiseReaction(capabilites, handler) {
            return PromiseReaction(capabilites, handler);
        }
        function PromiseReaction(caps, hdl) {
            var pr = Object.create(PromiseReaction.prototype);
            pr.Capabilities = caps;
            pr.Handler = hdl;
            return pr;
        }
        PromiseReaction.prototype.toString = function () { return "[object PromiseReaction]"; };


        function UpdatePromiseFromPotentialThenable(x, promiseCapability) {
            if (Type(x) !== "object") return NormalCompletion("not a thenable");
            var then = Get(x, "then");
            if (isAbrupt(then = ifAbrupt(then))) {
                var rejectResult = callInternalSlot("Call", promiseCapability.Reject, undefined, [then.value]);
                if (isAbrupt(rejectResult = ifAbrupt(rejectResult))) return rejectResult;
                return NormalCompletion(null);
            }
            if (!IsCallable(then)) return NormalCompletion("not a thenable");
            var thenCallResult = callInternalSlot("Call", then, x, [promiseCapability.Resolve, promiseCapability.Reject]);
            if (isAbrupt(thenCallResult = ifAbrupt(thenCallResult))) {
                var rejectResult = callInternalSlot("Call", promiseCapability.Reject, undefined, [thenCallResult.value]);
                if (isAbrupt(rejectResult = ifAbrupt(rejectResult))) return rejectResult;
            }
            return NormalCompletion(null);
        }

        function TriggerPromiseReactions(reactions, argument) {
            for (var i = 0, j = reactions.length; i < j; i++) {
                var reaction = reactions[i];
                EnqueueTask("PromiseTasks", PromiseReactionTask, [reaction, argument])
            }
            return NormalCompletion(undefined);
        }


        function PromiseReactionTask(reaction, argument) {
            Assert(reaction instanceof PromiseReaction, "reaction must be a PromiseReaction record");
            var promiseCapability = reaction.Capabilities;
            var handler = reaction.Handler;
            var handlerResult = callInternalSlot("Call", handler, undefined, [argument]);
            if (isAbrupt(handlerResult = ifAbrupt(handlerResult))) {
                var status = callInternalSlot("Call", promiseCapability.Reject, undefined, [handlerResult.value]);
                return NextTask(status, PromiseTaskQueue);
            }
            if (SameValue(handlerResult, promiseCapability.Promise)) {
                var selfResolutionError = withError("Type", "selfResolutionError in PromiseReactionTask");
                var status = callInternalSlot("Call", promiseCapability.Reject, undefined, [selfResolutionError]);
                return NextTask(status, PromiseTaskQueue);
            }
            var status = UpdatePromiseFromPotentialThenable(handlerResult, promiseCapability);
            if (isAbrupt(status = ifAbrupt(status))) return status;
            var updateResult = status;
            if (updateResult === "not a thenable") {
                var status = callInternalSlot("Call", promiseCapability.Resolve, undefined, [handlerResult]);
            }
            return NextTask(status, PromiseTaskQueue);
        }


        function IfAbruptRejectPromise(value, capability) {
            if (isAbrupt(value)) {
                var rejectedResult = callInternalSlot("Call", capability.Reject, undefined, [value.value]);
                if (isAbrupt(rejectedResult = ifAbrupt(rejectedResult))) return rejectedResult;
                return NormalCompletion(capability.Promise);
            }
            return ifAbrupt(value);
        }


        function CreateRejectFunction (promise) {
            var reject = makeRejectFunction();
            setInternalSlot(reject, "Promise", promise);
            return reject;
        }
        function CreateResolveFunction (promise) {
            var resolve = makeResolveFunction();
            setInternalSlot(resolve, "Promise", promise);
            return resolve;
        }

        function NewPromiseCapability(C) {
            debug2("newpromisecap")
            if (!IsConstructor(C)) return withError("Type", "C is no constructor");
            // Assertion Step 2 missing 25.4.3.1
            var promise = CreateFromConstructor(C);
            if (isAbrupt(promise = ifAbrupt(promise))) return promise;
            return CreatePromiseCapabilityRecord(promise, C);
        }

        function CreatePromiseCapabilityRecord(promise, constructor) {
            var promiseCapability = PromiseCapability(promise, undefined, undefined);
            var executor = GetCapabilitiesExecutor();
            setInternalSlot(executor, "Capability", promiseCapability);
            var constructorResult = callInternalSlot("Call", constructor, promise, [executor]);
            if (isAbrupt(constructorResult = ifAbrupt(constructorResult))) return constructorResult;

            if (!IsCallable(promiseCapability.Resolve)) return withError("Type", "capability.[[Resolve]] is not a function");
            if (!IsCallable(promiseCapability.Reject)) return withError("Type", "capability.[[Reject]] is not a function");
            if (Type(constructorResult) === "object" && (SameValue(promise, constructorResult) === false)) return withError("Type","constructorResult is not the same as promise");
            return promiseCapability;

        }


        function GetCapabilitiesExecutor () {

            var F = OrdinaryFunction();
            var GetCapabilitiesExecutor_Call = function (thisArg, argList) {
                var resolve = argList[0];
                var reject = argList[1];
                var promiseCapability = getInternalSlot(F, "Capability");
                Assert(promiseCapability !== undefined, "executor has to have a capability slot");
                if (promiseCapability.Resolve !== undefined) return withError("Type", "promiseCapability has to have some undefined fields");
                if (promiseCapability.Reject !== undefined) return withError("Type", "promiseCapability has to have some undefined fields");
                promiseCapability.Resolve = resolve;
                promiseCapability.Reject = reject;
                return NormalCompletion(undefined);
            };
            setInternalSlot(F, "Call", GetCapabilitiesExecutor_Call);
            return F;
        }

        function InitializePromise(promise, executor) {
            debug2("initializePromise: start");
            Assert(hasInternalSlot(promise, "PromiseStatus") && (getInternalSlot(promise, "PromiseStatus") === undefined),
                "InitializePromise: PromiseStatus doesnt exist or isnt undefined");
            Assert(IsCallable(executor), "executor has to be callable");
            setInternalSlot(promise, "PromiseStatus", "unresolved");
            setInternalSlot(promise, "PromiseResolveReactions", []);
            setInternalSlot(promise, "PromiseRejectReactions", []);
            var resolve = CreateResolveFunction(promise);
            var reject = CreateRejectFunction(promise);
            var completion = callInternalSlot("Call", executor, undefined, [resolve, reject]);
            if (isAbrupt(completion)) {
                var status = callInternalSlot("Call", reject, undefined, [completion.value]);
                if (isAbrupt(status = ifAbrupt(status))) return status;
            }
            return NormalCompletion(promise);
        }

        function AllocatePromise(constructor) {
            debug2("allocatePromise")
            var obj = OrdinaryCreateFromConstructor(constructor, "%PromisePrototype%", {
                "PromiseStatus": undefined,
                "PromiseConstructor": constructor,
                "PromiseResult": undefined,
                "PromiseResolveReactions": undefined,
                "PromiseRejectReactions" : undefined,
                "toString": function () {
                    return "[object PromiseExoticObject]";
                }
            });
            return obj;
        }


        function IsPromise(x) {
            if (Type(x) !== "object") return false;
            if (!hasInternalSlot(x, "PromiseStatus")) return false;
            if (getInternalSlot(x, "PromiseStatus") === undefined) return false;
            return true;
        }


        function makeIdentityFunction () {
            var F = OrdinaryFunction();
            var Identity_Call = function (thisArg, argList) {
                var x = argList[0];
                return NormalCompletion(x);
            };
            setInternalSlot(F, "Call", Identity_Call);
            SetFunctionName(F, "IdentityFunction");
            return NormalCompletion(F);
        }


        function makeResolutionHandlerFunction () {
            var handler = OrdinaryFunction();
            var handler_Call = function (thisArg, argList) {
                var x = argList[0];
                var promise = getInternalSlot(handler, "Promise");
                var fulfillmentHandler = getInternalSlot(handler, "FulfillmentHandler");
                var rejectionHandler = getInternalSlot(handler, "RejectionHandler");
                if (SameValue(x, promise)) {
                    var selfResolutionError = withError("Type", "selfResolutionError");
                    return callInternalSlot("Call", rejectionHandler, undefined, [selfResolutionError]);
                }
                var C = getInternalSlot(promise, "PromiseConstructor");
                var promiseCapability = NewPromiseCapability(C);
                if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
                var updateResult = UpdatePromiseFromPotentialThenable(x, promiseCapability);
                if (isAbrupt(updateResult = ifAbrupt(updateResult))) return updateResult;
                if (!HasProperty(updateResult, "then")) {
                    return Invoke(promiseCapability.Promise, "then", [fulfillmentHandler, rejectionHandler]);
                }
                return callInternalSlot("Call", fulfillmentHandler, undefined, [x]);
            };
            setInternalSlot(handler, "Call", handler_Call);
            return NormalCompletion(handler);
        }


        function makeThrowerFunction () {
            var F = OrdinaryFunction();
            var ThrowerFunction_Call = function (thisArg, argList) {
                var e = argList[0];
                return Completion("throw", e, empty);
            };
            setInternalSlot(F, "Call", ThrowerFunction_Call);
            SetFunctionName(F, "ThrowerFunction");
            SetFunctionLength(F, 1);
            return NormalCompletion(F);
        }

        function makeRejectFunction () {
            var handler = OrdinaryFunction();
            var handler_Call = function (thisArg, argList) {
                var reason = argList[0];
                var promise = getInternalSlot(handler, "Promise");
                Assert(Type(promise) === "object", "reject function has to have a Promise property");
                var status = getInternalSlot(promise, "PromiseStatus");
                if (status !== "unresolved") return NormalCompletion(undefined);
                var reactions = getInternalSlot(promise, "PromiseRejectReactions");
                setInternalSlot(promise, "PromiseResult", reason);
                setInternalSlot(promise, "PromiseResolveReactions", undefined);
                setInternalSlot(promise, "PromiseRejectReaction", undefined);
                setInternalSlot(promise, "PromiseStatus", "has-rejection");
                return TriggerPromiseReactions(reactions, reason);
            };
            setInternalSlot(handler, "Call", handler_Call);
            return handler;
        }

        function makeResolveFunction () {
            var handler = OrdinaryFunction();
            var handler_Call = function (thisArg, argList) {
                var resolution = argList[0];
                var promise = getInternalSlot(handler, "Promise");
                Assert(Type(promise) === "object", "reject function has to have a Promise property");
                var status = getInternalSlot(promise, "PromiseStatus");
                if (status !== "unresolved") return NormalCompletion(undefined);
                var reactions = getInternalSlot(promise, "PromiseResolveReactions");
                setInternalSlot(promise, "PromiseResult", resolution);
                setInternalSlot(promise, "PromiseResolveReactions", undefined);
                setInternalSlot(promise, "PromiseRejectReaction", undefined);
                setInternalSlot(promise, "PromiseStatus", "has-resolution");
                return TriggerPromiseReactions(reactions, resolution);
            };
            setInternalSlot(handler, "Call", handler_Call);
            return handler;
        }



        // ===========================================================================================================
        // Regular Expression
        // ===========================================================================================================

        MakeConstructor(RegExpConstructor, true, RegExpPrototype);

        var RegExp_$$create = function (thisArg, argList) {
            return RegExpAllocate(thisArg);
        };
        var RegExp_Call = function (thisArg, argList) {
            var obj = thisArg;
            return obj;
        };
        var RegExp_Construct = function (argList) {
            return Construct(this, argList);
        };
        var RegExpPrototype_get_global = function (thisArg, argList) {};
        var RegExpPrototype_get_multiline = function (thisArg, argList) {};
        var RegExpPrototype_get_ignoreCase = function (thisArg, argList) {};
        var RegExpPrototype_get_source = function (thisArg, argList) {};
        var RegExpPrototype_compile = function (thisArg, argList) {
        };
        var RegExpPrototype_exec = function (thisArg, argList) {
        };
        var RegExpPrototype_test = function (thisArg, argList) {
        };
        setInternalSlot(RegExpConstructor, "Call", RegExp_Call);
        setInternalSlot(RegExpConstructor, "Construct", RegExp_Construct);
        LazyDefineBuiltinConstant(RegExpPrototype, $$isRegExp, true);
        LazyDefineBuiltinConstant(RegExpPrototype, $$toStringTag, "RegExp");
        LazyDefineBuiltinFunction(RegExpConstructor, $$create, 1, RegExp_$$create);

        LazyDefineAccessor(RegExpPrototype, "ignoreCase", RegExpPrototype_get_ignoreCase, undefined);
        LazyDefineAccessor(RegExpPrototype, "global", RegExpPrototype_get_global, undefined);
        LazyDefineAccessor(RegExpPrototype, "multiline", RegExpPrototype_get_multiline, undefined);
        LazyDefineAccessor(RegExpPrototype, "source", RegExpPrototype_get_source, undefined);

        LazyDefineProperty(RegExpPrototype, "lastIndex", 0);

        LazyDefineBuiltinFunction(RegExpPrototype, "compile", 1, RegExpPrototype_compile);
        LazyDefineBuiltinFunction(RegExpPrototype, "exec", 1, RegExpPrototype_exec);
        LazyDefineBuiltinFunction(RegExpPrototype, "test", 1, RegExpPrototype_test);

        // ===========================================================================================================
        // set Timeout
        // ===========================================================================================================

        setInternalSlot(SetTimeoutFunction, "Call", function (thisArg, argList) {

            var func = argList[0];
            var timeout = argList[1] || 0;
            var task;
            if (!IsCallable(func)) return withError("Type", "setTimeout: function argument expected");
            task = {
                time: Date.now(),
                timeout: timeout,
                func: func
            };
            eventQueue.push(task);
            return task;
        });

        // ===========================================================================================================
        // ArrayBuffer
        // ===========================================================================================================

        setInternalSlot(ArrayBufferConstructor, "Call", function (thisArg, argList) {
            var length = argList[0];
            var O = thisArg;
            if (Type(O) !== "object" || (!hasInternalSlot(O, "ArrayBufferData")) || (getInternalSlot(O, "ArrayBufferData") !== undefined)) {
                return withError("Type", "Can not initialise the this argument as an ArrayBuffer or it is already initialised!");
            }
            Assert(getInternalSlot(O, "ArrayBufferData") === undefined, "ArrayBuffer has already to be initialised here but it is not.");
            var numberLength = ToNumber(length);
            var byteLength = ToInteger(numberLength);
            if (isAbrupt(byteLength = ifAbrupt(byteLength))) return byteLength;
            if ((numberLength != byteLength) || (byteLength < 0)) return withError("Range", "invalid byteLength");
            return SetArrayBufferData(O, byteLength);
        });

        setInternalSlot(ArrayBufferConstructor, "Construct", function (argList) {
            var F = ArrayBufferConstructor;
            return OrdinaryConstruct(F, argList);
        });


        setInternalSlot(ArrayBufferConstructor, "Prototype", FunctionPrototype);
        DefineOwnProperty(ArrayBufferConstructor, "prototype", {
            value: ArrayBufferPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayBufferConstructor, "isView", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var arg = argList[0];
                if (Type(arg) !== "object") return false;
                if (hasInternalSlot(arg, "ViewedArrayBuffer")) return true;
                return false;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(ArrayBufferConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var F = thisArg;
                return AllocateArrayBuffer(F);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(ArrayBufferPrototype, "constructor", {
            value: ArrayBufferConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(ArrayBufferPrototype, $$toStringTag, {
            value: "ArrayBuffer",
            writable: false,
            enumerable: false,
            configurable: false
        });
        setInternalSlot(ArrayBufferPrototype, "Prototype", ObjectPrototype)
        DefineOwnProperty(ArrayBufferPrototype, "byteLength", {
            get: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var O = thisArg;
                if (!hasInternalSlot(O, "ArrayBufferData")) return withError("Type", "The this argument hasnÂ´t [[ArrayBufferData]]");
                if (getInternalSlot(O, "ArrayBufferData") === undefined) return withError("Type", "The this arguments [[ArrayBufferData]] is not initialised");
                var length = getInternalSlot(O, "ArrayBufferByteLength");
                return length;
            }),
            set: undefined,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(ArrayBufferPrototype, "slice", {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var start = argList[0];
                var end = argList[1];
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        // ===========================================================================================================
        // DataView
        // ===========================================================================================================



        var DataViewConstructor_Call= function (thisArg, argList) {
            var O = thisArg;
            var buffer = argList[0];
            var byteOffset = argList[1];
            var byteLength = argList[2];
            if (byteOffset === undefined) byteOffset = 0;
            if (Type(O) !== "object" || !hasInternalSlot(O, "DataView")) return withError("Type", "DataView object expected")
            Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "O has to have a ViewedArrayBuffer slot.");
            var viewedArrayBuffer = getInternalSlot(O, "ViewedArrayBuffer");
            if (viewedArrayBuffer !== undefined) return withError("Type", "ViewedArrayBuffer of DataView has to be undefined.");
            if (Type(buffer) !== "object") return withError("Type", "buffer has to be an arraybuffer object");
            var arrayBufferData;
            if (!hasInternalSlot(buffer, "ArrayBufferData")) return withError("Type", "In DataView(buffer), buffer has to have ArrayBufferData slot");
            arrayBufferData = getInternalSlot(buffer, "ArrayBufferData");
            if (arrayBufferData === undefined) return withError("Type", "arrayBufferData of buffer may not be undefined");
            var numberOffset = ToNumber(byteOffset);
            var offset = ToInteger(numberOffset);
            if (isAbrupt(offset=ifAbrupt(offset))) return offset;
            if (numberOffset !== offset || offset < 0) return withError("Range", "numberOffset is not equal to offset or is less than 0.")
            var byteBufferLength = getInternalSlot(buffer, "ArrayBufferByteLength");
            if (offset > byteBufferLength) return withError("Range", "offset > byteBufferLength");
            if (byteLength === undefined) {
                var viewByteLength = byteBufferLength - offset;
            } else {
                var numberLength = ToNumber(byteLength);
                var viewLength = ToInteger(numberLength);
                if (isAbrupt(viewLength=ifAbrupt(viewLength))) return viewLength;
                if ((numberLength != viewLength) || viewLength < 0) return withError("Range","numberLength != viewLength or viewLength < 0");
                var viewByteLength = viewLength;
                if ((offset+viewByteLength) > byteBufferLength) return withError("Range","offset + viewByteLength > byteBufferLength");
            }
            if (getInternalSlot(O, "ViewedArrayBuffer") !== undefined) return withError("Type", "ViewedArrayBuffer of O has to be undefined here");
            setInternalSlot(O, "ViewedArrayBuffer", buffer);
            setInternalSlot(O, "ByteLength", viewByteLength);
            setInternalSlot(O, "ByteOffset", offset);
            return NormalCompletion(O);
        };

        var DataViewConstructor_Construct = function (thisArg, argList) {
            return OrdinaryConstruct(this, argList);
        };

        var DataViewConstructor_$$create = function (thisArg, argList) {
            var F = thisArg;
            var obj = OrdinaryCreateFromConstructor(F, "%DataViewPrototype%", {
                "DataView": undefined,
                "ViewedArrayBuffer": undefined,
                "ByteLength": undefined,
                "ByteOffset": undefined
            });
            setInternalSlot(obj, "DataView", true);
            return obj;
        };

        var DataViewPrototype_get_buffer = function (thisArg, argList) {
            var O = thisArg;
            if (Type(O) !== "object") return withError("Type", "O is not an object");
            if (!hasInternalSlot(O, "ViewedArrayBuffer")) return withError("Type", "O has no ViewedArrayBuffer slot");
            var buffer = getInternalSlot(O, "ViewedArrayBuffer");
            if (buffer === undefined) return withError("Type", "buffer is undefined but must not");
            return NormalCompletion(buffer);
        };

        var DataViewPrototype_get_byteLength = function (thisArg, argList) {
            var O = thisArg;
            if (Type(O) !== "object") return withError("Type", "O is not an object");
            if (!hasInternalSlot(O, "ViewedArrayBuffer")) return withError("Type", "O has no ViewedArrayBuffer property");
            var buffer = getInternalSlot(O, "ViewedArrayBuffer");
            if (buffer === undefined) return withError("Type", "buffer is undefined");
            var size = getInternalSlot(O, "ByteLength");
            return NormalCompletion(size);
        };

        var DataViewPrototype_get_byteOffset = function (thisArg, argList) {
            var O = thisArg;
            if (Type(O) !== "object") return withError("Type", "O is not an object");
            if (!hasInternalSlot(O, "ViewedArrayBuffer")) return withError("Type", "O has no ViewedArrayBuffer property");
            var buffer = getInternalSlot(O, "ViewedArrayBuffer");
            if (buffer === undefined) return withError("Type", "buffer is undefined");
            var offset = getInternalSlot(O, "ByteOffset");
            return NormalCompletion(offset);
        };


        var DataViewPrototype_getFloat32 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var littleEndian = argList[1];
            if (littleEndian == undefined) littleEndian = false;
            return GetViewValue(v, byteOffset, littleEndian, "Float32");
        };

        var DataViewPrototype_getFloat64 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var littleEndian = argList[1];
            if (littleEndian == undefined) littleEndian = false;
            return GetViewValue(v, byteOffset, littleEndian, "Float64");
        };

        var DataViewPrototype_getInt8 = function (thisArg, argList) {
            var byteOffset = argList[0];
            var v = thisArg;
            return GetViewValue(v, byteOffset, undefined, "Int8");
        };

        var DataViewPrototype_getInt16 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var littleEndian = argList[1];
            if (littleEndian == undefined) littleEndian = false;
            return GetViewValue(v, byteOffset, littleEndian, "Int16");
        };


        var DataViewPrototype_getInt32 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var littleEndian = argList[1];
            if (littleEndian == undefined) littleEndian = false;
            return GetViewValue(v, byteOffset, littleEndian, "Int32");
        };


        var DataViewPrototype_getUint8 = function (thisArg, argList) {
            var byteOffset = argList[0];
            var v = thisArg;
            return GetViewValue(v, byteOffset, undefined, "Uint8");
        };

        var DataViewPrototype_getUint16 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var littleEndian = argList[1];
            if (littleEndian == undefined) littleEndian = false;
            return GetViewValue(v, byteOffset, littleEndian, "Uint16");
        };
        var DataViewPrototype_getUint32 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var littleEndian = argList[1];
            if (littleEndian == undefined) littleEndian = false;
            return GetViewValue(v, byteOffset, littleEndian, "Uint32");
        };

        var DataViewPrototype_setFloat32 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            var littleEndian = argList[2];
            if (littleEndian == undefined) littleEndian = false;
            return SetViewValue(v, byteOffset, littleEndian, "Float32", value);
        };

        var DataViewPrototype_setFloat64 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            var littleEndian = argList[2];
            if (littleEndian == undefined) littleEndian = false;
            return SetViewValue(v, byteOffset, littleEndian, "Float64", value);
        };

        var DataViewPrototype_setInt8 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            return SetViewValue(v, byteOffset, undefined, "Int8", value);
        };
        var DataViewPrototype_setInt16 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            var littleEndian = argList[2];
            if (littleEndian == undefined) littleEndian = false;
            return SetViewValue(v, byteOffset, littleEndian, "Int16", value);
        };

        var DataViewPrototype_setInt32 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            var littleEndian = argList[2];
            if (littleEndian == undefined) littleEndian = false;
            return SetViewValue(v, byteOffset, littleEndian, "Int32", value);
        };

        var DataViewPrototype_setUint8 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            return SetViewValue(v, byteOffset, undefined, "Uint8", value);
        };
        var DataViewPrototype_setUint16 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            var littleEndian = argList[2];
            if (littleEndian == undefined) littleEndian = false;
            return SetViewValue(v, byteOffset, littleEndian, "Uint16", value);
        };

        var DataViewPrototype_setUint32 = function (thisArg, argList) {
            var v = thisArg;
            var byteOffset = argList[0];
            var value = argList[1];
            var littleEndian = argList[2];
            if (littleEndian == undefined) littleEndian = false;
            return SetViewValue(v, byteOffset, littleEndian, "Uint32", value);
        };



        MakeConstructor(DataViewConstructor, true, DataViewPrototype);
        setInternalSlot(DataViewConstructor, "Call", DataViewConstructor_Call);
        setInternalSlot(DataViewConstructor, "Construct", DataViewConstructor_Construct);
        LazyDefineBuiltinFunction(DataViewConstructor, $$create, 1, DataViewConstructor_$$create);
        LazyDefineAccessor(DataViewPrototype, "buffer", CreateBuiltinFunction(realm, DataViewPrototype_get_buffer, 0, "get buffer"));
        LazyDefineAccessor(DataViewPrototype, "byteLength", CreateBuiltinFunction(realm, DataViewPrototype_get_byteLength, 0, "get byteLength"));
        LazyDefineAccessor(DataViewPrototype, "byteOffset", CreateBuiltinFunction(realm, DataViewPrototype_get_byteOffset, 0, "get byteOffset"));
        LazyDefineBuiltinFunction(DataViewPrototype, "getFloat32", 1, DataViewPrototype_getFloat32);
        LazyDefineBuiltinFunction(DataViewPrototype, "getFloat64", 1, DataViewPrototype_getFloat64);
        LazyDefineBuiltinFunction(DataViewPrototype, "getInt8", 1, DataViewPrototype_getInt8);
        LazyDefineBuiltinFunction(DataViewPrototype, "getInt16", 1, DataViewPrototype_getInt16);
        LazyDefineBuiltinFunction(DataViewPrototype, "getInt32", 1, DataViewPrototype_getInt32);
        LazyDefineBuiltinFunction(DataViewPrototype, "getUint8", 1, DataViewPrototype_getUint8);
        LazyDefineBuiltinFunction(DataViewPrototype, "getUint16", 1, DataViewPrototype_getUint16);
        LazyDefineBuiltinFunction(DataViewPrototype, "getUint32", 1, DataViewPrototype_getUint32);
        LazyDefineBuiltinFunction(DataViewPrototype, "setFloat32", 2, DataViewPrototype_setFloat32);
        LazyDefineBuiltinFunction(DataViewPrototype, "setFloat64", 2, DataViewPrototype_setFloat64);
        LazyDefineBuiltinFunction(DataViewPrototype, "setInt8", 2, DataViewPrototype_setInt8);
        LazyDefineBuiltinFunction(DataViewPrototype, "setInt16", 2, DataViewPrototype_setInt16);
        LazyDefineBuiltinFunction(DataViewPrototype, "setInt32", 2, DataViewPrototype_setInt32);
        LazyDefineBuiltinFunction(DataViewPrototype, "setUint8", 2, DataViewPrototype_setUint8);
        LazyDefineBuiltinFunction(DataViewPrototype, "setUint16", 2, DataViewPrototype_setUint16);
        LazyDefineBuiltinFunction(DataViewPrototype, "setUint32", 2, DataViewPrototype_setUint32);
        LazyDefineBuiltinConstant(DataViewConstructor, $$toStringTag, "DataView");

        // ===========================================================================================================
        // TypedArray
        // ===========================================================================================================
        // ------------------------------------------------------------------------------------------
        // Der %TypedArray% Constructor (Superklasse)
        // ------------------------------------------------------------------------------------------

        var TypedArrayConstructor_Call = function (thisArg, argList) {
            var array, typedArray, length;
            array = argList[0];
            var F = thisArg;
            var O;
            var elementType;
            var numberLength;
            var elementLength;
            var elementSize;
            var byteLength;
            var status;
            var data;
            var constructorName;

            if (Type(array) === "object") {
                if (array instanceof ArrayExoticObject) {

                } else if ((typedArray = array) instanceof IntegerIndexedExoticObject) {

                }
            } else if (typeof (length = array) == "number") {
                O = thisArg;
                if (Type(O) !== "object") return withError("Type", "this value is not an object");
                if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "object has no TypedArrayName property");
                Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "object has to have a ViewedArrayBuffer property");
                if (getInternalSlot(O, "ViewedArrayBuffer") === undefined) return withError("Type", "object has to have a well defined ViewedArrayBuffer property");
                constructorName = getInternalSlot(O, "TypedArrayName");
                elementType = TypedArrayElementType[constructorName];
                numberLength = ToNumber(length);
                elementLength = ToLength(numberLength);
                if (isAbrupt(elementLength = ifAbrupt(elementLength))) return elementLength;
                if (SameValueZero(numberLength, elementLength) === false) return withError("Range", "TypedArray: numberLength and elementLength are not equal");
                data = AllocateArrayBuffer("%ArrayBuffer%");
                if (isAbrupt(data = ifAbrupt(data))) return data;
                elementSize = TypedArrayElementSize[elementType];
                byteLength = elementSize * elementLength;
                status = SetArrayBufferData(data, byteLength);
                if (isAbrupt(status = ifAbrupt(status))) return status;
                setInternalSlot(O, "ViewedArrayBuffer", data);
                setInternalSlot(O, "ByteLength", byteLength);
                setInternalSlot(O, "ByteOffset", 0);
                setInternalSlot(O, "ArrayLength", elementLength);
                return O;
            } else {
                Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "O has to have [[ViewedArrayBuffer]]");
                var buffer = argList[0];
                var byteOffset = argList[1];
                if (byteOffset === undefined) byteOffset = 0;
                length = argList[2];
                Assert((Type(buffer) === "object") && hasInternalSlot(buffer, "ArrayBufferData"), "buffer has to be an object and to have [[ArrayBufferData]]");
                O = thisArg;
                var arrayBufferData = getInternalSlot(buffer, "ArrayBufferData");
                if (arrayBufferData === undefined) return withError("Type", "[[ArrayBufferData]] is undefined");
                if (Type(O) !== "object" || !hasInternalSlot(O, "TypedArrayName")) return withError("Type", "O has to be object and to have [[TypedArrayName]]");
                var viewedArrayBuffer = getInternalSlot(O, "ViewedArrayBuffer");
                var typedArrayName = getInternalSlot(O, "TypedArrayName");
                if (typedArrayName === undefined) return withError("Type", "O has to have a well defined [[TypedArrayName]]");
                constructorName = getInternalSlot(O, "TypedArrayName");
                elementType = TypedArrayElementType[constructorName];
                elementSize = TypedArrayElementSize[elementType];
                var offset = ToInteger(byteOffset);
                if (isAbrupt(offset = ifAbrupt(offset))) return offset;
                if (offset < 0) return withError("Range", "offset is smaller 0");
                if ((offset % elementSize) !== 0) return withError("Range", "offset mod elementSize is not 0");
                var byteBufferLength = getInternalSlot(buffer, "ArrayBufferByteLength");
                if (offset + elementSize >= byteBufferLength) return withError("Range", "offset + elementSize is >= byteBufferLength");
                var newByteLength;
                if (length === undefined) {
                    if (byteBufferLength % elementSize !== 0) return withError("Range", "byteBufferLength mod elementSize is not 0");
                    newByteLength = byteBufferLength + offset;
                    if (newByteLength < 0) return withError("Range", "newByteLength < 0 underflow when adding offset to byteBufferLength");
                } else {
                    var newLength = ToLength(length);
                    if (isAbrupt(newLength = ifAbrupt(newLength))) return newLength;
                    newByteLength = newLength * elementSize;
                    if (offset + newByteLength > byteBufferLength) return withError("Range", "offset + newByteLength is larger than byteBufferLength");
                }
                if (viewedArrayBuffer !== undefined) return withError("Type", "the [[ViewedArrayBuffer]] of O is not empty");
                setInternalSlot(O, "ViewedArrayBuffer", buffer);
                setInternalSlot(O, "ByteLength", newByteLength);
                setInternalSlot(O, "ByteOffset", offset);
                setInternalSlot(O, "ArrayLength", Math.floor(newByteLength / elementSize));
            }
            return O;
        };

        var typedArrayPrototypeNames = {
            "Float64Array": "%Float64ArrayPrototype%",
            "Float32Array": "%Float32ArrayPrototype%",
            "Int32Array": "%Int32ArrayPrototype%",
            "Uint32Array": "%Uint32ArrayPrototype%",
            "Int16Array": "%Int16ArrayPrototype%",
            "Uint16Array": "%Uint16ArrayPrototype%",
            "Int8Array": "%Int8ArrayPrototype%",
            "Uint8Array": "%Uint8ArrayPrototype%",
            "Uint8Clamped": "%Uint8ClampedArrayProtoype%"
        };

        var TypedArrayConstructor_$$create = function $$create(thisArg, argList) {
            var F = thisArg;
            if (Type(F) !== "object") return withError("Type", "the this value is not an object");
            if (!hasInternalSlot(F, "TypedArrayConstructor")) return withError("Type", "The this value has no [[TypedArrayConstructor]] property");
            var proto = GetPrototypeFromConstructor(F, typedArrayPrototypeNames[getInternalSlot(F, "TypedArrayConstructor")]);
            if (isAbrupt(proto = ifAbrupt(proto))) return proto;
            var obj = IntegerIndexedObjectCreate(proto);
            setInternalSlot(obj, "ViewedArrayBuffer", undefined);
            setInternalSlot(obj, "TypedArrayName", getInternalSlot(F, "TypedArrayConstructor"));
            setInternalSlot(obj, "ByteLength", 0);
            setInternalSlot(obj, "ByteOffset", 0);
            setInternalSlot(obj, "ArrayLength", 0);
            return obj;
        };

        var TypedArrayConstructor_from = function from(thisArg, argList) {
            "use strict";
            var source = argList[0];
            var mapfn = argList[1];
            var tArg = argList[2];
            var T;
            var C = thisArg;
            var newObj;
            var putStatus;
            if (!IsConstructor(C)) return withError("Type", "The this value is no constructor function.");
            var items = ToObject(source);
            if (isAbrupt(items = ifAbrupt(items))) return items;
            var mapping;
            var k;
            var nextValue, kValue, Pk;
            if (mapfn === undefined) {
                mapping = false;
            } else {
                if (!IsCallable(mapfn)) return withError("Type", "mapfn is not a callable object");
                T = tArg;
                mapping = true;
            }
            var usingIterator = HasProperty(items, $$iterator);
            if (isAbrupt(usingIterator = ifAbrupt(usingIterator))) return usingIterator;
            if (usingIterator) {
                var iterator = Get(items, $$iterator);
                iterator = unwrap(iterator);
                var values = [];
                var next = true;
                while (next != false) {
                    next = IteratorStept(iterator);
                    if (next !== false) {
                        nextValue = IteratorValue(next);
                        if (isAbrupt(nextValue = ifAbrupt(nextValue))) return nextValue;
                        values.push(nextValue);
                    }
                }
                var len = values.length;
                newObj = callInternalSlot("Construct", C, C, [len]);
                if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
                k = 0;
                while (k < len) {
                    Pk = ToString(k);
                    kValue = values[k];
                    if (mapping) {
                        mappedValue = callInternalSlot("Call", mapfn, T, [kValue]);
                        if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
                    } else mappedValue = kValue;
                    putStatus = Put(newObj, Pk, mappedValue, true);
                    if (isAbrupt(putStatus)) return putStatus;
                    k = k + 1;
                }
                return NormalCompletion(newObj);
            }
            Assert(HasProperty(items, "length"), "items has to be an array like object");
            var lenValue = Get(items, "length");
            var len = ToLength(lenValue);
            if (isAbrupt(len = ifAbrupt(len))) return len;
            newObj = callInternalSlot("Construct", C, C, [len]);
            if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;

            var mappedValue;
            k = 0;
            while (k < len) {
                Pk = ToString(k);
                kValue = Get(items, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                if (mapping) {
                    mappedValue = callInternalSlot("Call", mapfn, T, [kValue, k, items]);
                    if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
                } else {
                    mappedValue = kValue;
                }
                putStatus = Put(newObj, Pk, mappedValue, true);
                if (isAbrupt(putStatus)) return putStatus;
                k = k + 1;
            }
            return NormalCompletion(newObj);

        };
        var TypedArrayConstructor_of = function of(thisArg, argList) {
            var items = CreateArrayFromList(argList);

            var lenValue = Get(items, "length");
            var C = thisArg;

            if (IsConstructor(C)) {
                var newObj = callInternalSlot("Construct", C, C, [len]);
                if (isAbrupt(newObj = ifAbrupt(newObj))) return newObj;
            } else {
                return withError("Type", "The thisValue has to be a constructor");
            }

            var k = 0;
            var status;
            var Pk, kValue;
            while (k < len) {
                Pk = ToString(k);
                kValue = Get(items, Pk);
                //if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                status = Put(newObj, Pk, kValue, true);
                if (isAbrupt(status = ifAbrupt(status))) return status;
                k = k + 1;
            }
            return NormalCompletion(newObj);
        };

        setInternalSlot(TypedArrayConstructor, "Call", TypedArrayConstructor_Call);
        LazyDefineProperty(TypedArrayConstructor, $$create, CreateBuiltinFunction(realm, TypedArrayConstructor_$$create, 0, "[Symbol.create]"));
        LazyDefineProperty(TypedArrayConstructor, "from", CreateBuiltinFunction(realm, TypedArrayConstructor_from, 1, "from"));
        LazyDefineProperty(TypedArrayConstructor, "of", CreateBuiltinFunction(realm, TypedArrayConstructor_of, 2, "of"));

        // ------------------------------------------------------------------------------------------
        // 22.2.6. Typed Array Prototype
        // ------------------------------------------------------------------------------------------

        var TypedArrayPrototype_get_buffer = function (thisArg, argList) {

        };
        var TypedArrayPrototype_get_byteLength = function (thisArg, argList) {

        };
        var TypedArrayPrototype_get_byteOffset = function (thisArg, argList) {

        };
        var TypedArrayPrototype_get_buffer = function (thisArg, argList) {

        };

        var tap_subarray = function subarray(thisArg, argList) {

        };

        // filter
        // find
        // findIndex
        // forEach
        // indexOf
        // join
        // keys
        // lastIndexOf
        // length
        // map
        // reduce
        // reduceRight
        // reverse
        // set
        // slice
        // some
        // sort
        // subarray
        // toLocaleString
        // toString
        // values
        // $$iterator
        var TypedArrayPrototype_$$iterator = function iterator(thisArg, argList) {

        };

        // $$toStringTag
        var TypedArrayPrototype_get_$$toStringTag = function get_toStringTag(thisArg, argList) {
            var O = thisArg;
            if (Type(O) !== "object") return withError("Type", "the this value is not an object");
            if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "the this value has no [[TypedArrayName]] slot");
            var name = getInternalSlot(O, "TypedArrayName");
            Assert(Type(name) == "string", "name has to be a string value");
            return NormalCompletion(name);
        };

        function createTypedArrayPrototype(proto) {
            LazyDefineAccessor(proto, "buffer", CreateBuiltinFunction(realm, TypedArrayPrototype_get_buffer, 0, "get buffer"));
            LazyDefineAccessor(proto, "byteLength", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteLength, 0, "get byteLength"));
            LazyDefineAccessor(proto, "byteOffset", CreateBuiltinFunction(realm, TypedArrayPrototype_get_byteOffset, 0, "get byteOffset"));
            LazyDefineAccessor(proto, $$toStringTag, CreateBuiltinFunction(realm, TypedArrayPrototype_get_$$toStringTag, 0, "get [Symbol.toStringTag]"));
            return proto;
        };

        // ===========================================================================================================
        // Create Typed Arrays
        // ===========================================================================================================

        function createTypedArrayVariant(_type, _bpe, _ctor, _proto) {

            //    setInternalSlot(_ctor, "TypedArrayConstructor", _type + "Array");

            setInternalSlot(_ctor, "Prototype", TypedArrayConstructor);

            setInternalSlot(_ctor, "Call", function (thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "O is not an object");
                if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "[[TypedArrayName]] is missing");
                if (getInternalSlot(O, "TypedArrayName") != undefined) return withError("Type", "[[TypedArrayName]] isnt undefined");
                setInternalSlot(O, "TypedArrayName", _type + "Array");
                var F = this;
                var realmF = getInternalSlot(F, "Realm");
                var sup = Get(realmF.intrinsics, "%TypedArray%");
                var args = argList;
                return callInternalSlot("Call", sup, O, args);
            });

            setInternalSlot(_ctor, "Construct", function (argList) {
                var F = this;
                var args = argList;
                return OrdinaryConstruct(F, args);
            });
            DefineOwnProperty(_ctor, "BYTES_PER_ELEMENT", {
                value: _bpe,
                writable: false,
                enumerable: false,
                configurable: false
            });
            DefineOwnProperty(_ctor, "prototype", {
                value: _proto,
                writable: false,
                enumerable: true,
                configurable: false
            });
            DefineOwnProperty(_proto, "constructor", {
                value: _ctor,
                writable: false,
                enumerable: true,
                configurable: false
            });

            return _ctor;
        }

        createTypedArrayVariant("Int8", 1, Int8ArrayConstructor, Int8ArrayPrototype);
        createTypedArrayVariant("Uint8", 1, Uint8ArrayConstructor, Int8ArrayPrototype);
        createTypedArrayVariant("Uint8C", 1, Uint8ClampedArrayConstructor, Uint8ClampedArrayPrototype);
        createTypedArrayVariant("Int16", 2, Int16ArrayConstructor, Int16ArrayPrototype);
        createTypedArrayVariant("Uint16", 2, Uint16ArrayConstructor, Uint16ArrayPrototype);
        createTypedArrayVariant("Int32", 4, Int32ArrayConstructor, Int32ArrayPrototype);
        createTypedArrayVariant("Uint32", 4, Uint32ArrayConstructor, Uint32ArrayPrototype);
        createTypedArrayVariant("Float32", 8, Float32ArrayConstructor, Float32ArrayPrototype);
        createTypedArrayVariant("Float64", 8, Float64ArrayConstructor, Float64ArrayPrototype);

        // ===========================================================================================================
        // Map
        // ===========================================================================================================

        //
        // Map, WeakMap, Set
        //
        // 
        // To achieve constant O(1) XS within ES5 i do one thing, as long
        // as i have not even written the compiler and bytecode
        // I set an internal Property with a String Value, which can be used
        // as a key to get the record with the entry very fast.
        //
        // for (k in listobj) is listing in order of creation
        // that is a tradeoff for es5 
        // i do not like array.indexOf, coz each lookup is up to O(n)
        // and we want it to be constant

        var uniqueInMapKey = 0;

        setInternalSlot(MapConstructor, "Prototype", FunctionPrototype);
        setInternalSlot(MapPrototype, "Prototype", ObjectPrototype);

        setInternalSlot(MapConstructor, "Call", function Call(thisArg, argList) {

            var iterable = argList[0];
            var comparator = argList[1];
            var map = thisArg;

            if (Type(map) !== "object") return withError("Type", "map is not an object");
            if (!hasInternalSlot(map, "MapData")) return withError("Type", "MapData property missing on object");
            if (getInternalSlot(map, "MapData") !== undefined) return withError("Type", "MapData property already initialised");

            var iter;
            var hasValues, adder;
            if (iterable === undefined || iterable === null) iter = undefined;
            else {
                hasValues = HasProperty(iterable, "entries");
                if (isAbrupt(hasValues = ifAbrupt(hasValues))) return hasValues;
                if (hasValues) iter = Invoke(iterable, "entries");
                else iter = GetIterator(iterable);
                adder = Get(map, "set");
                if (isAbrupt(adder = ifAbrupt(adder))) return adder;
                if (!IsCallable(adder)) return withError("Type", "map adder (the set function) is not callable");
            }
            if (comparator !== undefined) {
                if (comparator !== "is") return withError("Range", "comparator argument has currently to be 'undefined' or 'is'");
            }

            setInternalSlot(map, "MapData", Object.create(null));
            setInternalSlot(map, "MapComparator", comparator);

            if (iter === undefined) return NormalCompletion(map);

            var next, nextItem, done, k, v, status;
            for (;;) {
                next = IteratorNext(iter);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                done = IteratorComplete(next);
                if (isAbrupt(done = ifAbrupt(done))) return done;
                if (done) return NormalCompletion(map);
                nextItem = IteratorValue(next);
                if (isAbrupt(nextItem = ifAbrupt(nextItem))) return nextItem;
                k = Get(nextItem, "0");
                if (isAbrupt(k = ifAbrupt(k))) return k;
                v = Get(nextItem, "1");
                if (isAbrupt(v = ifAbrupt(v))) return v;
                status = callInternalSlot("Call", adder, map, [k, v]);
                if (isAbrupt(status)) return status;
            }
            return NormalCompletion(map);
        });

        setInternalSlot(MapConstructor, "Construct", function Construct(argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, args);
        });

        DefineOwnProperty(MapConstructor, "prototype", {
            value: MapPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "constructor", {
            value: MapConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "has", {
            value: CreateBuiltinFunction(realm, function has(thisArg, argList) {

                var same;
                var key = argList[0];
                var M = thisArg;

                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(M, "MapData");
                var comparator = getInternalSlot(M, "MapComparator");

                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                var internalKey;

                internalKey = __checkInternalUniqueKey(key);

                var record = entries[internalKey];
                if (record) {
                    return NormalCompletion(true);
                }
                return NormalCompletion(false);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "get", {
            value: CreateBuiltinFunction(realm, function get(thisArg, argList) {
                var key = argList[0];
                var M = thisArg;
                var same;
                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");
                var entries = getInternalSlot(M, "MapData");
                var comparator = getInternalSlot(M, "MapComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                var internalKey;

                internalKey = __checkInternalUniqueKey(key);

                var record = entries[internalKey];
                if (record) {
                    var value = record.value;
                    return NormalCompletion(value);
                }
                return NormalCompletion(undefined);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "set", {
            value: CreateBuiltinFunction(realm, function set(thisArg, argList) {
                var key = argList[0];
                var value = argList[1];
                var M = thisArg;
                var same;
                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(M, "MapData");

                var comparator = getInternalSlot(M, "MapComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;


                var internalKey;

                internalKey = __checkInternalUniqueKey(key, true);

                var record = entries[internalKey];
                if (!record) {
                    entries[internalKey] = {
                        key: key,
                        value: value
                    };
                } else {
                    record.value = value;
                }
                return NormalCompletion(M);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "delete", {
            value: CreateBuiltinFunction(realm, function _delete(thisArg, argList) {
                var key = argList[0];
                var M = thisArg;
                var same;
                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");
                var entries = getInternalSlot(M, "MapData");
                var comparator = getInternalSlot(M, "MapComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                var internalKey;

                internalKey = __checkInternalUniqueKey(key);

                var record = entries[internalKey];
                if (record) {
                    entries[internalKey] = undefined;
                    delete entries[internalKey];
                    return NormalCompletion(true);
                }
                return NormalCompletion(false);
            }, 1, "delete"),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "forEach", {
            value: CreateBuiltinFunction(realm, function forEach(thisArg, argList) {

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "clear", {
            value: CreateBuiltinFunction(realm, function clear(thisArg, argList) {}),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "keys", {
            value: CreateBuiltinFunction(realm, function keys(thisArg, argList) {
                var O = thisArg;
                return CreateMapIterator(O, "key");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "values", {
            value: CreateBuiltinFunction(realm, function values(thisArg, argList) {
                var O = thisArg;
                return CreateMapIterator(O, "value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "entries", {
            value: CreateBuiltinFunction(realm, function entries(thisArg, argList) {
                var O = thisArg;
                return CreateMapIterator(O, "key+value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
                var F = thisArg;
                return OrdinaryCreateFromConstructor(F, "%MapPrototype%", {
                    "MapData": undefined,
                    "MapComparator": undefined
                });
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, $$toStringTag, {
            value: "Map",
            writable: false,
            enumerable: false,
            configurable: false
        });

        //
        // Map Iterator
        //

        function CreateMapIterator(map, kind) {
            var M = ToObject(map);
            if (isAbrupt(M = ifAbrupt(M))) return M;
            if (!hasInternalSlot(M, "MapData")) return withError("Type", "object has no internal MapData slot");
            var entries = getInternalSlot(M, "MapData");
            var MapIteratorPrototype = Get(getIntrinsics(), "%MapIteratorPrototype%");
            var iterator = ObjectCreate(MapIteratorPrototype, {
                "Map": undefined,
                "MapNextIndex": undefined,
                "MapIterationKind": undefined
            });
            setInternalSlot(iterator, "Map", entries);
            setInternalSlot(iterator, "MapNextIndex", 0);
            setInternalSlot(iterator, "MapIterationKind", kind);
            return iterator;
        }


        DefineOwnProperty(MapIteratorPrototype, $$toStringTag, {
            value: "Map Iterator",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapIteratorPrototype, $$iterator, {
            value: CreateBuiltinFunction(realm, function $$iterator(thisArg, argList) {
                return thisArg;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapIteratorPrototype, "next", {
            value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "the this value is not an object");
                if (!hasInternalSlot(O, "Map") || !hasInternalSlot(O, "MapNextIndex") || !hasInternalSlot(O, "MapIterationKind")) return withError("Type", "iterator has not all of the required internal properties");
                var entries = getInternalSlot(O, "Map");
                var kind = getInternalSlot(O, "MapIterationKind");
                var index = getInternalSlot(O, "MapNextIndex");
                var result;
                var internalKeys = Object.keys(entries); // deviate from spec
                var len = internalKeys.length;
                while (index < len) {
                    var e = entries[internalKeys[index]];
                    index = index + 1;
                    setInternalSlot(O, "MapNextIndex", index);
                    if (e.key !== empty) {
                        if (kind === "key") result = e.key;
                        else if (kind === "value") result = e.value;
                        else {
                            Assert(kind === "key+value", "map iteration kind has to be key+value");
                            var result = ArrayCreate(2);
                            CreateDataProperty(result, "0", e.key);
                            CreateDataProperty(result, "1", e.value);
                        }
                        return CreateItrResultObject(result, false);
                    }
                }
                return CreateItrResultObject(undefined, true);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        function __checkInternalUniqueKey(value, writeIfUndefined) {
            var internalKey;
            if (Type(value) === "object") {
                internalKey = getInternalSlot(value, "__mapSetInternalUniqueKey__");
                if (internalKey === undefined) {
                    internalKey = (++__mapSetUniqueInternalUniqueKeyCounter__) + Math.random();
                    if (writeIfUndefined) setInternalSlot(value, "__mapSetInternalUniqueKey__", internalKey);
                }
                return internalKey;
            }
            internalKey = value;
            if (typeof value === "string") internalKey = "str_" + internalKey;
            if (typeof value === "number") internalKey = "num_" + internalKey;
            if (typeof value === "boolean") internalKey = "" + internalKey;
            if (typeof value === "undefined") internalKey = "" + internalKey;
            if (value === null) internalKey = internalKey + "" + internalKey;
            return internalKey;
        }

        // ===========================================================================================================
        // Set
        // ===========================================================================================================

        // 
        // Set
        //

        setInternalSlot(SetConstructor, "Prototype", FunctionPrototype);
        setInternalSlot(SetPrototype, "Prototype", ObjectPrototype);

        setInternalSlot(SetConstructor, "Call", function Call(thisArg, argList) {
            var iterable = argList[0];
            var comparator = argList[1];
            var set = thisArg;

            if (Type(set) !== "object") return withError("Type", "set is not an object");
            if (!hasInternalSlot(set, "SetData")) return withError("Type", "SetData property missing on object");
            if (getInternalSlot(set, "SetData") !== undefined) return withError("Type", "SetData property already initialised");

            var iter;
            var hasValues, adder;
            if (iterable === undefined || iterable === null) iter = undefined;
            else {
                hasValues = HasProperty(iterable, "entries");
                if (isAbrupt(hasValues = ifAbrupt(hasValues))) return hasValues;
                if (hasValues) iter = Invoke(iterable, "entries");
                else iter = GetIterator(iterable);
                adder = Get(set, "set");
                if (isAbrupt(adder = ifAbrupt(adder))) return adder;
                if (!IsCallable(adder)) return withError("Type", "set adder (the set function) is not callable");
            }
            if (comparator !== undefined) {
                if (comparator !== "is") return withError("Range", "comparator argument has currently to be 'undefined' or 'is'");
            }

            setInternalSlot(set, "SetData", Object.create(null));
            setInternalSlot(set, "SetComparator", comparator);

            if (iter === undefined) return NormalCompletion(set);

            var next, nextItem, done, k, v, status;
            for (;;) {
                next = IteratorNext(iter);
                if (isAbrupt(next = ifAbrupt(next))) return next;
                done = IteratorComplete(next);
                if (isAbrupt(done = ifAbrupt(done))) return done;
                if (done) return NormalCompletion(set);
                nextItem = IteratorValue(next);
                if (isAbrupt(nextItem = ifAbrupt(nextItem))) return nextItem;
                k = Get(nextItem, "0");
                if (isAbrupt(k = ifAbrupt(k))) return k;
                v = Get(nextItem, "1");
                if (isAbrupt(v = ifAbrupt(v))) return v;
                status = callInternalSlot("Call", adder, set, [v]);
                if (isAbrupt(status)) return status;
            }
            return NormalCompletion(set);

        });
        setInternalSlot(SetConstructor, "Construct", function Construct(argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, args);
        });

        DefineOwnProperty(SetConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
                var F = thisArg;
                return OrdinaryCreateFromConstructor(F, "%SetPrototype%", {
                    "SetData": undefined,
                    "SetComparator": undefined
                });
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, $$toStringTag, {
            value: "Set",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, "clear", {
            value: CreateBuiltinFunction(realm, function clear(thisArg, argList) {}),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, "set", {
            value: CreateBuiltinFunction(realm, function set(thisArg, argList) {
                var value = argList[0];
                var S = thisArg;
                var same;
                if (Type(S) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no set data internal slot");

                var entries = getInternalSlot(S, "SetData");

                var comparator = getInternalSlot(S, "SetComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;


                var internalKey;

                internalKey = __checkInternalUniqueKey(value, true);

                entries[internalKey] = value;

                return NormalCompletion(S);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, "has", {
            value: CreateBuiltinFunction(realm, function has(thisArg, argList) {
                var value = argList[0];
                var S = thisArg;
                var same;
                if (Type(S) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(S, "SetData");

                var comparator = getInternalSlot(S, "SetComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;


                var internalKey;

                internalKey = __checkInternalUniqueKey(value);

                if (entries[internalKey] === value) return NormalCompletion(true);

                return NormalCompletion(false);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(SetPrototype, "delete", {
            value: CreateBuiltinFunction(realm, function _delete(thisArg, argList) {
                var value = argList[0];
                var S = thisArg;
                var same;
                if (Type(S) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(S, "SetData");

                var comparator = getInternalSlot(S, "SetComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;


                var internalKey;

                internalKey = __checkInternalUniqueKey(value);

                if (entries[internalKey] === value) {
                    entries[internalKey] = undefined;
                    delete entries[internalKey];
                    return NormalCompletion(true);
                }
                return NormalCompletion(false);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        //
        // SetIterator
        // 
        function CreateSetIterator(set, kind) {
            var S = ToObject(set);
            if (isAbrupt(S = ifAbrupt(S))) return S;
            if (!hasInternalSlot(S, "SetData")) return withError("Type", "object has no internal SetData slot");
            var entries = getInternalSlot(S, "SetData");
            var SetIteratorPrototype = Get(getIntrinsics(), "%SetIteratorPrototype%");
            var iterator = ObjectCreate(SetIteratorPrototype, {
                "IteratedSet": undefined,
                "SetNextIndex": undefined,
                "SetIterationKind": undefined
            });
            setInternalSlot(iterator, "IteratedSet", entries);
            setInternalSlot(iterator, "SetNextIndex", 0);
            setInternalSlot(iterator, "SetIterationKind", kind);
            return iterator;
        }

        DefineOwnProperty(SetIteratorPrototype, "constructor", {
            value: undefined,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetIteratorPrototype, $$toStringTag, {
            value: "Set Iterator",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetIteratorPrototype, $$iterator, {
            value: CreateBuiltinFunction(realm, function $$iterator(thisArg, argList) {
                return thisArg;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetIteratorPrototype, "next", {
            value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "the this value is not an object");
                if (!hasInternalSlot(O, "Set") || !hasInternalSlot(O, "SetNextIndex") || !hasInternalSlot(O, "SetIterationKind")) return withError("Type", "iterator has not all of the required internal properties");
                var entries = getInternalSlot(O, "Set");
                var kind = getInternalSlot(O, "SetIterationKind");
                var index = getInternalSlot(O, "SetNextIndex");
                var result;
                while (index < len) {
                    var e = entries[index];
                    index = index + 1;
                    setInternalSlot(O, "SetNextIndex", index);
                    if (e !== empty) {
                        if (kind === "key+value") {
                            Assert(kind === "key+value", "set iteration kind has to be key+value");
                            var result = ArrayCreate(2);
                            CreateDataProperty(result, "0", e);
                            CreateDataProperty(result, "1", e);
                            return CreateItrResultObject(result, false);
                        }
                        return CreateItrResultObject(e, false);
                    }
                }
                return CreateItrResultObject(undefined, true);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        // ===========================================================================================================
        // WeakMap
        // ===========================================================================================================

        // ===========================================================================================================
        // WeakSet
        // ===========================================================================================================

        // ===========================================================================================================
        // Event Emitter (nodejs emitter like with equal interfaces)
        // ===========================================================================================================

        setInternalSlot(EmitterPrototype, "Prototype", ObjectPrototype);
        setInternalSlot(EmitterConstructor, "Call", function Call(thisArg, argList) {
            var O = thisArg;
            var type = Type(O);
            var has, listeners;
            if (type === "object") {
                var has = hasInternalSlot(O, "EventListeners");
                if (!has) {
                    return withError("Type", "this argument has to have a [[Listeners]] Property");
                } else {
                    var listeners = getInternalSlot(O, "EventListeners");
                    if (!listeners) {
                        listeners = Object.create(null);
                        setInternalSlot(O, "EventListeners", listeners);

                    }
                }
            } else {
                return withError("Type", "this argument is not an object");
            }
            return O;
        });

        setInternalSlot(EmitterConstructor, "Construct", function Call(argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, args);
        });

        DefineOwnProperty(EmitterConstructor, $$create, {
            value: CreateBuiltinFunction(realm, function (thisArg, argList) {
                var F = EmitterConstructor;
                var proto = GetPrototypeFromConstructor(F, "%EmitterPrototype%");
                var O = ObjectCreate(proto, {
                    "EventListeners": undefined
                });
                return O;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterConstructor, "prototype", {
            value: EmitterPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(EmitterPrototype, "constructor", {
            value: EmitterConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "on", {
            value: CreateBuiltinFunction(realm, function on(thisArg, argList) {
                var E = thisArg,
                    listeners, callback, event;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                var event = argList[0];
                var callback = argList[1];
                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

                var list = listeners[event];
                if (list == undefined) list = listeners[event] = [];
                list.push(callback);

                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "once", {
            value: CreateBuiltinFunction(realm, function once(thisArg, argList) {
                var E = thisArg,
                    listeners, callback, event;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                var event = argList[0];
                var callback = argList[1];
                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

                var list = listeners[event];
                if (list == undefined) list = listeners[event] = [];

                list.push(
                    function (callback) {

                        return CreateBuiltinFunction(realm, function once_callback(thisArg, argList) {
                            if (callback) {
                                callInternalSlot("Call", callback, thisArg, argList);
                                callback = null;
                            }
                        });

                    }(callback)
                );

                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "remove", {
            value: CreateBuiltinFunction(realm, function remove(thisArg, argList) {

                var E = thisArg,
                    listeners, callback, event, values;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                event = argList[0];
                callback = argList[1];

                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a function.");

                var list = listeners[event];
                if (list == undefined) return NormalCompletion(undefined);

                var newList = [];
                var fn;
                for (var i = 0, j = list.length; i < j; i++) {
                    if (fn = list[i]) {
                        if (fn !== callback) newList.push(fn);
                    }
                }

                listeners[event] = newList;

                return NormalCompletion(undefined);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "removeAll", {
            value: CreateBuiltinFunction(realm, function removeAll(thisArg, argList) {
                var E = thisArg,
                    listeners, event;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                event = argList[0];

                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");

                var list = listeners[event];
                if (list == undefined) return NormalCompletion(undefined);
                else listeners[event] = [];

                return NormalCompletion(undefined);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "emit", {
            value: CreateBuiltinFunction(realm, function emit(thisArg, argList) {
                var E = thisArg,
                    listeners, callback, event, values;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");
                event = argList[0];
                values = argList.slice(1);
                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                var list = listeners[event];
                if (list == undefined) return NormalCompletion(undefined);

                //setTimeout(function () {
                var result;
                for (var i = 0, j = list.length; i < j; i++) {
                    if (callback = list[i]) {
                        result = callInternalSlot("Call", callback, thisArg, values);
                        if (isAbrupt(result)) return result;
                    }
                }
                //},0);

                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        LazyDefineBuiltinConstant(EmitterPrototype, $$toStringTag, "Emitter");


        //
        //
        //
        //

        MakeConstructor(EventConstructor, true, EventPrototype);
        MakeConstructor(EventTargetConstructor, true, EventTargetPrototype);
        MakeConstructor(MessagePortConstructor, true, MessagePortPrototype);

        var EventConstructor_Call = function (thisArg, argList) {
        };


        var EventTargetConstructor_Call = function (thisArg, argList) {
        };
        var EventTargetPrototype_addEventListener = function (thisArg, argList) {
        };
        var EventTargetPrototype_dispatchEvent = function (thisArg, argList) {
        };
        var EventTargetPrototype_removeEventListener = function (thisArg, argList) {
        };

        LazyDefineBuiltinFunction(EventTargetPrototype, "addEventListener", 3, EventTargetPrototype_addEventListener);
        LazyDefineBuiltinFunction(EventTargetPrototype, "dispatchEvent", 1, EventTargetPrototype_dispatchEvent);
        LazyDefineBuiltinFunction(EventTargetPrototype, "removeEventListener", 2, EventTargetPrototype_removeEventListener);

        var MessagePortPrototype_close = function (thisArg, argList) {
        };
        var MessagePortPrototype_open = function (thisArg, argList) {
        };
        var MessagePortPrototype_postMessage = function (thisArg, argList) {
        };

        LazyDefineBuiltinFunction(MessagePortPrototype, "close", 0, MessagePortPrototype_close);
        LazyDefineBuiltinFunction(MessagePortPrototype, "open", 0, MessagePortPrototype_open);
        LazyDefineBuiltinFunction(MessagePortPrototype, "postMessage", 0, MessagePortPrototype_postMessage);


        /* 

         ecmascript simd polyfills. 32x4 will be run sequentially here.

         */




        // ===========================================================================================================
        // Globales This erzeugen (sollte mit dem realm und den builtins 1x pro neustart erzeugt werden)
        // ===========================================================================================================

        createGlobalThis = function createGlobalThis(realm, globalThis, intrinsics) {
            SetPrototypeOf(globalThis, ObjectPrototype);
            setInternalSlot(globalThis, "Extensible", true);

            DefineOwnProperty(globalThis, "Array", GetOwnProperty(intrinsics, "%Array%"));
            DefineOwnProperty(globalThis, "ArrayBuffer", GetOwnProperty(intrinsics, "%ArrayBuffer%"));
            DefineOwnProperty(globalThis, "Boolean", GetOwnProperty(intrinsics, "%Boolean%"));
            DefineOwnProperty(globalThis, "DataView", GetOwnProperty(intrinsics, "%DataView%"));
            DefineOwnProperty(globalThis, "Date", GetOwnProperty(intrinsics, "%Date%"));
            DefineOwnProperty(globalThis, "Emitter", GetOwnProperty(intrinsics, "%Emitter%"));
            DefineOwnProperty(globalThis, "Event", GetOwnProperty(intrinsics, "%Event%"));
            DefineOwnProperty(globalThis, "EventTarget", GetOwnProperty(intrinsics, "%EventTarget%"));
            DefineOwnProperty(globalThis, "Error", GetOwnProperty(intrinsics, "%Error%"));
            DefineOwnProperty(globalThis, "EvalError", GetOwnProperty(intrinsics, "%EvalError%"));
            DefineOwnProperty(globalThis, "Function", GetOwnProperty(intrinsics, "%Function%"));
            DefineOwnProperty(globalThis, "Float32Array", GetOwnProperty(intrinsics, "%Float32Array%"));
            DefineOwnProperty(globalThis, "Float64Array", GetOwnProperty(intrinsics, "%Float64Array%"));
            DefineOwnProperty(globalThis, "GeneratorFunction", GetOwnProperty(intrinsics, "%GeneratorFunction%"));
            LazyDefineBuiltinConstant(globalThis, "Infinity", Infinity);
            DefineOwnProperty(globalThis, "Int8Array", GetOwnProperty(intrinsics, "%Int8Array%"));
            DefineOwnProperty(globalThis, "Int16Array", GetOwnProperty(intrinsics, "%Int16Array%"));
            DefineOwnProperty(globalThis, "Int32Array", GetOwnProperty(intrinsics, "%Int32Array%"));
            DefineOwnProperty(globalThis, "JSON", GetOwnProperty(intrinsics, "%JSON%"));
            DefineOwnProperty(globalThis, "Loader", GetOwnProperty(intrinsics, "%Loader%"));
            DefineOwnProperty(globalThis, "Math", GetOwnProperty(intrinsics, "%Math%"));
            DefineOwnProperty(globalThis, "Map", GetOwnProperty(intrinsics, "%Map%"));
            DefineOwnProperty(globalThis, "MessagePort", GetOwnProperty(intrinsics, "%MessagePort%"));
            DefineOwnProperty(globalThis, "Module", GetOwnProperty(intrinsics, "%Module%"));
            LazyDefineBuiltinConstant(globalThis, "NaN", NaN);
            DefineOwnProperty(globalThis, "Number", GetOwnProperty(intrinsics, "%Number%"));
            DefineOwnProperty(globalThis, "Proxy", GetOwnProperty(intrinsics, "%Proxy%"));
            DefineOwnProperty(globalThis, "RangeError", GetOwnProperty(intrinsics, "%RangeError%"));
            DefineOwnProperty(globalThis, "Realm", GetOwnProperty(intrinsics, "%Realm%"));
            DefineOwnProperty(globalThis, "ReferenceError", GetOwnProperty(intrinsics, "%ReferenceError%"));
            DefineOwnProperty(globalThis, "RegExp", GetOwnProperty(intrinsics, "%RegExp%"));
            DefineOwnProperty(globalThis, "SyntaxError", GetOwnProperty(intrinsics, "%SyntaxError%"));
            LazyDefineProperty(globalThis, "System", realm.loader);
            DefineOwnProperty(globalThis, "TypeError", GetOwnProperty(intrinsics, "%TypeError%"));
            DefineOwnProperty(globalThis, "URIError", GetOwnProperty(intrinsics, "%URIError%"));
            DefineOwnProperty(globalThis, "Object", GetOwnProperty(intrinsics, "%Object%"));
            DefineOwnProperty(globalThis, "Promise", GetOwnProperty(intrinsics, "%Promise%"));
            DefineOwnProperty(globalThis, "Reflect", GetOwnProperty(intrinsics, "%Reflect%"));
            DefineOwnProperty(globalThis, "Set", GetOwnProperty(intrinsics, "%Set%"));
            DefineOwnProperty(globalThis, "String", GetOwnProperty(intrinsics, "%String%"));
            DefineOwnProperty(globalThis, "Symbol", GetOwnProperty(intrinsics, "%Symbol%"));
            DefineOwnProperty(globalThis, "Uint8Array", GetOwnProperty(intrinsics, "%Uint8Array%"));
            DefineOwnProperty(globalThis, "Uint8ClampedArray", GetOwnProperty(intrinsics, "%Uint8ClampedArray%"));
            DefineOwnProperty(globalThis, "Uint16Array", GetOwnProperty(intrinsics, "%Uint16Array%"));
            DefineOwnProperty(globalThis, "Uint32Array", GetOwnProperty(intrinsics, "%Uint32Array%"));
            DefineOwnProperty(globalThis, "WeakMap", GetOwnProperty(intrinsics, "%WeakMap%"));
            DefineOwnProperty(globalThis, "WeakSet", GetOwnProperty(intrinsics, "%WeakSet%"));
            DefineOwnProperty(globalThis, "console", GetOwnProperty(intrinsics, "%Console%"));
            DefineOwnProperty(globalThis, "decodeURI", GetOwnProperty(intrinsics, "%DecodeURI%"));
            DefineOwnProperty(globalThis, "decodeURIComponent", GetOwnProperty(intrinsics, "%DecodeURIComponent%"));
            DefineOwnProperty(globalThis, "encodeURI", GetOwnProperty(intrinsics, "%EncodeURI%"));
            DefineOwnProperty(globalThis, "encodeURIComponent", GetOwnProperty(intrinsics, "%EncodeURIComponent%"));
            DefineOwnProperty(globalThis, "escape", GetOwnProperty(intrinsics, "%Escape%"));
            DefineOwnProperty(globalThis, "eval", GetOwnProperty(intrinsics, "%Eval%"));
            LazyDefineFalseTrueFalse(globalThis, "global", globalThis);
            DefineOwnProperty(globalThis, "isFinite", GetOwnProperty(intrinsics, "%IsFinite%"));
            DefineOwnProperty(globalThis, "isNaN", GetOwnProperty(intrinsics, "%IsNaN%"));
            DefineOwnProperty(globalThis, "load", GetOwnProperty(intrinsics, "%Load%"));
            LazyDefineBuiltinConstant(globalThis, "null", null);
            DefineOwnProperty(globalThis, "parseInt", GetOwnProperty(intrinsics, "%ParseInt%"));
            DefineOwnProperty(globalThis, "parseFloat", GetOwnProperty(intrinsics, "%ParseFloat%"));
            DefineOwnProperty(globalThis, "request", GetOwnProperty(intrinsics, "%Request%"));
            DefineOwnProperty(globalThis, "setTimeout", GetOwnProperty(intrinsics, "%SetTimeout%"));
            LazyDefineBuiltinConstant(globalThis, "undefined", undefined);
            DefineOwnProperty(globalThis, "unescape", GetOwnProperty(intrinsics, "%Unescape%"));
            LazyDefineBuiltinConstant(globalThis, $$toStringTag, "syntaxjsGlobal")




            /*
             DOM Wrapper, works for node.js process, too. Was usually able to call functions, but seems to have bug today.
             */

            if (typeof importScripts === "function") {
                DefineOwnProperty(globalThis, "self", GetOwnProperty(intrinsics, "%DOMWrapper%"));
            } else if (typeof window === "object") {
                DefineOwnProperty(globalThis, "window", GetOwnProperty(intrinsics, "%DOMWrapper%"));
                DefineOwnProperty(globalThis, "document", {
                    configurable: true,
                    enumerable: true,
                    value: globalThis.Get("window").Get("document"),
                    writable: true

                });
            } else if (typeof process === "object") {
                DefineOwnProperty(globalThis, "process", GetOwnProperty(intrinsics, "%DOMWrapper%"));
            }
            return globalThis;
        }


        LazyDefineProperty(intrinsics, "%DOMWrapper%", ExoticDOMObjectWrapper(
            typeof importScripts === "function" ? self : typeof window === "object" ? window : process)
        );

            /*
            *
            *  End of Wrapper
             */




        return intrinsics; // assignIntrinsics(intrinsics);

    } // createIntrinsics ()


    exports.createIntrinsics = createIntrinsics;
    exports.setCodeRealm = setCodeRealm;
    exports.saveCodeRealm = saveCodeRealm;
    exports.restoreCodeRealm = restoreCodeRealm;

    return exports;
});

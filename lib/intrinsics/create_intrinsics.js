/**
 *  This is included ___inside__ of lib/api.js (!!! inside the function !!!)
 *
 *  The function createIntrinsics is stored in /lib/create_intrinsics
 *
 *  It contains still functions which belong into the "api.js" part.
 *
 *  There is a lot to do.
 *
 */
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


//#include "lib/intrinsics/console.js";
//#include "lib/intrinsics/array.js";
//#include "lib/intrinsics/arrayiterator.js";
//#include "lib/intrinsics/string.js";
//#include "lib/intrinsics/stringiterator.js";
//#include "lib/intrinsics/boolean.js";
//#include "lib/intrinsics/symbol.js";
//#include "lib/intrinsics/error.js";
//#include "lib/intrinsics/date.js";


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


//#include "lib/intrinsics/object.js";


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

/*
*
*
*  End of "lib/create_intrinsics.js"
*
*
 */
/*
    API contains ecma-262 specification devices

    it includes the complete /lib/api/ and /lib/intrinsics/ subdirecories
    with /tools/includefiles.js

 */


define("api", function (require, exports, module) {

    "use strict";

    var heap = require("heap");
    var i18n = require("i18n-messages");


    var realm;
    var intrinsics;
    var globalEnv;
    var globalThis;
    var stack;
    var eventQueue;
    var cx;


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

    var ExpectedArgumentCount = statics.ExpectedArgumentCount;
    var ModuleRequests = statics.ModuleRequests;
    
        var dupesInTheTwoLists = statics.dupesInTheTwoLists; // self defined
    
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


//#include "lib/api/my_essential_helpers.js";
//#include "lib/api/math.js";
//#include "lib/api/assert.js";
//#include "lib/api/coderealm.js";
//#include "lib/api/executioncontext.js";
//#include "lib/api/completionrecord.js";
//#include "lib/api/reference.js";
//#include "lib/api/object.js";
//#include "lib/api/declarativeenvironment.js";
//#include "lib/api/identifierbinding.js";
//#include "lib/api/functionenvironment.js";
//#include "lib/api/objectenvironment.js";
//#include "lib/api/globalenvironment.js";
//#include "lib/api/conversions.js";
//#include "lib/api/comparisons.js";
//#include "lib/api/propertydescriptor.js";
//#include "lib/api/getownproperty.js";
//#include "lib/api/objectmethods.js";
//#include "lib/api/function.js";
//#include "lib/api/supermethods.js";
//#include "lib/api/array.js";

//#include "lib/api/encode.js";
//#include "lib/api/date.js";
//#include "lib/api/generator.js";
//#include "lib/api/iterator.js";
//#include "lib/api/arraybuffer.js";
//#include "lib/api/integerindexedexoticobject.js";
//#include "lib/api/exoticdomwrapper.js";

//#include "lib/api/symbolprimitivetype.js";
//#include "lib/api/stringexoticobject.js";
//#include "lib/api/number.js";
//#include "lib/api/boolean.js";
//#include "lib/api/arrayexoticobject.js";
//#include "lib/api/argumentsexoticobject.js";
//#include "lib/api/proxyexoticobject.js";
//#include "lib/api/taskqueue.js";
//#include "lib/api/loader.js";
//#include "lib/api/module.js";
//#include "lib/api/linkedlist.js";
//#include "lib/api/structuredclone.js";

//#include "lib/api/structtypes.js";

    var createGlobalThis, createIntrinsics;

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
        var func = OrdinaryFunction();
        define_intrinsic(intrinsics, intrinsicName, func);
        SetFunctionName(func, name);
        SetFunctionLength(func, len);
        setInternalSlot(func, "Construct", undefined)
        return func;
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

    /*
     Here goes the big wrapping closure for createIntrinsics();    (tmp)
     */

    createIntrinsics = function createIntrinsics(realm) {
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

        var DebugFunction = createIntrinsicFunction(intrinsics, "debug", 1, "%DebugFunction%");

        var StructTypeConstructor = createIntrinsicConstructor(intrinsics, "StructType", 0, "%StructType%");
        var StructTypePrototype = createIntrinsicPrototype(intrinsics, "%StructTypePrototype%");


        // ===========================================================================================================
        // %ThrowTypeError%
        // ===========================================================================================================

        var ThrowTypeError = FunctionAllocate(FunctionPrototype);
        setInternalSlot(ThrowTypeError, "Call", function (thisArg, argList) {
            return withError("Type", "The system is supposed to throw a Type Error with %ThrowTypeError% here.");
        });
        setInternalSlot(ThrowTypeError, "Construct", undefined);


//#include "lib/intrinsics/debug_load_request.js";
//#include "lib/intrinsics/realm.js";
//#include "lib/intrinsics/loader.js";
//#include "lib/intrinsics/console.js";
//#include "lib/intrinsics/array.js";
//#include "lib/intrinsics/arrayiterator.js";
//#include "lib/intrinsics/string.js";
//#include "lib/intrinsics/stringiterator.js";
//#include "lib/intrinsics/boolean.js";
//#include "lib/intrinsics/symbol.js";
//#include "lib/intrinsics/error.js";
//#include "lib/intrinsics/date.js";
//#include "lib/intrinsics/encodeuri.js";
//#include "lib/intrinsics/escape.js";
//#include "lib/intrinsics/parseint.js";
//#include "lib/intrinsics/math.js";
//#include "lib/intrinsics/number.js";
//#include "lib/intrinsics/proxy.js";
//#include "lib/intrinsics/reflect.js";
//#include "lib/intrinsics/isnan.js";
//#include "lib/intrinsics/object.js";
//#include "lib/intrinsics/objectobserve.js";
//#include "lib/intrinsics/function.js";
//#include "lib/intrinsics/generator.js";
//#include "lib/intrinsics/json.js";
//#include "lib/intrinsics/promises.js";
//#include "lib/intrinsics/regexp.js";
//#include "lib/intrinsics/arraybuffer.js";
//#include "lib/intrinsics/dataview.js";
//#include "lib/intrinsics/typedarray.js";
//#include "lib/intrinsics/settimeout.js";
//#include "lib/intrinsics/map.js";
//#include "lib/intrinsics/mapiterator.js";
//#include "lib/intrinsics/set.js";
//#include "lib/intrinsics/setiterator.js";
//#include "lib/intrinsics/emitter.js";

//#include "lib/intrinsics/structtypes.js";


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

            DefineOwnProperty(globalThis, "StructType", GetOwnProperty(intrinsics, "%StrucType%"));

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
            DefineOwnProperty(globalThis, "debug", GetOwnProperty(intrinsics, "%DebugFunction%"));
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
            LazyDefineBuiltinConstant(globalThis, $$toStringTag, "syntaxjs")
/*

        if (typeof Java !== "function" && typeof load !== "function" && typeof print !== "function") {

	    LazyDefineProperty(intrinsics, "%DOMWrapper%", ExoticDOMObjectWrapper(
    		typeof importScripts === "function" ? self : typeof window === "object" ? window : process)
    	    );
        }
        
        
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
            
            */
            return globalThis;
        }

        return intrinsics;
    }



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
    exports.uriReserved = uriReserved;
    exports.uriUnescaped = uriUnescaped;
    exports.Encode = Encode;
    exports.Decode = Decode;
    exports.UTF8Encode = UTF8Encode;
    exports.SetFunctionName = SetFunctionName;
    exports.HasOwnProperty = HasOwnProperty;
    exports.Put = Put;
    exports.Invoke = Invoke;


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



    exports.withError = withError; // This Function returns the Errors, say the spec says "Throw a TypeError", then return withError("Type", message);
    
    
    // my own definitions between the ecma stuff
    exports.SetFunctionLength = SetFunctionLength;
    exports.LazyDefineProperty = LazyDefineProperty;

    exports.createIntrinsics = createIntrinsics;
    exports.setCodeRealm = setCodeRealm;
    exports.saveCodeRealm = saveCodeRealm;
    exports.restoreCodeRealm = restoreCodeRealm;
    exports.Push = Push;
    exports.Length = Length;
    exports.getField = getField;
    exports.setField = setField;
    exports.setRec = setRec;
    exports.getRec = getRec;
    exports.genericArray = genericArray;
    exports.genericRecord = genericRecord;
    exports.getEventQueue = getEventQueue;

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

    exports.printException = printException;
    exports.makeMyExceptionText = makeMyExceptionText;
    exports.List = List;



    return exports;
});

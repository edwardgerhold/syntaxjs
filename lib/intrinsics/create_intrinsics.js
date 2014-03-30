/**
 * lib/intrinsics/create_intrinsics.js
 *
 *
 *  This is included ___inside__ of lib/api.js (!!! inside the function !!!)
 *
 *  And this file includes the whole standard library (later it will include
 *  the definitions, while the _call functions are collected outside of the
 *  create intrinsics closure.
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


/*
  Here goes the big wrapping closure for createIntrinsics();

  Refactoring: The _call functions have to be moved out of
   their construction files again into a primary library and
   the remaining defineOwnProperties have to stay within
   createIntrinsics

   It´s easily overseeable after splitting the files, but
   i know this already and won´t forget to do sooner or later
   but will.

 */

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

    /*
        all these files should be split into 2 files
        one which defines them,
        and one which just saves the _call functions
        which are inserted in the definition, which
        won´t be recreated on a new call to createIntrinsics then.
        don´t forget.

     */

//#include "lib/intrinsics/own_load_request.js";

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
    // DataView
    // ===========================================================================================================


//#include "lib/intrinsics/map.js";
//#include "lib/intrinsics/mapiterator.js";
//#include "lib/intrinsics/set.js";
//#include "lib/intrinsics/setiterator.js";

//#include "lib/intrinsics/emitter.js";

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
        LazyDefineBuiltinConstant(globalThis, $$toStringTag, "syntaxjs")




    /*
         DOM Wrapper, works for node.js process, too. Was usually able to call functions,
         but seems to have bug today.                                           ----------------------
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
     *  End of DOM Wrapper --------------------------------------------------------------------
     */

    return intrinsics; // assignIntrinsics(intrinsics);

} // createIntrinsics ()

/*
*  End of "lib/create_intrinsics.js"
 */
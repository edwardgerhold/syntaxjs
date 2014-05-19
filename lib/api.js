/*
 API contains ecma-262 specification devices

 it includes the complete /lib/api/ and /lib/intrinsics/ subdirectories
 with /tools/inlinefiles.js

 refactoring for typed memory is on the list and i´m working towards.

 */


define("api", function (require, exports) {
    "use strict";

    var realm;
    var intrinsics;
    var globalEnv;
    var globalThis;
    var stack;
    var eventQueue;

    var _call = Function.prototype.call;   // I´ve seen little of jquery conf
    var _bind = Function.prototype.bind;
    var objectHasOwnProperty = _call.bind(Object.prototype.hasOwnProperty);
    var arraySlice = _call.bind(Array.prototype.slice);
    // gotta find and replace the rest, this gets a compiler, etc, it´s worth to do.

    var intl = require("i18n");
    var format = intl.format;
    var formatStr = intl.formatStr;
    var trans = intl.trans;

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

    var detector = require("detector");
    var hasConsole = detector.hasConsole;
    var hasPrint = detector.hasPrint;
    var isNode = detector.isNode;
    var isWindow = detector.isWindow;
    var isWorker = detector.isWorker;

    function debug() {
        if (debugmode && hasConsole) console.log.apply(console, arguments);
    }
    function debug2() {
        if (hasConsole) console.log.apply(console, arguments);
    }
    function debugdir() {
        if (debugmode && hasConsole) console.dir.apply(console, arguments);
    }

    /*
     These include files include the main ecma 262 abstract operations.
     */

//#include "lib/api/my_essential_helpers.js";
//#include "lib/api/slots.js";
//#include "lib/api/intrinsics.js";
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
//#include "lib/api/observe.js";
//#include "lib/api/function.js";
//#include "lib/api/supermethods.js";
//#include "lib/api/argumentsexoticobject.js";
//#include "lib/api/array.js";
//#include "lib/api/arrayiterator.js";
//#include "lib/api/arrayexoticobject.js";
//#include "lib/api/encode.js";
//#include "lib/api/date.js";
//#include "lib/api/dataview.js";
//#include "lib/api/generator.js";
//#include "lib/api/iterator.js";
//#include "lib/api/arraybuffer.js";
//#include "lib/api/integerindexedexoticobject.js";
//#include "lib/api/typedarray.js";
//#include "lib/api/exoticdomwrapper.js";
//#include "lib/api/symbolprimitivetype.js";
//#include "lib/api/stringexoticobject.js";
//#include "lib/api/string.js";
//#include "lib/api/stringiterator.js";
//#include "lib/api/number.js";
//#include "lib/api/parseint.js";
//#include "lib/api/boolean.js";
//#include "lib/api/proxyexoticobject.js";
//#include "lib/api/taskqueue.js";
//#include "lib/api/loader.js";
//#include "lib/api/eval.js";
//#include "lib/api/module.js";
//#include "lib/api/linkedlist.js";
//#include "lib/api/regexp.js";
//#include "lib/api/structuredclone.js";
//#include "lib/api/structtypes.js";
//#include "lib/api/reflect.js";
//#include "lib/api/promise.js";
//#include "lib/api/map.js";
//#include "lib/api/mapiterator.js";
//#include "lib/api/set.js";
//#include "lib/api/setiterator.js";
//#include "lib/api/settimeout.js";
//#include "lib/api/loaderiterator.js";
//#include "lib/api/isnan.js";
//#include "lib/api/json.js";
//#include "lib/api/escape.js";
//#include "lib/api/error.js";
//#include "lib/api/emitter.js";
//#include "lib/api/print_debug_load_and_request.js";
//#include "lib/api/console.js";
//#include "lib/api/realm.js";

    var createGlobalThis, createIntrinsics;

    function define_intrinsic(intrinsics, intrinsicName, value) {
        var descriptor = {
            configurable: true,
            enumerable: true,
            value: value,
            writable: true
        };
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, intrinsics, intrinsicName, descriptor);
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
        setInternalSlot(func, SLOTS.CONSTRUCT, undefined);
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
    createIntrinsics = function createIntrinsics(realm) {
        var intrinsics = OrdinaryObject(null);
        realm.intrinsics = intrinsics;
        var ObjectPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.OBJECTPROTOTYPE);
        setInternalSlot(ObjectPrototype, SLOTS.PROTOTYPE, null);
        var FunctionPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.FUNCTIONPROTOTYPE);
        setInternalSlot(FunctionPrototype, SLOTS.PROTOTYPE, ObjectPrototype);
        var FunctionConstructor = createIntrinsicConstructor(intrinsics, "Function", 1, INTRINSICS.FUNCTION);
        setInternalSlot(FunctionConstructor, SLOTS.PROTOTYPE, FunctionPrototype);
        var ObjectConstructor = createIntrinsicConstructor(intrinsics, "Object", 0, INTRINSICS.OBJECT);
        Assert(getInternalSlot(ObjectConstructor, SLOTS.PROTOTYPE) === FunctionPrototype, "ObjectConstructor and FunctionPrototype have to have a link");
        var EncodeURIFunction = createIntrinsicFunction(intrinsics, "encodeURI", 1, INTRINSICS.ENCODEURI);
        var DecodeURIFunction = createIntrinsicFunction(intrinsics, "ecodeURI", 1, INTRINSICS.DECODEURI);
        var EncodeURIComponentFunction = createIntrinsicFunction(intrinsics, "encodeURIComponent", 1, INTRINSICS.ENCODEURICOMPONENT);
        var DecodeURIComponentFunction = createIntrinsicFunction(intrinsics, "decodeURIComponent", 1, INTRINSICS.DECODEURICOMPONENT);
        var SetTimeoutFunction = createIntrinsicFunction(intrinsics, "setTimeout", 2, INTRINSICS.SETTIMEOUT);
        var SetImmediateFunction = createIntrinsicFunction(intrinsics, "setImmediate", 1, INTRINSICS.SETIMMEDIATE);
        var IsNaNFunction = createIntrinsicFunction(intrinsics, "isNaN", 1, INTRINSICS.ISNAN);
        var IsFiniteFunction = createIntrinsicFunction(intrinsics, "isFinite", 1, INTRINSICS.ISFINITE);
        var ParseFloatFunction = createIntrinsicFunction(intrinsics, "parseFloat", 1, INTRINSICS.PARSEFLOAT);
        var ParseIntFunction = createIntrinsicFunction(intrinsics, "parseInt", 1, INTRINSICS.PARSEINT);
        var EscapeFunction = createIntrinsicFunction(intrinsics, "escape", 1, INTRINSICS.ESCAPE);
        var UnescapeFunction = createIntrinsicFunction(intrinsics, "unescape", 1, INTRINSICS.UNESCAPE);
        var EvalFunction = createIntrinsicFunction(intrinsics, "eval", 1, INTRINSICS.EVAL);
        var GeneratorFunction = createIntrinsicFunction(intrinsics, "Generator", 0, INTRINSICS.GENERATORFUNCTION);
        var LoadFunction = createIntrinsicFunction(intrinsics, "load", 1, INTRINSICS.LOAD);
        var RequestFunction = createIntrinsicFunction(intrinsics, "request", 0, INTRINSICS.REQUEST);
        var ModuleFunction = createIntrinsicFunction(intrinsics, "Module", 0, INTRINSICS.MODULE);
        var SymbolFunction = createIntrinsicFunction(intrinsics, "Symbol", 0, INTRINSICS.SYMBOL);
        var RegExpConstructor = createIntrinsicConstructor(intrinsics, "RegExp", 0, INTRINSICS.REGEXP);
        var RegExpPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.REGEXPPROTOTYPE);
        var ProxyConstructor = createIntrinsicConstructor(intrinsics, "Proxy", 0, INTRINSICS.PROXY);
        var ProxyPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.PROXYPROTOTYPE);
        var BooleanConstructor = createIntrinsicConstructor(intrinsics, "Boolean", 0, INTRINSICS.BOOLEAN);
        var BooleanPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.BOOLEANPROTOTYPE);
        var NumberConstructor = createIntrinsicConstructor(intrinsics, "Number", 0, INTRINSICS.NUMBER);
        var NumberPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.NUMBERPROTOTYPE);
        var StringConstructor = createIntrinsicConstructor(intrinsics, "String", 0, INTRINSICS.STRING);
        var StringPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.STRINGPROTOTYPE);
        var StringIteratorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.STRINGITERATORPROTOTYPE);
        var DateConstructor = createIntrinsicConstructor(intrinsics, "Date", 0, INTRINSICS.DATE);
        var DatePrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.DATEPROTOTYPE);
        var ErrorConstructor = createIntrinsicConstructor(intrinsics, "Error", 0, INTRINSICS.ERROR);
        var ErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.ERRORPROTOTYPE);
        var ArrayConstructor = createIntrinsicConstructor(intrinsics, "Array", 0, INTRINSICS.ARRAY);
        var ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.ARRAYPROTOTYPE);
        var ArrayIteratorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.ARRAYITERATORPROTOTYPE);
        var GeneratorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.GENERATORPROTOTYPE);
        var GeneratorObject = createIntrinsicObject(intrinsics, INTRINSICS.GENERATOR);
        var ReflectObject = createIntrinsicObject(intrinsics, INTRINSICS.REFLECT);
        var SymbolPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.SYMBOLPROTOTYPE);
        var TypeErrorConstructor = createIntrinsicConstructor(intrinsics, "TypeError", 0, INTRINSICS.TYPEERROR);
        var TypeErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.TYPEERRORPROTOTYPE);
        var ReferenceErrorConstructor = createIntrinsicConstructor(intrinsics, "ReferenceError", 0, INTRINSICS.REFERENCEERROR);
        var ReferenceErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.REFERENCEERRORPROTOTYPE);
        var SyntaxErrorConstructor = createIntrinsicConstructor(intrinsics, "SyntaxError", 0, INTRINSICS.SYNTAXERROR);
        var SyntaxErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.SYNTAXERRORPROTOTYPE);
        var RangeErrorConstructor = createIntrinsicConstructor(intrinsics, "RangeError", 0, INTRINSICS.RANGEERROR);
        var RangeErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.RANGEERRORPROTOTYPE);
        var EvalErrorConstructor = createIntrinsicConstructor(intrinsics, "EvalError", 0, INTRINSICS.EVALERROR);
        var EvalErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.EVALERRORPROTOTYPE);
        var URIErrorConstructor = createIntrinsicConstructor(intrinsics, "URIError", 0, INTRINSICS.URIERROR);
        var URIErrorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.URIERRORPROTOTYPE);
        var PromiseConstructor = createIntrinsicConstructor(intrinsics, "Promise", 1, INTRINSICS.PROMISE);
        var PromisePrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.PROMISEPROTOTYPE);
        var WeakMapConstructor = createIntrinsicConstructor(intrinsics, "WeakMap", 0, INTRINSICS.WEAKMAP);
        var WeakMapPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.WEAKMAPPROTOTYPE);
        var WeakSetConstructor = createIntrinsicConstructor(intrinsics, "WeakSet", 0, INTRINSICS.WEAKSET);
        var WeakSetPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.WEAKSETPROTOTYPE);
        var MapConstructor = createIntrinsicConstructor(intrinsics, "Map", 0, INTRINSICS.MAP);
        var MapPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.MAPPROTOTYPE);
        var MapIteratorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.MAPITERATORPROTOTYPE);
        var SetConstructor = createIntrinsicConstructor(intrinsics, "Set", 0, INTRINSICS.SET);
        var SetPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.SETPROTOTYPE);
        var SetIteratorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.SETITERATORPROTOTYPE);
        var TypedArrayConstructor = createIntrinsicConstructor(intrinsics, "TypedArray", 0, INTRINSICS.TYPEDARRAY);
        var TypedArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.TYPEDARRAYPROTOTYPE);
        var Uint8ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint8Array", 1, INTRINSICS.UINT8ARRAY);
        var Int8ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int8Array", 1, INTRINSICS.INT8ARRAY);
        var Uint8ClampedArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint8ClampedArray", 1, INTRINSICS.UINT8CLAMPEDARRAY);
        var Int16ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int16Array", 1, INTRINSICS.INT16ARRAY);
        var Uint16ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint16Array", 1, INTRINSICS.UINT16ARRAY);
        var Int32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int32Array", 1, INTRINSICS.INT32ARRAY);
        var Uint32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint32Array", 1, INTRINSICS.UINT32ARRAY);
        var Float32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Float32Array", 1, INTRINSICS.FLOAT32ARRAY);
        var Float64ArrayConstructor = createIntrinsicConstructor(intrinsics, "Float64Array", 1, INTRINSICS.FLOAT64ARRAY);
        var Uint8ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.UINT8ARRAYPROTOTYPE);
        var Int8ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.INT8ARRAYPROTOTYPE);
        var Uint8ClampedArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.UINT8CLAMPEDARRAYPROTOTYPE);
        var Int16ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.INT16ARRAYPROTOTYPE);
        var Uint16ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.UINT16ARRAYPROTOTYPE);
        var Int32ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.INT32ARRAYPROTOTYPE);
        var Uint32ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.UINT32ARRAYPROTOTYPE);
        var Float32ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.FLOAT32ARRAYPROTOTYPE);
        var Float64ArrayPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.FLOAT64ARRAYPROTOTYPE);
        var ArrayBufferConstructor = createIntrinsicConstructor(intrinsics, "ArrayBuffer", 1, INTRINSICS.ARRAYBUFFER);
        var ArrayBufferPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.ARRAYBUFFERPROTOTYPE);
        var DataViewConstructor = createIntrinsicConstructor(intrinsics, "DataView", 1, INTRINSICS.DATAVIEW);
        var DataViewPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.DATAVIEWPROTOTYPE);
        var JSONObject = createIntrinsicObject(intrinsics, INTRINSICS.JSON);
        var MathObject = createIntrinsicObject(intrinsics, INTRINSICS.MATH);
        var ConsoleObject = createIntrinsicObject(intrinsics, INTRINSICS.CONSOLE);
        var EmitterConstructor = createIntrinsicConstructor(intrinsics, "Emitter", 0, INTRINSICS.EMITTER);
        var EmitterPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.EMITTERPROTOTYPE);
        var NotifierPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.NOTIFIERPROTOTYPE);
        var LoaderConstructor = createIntrinsicConstructor(intrinsics, "Loader", 0, INTRINSICS.LOADER);
        var LoaderPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.LOADERPROTOTYPE);
        var LoaderIteratorPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.LOADERITERATORPROTOTYPE);
        var RealmConstructor = createIntrinsicConstructor(intrinsics, "Realm", 0, INTRINSICS.REALM);
        var RealmPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.REALMPROTOTYPE);
        var ModulePrototype = null;
        var EventConstructor = createIntrinsicConstructor(intrinsics, "Event", 0, INTRINSICS.EVENT);         // EventTarget and MessagePort are just stubs yet.
        var EventPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.EVENTPROTOTYPE);
        var EventTargetConstructor = createIntrinsicConstructor(intrinsics, "EventTarget", 0, INTRINSICS.EVENTTARGET);
        var EventTargetPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.EVENTTARGETPROTOTYPE);
        var MessagePortConstructor = createIntrinsicConstructor(intrinsics, "MessagePort", 0, INTRINSICS.MESSAGEPORT);
        var MessagePortPrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.MESSAGEPORTPROTOTYPE);
        var DebugFunction = createIntrinsicFunction(intrinsics, "debug", 1, INTRINSICS.DEBUGFUNCTION);
        var PrintFunction = createIntrinsicFunction(intrinsics, "print", 1, INTRINSICS.PRINTFUNCTION);
        var StructTypeConstructor = createIntrinsicConstructor(intrinsics, "StructType", 0, INTRINSICS.STRUCTTYPE);
        var StructTypePrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.STRUCTTYPEPROTOTYPE);
        var TypeConstructor = createIntrinsicConstructor(intrinsics, "Type", 0, INTRINSICS.TYPE);
        var TypePrototype = createIntrinsicPrototype(intrinsics, INTRINSICS.TYPEPROTOTYPE);
        var ThrowTypeError = createIntrinsicFunction(intrinsics, "ThrowTypeError", 0, INTRINSICS.THROWTYPEERROR);
        var ArrayProto_values = createIntrinsicFunction(intrinsics, "values", 0, INTRINSICS.ARRAYPROTO_VALUES);
        var VMObject = createIntrinsicObject(intrinsics,INTRINSICS.VM); // that i can play with from inside the shell, too.
        var defaultCompareFn = createIntrinsicFunction(intrinsics, "compare", 2, INTRINSICS.DEFAULTCOMPARE)
        var ThrowTypeError_Call = function (thisArg, argList) {
            return newTypeError(format("THROW_TYPE_ERROR"));
        };
        setInternalSlot(ThrowTypeError, SLOTS.CALL, ThrowTypeError_Call);
        setInternalSlot(ThrowTypeError, SLOTS.CONSTRUCT, undefined);
        var SetLanguage_Call = function (thisArg, argList) {
            try {var languages = require("i18n").languages;}
            catch (ex) {return newTypeError(ex.message);}
            if (argList.length === 0) {
                var status = callInternalSlot(SLOTS.CALL, PrintFunction, undefined, [format("AVAILABLE_LANGUAGES")])
                if (isAbrupt(status)) return status;
                for (var lang in languages) {
                    if (objectHasOwnProperty(languages, lang)) {
                        status = callInternalSlot(SLOTS.CALL, PrintFunction, undefined, [lang]);
                        if (isAbrupt(status)) return status;
                    }
                }
                return NormalCompletion(undefined);
            }
            var lang = ToString(argList[0]);
            if (isAbrupt(lang=ifAbrupt(lang))) return lang;
            try {require("i18n").setLang(lang);}
            catch (ex) {return newTypeError(ex.message);}
            return NormalCompletion(undefined);
        };
        var SetLanguage = createIntrinsicFunction(intrinsics, "setLanguage", 1, INTRINSICS.SETLANGUAGE)
        setInternalSlot(SetLanguage, SLOTS.CALL, SetLanguage_Call);
        setInternalSlot(SetLanguage, SLOTS.CONSTRUCT, undefined);
        // maybe it´s best on: Reflect.
//#include "lib/intrinsics/debug_load_request.js";
//#include "lib/intrinsics/realm.js";
//#include "lib/intrinsics/loader.js";
//#include "lib/intrinsics/loaderiterator.js";
//#include "lib/intrinsics/console.js";
//#include "lib/intrinsics/array.js";
//#include "lib/intrinsics/arrayiterator.js";
//#include "lib/intrinsics/string.js";
//#include "lib/intrinsics/stringiterator.js";
//#include "lib/intrinsics/boolean.js";
//#include "lib/intrinsics/symbol.js";
//#include "lib/intrinsics/error.js";
//#include "lib/intrinsics/eval.js";
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
//#include "lib/intrinsics/vm.js";
        createGlobalThis = function createGlobalThis(realm, globalThis, intrinsics) {
            SetPrototypeOf(globalThis, ObjectPrototype);
            setInternalSlot(globalThis, SLOTS.EXTENSIBLE, true);
            DefineOwnProperty(globalThis, "Array", GetOwnProperty(intrinsics, INTRINSICS.ARRAY));
            DefineOwnProperty(globalThis, "ArrayBuffer", GetOwnProperty(intrinsics, INTRINSICS.ARRAYBUFFER));
            DefineOwnProperty(globalThis, "Boolean", GetOwnProperty(intrinsics, INTRINSICS.BOOLEAN));
            DefineOwnProperty(globalThis, "DataView", GetOwnProperty(intrinsics, INTRINSICS.DATAVIEW));
            DefineOwnProperty(globalThis, "Date", GetOwnProperty(intrinsics, INTRINSICS.DATE));
            DefineOwnProperty(globalThis, "Emitter", GetOwnProperty(intrinsics, INTRINSICS.EMITTER));
            DefineOwnProperty(globalThis, "Event", GetOwnProperty(intrinsics, INTRINSICS.EVENT));
            DefineOwnProperty(globalThis, "EventTarget", GetOwnProperty(intrinsics, INTRINSICS.EVENTTARGET));
            DefineOwnProperty(globalThis, "Error", GetOwnProperty(intrinsics, INTRINSICS.ERROR));
            DefineOwnProperty(globalThis, "EvalError", GetOwnProperty(intrinsics, INTRINSICS.EVALERROR));
            DefineOwnProperty(globalThis, "Function", GetOwnProperty(intrinsics, INTRINSICS.FUNCTION));
            DefineOwnProperty(globalThis, "Float32Array", GetOwnProperty(intrinsics, INTRINSICS.FLOAT32ARRAY));
            DefineOwnProperty(globalThis, "Float64Array", GetOwnProperty(intrinsics, INTRINSICS.FLOAT64ARRAY));
            DefineOwnProperty(globalThis, "GeneratorFunction", GetOwnProperty(intrinsics, INTRINSICS.GENERATORFUNCTION));
            LazyDefineBuiltinConstant(globalThis, "Infinity", Infinity);
            DefineOwnProperty(globalThis, "Int8Array", GetOwnProperty(intrinsics, INTRINSICS.INT8ARRAY));
            DefineOwnProperty(globalThis, "Int16Array", GetOwnProperty(intrinsics, INTRINSICS.INT16ARRAY));
            DefineOwnProperty(globalThis, "Int32Array", GetOwnProperty(intrinsics, INTRINSICS.INT32ARRAY));
            DefineOwnProperty(globalThis, "JSON", GetOwnProperty(intrinsics, INTRINSICS.JSON));
            DefineOwnProperty(globalThis, "Loader", GetOwnProperty(intrinsics, INTRINSICS.LOADER));
            DefineOwnProperty(globalThis, "Math", GetOwnProperty(intrinsics, INTRINSICS.MATH));
            DefineOwnProperty(globalThis, "Map", GetOwnProperty(intrinsics, INTRINSICS.MAP));
            DefineOwnProperty(globalThis, "MessagePort", GetOwnProperty(intrinsics, INTRINSICS.MESSAGEPORT));
            DefineOwnProperty(globalThis, "Module", GetOwnProperty(intrinsics, INTRINSICS.MODULE));
            LazyDefineBuiltinConstant(globalThis, "NaN", NaN);
            DefineOwnProperty(globalThis, "Number", GetOwnProperty(intrinsics, INTRINSICS.NUMBER));
            DefineOwnProperty(globalThis, "Proxy", GetOwnProperty(intrinsics, INTRINSICS.PROXY));
            DefineOwnProperty(globalThis, "RangeError", GetOwnProperty(intrinsics, INTRINSICS.RANGEERROR));
            DefineOwnProperty(globalThis, "Realm", GetOwnProperty(intrinsics, INTRINSICS.REALM));
            DefineOwnProperty(globalThis, "ReferenceError", GetOwnProperty(intrinsics, INTRINSICS.REFERENCEERROR));
            DefineOwnProperty(globalThis, "RegExp", GetOwnProperty(intrinsics, INTRINSICS.REGEXP));
            DefineOwnProperty(globalThis, "StructType", GetOwnProperty(intrinsics, INTRINSICS.STRUCTTYPE));
            DefineOwnProperty(globalThis, "SyntaxError", GetOwnProperty(intrinsics, INTRINSICS.SYNTAXERROR));
            LazyDefineProperty(globalThis, "System", realm.loader);
            DefineOwnProperty(globalThis, "TypeError", GetOwnProperty(intrinsics, INTRINSICS.TYPEERROR));
            DefineOwnProperty(globalThis, "URIError", GetOwnProperty(intrinsics, INTRINSICS.URIERROR));
            DefineOwnProperty(globalThis, "Object", GetOwnProperty(intrinsics, INTRINSICS.OBJECT));
            DefineOwnProperty(globalThis, "Promise", GetOwnProperty(intrinsics, INTRINSICS.PROMISE));
            DefineOwnProperty(globalThis, "Reflect", GetOwnProperty(intrinsics, INTRINSICS.REFLECT));
            DefineOwnProperty(globalThis, "Set", GetOwnProperty(intrinsics, INTRINSICS.SET));
            DefineOwnProperty(globalThis, "String", GetOwnProperty(intrinsics, INTRINSICS.STRING));
            DefineOwnProperty(globalThis, "Symbol", GetOwnProperty(intrinsics, INTRINSICS.SYMBOL));
            DefineOwnProperty(globalThis, "Uint8Array", GetOwnProperty(intrinsics, INTRINSICS.UINT8ARRAY));
            DefineOwnProperty(globalThis, "Uint8ClampedArray", GetOwnProperty(intrinsics, INTRINSICS.UINT8CLAMPEDARRAY));
            DefineOwnProperty(globalThis, "Uint16Array", GetOwnProperty(intrinsics, INTRINSICS.UINT16ARRAY));
            DefineOwnProperty(globalThis, "Uint32Array", GetOwnProperty(intrinsics, INTRINSICS.UINT32ARRAY));
            DefineOwnProperty(globalThis, "WeakMap", GetOwnProperty(intrinsics, INTRINSICS.MAP));
            DefineOwnProperty(globalThis, "WeakSet", GetOwnProperty(intrinsics, INTRINSICS.SET));
            DefineOwnProperty(globalThis, "console", GetOwnProperty(intrinsics, INTRINSICS.CONSOLE));
            DefineOwnProperty(globalThis, "debug", GetOwnProperty(intrinsics, INTRINSICS.DEBUGFUNCTION));
            DefineOwnProperty(globalThis, "decodeURI", GetOwnProperty(intrinsics, INTRINSICS.DECODEURI));
            DefineOwnProperty(globalThis, "decodeURIComponent", GetOwnProperty(intrinsics, INTRINSICS.DECODEURICOMPONENT));
            DefineOwnProperty(globalThis, "encodeURI", GetOwnProperty(intrinsics, INTRINSICS.ENCODEURI));
            DefineOwnProperty(globalThis, "encodeURIComponent", GetOwnProperty(intrinsics, INTRINSICS.ENCODEURICOMPONENT));
            DefineOwnProperty(globalThis, "escape", GetOwnProperty(intrinsics, INTRINSICS.ESCAPE));
            DefineOwnProperty(globalThis, "eval", GetOwnProperty(intrinsics, INTRINSICS.EVAL));
            LazyDefineBuiltinConstant(globalThis, "global", globalThis);
            DefineOwnProperty(globalThis, "isFinite", GetOwnProperty(intrinsics, INTRINSICS.ISFINITE));
            DefineOwnProperty(globalThis, "isNaN", GetOwnProperty(intrinsics, INTRINSICS.ISNAN));
            DefineOwnProperty(globalThis, "load", GetOwnProperty(intrinsics, INTRINSICS.LOAD));
            DefineOwnProperty(globalThis, "parseInt", GetOwnProperty(intrinsics, INTRINSICS.PARSEINT));
            DefineOwnProperty(globalThis, "parseFloat", GetOwnProperty(intrinsics, INTRINSICS.PARSEFLOAT));
            DefineOwnProperty(globalThis, "print", GetOwnProperty(intrinsics, INTRINSICS.PRINTFUNCTION));
            DefineOwnProperty(globalThis, "request", GetOwnProperty(intrinsics, INTRINSICS.REQUEST));
            DefineOwnProperty(globalThis, "setTimeout", GetOwnProperty(intrinsics, INTRINSICS.SETTIMEOUT));
            DefineOwnProperty(globalThis, "setLanguage", GetOwnProperty(intrinsics, INTRINSICS.SETLANGUAGE));
            LazyDefineBuiltinConstant(globalThis, "undefined", undefined);
            DefineOwnProperty(globalThis, "unescape", GetOwnProperty(intrinsics, INTRINSICS.UNESCAPE));
            LazyDefineBuiltinConstant(globalThis, $$toStringTag, "syntaxjs");
            DefineOwnProperty(globalThis, "VM", GetOwnProperty(intrinsics, INTRINSICS.VM));
            if (typeof Java !== "function" && typeof load !== "function" && typeof print !== "function") {
                LazyDefineProperty(intrinsics, INTRINSICS.DOMWRAPPER,
                    NativeJSObjectWrapper(
                            typeof importScripts === "function" ? self :
                                typeof window === "object" ? window :
                                typeof process === "object" ? process : {}
                    )
                );
                if (typeof importScripts === "function") {
                    DefineOwnProperty(globalThis, "self", GetOwnProperty(intrinsics, INTRINSICS.DOMWRAPPER));
                } else if (typeof window === "object") {
                    DefineOwnProperty(globalThis, "window", GetOwnProperty(intrinsics, INTRINSICS.DOMWRAPPER));
                    DefineOwnProperty(globalThis, "document", {
                        configurable: true,
                        enumerable: true,
                        value: Get(Get(globalThis, "window"), "document"),
                        writable: true

                    });
                } else if (typeof process === "object") {
                    DefineOwnProperty(globalThis, "process", GetOwnProperty(intrinsics, INTRINSICS.DOMWRAPPER));
                }
            }
            return globalThis;
        };
        return intrinsics;
    };
    exports.NextTask = NextTask;
    exports.getTasks = getTasks;
    exports.OBJECT = OBJECT;
    exports.NUMBER = NUMBER;
    exports.STRING = STRING;
    exports.SYMBOL = SYMBOL;
    exports.BOOLEAN = BOOLEAN;
    exports.REFERENCE = REFERENCE;
    exports.ENVIRONMENT = ENVIRONMENT;
    exports.COMPLETION = COMPLETION;
    exports.UNDEFINED = UNDEFINED;
    exports.NULL = NULL;
    exports.SLOTS = SLOTS;
    exports.INTRINSICS = INTRINSICS;
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
    exports.NormalCompletion = NormalCompletion;
    exports.Completion = Completion;
    exports.NewDeclarativeEnvironment = NewDeclarativeEnvironment;
    exports.NewObjectEnvironment = NewObjectEnvironment;
    exports.NewFunctionEnvironment = NewFunctionEnvironment;
    exports.createIdentifierBinding = createIdentifierBinding;
    exports.GetIdentifierReference = GetIdentifierReference;
    exports.FunctionCreate = FunctionCreate;
    exports.FunctionAllocate = FunctionAllocate;
    exports.FunctionInitialize = FunctionInitialize;
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
    exports.NativeJSObjectWrapper = NativeJSObjectWrapper;
    exports.NativeJSFunctionWrapper = NativeJSFunctionWrapper;
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
    exports.writePropertyDescriptor = writePropertyDescriptor;
    exports.readPropertyDescriptor = readPropertyDescriptor;
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
    exports.thisSymbolValue = thisSymbolValue;
    exports.MakeMethod = MakeMethod;
    exports.CloneMethod = CloneMethod;
    exports.newTypeError = newTypeError;
    exports.newSyntaxError = newSyntaxError;
    exports.newRangeError = newRangeError;
    exports.newEvalError = newEvalError;
    exports.newURIError = newURIError;
    exports.newReferenceError = newReferenceError;
    exports.SetFunctionLength = SetFunctionLength;
    exports.LazyDefineProperty = LazyDefineProperty;
    exports.LazyDefineSelfHostingFunction = LazyDefineSelfHostingFunction;
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
    exports.createExceptionTextOutput = createExceptionTextOutput;
    exports.stringifyErrorStack = stringifyErrorStack;
    exports.addMissingProperties = addMissingProperties;
    return exports;
});

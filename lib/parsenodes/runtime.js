define("runtime", function () {
//    function makeRuntime() {
    "use strict";
    var parse = require("parser");// .makeParser(); // soon: CREATE A _NEW_ PARSER (which creates a new tokenizer) HERE (when realm creates a NEW RUNTIME) (creating one now just slows down startup but brings no completly own closure)
    var ecma = require("api");
    var statics = require("slower-static-semantics");
    var parseGoal = parse.parseGoal;

    var debugmode = false;
    var isWorker = typeof importScripts === "function" && typeof window === "undefined";
    var hasConsole = typeof console === "object" && console && typeof console.log == "function";
    var hasPrint = typeof print === "function";
    function debug() {
        if (debugmode && hasConsole) console.log.apply(console, arguments);
    }
    function debugdir() {
        if (debugmode && hasConsole) console.dir.apply(console, arguments);
    }
    function consoleLog() {
        if (hasConsole) console.log.apply(console, arguments);
        else if (hasPrint) print.apply(undefined, arguments);
    }
    function consoleDir() {
        if (hasConsole) console.dir.apply(console, arguments);
        else if (hasPrint) print.apply(undefined, arguments);
    }

    // Assignment, backrefs, temp solution
    ecma.OrdinaryFunction.prototype.Call = Call;
    ecma.EvaluateBody = EvaluateBody;
    ecma.Evaluate = Evaluate;
    ecma.CreateGeneratorInstance = CreateGeneratorInstance;
    var DeclaredNames = statics.DeclaredNames;
    var BoundNames = statics.BoundNames;
    var VarScopedDeclarations = statics.VarScopedDeclarations;
    var LexicallyScopedDeclarations = statics.LexicallyScopedDeclarations;
    var VarDeclaredNames = statics.VarDeclaredNames;
    var LexicallyDeclaredNames = statics.LexicallyDeclaredNames;
    var LexicalDeclarations = statics.LexicalDeclarations;
    var IsLexicalDeclaration = statics.IsLexicalDeclaration;
    var IsConstantDeclaration = statics.IsConstantDeclaration;
    var ReferencesSuper = statics.ReferencesSuper;
    var ConstructorMethod = statics.ConstructorMethod;
    var PrototypeMethodDefinitions = statics.PrototypeMethodDefinitions;
    var StaticMethodDefinitions = statics.StaticMethodDefinitions;
    var HasInitializer = statics.HasInitializer;
    var IsSimpleParameterList = statics.IsSimpleParameterList;
    var ExpectedArgumentCount = statics.ExpectedArgumentCount;
    var IsValidSimpleAssignmentTarget = statics.IsValidSimpleAssignmentTarget;
    var PropName = statics.PropName;
    var PropNameList = statics.PropNameList;
    var SpecialMethod = statics.SpecialMethod;
    var ElisionWidth = statics.ElisionWidth;
    var IsStrict = statics.IsStrict;
    var IsAnonymousFunctionDefinition = statics.IsAnonymousFunctionDefinition;
    var StringValue = statics.StringValue;
    var IsIdentifierRef = statics.IsIdentifierRef;
    var OBJECT = ecma.OBJECT;
    var NUMBER = ecma.NUMBER;
    var STRING = ecma.STRING;
    var SYMBOL = ecma.SYMBOL;
    var BOOLEAN = ecma.BOOLEAN;
    var REFERENCE = ecma.REFERENCE;
    var ENVIRONMENT = ecma.ENVIRONMENT;
    var COMPLETION = ecma.COMPLETION;
    var UNDEFINED = ecma.UNDEFINED;
    var NULL = ecma.NULL;
    var NextTask = ecma.NextTask;
    var getTasks = ecma.getTasks;
    var RegExpCreate = ecma.RegExpCreate;
    var Assert = ecma.Assert;
    var assert = ecma.assert;
    var CreateRealm = ecma.CreateRealm;
    var CreateDataProperty = ecma.CreateDataProperty;
    var CreateAccessorProperty = ecma.CreateAccessorProperty;
    var ToPropertyKey = ecma.ToPropertyKey;
    var IsPropertyKey = ecma.IsPropertyKey;
    var IsSymbol = ecma.IsSymbol;
    var IsAccessorDescriptor = ecma.IsAccessorDescriptor;
    var IsDataDescriptor = ecma.IsDataDescriptor;
    var IsGenericDescriptor = ecma.IsGenericDescriptor;
    var FromPropertyDescriptor = ecma.FromPropertyDescriptor;
    var ToPropertyDescriptor = ecma.ToPropertyDescriptor;
    var CompletePropertyDescriptor = ecma.CompletePropertyDescriptor;
    var ValidateAndApplyPropertyDescriptor = ecma.ValidateAndApplyPropertyDescriptor;
    var ThrowTypeError = ecma.ThrowTypeError;
    var $$unscopables = ecma.$$unscopables;
    var $$create = ecma.$$create;
    var $$toPrimitive = ecma.$$toPrimitive;
    var $$toStringTag = ecma.$$toStringTag;
    var $$hasInstance = ecma.$$hasInstance;
    var $$iterator = ecma.$$iterator;
    var $$isRegExp = ecma.$$isRegExp;
    var $$isConcatSpreadable = ecma.$$isConcatSpreadable;
    var MakeMethod = ecma.MakeMethod;
    var NewFunctionEnvironment = ecma.NewFunctionEnvironment;
    var NewObjectEnvironment = ecma.NewObjectEnvironment;
    var NewDeclarativeEnvironment = ecma.NewDeclarativeEnvironment;
    var OrdinaryObject = ecma.OrdinaryObject;
    var ObjectCreate = ecma.ObjectCreate;
    var IsCallable = ecma.IsCallable;
    var IsConstructor = ecma.IsConstructor;
    var OrdinaryConstruct = ecma.OrdinaryConstruct;
    var Construct = ecma.Construct;
    var CreateFromConstructor = ecma.CreateFromConstructor;
    var OrdinaryCreateFromConstructor = ecma.OrdinaryCreateFromConstructor;
    var FunctionCreate = ecma.FunctionCreate;
    var FunctionAllocate = ecma.FunctionAllocate;
    var FunctionInitialize = ecma.FunctionInitialize;
    var GeneratorFunctionCreate = ecma.GeneratorFunctionCreate;
    var OrdinaryFunction = ecma.OrdinaryFunction;
    var FunctionEnvironment = ecma.FunctionEnvironment;
    var SymbolPrimitiveType = ecma.SymbolPrimitiveType;
    var ExecutionContext = ecma.ExecutionContext;
    var CodeRealm = ecma.CodeRealm;
    var CompletionRecord = ecma.CompletionRecord;
    var NormalCompletion = ecma.NormalCompletion;
    var Completion = ecma.Completion;
    var OrdinaryHasInstance = ecma.OrdinaryHasInstance;
    var floor = ecma.floor;
    var ceil = ecma.ceil;
    var sign = ecma.sign;
    var abs = ecma.abs;
    var min = ecma.min;
    var max = ecma.max;
    var IdentifierBinding = ecma.IdentifierBinding;
    var GlobalEnvironment = ecma.GlobalEnvironment;
    var ObjectEnvironment = ecma.ObjectEnvironment;
    var ToNumber = ecma.ToNumber;
    var ToUint16 = ecma.ToUint16;
    var ToInt32 = ecma.ToInt32;
    var ToUint32 = ecma.ToUint32;
    var ToString = ecma.ToString;
    var ToObject = ecma.ToObject;
    var Type = ecma.Type;
    var Reference = ecma.Reference;
    var GetIdentifierReference = ecma.GetIdentifierReference;
    var GetThisEnvironment = ecma.GetThisEnvironment;
    var GetOwnProperty = ecma.GetOwnProperty;
    var GetValue = ecma.GetValue;
    var PutValue = ecma.PutValue;
    var SameValue = ecma.SameValue;
    var SameValueZero = ecma.SameValueZero;
    var ToPrimitive = ecma.ToPrimitive;
    var GetGlobalObject = ecma.GetGlobalObject;
    var ThisResolution = ecma.ThisResolution;
    var CreateArrayFromList = ecma.CreateArrayFromList;
    var CreateListFromArrayLike = ecma.CreateListFromArrayLike;
    var TestIntegrityLevel = ecma.TestIntegrityLevel;
    var SetIntegrityLevel = ecma.SetIntegrityLevel;
    var Intrinsics;
    var MakeConstructor = ecma.MakeConstructor;
    var ArrayCreate = ecma.ArrayCreate;
    var ArraySetLength = ecma.ArraySetLength;
    var GeneratorStart = ecma.GeneratorStart;
    var GeneratorYield = ecma.GeneratorYield;
    var GeneratorResume = ecma.GeneratorResume;
    var CreateEmptyIterator = CreateEmptyIterator;
    var ToBoolean = ecma.ToBoolean;
    var CreateItrResultObject = ecma.CreateItrResultObject;
    var IteratorNext = ecma.IteratorNext;
    var IteratorComplete = ecma.IteratorComplete;
    var IteratorValue = ecma.IteratorValue;
    var GetIterator = ecma.GetIterator;
    var SetFunctionName = ecma.SetFunctionName;
    var Invoke = ecma.Invoke;
    var Get = ecma.Get;
    var Set = ecma.Set;
    var DefineOwnProperty = ecma.DefineOwnProperty;
    var DefineOwnPropertyOrThrow = ecma.DefineOwnPropertyOrThrow;
    var Delete = ecma.Delete;
    var Enumerate = ecma.Enumerate;
    var OwnPropertyKeys = ecma.OwnPropertyKeys;
    var OwnPropertyKeysAsList = ecma.OwnPropertyKeysAsList;
    var SetPrototypeOf = ecma.SetPrototypeOf;
    var GetPrototypeOf = ecma.GetPrototypeOf;
    var PreventExtensions = ecma.PreventExtensions;
    var IsExtensible = ecma.IsExtensible;
    var Put = ecma.Put;
    var GetMethod = ecma.GetMethod;
    var HasProperty = ecma.HasProperty;
    var HasOwnProperty = ecma.HasOwnProperty;
    var IsPropertyReference = ecma.IsPropertyReference;
    var MakeSuperReference = ecma.MakeSuperReference;
    var IsUnresolvableReference = ecma.IsUnresolvableReference;
    var IsStrictReference = ecma.IsStrictReference;
    var HasPrimitiveBase = ecma.HasPrimitiveBase;
    var GetBase = ecma.GetBase;
    var GetReferencedName = ecma.GetReferencedName;
    var GetThisValue = ecma.GetThisValue;
    var empty = ecma.empty;
    var all = ecma.all;
    var StrictEqualityComparison = ecma.StrictEqualityComparison;
    var AbstractEqualityComparison = ecma.AbstractEqualityComparison;
    var AbstractRelationalComparion = ecma.AbstractRelationalComparison;
    var ArgumentsExoticObject = ecma.ArgumentsExoticObject;

    var AddRestrictedFunctionProperties = ecma.AddRestrictedFunctionProperties;
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var unwrap = ecma.unwrap;
    var setInternalSlot = ecma.setInternalSlot;
    var getInternalSlot = ecma.getInternalSlot;
    var hasInternalSlot = ecma.hasInternalSlot;
    var callInternalSlot = ecma.callInternalSlot;
    var getRealm = ecma.getRealm;
    var getLexEnv = ecma.getLexEnv;
    var getVarEnv = ecma.getVarEnv;
    var getIntrinsics = ecma.getIntrinsics;
    var getIntrinsic = ecma.getIntrinsic;
    var getGlobalThis = ecma.getGlobalThis;
    var getGlobalEnv = ecma.getGlobalEnv;
    var getStack = ecma.getStack;
    var getContext = ecma.getContext;
    var getEventQueue = ecma.getEventQueue;
    var SetFunctionLength = ecma.SetFunctionLength;
    var writePropertyDescriptor = ecma.writePropertyDescriptor;
    var withError = ecma.withError;
    var printException = ecma.printException;
    var makeMyExceptionText = ecma.makeMyExceptionText;
    var CheckObjectCoercible = ecma.CheckObjectCoercible;
    var line, column;
    var realm, intrinsics, globalEnv, globalThis;
    var stack, eventQueue;
    var scriptLocation;
    var initializedTheRuntime = false;
    var shellMode;  // keep strict mode turned on
    var keepStrict; // idea for legacy shell mode (until i remove whole syntaxjs.eval for syntaxjs.createRealm().eval() and kick shared state with factories)
    var evaluation = Object.create(null);
    var strictModeStack = [];
    var inStrictMode = false;
    var loc = {};
    var generatorState;
    var IsFunctionDeclaration = statics.IsFunctionDeclaration;
    var IsFunctionExpression = statics.IsFunctionExpression;
    var IsGeneratorDeclaration = statics.IsGeneratorDeclaration;
    var IsGeneratorExpression = statics.IsGeneratorExpression;
    var IsVarDeclaration = statics.IsVarDeclaration;
    var isDuplicateProperty = statics.isDuplicateProperty;
    var IsIdentifier = statics.IsIdentifier;
    var CV = statics.CV;
    var MV = statics.MV;
    var SV = statics.SV;
    var TV = statics.TV;
    var TRV = statics.TRV;
    var isFuncDecl = {
        "GeneratorDeclaration":true,
        "FunctionDeclaration":true,
        __proto__:null
    };
    var IsBindingPattern = {
        __proto__: null,
        "ObjectPattern": true,
        "ArrayPattern": true
    };
    var ControlStatement = {
        "IfStatement": true,
        "SwitchStatement": true
    };
    var isUndefined = {__proto__:null, "undefined":true, "null":true};
    var isValidSimpleAssignmentTarget = {
        "ObjectPattern": true,
        "ArrayPattern": true,
        "ObjectExpression": true,
        "ArrayExpression": true
    };
    var IterationStatements = {
        "ForStatement": true
    };
    var BreakableStatements = {
        "WhileStatement": true,
        "DoWhileStatement": true,
        "SwitchStatement": true
    };
    var SkipMeDeclarations = {
        __proto__: null,
        "FunctionDeclaration": true,
        "GeneratorDeclaration": true
    };
    var makeNativeException = ecma.makeNativeException;
    var getCode = ecma.getCode;
    var isCodeType = ecma.isCodeType;

    function setCodeRealm(r) {
        if (r) {
            realm = r;
            stack = realm.stack;
            intrinsics = realm.intrinsics;
            globalEnv = realm.globalEnv;
            globalThis = realm.globalThis;
            eventQueue = realm.eventQueue;
        }
    }
    function inStrict (node) {
        if (node && node.strict) return true;
        return getLexEnv().strict;

    }
    function SkipDecl(node) {
        return SkipMeDeclarations[node.type] && !node.expression;

    }
    function assign(obj, obj2) {
        for (var k in obj2) {
            if (Object.hasOwnProperty.call(obj2, k)) obj[k] = obj2[k];
        }
        return obj;
    }

    function unquote(str) {
        return str.replace(/^("|')|("|')$/g, "");  //'
    }
    function repeatch(ch, times) {
        var str = "";
        for (var i = 0; i < times; i++) str += ch;
        return str;
    }
    function atLineCol() {
        var line = loc && loc.start.line;
        var column = loc && loc.start.column;
        return " at line "+line+", column "+column;
    }
    function banner(str) {
        if (hasConsole) {
            consoleLog(repeatch("-", 79));
            consoleLog(str);
            consoleLog(repeatch("-", 79));
        } else if(hasPrint) {
            print(repeatch("-", 79));
            print(str);
            print(repeatch("-", 79));
        }
    }
    function ResolveBinding(name) {
        var lex = getLexEnv();
        var strict = getContext().strict;
        return GetIdentifierReference(lex, name, strict);
    }
    function InstantiateModuleDeclaration(code, env) {
        var declarations = LexicalDeclaration(code);
        var functionsToInitialize = [];
        for (var i = 0, j = declarations.length; i < j; i++) {
            if (d = declarations[i]) {
                var boundNames = BoundNames(d);
                for (var k = 0, l = boundNames.length; k < l; k++) {
                    var dn = boundNames[k];
                    if (IsConstantDeclaration(d)) {
                        env.CreateImmutableBinding(dn);
                    } else  {
                        var status = env.CreateMutableBinding(dn, false);
                        if (isAbrupt(status)) return status;
                    }
                }
                if (IsGeneratorDeclaration(d)) {
                    functionsToInitialize.push(d);
                }
            }
        }
        for (i = 0, j = functionsToInitialize.length; i < j; i++) {
            var fn = BoundNames(f)[0];
            var fo = InstantiateFunctionObject(f, env);
            env.InitializeBinding(fn, fo);
        }
    }
    function InstantiateGlobalDeclaration(script, env, deletableBindings) {
        "use strict";

        var name;
        var boundNamesInPattern;
        var code = getCode(script,"body");
        var strict = !!getCode(script,"strict");
        var cx = getContext();
        if (strict) cx.strict = true;
        var lexNames = LexicallyDeclaredNames(code);
        var varNames = VarDeclaredNames(code);
        var i, j, y, z;
        var status, ex;
        for (i = 0, j = lexNames.length; i < j; i++) {
            if (name = lexNames[i]) {
                if (env.HasVarDeclaration(name)) return withError("Syntax", "Instantiate global: existing var declaration: " + name);
                if (env.HasLexicalDeclaration(name)) return withError("Syntax", "Instantiate global: existing lexical declaration: " + name);
            }
        }

        for (i = 0, j = varNames.length; i < j; i++) {
            if (name = varNames[i]) {
                if (env.HasLexicalDeclaration(name)) return withError("Syntax", "Instantiate global: var " + name + " has already a lexical declaration: " + name);
            }
        }

        var varDeclarations = script.varDeclarations || VarScopedDeclarations(script.body);
        var functionsToInitialize = [];
        var declaredFunctionNames = Object.create(null);
        var d;
        var fn;
        var fnDefinable;
        for (i = varDeclarations.length - 1, j = 0; i >= j; i--) {
            d = varDeclarations[i];
            if (isFuncDecl[d.type]) {
                fn = d && (d.id || d.id.name);
                fnDefinable = env.CanDeclareGlobalFunction(fn);
                if (!fnDefinable) return withError("Type", "Instantiate global: can not declare global function: " + fn);
                declaredFunctionNames[fn] = d;
                functionsToInitialize.push(d);
            }
        }
        var vnDefinable;
        var declaredVarNames = Object.create(null);
        var vn;
        for (i = 0, j = varDeclarations.length; i < j; i++) {
            d = varDeclarations[i];

            if (d.type === "VariableDeclarator") {

                vn = d.id.name;
                if (!declaredVarNames[vn]) {
                    vnDefinable = env.CanDeclareGlobalVar(vn);
                    debug("Can declare global var: " + vn + ", is " + vnDefinable);
                    if (!vnDefinable) return withError("Type", "Instantiate global: can not declare global variable" + vn);
                    declaredVarNames[vn] = d;
                } else debug(vn + "is already declared");

            } else if (IsBindingPattern[d.type]) { // extra hack or spec update ?

                boundNamesInPattern = BoundNames(d.elements);
                for (y = 0, z = boundNamesInPattern.length; y < z; y++) {
                    vn = boundNamesInPattern[y];
                    if (!declaredVarNames[vn]) {
                        vnDefinable = env.CanDeclareGlobalVar(vn);
                        debug("Can declare global var: " + vn + ", is " + vnDefinable);
                        if (!vnDefinable) return withError("Type", "Instantiate global: can not declare global variable" + vn);
                        declaredVarNames[vn] = d;
                    } else debug(vn + "is already declared");
                }
            }
        }
        var fo;
        if (functionsToInitialize.length) debug("Functions to initialize: " + functionsToInitialize.length);
        for (i = 0, j = functionsToInitialize.length; i < j; i++) {
            d = functionsToInitialize[i];
            fn = d.id;
            fo = InstantiateFunctionObject(d, env);
            status = env.CreateGlobalFunctionBinding(fn, fo, deletableBindings);
            if (isAbrupt(status)) return status;
            //status = SetFunctionName(fo, fn);
            //if (isAbrupt(status)) return status;
        }
        for (d in declaredVarNames) {
            status = env.CreateGlobalVarBinding(d, deletableBindings);
            if (isAbrupt(status)) return status;
        }

        var lexDeclarations = LexicalDeclarations(script.body);
        var dn, kind;
        for (i = 0, j = lexDeclarations.length; i < j; i++) {
            debug("lexdecls: " + j);
            d = lexDeclarations[i];
            kind = d.kind;
            if (IsBindingPattern[d.type]) { // extra hack
                boundNamesInPattern = BoundNames(d.elements);
                for (y = 0, z = boundNamesInPattern.length; y < z; y++) {
                    dn = boundNamesInPattern[y];
                    if (kind === "const") status = env.CreateImmutableBinding(dn);
                    else status = env.CreateMutableBinding(dn);
                    if (isAbrupt(status)) return status;
                }
            } else if (kind === "const") {
                dn = d.id.name;
                status = env.CreateImmutableBinding(dn);
                if (isAbrupt(status)) return status;
            } else if (kind === "let") {
                dn = d.id.name;
                status = env.CreateMutableBinding(dn, deletableBindings);
                if (isAbrupt(status)) return status;
            } else if (d.generator) {
                fn = d.id;
                fo = InstantiateFunctionObject(d, env);
                status = env.CreateMutableBinding(fn);
                if (isAbrupt(status)) return status;
                status = env.InitializeBinding(fn, fo, false);
                if (isAbrupt(status)) return status;
                //status = SetFunctionName(fo, fn);
                //if (isAbrupt(status)) return status;
            }
        }
    }
    function InstantiateBlockDeclaration(code, env) {
        "use strict";
        var ex;
        var declarations = LexicalDeclarations(code);
        var decl, functionsToInitialize = [];
        var fn;
        var fo;
        var type, kind;
        var status;
        for (var i = 0, j = declarations.length; i < j; i++) {
            if (decl = declarations[i]) {
                type = decl.type;
                kind = decl.kind;
                if (isFuncDecl[type] && (!decl.expression)) {
                    functionsToInitialize.push(decl);
                } else {
                    var names = BoundNames(decl);
                    for (var y = 0, z = names.length; y < z; y++) {
                        var dn = names[y];
                        if (type === "VariableDeclarator") { // here i had a bug first
                            if (kind === "const") { // this will fail with es (decl has no .kind yet, just the array´s container node)
                                status = env.CreateImmutableBinding(dn);
                                if (isAbrupt(status)) return status;
                            } else {
                                status = env.CreateMutableBinding(dn);
                                if (isAbrupt(status)) return status;
                            }
                        }
                    }
                }
            }
        }
        for (i = 0, j = functionsToInitialize.length; i < j; i++) {
            fn = functionsToInitialize[i].id;
            fo = InstantiateFunctionObject(functionsToInitialize[i], env);
            env.SetMutableBinding(fn, fo, false);
            SetFunctionName(fo, fn);
        }
    }
    function InstantiateFunctionObject(node, env) {

        var F;
        var cx = getContext();
        var params = getCode(node, "params");
        var body = getCode(node, "body");
        var generator = !!getCode(node,"generator");
        var needsSuper = !!getCode(node, "needsSuper");
        var strict = cx.strict || !!getCode(node,"strict");
        var scope = env;

        if (!generator) {
            var name = getCode(node,"id");
            F = FunctionCreate("normal", params, body, scope, strict);
            // 14.1.16 4.
            if (needsSuper) MakeMethod(F, name, undefined);
            MakeConstructor(F);
            if (name) SetFunctionName(F, name);
        } else if (generator) {
            strict = true;
            var name = getCode(node,"id");
            F = GeneratorFunctionCreate("generator", params, body, scope, strict);
            var prototype = ObjectCreate(getIntrinsic("%GeneratorPrototype%"));
            if (name) SetFunctionName(F, name);
            MakeConstructor(F, true, prototype);
        }

        var realm = getRealm();
        setInternalSlot(F, "Realm", realm);
        return F;
    }
    function InstantiateFunctionDeclaration(F, argList, env) {
        "use strict";
        var x;
        //console.log("ins=");
        //console.dir(argList);
        var cx = getContext();
        var code = getInternalSlot(F, "Code");
        var formals = getInternalSlot(F, "FormalParameters");
        var strict = getInternalSlot(F, "Strict");
        var thisMode = getInternalSlot(F, "ThisMode");
        var boundNamesInPattern;
        var parameterNames = BoundNames(formals);
        var varDeclarations = VarScopedDeclarations(code);
        var argumentsObjectNeeded;
        argumentsObjectNeeded = thisMode !== "lexical";
        var d;
        var fn;
        var fo;
        var functionsToInitialize = [];
        var alreadyDeclared;
        var status;
        for (var j = 0, i = varDeclarations.length; i >= j; i--) {
            if (d = varDeclarations[i]) {
                if (IsFunctionDeclaration(d)) {
                    fn = BoundNames(d)[0];
                    alreadyDeclared = env.HasBinding(fn);
                    if (isAbrupt(alreadyDeclared)) return alreadyDeclared;
                    if (!alreadyDeclared) {
                        env.CreateMutableBinding(fn);
                        functionsToInitialize.push(d);
                    }
                }
            }
        }
        var paramName;
        for (i = 0, j = parameterNames.length; i < j; i++) {
            if (paramName = parameterNames[i]) {
                alreadyDeclared = env.HasBinding(paramName);
                if (!alreadyDeclared) {
                    if (paramName === "arguments") argumentsObjectNeeded = false;
                    status = env.CreateMutableBinding(paramName, false);
                    //if (isAbrupt(status)) return status;
                }
            }
        }
        if (argumentsObjectNeeded) {
            if (strict) {
                env.CreateImmutableBinding("arguments");
            } else {
                env.CreateMutableBinding("arguments");
            }
        }
        var varNames = VarDeclaredNames(code);
        var varName;
        for (i = 0, j = varNames.length; i < j; i++) {
            if (varName = varNames[i]) {
                alreadyDeclared = env.HasBinding(varName);
                if (!alreadyDeclared) {
                    var status = env.CreateMutableBinding(varName);
                    //if (isAbrupt(status)) return status;
                }
            }
        }
        var lexDeclarations = LexicalDeclarations(code);
        var dn, bn;
        for (i = 0, j = lexDeclarations.length; i < j; i++) {
            if (d = lexDeclarations[i]) {
                bn = BoundNames(d);
                for (var y = 0, z = bn.length; y < z; y++) {
                    dn = bn[y];
                    if (IsGeneratorDeclaration(d)) {
                        functionsToInitialize.push(d);
                    } else if (IsConstantDeclaration(d)) {
                        env.CreateImmutableBinding(dn);
                    } else {
                        env.CreateMutableBinding(dn);
                    }
                }
            }
        }
        for (i = 0, j = functionsToInitialize.length; i < j; i++) {
            if (d = functionsToInitialize[i]) {
                fn = BoundNames(d)[0];
                fo = InstantiateFunctionObject(d, env);
                env.InitializeBinding(fn, fo, false);
            }
        }
        var ao = InstantiateArgumentsObject(argList);
        if (isAbrupt(ao = ifAbrupt(ao))) return ao;
        var formalStatus = BindingInitialisation(formals, ao, undefined);
        if (isAbrupt(formalStatus)) return formalStatus;

        if (argumentsObjectNeeded) {
            if (strict) {
                CompleteStrictArgumentsObject(ao);
            } else {
                CompleteMappedArgumentsObject(ao, F, formals, env);
            }
            env.InitializeBinding("arguments", ao);
        }
        return F;
    }
    function InstantiateArgumentsObject(args) {
        var len = args.length;
        var obj = ArgumentsExoticObject();
        /* callInternalSlot("DefineOwnProperty", */

        writePropertyDescriptor(obj, "length", {
            value: len,
            writable: true,
            configurable: true,
            enumerable: false
        });
        var indx = len - 1;
        var val;
        while (indx >= 0) {
            val = args[indx];
            //callInternalSlot("DefineOwnProperty", 
            writePropertyDescriptor(obj, ToString(indx), {
                value: val,
                writable: true,
                enumerable: true,
                configurable: true
            });
            indx = indx - 1;
        }

        return obj;
    }
    function CompleteStrictArgumentsObject(obj) {
        AddRestrictedFunctionProperties(obj);
        return obj;
    }

    function CompleteMappedArgumentsObject(obj, F, formals, env) {

        var len = Get(obj, "length");
        formals = formals || [];
        env = env || getLexEnv().outer;
        var mappedNames = Object.create(null);
        var numberOfNonRestFormals;
        var i = 0;
        while (i < formals.length) {
            if (formals[i].type === "RestParameter") break;
            ++i;
        }
        numberOfNonRestFormals = i;
        var map = ObjectCreate();
        var name;
        var indx = len - 1;
        var param;
        var g,s;
        while (indx >= 0) {
            if (indx < numberOfNonRestFormals) {
                param = formals[indx];
                if (IsBindingPattern[param.type]) { // extra hack ?
                    var elem;
                    for (var x = 0, y = param.elements.length; x < y; x++) {
                        elem = param.elements[i];
                        name = elem.target ? elem.target.name : (elem.name || elem.value);
                        if (!mappedNames[name]) {
                            mappedNames[name] = true;
                            g = MakeArgGetter(name, env);
                            s = MakeArgSetter(name, env);
                            callInternalSlot("DefineOwnProperty", map, name, {
                                get: g,
                                set: s,
                                enumerable: true,
                                configurable: true
                            });
                        }
                    }
                } else {
                    if (param.type === "Identifier") {
                        name = param.name || param.value;
                    } else if (param.type === "DefaultParameter") {
                        name = param.id;
                    } else name = "";
                    if (name && !mappedNames[name]) {
                        mappedNames[name] = true;
                        g = MakeArgGetter(name, env);
                        s = MakeArgSetter(name, env);
                        callInternalSlot("DefineOwnProperty", map, name, {
                            get: g,
                            set: s,
                            enumerable: true,
                            configurable: true
                        });
                    }
                }
            }
            indx = indx - 1;
        }

        if (Object.keys(mappedNames).length) {
            setInternalSlot(obj, "ParameterMap", map);
        }

        var status = DefineOwnPropertyOrThrow(map, $$iterator, {
            value: getIntrinsic("%ArrayProto_values%"),
            enumerable: false,
            writeable: true,
            configurable: true
        });

        if (isAbrupt(status)) return status;
        status = DefineOwnPropertyOrThrow(obj, "callee", {
            value: F,
            writable: false,
            configurable: false,
            enumerable: false
        });
        if (isAbrupt(status)) return status;

        return obj;
    }
    function makeArgumentsGetter(name) {
        return [{
            type: "ReturnStatement",
            argument: {
                type: "Identifier",
                name: name
            }
        }];
    }
    function makeArgumentsSetterFormals(name) {
        return [{
            type: "Identifier",
            name: name + "_arg"
        }];
    }
    function makeArgumentsSetter(name) {
        return {
            type: "AssigmentExpression",
            operator: "=",
            left: {
                type: "Identifier",
                name: name
            },
            right: {
                type: "Identifier",
                name: name + "_arg"
            }
        };
    }
    function MakeArgGetter(name, env) {
        var bodyText = makeArgumentsGetter(name);
        var formals = [];
        //var bodyText = parseGoal("FunctionBody", "return " + name + ";");
        //var formals = [];
        var F = FunctionCreate("normal", formals, bodyText, env, true);
        return F;
    }
    function MakeArgSetter(name, env) {
        var bodyText = makeArgumentsSetter(name);
        var formals = makeArgumentsSetterFormals(name);
        //var bodyText = parseGoal("FunctionBody", name + "= " + name + "_arg;");
        //var formals = parseGoal("FormalParameterList", name + "_arg");
        return FunctionCreate("normal", formals, bodyText, env, true);

    }
    function ArgumentListEvaluation(list) {
        var args = [], arg, type, value;
        for (var i = 0, j = list.length; i < j; i++) {
            arg = list[i];
            type = arg.type;
            if (type === "TemplateLiteral") {
                var siteObj = GetTemplateCallSite(arg);
                var substitutions = SubstitutionEvaluation(siteObj);
                if (isAbrupt(substitutions = ifAbrupt(substitutions))) return substitutions;
                args.push(siteObj);
                for (var k = 0, l = substitutions.length; k < l; k++) args.push(substitutions[k]);
                return args;
            } else if (type === "SpreadExpression") {
                var array = GetValue(Evaluate(arg));
                if (isAbrupt(array = ifAbrupt(array))) return array;
                var l = Get(array, "length");
                if (isAbrupt(l=ifAbrupt(l))) return l;
                for (var k = 0; k < l; k++) {
                    value = Get(array, ToString(k));
                    if (isAbrupt(value = ifAbrupt(value))) return value;
                    args.push(value);
                }
            } else {
                // Identifer und Literals.
                var argRef = Evaluate(arg);
                if (isAbrupt(argRef = ifAbrupt(argRef))) return argRef;
                var argValue = GetValue(argRef);
                if (isAbrupt(argValue = ifAbrupt(argValue))) return argValue;
                args.push(argValue);
            }
        }
        return args;
    }

    // tmp for require("vm") just to test
    ecma.EvaluateCall = EvaluateCall;
    ecma.ArgumentListEvaluation = ArgumentListEvaluation


    function EvaluateCall(ref, args, tailPosition) {
        var thisValue;
        var func = GetValue(ref);
        if (isAbrupt(func = ifAbrupt(func))) return func;
        var argList = ArgumentListEvaluation(args);
        if (isAbrupt(argList = ifAbrupt(argList))) return argList;
        if (Type(func) !== OBJECT) return withError("Type", "EvaluateCall: func is not an object");
        if (!IsCallable(func)) return withError("Type", "EvaluateCall: func is not callable");
        if (Type(ref) === REFERENCE) {
            if (IsPropertyReference(ref)) {
                thisValue = GetThisValue(ref);
            } else {
                var env = GetBase(ref);
                thisValue = env.WithBaseObject();
            }
        } else {
            thisValue = undefined;
        }
        if (tailPosition) { PrepareForTailCall(); }

        var result = callInternalSlot("Call", func, thisValue, argList);
        if (tailPosition) {}
        return result;

    }
    function Call(thisArg, argList) {
        var status, result, fname, localEnv;
        var F = this;
        var code = getInternalSlot(this, "Code");
        if (!code) return withError("Type", "Call: this value has no [[Code]] slot (if you called a native function it´s a bug and it´s [[Call]] isn´t set. but that shouldn´t happen.)");
        var params = getInternalSlot(this, "FormalParameters");
        var thisMode = getInternalSlot(this, "ThisMode");
        var strictSlot = getInternalSlot(this, "Strict");
        var scope = getInternalSlot(this, "Environment");
        var realm = getRealm();
        var callerContext = getContext();
        var calleeContext = ExecutionContext(getLexEnv());
        var calleeName = Get(this, "name"); // costs time and money, is just for the context.name for stackframe
        var callerName = callerContext.callee;
        stack.push(calleeContext);
        calleeContext.realm = realm;
        calleeContext.caller = callerName;
        calleeContext.callee = calleeName;
        if (thisMode === "lexical") {
            localEnv = NewDeclarativeEnvironment(scope);
        } else {
            if (thisMode === "strict" || strictSlot) {
                this.thisValue = thisArg;
                calleeContext.strict = true;
            } else {
                if (thisArg === null || thisArg === undefined) {
                    this.thisValue = getGlobalThis();
                } else if (Type(thisArg) !== OBJECT) {
                    this.thisValue = ToObject(thisArg);
                } else if (Type(thisArg) === OBJECT) {
                    this.thisValue = thisArg;
                } else {
                    this.thisValue = getGlobalThis();
                }
            }
            localEnv = NewFunctionEnvironment(this, this.thisValue);
            if (isAbrupt(localEnv=ifAbrupt(localEnv))) return localEnv;
        }
        calleeContext.VarEnv = localEnv;
        calleeContext.LexEnv = localEnv;
        status = InstantiateFunctionDeclaration(this, argList, localEnv);
        if (isAbrupt(status = ifAbrupt(status))) return status;
        result = EvaluateBody(this);
        Assert(stack.pop() === calleeContext, "The right context could not be popped from the stack");
        return result;
    }
    function PrepareForTailCall() {
        getStack().pop();
    }
    evaluation.SpreadExpression = SpreadExpression;
    function SpreadExpression(node) {
        return Evaluate(node.argument);
    }
    evaluation.BreakStatement = BreakStatement;
    function BreakStatement(node) {
        return Completion("break", undefined, node.label || empty);
    }
    evaluation.ContinueStatement = ContinueStatement;
    function ContinueStatement(node) {
        return Completion("continue", undefined, node.label || empty);
    }
    evaluation.ThrowStatement = ThrowStatement;
    function ThrowStatement(node) {
        var expr = getCode(node, "argument");

        var exprRef = Evaluate(expr);
        if (isAbrupt(exprRef)) return exprRef;
        var exprValue = GetValue(exprRef);

        return Completion("throw", exprValue, empty);
    }
    evaluation.ReturnStatement = ReturnStatement;
    function ReturnStatement(node) {
        var expr = getCode(node, "argument");
        var exprRef = Evaluate(expr);
        if (isAbrupt(exprRef)) return exprRef;
        var exprValue = GetValue(exprRef);
        return Completion("return", exprValue, empty);
    }
    evaluation.YieldExpression = YieldExpression;
    function YieldExpression(node, completion) {

        var parent = node.parent;
        var expression = getCode(node, "argument");
        var delegator = node.delegator;

        if (!expression) {

            return GeneratorYield(CreateItrResultObject(undefined, false));

        }

        var exprRef = Evaluate(expression);
        var value = GetValue(exprRef);
        if (isAbrupt(value = ifAbrupt(value))) return value;
        if (delegator) {
            var iterator = GetIterator(value);
            if (isAbrupt(iterator = ifAbrupt(iterator))) return iterator;
            var received = completion || NormalCompletion(undefined);
            var innerResult, done, innerValue;
            for (;;) {
                if (received.type === "normal") {
                    innerResult = IteratorNext(iterator, received.value);
                    if (isAbrupt(innerResult = ifAbrupt(innerResult))) return innerResult;
                } else {
                    Assert(received.type === "throw", "YieldExpression: at this point the completion has to contain the throw type");
                    if (HasProperty(iterator, "throw")) {
                        innerResult = Invoke(iterator, "throw", [received.value]);
                        if (isAbrupt(innerResult = ifAbrupt(innerResult))) return innerResult;
                    } else {
                        return received;
                    }
                }
                var done = IteratorComplete(iterator);
                if (isAbrupt(done = ifAbrupt(done))) return done;
                if (done) {
                    innerValue = IteratorValue(innerResult);
                    return innerValue;
                }
                received = GeneratorYield(innerResult);
            }
        } else {
            return GeneratorYield(CreateItrResultObject(value, false));
        }
    }
    function CreateGeneratorInstance(F) {
        var env = GetThisEnvironment();
        var G = env.GetThisBinding();
        if (Type(G) !== OBJECT || (Type(G) === OBJECT && getInternalSlot(G, "GeneratorState") === undefined)) {
            var newG = OrdinaryCreateFromConstructor(F, "%GeneratorPrototype%", {
                "GeneratorState": undefined,
                "GeneratorContext": undefined
            });
            if (isAbrupt(newG = ifAbrupt(newG))) return newG;
            G = newG;
        }
        return GeneratorStart(G, getInternalSlot(F, "Code"));
    }
    function EvaluateConciseBody(F) {
        "use strict";
        var code = F.Code;
        var exprRef, exprValue;
        var node;
        if (!Array.isArray(code) && code) {
            exprValue = GetValue(Evaluate(code));
            if (isAbrupt(exprValue)) return exprValue;
            return NormalCompletion(exprValue);
        }
        for (var i = 0, j = code.length; i < j; i++) {
            if (node = code[i]) {
                // tellExecutionContext(node, i, code);
                exprRef = Evaluate(node);
                if (isAbrupt(exprRef)) {
                    // untellExecutionContext()
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        // untellExecutionContext();
        return exprRef;
    }
    function EvaluateBody(F) {
        "use strict";
        var exprRef, exprValue;
        var node;
        var code = getInternalSlot(F,"Code");
        var kind = getInternalSlot(F, "FunctionKind");
        var thisMode = getInternalSlot(F, "ThisMode");
        if (kind === "generator") {
            return CreateGeneratorInstance(F);
        } else if (thisMode === "lexical") {
            return EvaluateConciseBody(F);
        }
        for (var i = 0, j = code.length; i < j; i++) {
            if ((node = code[i])) {
                // tellExecutionContext(node, i, code);
                exprRef = Evaluate(node);
                if (isAbrupt(exprRef=ifAbrupt(exprRef))) {
                    // untellExecutionContext();
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        // untellExecutionContext();
        return NormalCompletion(exprRef);
    }
    function EvaluateModuleBody(M) {
        "use strict";
        var exprRef, exprValue;
        var node;
        var code = M.body;
        for (var i = 0, j = code.length; i < j; i++) {
            if ((node = code[i])) {
                // tellExecutionContext(node, i, code);
                exprRef = Evaluate(node);
                if (isAbrupt(exprRef=ifAbrupt(exprRef))) {
                    // untellExecutionContext();
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        // untellExecutionContext();
        return NormalCompletion(exprRef);
    }
    evaluation.GeneratorExpression = GeneratorDeclaration;
    evaluation.GeneratorDeclaration = GeneratorDeclaration;
    function GeneratorDeclaration(node) {
        "use strict";
        var params = getCode(node, "params");
        var body = getCode(node, "body");
        var id = node.id;
        var gproto = Get(getIntrinsics(), "%GeneratorPrototype%");
        var scope = getLexEnv();
        var strict = true;
        var closure;
        var isExpression = node.expression;
        var prototype;

        if (isExpression) {
            scope = NewDeclarativeEnvironment(scope);
            closure = GeneratorFunctionCreate("generator", params, body, scope, strict);
            prototype = ObjectCreate(gproto);
            MakeConstructor(closure, true, prototype);
            if (id) {
                scope.CreateMutableBinding(id);
                scope.InitializeBinding(id, closure);
                SetFunctionName(closure, id);
            }
            return closure;
        } else {
            return NormalCompletion(empty);
        }
    }
    evaluation.ArrowExpression = ArrowExpression;
    function ArrowExpression(node) {
        "use strict";
        var F;
        var scope = getLexEnv();
        var body = getCode(node, "body");
        var params = getCode(node, "params");
        var strict = true;
        F = FunctionCreate("arrow", params, body, scope, strict);
        setInternalSlot(F, "ThisMode",  "lexical");
        //MakeConstructor(F);
        return NormalCompletion(F);
    }
    evaluation.FunctionExpression = FunctionDeclaration;
    evaluation.FunctionDeclaration = FunctionDeclaration;
    function FunctionDeclaration(node) {
        "use strict";
        var F;
        var id = node.id;
        var expr = getCode(node,   "expression");
        var params = getCode(node, "params");
        var body = getCode(node,   "body");
        var scope;
        var strict = getContext().strict || node.strict;
        if (expr) {
            if (id) {
                scope = NewDeclarativeEnvironment(getLexEnv());
                status = scope.CreateMutableBinding(id);
                if (isAbrupt(status)) return status;
            } else scope = getLexEnv();
            F = FunctionCreate("normal", params, body, scope, strict);
            if (node.needsSuper) MakeMethod(F, id, undefined);
            MakeConstructor(F);
            if (id) {
                var status;
                status = SetFunctionName(F, id);
                if (isAbrupt(status)) return status;
                status = scope.InitializeBinding(id, F);
                if (isAbrupt(status)) return status;
            }
            return NormalCompletion(F);
        }
        return NormalCompletion(empty);
    }
    function isSuperMemberExpression (node) {
        return node.object.type === "SuperExpression";
    }
    evaluation.MemberExpression = MemberExpression;
    function MemberExpression(node) {
        "use strict";
        var notSuperExpr = !isSuperMemberExpression(node);
        var propertyNameReference;
        var propertyNameValue;
        var propertyNameString;
        var baseReference;
        var baseValue;
        var o = node.object;
        var p = node.property;
        var cx = getContext();
        var strict = cx.strict;
        if (notSuperExpr) {
            baseReference = Evaluate(o);
            baseValue = GetValue(baseReference);
            if (isAbrupt(baseValue = ifAbrupt(baseValue))) return baseValue;
        }
        if (node.computed) {
            propertyNameReference = Evaluate(p);
            if (isAbrupt(propertyNameReference = ifAbrupt(propertyNameReference))) return propertyNameReference;
            propertyNameValue = GetValue(propertyNameReference);
            if (isAbrupt(propertyNameValue = ifAbrupt(propertyNameValue))) return propertyNameValue;
        } else {
            propertyNameValue = p.name || p.value;
        }
        propertyNameString = ToPropertyKey(propertyNameValue);
        if (notSuperExpr) {
            // object.name
            // object[nameExpr]
            var bv = CheckObjectCoercible(baseValue);
            if (isAbrupt(bv = ifAbrupt(bv))) return bv;
            var ref = Reference(propertyNameString, bv, strict);
            return ref;
        } else {
            // super.name
            // super[nameExpr]
            return MakeSuperReference(propertyNameString, strict);
        }
    }
    evaluation.NewExpression = NewExpression;
    function isSuperCallExpression(node) {
        return node.callee.type === "SuperExpression";
    }
    function NewExpression(node) {
        "use strict";
        var exprRef;
        var O, callee;
        var cx = getContext();
        var strict = cx.strict;
        var notSuperExpr = !isSuperCallExpression(node);
        if (notSuperExpr) {
            exprRef = Evaluate(node.callee);
            if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;
            callee = GetValue(exprRef);
        } else {

            exprRef = MakeSuperReference(undefined, strict);
            if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;
            callee = GetValue(exprRef);

        }

        if (isAbrupt(callee = ifAbrupt(callee))) return callee;
        if (!IsConstructor(callee)) return withError("Type", "expected function is not a constructor");
        if (callee) cx.callee = "new " + (Get(callee, "name") || "(anonymous)");
        var args = node.arguments;
        var argList;
        if (args) argList = ArgumentListEvaluation(args);
        else argList = [];
        return callInternalSlot("Construct", callee, argList);
    }
    evaluation.CallExpression = CallExpression;
    function CallExpression(node) {
        "use strict";
        var callee = node.callee;
        var notSuperExpr = !isSuperCallExpression(node);
        var strict = getContext().strict;
        var tailCall = !! node.tailCall;
        var exprRef;
        if (notSuperExpr) {
            exprRef = Evaluate(callee);
            if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;
            return EvaluateCall(exprRef, node.arguments, tailCall);
        } else {
            exprRef = MakeSuperReference(undefined, strict);
            if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;
            return EvaluateCall(exprRef, node.arguments, tailCall);
        }
    }
    evaluation.LexicalDeclaration = VariableDeclaration;
    evaluation.VariableDeclaration = VariableDeclaration;
    function VariableDeclaration(node) {
        "use strict";
        var decl, decl2, init, arr, initializer, status;
        var env = isCodeType(node, "VariableDeclaration") ? (node.kind === "var" ? getVarEnv() : getLexEnv()) : getLexEnv();
        var i, j, p, q, type;
        var name;
        var cx = getContext();
        var strict = cx.strict;
        for (i = 0, j = node.declarations.length; i < j; i++) {
            decl = node.declarations[i];
            type = decl.type;
            if (IsBindingPattern[type]) {
                if (decl.init) initializer = GetValue(Evaluate(decl.init));
                else return withError("Type", "Destructuring Patterns must have some = Initializer.");
                if (isAbrupt(initializer=ifAbrupt(initializer))) return initializer;
                status = BindingInitialisation(decl, initializer, env);
                if (isAbrupt(status = ifAbrupt(status))) return status;


            } else {
                if (decl.init) {
                    name = decl.id.name;
                    initializer = GetValue(Evaluate(decl.init));
                    if (isAbrupt(initializer=ifAbrupt(initializer))) return initializer;
                    if (IsCallable(initializer)) {
                        if (!HasOwnProperty(initializer, "name")) {
                            SetFunctionName(initializer, name);
                        }
                    }
                    status = BindingInitialisation(name, initializer, env);
                    if (isAbrupt(status = ifAbrupt(status))) return status;
                }
            }
        }
        return NormalCompletion();
    }
    function KeyedBindingInitialisation(decl, obj, env) {
        "use strict";
        var elem;
        var val;
        var status;
        var cx = getContext();
        var identName, newName, init, target;
        if (decl.type === "ObjectPattern" || decl.type === "ObjectExpression") {
            var elems = decl.elements||decl.properties;

            for (var p = 0, q = elems.length; p < q; p++) {

                if (elem = elems[p]) {

                    var type = elem.type;
                    if (elem.type == "Identifier") {
                        identName = elem.name || elem.value;
                    } else if (elem.target && IsBindingPattern[as.type]) {
                        identName = elem.id.name;
                        target = elem.target;
                    }

                    if (elem.init) {
                        var initializer = GetValue(Evaluate(elem.init));
                        if (isAbrupt(initializer = ifAbrupt(initializer))) return initializer;
                    }

                    obj = ToObject(obj);
                    if (isAbrupt(obj=ifAbrupt(obj))) return obj;

                    var val = Get(obj, ToString(identName));
                    val = ifAbrupt(val);
                    if (isAbrupt(val)) return val;

                    if (val === undefined && initializer != undefined) {
                        val = initializer;
                    }

                    if (target) {
                        status = KeyedBindingInitialisation(target, val, env);
                        if (isAbrupt(status)) return status;
                    } else {
                        status = InitializeBoundName(identName, val, env);
                        if (isAbrupt(status)) return status;
                    }
                    target = undefined;
                }
            }
        }
        return NormalCompletion();
    }
    evaluation.BindingElement = BindingElement;
    function BindingElement (node) {
        if (node.target) {
            return ResolveBinding(node.target);
        } else {
            return Identifier(node);
        }
    }
    function IteratorBindingInitialisation() {
    }
    function IndexedBindingInitialisation(decl, nextIndex, value, env) {
        "use strict";
        var len = Get(value, "length");
        var elem;
        var index = 0;
        var ref;
        var val;
        var identName, newName;
        var cx = getContext();
        if ((decl && decl.type === "ArrayPattern") /*||
         /* (decl && decl.type === "ArrayExpression")*/) {
            for (var i = 0, j = decl.elements.length; i < j; i++) {
                if (elem = decl.elements[i]) {
                    if (elem.id) {
                        identName = elem.id.name;
                        newName = elem.target.name;
                    } else {
                        identName = elem.name || elem.value;
                        newName = undefined;
                    }
                    /* default initializer */
                    if (elem.init) {
                        var initializer = GetValue(Evaluate(elem.init));
                        if (isAbrupt(initializer = ifAbrupt(initializer))) return initializer;
                    }
                    val = Get(value, ToString(i));
                    val = ifAbrupt(val);
                    if (isAbrupt(val)) return val;
                    if (val === undefined && initializer != undefined) {
                        val = initializer;
                    }
                    // nextIndex = nextIndex + 1
                    if (env !== undefined) {
                        if (newName) env.InitializeBinding(newName, val);
                        else env.InitializeBinding(identName, val);
                    } else {
                        var lref = Evaluate(elem);
                        if (isAbrupt(lref = ifAbrupt(lref))) return lref;
                        PutValue(lref, val);
                    }
                }
            }

        } else if (decl && decl.type === "RestParameter") {
            var array = ArrayCreate(len - nextIndex);
            var name = decl.id;
            for (var i = nextIndex; i < len; i++) {
                elem = value.Get(ToString(i), value);
                if (isAbrupt(elem = ifAbrupt(elem))) return elem;
                array.DefineOwnProperty(ToString(index), {
                    value: elem,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
                index = index + 1;
            }
            if (env !== undefined) {
                env.InitializeBinding(name, array);
            } else {
                var lref = Reference(name, getLexEnv(), getContext().strict);
                if (isAbrupt(lref = ifAbrupt(lref))) return lref;
                PutValue(lref, array);
            }
        }
        return len;
    }

    function getStrict() {
        return getContext().strict;
    }

    function InitializeBoundName(name, value, environment) {
        Assert(Type(name) === STRING, "InitializeBoundName: name has to be a string");
        if (environment != undefined) {
            environment.InitializeBinding(name, value, getStrict());
            return NormalCompletion(undefined);
        } else {
            var lhs = ResolveBinding(name);
            return PutValue(lhs, value);
        }
    }


    function BindingInitialisation(node, value, env) {
        "use strict";
        var names, name, val, got, len, ex, decl, lhs, strict, type, identName;
        var cx = getContext();
        if (!node) return;
        if (Array.isArray(node)) { // F.FormalParameters: formals ist ein Array
            for (var i = 0, j = node.length; i < j; i++) {
                decl = node[i];
                type = decl.type;

                if (type === "ObjectPattern") {
                    ex = KeyedBindingInitialisation(decl, Get(value, ToString(i)), env);
                    if (isAbrupt(ex)) return ex;
                } else if (type === "ArrayPattern") {
                    ex = IndexedBindingInitialisation(decl, undefined, Get(value, ToString(i)), env);
                    if (isAbrupt(ex)) return ex;
                } else if (type === "RestParameter") {
                    ex = IndexedBindingInitialisation(decl, i, value, env);
                    if (isAbrupt(ex)) return ex;
                } else {
                    ex = BindingInitialisation(decl, Get(value, ToString(i)), env);
                    if (isAbrupt(ex)) return ex;
                }
            }
            return NormalCompletion(undefined);
        }
        type = node.type;
        strict = !! cx.strict;
        if (type === "ForDeclaration") {
            return BindingInitialisation(node.id, value, env);
        }
        if (type === "DefaultParameter") {

            name = node.id;
            if (value === undefined) value = GetValue(Evaluate(node.init));


            if (env !== undefined) env.InitializeBinding(name, value, strict);
            else {
                lhs = ResolveBinding(name);
                PutValue(lhs, value);
            }
            return NormalCompletion(undefined);


        }
        if (type === "Identifier") {
            name = node.name;
            if (env !== undefined) {
                ex = env.InitializeBinding(name, value, strict);
                if (isAbrupt(ex)) return ex;
                return NormalCompletion(undefined);
            } else {
                lhs = ResolveBinding(name);
                ex = PutValue(lhs, value);
                if (isAbrupt(ex)) return ex;
                return NormalCompletion(undefined);
            }

        } else if (type === "ArrayPattern" || type === "ArrayExpression") {
            var decl;

            /* coerce to object addition */
            value = ToObject(value);
            if (isAbrupt(value = ifAbrupt(value))) return value;
            /* ...is invalid */
            for (var p = 0, q = node.elements.length; p < q; p++) {
                if (decl = node.elements[p]) {
                    if (decl.type === "RestParameter") {
                        return IndexedBindingInitialisation(decl, p, value, env);
                    } else {
                        if (decl.init) {
                            var initializer = GetValue(Evaluate(decl.init));
                            if (isAbrupt(initializer = ifAbrupt(initializer))) return initializer;
                        }
                        if (env) {
                            if (decl.id) { // is not an identifier, is a "BindingElement"
                                val = Get(value, decl.id.name, value);
                                if (isAbrupt(val = ifAbrupt(val))) return val;
                                if (val == undefined && initializer != undefined) val = initializer;
                                env.InitializeBinding(decl.target.name, val);
                            } else {    // is not a bindingelement, is an "Identifier"
                                val =  Get(value, ToString(p), value);
                                if (isAbrupt(val = ifAbrupt(val))) return val;
                                if (val == undefined && initializer != undefined) val = initializer;
                                env.InitializeBinding(decl.name, val);
                            }
                        } else {
                            if (decl.id) { // BindingElement has el.id and el.target
                                lhs = Evaluate(decl.id);
                                val = Get(value, decl.id.name);
                                if (isAbrupt(val = ifAbrupt(val))) return val;
                                if (val == undefined && initializer != undefined) val = initializer;
                                PutValue(lhs, val);
                            } else { // Identifier has el.name
                                lhs = Evaluate(decl.name);
                                val = Get(value, ToString(p));
                                if (isAbrupt(val = ifAbrupt(val))) return val;
                                if (val == undefined && initializer != undefined) val = initializer;
                                PutValue(lhs, val);
                            }
                        }
                    }
                }
            }
            return NormalCompletion(undefined);
        } else if (type === "ObjectPattern" || type === "ObjectExpression") {
            var decl;
            /* coerce to object addition */

            value = ToObject(value);
            if (isAbrupt(value = ifAbrupt(value))) return value;

            /* read let {length} = "123" on es-discuss, fails at Get() few lines below, that´s why*/
            for (var p = 0, q = node.elements.length; p < q; p++) {
                if (decl = node.elements[p]) {
                    if (decl.init) {
                        var initializer = GetValue(Evaluate(decl.init));
                        if (isAbrupt(initializer = ifAbrupt(initializer))) return initializer;
                    }



                    if (env) {


                        if (decl.id) {
                            val =  Get(value, decl.id.name, value);
                            if (isAbrupt(val=ifAbrupt(val))) return val;
                            if (val === undefined && initializer != undefined) val = initializer;

                            env.InitializeBinding(decl.target.name, val);

                        } else if (decl.type === "Identifier") {
                            val = Get(value, decl.name, value);
                            if (isAbrupt(val=ifAbrupt(val))) return val;
                            if (val === undefined && initializer != undefined) val = initializer;
                            env.InitializeBinding(decl.name, val);
                        } else  {

                        }

                    } else {


                        if (decl.id) {
                            lhs = Evaluate(decl.id);
                            val = Get(value, decl.id.name);
                            if (isAbrupt(val=ifAbrupt(val))) return val;
                            if (val === undefined && initializer != undefined) val = initializer;
                            PutValue(lhs, val);
                        } else if (decl.type === "Identifier") {
                            lhs = Evaluate(decl.name);
                            val =  Get(value, decl.name);
                            if (isAbrupt(val=ifAbrupt(val))) return val;
                            if (val === undefined && initializer != undefined) val = initializer;
                            PutValue(lhs, val);
                        }


                    }
                }
            }
            return NormalCompletion(undefined);

        } else if (typeof node === "string") {
            return InitializeBoundName(node, value, env);
        }
        return NormalCompletion(undefined);
    }
    function EmptyStatement(node) {
        return NormalCompletion(empty);
    }
    evaluation.EmptyStatement = EmptyStatement;
    function DebuggerStatement(node) {
        var loc = node.loc;
        var line = loc && loc.start ? loc.start.line : "bug";
        var column = loc && loc.start ? loc.start.column : "bug";
        banner("DebuggerStatement at line " + (line) + ", " + (column) + "\n");
        banner("stack");
        if (hasConsole) console.dir(getStack());
        else if (hasPrint) print(getStack());
        banner("varenv");
        if (hasConsole) console.dir(getVarEnv());
        else if (hasPrint) print(getVarEnv());
        banner("lexenv");
        if (hasConsole) console.dir(getLexEnv());
        else if (hasPrint) print(getLexEnv());
        banner("realm");
        if (hasConsole) console.dir(getRealm());
        else if (hasPrint) print(getRealm());
        banner("DebuggerStatement end");
        return NormalCompletion(undefined);
    }
    evaluation.DebuggerStatement = DebuggerStatement;
    function RegularExpressionLiteral(node) {
        var source = node.value;
        var flags = node.flags;
        return RegExpCreate(source, flags);
    }
    evaluation.RegularExpressionLiteral = RegularExpressionLiteral;
    evaluation.StringLiteral = StringLiteral;
    function StringLiteral(node) {
        return node.computed || unquote(node.value);
    }
    evaluation.NumericLiteral = NumericLiteral;
    function NumericLiteral(node) {
        if (node && node.computed) return MV(node.computed);
        return MV(node.value);
        // return +node.value;
    }
    evaluation.NullLiteral = NullLiteral;
    function NullLiteral(node) {
        return null;
    }
    evaluation.BooleanLiteral = BooleanLiteral;
    function BooleanLiteral(node) {
        return node.value === "true";
    }
    evaluation.Literal = Literal;
    function Literal(node) {
        //if (node.longName) return evaluation[node.longName](node);
        return node.value;
    }
    evaluation.ThisExpression = ThisExpression;
    function ThisExpression(node) {
        return ThisResolution();
    }
    evaluation.Identifier = Identifier;
    function Identifier(node) {
        var name = node.name || node.value;
        var lex = getLexEnv();
        var cx = getContext();
        var strict = cx.strict;
        return GetIdentifierReference(lex, name, strict);
    }
    evaluation.Elision = Elision;
    function Elision(node) {
        return node.width;
    }
    function ArrayAccumulation(elementList, array, nextIndex) {
        "use strict";
        var exprRef;
        var exprValue;
        var i, j = elementList.length;
        var element;

        for (i = 0; i < j; i++) {
            element = elementList[i];

            if (element.type === "Elision") {

                nextIndex += element.width;

            } else if (element.type === "SpreadExpression") {

                var spreadRef = Evaluate(element);
                var spreadObj = GetValue(spreadRef);
                if (isAbrupt(spreadObj=ifAbrupt(spreadObj))) return spreadObj;
                var spreadLen = Get(spreadObj, "length");
                if (isAbrupt(spreadLen=ifAbrupt(spreadLen))) return spreadLen;

                for (var k = 0; k < spreadLen; k++) {

                    exprValue = Get(spreadObj, ToString(k));
                    if (isAbrupt(exprValue = ifAbrupt(exprValue))) return exprValue;

                    callInternalSlot("DefineOwnProperty", array, ToString(nextIndex), {
                        writable: true,
                        value: exprValue,
                        enumerable: true,
                        configurable: true
                    });

                    nextIndex = nextIndex + 1;
                }

            } else {

                exprRef = Evaluate(element);
                if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;
                exprValue = GetValue(exprRef);
                if (isAbrupt(exprValue = ifAbrupt(exprValue))) return exprValue;

                callInternalSlot("DefineOwnProperty", array, ToString(nextIndex), {
                    writable: true,
                    value: exprValue,
                    enumerable: true,
                    configurable: true
                });

                nextIndex = nextIndex + 1;
            }
        }
        return nextIndex;
    }
    evaluation.ArrayExpression = ArrayExpression;
    function ArrayExpression(node) {
        var j = node.elements.length;
        var array, pad, nextIndex;
        var element;
        if (j === 1) {
            element = node.elements[0];
            if (element.type === "Elision") {
                array = ArrayCreate(0);
                pad = element.width;
                ArraySetLength(array,{
                    value: pad,
                    writable: true,
                    enumerable: false,
                    configurable: false
                });

                return array;
            }
        }
        array = ArrayCreate(0);
        nextIndex = 0;
        nextIndex = ArrayAccumulation(node.elements, array, nextIndex);
        if (isAbrupt(nextIndex = ifAbrupt(nextIndex))) return nextIndex;
        ArraySetLength(array, {
            value: nextIndex,
            writable: true,
            enumerable: false,
            configurable: false
        });

        return NormalCompletion(array);
    }
    evaluation.PropertyDefinition = PropertyDefinition;
    function PropertyDefinition(newObj, propertyDefinition) {
        "use strict";

        var kind = propertyDefinition.kind;
        var key =  propertyDefinition.key;
        var node = propertyDefinition.value;
        var computed = propertyDefinition.computed;
        var status;
        var strict = node.strict;
        var propRef, propName, propValue;

        /* I refactored it today, but resetted it tonight, i rewrite it tomorrow */

        // TOMORROW ? (FOUR DAYS AGO)

        if (kind == "init") {

            // prop key
            if (computed) {
                var symRef = Evaluate(key);
                var symValue = GetValue(symRef);

                if (isAbrupt(symValue = ifAbrupt(symValue))) return symValue;

                if (!IsSymbol(symValue)) symValue = ToString(symValue);
                if (isAbrupt(symValue = ifAbrupt(symValue))) return symValue;

                if (!IsPropertyKey(symValue)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");

                propName = symValue;
            } else {

                // init
                propName = ToString(PropName(key));
                if (isAbrupt(propName=ifAbrupt(propName))) return propName;

            }

            // value
            if (isCodeType(node, "FunctionDeclaration")) {

                status = defineFunctionOnObject(node, newObj, propName);
                if (isAbrupt(status)) return status;

            } else {

                propRef = Evaluate(node, newObj);
                if (isAbrupt(propRef = ifAbrupt(propRef))) return propRef;
                propValue = GetValue(propRef);
                if (isAbrupt(propValue = ifAbrupt(propValue))) return propValue;
                // B 3.
                // DOESNT WORK
                if (!computed && (propName === "__proto__")) {
                    if (Type(propValue) === OBJECT || propValue === null) {
                        return callInternalSlot("SetPrototypeOf", newObj, propValue);
                    }
                    return NormalCompletion(empty);
                }
                // FOR NOW
                status = CreateDataProperty(newObj, propName, propValue);
                if (isAbrupt(status)) return status;
            }
        } else if (kind === "method") {
            propValue = Evaluate(node, newObj);
            if (isAbrupt(propValue = ifAbrupt(propValue))) return propValue;

        } else if (kind === "get" || kind === "set") {

            // get [s] () { return 10 }
            if (node.computed) {
                propName = GetValue(Evaluate(key));
                if (isAbrupt(propName = ifAbrupt(propName))) return propName;
                if (!IsSymbol(propName)) propName = ToString(propName);
                if (isAbrupt(propName = ifAbrupt(propName))) return propName;
                if (!IsPropertyKey(propName)) return withError("Type", "A [computed] property has to evaluate to valid property key");

            } else {
                propName = typeof key === "string" ? key : key.name || key.value;
            }
            defineGetterOrSetterOnObject(node, newObj, propName, kind);
        }
    }
    function defineFunctionOnObject (node, newObj, propName) {
        "use strict";
        var cx = getContext();
        var scope = getLexEnv();
        var body = getCode(node, "body");
        var formals = getCode(node, "params");
        var strict = cx.strict || node.strict;
        var fproto = Get(getIntrinsics(), "%FunctionPrototype%");
        var id = node.id;
        var generator = node.generator;
        var propValue;
        var methodName = propName;
        if (id) {
            scope = NewDeclarativeEnvironment(scope);
            scope.CreateMutableBinding(id);
        }
        if (ReferencesSuper(node)) {
            var home = getLexEnv().GetSuperBase();
            //getInternalSlot(object, "HomeObject");
        } else {
            methodName = undefined;
            home = undefined;
        }

        if (generator) propValue = GeneratorFunctionCreate("method", formals, body, scope, strict, fproto, home, methodName);
        else propValue = FunctionCreate("method", formals, body, scope, strict, fproto, home, methodName);

        if (id) scope.InitializeBinding(id, propValue);

        MakeConstructor(propValue);
        SetFunctionName(propValue, propName);
        CreateDataProperty(newObj, propName, propValue);

    }
    function defineGetterOrSetterOnObject (node, newObj, propName, kind) {

        var scope = getLexEnv();
        var body = getCode(node, "body");
        var formals = getCode(node, "params");
        var functionPrototype = getIntrinsic("%FunctionPrototype%");
        var strict = node.strict;
        var methodName;
        var propValue;
        var status;
        if (ReferencesSuper(node)) {
            var home = getLexEnv().GetSuperBase();
            methodName = propName;
        } else {
            home = undefined;
            methodName = undefined
        }
        //getInternalSlot(object, "HomeObject");
        propValue = FunctionCreate("method", formals, body, scope, strict, functionPrototype, home, methodName);

        var desc = kind == "get" ? {
            get: propValue,
            enumerable: true,
            configurable: true
        } : {
            set: propValue,
            enumerable: true,
            configurable: true
        };

        SetFunctionName(propValue, propName, kind);
        status = DefineOwnPropertyOrThrow(newObj, propName, desc);
        if (isAbrupt(status)) return status;

    }
    evaluation.ObjectExpression = ObjectExpression;
    function ObjectExpression(node) {
        "use strict";
        var props = getCode(node, "properties");
        var newObj = ObjectCreate();
        var status;
        for (var i = 0, j = props.length; i < j; i++) {
            status = PropertyDefinition(newObj, props[i]);
            if (isAbrupt(status)) return status;
        }
        return NormalCompletion(newObj);
    }
    evaluation.AssignmentExpression = AssignmentExpression;
    evaluation.ObjectPattern = ObjectPattern;
    function ObjectPattern(node) {
        var rref = Evaluate(node.init);
        var rval = GetValue(rref);
        if (isAbrupt(rval=ifAbrupt(rval))) return rval;
        return DestructuringAssignmentEvaluation(node, rval, "=");
    }
    function IteratorDestructuringEvaluation() {}
    function DestructuringAssignmentEvaluation(left, rval, op) {
        "use strict";
        var leftElems = left.elements;
        var type = left.type;

        var lval;
        var lref;
        var result;
        var l, i, j;
        var obj, array;

        if (type === "ObjectPattern" || type === "ObjectExpression") {

            obj = rval;
            var identName, newName;

            if (Type(rval) !== OBJECT) return withError("Type", "can not desctructure a non-object into some object");

            for (i = 0, j = leftElems.length; i < j; i++) {
                var lel = leftElems[i];
                if (lel.id) identName = lel.id.name;
                else identName = lel.name;
                lval = GetValue(Evaluate(lel));
                rval = Get(obj, identName);
                result = getAssignmentOperationResult(op, lval, rval);
                var target;
                if (lel.target) {
                    if (IsBindingPattern[lel.target.type]) {
                        console.log("BINDINGPATTERN")
                        status = DestructuringAssignmentEvaluation(lel.target, result, op);
                        if (isAbrupt(status)) return status;
                    } else {
                        console.log("TARGET")
                        target = Evaluate(lel.target);
                        if (isAbrupt(target)) return target;
                        PutValue(target, result);
                    }
                } else {
                    getLexEnv().SetMutableBinding(identName, result);
                }
                target = undefined;
            }
            return NormalCompletion(result);
        } else if (type === "ArrayPattern" || type === "ArrayExpression") {
            array = rval;
            if (Type(array) !== OBJECT) return withError("Type", "can not desctructure a non-object into some object");
            var width;
            var index = 0;
            var len = Get(array, "length");
            var status;

            for (i = 0, j = leftElems.length; i < j; i++) {
                var lel = leftElems[i];

                var ltype = lel.type;
                if (ltype === "SpreadExpression") { // === REST! Achtung

                    var rest = ArrayCreate(0);
                    var restName = BoundNames(lel.argument)[0];
                    var index2 = 0;

                    while (index < len) {
                        lval = Get(array, ToString(index));
                        result = getAssignmentOperationResult(op, lval, rval);
                        status = callInternalSlot("DefineOwnProperty", rest, ToString(index2), {
                            value: result,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                        if (isAbrupt(status)) return status;
                        index += 1;
                        index2 += 1;
                    }
                    getLexEnv().SetMutableBinding(restName, rest);
                    break;

                } else if (ltype === "Elision") {

                    index += node.width - 1;
                    result = undefined;

                } else {

                    l = lel.value || lel.name;
                    rval = Get(array, ToString(index));
                    if (isAbrupt(rval=ifAbrupt(rval))) return rval;
                    lval = GetValue(Evaluate(lel));
                    if (isAbrupt(lval=ifAbrupt(lval))) return lval;
                    result = getAssignmentOperationResult(op, lval, rval);
                    status = getLexEnv().SetMutableBinding(l, result);
                    if (isAbrupt(status)) return status;
                    index = index + 1;
                }
            }


            return NormalCompletion(result);
        }
    }
    function AssignmentExpression(node) {
        var lref, rref;
        var lval, rval;
        var base, name;
        var op = node.operator;
        var result, status;
        var ltype = node.left.type;
        if (ltype === "Identifier") {
            lref = Evaluate(node.left);
            rref = Evaluate(node.right);
            if (isAbrupt(lref = ifAbrupt(lref))) return lref;
            if (isAbrupt(rref = ifAbrupt(rref))) return rref;
            lval = GetValue(lref);
            rval = GetValue(rref);
            if (isAbrupt(lval = ifAbrupt(lval))) return lval;
            if (isAbrupt(rval = ifAbrupt(rval))) return rval;
            result = getAssignmentOperationResult(op, lval, rval);
            status = PutValue(lref, result);
            if (isAbrupt(status)) return status;
        } else if (ltype === "MemberExpression") {
            lref = Evaluate(node.left);
            if (isAbrupt(lref = ifAbrupt(lref))) return lref;
            rref = Evaluate(node.right);
            if (isAbrupt(rref = ifAbrupt(rref))) return rref;
            lval = GetValue(lref);
            rval = GetValue(rref);
            if (isAbrupt(lval = ifAbrupt(lval))) return lval;
            if (isAbrupt(rval = ifAbrupt(rval))) return rval;
            result = getAssignmentOperationResult(op, lval, rval);
            status = Put(lref.base, lref.name, result, false);
            if (isAbrupt(status)) return status;
        } else if (isValidSimpleAssignmentTarget[ltype]) {
            rref = Evaluate(node.right);
            if (isAbrupt(rref = ifAbrupt(rref))) return rref;
            rval = GetValue(rref);
            if (isAbrupt(rval = ifAbrupt(rval))) return rval;
            return DestructuringAssignmentEvaluation(node.left, rval, node.operator);
        } else {
            return withError("Reference", "Currently not a valid lefthandside expression for assignment")
        }
        return NormalCompletion(result);
    }
    evaluation.ConditionalExpression = ConditionalExpression;

    ecma.getAssignmentOperationResult = getAssignmentOperationResult;
    function getAssignmentOperationResult(op, lval, rval) {
        switch (op) {
            case "=": return rval;
            case "+=": return lval + rval;
            case "%=": return lval % rval;
            case "/=": return lval / rval;
            case "*=": return lval * rval;
            case "-=": return lval - rval;
            case "^=": return lval ^ rval;
            case "|=": return lval | rval;
            case "&=": return lval & rval;
            case ">>>=": return lval >>> rval;
        }
    }

    function ConditionalExpression(node) {
        var testExpr = node.test;
        var trueExpr = node.consequent;
        var falseExpr = node.alternate;
        var exprRef = Evaluate(testExpr);
        var exprValue = GetValue(exprRef);
        if (isAbrupt(exprValue)) return exprValue;
        if (exprValue) {
            var trueRef = Evaluate(trueExpr);
            if (isAbrupt(trueRef = ifAbrupt(trueRef))) return trueRef;
            var trueValue = GetValue(trueRef);

            if (isAbrupt(trueValue = ifAbrupt(trueValue))) return trueValue;
            return NormalCompletion(trueValue);
        } else {
            var falseRef = Evaluate(falseExpr);
            if (isAbrupt(falseRef = ifAbrupt(falseRef))) return falseRef;
            var falseValue = GetValue(falseRef);
            if (isAbrupt(falseValue = ifAbrupt(falseValue))) return falseValue;
            return NormalCompletion(falseValue);
        }
    }
    var lazyTypes = Object.create(null);
    lazyTypes[OBJECT] = "object";
    lazyTypes[NUMBER] = "number";
    lazyTypes[SYMBOL] = "symbol";
    lazyTypes[STRING] = "string";
    lazyTypes[NULL] = "null";
    lazyTypes[UNDEFINED] = "undefined";

    function UnaryExpression(node) {
        var status;
        var isPrefixOperation = node.prefix;
        var oldValue, newValue, val;
        var op = node.operator;
        var argument = getCode(node, "argument");
        var exprRef = Evaluate(argument);
        if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;
        if (op === "typeof") {
            if (Type(exprRef) === REFERENCE) {
                if (IsUnresolvableReference(exprRef)) return NormalCompletion("undefined");
                val = GetValue(exprRef);
            } else val = exprRef;
            if (isAbrupt(val = ifAbrupt(val))) return val;
            var lazyTypeString = lazyTypes[Type(val)];
            if (IsCallable(val)) return NormalCompletion("function");
            if (val === null) return NormalCompletion("object");
            return NormalCompletion(lazyTypeString);
        } else if (op === "void") {
            oldValue = GetValue(exprRef);
            return NormalCompletion(undefined);
        } else if (op === "delete") {
            if (Type(exprRef) !== REFERENCE) return true;
            if (IsUnresolvableReference(exprRef)) {
                if (IsStrictReference(exprRef)) return withError("Syntax", "Can not delete unresolvable and strict reference.");
                return true;
            }
            if (IsPropertyReference(exprRef)) {
                if (IsSuperReference(exprRef)) return withError("Reference", "Can not delete a super reference.");
                var deleteStatus = Delete(ToObject(GetBase(exprRef), GetReferenceName(exprRef)));
                deleteStatus = ifAbrupt(deleteStatus);
                if (isAbrupt(deleteStatus)) return deleteStatus;
                if (deleteStatus === false && IsStrictReference(exprRef)) return withError("Type", "deleteStatus is false and IsStrictReference is true.");
                return deleteStatus;
            } else {
                var bindings = GetBase(exprRef);
                return bindings.DeleteBinding(GetReferencedName(exprRef));
            }
        } else if (isPrefixOperation) {
            switch (op) {
                case "!!":
                    oldValue = GetValue(exprRef);
                    if (isAbrupt(oldValue)) return oldValue;
                    return NormalCompletion(ToBoolean(oldValue));
                case "~":
                    oldValue = ToNumber(GetValue(exprRef));
                    if (isAbrupt(oldValue)) return oldValue;
                    newValue = ~oldValue;
                    return NormalCompletion(newValue);
                case "!":
                    oldValue = ToBoolean(GetValue(exprRef));
                    if (isAbrupt(oldValue)) return oldValue;
                    newValue = !oldValue;
                    return NormalCompletion(newValue);
                case "+":
                    oldValue = GetValue(exprRef);
                    if (isAbrupt(oldValue)) return oldValue;
                    newValue = ToNumber(oldValue);
                    if (isAbrupt(newValue)) return newValue;
                    return NormalCompletion(newValue);
                    break;
                case "-":
                    oldValue = GetValue(exprRef);
                    newValue = ToNumber(oldValue);
                    if (isAbrupt(newValue)) return newValue;
                    return NormalCompletion(-newValue);
                    break;
                case "++":
                    oldValue = ToNumber(GetValue(exprRef));
                    if (isAbrupt(oldValue=ifAbrupt(oldValue))) return oldValue;
                    newValue = oldValue + 1;
                    status = PutValue(exprRef, newValue);
                    if (isAbrupt(status)) return status;
                    return NormalCompletion(newValue);
                    break;
                case "--":
                    oldValue = ToNumber(GetValue(exprRef));
                    if (isAbrupt(oldValue=ifAbrupt(oldValue))) return oldValue;
                    newValue = oldValue - 1;
                    status = PutValue(exprRef, newValue);
                    if (isAbrupt(status)) return status;
                    return NormalCompletion(newValue);
                    break;
            }
        } else {
            switch (op) {
                case "++":
                    oldValue = ToNumber(GetValue(exprRef));
                    if (isAbrupt(oldValue)) return oldValue;
                    oldValue = unwrap(oldValue);
                    newValue = oldValue + 1;
                    status = PutValue(exprRef, newValue);
                    if (isAbrupt(status)) return status;
                    return NormalCompletion(oldValue);
                case "--":
                    oldValue = ToNumber(GetValue(exprRef));
                    if (isAbrupt(oldValue)) return oldValue;
                    oldValue = unwrap(oldValue);
                    newValue = oldValue - 1;
                    status = PutValue(exprRef, newValue);
                    if (isAbrupt(status)) return status;
                    return NormalCompletion(oldValue);
                    break;
            }

        }
    }
    evaluation.UnaryExpression = UnaryExpression;
    evaluation.BinaryExpression = BinaryExpression;
    function instanceOfOperator(O, C) {
        if (Type(C) !== OBJECT) return withError("Type", "instanceOfOperator: C is not an object.");
        var instHandler = GetMethod(C, $$hasInstance);
        if (isAbrupt(instHandler)) return instHandler;
        if (instHandler) {
            if (!IsCallable(instHandler)) return withError("Type", "instanceOfOperator: [@@hasInstance] is expected to be a callable.");
            var result = instHandler.Call(C, [O]);
            return ToBoolean(result);
        }
        if (IsCallable(C) === false) return withError("Type", "instanceOfOperator: C ist not callable.");
        return OrdinaryHasInstance(C, O);
    }
    function BinaryExpression(node) {

        var op = node.operator;

        var lref = Evaluate(node.left);
        if (isAbrupt(lref = ifAbrupt(lref))) return lref;
        var rref = Evaluate(node.right);
        if (isAbrupt(rref = ifAbrupt(rref))) return rref;

        var lval = GetValue(lref);
        if (isAbrupt(lval = ifAbrupt(lval))) return lval;
        var rval = GetValue(rref);
        if (isAbrupt(rval = ifAbrupt(rval))) return rval;

        var result;
        switch (op) {
            /*case "of":                    
             var value = Invoke(ToObject(rval), "valueOf");
             return SameValue(rval, lval);*/
            case "in":
                return HasProperty(rval, ToPropertyKey(lval));
            case "<":
                return NormalCompletion(lval < rval);
            case ">":
                return NormalCompletion(lval > rval);
            case "<=":
                return NormalCompletion(lval <= rval);
            case ">=":
                return NormalCompletion(lval >= rval);
            case "+":
                return NormalCompletion(lval + rval);
            case "-":
                return NormalCompletion(lval - rval);
            case "*":
                return NormalCompletion(lval * rval);
            case "/":
                return NormalCompletion(lval / rval);
            case "^":
                return NormalCompletion(lval ^ rval);
            case "%":
                return NormalCompletion(lval % rval);
            case "===":
                return NormalCompletion(lval === rval);
            case "!==":
                return NormalCompletion(lval !== rval);
            case "==":
                return NormalCompletion(lval == rval);
            case "!=":
                return NormalCompletion(lval != rval);
            case "&&":
                return NormalCompletion(lval && rval);
            case "||":
                return NormalCompletion(lval || rval);
            case "|":
                return NormalCompletion(lval | rval);
            case "&":
                return NormalCompletion(lval & rval);
            case "<<":
                return NormalCompletion(lval << rval);
            case ">>":
                return NormalCompletion(lval >> rval);
            case ">>>":
                return NormalCompletion(lval >>> rval);
            case "instanceof":
                return NormalCompletion(instanceOfOperator(lval, rval));
        }

        return NormalCompletion(result); // NormalCompletion(result);
    }
    evaluation.ExpressionStatement = ExpressionStatement;

    function ExpressionStatement(node) {
        return Evaluate(node.expression);
    }
    evaluation.ParenthesizedExpression = ParenthesizedExpression;
    function ParenthesizedExpression (node) {
        return Evaluate(node.expression);
    }

    evaluation.SequenceExpression = SequenceExpression;
    function SequenceExpression(node) {
        var exprRef, exprValue;
        var list = node.sequence;
        var V = undefined;
        var item;
        for (var i = 0, j = list.length; i < j; i += 1) {
            if (item = list[i]) {
                // tellExecutionContext(item, i, list);
                exprRef = Evaluate(item);
                if (isAbrupt(exprRef)) {
                    // untellExecutionContext();
                    return exprRef;
                }
                exprValue = GetValue(exprRef);
                if (isAbrupt(exprValue)) {
                    // untellExecutionContext();
                    return exprValue;
                }
                if (exprValue !== empty) V = exprValue;
            }
        }
        // untellExecutionContext();
        return NormalCompletion(V);
    }
    evaluation.FunctionStatementList = StatementList;
    evaluation.StatementList = StatementList;
    function StatementList(stmtList) {
        var stmtRef, stmtValue, stmt;

        var index = 0;

        var gen = getContext().generator;
        if (gen) {
            if (hasConsole) console.log("## generator function executing ##");
            // set Instruction Index to saved Index + 1
        }

        var V = undefined;
        for (var i = index, j = stmtList.length; i < j; i++) {
            if (stmt = stmtList[i]) {

                // tellExecutionContext(stmt, i, stmtList);
                stmtRef = Evaluate(stmt);
                stmtValue = GetValue(stmtRef);

                if (isAbrupt(stmtValue)) return stmtValue;
                if (stmtValue !== empty) V = stmtValue;
            }
        }
        return NormalCompletion(V);
    }
    evaluation.BlockStatement = BlockStatement;
    function BlockStatement(node) {
        var stmtList = getCode(node, "body");

        var oldEnv = getLexEnv();
        var blockEnv = NewDeclarativeEnvironment(oldEnv);

        var status = InstantiateBlockDeclaration(stmtList, blockEnv);
        if (isAbrupt(status)) {
            return status;
        }

        getContext().LexEnv = blockEnv;
        status = evaluation.StatementList(stmtList);
        getContext().LexEnv = oldEnv;
        if (isAbrupt(status)) return status;
        return NormalCompletion(empty);

    }
    evaluation.IfStatement = IfStatement;
    function IfStatement(node) {
        var test = node.test;
        var ok = node.consequent;
        var not = node.alternate;
        var rval;
        if (not) {
            rval = GetValue(Evaluate(test)) ? GetValue(Evaluate(ok)) : GetValue(Evaluate(not));
        } else {
            if (GetValue(Evaluate(test))) rval = GetValue(Evaluate(ok));
        }
        return NormalCompletion();
    }
    function LoopContinues(completion, labelSet) {
        debug("LoopContinues:");
        debugdir(completion);
        debugdir(labelSet);
        // -- inconsistency fix
        if (completion instanceof CompletionRecord === false) return true;
        // --- reg. code
        if (completion.type === "normal") return true;
        if (completion.type !== "continue") return false;
        if (completion.target === "" || completion.target === undefined) return true;
        return labelSet && labelSet[completion.target];

    }
    evaluation.WhileStatement = WhileStatement;
    function WhileStatement(node, labelSet) {

        var test = node.test;
        var body = getCode(node, "body");
        var exprRef, exprValue;
        var V, stmt;
        labelSet = labelSet || Object.create(null);

        for (;;) {

            var testRef = Evaluate(test);
            if (isAbrupt(testRef = ifAbrupt(testRef))) return testRef;
            var testValue = GetValue(testRef);
            if (isAbrupt(testValue = ifAbrupt(testValue))) return testValue;

            if (ToBoolean(testValue) === false) {
                return NormalCompletion(V);
            }
            exprRef = Evaluate(body);
            exprValue = GetValue(exprRef);
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            V = unwrap(exprValue);

        }

    }
    function DoWhileStatement(node, labelSet) {
        var test = node.test;
        var body = getCode(node, "body");
        var exprRef, exprValue;
        var V, stmt;
        labelSet = labelSet || Object.create(null);

        for (;;) {

            exprRef = Evaluate(body);
            exprValue = GetValue(exprRef);
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            V = unwrap(exprValue);

            var testRef = Evaluate(test);
            if (isAbrupt(testRef = ifAbrupt(testRef))) return testRef;
            var testValue = GetValue(testRef);
            if (isAbrupt(testValue = ifAbrupt(testValue))) return testValue;

            if (ToBoolean(testValue) === false) {
                return NormalCompletion(V);
            }
        }
    }
    evaluation.DoWhileStatement = DoWhileStatement;
    evaluation.ForDeclaration = ForDeclaration;
    function ForDeclaration(node) {
        var kind = node.kind;
        var id = node.id;
        return Evaluate(node.id);
    }

    function ForInOfExpressionEvaluation(expr, iterationKind, labelSet) {
        var exprRef = Evaluate(expr);
        var exprValue = GetValue(exprRef);
        var iterator, obj, keys;
        if (isAbrupt(exprValue = ifAbrupt(exprValue))) {
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            else return Completion("break");
        }

        if (exprValue === null || exprValue === undefined) return Completion("break");
        obj = ToObject(exprValue);
        if (iterationKind === "enumerate") {

            keys = Enumerate(obj);

        } else if (iterationKind === "iterate") {

            iterator = Invoke(obj, $$iterator, []);
            keys = ToObject(iterator);

        } else if (iterationKind) {
            return withError("Type", "ForInOfExpression: iterationKind is neither enumerate nor iterate.");
        }

        if (isAbrupt(keys)) {
            if (keys.type === "throw") return keys;
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            Assert(keys.type === "continue", "invalid completion value: "+keys.type);
            return Completion("break");
        }
        return keys;

    }
    function ForInOfBodyEvaluation(lhs, stmt, keys, lhsKind, labelSet) {
        "use strict";
        var oldEnv = getLexEnv();
        var noArgs = [];
        var V;
        var nextResult, nextValue, done, status;
        var rval, lhsRef;
        var names = BoundNames(lhs);

        for (;;) {
            nextResult = Invoke(keys, "next", noArgs);
            if (isAbrupt(nextResult = ifAbrupt(nextResult))) return nextResult;
            if (Type(nextResult) !== OBJECT) return withError("Type", "ForInOfBodyEvaluation: nextResult is not an object");
            done = IteratorComplete(nextResult);
            if (isAbrupt(done = ifAbrupt(done))) return done;
            if (done === true) return NormalCompletion(V);
            nextValue = IteratorValue(nextResult);
            if (isAbrupt(nextValue = ifAbrupt(nextValue))) return nextValue;
            if (lhsKind === "assignment") {

                if (!IsBindingPattern[lhs.type]) {
                    lhsRef = Evaluate(lhs);
                    status = PutValue(lhsRef, nextValue);
                } else {
                    rval = ToObject(nextValue);
                    if (isAbrupt(rval)) status = rval;
                    else status = DestructuringAssignmentEvaluation(lhs, rval);
                }

            } else if (lhsKind === "varBinding") {
                status = BindingInitialisation(lhs, nextValue, undefined);
            } else {
                Assert(lhsKind === "lexicalBinding", "lhsKind has to be a lexical Binding");
                // Assert(lhs == ForDeclaration);
                var iterationEnv = NewDeclarativeEnvironment(oldEnv);
                for (var i = 0, j = names.length; i < j; i++) {
                    iterationEnv.CreateMutableBinding(names[i], true);
                }
                getContext().LexEnv = iterationEnv;
                status = BindingInitialisation(lhs, nextValue, iterationEnv);
                if (isAbrupt(status)) {
                    getContext().LexEnv = oldEnv;
                    return status;
                }
                status = NormalCompletion(undefined);

            }

            if (!isAbrupt(status)) {
                status = Evaluate(stmt);
                if (status instanceof CompletionRecord) {
                    if (status.type === "normal" && status.value !== empty) V = status.value;
                }
            }

            getContext().LexEnv = oldEnv;
            if (isAbrupt(status) && LoopContinues(status, labelSet) === false) return status;
        }
    }
    function ForInStatement(node, labelSet) {
        var left = node.left;
        var right = node.right;
        var body = getCode(node, "body");
        var tleft = left.type;
        var tright = right.type;


        labelSet = labelSet || Object.create(null);
        var lhsKind = "assignment";
        var iterationKind = "enumerate";

        var keyResult = ForInOfExpressionEvaluation(right, iterationKind, labelSet);
        return ForInOfBodyEvaluation(left, body, keyResult, lhsKind, labelSet);
    }
    evaluation.ForInStatement = ForInStatement;
    function ForOfStatement(node, labelSet) {
        "use strict";
        var left = node.left;
        var right = node.right;
        var body = getCode(node, "body");
        var tleft = left.type;
        var tright = right.type;
        var labelSet = labelSet || Object.create(null);
        var lhsKind;
        var iterationKind = "iterate";

        lhsKind = "assignment";

        if (IsLexicalDeclaration(left)) {
            lhsKind = "lexicalBinding";
        } else {
            lhsKind = "varBinding";
        }

        var keyResult = ForInOfExpressionEvaluation(right, iterationKind, labelSet);
        return ForInOfBodyEvaluation(left, body, keyResult, lhsKind, labelSet);
    }
    evaluation.ForOfStatement = ForOfStatement;
    function LabelledEvaluation(node, labelSet) {
        var result;
        var type = node.type;
        var fn = evaluation[type];
        if (fn) result = fn(node, labelSet);
        else throw new SyntaxError("can not evaluate " + type + atLineCol());
        return NormalCompletion(result);
    }
    evaluation.LabelledStatement = LabelledStatement;
    function LabelledStatement(node) {
        var exists;
        var label = node.label.name || node.label.value;
        var statement = node.statement;
        var labelSet = labelSet || Object.create(null);

        if (!labelSet) {
            exists = false;
            labelSet = Object.create(null);

        } else exists = true;

        labelSet[label] = node;

        var result = LabelledEvaluation(statement, labelSet);
        //if (!exists) cx.labelSet = undefined;
        return result;
    }
    evaluation.ForStatement = ForStatement;
    function ForStatement(node, labelSet) {
        "use strict";
        var initExpr = node.init;
        var testExpr = node.test;
        var incrExpr = node.update;
        var body = getCode(node, "body");
        var exprRef, exprValue;
        var varDcl, isConst, dn, forDcl;
        var oldEnv, loopEnv, bodyResult;
        var cx = getContext();
        // FRESH BINDINGS

        var perIterationBindings = [];

        if (!labelSet) {
            labelSet = Object.create(null);
            //cx.labelSet = labelSet;
        }
        if (initExpr) {
            if (IsVarDeclaration(initExpr)) {
                varDcl = Evaluate(initExpr);
                if (!LoopContinues(varDcl, labelSet)) return varDcl;
                return ForBodyEvaluation(testExpr, incrExpr, body, labelSet, perIterationBindings);
            } else if (IsLexicalDeclaration(initExpr)) {
                oldEnv = getLexEnv();
                loopEnv = NewDeclarativeEnvironment(oldEnv);
                isConst = IsConstantDeclaration(initExpr);
                for (var i = 0, j = initExpr.declarations.length; i < j; i++) {
                    var names = BoundNames(initExpr.declarations[i]);
                    for (var y = 0, z = names.length; y < z; y++) {
                        var dn = names[y];
                        if (isConst) {
                            loopEnv.CreateImmutableBinding(dn);
                        } else {
                            loopEnv.CreateMutableBinding(dn, false);

                            // FRESH BINDINGS: collect the names here
                            perIterationBindings.push(dn);
                        }
                    }
                }
                getContext().LexEnv = loopEnv;
                forDcl = Evaluate(initExpr);
                if (!LoopContinues(forDcl, labelSet)) {
                    getContext().LexEnv = oldEnv;
                    return forDcl;
                }
                // FRESH BINDINGS: set the perI
                if (isConst) perIterationBindings = [];
                bodyResult = ForBodyEvaluation(testExpr, incrExpr, body, labelSet, perIterationBindings);
                getContext().LexEnv = oldEnv;
                return bodyResult;

            } else {
                var exprRef = Evaluate(initExpr);
                var exprValue = GetValue(exprRef);
                if (!LoopContinues(exprValue, labelSet)) return exprValue;
                return ForBodyEvaluation(testExpr, incrExpr, body, labelSet, perIterationBindings);
            }
        }

    }
    function CreatePerIterationEnvironment(perIterationBindings) {
        var len = perIterationBindings.length;
        if (len) {
            var lastIterationEnv = getLexEnv();
            var outer = lastIterationEnv.outer;
            Assert(outer != null, "CreatePerIterationEnvironment: outer MUST NOT be null");
            var thisIterationEnv = NewDeclarativeEnvironment(outer);
            for (var i = 0; i < len; i++) {
                var bn = perIterationBindings[i];
                var status = thisIterationEnv.CreateMutableBinding(bn, false);
                Assert(!isAbrupt(status), "status may not be an abrupt completion");
                var lastValue = lastIterationEnv.GetBindingValue(bn);
                if (isAbrupt(lastValue = ifAbrupt(lastValue))) return lastValue;
                thisIterationEnv.InitializeBinding(bn, lastValue);
            }
            getContext().LexEnv = thisIterationEnv;
        }
        return NormalCompletion(undefined);
    }
    function ForBodyEvaluation(testExpr, incrementExpr, stmt, labelSet, perIterationBindings) {
        "use strict";
        var V = undefined;
        var result;
        var testExprRef, testExprValue;
        var incrementExprRef, incrementExprValue;
        var status = CreatePerIterationEnvironment(perIterationBindings);
        if (isAbrupt(status)) return status;
        for (;;) {

            if (testExpr) {
                testExprRef = Evaluate(testExpr);
                testExprValue = ToBoolean(GetValue(testExprRef));
                if (testExprValue === false) return NormalCompletion(V);
                if (!LoopContinues(testExprValue, labelSet)) return testExprValue;
            }

            result = Evaluate(stmt);
            // here is a fix if no completion comes out (which is something which may not happen later anymore)
            if (result instanceof CompletionRecord) {
                if (result.value !== empty) V = result.value;
            } else V = result;

            if (!LoopContinues(result, labelSet)) return result;
            status = CreatePerIterationEnvironment(perIterationBindings);
            if (isAbrupt(status)) return status;
            if (incrementExpr) {
                incrementExprRef = Evaluate(incrementExpr);
                incrementExprValue = GetValue(incrementExprRef);
                if (!LoopContinues(incrementExprValue, labelSet)) return incrementExprValue;
            }
        }
    }

    function CaseSelectorEvaluation(node) {
        var test = node.test;
        var exprRef = Evaluate(test);
        return GetValue(exprRef);
    }

    function CaseBlockEvaluation(input, caseBlock) {
        var clause;
        var clauseSelector;
        var runDefault = true;
        var matched;
        var sList;
        var V;
        var R;
        var defaultClause;
        var searching = true;
        for (var i = 0, j = caseBlock.length; i < j; i++) {
            clause = caseBlock[i];
            if (clause.type === "DefaultCase") {
                defaultClause = clause;
            } else {
                clauseSelector = CaseSelectorEvaluation(clause);
                if (isAbrupt(clauseSelector=ifAbrupt(clauseSelector))) return clauseSelector;
                if (searching) matched = SameValue(input, clauseSelector);
                if (matched) {
                    searching = false;
                    sList = clause.consequent; // parseNode
                    if (sList) {
                        R = GetValue(Evaluate(sList));
                        if (isAbrupt(R=ifAbrupt(R))) {
                            if (R.type === "break") break;
                            if (R.type === "continue") return withError("Type", "continue is not allowed in a switch statement");
                            if (R.type === "throw") return R;
                            if (R.type === "return") return R;
                        } else {
                            V = R;
                        }
                    }
                    if (isAbrupt(R)) break;
                }
            }
        }
        if (!isAbrupt(R)) searching = true; // kein Break.
        if (searching && defaultClause) {
            R = Evaluate(defaultClause.consequent);
            if (isAbrupt(R)) {
                if (R.type === "break") return V;
                if (R.type === "continue") return withError("Type", "continue is not allowed in a switch statement");
                if (R.type === "throw") return R;
                if (R.type === "return") return R;
            } else {
                V = GetValue(R);
            }
        }
        return V;
    }
    evaluation.SwitchStatement = SwitchStatement;
    function SwitchStatement(node) {
        var oldEnv, blockEnv;
        var R;
        var switchExpr = node.discriminant;
        var caseBlock = node.cases;
        var exprRef = Evaluate(switchExpr);
        var switchValue = GetValue(exprRef);
        if (isAbrupt(switchValue)) return switchValue;
        oldEnv = getLexEnv();
        blockEnv = NewDeclarativeEnvironment(oldEnv);
        R = InstantiateBlockDeclaration(caseBlock, blockEnv);
        if (isAbrupt(R)) return R;
        getContext().LexEnv = blockEnv;
        R = CaseBlockEvaluation(switchValue, caseBlock);
        getContext().LexEnv = oldEnv;
        return R;
    }
    function TemplateStrings(node, raw) {
        var list = [];
        var spans = node.spans;
        var span;
        var i, j;
        if (raw) {
            if (spans.length === 1) return spans;
            for (i = 0, j = spans.length; i < j; i+=2) {
                if ((span = spans[i]) !== undefined) list.push(span);
            }
        } else {
            if (spans.length === 1) return [];
            for (i = 1, j = spans.length; i < j; i+=2) {
                if ((span = spans[i]) !== undefined) list.push(span);
            }
        }
        return list;
    }
    function SubstitutionEvaluation(siteObj) {
        var len = +Get(siteObj, "length");
        var results = [];
        for (var i = 0; i < len; i++) {
            var expr = Get(siteObj, ToString(i));
            if (isAbrupt(expr = ifAbrupt(expr))) return expr;
            if (typeof expr === "string") {
                expr = parseGoal("Expression", expr);
                var exprRef = Evaluate(expr);
                var exprValue = GetValue(exprRef);
                if (isAbrupt(exprValue = ifAbrupt(exprValue))) return exprValue;
                results.push(exprValue);
            }
        }
        return results;
    }
    function GetTemplateCallSite(templateLiteral) {
        if (templateLiteral.siteObj) return templateLiteral.siteObj;
        var cookedStrings = TemplateStrings(templateLiteral, false); // die expressions ??? bei mir jedenfalls gerade
        var rawStrings = TemplateStrings(templateLiteral, true); // strings
        var count = Math.max(cookedStrings.length, rawStrings.length);
        var siteObj = ArrayCreate(count);
        var rawObj = ArrayCreate(count);
        var index = 0;
        var prop, cookedValue, rawValue;
        while (index < count) {
            prop = ToString(index);
            cookedValue = cookedStrings[index];
            rawValue = rawStrings[index];
            if (cookedValue !== undefined) callInternalSlot("DefineOwnProperty", siteObj, prop, {
                value: cookedValue,
                enumerable: false,
                writable: false,
                configurable: false
            });
            if (rawValue !== undefined) callInternalSlot("DefineOwnProperty", rawObj, prop, {
                value: rawValue,
                enumerable: false,
                writable: false,
                configurable: false
            });
            index = index + 1;
        }
        SetIntegrityLevel(rawObj, "frozen");
        DefineOwnProperty(siteObj, "raw", {
            value: rawObj,
            enumerable: false,
            writable: false,
            configurable: false
        });
        SetIntegrityLevel(siteObj, "frozen");
        templateLiteral.siteObj = siteObj;
        return siteObj;
    }
    function TemplateLiteral(node) {
        return GetTemplateCallSite(node);
    }
    evaluation.TemplateLiteral = TemplateLiteral;
    var defaultClassConstructorFormalParameters = parseGoal("FormalParameterList", "...args");
    var defaultClassConstructorFunctionBody = parseGoal("FunctionBody", "return super(...args);");
    function DefineMethod(node, object, functionPrototype) {
        "use strict";
        var body = getCode(node, "body");
        var formals = getCode(node, "params");
        var key = node.id;
        var computed = node.computed;
        var strict = IsStrict(body);
        var scope = getLexEnv();
        var closure;
        var generator = node.generator;
        var propKey;
        if (computed) {
            propKey = GetValue(Evaluate(key));
            if (isAbrupt(propKey = ifAbrupt(propKey))) return propKey;
            if (!IsSymbol(propKey)) propKey = ToString(propKey);
            if (isAbrupt(propKey = ifAbrupt(propKey))) return propKey;
            if (!IsPropertyKey(propKey)) return withError("Type", "A [computed] property has to evaluate to valid property key");
        } else {
            propKey = PropName(node);
        }

        if (isAbrupt(propKey = ifAbrupt(propKey))) return propKey;
        if (generator) closure = GeneratorFunctionCreate("method", formals, body, scope, strict, functionPrototype);
        else closure = FunctionCreate("method", formals, body, scope, strict, functionPrototype);
        if (isAbrupt(closure = ifAbrupt(closure))) return closure;

        if (ReferencesSuper(node)) {
            MakeMethod(closure, propKey, GetPrototypeOf(object));
        }

        var rec = {
            key: propKey,
            closure: closure
        };
        return NormalCompletion(rec);
    }
    evaluation.MethodDefinition = MethodDefinition;
    function MethodDefinition(node, object) {
        "use strict";
        var fproto;
        if (node.generator) {
            var intrinsics = getIntrinsics();
            fproto = Get(intrinsics, "%GeneratorFunction%");
        }
        var methodDef = DefineMethod(node, object, fproto);
        if (isAbrupt(methodDef = ifAbrupt(methodDef))) return methodDef;
        SetFunctionName(methodDef.closure, methodDef.key);
        var desc = {
            value: methodDef.closure,
            writable: true,
            enumerable: true,
            configurable: true
        };
        return DefineOwnPropertyOrThrow(object, methodDef.key, desc);
    }
    evaluation.ClassDeclaration = ClassDeclaration;
    function ClassDeclaration(node) {
        "use strict";
        var cx = getContext();
        var superclass = null;
        var elements = node.elements;
        var constructor = ConstructorMethod(elements);
        var staticMethods = StaticMethodDefinitions(elements);
        var protoMethods = PrototypeMethodDefinitions(elements);
        var protoParent;
        var ObjectPrototype = getIntrinsic("%ObjectPrototype%");
        var FunctionPrototype = getIntrinsic("%FunctionPrototype%");
        var className = node.id;
        var isExtending = node.extends;
        var constructorParent;
        var Proto;
        var decl;
        var status;
        if (isExtending) {
            superclass = GetValue(Evaluate(node.extends));
            if (isAbrupt(superclass=ifAbrupt(superclass))) return superclass;
        }
        if (!superclass) {
            protoParent = null;
            // protoParent = ObjectPrototype;
            constructorParent = FunctionPrototype;
        } else {
            if (Type(superclass) !== OBJECT) return withError("Type", "superclass is no object");
            if (!IsConstructor(superclass)) return withError("Type", "superclass is no constructor");
            protoParent = Get(superclass, "prototype");
            if (isAbrupt(protoParent=ifAbrupt(protoParent))) return protoParent;
            if (Type(protoParent) !== OBJECT && Type(protoParent) !== NULL) return withError("Type", "prototype of superclass is not object, not null");
            constructorParent = superclass;
        }
        Proto = ObjectCreate(protoParent);
        if (isAbrupt(Proto=ifAbrupt(Proto))) return Proto;
        var lex = getLexEnv();
        var scope = NewDeclarativeEnvironment(lex);
        if (className) {
            lex.CreateMutableBinding(className);
        }
        var caller = cx.callee;
        getContext().LexEnv = scope;
        cx.callee = className;
        cx.caller = caller;
        getContext().LexEnv = scope;
        var F = FunctionCreate("normal", [], null, scope, true, FunctionPrototype, constructorParent);
        if (isAbrupt(F=ifAbrupt(F))) return F;
        if (!constructor) {
            if (isExtending) {
                setInternalSlot(F, "FormalParameters", defaultClassConstructorFormalParameters);
                setInternalSlot(F, "Code", defaultClassConstructorFunctionBody);
            } else {
                setInternalSlot(F, "FormalParameters", []);
                setInternalSlot(F, "Code", []);
            }
        } else {
            setInternalSlot(F, "FormalParameters", constructor.params);
            SetFunctionLength(F, ExpectedArgumentCount(constructor.params));
            setInternalSlot(F, "Code", constructor.body);
        }
        setInternalSlot(F, "Construct", function (argList) {
            var F = this;
            return OrdinaryConstruct(F, argList);
        });
        var i, j;
        for (i = 0, j = protoMethods.length; i < j; i++) {
            if (decl = protoMethods[i]) {
                status = evaluation.MethodDefinition(decl, Proto);
                if (isAbrupt(status)) return status;
            }
        }
        for (i = 0, j = staticMethods.length; i < j; i++) {
            if (decl = staticMethods[i]) {
                status = evaluation.MethodDefinition(decl, F);
                if (isAbrupt(status)) return status;
            }
        }
        if (protoParent) {
            setInternalSlot(F, "HomeObject", protoParent);
            setInternalSlot(F, "MethodName", "constructor");
        }
        MakeConstructor(F, false, Proto);
        if (className) {
            var status = SetFunctionName(F, className);
            if (isAbrupt(status)) return status;
            lex.InitializeBinding(className, F);
        }
        getContext().LexEnv = lex;
        return NormalCompletion(F);
    }
    function SuperExpression(node) {
        return NormalCompletion(empty);
    }
    evaluation.SuperExpression = SuperExpression;
    evaluation.ModuleDeclaration = ModuleDeclaration;
    function ModuleDeclaration(node) {
        var body = getCode(node, "body");
        var oldContext = getContext();
        var initContext = ExecutionContext(getLexEnv(), getRealm());
        var env = NewDeclarativeEnvironment(getLexEnv());

        var status = InstantiateModuleDeclaration(node, env);
        if (isAbrupt(status)) return status;

        var result = EvaluateModuleBody(node);
        if (isAbrupt(result)) return result;

        return NormalCompletion(undefined);
    }
    evaluation.ImportStatement = ImportStatement;
    evaluation.ExportStatement = ExportStatement;
    function ImportStatement(node) {
        // Get Module x 
        // Get Property y of Module and Return
        var importRef;
        var importValue;
        var moduleRef;
        var moduleValue;
        var status;
        // shh. wait for the next draft. ;)
        return NormalCompletion("this is an import");
    }
    function ExportStatement(node) {
        return NormalCompletion("this is an export");
    }
    evaluation.WithStatement = WithStatement;
    function WithStatement(node) {
        var body = getCode(node, "body");
        var object = GetValue(Evaluate(node.object));
        if (isAbrupt(object = ifAbrupt(object))) return object;
        var objEnv = ObjectEnvironment(object, getContext().LexEnv);
        objEnv.withEnvironment = true;
        var oldEnv = getLexEnv();
        getContext().LexEnv = objEnv;
        var result = Evaluate(body);
        getContext().LexEnv = oldEnv;
        if (isAbrupt(result)) return result;
        return NormalCompletion(undefined);
    }
    evaluation.ArrayComprehension = ArrayComprehension;
    evaluation.GeneratorComprehension = GeneratorComprehension;
    function ComprehensionEvaluation(node, accumulator) {
        var filters = node.filter;
        var expr = node.expression;
        var filter;
        if (accumulator !== undefined) {
            if (filters.length) {
                for (var i = 0, j = filters.length; i < j; i++) {
                    if (filter = filters[i]) {
                        var filterRef = Evaluate(filter);
                        var filterValue = GetValue(filterRef);
                        if (isAbrupt(filterValue = ifAbrupt(filterValue))) return filterValue;
                        if (ToBoolean(filterValue) === false) break;
                    }
                }
            }
            if (!filter || (ToBoolean(filterValue) === true)) {
                var exprRef = Evaluate(expr);
                var exprValue = GetValue(exprRef);
                if (isAbrupt(exprValue=ifAbrupt(exprValue))) return exprValue;
                var len = Get(accumulator, "length");
                if (len >= (Math.pow(2, 53) - 1)) return withError("Range", "Range limit exceeded");
                var putStatus = Put(accumulator, ToString(len), exprValue, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                len = len + 1;
                putStatus = Put(accumulator, "length", len, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
            }
            return NormalCompletion(undefined);
        } else {
            var yieldStatus = GeneratorYield(CreateItrResultObject(value, false));
            if (isAbrupt(yieldStatus = ifAbrupt(yieldStatus))) return yieldStatus;
            return NormalCompletion(undefined);
        }
    }
    function QualifierEvaluation(block, node, accumulator) {

        var forBinding = block.left;
        var assignmentExpr = block.right;
        var exprRef = Evaluate(assignmentExpr);
        var exprValue = GetValue(exprRef);
        var obj = ToObject(exprValue);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        var iterator = Invoke(obj, $$iterator, []);
        var keys = ToObject(iterator);
        var oldEnv = getLexEnv();
        var noArgs = [];
        var status;
        for (;;) {
            var nextResult = Invoke(keys, "next", noArgs);
            if (isAbrupt(nextResult = ifAbrupt(nextResult))) return nextResult;
            if (Type(nextResult) !== OBJECT) return withError("Type", "QualifierEvaluation: nextResult is not an object");
            var done = IteratorComplete(nextResult);
            if (isAbrupt(done = ifAbrupt(done))) return done;
            if (done === true) return true;
            var nextValue = IteratorValue(nextResult);
            if (isAbrupt(nextValue = ifAbrupt(nextValue))) return nextValue;
            var forEnv = NewDeclarativeEnvironment(oldEnv);
            var bn = BoundNames(forBinding);
            for (var i = 0, j = bn.length; i < j; i++) {
                forEnv.CreateMutableBinding(bn[i]);
                status = BindingInitialisation(forBinding, nextValue, forEnv);
                if (isAbrupt(status)) return status;
            }
            getContext().LexEnv = forEnv;
            var continuer = ComprehensionEvaluation(node, accumulator);
            getContext().LexEnv = oldEnv;
            if (isAbrupt(continuer = ifAbrupt(continuer))) return continuer;
        }
    }
    function ArrayComprehension(node) {
        var blocks = node.blocks;
        var filter = node.filter;
        var expr = node.expression;

        var array = ArrayCreate(0);
        var status;

        for (var i = 0, j = blocks.length; i < j; i++) {
            status = QualifierEvaluation(blocks[i], node, array);
            if (isAbrupt(status = ifAbrupt(status))) return status;
        }
        return array;
    }
    function GeneratorComprehension(node) {
        var filter = node.filter;
        var blocks = node.blocks;
        var binding;
        var closure = FunctionCreate("generator", [], [], getLexEnv(), true);
        return callInternalSlot("Call", closure, undefined, []);
    }
    function CatchClauseEvaluation(thrownValue, catchNode) {
        var status, oldEnv, catchEnv;
        var catchBlock = catchNode.block;
        var catchParameter = catchNode.params && catchNode.params[0];
        var boundNames = BoundNames(catchNode.params);
        var R;
        oldEnv = getLexEnv();
        catchEnv = NewDeclarativeEnvironment(oldEnv);
        getContext().LexEnv = catchEnv;
        for (var i = 0, j = boundNames.length; i < j; i++) {
            catchEnv.CreateMutableBinding(boundNames[i]);
        }
        status = BindingInitialisation(catchParameter, thrownValue, undefined);
        if (isAbrupt(status)) return status;
        R = Evaluate(catchBlock);
        getContext().LexEnv = oldEnv;
        return R;
    }
    evaluation.Finally = Finally;
    function Finally(node) {
        return Evaluate(node.block);
    }
    evaluation.TryStatement = TryStatement;
    function TryStatement(node) {
        var tryBlock = node.handler;
        var catchNode = node.guard;
        var finalizer = node.finalizer;
        var B, C, F;

        B = Evaluate(tryBlock);
        if (isAbrupt(B) && (B.type === "throw")) {
            var thrownValue = B.value;
            C = CatchClauseEvaluation(thrownValue, catchNode);
        } else {
            C = B;
        }

        if (finalizer) {
            F = Evaluate(finalizer);
            if (!isAbrupt(F)) {
                return C;
            }
        } else {
            return C;
        }
        return F;
    }
    var isStrictDirective = {
        __proto__:null,
        "'use strict'": true,
        '"use strict"': true
    };
    var isAsmDirective = {
        __proto__:null,
        "'use asm'": true,
        '"use asm"': true
    };
    evaluation.Directive = Directive;
    function Directive(node) {
        if (isStrictDirective[node.value]) {
            getContext().strict = true;
        } else if (isAsmDirective[node.value]) {
            getContext().asm = true;
        }
        return NormalCompletion(empty);
    }

    var nodeWithList = {
        "Program": "body",
        "FunctionDeclaration": "body",
        "FunctionExpression": "body",
        "GeneratorDeclaration": "body",
        "GeneratorExpression": "body",
        "SwitchStatement": "cases",
        "SequenceExpression": "sequence",
        "DoWhileStatement": "body",
        "WhileStatement": "body",
        "ForStatement" :"body",
        "ForInStatement": "body",
        "ForOfStatement": "body"
    };

    /* 
     Have to take a pencil an write the stack up,
     to check out which to put onto and what to pop
     off the stack for only one purpose: GENERATOR.
     (The only thing which really needs some memory,
     coz a visitor can´t break and resume a walk)
     */

    function tellExecutionContext(node, index, parent) {
        loc = node.loc || loc;
        var state = getContext().state;
        var rec;

        if (nodeWithList[node.type]) {
            state.push({
                list: true,
                node: node,
                parent: parent,
                index: -1
            });
        } else {
            state.push({
                list:false, node: node, index: index, parent: parent
            });
        }

    }
    function untellExecutionContext() {
        var cx = getContext();
        cx.state.pop();

    }
    evaluation.ScriptBody =
        evaluation.Program = Program;
    function Program(program) {
        "use strict";
        var v;
        var cx = getContext();
        if (program.strict || keepStrict) {
            cx.strict = true;
            if (shellMode) keepStrict = true;
        }
        var status = InstantiateGlobalDeclaration(program, getGlobalEnv(), []);
        if (isAbrupt(status)) return status;
        cx.callee = "ScriptItemList";
        cx.caller = "Script";
        var node;
        var V = undefined;
        var body = program.body;
        // tellExecutionContext(body, 0, null);
        for (var i = 0, j = body.length; i < j; i += 1) {
            if (node = body[i]) {
                // tellExecutionContext(node, i, body);
                v = GetValue(Evaluate(node));
                if (isAbrupt(v)) {
                    return v;
                }
                if (v !== empty) V = v;
            }
        }
        // untellExecutionContext();
        return NormalCompletion(V);
    }
    ecma.Evaluate = Evaluate;
    function Evaluate(node, a, b, c) {
        var E, R;
        var body, i, j;
        if (!node) return;
        if (typeof node === "string") {
            //        debug("Evaluate(resolvebinding " + node + ")");
            R = ResolveBinding(node);
            return R;
        }
        if (Array.isArray(node)) {
            //      debug("Evaluate(StatementList)");
            if (node.type) R = evaluation[node.type](node, a, b, c);
            else R = evaluation.StatementList(node, a, b, c);
            return R;

        }
        // debug("Evaluate(" + node.type + ")");
        if (E = evaluation[node.type]) {
            // tellExecutionContext(node, 0);
            R = E(node, a, b, c);
            // untellExecutionContext();
        }
        return R;
    }
    function HandleEventQueue(shellmode, initialized) {
        var task, func, time, result;
        // pendingExceptions = []

        var LoadingTasks = getRealm().LoadingTasks;
        var PromiseTasks = getRealm().PromiseTasks;

        var result = NextTask(undefined, PromiseTasks);

        function handler() {
            var eventQueue = getEventQueue();
            if (task = eventQueue.shift()) {
                func = task.func;
                time = Date.now();
                if (time >= (task.time + task.timeout)) {
                    if (IsCallable(func)) result = callInternalSlot("Call", func, ThisResolution(), []);
                    if (isAbrupt(result)) {
                        try {
                            throw makeNativeException(result.value);
                        } catch (ex) {
                            if (hasConsole) {
                                console.log("Exception: happend async and is just a print of the exception´s object");
                                console.log(ex.name);
                                console.log(ex.message);
                                console.log(ex.stack);
                            }
                        }
                    }
                } else eventQueue.push(task);
            }
            if (eventQueue.length) setTimeout(handler, 0);
            else {
                if (!shellmode && initialized) endRuntime();
            }
        }
        setTimeout(handler, 0);
    }


    function setScriptLocation (loc) {
        scriptLocation = "(syntax.js)";
        if (typeof window !== "undefined") {
            loc = loc || document.location.href;
            scriptLocation = "("+document.location.href + " @syntax.js)";
        } else if (typeof process !== "undefined") {
            loc = loc || __dirname;
            scriptLocation = "(node.js interpreter)";
        } else {
            scriptLocation = "(worker)";
        }
        realm.xs.scriptLocation = scriptLocation;
    }
    function initializeTheRuntime() {
        initializedTheRuntime = true;
    }
    function endRuntime() {
        initializedTheRuntime = false;
    }
    function execute(source, shellModeBool, resetEnvNowBool) {
        var exprRef, exprValue, text, type, message, stack, error, name, callstack;

        shellMode =  shellModeBool; // prolly just for this legacy execute function

        var node = typeof source === "string" ? parse(source) : source;
        if (!node) throw "example: Call execute(parse(source)) or execute(source)";

        if (!initializedTheRuntime || !shellModeBool || resetEnvNowBool) {
            var realm = CreateRealm();
            ecma.setCodeRealm(realm);
            keepStrict = false;
            initializeTheRuntime();
            setScriptLocation();
            NormalCompletion(undefined);
        }
        // convert references into values to return values to the user (toValue())
        try {
            exprRef = Evaluate(node);
            if (Type(exprRef) === REFERENCE) exprValue = GetValue(exprRef);
            else exprValue = exprRef;
        } catch (ex) {
            console.log("Real JS Exception:");
            console.log(ex);
            console.log(ex.message);
            console.log(ex.stack);
            throw ex;
        }
        // exception handling. really temporarily in this place like this
        if (isAbrupt(exprValue = ifAbrupt(exprValue))) {
            if (exprValue.type === "throw") {
                error = exprValue.value;
                if (Type(error) === OBJECT) {
                    throw makeNativeException(error);
                } else {
                    error = new Error(error);
                    error.stack = "{eddies placeholder for stackframe of non object throwers}";
                }
                if (error) throw error;
            }
        }

        /*
         my self-defined event queue shall become realm.TimerTasks, mainly
         for SetTimeout.
         Now i should consider reworking this part and intrinsics/settimeout.js
         to use getRealm().TimerTasks instead of realm.eventQueue and schedule
         in the MicroTask Format supplied with ES6 Promises.
         */

        var eventQueue = getEventQueue();
        var pt = getTasks(getRealm(), "PromiseTasks");

        if (!shellModeBool && initializedTheRuntime && !eventQueue.length && (!pt || !pt.length)) endRuntime();
        else if (eventQueue.length || (pt&& pt.length)) setTimeout(function () {HandleEventQueue(shellModeBool, initializedTheRuntime);}, 0);

        return exprValue;
    }


    /*
     * experiment execution block (uncompleted concepts for async/eventual/transformed return values)
     */
    function ExecuteAsync (source) {
        return makePromise(function (resolve, reject) {
            initializeTheRuntime();
            var result = Evaluate(parse(source));
            if (isAbrupt(result)) {
                if (result.type === "return") {
                    resolve(result.value);
                } else {
                    reject(result.value);
                }
            } else {
                resolve(result.value);
            }
            endRuntime();
        });

    }
    function ExecuteAsyncTransform (source) {
        return makePromise(function (resolve, reject) {
            initializeTheRuntime();
            var result = Evaluate(parse(source));
            if (isAbrupt(result)) {
                if (result.type === "return") {
                    resolve(TransformObjectToJSObject(GetValue(result.value)));
                } else {
                    reject(TransformObjectToJSObject(GetValue(result.value)));
                }
            } else {
                resolve(TransformObjectToJSObject(GetValue(result.value)));
            }
            endRuntime();
        });
    }
    function DeepStaticJSSnapshotOfObject(O) {
        var keys = OwnPropertyKeysAsList(O);
        var o = {};
        keys.forEach(function (key) {

        });
    }
    function TransformObjectToJSObject(O) {
        /*
         incomplete transformer/static proxy
         */
        var o = {};
        var keys = OwnPropertyKeysAsList(O);
        keys.forEach(function (key) {

            var desc = GetOwnProperty(O, key);
            var dd;
            if (!(dd=IsDataDescriptor(desc))) {
                var get = desc.get;
                var set = desc.set;
                var newGetter, newSetter;
                newGetter = function () {
                    var result = callInternalSlot("Call", get, O, []);
                    if (isAbrupt(result = ifAbrupt(result))) throw result;
                    return TransformObjectToJSObject(result);
                };
                newSetter = function (v) {
                    var result = callInternalSlot("Call", set, O, [v]);
                    if (isAbrupt(result = ifAbrupt(result))) throw result;
                    return v;
                };
                Object.defineProperty(o, key, {
                    get: newGetter,
                    set: newSetter,
                    enumerable: desc.enumerable,
                    configurable: desc.configurable
                });
            } else {
                var value = desc.value;
                var newValue;
                if (Type(value) === OBJECT) {
                    if (IsCallable(value)) {
                        newValue = function () {
                            var c = callInternalSlot("Call", value, value, arguments);
                            c = unwrap(c);
                            if (Type(c) === OBJECT) return TransformObjectToJSObject(c);
                            return c;
                        };
                    } else {
                        newValue = TransformObjectToJSObject(value);
                    }
                } else if (Type(value) === SYMBOL) {
                    newValue = {
                        type: "symbol",
                        description: value.Description
                    };
                } else newValue = value;

                Object.defineProperty(o, key, {
                    value: newValue,
                    writable: desc.writable,
                    enumerable: desc.enumerable,
                    configurable: desc.configurable
                });
            }
        });
        return o;
    }
    execute.setCodeRealm = setCodeRealm;
    execute.Evaluate = Evaluate;
    execute.ExecuteAsync = ExecuteAsync;
    execute.ExecuteAsyncTransform = ExecuteAsyncTransform;
    execute.TransformObjectToJSObject = TransformObjectToJSObject;
    execute.DeepStaticJSSnapshotOfObject = DeepStaticJSSnapshotOfObject;
    //    execute.makeRuntime = makeRuntime;
    return execute;

//    }
//    return makeRuntime();
});


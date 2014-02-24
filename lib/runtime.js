
//******************************************************************************************************************************************************************************************************
// Jetzt die AST Runtime, die fuer ByteCode wiederholt werden muss
//******************************************************************************************************************************************************************************************************

define("runtime", ["parser", "api", "slower-static-semantics"], function (parse, ecma, statics) {
    "use strict";

    var i18n = require("i18n-messages");

    var parseGoal = parse.parseGoal;

    var debugmode = false;

    var isWorker = typeof importScripts === "function" && typeof window === "undefined";

    function debug() {
        if (debugmode && !isWorker) console.log.apply(console, arguments);
    }

    function debugdir() {
        if (debugmode && !isWorker) console.dir.apply(console, arguments);
    }

    function log() {
        if (!isWorker) console.log.apply(console, arguments);
    }

    function dir() {
        if (!isWorker) console.dir.apply(console, arguments);
    }


/*
    The interfaces for refactoring the runtime for the Bytecode
*/

    
    function getCode(code, field) {
        if (code)
        return code[field];
    }

    function isCodeType(code, type) {
        return code.type === type;
    }


/*
    
*/


    //
    // Code REALM requiren




    // 

    
    var writePropertyDescriptor = ecma.writePropertyDescriptor;

    // 
    // Alte Static Semantics (werden abgeloest)
    //

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
    var HasInitialiser = statics.HasInitialiser;
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


    //
    // essential-api (essential internals)
    //



    var List = ecma.List;
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
    
    var withError = ecma.withError;
    var printException = ecma.printException;
    var makeMyExceptionText = ecma.makeMyExceptionText;


    var $$unscopables = ecma.$$unscopables;
    var $$create = ecma.$$create;
    var $$toPrimitive = ecma.$$toPrimitive;
    var $$toStringTag = ecma.$$toStringTag;
    var $$hasInstance = ecma.$$hasInstance;
    var $$iterator = ecma.$$iterator;
    var $$isRegExp = ecma.$$isRegExp;
    var $$isConcatSpreadable = ecma.isConcatSpreadable;


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
    var FunctionInitialise = ecma.FunctionInitialise;
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
    var OrdinaryCreateFromConstructor = OrdinaryCreateFromConstructor;
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
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var Intrinsics;
    var globalThis;
    var MakeConstructor = ecma.MakeConstructor;
    var ArrayCreate = ecma.ArrayCreate;
    var ArraySetLength = ecma.ArraySetLength;
    var unwrap = ecma.unwrap;
    var GeneratorStart = ecma.GeneratorStart;
    var GeneratorYield = ecma.GeneratorYield;
    var GeneratorResume = ecma.GeneratorResume;
    
    var CreateEmptyIterator = CreateEmptyIterator;
    var ToBoolean = ecma.ToBoolean;
    var ToString = ecma.ToString;
    var ToNumber = ecma.ToNumber;
    var ToUint32 = ecma.ToUint32;

    

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
    var Delete = ecma.Delete
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

    var ArgumentsExoticObject = ecma.ArgumentsExoticObject;
    var AddRestrictedFunctionProperties = ecma.AddRestrictedFunctionProperties;
    var setInternalSlot = ecma.setInternalSlot;
    var getInternalSlot = ecma.getInternalSlot;
    var hasInternalSlot = ecma.hasInternalSlot;
    var callInternalSlot = ecma.callInternalSlot;
    
    var SetFunctionLength = ecma.SetFunctionLength;

    //-----------------------------------------------------------
    // setze Call Funktion im anderen Modul zu Call fuer ASTNode:
    // ----------------------------------------------------------

    ecma.OrdinaryFunction.prototype.Call = Call;

    //
    // ----------------------------------------------------------
    //

    function setCodeRealm(r) {  // IN THE RUNTIME, 
                // before evaluate accepts a realm 
                // and public evalute is only defined on each realm

        if (r) {
            realm = r;
            stack = realm.stack;
            intrinsics = realm.intrinsics;
            globalEnv = realm.globalEnv;
            globalThis = realm.globalThis;
            eventQueue = realm.eventQueue;
        
        }
        

    }

    // ^ replacen mit realm und module system
    //
    //
    //

    function inStrict (node) {
        if (node && node.strict) return true;
        if (getLexEnv().strict) return true;
        return false;
    }

    var CheckObjectCoercible = ecma.CheckObjectCoercible;

    // ---- xs is used for intermodule 
    
    // -----
    var line, column;


    var cx; // der aktive Context; gegen getContext()
    var realm, intrinsics, globalEnv, globalThis;
    var stack, eventQueue;
    
    var scriptLocation;

    var initialisedTheRuntime = false;
    var evaluation = Object.create(null);

    var strictModeStack = [];
    var inStrictMode = false;
    var loc = {};

    
    var insideGeneratorState = false;

    var IsFunctionDeclaration = statics.IsFunctionDeclaration;
    var IsFunctionExpression = statics.IsFunctionExpression;
    var IsGeneratorDeclaration = statics.IsGeneratorDeclaration;
    var IsGeneratorExpression = statics.IsGeneratorExpression;
    var IsVarDeclaration = statics.IsVarDeclaration;
    var isDuplicateProperty = statics.isDuplicateProperty;

    var CV = statics.CV;
    var MV = statics.MV;
    var SV = statics.SV;
    var TV = statics.TV;
    var TRV = statics.TRV;

    function unquote(str) {
        return str.replace(/^("|')|("|')$/g, ""); //'
    }

    var IsBindingPattern = {
        __proto__: null,
        "ObjectPattern": true,
        "ArrayPattern": true
    };

    var ControlStatement = {
        "IfStatement": true,
        "SwitchStatement": true
    };

    function assign(obj, obj2) {
        for (var k in obj2) {
            if (Object.hasOwnProperty.call(obj2, k)) obj[k] = obj2[k];
        }
        return obj;
    }

    function ResolveBinding(name) {
        var lex = getLexEnv();
        var strict = getContext().strict;
        return GetIdentifierReference(lex, name, strict);
    }

    function IsIdentifier(obj) {
        if (obj.type == "Identifier") return true;
        return false;
    }

    function InstantiateModuleDeclaration(module, env) {

        var ex;
        var lexNames = LexicallyDeclaredNames(module);
        var varNames = VarDeclaredNames(module);
        var boundNames = BoundNames(module);

        for (var i = 0, j = lexNames.length; i < j; i++) {
            name = lexNames[i];
            if (env.HasBinding(name)) return withError("Syntax", "Instantiate module: Has var declaration: " + name);
        }

        for (i = 0, j = varNames.length; i < j; i++) {
            name = varNames[i];
            if (env.HasBinding(name)) return withError("Syntax", "Instantiate module: Has lexical declaration: " + name);
        }

    }

    var isFuncDecl = {
        "GeneratorDeclaration":true,
        "FunctionDeclaration":true,
        __proto__:null
    };




    function InstantiateGlobalDeclaration(script, env, deletableBindings) {
        "use strict";

        var name;
        var boundNamesInPattern;
        var code = getCode(script,"body");
        var strict = !!getCode(script,"strict");

        var cx = getContext();
        if (strict) cx.strict = true;

        var ex;
        var lexNames = LexicallyDeclaredNames(code);
        var varNames = VarDeclaredNames(code);
        var i, j, y, z;
        var status;

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

                vn = d.id;
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
        var ex;
        for (var d in declaredVarNames) {
            status = env.CreateGlobalVarBinding(d, deletableBindings);
            if (isAbrupt(status)) return status;
        }

        var lexDeclarations = LexicalDeclarations(script.body);
        var dn, kind;
        for (i = 0, j = lexDeclarations.length; i < j; i++) {
            debug("lexdecls: " + j);
            d = lexDeclarations[i];
            dn = d.id;
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
                status = env.CreateImmutableBinding(dn);
                if (isAbrupt(status)) return status;
            } else if (kind === "let") {
                status = env.CreateMutableBinding(dn, deletableBindings);
                if (isAbrupt(status)) return status;
            } else if (d.generator) {
                fn = d.id;
                fo = InstantiateFunctionObject(d, env);
                status = env.CreateMutableBinding(fn);
                if (isAbrupt(status)) return status;
                status = env.InitialiseBinding(fn, fo, false);
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
        var type;
        var status;

        for (var i = 0, j = declarations.length; i < j; i++) {
            if (decl = declarations[i]) {
                if (!decl.vmDeclared) {
                    if (type === "LexicalDeclaration") {
                        if (decl.kind === "const") {
                            status = env.CreateImmutableBinding(decl.id);
                            if (isAbrupt(status)) return status;
                        } else {
                            status = env.CreateMutableBinding(decl.id);
                            if (isAbrupt(status)) return status;
                        }
                    } else if (isFuncDecl[type] && (!decl.expression)) {
                        functionsToInitialize.push(decl);
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
        var needsSuper = getCode(node, "needsSuper");
        var strict = cx.strict || !!getCode(node,"strict");
        var scope = env;
        
        if (!generator) {
            var name = node.id;
            F = FunctionCreate("normal", params, body, scope, strict);
            // 14.1.16 4.
            if (needsSuper) MakeMethod(F, name, undefined);
            MakeConstructor(F);
            if (name) SetFunctionName(F, name);
        } else if (generator) {
            strict = true;
            var name = node.id;
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

        if (thisMode === "lexical") argumentsObjectNeeded = false;
        else argumentsObjectNeeded = true;

        var d;
        var fn;
        var fo;
        var functionsToInitialise = [];
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
                        functionsToInitialise.push(d);
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
                        functionsToInitialise.push(d);
                    } else if (IsConstantDeclaration(d)) {
                        env.CreateImmutableBinding(dn);
                    } else {
                        env.CreateMutableBinding(dn);
                    }
                }
            }
        }
        for (i = 0, j = functionsToInitialise.length; i < j; i++) {
            if (d = functionsToInitialise[i]) {
                fn = BoundNames(d)[0];
                fo = InstantiateFunctionObject(d, env);
                env.InitialiseBinding(fn, fo, false);
            }
        }

        var ao = InstantiateArgumentsObject(argList);


        if (isAbrupt(ao = ifAbrupt(ao))) return ao;
        var formalStatus = BindingInitialisation(formals, ao, undefined);

        if (argumentsObjectNeeded) {
            
            if (strict) {
                CompleteStrictArgumentsObject(ao);
            } else {
                CompleteMappedArgumentsObject(ao, F, formals, env);
            }
            env.InitialiseBinding("arguments", ao);
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

        while (indx >= 0) {

            if (indx < numberOfNonRestFormals) {
                param = formals[indx];

                if (IsBindingPattern[param.type]) { // extra hack ?
                    
                    var elem;
                    for (var x = 0, y = param.elements.length; x < y; x++) {
                        elem = param.elements[i];
                        name = elem.as ? elem.as.name : (elem.name || elem.value);
                            if (!mappedNames[name]) {
                                mappedNames[name] = true;
                                var g = MakeArgGetter(name, env);
                                var s = MakeArgSetter(name, env);
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
                        var g = MakeArgGetter(name, env);
                        var s = MakeArgSetter(name, env);
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
        
        callInternalSlot("DefineOwnProperty", obj, "callee", {
            value: F,
            writable: false,
            configurable: false,
            enumerable: false
        });
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
        var F = FunctionCreate("normal", formals, bodyText, env, true);
        return F;
    }

    /********************************************************************** continuing with the ast ********************************************************************************/

    function ArgumentListEvaluation(list) {
        var args = [],
            arg;
        var type, value;

        for (var i = 0, j = list.length; i < j; i++) {
            arg = list[i];
            type = arg.type;
            if (type === "TemplateLiteral") {
                var siteObj = GetTemplateCallSite(arg);
                var substitutions = SubstitutionEvaluation(siteObj);
                if (isAbrupt(substitutions = ifAbrupt(substitutions))) return substitutions;
                args.push(siteObj);
                for (var k = 0, l = substitutions.length; k < l; k++) {
                    args.push(substitutions[k]);
                }
            } else if (type === "SpreadExpression") {
                var array = GetValue(Evaluate(arg));
                if (isAbrupt(arg = ifAbrupt(arg))) return arg;
                for (var k = 0, l = Get(array, "length"); k < l; k++) {
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
        // console.dir(args);
        return args;
    }

    function EvaluateCall(ref, args, tailPosition) {
        var thisValue;

        var func = GetValue(ref);
        if (isAbrupt(func = ifAbrupt(func))) return func;
        var argList = ArgumentListEvaluation(args);

        if (isAbrupt(argList = ifAbrupt(argList))) return argList;
        if (Type(func) !== "object") return withError("Type", "EvaluateCall: func is not an object");
        if (!IsCallable(func)) return withError("Type", "EvaluateCall: func is not callable");
        
        if (Type(ref) === "reference") {
            if (IsPropertyReference(ref)) {
                thisValue = GetThisValue(ref);
            } else {
                var env = GetBase(ref);
                thisValue = env.WithBaseObject();
            }
        } else {
            thisValue = undefined;
        }
        
        if (tailPosition) {
            //    PrepareForTailCall();
        }

        var result = callInternalSlot("Call", func, thisValue, argList);

        //if (tailPosition) {
        //}
        return result;

    }

    function Call(thisArg, argList) {
        var status, result, fname, localEnv;
        var F = this;
        var params = getInternalSlot(this, "FormalParameters");
        var code = getInternalSlot(this, "Code");
        var thisMode = getInternalSlot(this, "ThisMode");
        var scope = getInternalSlot(this, "Environment");
        var realm = getRealm();
        debug("thisMode = " + thisMode);
        
        if (!code) return withError("Type", "Call: this value has no [[Code]] slot");

        var callerContext = getContext();
        var calleeContext = ExecutionContext(getLexEnv());
        
        calleeContext.realm = realm;
        var calleeName = Get(this, "name");
        var callerName = callerContext.callee;

        stack.push(calleeContext)
        
        calleeContext.caller = callerName;
        calleeContext.callee = calleeName;

        if (thisMode === "lexical") {
            localEnv = NewDeclarativeEnvironment(scope);
        } else {

            if (thisMode === "strict") {
                
                this.thisValue = thisArg;
                calleeContext.strict = true;

            } else {
                
                if (thisArg === null || thisArg === undefined) {
                    this.thisValue = getGlobalThis();
                } else if (Type(thisArg) !== "object") {
                    this.thisValue = ToObject(thisArg);
                } else {
                    this.thisValue = thisArg;
                }


            }
            localEnv = NewFunctionEnvironment(this, this.thisValue);
        }


        calleeContext.VarEnv = localEnv;
        calleeContext.LexEnv = localEnv;

        status = InstantiateFunctionDeclaration(this, argList, localEnv);
        if (isAbrupt(status = ifAbrupt(status))) {
            return status;
        }

        
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

    /* completion ende */

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

    /****************************************************/

    // put to xs and eval once each realm.

    ecma.EvaluateBody = EvaluateBody;
    ecma.Evaluate = Evaluate;
    ecma.CreateGeneratorInstance = CreateGeneratorInstance;

    /****************************************************/

    function CreateGeneratorInstance(F) {
        var env = GetThisEnvironment();
        var G = env.GetThisBinding();
        if (Type(G) !== "object" || (Type(G) === "object" && getInternalSlot(G, "GeneratorState") === undefined)) {
            var newG = OrdinaryCreateFromConstructor(F, "%GeneratorPrototype%", {
                "GeneratorState": undefined,
                "GeneratorContext": undefined
            });
            if (isAbrupt(newG = ifAbrupt(newG))) return newG;
            G = newG;
        }
        return GeneratorStart(G, getInternalSlot(F, "Code"));
    }

    var SkipMeDeclarations = {
        __proto__: null,
        "FunctionDeclaration": true,
        "GeneratorDeclaration": true
    };

    function SkipDecl(node) {
        if (SkipMeDeclarations[node.type] && !node.expression) return true;
        return false;
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
            if ((node = code[i]) /*&& !SkipDecl(node)*/) {
                tellExecutionContext(node, i);
                exprRef = Evaluate(node);
                if (isAbrupt(exprRef)) {
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
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

        // FunctionBody
        for (var i = 0, j = code.length; i < j; i++) {
            if ((node = code[i]) /*&& !SkipDecl(node)*/) {
                tellExecutionContext(node, i);
                exprRef = Evaluate(node);

                if (isAbrupt(exprRef)) {
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        return exprRef;
    }



    function EvaluateModuleBody(M) {
        "use strict";
        var exprRef, exprValue;
        var node;
        var code = getCode(M, "body");

    
    
        for (var i = 0, j = code.length; i < j; i++) {
            if ((node = code[i]) /*&& !SkipDecl(node)*/) {
                tellExecutionContext(node, i);
                exprRef = Evaluate(node);

                if (isAbrupt(exprRef)) {
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        return exprRef;
    }



    /******************************************************************************************************************************************************************/
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
                scope.InitialiseBinding(id, closure);
                SetFunctionName(closure, id);
            }
            return closure;
        } else {
            return NormalCompletion(empty);
        }
        return closure;
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
        F.ThisMode = "lexical";
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
                status = scope.InitialiseBinding(id, F);
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

    function NewExpression(node) {
        "use strict";
        var exprRef;
        var O, callee;
        var cx = getContext();
        var strict = cx.strict;
        var notSuperExpr = node.callee.type !== "SuperExpression";
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
        if (!IsConstructor(callee)) {
            return withError("Type", "expected function is not a constructor");
        }
        if (callee) {
            cx.callee = "new " + (Get(callee, "name") || "(anonymous)");
        }
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
        var notSuperExpr = callee.type !== "SuperExpression";
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
        var decl, decl2, init, arr, initialiser, status, env;

        // console.log("decl for "+node.type);
        var env = isCodeType(node, "VariableDeclaration") ? (node.kind === "var" ? getVarEnv() : getLexEnv()) : getLexEnv();
        var i, j, p, q, type

        var name;
        var cx = getContext();
        var strict = cx.strict;

        for (i = 0, j = node.declarations.length; i < j; i++) {
            decl = node.declarations[i];
            type = decl.type;

            // wird von binding intialisation vorher initialisiert,
            // hier wird das initialiser assignment durchgefuehrt, wenn
            // der code evaluiert wird.
            if (type === "ArrayPattern" || type === "ObjectPattern") {
                if (decl.init) initialiser = GetValue(Evaluate(decl.init));
                else return withError("Type", "Destructuring Patterns must have some = Initialiser.");
                if (isAbrupt(initialiser)) return initialiser;
                status = BindingInitialisation(decl, initialiser, env);
                if (isAbrupt(status = ifAbrupt(status))) return status;
            } else {
                if (decl.init) {
                    name = decl.id;
                    initialiser = GetValue(Evaluate(decl.init));
                    if (isAbrupt(initialiser)) return initialiser;
                    if (IsCallable(initialiser)) {
                        if (IsAnonymousFunctionDefinition(decl.init) && !HasOwnProperty(initialiser, "name")) {
                            SetFunctionName(initialiser, name);
                        }
                    }
                    status = BindingInitialisation(name, initialiser, env);
                    if (isAbrupt(status = ifAbrupt(status))) return status;
                }
            }
        }
        return NormalCompletion();
    }

    function KeyedBindingInitialisation(decl, obj, env) {
        var elem;
        var val;
        var cx = getContext();
        var identName, newName;
        if (decl.type === "ObjectPattern" || decl.type === "ObjectExpression") {

            for (var p = 0, q = decl.elements.length; p < q; p++) {

                if (elem = decl.elements[p]) {
            
                    if (elem.id) {
                        identName = elem.id.name || elem.id.value;
                        newName = elem.as.name || elem.as.value;
                    } else {
                        identName = elem.name || elem.value;
                        newName = undefined;
                    }

                    var val = Get(obj, ToString(identName));
                    if (env !== undefined) {
                        if (newName) env.InitialiseBinding(newName, val);
                        else env.InitialiseBinding(identName, val);
                    } else {
                        var lref = Evaluate(elem);
                        if (isAbrupt(lref = ifAbrupt(lref))) return lref;
                        PutValue(lref, val);
                    }
                }

            }
        }

        return NormalCompletion();

    }

    evaluation.BindingElement = function (node) {
        if (node.as) {
            return ResolveBinding(node.as);
        } else {
            return Identifier(node);
        }
        return null;
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

        if ((decl && decl.type === "ArrayPattern") ||
            (decl && decl.type === "ArrayExpression")) {

            for (var i = 0, j = decl.elements.length; i < j; i++) {
                if (elem = decl.elements[i]) {
                    if (elem.id) {
                        identName = elem.id.name;
                        newName = elem.as.name;
                    } else {
                        identName = elem.name || elem.value;
                        newName = undefined;
                    }
                    val = Get(value, ToString(i));
                    // nextIndex = nextIndex + 1;
                    if (env !== undefined) {
                        if (newName) env.InitialiseBinding(newName, val);
                        else env.InitialiseBinding(identName, val);
                    } else {
                        var lref = Evaluate(elem);
                        if (isAbrupt(lref = ifAbrupt(lref))) return lref;
                        PutValue(lref, array);
                    }
                }
            }
        } else if (decl && decl.type === "RestParameter") {
            var array = ArrayCreate(len - nextIndex);
            var name = decl.id;
            debug("processing restparameter: " + name);
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
                env.InitialiseBinding(name, array);
            } else {
                var lref = Reference(name, getLexEnv(), cx.strict);
                if (isAbrupt(lref = ifAbrupt(lref))) return lref;
                PutValue(lref, array);
            }
        }
        return len;
    }

    function BindingInitialisation(node, value, env) {
        "use strict";
        var names, name, val, got, len, ex, decl, lhs, strict;
        var cx = getContext();

        var type;
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
        } else if (type === "DefaultParameter") {
            name = node.id;
            if (value === undefined) value = GetValue(Evaluate(node.init));
            if (env !== undefined) env.InitialiseBinding(name, value, strict);
            else {
                //env = getLexEnv();
                //lhs = Reference(name, env, strict);
                lhs = ResolveBinding(name);
                PutValue(lhs, value);
            }
            return NormalCompletion(undefined);
        } else if (type === "Identifier") {
            name = node.name;
            if (env !== undefined) {
                ex = env.InitialiseBinding(name, value, strict);
                if (isAbrupt(ex)) return ex;
                return NormalCompletion(undefined);
            } else {
                //lhs = Reference(name, getLexEnv(), strict);
                //if (isAbrupt(lhs = ifAbrupt(lhs))) return lhs;
                lhs = ResolveBinding(name);
                //  console.log("lhs=");
                //  console.dir(lhs);
                ex = PutValue(lhs, value);
                if (isAbrupt(ex)) return ex;
                return NormalCompletion(undefined);
            }
        } else if (type === "ArrayPattern" || type === "ArrayExpression") {
            var decl;
            for (var p = 0, q = node.elements.length; p < q; p++) {
                if (decl = node.elements[p]) {
                    if (decl.type === "RestParameter") {
                        return IndexedBindingInitialisation(decl, p, value, env);
                    } else {
                        if (env) {
                            if (decl.id) {
                                env.InitialiseBinding(decl.as.name, value.Get(decl.id.name, value));
                            } else {
                                env.InitialiseBinding(decl.name, value.Get(ToString(p), value));
                            }
                        } else {
                            if (decl.id) {
                                lhs = Evaluate(decl.id);
                                PutValue(lhs, Get(value, decl.id.name));
                            } else {
                                lhs = Evaluate(decl.name);
                                PutValue(lhs, Get(value, ToString(p)));
                            }
                        }
                    }
                }
            }

        } else if (type === "ObjectPattern" || type === "ObjectExpression") {

            var decl;
            for (var p = 0, q = node.elements.length; p < q; p++) {
                if (decl = node.elements[p]) {

                    if (env) {

                        if (decl.id) env.InitialiseBinding(decl.as.name, value.Get(decl.id.name, value));
                        else env.InitialiseBinding(decl.name, value.Get(decl.name, value));

                    } else {
                        if (decl.id) {
                            lhs = Evaluate(decl.id);
                            PutValue(lhs, Get(value, decl.id.name));
                        } else {
                            lhs = Evaluate(decl.name);
                            PutValue(lhs, Get(value, decl.name));
                        }
                    }
                }
            }

        } else if (typeof node === "string") {
            // Assume Identifier Name
            if (env) {
                env.InitialiseBinding(node, value, strict);
            } else {
                //env = getLexEnv();
                lhs = ResolveBinding(node);
                //lhs = Reference(node, env, strict);
                PutValue(lhs, value);
            }
        }
        return NormalCompletion(undefined);
    }

    function EmptyStatement(node) {
        //if (completion) return completion;
        return NormalCompletion(empty);
    }
    evaluation.EmptyStatement = EmptyStatement;

    /*** debugger, ***************************************************************************************************** */

    evaluation.printStackEntry = printStackEntry;

    function printStackEntry(cx, key) {
        log("## stack[" + key + "] => " + cx.toString());
        /*for (var k in cx) {
            log("# Execution Context: "+cx+", field "+k);
            if (k >= stack.length-2) log(cx[k]);
            // else dir(cx[k]);
        }*/
    }

    function printEnvironment(cx) {
        var i;
        var v = getVarEnv();
        var l = getLexEnv();
        log("Running Execution Context on Top Of The Stack.");
        
        log("+++ running +++ cx.[[VarEnv]]");
        dir(v);
        log("+++ running +++ cx.[[LexEnv]]");
        dir(l);

        log("## Environments (.outer follows each");
        l = getLexEnv();
        i = 0;
        var b;
        var bound;
        var k;
        do {
            bound = "";
            log("context " + i + " (last)");
            var toString = l.toString();
            log(toString);

                 if (toString  === "[object ObjectEnvironment]")         b = l.BoundObject.Bindings;
            else if (toString  === "[object GlobalVariableEnvironment]") b = l.BoundObject.Bindings;
            else if (toString  === "[object GlobalLexicalEnvironment]")  b = l.Bindings;
            else b = l.Bindings;

            for (k in b) bound += k + ", ";
            log("Bound Identifiers: " + bound);
            log("above´s .outer below:");
            ++i;
        } while (l = l.outer);
    }

    evaluation.printStackAtDebuggerStatement = printStackAtDebuggerStatement;

    function printStackAtDebuggerStatement() {
        var stackTraceLimit = realm.xs.stackTraceLimit || 10;
        var i = 0;

        var key;
        var len;
        var cx;
        var stack = getStack();

        log("stack.length: " + stack.length);
        if (len = stack.length) {
            for (var key in stack) {
                if (len < stackTraceLimit || (key >= len - stackTraceLimit)) printStackEntry(stack[key], key);
            }
        }

        if (cx = getContext()) {
            printEnvironment(cx);
        } else log("kein context/keine environment");
    }

    function DebuggerStatement(node) {

        var loc = node.loc;

        var line = loc && loc.start ? loc.start.line : "unknown";
        var column = loc && loc.start ? loc.start.column : "unknown";

        log("DebuggerStatement at line " + (line) + ", " + (column) + "\n");
        printStackAtDebuggerStatement();
        log("DebuggerStatement End");
        return NormalCompletion(undefined);
    }
    evaluation.DebuggerStatement = DebuggerStatement;

    /* ^ debugger ****************************************************************************************************** */

    function RegularExpressionLiteral(node) {

        var literalSource = node.computed;

        if (!literalSource) {
            literalSource = (node.value && node.value.substr(1, node.value.length - 2));
        }

        var regExpTree = parseGoal("RegularExpressionLiteral", literalSource);
        if (regExpTree) {

        }

        return withError("Syntax", "Can not create Regular Expression from Literal " + literalSource);
    }
    evaluation.RegularExpressionLiteral = RegularExpressionLiteral;

    /*

    ValueLiterals
    - StringLiteral
    - Numeric
    - Boolean
*/

    evaluation.StringLiteral = StringLiteral;

    function StringLiteral(node) {
        return node.computed || unquote(node.value);
    }

    evaluation.NumericLiteral = NumericLiteral;

    function NumericLiteral(node) {
        return MV(node.value);        
        // return +node.value;
    }

    evaluation.NullLiteral = NullLiteral;

    function NullLiteral(node) {
        return null;
    }
    evaluation.BooleanLiteral = BooleanLiteral;

    function BooleanLiteral(node) {
        return node.value === "true" ? true : false;
    }

    evaluation.Literal = Literal;

    function Literal(node) {
        //if (node.goal) return evaluation[node.goal](node);
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
                var spreadLen = Get(spreadObj, "length");

                for (var k = 0; k < spreadLen; k++) {

                    exprValue = Get(spreadObj, ToString(k));
                    if (isAbrupt(exprValue = ifAbrupt(exprValue))) return exprValue;

                    array.DefineOwnProperty(ToString(nextIndex), {
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

                array.DefineOwnProperty(ToString(nextIndex), {
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
                //Put(array, "length", pad, false);


                array.Bindings["length"] = {
                    value: pad,
                    writable: true,
                    enumerable: false,
                    configurable: false
                };

                return array;
            }
        }
        array = ArrayCreate(0);
        nextIndex = 0;
        nextIndex = ArrayAccumulation(node.elements, array, nextIndex);
        if (isAbrupt(nextIndex = ifAbrupt(nextIndex))) return nextIndex;

        array.Bindings["length"] = {
            value: nextIndex,
            writable: true,
            enumerable: false,
            configurable: false
        };

        return NormalCompletion(array);
    }




    evaluation.PropertyDefinition = PropertyDefinition;
    function PropertyDefinition(newObj, propertyDefinition) {
        "use strict";

            var kind = propertyDefinition.kind;
            var key =  propertyDefinition.key;
            var node = propertyDefinition.value;
            
            var strict = node.strict;
            var isComputed = propertyDefinition.computed;

            var status;   
            var exprRef, exprValue;
            var propRef, propName, propValue;
            var closure;
            var formals;
            var body;
            var scope;
            var hasSuperRef;
            var homeObject;
            var methodName;
            var functionPrototype;

            
            /* I refactored it today, but resetted it tonight, i rewrite it tomorrow */
            

        // TOMORROW ? (FOUR DAYS AGO)

            if (kind == "init") {

                // prop key
                if (isComputed) {
                    var symRef = Evaluate(key);
                    var symValue = GetValue(symRef);
                    if (isAbrupt(symValue = ifAbrupt(symValue))) return symValue;
                    if (!IsSymbol(symValue)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");
                    propName = symValue;
                } else {
                    
                    // init
                    propName = PropName(key);

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
                    if (!isComputed && propName === "__proto__") {
                        if (Type(propValue) === "object" || propValue === null) {
                            return callInternalSlot("SetPrototypeOf", newObj, propValue);
                        }
                        return NormalCompletion(empty);
                    }
                // FOR NOW

                    // Der neue IsAnonymousFn fehlt noch.

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
                        if (!IsSymbol(propName)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");
                } else {
                    propName = typeof key === "string" ? key : key.name || key.value;
                }
                defineGetterOrSetterOnObject(node, newObj, propName, kind);
            }
        
    }

// Got to REDO ALL FOUR FUNCTIONS above and below from paper. It´s messed up (a litte, 2 init, 2 method because auf a missing computedpropertyname in propertykey and a missing propertykey() in method definition). thats all.

    function defineFunctionOnObject (node, newObj, propName) {
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

            if (id) scope.InitialiseBinding(id, propValue);

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

    var isValidSimpleAssignmentTarget = {
        "ObjectPattern": true,
        "ArrayPattern": true,
        "ObjectExpression": true,
        "ArrayExpression": true
    };

    evaluation.ObjectPattern = ObjectPattern;

    function ObjectPattern(node) {
        var n;
        var init = node.init;
        node.init = null;
        n = Node("AssignmentExpression");
        n.left = node;
        n.right = init;
        n.operator = "=";
        n.loc = node.loc;
        return DestructuringAssignmentEvaluation(n);
    }

    function IteratorDestructuringEvaluation() {}

    function DestructuringAssignmentEvaluation(node) {

        var type = node.left.type;
        var op = node.operator;
        var leftElems = node.left.elements;
        
        var lval, rval;
        var rref, lref;
        var result;
        var l, i, j;
        var obj, array;

        rref = Evaluate(node.right);
        if (isAbrupt(rref = ifAbrupt(rref))) return rref;
        rval = GetValue(rref);
        if (isAbrupt(rval = ifAbrupt(rval))) return rval;

        if (type === "ObjectPattern" || type === "ObjectExpression") {

            obj = rval;
            var identName, newName;

            if (Type(rval) !== "object") return withError("Type", "can not desctructure a non-object into some object");

            for (i = 0, j = leftElems.length; i < j; i++) {
                if (leftElems[i].id) identName = leftElems[i].id.name;
                else identName = leftElems[i].name;

                lval = GetValue(Evaluate(leftElems[i]));
                rval = Get(obj, identName);
                result = applyAssignmentOperator(op, lval, rval);

                if (leftElems[i].as) newName = leftElems[i].as.name;

                var LexEnv = getLexEnv();

                if (newName) LexEnv.SetMutableBinding(newName, result)
                else LexEnv.SetMutableBinding(identName, result);
                newName = undefined;
            }

            return NormalCompletion(result);

        } else if (type === "ArrayPattern" || type === "ArrayExpression") {

            array = rval;
            if (Type(array) !== "object") return withError("Type", "can not desctructure a non-object into some object");
            var width;
            var index = 0;
                var len = Get(array, "length");
            var status;

            for (i = 0, j = leftElems.length; i < j; i++) {

                var ltype = leftElems[i].type;
                if (ltype === "SpreadExpression") { // === REST! Achtung

                    var rest = ArrayCreate(0);
                    var restName = BoundNames(leftElems[i].argument)[0];
                    var index2 = 0;

                    while (index < len) {
                        lval = Get(array, ToString(index));
                        result = applyAssignmentOperator(op, lval, rval);
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

                    l = leftElems[i].value || leftElems[i].name;
                    rval = Get(array, ToString(index));
                    lval = GetValue(Evaluate(leftElems[i]));
                    result = applyAssignmentOperator(op, lval, rval);
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
        //var cx = getContext();
        //if (cx.generator) {}

        if (ltype === "Identifier") {

            lref = Evaluate(node.left);
            rref = Evaluate(node.right);
            if (isAbrupt(lref = ifAbrupt(lref))) return lref;
            if (isAbrupt(rref = ifAbrupt(rref))) return rref;
            lval = GetValue(lref);
            rval = GetValue(rref);
            if (isAbrupt(lval = ifAbrupt(lval))) return lval;
            if (isAbrupt(rval = ifAbrupt(rval))) return rval;
            result = applyAssignmentOperator(op, lval, rval);
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
            //console.dir(lref);
            result = applyAssignmentOperator(op, lval, rval);
            //    return PutValue(lref, result);
            status = Put(lref.base, lref.name, result, false);

            if (isAbrupt(status)) return status;
        } else if (isValidSimpleAssignmentTarget[ltype]) {
            return DestructuringAssignmentEvaluation(node);
        } else {
            return withError("Reference", "Currently not a valid lefthandside expression for assignment")
        }
        return NormalCompletion(result);
    }
    evaluation.ConditionalExpression = ConditionalExpression;

    function add(op, left, right) { 
        left = GetValue(left);
        right = GetValue(right);
        switch (op) {
        case "+=":
            return left += right;
        case "%=":
            return left %= right;
        case "/=":
            return left /= right;
        case "*=":
            return left *= right;
        case "-=":
            return left -= right;
        case "^=":
            return left ^= right;
        case "|=":
            return left |= right;
        case "&=":
            return left &= right;
        case ">>>=":
            return left >>>= right;
        case "=":
            return left = right;
        }
    }

    function applyAssignmentOperator(op, lval, rval) {
        var newValue;
        switch (op) {
        case "+=":
            newValue = lval + rval;
            break;
        case "%=":
            newValue = lval % rval;
            break;
        case "/=":
            newValue = lval / rval;
            break;
        case "*=":
            newValue = lval * rval;
            break;
        case "-=":
            newValue = lval - rval;
            break;
        case "^=":
            newValue = lval ^ rval;
            break;
        case "|=":
            newValue = lval | rval;
            break;
        case "&=":
            newValue = lval & rval;
            break;
        case ">>>=":
            newValue = lval >>> rval;
            break;
        case "=":
            newValue = rval;
            break;
        }
        return newValue;
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

    function UnaryExpression(node) {
        var status;
        var isPrefixOperation = node.prefix;
        var oldValue, newValue, val;
        var op = node.operator;
        var argument = getCode(node, "argument");

        var exprRef = Evaluate(argument);
        if (isAbrupt(exprRef = ifAbrupt(exprRef))) return exprRef;

        if (op === "typeof") {

            if (Type(exprRef) === "reference") {
                if (IsUnresolvableReference(exprRef)) return NormalCompletion("undefined");
                val = GetValue(exprRef);
            } else val = exprRef;

            if (isAbrupt(val = ifAbrupt(val))) return val;

            var lazyTypeString = Type(val);

            if (IsCallable(val)) return NormalCompletion("function");
            if (val === null) return NormalCompletion("object");
            return NormalCompletion(lazyTypeString);

        } else if (op === "void") {

            oldValue = GetValue(exprRef);
            return NormalCompletion(undefined);

        } else if (op === "delete") {

            if (Type(exprRef) !== "reference") return true;
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
            case "~":
                oldValue = ToNumber(GetValue(exprRef));
                newValue = ~oldValue;
                return NormalCompletion(newValue);
            case "!":
                oldValue = ToNumber(GetValue(exprRef));
                newValue = !oldValue;
                return NormalCompletion(newValue);
            case "+":
                return NormalCompletion(ToNumber(GetValue(exprRef)));
                break;
            case "-":
                oldValue = ToNumber(GetValue(exprRef));
                if (oldValue != oldValue) return NormalCompletion(oldValue);
                return NormalCompletion(-oldValue);
                break;
            case "++":
                oldValue = ToNumber(GetValue(exprRef));
                if (isAbrupt(oldValue)) return oldValue;
                oldValue = unwrap(oldValue);
                newValue = oldValue + 1;
                status = PutValue(exprRef, newValue);
                if (isAbrupt(status)) return status;
                return NormalCompletion(newValue);
                break;
            case "--":
                oldValue = ToNumber(GetValue(exprRef));
                if (isAbrupt(oldValue)) return oldValue;
                oldValue = unwrap(oldValue);
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

    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */

    function StrictEqualityComparison(x, y) {
        var tx = Type(x);
        var ty = Type(y);

        if (tx !== ty) return false;

        if (tx === "undefined" && ty === "null") return false;
        if (ty === "undefined" && tx === "null") return false;

    }

    function AbstractEqualityComparison(x, y) {
        var tx = Type(x);
        var ty = Type(y);

        if (tx === ty) return StrictEqualityComparison(x, y);

        if (tx === "undefined" && ty === "null") return true;
        if (ty === "undefined" && tx === "null") return true;

    }

    function AbstractRelationalComparison(leftFirst) {
        var tx = Type(x);
        var ty = Type(y);

    }

    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */

    function instanceOfOperator(O, C) {
        if (Type(C) !== "object") return withError("Type", "instanceOfOperator: C is not an object.");
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
        case "of":
            debug("doing the impossible");
            var value = Invoke(ToObject(rval), "valueOf");
            result = SameValue(rval, lval);
            return result;
        case "in":
            result = HasProperty(rval, ToPropertyKey(lval));
            return result;
        case "<":
            result = lval < rval;
            break;
        case ">":
            result = lval > rval;
            break;
        case "<=":
            result = lval <= rval;
            break;
        case ">=":
            result = lval >= rval;
            break;
        case "+":
            result = lval + rval;
            break;
        case "-":
            result = lval - rval;
            break;
        case "*":
            result = lval * rval;
            break;
        case "/":
            result = lval / rval;
            break;
        case "^":
            result = lval ^ rval;
            break;
        case "%":
            result = lval % rval;
            break;
        case "===":
            result = lval === rval;
            break;
        case "!==":
            result = lval !== rval;
            break;
        case "==":
            result = lval == rval;
            break;
        case "!=":
            result = lval != rval;
            break;
        case "&&":
            result = lval && rval;
            break;
        case "||":
            result = lval || rval;
            break;
        case "|":
            result = lval | rval;
            break;
        case "&":
            result = lval & rval;
            break;
        case "<<":
            result = lval << rval;
            break;
        case ">>":
            result = lval >> rval;
            break;
        case ">>>":
            result = lval >>> rval;
            break;
        case "instanceof":
            result = instanceOfOperator(lval, rval);
            return result;
            break;
        default:
            break;
        }

        return NormalCompletion(result); // NormalCompletion(result);
    }

    evaluation.ExpressionStatement = ExpressionStatement;

    function ExpressionStatement(node) {
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
                tellExecutionContext(item, i);
                exprRef = Evaluate(item);
                if (isAbrupt(exprRef)) return exprRef;
                exprValue = GetValue(exprRef);
                if (isAbrupt(exprValue)) return exprValue;
                if (exprValue !== empty) V = exprValue;
            }
        }
        return NormalCompletion(V);
    }

    evaluation.FunctionStatementList = StatementList;

    evaluation.StatementList = StatementList;

    function StatementList(stmtList) {
        var stmtRef, stmtValue, stmt;

        var index = 0;

        // try for some resume. Hope to have not so many loops to update.
        
        if (getContext().generator) {
            var state = getContext().state;
            var instructionIndex = state[state.length-1].instructionIndex;
            if (instructionIndex > 0) index = instructionIndex;
        }

        var V = undefined;
        for (var i = index, j = stmtList.length; i < j; i++) {
            if (stmt = stmtList[i]) {
                tellExecutionContext(stmt, i);
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
        if (labelSet && labelSet[completion.target]) return true;
        return false;
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

        return NormalCompletion(V);
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

// TODO: RESUME for Generator
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
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            Assert(keys.type === "continue");
            return Completion("break");
        }
        return keys;
    }


// TODO: RESUME for Generator
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
            if (Type(nextResult) !== "object") return withError("Type", "ForInOfBodyEvaluation: nextResult is not an object");
            done = IteratorComplete(nextResult);
            if (isAbrupt(done = ifAbrupt(done))) return done;
            if (done === true) return NormalCompletion(V);
            nextValue = IteratorValue(nextResult);
            if (isAbrupt(nextValue = ifAbrupt(nextValue))) return nextValue;
            if (lhsKind === "assignment") {

                if (lhs.type !== "ObjectPattern" && lhs.type !== "ArrayPattern") {

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

                Assert(lhsKind === "lexicalBinding", "lhsKind muss lexical Binding sein");
                // Assert(lhs == ForDeclaration);
                var iterationEnv = NewDeclarativeEnvironment(oldEnv);
                for (var i = 0, j = names.length; i < j; i++) {
                    iterationEnv.CreateMutableBinding(names[i], true);
                }
                getContext().LexEnv = iterationEnv;
                status = BindingInitialisation(lhs, nextValue, iterationEnv);
                if (isAbrupt(status)) return (getContext().LexEnv = oldEnv), status;
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

        
        var labelSet = labelSet || Object.create(null);
        var lhsKind = "assignment";
        var iterationKind = "enumerate";

        var keyResult = ForInOfExpressionEvaluation(right, iterationKind, labelSet);
        return ForInOfBodyEvaluation(left, body, keyResult, lhsKind, labelSet);
    }
    evaluation.ForInStatement = ForInStatement;

    var assignmentRather = {
        "Identifier": true,
        "ArrayPattern": true,
        "ObjectPattern": true
    };

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
        else throw SyntaxError("can not evaluate " + type);
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

    var IterationStatements = {
        "ForStatement": true
    };

    var BreakableStatements = {
        "WhileStatement": true,
        "DoWhileStatement": true,
        "SwitchStatement": true
    };

// TODO: RESUME for Generator
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
        
        if (!labelSet) {
            labelSet = Object.create(null);
            //cx.labelSet = labelSet;
        }

        if (initExpr) {

            if (IsVarDeclaration(initExpr)) {
                varDcl = Evaluate(initExpr);
                if (!LoopContinues(varDcl, labelSet)) return varDcl;
                return ForBodyEvaluation(testExpr, incrExpr, body, labelSet);

            } else if (IsLexicalDeclaration(initExpr)) {

                oldEnv = getLexEnv();
                loopEnv = NewDeclarativeEnvironment(oldEnv);
                isConst = IsConstantDeclaration(initExpr);

                for (var i = 0, j = initExpr.declarations.length; i < j; i++) {
                    var names = BoundNames(initExpr.declarations[i]);
                    for (var y = 0, z = names.length; y < z; y++) {
                        dn = names[y];
                        if (isConst) {
                            loopEnv.CreateImmutableBinding(dn);
                        } else {
                            loopEnv.CreateMutableBinding(dn, false);
                        }
                    }
                }

                getContext().LexEnv = loopEnv;

                forDcl = Evaluate(initExpr);
                if (!LoopContinues(forDcl, labelSet)) {
                    getContext().LexEnv = oldEnv;
                    return forDcl;
                }

                bodyResult = ForBodyEvaluation(testExpr, incrExpr, body, labelSet);

                getContext().LexEnv = oldEnv;
                return bodyResult;

            } else {
                var exprRef = Evaluate(initExpr);
                var exprValue = GetValue(exprRef);
                if (!LoopContinues(exprValue, labelSet)) return exprValue;
                return ForBodyEvaluation(testExpr, incrExpr, body, labelSet);
            }
        }

    }

    function ForBodyEvaluation(testExpr, incrementExpr, stmt, labelSet) {
        "use strict";
        var V;
        var result;
        var testExprRef, testExprValue;
        var incrementExprRef, incrementExprValue;
        for (;;) {
            if (testExpr) {
                testExprRef = Evaluate(testExpr);
                testExprValue = GetValue(testExprRef);
                if (testExprValue === false) return NormalCompletion(V);
                if (!LoopContinues(testExprValue, labelSet)) return testExprValue;
            }

            result = Evaluate(stmt);

            if (result instanceof CompletionRecord) {
                if (result.value !== empty) V = result.value;
            } else V = result;

            if (!LoopContinues(result, labelSet)) return result;
            if (incrementExpr) {
                incrementExprRef = Evaluate(incrementExpr);
                incrementExprValue = GetValue(incrementExprRef);
                if (!LoopContinues(incrementExprValue, labelSet)) return incrementExprValue;
            }
        }
        return NormalCompletion(V);
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
        loop: for (var i = 0, j = caseBlock.length; i < j; i++) {
            clause = caseBlock[i];
            if (clause.type === "DefaultCase") {
                defaultClause = clause;
            } else {

                clauseSelector = CaseSelectorEvaluation(clause);
                if (isAbrupt(clauseSelector)) return clauseSelector;
                if (searching) matched = SameValue(input, clauseSelector);
                if (matched) {
                    searching = false;
                    sList = clause.consequent; // parseNode
                    if (sList) {
                        R = GetValue(Evaluate(sList));
                        if (isAbrupt(R)) {
                            if (R.type === "break") break loop;
                            if (R.type === "continue") return withError("Type", "continue is not allowed in a switch statement");
                            if (R.type === "throw") return R;
                            if (R.type === "return") return R;
                        } else {
                            V = R;
                        }
                    }
                    if (isAbrupt(R)) break loop;
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
        var strings = [];

        var rawString = node.value.slice(1, node.value.length - 1);

        var intoPieces = /(\$\{[^}]+})/g;
        var sparseSpans = rawString.split(intoPieces);

        var getVarName = /\$\{([^\}]+)\}/;
        var sparseVars = sparseSpans.map(function (x) {
            if (x) return x.split(getVarName)[1];
        });

        for (var i = 0, j = sparseVars.length; i < j; i++) {

            if (raw) {
                /*
            strings = TRV(head).concat(TRV(middle)).concat(TRV(tail));
            */
                if (sparseVars[i] === undefined) { // auf Span
                    strings.push(sparseSpans[i]);
                } else { // auf Element
                    //    strings.push(sparseVars[i]);
                }
            } else {
                /*
            strings = TV(head).concat(TV(middle)).concat(TV(tail));
            */
                if (sparseVars[i] === undefined) { // auf Span
                    // strings.push(sparseSpans[i]);
                } else { // auf Element
                    strings.push(sparseVars[i]);
                }
            }
        }
        return strings;
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
            if (!IsSymbol(propKey)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");
        } else {
            propKey = PropName(node);
        }

        var methodName = propKey;
        if (isAbrupt(propKey = ifAbrupt(propKey))) return propKey;

        
        if (ReferencesSuper(node)) {
            var home = getInternalSlot(object, "HomeObject");
        } else {
            home = undefined;
            methodName = undefined;
        }

        if (generator) closure = GeneratorFunctionCreate("method", formals, body, scope, strict, functionPrototype, home, methodName);
        else closure = FunctionCreate("method", formals, body, scope, strict, functionPrototype, home, methodName);
        if (isAbrupt(closure = ifAbrupt(closure))) return closure;
        
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
        var intrinsics = getIntrinsics();
        var ObjectPrototype = Get(intrinsics, "%ObjectPrototype%");
        var FunctionPrototype = Get(intrinsics, "%FunctionPrototype%");
        var className = node.id;
        var isExtending = node.extends;
        var constructorParent;
        var Proto;
        var element, decl;
        var name, isStatic;
        var status;
        var type;
        var expression = node.expression;

        if (node.extends) {
            superclass = GetValue(Evaluate(node.extends));
        }

        if (!superclass) {
            protoParent = null;
            constructorParent = FunctionPrototype;
        } else {
            if (Type(superclass) !== "object") return withError("Type", "superclass is no object");
            if (!IsConstructor(superclass)) return withError("Type", "superclass is no constructor");
            protoParent = Get(superclass, "prototype");
            if (Type(protoParent) !== "object" && Type(protoParent) !== "null") return withError("Type", "prototype of superclass is not object, not null");
            constructorParent = superclass;
        }

        Proto = ObjectCreate(protoParent);

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
        if (node.extends) {
            setInternalSlot(F, "HomeObject", protoParent);
            setInternalSlot(F, "MethodName", "constructor");
        }

        MakeConstructor(F, false, Proto);

        if (className) {
            SetFunctionName(F, className);
            lex.InitialiseBinding(className, F);
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
        var objEnv = ObjectEnvironment(object, cx.LexEnv);
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
                var len = Get(accumulator, "length");
                if (len >= (Math.pow(2, 53) - 1)) return withError("Range", "Range limit exceeded");

                var putStatus = Put(accumulator, ToString(len), exprValue, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                len = len + 1;
                var putStatus = Put(accumulator, "length", len, true);
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
            if (Type(nextResult) !== "object") return withError("Type", "QualifierEvaluation: nextResult is not an object");
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
            var continu = ComprehensionEvaluation(node, accumulator);
            getContext().LexEnv = oldEnv;
            if (isAbrupt(continu = ifAbrupt(continu))) return continu;
        }

        return accumulator;
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

    var isStrictMode = {
        "'use strict'": true,
        '"use strict"': true
    };
    var isUsingAsmJsWhatMeansNuttingButADirectiveHereBUTaValidatorOrGeneratorWouldBeCool = {
        "'use asm'": true,
        '"use asm"': true
    };

    evaluation.Directive = Directive;

    function Directive(node) {
        if (isStrictMode[node.value]) {
            getContext().strict = true;
        } else if (isUsingAsmJsWhatMeansNuttingButADirectiveHereBUTaValidatorOrGeneratorWouldBeCool[node.value]) {
            getContext().asm = true;
        }
        return NormalCompletion(empty);
    }


    function tellExecutionContext(node, i, parent) {
        loc = node.loc || loc;
        var cx = getContext(); // expensive putting such here
        var state = cx.state;
        
        if (state) {
            var stateRec = state[state.length-1];
            if (stateRec) stateRec.instructionIndex = i;
            // unsure but i have to reenter statementlists at some point,
            cx.state.node = node;
        }
        cx.line =   loc.start.line;
        cx.column = loc.start.column;
    }

    evaluation.ScriptBody =
        evaluation.Program = Program;

    function Program(program) {

        "use strict";
        var v;
        var cx = getContext();
        
        if (program.strict) {
            cx.strict = true;
        }

        var status = InstantiateGlobalDeclaration(program, getGlobalEnv(), []);
        if (isAbrupt(status)) return status;

        tellExecutionContext(program, 0);
        cx.callee = "ScriptItemList";
        cx.caller = "Script";

        var node;
        var V = undefined;
        var body = program.body;
        for (var i = 0, j = program.body.length; i < j; i += 1) {
            if (node = body[i]) {
                tellExecutionContext(node, i);
                v = GetValue(Evaluate(node));
                if (isAbrupt(v)) {
                    return v;
                }
                if (v !== empty) V = v;
            }
        }

        return NormalCompletion(V);
    }

    function TransformObjectToJSObject(O) {

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
                if (Type(value) === "object") {

                    if (IsCallable(value)) {
                        newValue = function () {
                            var c = callInternalSlot("Call", value, value, arguments);
                            c = unwrap(c);
                            if (Type(c) === "object") return TransformObjectToJSObject(c);
                            return c;
                        };
                    } else {

                        newValue = TransformObjectToJSObject(value);
                    }
                } else if (Type(value) === "symbol") {
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

    /************************************************************ end of ast evaluation section ***************************************************************/

    var DiverseSubProductions = {
        "alternate": "alternate",
        "consequent": "consequent",
        "left": "left",
        "right": "right",
        "body": "body",
        "block": "block"
    };

    ecma.Evaluate = Evaluate;

    function Evaluate(node, a, b, c, d) {

        if (!node) return NormalCompletion(undefined);
        // record everywhere oder nur bei generator?
        // cheaper is if (cx.generator)
        var cx = getContext();

        var state = cx.state;
        state.push([node,a,b,c]);

        var result = Evaluate2(node, a,b,c);

        state.pop();
        return result;
    }

    ecma.ResumeEvaluate = ResumeEvaluate;


// Da ist noch eine Bottom Up Methode

    function GoDownEvaluate(a,b,c) {
            var r;
            var state = getContext().state;
            while (state.length) {
                var state = getContext().state;
                var stateRec = state[state.length-1];
                var R = Evaluate2.apply(this, stateRec);

                if (isAbrupt(R = ifAbrupt(R))) return R;
                if (R !== empty) r = R;
                state.pop();
        }
        return NormalCompletion(r);
    }

    function ResumeEvaluate(a,b,c) {
        var result = GoDownEvaluate(a, b, c);    
        return result;
    }

    function Evaluate2(node, a, b, c) {
        var E, R;
        var body, i, j;
 
        if (typeof node === "string") {
            debug("Evaluate(resolvebinding " + node + ")");
            R = ResolveBinding(node);

        } else if (Array.isArray(node)) {

            debug("Evaluate(StatementList)");
            if (node.type) R = evaluation[node.type](node, a, b, c);
            else R = evaluation.StatementList(node, a, b, c);

        } else {
            
            debug("Evaluate(" + node.type + ")");
            if (E = evaluation[node.type]) {
                tellExecutionContext(node, 0);
                R = E(node, a, b, c);
            }
            
        }

        return R;
    }

    function HandleEventQueue(shellmode, initialised) {
        var task, val;
        var func, timeout, time, result;

        function handler() {
            if (task = eventQueue.shift()) {
                func = task.func;
                time = Date.now();
                if (time >= (task.time + task.timeout)) {
                    if (IsCallable(func)) result = func.Call(ThisResolution());
                    if (isAbrupt(result)) result = result; // ThrowAbruptThrowCompletion(result);
                } else eventQueue.push(task);
            }
            if (eventQueue.length) setTimeout(handler, 0);
            else if (!shellmode && initialised) endRuntime();
        }
        setTimeout(handler, 0);
    }

    function makeNativeException (error) {
        var name = unwrap(Get(error, "name"));
        var message = unwrap(Get(error, "message"));
        var callstack = unwrap(Get(error, "stack"));
        var text = makeMyExceptionText(name, message, callstack);
        
        var nativeError = new Error(name);
        nativeError.name = name;
        nativeError.message = message;
        nativeError.stack = text;
        return nativeError;
    }


    function ExecuteTheCode(source, shellModeBool, resetEnvNowBool) {
        var exprRef, exprValue, text, type, message, stack, error, name, callstack;

        var node = typeof source === "string" ? parse(source) : source;
        if (!node) throw "example: Call Evaluate(parse(source)) or Evaluate(source)";

        if (!initialisedTheRuntime || !shellModeBool || resetEnvNowBool) {
            
            initializeTheRuntime();
            NormalCompletion(undefined);
        }

        // convert references into values to return values to the user (toValue())
        exprRef = Evaluate(node);
        if (Type(exprRef) === "reference") exprValue = GetValue(exprRef);
        else exprValue = exprRef;


        // exception handling.
        if (isAbrupt(exprValue = ifAbrupt(exprValue))) {
            if (exprValue.type === "throw") {
                
                error = exprValue.value;

                if (Type(error) === "object") {
                    throw makeNativeException(error);
                } else {
                    error = new Error(error);
                    error.stack = "{eddies placeholder for stackframe of non object throwers}";
                }
                if (error) throw error;

            }
        }



        // now process my eventQueue (which will be replaced by ES6 concurrency and task queues)
        if (!shellModeBool && initialisedTheRuntime && !eventQueue.length) endRuntime();
        else if (eventQueue.length) setTimeout(function () {HandleEventQueue(shellModeBool, initialisedTheRuntime);}, 0);
        


        return exprValue;
    }


    function endRuntime() {
        initialisedTheRuntime = false;
    }
    function initializeTheRuntime() {
        var realm = CreateRealm(); 
        ecma.setCodeRealm(realm);
        
        initialisedTheRuntime = true;
        scriptLocation = "(syntax.js)";
        if (typeof window !== "undefined") {
            scriptLocation = "("+document.location.href + " @syntax.js)";
        } else if (typeof process !== "undefined") {
            scriptLocation = "(node.js interpreter)";
        } else {
            scriptLocation = "(worker)";
        }
        realm.xs.scriptLocation = scriptLocation;
    }



    ExecuteTheCode.setCodeRealm = setCodeRealm;
    ExecuteTheCode.Evaluate = Evaluate;


    function ExecuteAsync (source) {
        var p = makePromise(function (resolve, reject) {
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
        return p;
    }
    
    ExecuteTheCode.ExecuteAsync = ExecuteAsync;
    ExecuteTheCode.ExecuteAsyncTransform = ExecuteAsyncTransform;

    function ExecuteAsyncTransform (source) {
        
        return makePromise(function (resolve, reject) {
            ;
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

            //endRuntime();
        });
    }


    return ExecuteTheCode;
});
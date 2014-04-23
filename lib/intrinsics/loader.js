// ##################################################################
// %Loader% und Loader.prototype
// ##################################################################

function hasRecordInList(list, field, value) {
    if (!list) return false;
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
    if (Type(value) === OBJECT && (m=getInternalSlot(value, "LoaderRecord"))) {
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
    ////debug2("loadmodule");
    if (!options) options = ObjectCreate();
    name = ToString(name);
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
                load = CreateLoad(name);
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
        var load = getInternalSlot(F, "Load");
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
        } else if (Type(instantiateResult) === OBJECT) {
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
    p = PromiseAll(loadPromises);
    F = LoadSucceeded();
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
    //debug2("PromiseOfStartLoadPartWayThrough: start");
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
    //debug2("AsyncStartLoadPartwayThrough: start");
    var AsyncStartLoadPartwayThrough_Call = function (thisArg, argList) {
        //debug2("AsyncStartLoadPartwayThrough_Call");
        var resolve = argList[0];
        var reject = argList[1];
        var state = getInternalSlot(F, "StepState");
        var loader = state.Loader;
        var name = state.ModuleName;
        var step = state.Step;
        var source = state.ModuleSource;
        if (hasRecordInList(loader.Modules, "Name", name)) return withError("Type", "Got name in loader.Modules");
        if (hasRecordInList(loader.Loads, "Name", name)) return withError("Type", "loader.Loads contains another entry with name '"+name+"'");
        var load = CreateLoad(name);
        load.Metadata = state.ModuleMetadata;
        var linkSet = CreateLinkSet(loader, load);
        if (!Array.isArray(loader.Loads)) loader.Loads = [];
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
    var env = NewModuleEnvironment(globalEnv);
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
    return ls;
}
LinkSet.prototype.toString = function () { return "[object LinkSet]"; };

// 27.1.
function CreateLinkSet(loader, startingLoad) {
    //debug2("createlinkset");
    if (Type(loader) !== OBJECT) return withError("Type", "CreateLinkSet: loader has to be an object");
    if (!hasInternalSlot(loader, "Load")) return withError("Type", "CreateLinkSet: loader is missing internal properties");
    var promiseCapability = PromiseBuiltinCapability();
    if (isAbrupt(promiseCapability = ifAbrupt(promiseCapability))) return promiseCapability;
    var linkSet = LinkSet(loader, loads, promiseCapability.Promise, promiseCapability.Resolve, promiseCapability.Reject);
    AddLoadToLinkSet(linkSet, startingLoad);
    return NormalCompletion(linkSet);
}

// 27.1.
function AddLoadToLinkSet(linkSet, load) {
    //debug2("add load to linkset");
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
    //debug2("updatelinksetonload");
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
    //debug2("linksetfailed");
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
    Assert(!isAbrupt(result), "linkSet.reject had to terminate normally");
    return NormalCompletion(result);
}

// 27.1.    USING EXPENSIVE SPLICES to EMPTY the array (and .indexOf Arrays )
function FinishLoad(loader, load) {
    //debug2("finishload");
    var name = load.Name;
    if (name !== undefined) {
        Assert(!hasRecordInList(loader.Modules, "Key", load.Name), "there may be no duplicate records in loader.Modules");
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
// 29.1.

function LinkageGroups(start) {
    Assert(Array.isArray(start), "start has to be a list of LinkSet Records");
    //debug2("linkage groups starts");
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
            envRec.InitializeBinding(def.LocalName, def.Module);
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
        var modReq = entry.ModuleRequest;
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
    //debug2("resolve exports");
    var exportDefinitions = getInternalSlot(M, "ExportDefinitions");
    for (var i = 0, j = exportDefinitions.length; i < j; i++) {
        var def = exportDefinitions[i];
        ResolveExport(M, def.exportName, []);
    }
}

// 29.1
function ResolveExport(M, exportName, visited) {
    //debug2("resolve export");
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
        var pair = loads[i];
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
    var status = InstantiateModuleDeclaration(body, env);
    var initContext = ExecutionContext(null);
    initContext.realm = getInternalSlot(loader, "Realm");
    initContext.VarEnv = env;
    initContext.LexEnv = env;
    var stack = getStack();
    if (stack.length) getStack().pop();
    stack.push(initContext);
    var r = Evaluate(body);
    Assert(stack.pop() === initContext, "EnsureEvaluated: The right context could not be popped off the stack.");
    return r;
}



var ReturnUndefined_Call = function (thisArg, argList) {
    return NormalCompletion(undefined);
};

var ConstantFunction_Call = function (thisArg, argList) {
    return getInternalSlot(this, "ConstantValue");
};

function CreateConstantGetter(key, value) {
    var getter = CreateBuiltinFunction(getRealm(), ConstantFunction_Call, 0, "get " + key);
    setInternalSlot(getter, "ConstantValue", value);
    return getter;
}

function ReturnUndefined() {
    var F = OrdinaryFunction();
    setInternalSlot(F, "Call", ReturnUndefined_Call);
    return F;
}

function IterableToList(iterable) {
    //debug2("iterable2list");
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
    //debug2("get options");
    if (options == undefined) return undefined;
    if (Type(options) !== OBJECT) return withError("Type", "options is not an object");
    return Get(options, name);
}

function OrdinaryModule() {
    //debug2("ordinarymodule");
    var mod = ObjectCreate(null, {
        "Environment": undefined,
        "Exports": undefined,
        "Dependencies": undefined
    });
    return mod;
}
function Module(obj) {
    if (Type(obj) !== OBJECT) return withError("Type", "module obj is not an object");
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
    if (Type(loader) !== OBJECT) return withError("Type", "Loader is not an object");

    if (getInternalSlot(loader, "LoaderRecord") !== undefined) return withError("Type", "loader.[[LoaderRecord]] isnt undefined");
    if (Type(options) !== OBJECT) return withError("Type", "the Loader constructors´ options argument is not an object");

    var realmObject = Get(options, "realm");
    if (isAbrupt(realmObject = ifAbrupt(realmObject))) return realmObject;

    var realm;
    if (realmObject === undefined) realm = getRealm();
    else {
        if ((Type(realmObject) !== OBJECT) || !hasInternalSlot(realmObject, "Realm")) {
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
    if (getInternalSlot(loader, "LoaderRecord") !== undefined) return withError("Type", "loader.[[LoaderRecord]] seems to have been changed, expected the undefined value.");

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
    if (Type(loader) !== OBJECT || !hasInternalSlot(loader, "Realm")) {
        return withError("Type", "the this value is not a valid loader object");
    }
    var loaderRecord = getInternalSlot(loader, "LoaderRecord");
    var realm = loaderRecord.Realm;
    return NormalCompletion(realm);
};

// 31.1.
var LoaderPrototype_get_global = function (thisArg, argList) {
    var loader = thisArg;
    if (Type(loader) !== OBJECT || !hasInternalSlot(loader, "Realm")) {
        return withError("Type", "the this value is not a valid loader object");
    }
    var loaderRecord = getInternalSlot(loader, "LoaderRecord");
    var realm = loaderRecord.Realm;
    var global = realm.globalThis;
    return NormalCompletion(global);
};

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
    //debug2("loaderprotodefine");
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
    //debug2("loaderprotoload");
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
    //debug2("loaderprotomodule");
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
    var p = PromiseThen(linkSet.Done, successCallback);
    var sourcePromise = PromiseOf(source);
    ProceedToTranslate(loader, load, sourcePromise);
    return NormalCompletion(p);
};

// 31.1.
var LoaderPrototype_import = function (thisArg, argList) {
    //debug2("loaderprototypeimport");
    var name = argList[0];
    var options = argList[1];
    var loader = thisLoader(thisArg);
    if (isAbrupt(loader = ifAbrupt(loader))) return loader;
    var loaderRecord = getInternalSlot(loader, "LoaderRecord");
    var p = LoadModule(loaderRecord, name, options);
    if (isAbrupt(p = ifAbrupt(p))) return p;
    var F = EvaluateLoadedModule();
    setInternalSlot(F, "Loader", loaderRecord);
    var p = PromiseThen(p, F);
    return p;
};

// 31.1.
var LoaderPrototype_eval = function (thisArg, argList) {
    //debug2("loaderprototypeeval");
    var source = argList[0];
    var loader = thisLoader(thisArg);
    if (isAbrupt(loader = ifAbrupt(loader))) return loader;
    var loaderRecord = getInternalSlot(loader, "LoaderRecord");
    return IndirectEval(loaderRecord.Realm, source);
};

// 31.1.
var LoaderPrototype_get = function (thisArg, argList) {
    //debug2("loaderprototypeget");
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
    //debug2("loaderprototypehas");
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
    //debug2("loaderprototypeset");
    var name = argList[0];
    var module = argList[1];
    var loader = thisLoader(thisArg);
    if (isAbrupt(loader = ifAbrupt(loader))) return loader;
    var loaderRecord = getInternalSlot(loader, "LoaderRecord");
    var name = ToString(name);
    if (isAbrupt(name = ifAbrupt(name))) return name;
    if (Type(module) !== OBJECT) return withError("Type", "module is not an object");
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
    Assert(Type(name) === STRING, "Loader.prototype.normalize: name has to be a string.");
    return NormalCompletion(name);
};
var LoaderPrototype_locate = function (thisArg, argList) {
    var loadRequest = argList[0];
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

// 31.1.
function newModule (obj) {
    if (Type(obj) !== OBJECT) return withError("Type", "newModule: obj is not an object");
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

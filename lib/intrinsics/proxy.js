// ===========================================================================================================
// Proxy
// ===========================================================================================================

function ProxyCreate(target, handler) {
    var proxy = ProxyExoticObject();
    setInternalSlot(proxy, SLOTS.PROTOTYPE, ProxyPrototype);
    setInternalSlot(proxy, "ProxyTarget", target);
    setInternalSlot(proxy, "ProxyHandler", handler);
    if (!IsConstructor(target)) setInternalSlot(proxy, SLOTS.CONSTRUCT, undefined);
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
    return newTypeError( "The Proxy Constructor is supposed to throw when called without new.");
};

var ProxyConstructor_Construct = function (argList) {
    var target = argList[0];
    var handler = argList[1];
    return ProxyCreate(target, handler);
};

LazyDefineBuiltinFunction(ProxyConstructor, "revocable", 2, ProxyConstructor_revocable);
setInternalSlot(ProxyConstructor, SLOTS.CALL, ProxyConstructor_Call);
setInternalSlot(ProxyConstructor, SLOTS.CONSTRUCT, ProxyConstructor_Construct);

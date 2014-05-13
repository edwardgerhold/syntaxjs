function isProxy(o) {
    return o instanceof ProxyExoticObject;
}

function ProxyCreate(target, handler) {
    var proxy = ProxyExoticObject();
    setInternalSlot(proxy, SLOTS.PROTOTYPE, ProxyPrototype);
    setInternalSlot(proxy, SLOTS.PROXYTARGET, target);
    setInternalSlot(proxy, SLOTS.PROXYHANDLER, handler);
    if (!IsConstructor(target)) setInternalSlot(proxy, SLOTS.CONSTRUCT, undefined);
    return proxy;
}

MakeConstructor(ProxyConstructor, true, ProxyPrototype);

var ProxyConstructor_revocable = function revocable(thisArg, argList) {
    var target = argList[0];
    var handler = argList[1];

    var revoker = CreateBuiltinFunction(realm, function revoke(thisArg, argList) {
        var p = getInternalSlot(revoker, SLOTS.REVOKABLEPROXY);
        if (p === null) return NormalCompletion(undefined);
        setInternalSlot(revoker, SLOTS.REVOKABLEPROXY, null);
        Assert(isProxy(p), "revoke: object is not a proxy");
        setInternalSlot(p, SLOTS.PROXYTARGET, null);
        setInternalSlot(p, SLOTS.PROXYHANDLER, null);
        return NormalCompletion(undefined);
    });

    var proxy = ProxyCreate(target, handler);
    setInternalSlot(revoker, SLOTS.REVOKABLEPROXY, proxy);
    var result = ObjectCreate();
    CreateDataProperty(result, "proxy", proxy);
    CreateDataProperty(result, "revoke", revoker);
    return NormalCompletion(result);
};

var ProxyConstructor_Call = function (thisArg, argList) {
    return newTypeError(format("PROXY_CALL_ERROR"));
};

var ProxyConstructor_Construct = function (argList) {
    var target = argList[0];
    var handler = argList[1];
    return ProxyCreate(target, handler);
};

LazyDefineBuiltinFunction(ProxyConstructor, "revocable", 2, ProxyConstructor_revocable);
setInternalSlot(ProxyConstructor, SLOTS.CALL, ProxyConstructor_Call);
setInternalSlot(ProxyConstructor, SLOTS.CONSTRUCT, ProxyConstructor_Construct);

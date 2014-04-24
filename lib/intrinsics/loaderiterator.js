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
exports.CreateLoaderIterator = CreateLoaderIterator;
// 31.1.
var LoaderIteratorPrototype_next = function next(thisArg, argList) {
    var iterator = thisArg;
    var m = getInternalSlot(iterator, "Loader");
    var loaderRecord = getInternalSlot(m, "LoaderRecord");
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


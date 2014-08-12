function CreateLoaderIterator(loader, kind) {
    var loaderIterator = ObjectCreate(LoaderIteratorPrototype, [
        SLOTS.LOADER,
        SLOTS.LOADERNEXTINDEX,
        SLOTS.LOADERITERATIONKIND
    ]);
    setInternalSlot(loaderIterator, SLOTS.LOADER, loader);
    setInternalSlot(loaderIterator, SLOTS.LOADERNEXTINDEX, 0);
    setInternalSlot(loaderIterator, SLOTS.LOADERITERATIONKIND, kind);
    return loaderIterator;
}
exports.CreateLoaderIterator = CreateLoaderIterator;
var LoaderIteratorPrototype_next = function next(thisArg, argList) {
    var iterator = thisArg;
    var m = getInternalSlot(iterator, SLOTS.LOADER);
    var loaderRecord = getInternalSlot(m, SLOTS.LOADERRECORD);
    var index = getInternalSlot(iterator, SLOTS.LOADERNEXTINDEX);
    var itemKind = getInternalSlot(iterator, SLOTS.LOADERITERATIONKIND);
    if (m === undefined) return CreateItrResultObject(undefined, true);
    var result;
    var entries = loaderRecord.Modules;
    while (index < entries.length) {
        var e = entries[index];
        index = index + 1;
        setInternalSlot(iterator, SLOTS.LOADERNEXTINDEX, index);
        if (e.Key !== empty) {
            if (itemKind === "key") result = e.Key;
            else if (itemKind === "value") result = e.Value;
            else {
                Assert(itemKind === "key+value", "itemKind has to be key+value here");
                result = ArrayCreate(2);
                CreateDataProperty(result, "0", e.Key);
                CreateDataProperty(result, "1", e.Value);
            }
            return CreateItrResultObject(result, false);
        }
    }
    setInternalSlot(iterator, SLOTS.LOADER, undefined);
    return CreateItrResultObject(undefined, true);
};
var LoaderIteratorPrototype_$$iterator = function $$iterator(thisArg, argList) {
    return thisArg;
};
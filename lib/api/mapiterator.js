function CreateMapIterator(map, kind) {
    var M = ToObject(map);
    if (isAbrupt(M = ifAbrupt(M))) return M;
    if (!hasInternalSlot(M, SLOTS.MAPDATA)) return newTypeError( "object has no internal MapData slot");
    var entries = getInternalSlot(M, SLOTS.MAPDATA);
    var MapIteratorPrototype = Get(getIntrinsics(), INTRINSICS.MAPITERATORPROTOTYPE);
    var iterator = ObjectCreate(MapIteratorPrototype, [
        SLOTS.MAP,
        SLOTS.MAPNEXTINDEX,
        SLOTS.MAPITERATIONKIND
    ]);
    setInternalSlot(iterator, SLOTS.MAP, entries);
    setInternalSlot(iterator, SLOTS.MAPNEXTINDEX, 0);
    setInternalSlot(iterator, SLOTS.MAPITERATIONKIND, kind);
    return iterator;
}
var MapIteratorPrototype_$$iterator = function $$iterator(thisArg, argList) {
    return thisArg;
};
var MapIteratorPrototype_next = function next(thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "the this value is not an object");
    if (!hasInternalSlot(O, SLOTS.MAP) || !hasInternalSlot(O, SLOTS.MAPNEXTINDEX) ||
        !hasInternalSlot(O, SLOTS.MAPITERATIONKIND)) {
        return newTypeError( "iterator has not all of the required internal properties");
    }
    var entries = getInternalSlot(O, SLOTS.MAP);
    var kind = getInternalSlot(O, SLOTS.MAPITERATIONKIND    );
    var index = getInternalSlot(O, SLOTS.MAPNEXTINDEX);
    var result;
    var internalKeys = Object.keys(entries); // deviate from spec
    var len = internalKeys.length;
    while (index < len) {
        var e = entries[internalKeys[index]];
        index = index + 1;
        setInternalSlot(O, SLOTS.MAPNEXTINDEX, index);
        if (e.key !== empty) {
            if (kind === "key") result = e.key;
            else if (kind === "value") result = e.value;
            else {
                Assert(kind === "key+value", "map iteration kind has to be key+value");
                var result = ArrayCreate(2);
                CreateDataProperty(result, "0", e.key);
                CreateDataProperty(result, "1", e.value);
            }
            return CreateItrResultObject(result, false);
        }
    }
    return CreateItrResultObject(undefined, true);
};
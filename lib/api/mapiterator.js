/**
 * Created by root on 15.05.14.
 */

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


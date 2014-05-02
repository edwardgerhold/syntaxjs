/**
 * Created by root on 31.03.14.
 */
function CreateArrayFromList(list) {
    var array = ArrayCreate(list.length);
    for (var i = 0, j = list.length; i < j; i++) {
        array.Set(ToString(i), list[i], array);
    }
    return array;
}
function CreateListFromArrayLike(arrayLike) {
    var list = [];
    for (var i = 0, j = arrayLike.length; i < j; i++) {
        list.push(arrayLike.Get(ToString(i), arrayLike))
    }
    return list;
}
function CreateArrayIterator(array, kind) {
    var O = ToObject(array);
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var proto = getIntrinsic("%ArrayIteratorPrototype%");
    var iterator = ObjectCreate(proto);
    setInternalSlot(iterator, SLOTS.ITERATEDOBJECT, O);
    setInternalSlot(iterator, SLOTS.ARRAYITERATIONNEXTINDEX, 0);
    setInternalSlot(iterator, SLOTS.ARRAYITERATIONKIND, kind);
    return iterator;
}
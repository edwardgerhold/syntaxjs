/**
 * Created by root on 15.05.14.
 */
/**
 *
 * @param set
 * @param kind
 * @returns {*}
 * @constructor
 */
function CreateSetIterator(set, kind) {
    var S = ToObject(set);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    if (!hasInternalSlot(S, SLOTS.SETDATA)) return newTypeError( "object has no internal SetData slot");
    var origEntries = getInternalSlot(S, SLOTS.SETDATA);
    var SetIteratorPrototype = getIntrinsic(INTRINSICS.SETITERATORPROTOTYPE);
    var iterator = ObjectCreate(SetIteratorPrototype,
        [
            SLOTS.ITERATEDSET,
            SLOTS.SETNEXTINDEX,
            SLOTS.SETITERATIONKIND
        ]
    );
    /* price of creating my es5 iterator is a pre-run of O(n) to
     translate the set into some array (currently)
     */
    var entries = [];
    for (var keys in origEntries) entries.push(origEntries[keys]);
    /*

     */
    setInternalSlot(iterator, SLOTS.ITERATEDSET, entries);
    setInternalSlot(iterator, SLOTS.SETNEXTINDEX, 0);
    setInternalSlot(iterator, SLOTS.SETITERATIONKIND, kind);
    return iterator;
}


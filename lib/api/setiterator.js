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



var SetIteratorPrototype_next = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "the this value is not an object");
    if (!hasInternalSlot(O, SLOTS.ITERATEDSET) || !hasInternalSlot(O, SLOTS.SETNEXTINDEX) || !hasInternalSlot(O, SLOTS.SETITERATIONKIND)) return newTypeError( "iterator has not all of the required internal properties");
    var entries = getInternalSlot(O, SLOTS.ITERATEDSET);
    var kind = getInternalSlot(O, SLOTS.SETITERATIONKIND);
    var index = getInternalSlot(O, SLOTS.SETNEXTINDEX);
    var result;
    var len = entries.length;
    while (index < len) {
        var e = entries[index];
        index = index + 1;
        setInternalSlot(O, SLOTS.SETNEXTINDEX, index);
        if (e !== empty) {
            if (kind === "key+value") {
                Assert(kind === "key+value", "set iteration kind has to be key+value");
                var result = ArrayCreate(2);
                CreateDataProperty(result, "0", e);
                CreateDataProperty(result, "1", e);
                return CreateItrResultObject(result, false);
            }
            return CreateItrResultObject(e, false);
        }
    }
    return CreateItrResultObject(undefined, true);
};

var SetIteratorPrototype_$$iterator = function $$iterator(thisArg, argList) {
    return thisArg;
};

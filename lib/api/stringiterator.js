
var StringIteratorPrototype_$$iterator = function (thisArg, argList) {
    return thisArg;
};

var StringIteratorPrototype_next = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT)
        return newTypeError( "the this value is not an object");
    if (!hasInternalSlot(O, SLOTS.ITERATEDSTRING) || !hasInternalSlot(O, SLOTS.ITERATORNEXTINDEX) || !hasInternalSlot(O, SLOTS.ITERATIONKIND))
        return newTypeError( "iterator has not all of the required internal properties");
    var string = getInternalSlot(O, SLOTS.ITERATEDSTRING);
    var kind = getInternalSlot(O, SLOTS.ITERATIONKIND);
    var index = getInternalSlot(O, SLOTS.ITERATORNEXTINDEX);
    var result;
    string = ToString(string);
    var len = string.length;
    if (index < len) {
        var ch = string[index];
        setInternalSlot(O, SLOTS.ITERATORNEXTINDEX, index + 1);
        if (kind === "key") result = index;
        else if (kind === "value") result = ch;
        else {
            Assert(kind === "key+value", "string iteration kind has to be key+value");
            var result = ArrayCreate(2);
            CreateDataProperty(result, "0", index);
            CreateDataProperty(result, "1", ch);
        }
        return CreateItrResultObject(result, false);
    }
    return CreateItrResultObject(undefined, true);
};

function CreateStringIterator(string, kind) {
    var iterator = ObjectCreate(getIntrinsic(INTRINSICS.STRINGITERATORPROTOTYPE), [
        SLOTS.ITERATEDSTRING,
        SLOTS.ITERATORNEXTINDEX,
        SLOTS.ITERATIONKIND
    ]);
    // for-of before worked without. there must be a mistake somewhere (found in ToPrimitive)
    // if (string instanceof StringExoticObject) string = getInternalSlot(string, SLOTS.STRINGDATA);
    // ---
    setInternalSlot(iterator, SLOTS.ITERATEDSTRING, string);
    setInternalSlot(iterator, SLOTS.ITERATORNEXTINDEX, 0);
    setInternalSlot(iterator, SLOTS.ITERATIONKIND, kind);
    return iterator;
}
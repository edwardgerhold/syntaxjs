function GetIterable(obj) {
    if (Type(obj) !== OBJECT) return undefined;
    var iteratorGetter = Get(obj, $$iterator);
    if (isAbrupt(iteratorGetter = ifAbrupt(iteratorGetter))) return iteratorGetter;
    return iteratorGetter;
}
function IsIterable(obj) {
    return HasProperty(obj, $$iterator);
}
function CreateItrResultObject(value, done) {
    Assert(Type(done) === BOOLEAN, "the second argument to CreateItrResultObject has to be a boolean value");
    var R = ObjectCreate();
    CreateDataProperty(R, "value", value);
    CreateDataProperty(R, "done", done);
    return R;
}
function GetIterator(obj) {
    var iterator = Invoke(obj, $$iterator, []);
    if (isAbrupt(iterator = ifAbrupt(iterator))) return iterator;
    if (Type(iterator) !== OBJECT) return newTypeError("iterator is not an object");
    return iterator;
}
function IteratorNext(itr, val) {
    var result;
    if (arguments.length === 1) result = Invoke(itr, "next", []);
    else result = Invoke(itr, "next", [val]);
    if (isAbrupt(result = ifAbrupt(result))) return result;
    if (Type(result) !== OBJECT) return newTypeError("IteratorNext: result is not an object");
    return result;
}
function IteratorComplete(itrResult) {
    Assert(Type(itrResult) === OBJECT);
    var done = Get(itrResult, "done");
    return ToBoolean(done);
}
function IteratorValue(itrResult) {
    Assert(Type(itrResult) === OBJECT);
    return Get(itrResult, "value");
}
function CreateEmptyIterator() {
    var emptyNextMethod = OrdinaryFunction();
    setInternalSlot(emptyNextMethod, SLOTS.CALL, function (thisArg, argList) {
        return CreateItrResultObject(undefined, true);
    });
    var obj = ObjectCreate();
    CreateDataProperty(obj, "next", emptyNextMethod);
    return obj;
}
function IteratorStep(iterator, value) {
    var result = IteratorNext(iterator, value);
    if (isAbrupt(result = ifAbrupt(result))) return result;
    var done = Get(result, "done");
    if (isAbrupt(done = ifAbrupt(done))) return done;
    if (done === true) return false;
    return result;
}
function MakeListIterator(list) {
    var nextPos = 0;
    var len = list.length;
    var obj = ObjectCreate();

    var listIteratorNext = CreateBuiltinFunction(getRealm(), function (thisArg, argList) {
        var list = getInternalSlot(obj, "IteratedList");
        var value, done;
        if (nextPos < len) {
            value = list[nextPos];
            nextPos = nextPos + 1;
            // leaving line for correction: hint: use CreateListIterator from spec :) and fix then if it´s wrong
            //done = (nextPos === len);
            return CreateItrResultObject(value, false);
        }
        return CreateItrResultObject(undefined, true);
    });
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    setInternalSlot(obj, "IteratedList", list);
    CreateDataProperty(obj, "next", listIteratorNext);
    return obj;
}
var ListIterator_next = function (thisArg, argList) {
    var O = thisArg;
    if (!hasInternalSlot(O, "IteratedList") || !hasInternalSlot(O, "IteratedListIndex")) {
        return newTypeError("this value is missing the [[IteratedList]] properties");
    }
    var list = getInternalSlot(O, "IteratedList");
    var index = getInternalSlot(O, "IteratedListIndex");
    var len = list.length;
    if (index >= len) {
        return CreateItrResultObject(undefined, true);
    }
    var result = CreateItrResultObject(list[index], false);
    if (isAbrupt(result = ifAbrupt(result)))
        setInternalSlot(O, "IteratedListIndex", index + 1);
    return NormalCompletion(result);
};
function CreateListIterator(list) {
    var iterator = ObjectCreate(getIntrinsic(INTRINSICS.OBJECTPROTOTYPE), { IteratedList: undefined, ListIteratorNextIndex: undefined });
    setInternalSlot(iterator, "IteratedList", list);
    setInternalSlot(iterator, "IteratedListIndex", 0);
    NowDefineProperty(iterator, "next", ListIterator_next);
    return iterator;
}

function CreateCompoundIterator(iterator1, iterator2) {
    var iterator = ObjectCreate(getIntrinsic(INTRINSICS.OBJECTPROTOTYPE), [SLOTS.ITERATOR1, SLOTS.ITERATOR2, SLOTS.STATE]);
    setInternalSlot(iterator, SLOTS.ITERATOR1, iterator1);
    setInternalSlot(iterator, SLOTS.ITERATOR2, iterator2);
    setInternalSlot(iterator, SLOTS.STATE, 1);
    CreateDataProperty(iterator, "next", CompoundIterator_next)
}

var CompoundIterator_next = function (thisArg, argList) {
    var O = thisArg;
    if (!hasInternalSlot(O, SLOTS.ITERATOR)) return newTypeError(format("HAS_NO_SLOT_S", "[[Iterator]]"));
    var state = getInternalSlot(O, SLOTS.STATE);
    if (state === 1) {
        var iterator1 = getInternalSlot(O, SLOTS.ITERATOR1);
        var result1 = IteratorStep(iterator1);
        if (isAbrupt(result1 = ifAbrupt(result1))) return result1;
        if (result1 != false) return result1;
        setInternalSlot(O, SLOTS.STATE, 2);
    }
    var iterator2 = getInternalSlot(O, SLOTS.ITERATOR2);
    return IteratorNext(iterator2);
};

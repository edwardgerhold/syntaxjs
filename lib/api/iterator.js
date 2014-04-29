function GetIterable (obj) {
    if (Type(obj) !== OBJECT) return undefined;
    var iteratorGetter = Get(obj, $$iterator);
    if (isAbrupt(iteratorGetter=ifAbrupt(iteratorGetter))) return iteratorGetter;
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
    if (Type(iterator) !== OBJECT) return withError("Type", "iterator is not an object");
    return iterator;
}

function IteratorNext(itr, val) {
    var result;
    if (arguments.length === 1) result = Invoke(itr, "next", []);
    else result = Invoke(itr, "next", [val]);
    if (isAbrupt(result = ifAbrupt(result))) return result;
    if (Type(result) !== OBJECT) return withError("Type", "IteratorNext: result is not an object");
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
    setInternalSlot(emptyNextMethod, "Call", function (thisArg, argList) {
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

    var listIteratorNext = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
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

var ListIterator_next = function(thisArg, argList) {
    var O = thisArg;
    if (!hasInternalSlot(O, "IteratedList") || !hasInternalSlot(O, "IteratedListIndex")) {
        return withError("Type", "this value is missing the [[IteratedList]] properties");
    }
    var list = getInternalSlot(O, "IteratedList");
    var index = getInternalSlot(O, "IteratedListIndex");
    var len = list.length;
    if (index >= len) {
        return CreateItrResultObject(undefined, true);
    }
    var result = CreateItrResultObject(list[index], false);
    if (isAbrupt(result=ifAbrupt(result)))
    setInternalSlot(O, "IteratedListIndex", index + 1);
    return NormalCompletion(result);
};

function CreateListIterator(list) {
    var iterator = ObjectCreate(getIntrinsic("%ObjectPrototype%"), { IteratedList: undefined, ListIteratorNextIndex: undefined });
    setInternalSlot(iterator, "IteratedList", list);
    setInternalSlot(iterator, "IteratedListIndex", 0);
    LazyDefineProperty(iterator, "next", ListIterator_next);
    return iterator;
}

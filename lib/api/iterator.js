// ===========================================================================================================
// Iterator Algorithms
// ===========================================================================================================


function IsIterable (obj) {
    if (Type(obj) !== OBJECT) return undefined;
    var iteratorGetter = Get(obj, $$iterator);
    return iteratorGetter;
//    return HasProperty(obj, $$iterator);
}

function CreateItrResultObject(value, done) {
    Assert(Type(done) === BOOLEAN);
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

function CreateListIterator(list) {
    return MakeListIterator(list);
}

function MakeListIterator(list) {
    var nextPos = 0;
    var len = list.length;

    var listIteratorNext = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
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

    var obj = ObjectCreate();
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    CreateDataProperty(obj, "next", listIteratorNext);
    return obj;
}



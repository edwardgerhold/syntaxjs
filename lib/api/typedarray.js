/**
 * Created by root on 07.05.14.
 */

function TypedArrayFrom(constructor, target, items, mapfn, thisArg) {
    "use strict";
    var C = constructor;
    Assert(IsConstructor(C), format("S_IS_NO_CONSTRUCTOR", "C"));
    var newObj;

    //
    // Assertions
    // then,
    var mapping;
    if (mapfn === undefined) mapping = false;
    else {
        if (!IsCallable(mapfn)) return newTypeError(format("S_IS_NOT_CALLABLE", "mapfn"));

    }
    return newObj;
}
/**
 * Created by root on 31.03.14.
 */


function SameValue(x, y) {
    if (isAbrupt(x = ifAbrupt(x))) return x;
    if (isAbrupt(y = ifAbrupt(y))) return y;
    if (Type(x) !== Type(y)) return false;
    if (Type(x) === NULL) return true;
    if (Type(x) === UNDEFINED) return true;
    if (Type(x) === NUMBER) {
        if (x === y) return true;
        if (x === "NaN" && y === "NaN") return true;
        if (x === +0 && y === -0) return false;
        if (x === -0 && y === +0) return false;
        return false;
    }
    if (Type(x) === STRING) {
        return (x.length === y.length) && x === y;

    }
    if (Type(x) === BOOLEAN) {
        return (x && y) || (!x && !y);

    }

    if (Type(x) === "symbol") {
        return x === y;
    }

    return x === y;

}

function SameValueZero(x, y) {
    if (isAbrupt(x = ifAbrupt(x))) return x;
    if (isAbrupt(y = ifAbrupt(y))) return y;
    if (Type(x) !== Type(y)) return false;

    if (IsTypeObject(x)) {
          // IsTypeObject(y)
         return SameValue(getInternalSlot(x, "TypeDescriptor"), getInternalSlot(y, "TypeDescriptor"))
             && SameValue(getInternalSlot(x, "ViewedArrayBuffer"), getInternalSlot(y, "ViewedArrayBuffer"))
             && SameValue(getInternalSlot(x, "ByteOffset"), getInternalSlot(y, "ByteOffset"))
             && SameValue(getInternalSlot(x, "Opacity"), getInternalSlot(y, "Opacity"));

    }

    if (Type(x) === NULL) return true;
    if (Type(x) === UNDEFINED) return true;
    if (Type(x) === NUMBER) {
        if (x === y) return true;
        if (x === "NaN" && y === "NaN") return true;
        if (x === +0 && y === -0) return true;
        return x === -0 && y === +0;

    }
    if (Type(x) === STRING) {
        return (x.length === y.length) && x === y;

    }
    if (Type(x) === BOOLEAN) {
        return (x && y) || (!x && !y);

    }

    if (Type(x) === "symbol") {
        return x === y;
    }

    return x === y;

}


/*

    the following three functions are not used,
    because of a native strict equal and abstract equal
    but will be completed somewhen

 */

function StrictEqualityComparison(x, y) {
    var tx = Type(x);
    var ty = Type(y);

    if (tx !== ty) return false;

    if (tx === "undefined" && ty === "null") return false;
    if (ty === "undefined" && tx === "null") return false;

}

function AbstractEqualityComparison(x, y) {
    var tx = Type(x);
    var ty = Type(y);

    if (tx === ty) return StrictEqualityComparison(x, y);

    if (tx === "undefined" && ty === "null") return true;
    if (ty === "undefined" && tx === "null") return true;

}

function AbstractRelationalComparison(leftFirst) {
    var tx = Type(x);
    var ty = Type(y);

}

exports.StrictEqualityComparison = StrictEqualityComparison;
exports.AbstractEqualityComparison = AbstractEqualityComparison;
exports.AbstractRelationalComparison = AbstractRelationalComparison;

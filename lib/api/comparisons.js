/**
 * Created by root on 31.03.14.
 */


function SameValue(x, y) {
    if (isAbrupt(x = ifAbrupt(x))) return x;
    if (isAbrupt(y = ifAbrupt(y))) return y;
    if (Type(x) !== Type(y)) return false;
    if (Type(x) === "null") return true;
    if (Type(x) === "undefined") return true;
    if (Type(x) === "number") {
        if (x === y) return true;
        if (x === "NaN" && y === "NaN") return true;
        if (x === +0 && y === -0) return false;
        if (x === -0 && y === +0) return false;
        return false;
    }
    if (Type(x) === "string") {
        if ((x.length === y.length) && x === y) return true;
        return false;
    }
    if (Type(x) === "boolean") {
        if ((x && y) || (!x && !y)) return true;
        return false;
    }

    if (Type(x) === "symbol") {
        return x === y;
    }

    if (x === y) return true;
    return false;
}

function SameValueZero(x, y) {
    if (isAbrupt(x = ifAbrupt(x))) return x;
    if (isAbrupt(y = ifAbrupt(y))) return y;
    if (Type(x) !== Type(y)) return false;

    if (IsTypeObject(x)) {
          // IsTypeObject(y)
         if (SameValue(getInternalSlot(x, "TypeDescriptor"), getInternalSlot(y, "TypeDescriptor"))
         && SameValue(getInternalSlot(x, "ViewedArrayBuffer"), getInternalSlot(y, "ViewedArrayBuffer"))
         && SameValue(getInternalSlot(x, "ByteOffset"), getInternalSlot(y, "ByteOffset"))
         && SameValue(getInternalSlot(x, "Opacity"), getInternalSlot(y, "Opacity"))) {
             return true;
         }
        return false;
    }

    if (Type(x) === "null") return true;
    if (Type(x) === "undefined") return true;
    if (Type(x) === "number") {
        if (x === y) return true;
        if (x === "NaN" && y === "NaN") return true;
        if (x === +0 && y === -0) return true;
        if (x === -0 && y === +0) return true;
        return false;
    }
    if (Type(x) === "string") {
        if ((x.length === y.length) && x === y) return true;
        return false;
    }
    if (Type(x) === "boolean") {
        if ((x && y) || (!x && !y)) return true;
        return false;
    }

    if (Type(x) === "symbol") {
        return x === y;
    }

    if (x === y) return true;
    return false;
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

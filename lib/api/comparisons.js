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



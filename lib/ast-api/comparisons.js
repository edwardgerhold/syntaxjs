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

    if (Type(x) === SYMBOL) {
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
        return SameValue(getInternalSlot(x, SLOTS.TYPEDESCRIPTOR), getInternalSlot(y, SLOTS.TYPEDESCRIPTOR))
            && SameValue(getInternalSlot(x, SLOTS.VIEWEDARRAYBUFFER), getInternalSlot(y, SLOTS.VIEWEDARRAYBUFFER))
            && SameValue(getInternalSlot(x, SLOTS.BYTEOFFSET), getInternalSlot(y, SLOTS.BYTEOFFSET))
            && SameValue(getInternalSlot(x, SLOTS.OPACITY), getInternalSlot(y, SLOTS.OPACITY));

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

    if (Type(x) === SYMBOL) {
        return x === y;
    }

    return x === y;

}
function StrictEqualityComparison(x, y) {
    var tx = Type(x);
    var ty = Type(y);

    if (tx !== ty) return false;

    if (tx === UNDEFINED && ty === NULL) return false;
    if (ty === UNDEFINED && tx === NULL) return false;

}
function AbstractEqualityComparison(x, y) {
    var tx = Type(x);
    var ty = Type(y);

    if (tx === ty) return StrictEqualityComparison(x, y);

    if (tx === UNDEFINED && ty === NULL) return true;
    if (ty === UNDEFINED && tx === NULL) return true;

}
function AbstractRelationalComparison(x, y, leftFirst) {
    var tx = Type(x);
    var ty = Type(y);

}
exports.StrictEqualityComparison = StrictEqualityComparison;
exports.AbstractEqualityComparison = AbstractEqualityComparison;
exports.AbstractRelationalComparison = AbstractRelationalComparison;

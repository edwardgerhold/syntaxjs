
// ===========================================================================================================
// Number
// ===========================================================================================================

MakeConstructor(NumberConstructor, true, NumberPrototype);

var MIN_INTEGER = Number.MIN_INTEGER;
var MAX_INTEGER = Number.MAX_INTEGER;
var EPSILON = Number.EPSILON;
var MIN_VALUE = Number.MIN_VALUE;
var MAX_VALUE = Number.MAX_VALUE;
var NAN = NaN;
var POSITIVE_INFINITY = Infinity;
var NEGATIVE_INFINITY = -Infinity;

setInternalSlot(NumberConstructor, SLOTS.CALL, function (thisArg, argList) {
    var value = argList[0];
    var O = thisArg;
    var n;
    if (argList.length === 0) n = +0;
    else n = ToNumber(value);
    if (isAbrupt(n = ifAbrupt(n))) return n;
    if (Type(O) === OBJECT && hasInternalSlot(O, SLOTS.NUMBERDATA) && getInternalSlot(O, SLOTS.NUMBERDATA) === undefined) {
        setInternalSlot(O, SLOTS.NUMBERDATA, n);
        return O;
    }
    return n;
});

setInternalSlot(NumberConstructor, SLOTS.CONSTRUCT, function (argList) {
    var F = NumberConstructor;
    return OrdinaryConstruct(F, argList);
});

var NumberConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var obj = OrdinaryCreateFromConstructor(F, INTRINSICS.NUMBERPROTOTYPE, [ SLOTS.NUMBERDATA ]);
    return obj;
};
var NumberConstructor_isFinite = function (thisArg, argList) {
    var number = argList[0];
    if (Type(number) !== NUMBER) return NormalCompletion(false);
    if ((number != number) || number === Infinity || number === -Infinity) return NormalCompletion(false);
    return NormalCompletion(true);
};
var NumberConstructor_isNaN = function (thisArg, argList) {
    var number = argList[0];
    if (Type(number) !== NUMBER) return NormalCompletion(false);
    if (number != number) return NormalCompletion(true);
    return NormalCompletion(false);
};

var NumberConstructor_isInteger = function (thisArg, argList) {
    var number = argList[0];
    if (Type(number) !== NUMBER) return NormalCompletion(false);
    if ((number != number) ||
        number === +Infinity || number === -Infinity) return NormalCompletion(false);
    return NormalCompletion(true);
};

var NumberPrototype_clz = function (thisArg, argList) {
    var x = thisNumberValue(thisArg);
    if (isAbrupt(x = ifAbrupt(x))) return x;
    var n = ToUint32(x);
    if (isAbrupt(n = ifAbrupt(n))) return n;
    if (n < 0) return 0;
    if (n === 0) return 32;
    var bitlen = Math.floor(Math.log(Math.pow(n, Math.LOG2E))) + 1;
    var p = 32 - bitlen;
    return NormalCompletion(p);
};
var NumberPrototype_toString = function (thisArg, argList) {
    var radix = argList[0];
    var radixNumber;
    var x = thisNumberValue(thisArg);
    var s = "";
    if (radix === undefined) radixNumber = 10;
    else radixNumber = ToInteger(radix);
    if (isAbrupt(radixNumber=ifAbrupt(radixNumber))) return radixNumber;
    if (radixNumber < 2 || radixNumber > 36) return newRangeError( "radixNumber has to be between 2 and 36");
    if (radixNumber === 10) return ToString(x);
    else s = ToString(x);

    /*
    var parts = s.split(".");
    var i = 0;
    var result = "";
    while ((i < 2) && (s = parts[i])) {    
	s = parts[i];
	if (i == 1) result += ".";
        var d = Math.floor((+s) / radixNumber);
	var r = (+s) % radixNumber;
        s = ""+d;
        if (r > 10) s += String.fromCharCode(("a").charCodeAt(0) + r - 10);
	else if (r > 0) s += r;
        result += s;
	i += 1;
    }
    */
    var result = x.toString(radixNumber);
    
    return NormalCompletion(result);
};
var NumberPrototype_valueOf = function (thisArg, argList) {
    var x = thisNumberValue(thisArg);
    return NormalCompletion(x);
};
var NumberPrototype_toPrecision = function (thisArg, argList) {
    var precision = argList[0];
    var x = thisNumberValue(thisArg);
    if (isAbrupt(x = ifAbrupt(x))) return x;
    if (precision === undefined) return ToString(x);
    var p = ToInteger(precision);
    if (isAbrupt(p = ifAbrupt(p))) return p;
    if (x !== x) return "NaN";
    var s = "";
    if (x < 0) {
        s = "-";
        x = -x;
    }
    if (x === +Infinity || x === -Infinity) {
        return NormalCompletion(s + "Infinity");
    }

};

function repeatString (str, times) {
    var concat = "";
    for (var i = 0; i < times; i++) {
        concat += str;
    }
    return concat;
}

var NumberPrototype_toFixed = function (thisArg, argList) {
    var fractionDigits = argList[0];
    var x = thisNumberValue(thisArg);
    if (isAbrupt(x = ifAbrupt(x))) return x;
    if (fractionDigits === undefined) return ToString(x);
    var f = ToInteger(fractionDigits);
    if (isAbrupt(f = ifAbrupt(f))) return f;
    if ((f < 0) || (f > 20)) return newRangeError( "fractionDigits is less or more than 20");
    if (x !== x) return "NaN";
    var s = "";
    if (x < 0) {
        s = "-";
        x = -x;
    }
    if (x >= 1021) {
        var m = ToString(x);
    } else {
        var n;
        if (n === 0) m = "0";
        else m = ""+n;
        if (f != 0) {
            var k = Math.ceil(Math.log(Math.pow(n, Math.LOG2E))); // = number of elements in n
            if (k <= f)  {
                var z = repeatString(0x0030, f+1-k);
                m = z + m;
                k = f + 1;
            }
            var a = m.substr(0, k-f);
            var b = m.substr(k-f);
            m = a + "." + b;
        }
    }
    return NormalCompletion(s + m);
};
var NumberPrototype_toExponential = function (thisArg, argList) {
    var fractionDigits = argList[0];
    var x = thisNumberValue(thisArg);
    if (isAbrupt(x = ifAbrupt(x))) return x;
    var f = ToInteger(fractionDigits);
    if (isAbrupt(f = ifAbrupt(f))) return f;
    if (x !== x) return "NaN";
    var s = "";
    if (x < 0) {
        s = "-";
        x = -x;
    }
    var n;
    if (x === Infinity || s === -Infinity) {
        return s + "Infinity";
    }
    if (fractionDigits !== undefined && ((f < 0) || (f > 20))) return newRangeError( "toExponential: fractionDigits < 0 or > 20");
    if (x === 0) {
        if (fractionDigits === undefined) f = 0;
        var m = stringRepeat(0x0030, f+1);
        var e = 0;
    } else {
        if (fractionDigits !== undefined) {

            // ich konnte das im mcview nicht lesen ob 10f oder 10^f
            // ich hab das unterwegs geschrieben, todo
            e;
            n;
        } else {
            e;
            n;
        }
        m = ""+n;
    }
    if (f != 0) {
        var a = m.substr(m, 1);
        var b = m.substr(1);
    }
    if (e === 0) {
        var c = "+";
        var d = "0";
    } else {
        if (e > 0) c = "+";
        else if (e <= 0) {
            c = "-";
            e = -e;
        }
        d = ""+e;
        m = m + "e" + c + d;
    }
    return NormalCompletion(s + m)
};

LazyDefineBuiltinFunction(NumberConstructor, "isFinite", 0, NumberConstructor_isFinite);
LazyDefineBuiltinFunction(NumberConstructor, "isNaN", 0, NumberConstructor_isNaN);
LazyDefineBuiltinFunction(NumberConstructor, "isInteger", 0, NumberConstructor_isInteger);
LazyDefineBuiltinFunction(NumberConstructor, $$create, 0, NumberConstructor_$$create);
LazyDefineBuiltinConstant(NumberConstructor, "EPSILON", EPSILON);
LazyDefineBuiltinConstant(NumberConstructor, "MIN_INTEGER", MIN_INTEGER);
LazyDefineBuiltinConstant(NumberConstructor, "MIN_VALUE", MIN_VALUE);
LazyDefineBuiltinConstant(NumberConstructor, "MAX_INTEGER", MAX_INTEGER);
LazyDefineBuiltinConstant(NumberConstructor, "MAX_VALUE", MAX_VALUE);
LazyDefineBuiltinConstant(NumberConstructor, "NaN", NAN);
LazyDefineBuiltinConstant(NumberConstructor, "NEGATIVE_INFINITY", NEGATIVE_INFINITY);

LazyDefineBuiltinFunction(NumberPrototype, "clz", 0, NumberPrototype_clz);
LazyDefineBuiltinFunction(NumberPrototype, "toExponential", 0, NumberPrototype_toExponential);
LazyDefineBuiltinFunction(NumberPrototype, "toFixed", 0, NumberPrototype_toFixed);
LazyDefineBuiltinFunction(NumberPrototype, "toPrecision", 0, NumberPrototype_toPrecision);
LazyDefineBuiltinFunction(NumberPrototype, "toString", 0, NumberPrototype_toString);
LazyDefineBuiltinFunction(NumberPrototype, "valueOf", 0, NumberPrototype_valueOf);

LazyDefineBuiltinConstant(NumberPrototype, $$toStringTag, "Number");


// ===========================================================================================================
// Encode, Decode Algorithms
// ===========================================================================================================

var HexDigits = require("tables").HexDigits; // CAUTION: require

var uriReserved = ";/?:@&=+$,";
var uriUnescaped = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~_.!\"*'()";

function Encode(string, unescapedSet) {
    var strLen = string.length;
    var R = "";
    var k = 0;
    var C, S, cu, V, kChar;
    while (k < strLen) {
        if (k === strLen) return NormalCompletion(R);
        C = string[k];
        if (unescapedSet.indexOf(C) > -1) {
            R += C;
        } else {
            cu = C.charCodeAt(0);
            if (!(cu < 0xDC00) && !(cu > 0xDFFF)) return newURIError("Encode: Code unit out of Range");
            else if (cu < 0xD800 || cu > 0xDBFF) {
                V = cu;
            } else {
                k = k + 1;
                if (k === strLen) return newURIError("Encode: k eq strLen");
                kChar = string.charCodeAt(k);
                if (kChar < 0xDC00 || kChar > 0xDFFF) return newURIError("kChar code unit is out of range");
                V = ((cu - 0xD800) * 0x400 + (kChar - 0xDC00) + 0x10000);
                /*
                 Achtung Oktett encodierung aus Tabelle 32 (rev 16)
                 */
            }
            var octets = UTF8Encode(V);
            var L = octets.length;
            var j = 0;
            var joctets;
            while (j < L) {
                joctets = octets[j];
                S = "%" + joctets.toString(16).toUpperCase();
                j = j + 1;
                R = R + S;
            }
        }
        k = k + 1;
    }
    return NormalCompletion(R);
}

function UTF8Encode(V) {
    return [V];
}

function Decode(string, reservedSet) {
    var strLen = string.length;
    var R = "";
    var k = 0;
    var S;
    for (;;) {
        if (k === strLen) return NormalCompletion(R);
        var C = string[k];
        if (C !== "%") {
            S = "" + C;
        } else {
            var start = k;
            if (k + 2 >= strLen) return newURIError("k+2>=strLen");
            if (!HexDigits[string[k + 1]] || !HexDigits[string[k + 2]]) return newURIError("%[k+1][k+2] are not hexadecimal letters");
            var hex = string[k + 1] + string[k + 2];
            var B = parseInt(hex, 16);
            k = k + 2;

        }
        R = R + S;
        k = k + 1;
    }
}



var EncodeURIFunction_call = function (thisArg, argList) {
    var uri = argList[0];
    var uriString = ToString(uri);
    if (isAbrupt(uriString = ifAbrupt(uriString))) return uriString;
    var unescapedUriSet = "" + uriReserved + uriUnescaped + "#";
    return Encode(uriString, unescapedUriSet);
};
var EncodeURIComponentFunction_call = function (thisArg, argList) {
    var uriComponent = argList[0];
    var uriComponentString = ToString(uriComponent);
    if (isAbrupt(uriComponentString = ifAbrupt(uriComponentString))) return uriComponentString;
    var unescapedUriComponentSet = "" + uriUnescaped;
    return Encode(uriComponentString, unescapedUriComponentSet);
};

var DecodeURIFunction_call = function (thisArg, argList) {
    var encodedUri = argList[0];
    var uriString = ToString(encodedUri);
    if (isAbrupt(uriString = ifAbrupt(uriString))) return uriString;
    var reservedUriSet = "" + uriReserved + "#";
    return Decode(uriString, reservedUriSet);
};

var DecodeURIComponentFunction_call = function (thisArg, argList) {
    var encodedUriComponent = argList[0];
    var uriComponentString = ToString(encodedUriComponent);
    if (isAbrupt(uriComponentString = ifAbrupt(uriComponentString))) return uriComponentString;
    var reservedUriComponentSet = "";
    return Decode(uriComponentString, reservedUriComponentSet);
};

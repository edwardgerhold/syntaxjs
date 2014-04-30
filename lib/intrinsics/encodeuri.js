
// ===========================================================================================================
// encodeURI, decodeURI functions
// ===========================================================================================================

setInternalSlot(EncodeURIFunction, SLOTS.CALL, function (thisArg, argList) {
    var uri = argList[0];
    var uriString = ToString(uri);
    if (isAbrupt(uriString = ifAbrupt(uriString))) return uriString;
    var unescapedUriSet = "" + uriReserved + uriUnescaped + "#";
    return Encode(uriString, unescapedUriSet);
});

setInternalSlot(EncodeURIComponentFunction, SLOTS.CALL, function (thisArg, argList) {
    var uriComponent = argList[0];
    var uriComponentString = ToString(uriComponent);
    if (isAbrupt(uriComponentString = ifAbrupt(uriComponentString))) return uriComponentString;
    var unescapedUriComponentSet = "" + uriUnescaped;
    return Encode(uriComponentString, unescapedUriComponentSet);
});

setInternalSlot(DecodeURIFunction, SLOTS.CALL, function (thisArg, argList) {
    var encodedUri = argList[0];
    var uriString = ToString(encodedUri);
    if (isAbrupt(uriString = ifAbrupt(uriString))) return uriString;
    var reservedUriSet = "" + uriReserved + "#";
    return Decode(uriString, reservedUriSet);
});

setInternalSlot(DecodeURIComponentFunction, SLOTS.CALL, function (thisArg, argList) {
    var encodedUriComponent = argList[0];
    var uriComponentString = ToString(encodedUriComponent);
    if (isAbrupt(uriComponentString = ifAbrupt(uriComponentString))) return uriComponentString;
    var reservedUriComponentSet = "";
    return Decode(uriComponentString, reservedUriComponentSet);
});

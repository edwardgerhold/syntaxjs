
    // Structured Clone Algorithms
    // strawman for es7
    // https://github.com/dslomov-chromium/ecmascript-structured-clone
function StructuredClone (input, transferList, targetRealm) {
    var memory = []; //mapping
    for (var i = 0, j = transferList.length; i< j; i++) {
        var transferable = transferList[i];
        if (!hasInternalSlot(transferable, "Transfer")) {
            return withError("Range", "DataCloneError: transferable has no [[Transfer]] slot");
        }
        var Transfer = getInternalSlot(transferable, "Transfer");
        var transferResult = callInternalSlot(SLOTS.CALL, Transfer, transferable, [targetRealm]);
        if (isAbrupt(transferResult = ifAbrupt(transferResult))) return transferResult;
        memory.push({ input: transferable, output: transferResult });
    }
    var clone = InternalStructuredClone(input, memory, targetRealm);
    if (isAbrupt(clone = ifAbrupt(clone))) return clone;
    for (var i = 0, j = transferList.length; i < j; i++) {
        var mapping = memory[i];
        transferResult = mapping.output;
        transferable = mapping.input;
        var OnSuccessTransfer = getInternalSlot(transferable, "OnSuccessTransfer");
        callInternalSlot(SLOTS.CALL, OnSuccessTransfer, transferable, [transferResult, targetRealm]);
    }
    return NormalCompletion(clone);
}

function InternalStructuredClone (input, memory, targetRealm) {
    var output;
    for (var i = 0, j = memory.length; i < j; i++) {
        if (memory[i].transferable === input) return NormalCompletion(memory[i].output);
    }
    if (getInternalSlot(input, "Transfer") === "neutered") return withError("Range", "DataCloneError: inputs [[Transfer]] is neutered.");
    var value;
    if ((value = getInternalSlot(input, "BooleanData")) !== undefined) {
        output = OrdinaryConstruct(getIntrinsic("%Boolean%", targetRealm), [value]);
    }
    else if ((value = getInternalSlot(input, "NumberData")) !== undefined) {
        output = OrdinaryConstruct(getIntrinsic("%Number%", targetRealm), [value]);
    }
    else if ((value = getInternalSlot(input, "StringData")) !== undefined) {
        output = OrdinaryConstruct(getIntrinsic("%String%", targetRealm), [value]);
    }
    else if ((value = getInternalSlot(input, "RegExpMatcher")) !== undefined) {
        output = OrdinaryConstruct(getIntrinsic("%RegExp%", targetRealm), []);
        setInternalSlot(output, "RegExpMatcher", value);
        setInternalSlot(output, "OriginalSource", getInternalSlot(input, "OriginalSource"));
        setInternalSlot(output, "OriginalFlags", getInternalSlot(input, "OriginalFlags"));
    } else if ((value = getInternalSlot(input, "ArrayBufferData")) !== undefined) {
        output = CopyArrayBufferToRealm(input, targetRealm);
        if (isAbrupt(output = ifAbrupt(output))) return output;
    } else if ((value = getInternalSlot(input, "ViewedArrayBuffer")) !== undefined) {
        var arrayBuffer = value;
        //if (OrdinaryHasInstance(getIntrinsic("%DataView%")), input) { // assumes i´m in source realm
        if (!hasInternalSlot(input, "TypedArrayConstructor")) {
            output = OrdinaryConstruct(getIntrinsicFromRealm("%DataView%", targetRealm), []);
            setInternalSlot(output, "ViewedArrayBuffer", getInternalSlot(input, "ViewedArrayBuffer"));
            setInternalSlot(output, "ByteOffset", getInternalSlot(input, "ByteOffset"));
            setInternalSlot(output, "ByteLength", getInternalSlot(input, "ByteLength"));
        } else {
            output = OrdinaryConstruct(getIntrinsicFromRealm("%"+getInternalSlot(input, "TypedArrayConstructor")+"%", targetRealm), []);
            setInternalSlot(output, "ViewedArrayBuffer", getInternalSlot(input, "ViewedArrayBuffer"));
            setInternalSlot(output, "ByteOffset", getInternalSlot(input, "ByteOffset"));
            setInternalSlot(output, "ByteLength", getInternalSlot(input, "ByteLength"));
        }
    } else if (hasInternalSlot(input, "MapData")) {
        // hmmm missing
        // structured clone of values or what is the problem?
    } else if (hasInternalSlot(input, "SetData")) {
        // hmm missing
        // this can be quite hard to have copy all values, but it would be correct to create them again.
    } else if (IsArray(input)) {
        // i need to know when i am in which realm, first. The functions will not work like they are supposed to now.
        output = ArrayCreate(0); // how do i create them in targetRealm?
        // shall i switch with setRealm(targetRealm), setRealm(sourceRealm) for demo? it has no effect in memory anyways for me yet.
        var len = Get(input, "length", input);
        Set(output, "length", len, output);

    } else if (IsCallable(input)) {
        return withError("Range", "DataCloneError: Can not clone a function.");
    } else if (hasInternalSlot(input, "ErrorData")) {
        return withError("Range", "DataCloneError: Can not clone error object.");
    } else if (Type(input) === OBJECT && input.toString() !== "[object OrdinaryObject]") {
        return withError("Range", "DataCloneError: Can only copy ordinary objects, no exotic objects");
    } else {
        // setRealm() img.
        output = ObjectCreate();
        // unsetRealm() img.
        var deepClone = true;
    }
    memory.push({ input: input, output: output });
    if (deepClone) {
        var keys = OwnPropertyKeysAsList(output);
        var outputKey;
        for (var i = 0, j = keys.length; i < j; i++) {
            if (Type(key) === STRING) outputKey = key;
            // if (Type(key) === SYMBOL) outputKey = key;
            var sourceValue = Get(input, key);
            if (isAbrupt(sourceValue = ifAbrupt(sourceValue))) return sourceValue;
            var clonedValue = InternalStructuredClone(sourceValue, memory);
            if (isAbrupt(clonedValue = ifAbrupt(clonedValue))) return clonedValue;
            var outputSet = Set(output, outputKey, clonedValue, output);
            if (isAbrupt(outputSet)) return outputSet;
        }
    }
    return NormalCompletion(output);
}

// object.[[Transfer]](targetRealm)
var Transfer_Call = function (thisArg, argList) {
    var targetRealm = argList[0];
    var object = thisArg;
    if (hasInternalSlot(object, "ArrayBufferData"))
        return CopyArrayBufferToRealm(object, targetRealm);
};

function CopyArrayBufferToRealm(arrayBuffer, targetRealm) {
    var ArrayBufferConstructor = getIntrinsicFromRealm("%ArrayBuffer%", targetRealm);
    var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
    var srcBlock = getInternalSlot(arrayBuffer, "ArrayBufferData");
    var result = OrdinaryConstruct(ArrayBufferConstructor, []);
    var setStatus = SetArrayBufferData(result, length);
    if (isAbrupt(setStatus)) return setStatus;
    var copyStatus = CopyDataBlockBytes(targetBlock, 0, srcBlock, 0, length);
    if (isAbrupt(copyStatus)) return copyStatus;
    return NormalCompletion(result);
}

// object.[[OnSuccessfulTransfer]](transferResult, targetRealm);
var OnSuccessfulTransfer_Call = function (thisArg, argList) {
    var transferResult = argList[0];
    var targetRealm = argList[1];
    var object = thisArg;
    if (hasInternalProperty(object, "ArrayBufferData")) {
        var neuteringResult = SetArrayBufferData(object, 0);
        if (isAbrupt(neuteringResult = ifAbrupt(neuteringResult))) return neuteringResult;
        setInternalSlot(object, "Transfer", "neutered");
    }
};


/* Missing: MessagePort and postMessage and open und close */

/*
 DataCloneError error object
 Indicates failure of the structured clone algorithm.
 {Rationale: typically, ECMAScript operations throw RangeError for similar failures, but we need to preserve DOM compatibnility}
 */

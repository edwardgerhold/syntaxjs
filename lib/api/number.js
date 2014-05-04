/**
 * Created by root on 31.03.14.
 */
function thisNumberValue(value) {
    if (value instanceof CompletionRecord) return thisNumberValue(value.value);
    if (typeof value === "number") return value;
    if (Type(value) === NUMBER) return value;
    if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.NUMBERDATA)) {
        var b = getInternalSlot(value, SLOTS.NUMBERDATA);
        if (typeof b === "number") return b;
    }
    return newTypeError( "thisNumberValue: value is not a Number");
}



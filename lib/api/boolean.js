/**
 * Created by root on 31.03.14.
 */
function thisBooleanValue(value) {
    if (value instanceof CompletionRecord) return thisBooleanValue(value.value);
    if (typeof value === "boolean") return value;
    if (Type(value) === BOOLEAN) return value;
    if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.BOOLEANDATA)) {
        var b = getInternalSlot(value, SLOTS.BOOLEANDATA);
        if (typeof b === "boolean") return b;
    }
    return withError("Type", "thisBooleanValue: value is not a Boolean");
}



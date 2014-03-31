/**
 * Created by root on 31.03.14.
 */

    //
    // Boolean, String, NumberValue
    //

function thisBooleanValue(value) {
    if (value instanceof CompletionRecord) return thisBooleanValue(value.value);
    if (typeof value === "boolean") return value;
    if (Type(value) === "boolean") return value;
    if (Type(value) === "object" && hasInternalSlot(value, "BooleanData")) {
        var b = getInternalSlot(value, "BooleanData");
        if (typeof b === "boolean") return b;
    }
    return withError("Type", "thisBooleanValue: value is not a Boolean");
}



/**
 * Created by root on 31.03.14.
 */

var standard_properties = {
    __proto__: null,
    "Array": true,
    "Error": true,
    "Function": true,
    "Object": true,
    "Symbol": true
};

function DefineBuiltinProperties(O) {
    var globalThis = getGlobalThis();
    for (var name in standard_properties) {
        if (standard_properties[name] === true) {
            var desc = callInternalSlot(SLOTS.GETOWNPROPERTY, globalThis, name);
            var status = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, name, desc);
            if (isAbrupt(status)) return status;
        }
    }
    return O;
}


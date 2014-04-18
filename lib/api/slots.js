/**
 * Created by root on 18.04.14.
 */

    /*

        Here the replacements for the internal slot names go.
        (that later they can be replaced with index numbers or string pointers depending on the callee)

        This means also collecting all foreign internal slot names

     */

var GET = "Get",
    SET = "Set",
    DEFINEOWNPROPERTY = "DefineOwnProperty",
    GETOWNPROPERTY = "GetOwnProperty",
    OWNPROPERTYKEYS = "OwnPropertyKeys",
    ENUMERATE = "Enumerate",
    CALL = "Call",
    CONSTRUCT = "Construct",
    INVOKE = "Invoke",
    HASPROPERTY = "HasProperty",
    ISEXTENSIBLE = "IsExtensible",

    BOUNDTHIS = "BoundThis",
    BOUNDTARGETFUNCTION = "BoundTargetFunction",
    BOUNDARGUMENTS = "BoundArguments";


exports.GET = GET;
exports.SET = SET;
exports.CALL = CALL;
exports.CONSTRUCT = CONSTRUCT;
exports.DEFINEOWNPROPERTY = DEFINEOWNPROPERTY;
exports.GETOWNPROPERTY = GETOWNPROPERTY;
exports.OWNPROPERTYKEYS = OWNPROPERTYKEYS;
exports.ENUMERATE = ENUMERATE;
exports.INVOKE = INVOKE;
exports.HASPROPERTY = HASPROPERTY;
exports.ISEXTENSIBLE = ISEXTENSIBLE;


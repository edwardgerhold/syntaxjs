/**
 *
 * syntax.js Language Packs
 *
 * languages.____.js
 * contain a module "languages.___" where ___ is the language
 *
 * The export Objects has a number of well known keys.
 * These keys are used for a call to format(key, ...varargs)
 *
 * The current language pack will be asked for the key and the string under the key.
 * The string will be transposed by replacing the %s placeholders
 *
 * The function format is available with syntaxjs.require("i18n").format;
 *
 * Other possibilites to use the language pack is to call trans("KEY")
 * which is not needing a loop to replace all %s
 *
 */
define("languages.en_US", function (require, exports) {
    "use strict";

    // Reference
    exports.REFERENCE_S_IS_UNRESOLVABLE = "Reference %s is unresolvable";
    exports.NOT_A_REFERENCE = "Not a reference";
    exports.UNRESOLVABLE_REFERENCE = "Unresolvable Reference";

    // Primitives

    // Objects
    exports.S_IS_NOT_AN_OBJECT = "%s is not an object";

    // Slots
    exports.S_IS_NO_AVAILABLE_SLOT = "%s is no available slot.";

    // Constructor
    exports.S_IS_NO_CONSTRUCTOR = "%s is not a constructor";
    exports.NO_CONSTRUCTOR = "Not a constructor";

    // Callable
    exports.S_IS_NOT_CALLABLE = "%s is not a callable.";
    exports.NOT_CALLABLE = "Not a function";

    // Ranges
    exports.OUT_OF_RANGE = "Out of range";
    exports.S_IS_OUT_OF_RANGE_S = "%s is out of range %s";


    // VM.eval
    exports.UNKNOWN_INSTRUCTION_S = "Unknown instruction: %s";
    exports.UNKNOWN_ERROR         = "Unknown Error";

    return exports;
});

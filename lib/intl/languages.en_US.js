
/**
 *
 * syntax.js Language Packs
 *
 * languages.____.js
 * contain a module "languages.___" where ___ is the language
 *
 * The export Object has a number of well known keys.
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

    exports.ASSERTION_S = "Assertion fails: %s";

    exports.PUT_FAILS_AT_S = "Put fails at property %s";
    exports.DEFINEPROPERTYORTHROW_FAILS_AT_S = "DefinePropertyOrThrow fails at property %s";
    exports.DELETEPROPERTYORTHROW_FAILS_AT_S ="DeletePropertyOrThrow fails at property %s";

    exports.CREATEDATAPROPERTYORTHROW_FAILED = "CreateDataPropertyOrThrow failed.";

    // Reference
    exports.REFERENCE_S_UNRESOLVABLE = "Reference %s is unresolvable";
    exports.NOT_A_REFERENCE = "Not a reference";
    exports.UNRESOLVABLE_REFERENCE = "Unresolvable Reference";
    exports.SET_FAILED_IN_STRICTMODE = "[[Set]] failed in strict mode";
    exports.BASE_NEVER_NULL = "Reference base may never be null or undefined here."

    //Properties
    exports.P_HAS_TO_BE_A_VALID_PROPERTY_KEY = "P has to be a valid property key";

    // Primitives
    exports.TOSTRING_ERROR = "Can not cast argument into a string."
    exports.SYMBOL_CREATE_ERROR = "The Symbol[@@create] method of the Symbol function is supposed to throw a Type Error";
    exports.SYMBOL_TOPRIMITIVE_ERROR =  "Symbol.prototype[@@toPrimitive] is supposed to throw a Type Error!";
    exports.GLOBAL_SYMBOL_REGISTRY_ERROR = "Assertion Error. Duplicate in GlobalSymbolRegistry which MUST NOT be.";
    exports.S_NOT_A_SYMBOL = "%s is not a symbol";

    exports.S_IS_FALSE = "%s is false, but shouldn´t";
    exports.S_IS_TRUE = "%s is true, but shouldn´t";

    exports.S_IS_UNDEFINED = "%s is undefined but shouldn´t."
    exports.S_NOT_OBJECT = "%s is not an object.";

    exports.S_NOT_UNDEFINED = "%s is not undefined."
        exports.S_NOT_COMPLETE = "%s is not complete with all intrinsic properties."

    exports.S_HAS_NO_S = "%s has no %s";
    
    
    exports.S_IS_FROZEN = "%s is frozen.";
    

    // Arrays
    exports.CREATEDATAPROPERTY_FAILED = "CreateDataProperty failed but shouldn´t."
    exports.ARRAY_LENGTH_ERROR = "Error comparing array length values";

    // Objects
    exports.S_NOT_AN_OBJECT = "%s is not an object";

    // Slots
    exports.S_ALREADY_INITIALIZED = "%s is already initialized.";
    exports.S_NOT_INITIALIZED = "%s is not properly initialized";


    exports.SLOT_S_OF_INVALID_TYPE = "The slot %s is of an invalid type.";
    exports.SLOT_S_NOT_A_STRING = "The slot %s contains no string.";

    exports.SLOT_CONTAINS_NO_S = "slot is not containing %s";
    exports.HAS_NO_SLOT_S = "the slot %s is not available.";
    exports.SLOT_NOT_AVAILABLE = "slot is not available";

    // Constructor
    exports.S_NO_CONSTRUCTOR = "%s is not a constructor";
    exports.NO_CONSTRUCTOR = "Not a constructor";

    // Callable
    exports.S_NOT_CALLABLE = "%s is not a callable.";
    exports.NOT_CALLABLE = "Not a function";

    exports.FUNCTION_TOSTRING_ERROR = "Function.prototype.toString only applies to functions!";

    //Super

    exports.CAN_NOT_MAKE_SUPER_REF = "Can not make super reference.";


    exports.PROXY_CALL_ERROR =  "The Proxy Constructor is supposed to throw when called without new.";

    // Ranges
    exports.OUT_OF_RANGE = "Out of range";
    exports.S_OUT_OF_RANGE = "%s out of range.";
    exports.S_OUT_OF_RANGE_S = "%s is out of range %s";

    exports.EXPECTING_ARRAYLIKE = "Expected an array like object";

    // CheckObjectCoercible
    exports.NULL_NOT_COERCIBLE = "null is not coercible by the check function CheckObjectCoercible";
    exports.UNDEFINED_NOT_COERCIBLE = "undefined is not coercible by the check function CheckObjectCoercible";


    exports.NO_PARSER_FOR_S = "Got no parser functions for %s";
    exports.NO_COMPILER_FOR_S = "Got no compiler function for %s";
    exports.UNKNOWN_CHARACTER_S = "Unknown character: %s";

    // VM.eval
    exports.UNKNOWN_INSTRUCTION_S = "Unknown instruction: %s";
    exports.UNKNOWN_ERROR         = "Unknown Error";

    exports.AVAILABLE_LANGUAGES = "Available Languages";
    exports.LANGUAGE_NOT_FOUND_S = "Language not found: %s";

    exports.THROW_TYPE_ERROR = "The system is supposed to throw a Type Error with %ThrowTypeError% here.";


    // thrown Exceptions by the system
    exports.AN_EXCEPTION = "An Exception was thrown:";
    exports.S_EXCEPTION_THROWN = "A %s Exception was thrown!";
    exports.EXCEPTION_NAME_S = "name: %s"
    exports.EXCEPTION_MESSAGE_S = "message: %s";
    exports.EXCEPTION_STACK_S = "stack: %s";
    exports.LINE_S = "line %s";
    exports.COLUMN_S = "column %s";
    exports.AT_LINE_S_COLUMN_S = "at line %s, column %s";


    exports.ARGUMENTS_CALLER_STRICT_ERROR = "Can not access 'caller' in strict mode";



    exports.S_INITIALIZED_ERR = "%s is already initialized";

    return exports;
});

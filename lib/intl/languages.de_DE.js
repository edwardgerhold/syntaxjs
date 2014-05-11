define("languages.de_DE", function (require, exports) {
    "use strict";

    exports.REFERENCE_S_UNRESOLVABLE = "Referenz %s ist unauflösbar";
    exports.NOT_A_REFERENCE = "Ist keine Referenz";
    exports.UNRESOLVABLE_REFERENCE = "Unaufloesbare Referenz";
    exports.SET_FAILED_IN_STRICTMODE = "[[Set]] ist im Strict Mode fehlgeschlagen."
    exports.BASE_NEVER_NULL = "Referenz Basis ist hier sonst nie null oder undefined."


    exports.P_HAS_TO_BE_A_VALID_PROPERTY_KEY = "P muss ein gültiger Eigenschaftsschlüssel sein";

    exports.S_NOT_AN_OBJECT = "%s ist kein Object";

    exports.HAS_NO_SLOT_S = "Der Slot %s ist nicht verfügbar.";
    exports.SLOT_NOT_AVAILABLE = "slot is not available";

    exports.CREATEDATAPROPERTY_FAILED = "CreateDataProperty hat versagt."
    exports.ARRAY_LENGTH_ERROR = "Fehler beim Überprüfen der Arraylängenwerte.";

    exports.TOSTRING_ERROR = "Argument kann nicht in einen String verwandelt werden.";
    exports.SYMBOL_CREATE_ERROR = "The Symbol[@@create] Methode der Symbol Function ist aufgefordert einen TypeError zu werfen.";
    exports.SYMBOL_TOPRIMITVE_ERROR = "Symbol.prototype[@@toPrimitive] ist dazu angehalten hier einen TypeError zu werfen!";
    exports.GLOBAL_SYMBOL_REGISTRY_ERROR = "Zusicherungsfehler. Duplikat in GlobalSymbolRegistry, das nicht sein darf.";
    exports.S_NOT_A_SYMBOL = "%s ist kein Symbol";


    exports.SLOT_S_OF_INVALID_TYPE = "Der Slot %s ist von unzulässigen Typs.";
    exports.SLOT_S_NOT_A_STRING = "Der Slot %s ist kein String.";


    exports.S_NO_CONSTRUCTOR = "%s ist keine Konstruktorfunktion.";
    exports.NO_CONSTRUCTOR = "Kein Konstruktor.";

    exports.S_NOT_CALLABLE = "%s ist nicht aufrufbar.";
    exports.NOT_CALLABLE = "Keine Funktion";

    exports.NULL_NOT_COERCIBLE = "null is nicht erzwingbar durch die Testfunktion CheckObjectCoercible";
    exports.UNDEFINED_NOT_COERCIBLE = "undefined ist nicht erzwingbar durch die Testfunktion CheckObjectCoercible";

    exports.S_ALREADY_INITIALIZED = "%s ist bereits initialisiert.";
    exports.S_NOT_INITIALIZED = "%s ist nicht richtig initialisiert.";

    exports.EXPECTING_ARRAYLIKE = "Erwartete ein Array-artiges Objekt";

    exports.NO_PARSER_FOR_S = "Habe keine Parserfunktionen für %s";
    exports.NO_COMPILER_FOR_S = "Habe keine Übersetzerfunktion for %s";
    exports.UNKNOWN_CHARACTER_S = "Unbekanntes Zeichen: %s";


    exports.UNKNOWN_INSTRUCTION_S = "Unbekannte Instruktion: %s";
    exports.UNKNOWN_ERROR         = "Unbekannter Fehler";

    // Ranges
    exports.OUT_OF_RANGE = "Nicht im Intervall";
    exports.S_OUT_OF_RANGE_S = "%s ist nicht im Intervall %s";


    exports.AVAILABLE_LANGUAGES = "Verfügbare Sprachen";
    exports.LANGUAGE_NOT_FOUND_S = "Sprache nicht gefunden: %s";

    exports.THROW_TYPE_ERROR = "Das System ist dazu angehalten hier einen Fehler mit %ThrowTypeError% zu werfen.";


    // thrown Exceptions by the system
    exports.AN_EXCEPTION = "Eine Ausnahme wurde geworfen:";
    exports.S_EXCEPTION_THROWN = "Eine %s Ausnahme wurde geworfen!";
    exports.EXCEPTION_NAME_S = "Name: %s"
    exports.EXCEPTION_MESSAGE_S = "Botschaft: %s";
    exports.EXCEPTION_STACK_S = "Aufrufstapel: %s";
    exports.LINE_S = "Zeile %s";
    exports.COLUMN_S = "Spalte %s";
    exports.AT_LINE_S_COLUMN_S = "in Zeile %s, Spalte %s";


    return exports;

});

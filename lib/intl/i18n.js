
/*
 ******
 define: tables
 ******
*/

define("i18n-messages", function (require, exports, module) {

    var languages = Object.create(null);

    var en = {
        "not_an_object": "argument is not an object",
        "not_to_primitive": "can not convert argument to primitive type",
        "not_coercible": "can not convert argument to object",
        "unresolvable_ref": "is an unresolvable reference",
        "not_in_strict": "is not allowed in strict mode"
    };

    var de = {
        "not_an_object": "Argument ist kein Objekt",
        "not_to_primitve": "Kann Argument nicht in Primitivtyp umwandeln.",
        "not_coercible": "Kann Argument nicht in Objekt umwandeln.",
        "unresolvable_ref": "ist eine nicht aufloesbare Referenz."
    };

    var fr = {
        "not_an_object" : "argument n´est pas un object"
    };

    var la = {
        "not_an_object" : "objectum non est",
        "not_to_primitive" : "primitivus typus non est",
        "not_coercible" : "non coercibus",
        "unresolvable_ref": "non resolvum referencum"

    };



    languages.en = en;
    languages.de = de;
    languages.fr = fr;

    function i18n(name, lang) {
        lang = lang || i18n.defaultLanguage;
        return i18n.languages[lang][name] || i18n.languages["en"][name] || ("'i18n:" + lang + ":" + name + "'");
    }

    i18n.languages = languages;
    i18n.defaultLanguage = "de";

    return i18n;

});

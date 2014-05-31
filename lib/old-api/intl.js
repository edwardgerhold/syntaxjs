var timeZones = Object.create(null);
timeZones.UTC = "UTC";
var regExps = Object.create(null);
regExps.notAtoZ = /[^A-Z]/;
function IsStructurallyValidLanguageTag (locale) {
    Assert(Type(locale) === STRING, "locale must be a string");
    // get a bcp 47 database and
    // verify locale
}
function CanonicalizeLanguageTag (locale) {
    // get bcp 47
    // map to upper case
    // get the right from hash
    // return canon name
}
function DefaultLocale () {
    return getRealm().defaultLocale;
}
function IsWellFormedCurrencyCode (currency) {
    var c = ToString(currency);
    var normalized = c.toUpperCase();
    if (normalized.length != 3) return false;
    if (regExps.notAtoZ.test(normalized)) return false;
    return true;
}
function CanonicalizeLocaleList (locales) {

}
function BestAvailableLocale(availableLocales, locale) {

}
function LookupMatcher(availableLocales, requestedLocales) {

}
function BestFitMatcher (availableLocales, requestedLocales) {

}
function ResolveLocale (availableLocales, requestedLocales, options, relevantExtensionKeys, localeData) {

}

function LookupSupportedLocales (availableLocales, requestedLocales) {

}
function BestFitSupportedLocales (availableLocales, requestedLocales) {

}
function SupportedLocales (availableLocales, requestedLocales, options) {

}
function GetOption_Intl (options, property, type, values, fallback) {
    var value = callInternalSlot(SLOTS.GET, options, property);
    if (isAbrupt(value=ifAbrupt(value))) return value;
    switch (type) {
        case "boolean": value = ToBoolean(value);
            break;
        case "string": value = ToString(value);
            break;
    }
    if (values !== undefined) {
        if (values.indexOf(value) > -1) return value;
        else return new RangeError(format("S_OUT_OF_RANGE", "value"));
    }
    return fallback;
}
function GetNumberOption (options, property, minimum, maximum, fallback) {
    var value = callInternalSlot(SLOTS.GET, options, property);
    if (isAbrupt(value=ifAbrupt(value))) return value;
    if (value != undefined) {
        value = ToNumber(value);
        if (isAbrupt(value)) return value;
        if ((value != value) || value < minimum || value > maximum) return new RangeError(format("S_OUT_OF_RANGE", "value"));
        return floor(value);
    }
    return fallback;
}
function InitializeCollator(collator, locales, options) {
    if (getInternalSlot(collator, SLOTS.INITIALIZEDINTLOBJECT) === true) return newTypeError(format("S_INITIALIZED_ERR", "Collator"));
}
var CollatorConstructor_call = function (thisArg, argList) {
};
var CollatorConstructor_construct = function (argList) {

};
var NumberFormatConstructor_call = function (thisArg, argList) {

};
var NumberFormatConstructor_construct = function (argList) {

};
var DateTimeFormatConstructor_call = function (thisArg, argList) {

};
var DateTimeFormatConstructor_construct = function (argList) {

};




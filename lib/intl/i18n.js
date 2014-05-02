
define("i18n", function (require, exports) {
"use strict";

    var languages = exports.languages = Object.create(null);

    /**
     * add a language (any string value)
     * it requires an existing module
     * else require throws with the missing filename
     *
     * exports.languages = new Object
     * replaces this object in it´s use
     *
     * @param lang
     */
    function addLang(lang) {
        "use strict";
        languages[lang] = require("languages." + lang);
    }

    /**
     * set the specific default language
     * the module must have been added before,
     * else i throw an exception
     * @param lang
     */
    function setLang(lang) {
        "use strict";
        if (exports.languages[lang]) exports.languages.lang = exports.languages[lang];
        else throw new TypeError("the following language has not been added with setLang(): "+lang);
    }

    /**
     * set a fallback language, if the language has no string available
     * if a fallback isnt present, a "NO_STRING_PRESENT: "+index should be shown
     * @param lang
     */
    function setFallback(lang) {
        "use strict";
        if(exports.languages[lang])
        exports.languages.fallback = exports.languages[lang];
        else throw new TypeError("can not set fallback to '"+lang+"'. language doesn´t exist. Use addLang('"+lang+"') to require('languages."+lang+"')");
    }

    /**
     * format(index, "%s %s %s", "i", "am", "tool");
     * returns "i am tool" or in german, if setLang("de_DE") happened "ich bin Werkzeug"
     * %s is for any value as we are in javascript
     * better formatting can be added but is not concerned now
     *
     * @param index
     * @returns {string}
     */

    function format(index) {
        "use strict";
        var c1, c2;
        var aCount = 1;
        var str = exports.languages.lang[index];
        if (str===undefined) return formatStr(exports.NOT_FOUND_ERR, index);
        c2 = str[0];
        var out = "";
        for (var i = 1, j = str.length; i < j; i++) {
            c1 = c2;
            c2 = str[i];
            if (c1 == "%" && c2 == "s") {
                out += arguments[aCount];
                aCount += 1;
                i+=1;
                c1 = str[i-1];
                c2 = str[i];
            } else {
                out += c1;
            }
        }
        if (c2 != undefined) out+=c2;
        return out;
    }
    /**
     * formatStr is the same as format
     * returns "i am tool" or in german
     * and performs no translation
     *
     * @param str
     * @returns {string}
     */
    function formatStr(str) {
        "use strict";
        var c1, c2;
        var aCount = 1;
        c2 = str[0];
        if (str == undefined) return "";
        var out = "";
        for (var i = 1, j = str.length; i < j; i++) {
            c1 = c2;
            c2 = str[i];
            if (c1 == "%" && c2 == "s") {
                out += arguments[aCount];
                aCount += 1;
                i+=1;
                c1 = str[i-1];
                c2 = str[i];
            } else {
                out += c1;
            }
        }
        if (c2 != undefined) out+=c2;
        return out;
    }

    /**
     * This one fetches a translated string
     * and performs no formatting
     *
     * @param index
     * @returns {*}
     */
    function trans(index) {
        "use strict";
        var s = exports.languages[exports.languages.lang][index];
        if (s == undefined) return formatStr(exports.NOT_FOUND_ERR, lang);
        return s;
    }


exports.languages = languages;
exports.addLang = addLang;
exports.setLang = setLang;
exports.setFallback = setFallback;
exports.trans = trans;
exports.format = format;
exports.formatStr = formatStr;
exports.NOT_FOUND_ERR = "i18n-failure: '%s' not found."

// I initialise this in lib/_main_.js

});

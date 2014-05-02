
// ===========================================================================================================
// Date Algorithms
// ===========================================================================================================

var msPerDay = 1000 * 60 * 60 * 24;
var msPerHour = 1000 * 60 * 60;
var msPerMinute = 1000 * 60;
var msPerSecond = 1000;
var minutesPerHour = 60;
var hoursPerDay = 24;
var secondsPerMinute = 60;
var msPerYear = msPerDay * 365;

function UTC() {

}

function thisTimeValue(value) {
    if (value instanceof CompletionRecord) return thisTimeValue(value);
    if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.DATEVALUE)) {
        var b = getInternalSlot(value, SLOTS.DATEVALUE);
        if (b !== undefined) return b;
    }
    return withError("Type", "thisTimeValue: value is not a Date");
}

function Day(t) {
    return Math.floor(t / msPerDay);
}

function TimeWithinDay(t) {
    return t % msPerDay;
}

function DaysInYear(y) {
    var a = y % 4;
    var b = y % 100;
    var c = y % 400;
    if (a !== 0) return 365;
    if (a === 0 && b !== 0) return 366;
    if (b === 0 && c !== 0) return 365;
    if (c === 0) return 366;
}

function DayFromYear(y) {
    return 365 * (y - 1970) + floor((y-1969/4)) - floor((y-1901)/100) + floor((y-1601)/400);
}

function YearFromTime(t) {
    var y = t / (60 * 60 * 24 * 365);
    return y;
}

function InLeapYear(t) {
    var diy = DaysInYear(YearFromTime(t));
    if (diy == 365) return 0;
    if (diy == 366) return 1;
}

var Months = {
    __proto__: null,
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December"
};

function MonthFromTime(t) {
    var il = InLeapYear(t);
    var dwy = DayWithinYear(t);
    if (0 <= dwy && dwy < 31) return 0;
    else if (31 <= dwy && dwy < 59 + il) return 1;
    else if (59 + il <= dwy && dwy < 90 + il) return 2;
    else if (90 + il <= dwy && dwy < 120 + il) return 3;
    else if (120 + il <= dwy && dwy < 151 + il) return 4;
    else if (151 + il <= dwy && dwy < 181 + il) return 5;
    else if (181 + il <= dwy && dwy < 212 + il) return 6;
    else if (212 + il <= dwy && dwy < 243 + il) return 7;
    else if (243 + il <= dwy && dwy < 273 + il) return 8;
    else if (273 + il <= dwy && dwy < 304 + il) return 9;
    else if (304 + il <= dwy && dwy < 334 + il) return 10;
    else if (334 + il <= dwy && dwy < 365 + il) return 11;
}

function DayWithinYear(t) {
    return Day(t) - DayFromYear(YearFromTime(t));
}

function HourFromTime(t) {
    return Math.floor(t / msPerHour) % hoursPerDay;
}

function MinFromTime(t) {
    return Math.floor(t / msPerMinute) % minutesPerHour;
}

function SecFromTime(t) {
    return Math.floor(t / msPerSecond) % secondsPerMinute;
}

function msFromTime(t) {
    return t % msPerSecond;
}

function MakeTime(hour, min, sec, ms) {
    if (isFinite(hour) === false) return NaN;
    var h = ToInteger(hour);
    var m = ToInteger(min);
    var sec = ToInteger(sec);
    var milli = ToInteger(ms);
    var t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
    return t;
}

function MakeDay(year, month, date) {
    if (!isFinite(time)) return NaN;
    var y = ToInteger(year);
    var m = ToInteger(month);
    var dt = ToInteger(date);
    var ym = Math.floor(m / 12);
    var mn = m % 12;
    var t;
    return Day(t) + dt - 1;
}

function MakeDate(day, time) {
    if (!isFinite(day)) return NaN;
    return day * msPerDay + time;
}

function TimeClip(time) {
    if (!isFinite(time)) return NaN;
    if (Math.abs(time) > (8.64 * Math.pow(10, 15))) return NaN;
    return ToInteger(time) + (+0);
}

function WeekDay (t) {
    return ((Day(t) + 4) % 7);
}

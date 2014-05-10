
// ===========================================================================================================
// Date Constructor and Prototype (algorithms above)
// ===========================================================================================================

setInternalSlot(DateConstructor, SLOTS.CALL, function (thisArg, argList) {

    var O = thisArg;
    var numberOfArgs = argList.length;
    var y, m, dt, h, min, milli, finalDate;

    if (numberOfArgs >= 2) {

        var year = argList[0];
        var month = argList[1];
        var date = argList[2];
        var hours = argList[3];
        var minutes = argList[4];
        var seconds = argList[5];
        var ms = argList[6];

        if (Type(O) === OBJECT
            && hasInternalSlot(O, SLOTS.DATEVALUE)
            && (getInternalSlot(O, SLOTS.DATEVALUE) === undefined)) {

            y = ToNumber(year);
            if (isAbrupt(y)) return y;
            m = ToNumber(month);
            if (isAbrupt(m)) return m;
            if (date) dt = ToNumber(date);
            else dt = 1;
            if (isAbrupt(dt)) return dt;
            if (hours) h = ToNumber(hours);
            else h = 0;
            if (minutes) min = ToNumber(minutes);
            else min = 0;
            if (isAbrupt(min)) return min;
            if (ms) milli = ToNumber(ms);
            else milli = 0;
            if (isAbrupt(milli)) return milli;
            finalDate = MakeDate(MakeDay(y, m, dt), MakeTime(h, min, s, milli));
            setInternalSlot(O, SLOTS.DATEVALUE, TimeClip(UTC(finalDate)));
        }
        return O;
    } else if (numberOfArgs === 1) {
        var value = argList[0];
        var tv, v;
        if (Type(O) === OBJECT && hasInternalSlot(O, SLOTS.DATEVALUE) && getInternalSlot(O, SLOTS.DATEVALUE) === undefined) {
            if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.DATEVALUE)) tv = thisTimeValue(value);
            else {
                v = ToPrimitive(value);
                if (Type(v) === STRING) {
                    tv = Invoke(DateConstructor, "parse", [v])
                } else {
                    tv = ToNumber(v);
                }
            }
                if (isAbrupt(tv = ifAbrupt(tv))) return tv;
                setInternalSlot(O, SLOTS.DATEVALUE, TimeClip(tv));
                return O;

        }
    } else if (numberOfArgs === 0) {
        if (Type(O) === OBJECT && hasInternalSlot(O, SLOTS.DATEVALUE) && getInternalSlot(O, SLOTS.DATEVALUE) === undefined) {
            setInternalSlot(O, SLOTS.DATEVALUE, Date.now()/*TimeClip(UTC(Date.now()))*/);
            return O;
        }
    } else {
        O = OrdinaryConstruct(DateConstructor, []);
        return Invoke(O, "toString", []);
    }
});

setInternalSlot(DateConstructor, SLOTS.CONSTRUCT, function (thisArg, argList) {
    return OrdinaryConstruct(this, argList);
});


DefineOwnProperty(DateConstructor, "prototype", {
    value: DatePrototype,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "constructor", {
    value: DateConstructor,
    writable: false,
    enumerable: false,
    configurable: false
});

//DatePrototype
DefineOwnProperty(DateConstructor, "parse", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var string = ToString(argList[0]);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

//DatePrototype
DefineOwnProperty(DateConstructor, "now", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        return NormalCompletion(Date.now());
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DateConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var obj = OrdinaryCreateFromConstructor(DateConstructor, INTRINSICS.DATEPROTOTYPE, [
           SLOTS.DATEVALUE
    ]);
        return obj;
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getDate", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return DateFromTime(LocalTime(t));
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getDay", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return WeekDay(LocalTime(t));
    }),

    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getFullYear", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return YearFromTime(LocalTime(t));
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getHours", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return HourFromTime(LocalTime(t));
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getMilliSeconds", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return msFromTime(LocalTime(t));
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getMinutes", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return MinFromTime(LocalTime(t));
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getMonth", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return MonthFromTime(LocalTime(t));
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getTimeZoneOffset", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return (t - LocalTime(t));

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getUTCDay", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return WeekDay(t);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getUTCFullYear", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return YearFromTime(t);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getUTCHours", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return HourFromTime(t);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getUTCMilliseconds", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return msFromTime(t);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getUTCMinutes", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return MinFromTime(t);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "getUTCSeconds", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var t = thisTimeValue(thisArg);
        if (isAbrupt(t)) return t;
        if (t !== t) return NaN;
        return SecFromTime(t);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "setDate", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        var date = argList[0];
        var t = LocalTime(thisTimeValue(thisArg));
        var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
        var u = TimeClip(UTC(newDate));
        setInternalSlot(thisArg, SLOTS.DATEVALUE, u);
        return u;
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(DatePrototype, "", {
    value: null,
    writable: false,
    enumerable: false,
    configurable: false
});

LazyDefineBuiltinConstant(DatePrototype, $$toStringTag, "Date");

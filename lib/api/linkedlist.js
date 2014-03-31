/**
 * Created by root on 31.03.14.
 */

    // ===========================================================================================================
    // A List? Unused
    // ===========================================================================================================

function List() {
    var list = Object.create(List.prototype);
    var sentinel = {};
    sentinel.next = sentinel;
    sentinel.prev = sentinel;
    list.sentinel = sentinel;
    list.size = 0;
    return list;
}
List.prototype.insertFirst = function (item) {
    var rec = {
        value: item
    };
    rec.next = this.sentinel;
    rec.prev = this.sentinel.prev;
    this.sentinel.prev.next = rec;
    this.sentinel.prev = rec;
    this.size += 1;
    return this;
};
List.prototype.insertLast = function (item) {
    var rec = {
        value: item
    };
    rec.prev = this.sentinel;
    rec.next = this.sentinel.next;
    this.sentinel.next.prev = rec;
    this.sentinel.next = rec;
    this.size += 1;
    return this;
};
List.prototype.iterate = function (f) {
    var rec = this.sentinel.next;
    while (rec !== this.sentinel) {
        f(rec.value);
        rec = rec.next;
    }
    return this;
};
List.prototype.reverse = function (f) {
    var rec = this.sentinel.prev;
    while (rec !== this.sentinel) {
        f(rec.value);
        rec = rec.prev;
    }
};
List.prototype.nth = function (n) {
    var rec, i;
    if (n > this.size - 1 || n < 0) return null;
    if (n < this.size / 2) {
        i = 0;
        rec = this.sentinel;
        do {
            rec = rec.next;
            if (i === n) return rec.value;
            i += 1;
        } while (i <= n);
    } else {
        i = this.size - 1;
        rec = this.sentinel;
        do {
            rec = rec.prev;
            if (i === n) return rec.value;
            i -= 1;
        } while (i >= n);
    }
    return null;
};
List.prototype.removeFirst = function () {
    var rec = this.sentinel.next;
    if (rec != this.sentinel) {
        this.sentinel.next = rec.next;
        this.sentinel.next.prev = this.sentinel;
        rec.next = null;
        rec.prev = null;
        this.size -= 1;
        return rec.value;
    }
    return null;
};
List.prototype.removeLast = function () {
    var rec = this.sentinel.prev;
    if (rec != this.sentinel) {
        this.sentinel.prev = rec.prev;
        this.sentinel.prev.next = this.sentinel;
        rec.next = null;
        rec.prev = null;
        this.size -= 1;
        return rec.value;
    }
    return null;
};
List.prototype.push = List.prototype.insertLast;
List.prototype.pop = List.prototype.removeLast;
List.prototype.shift = List.prototype.removeFirst;


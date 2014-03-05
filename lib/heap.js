
/*
 ############################################################################################################################################################################################################

 The Heap Memory (ArrayBuffer plus Load and Store)

 ############################################################################################################################################################################################################
 */

define("heap", function (require, exports, module) {

    var heapMgr = exports;

    // should be merged with "byteCode" in "compiler"
    var byteCode = {
    "string": 3,
    "number": 4,
    "object": 5,
    "array": 6,
    "null": 7,
    "undefined":
        8
    };
    // byteCode should be loaded by "heap" and by "compiler"

    function createHeap(size) {
        return new Heap(size);
    }

    function Heap (size) {
        var heap = Object.create(Heap.prototype);
        heap._byteCode = byteCode;
        heap._buffer = new ArrayBuffer(size);
        heap._sp = 0;
        return heap;
    }

    Heap.prototype.resize = function (newSize) {
        var oldBuffer = this._buffer;
        var read = new Int8Array(oldBuffer);
        this._buffer = new ArrayBuffer(newSize);
        var write = new Int8Array(buffer);
        for (var i = 0, j = read.length; i < j; i++) write[i] = read[i];
    };

    // return some array buffers,
    Heap.prototype.getInt8 = function (size) {
        return new Int8Array(this._buffer, size);
    };
    Heap.prototype.getInt32 = function (size) {
        return new Int32Array(this._buffer, size);
    };
    Heap.prototype.getFloat32 = function (size) {
        return new Float32Array(this._buffer, size);
    };
    Heap.prototype.getFloat64 = function (size) {
        return new Float64Array(this._buffer, size);
    };

    //
    // should redo it with dataview and take an hour
    // for specifying some methods to load and store
    // with them i write down what the compiler returns
    // and from them i load into the runtime
    // onto the operand stack.

    Heap.prototype.storeNull = function () {
        var sp = this,_sp;
        var numBytes = 1;
        var array = this.getInt8(numBytes);
        this._sp += numBytes * Int8Array.BYTES_PER_ELEMENT;
        array[0] = this._byteCode["null"];
        return sp;
    };

    // i this "getInt8" is not as cool as saving sp as old_sp and increasing sp by size
    // and using a dataview to read and write beetween old_sp and sp - dataview is the most generic helpful tool for

    Heap.prototype.storeUndefined = function () {
    };
    Heap.prototype.storeArray = function () {
    };
    Heap.prototype.storeObject = function () {
    };
    Heap.prototype.storeNumber = function () {
    };
    Heap.prototype.storeString = function () {
    };

    // Generic convenient function
    Heap.prototype.store = function (data) {
        if (data === null) {
            return this.storeNull();
        } else if (typeof data === "undefined") {
            return this.storeUndefined();
        } else if (Array.isArray(data)) {
            return this.storeArray(data);
        } else if (typeof data === "object") {
            return this.storeObject(data);
        } else if (typeof data === "number") {
            return this.storeNumber(data);
        } else if (typeof data === "string") {
            return this.storeString(data);
        }
    };

    Heap.prototype.load = function (data) {

    };

exports.createHeap = createHeap;
return exports;
});



/*
 ############################################################################################################################################################################################################

 The Heap Memory (ArrayBuffer plus Load and Store)

 ############################################################################################################################################################################################################
 */



define("heap", function (require, exports, module) {

    var heapMgr = exports;

    var STRING_TYPE = 0,
    OBJECT_TYPE = 1,
    ARRAY_TYPE = 2,
    NUMBER_TYPE = 3,
    NULL_TYPE = 4,
    UNDEFINED_TYPE = 5,
    SYMBOL_TYPE = 6;
    

    var typeCode = {
        "string": STRING_TYPE,
	"number": NUMBER_TYPE,
        "object": OBJECT_TYPE,
	"array": ARRAY_TYPE,
        "null": NULL_TYPE,
	"symbol": SYMBOL_TYPE,
        "undefined": UNDEFINED_TYPE
    };



    function isLittleEndian () {
	/*
	    taken from
	    http://developer.mozilla.org/en-US-docs/Web/API/DataView 
	    "Detect endianness"    
	*/
	var buffer = new ArrayBuffer(2);
	new DataView(buffer).setInt16(0, 256, true);
	return new Int16Array(buffer)[0] === 256;
	/*
	    taken from
	    http://developer.mozilla.org/en-US-docs/Web/API/DataView 
	    "Detect endiannes"
	*/
    }


    function createHeap(size) {
        return new Heap(size);
    }

    function Heap (size) {
        var heap = Object.create(Heap.prototype);
        heap._typeCode = typeCode;
        heap._buffer = new ArrayBuffer(size);
        heap._view = new DataView(heap._buffer);
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
        array[0] = this._typeCode["null"];
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
    Heap.prototype.storeString = function (str) {
            var len = str.length;
            var ptr = this._sp;            
            this._sp += len + 2;
            var array = new Int16Array(this._buffer,len+1);
            array[0] = STRING;
            array[0] += len << 8;
            for (var i = 1, j = len; i <= j; i++) {
                array[i] = str.charAt(i-1);
            }
            return ptr;
    };

    // Generic convenient function
    Heap.prototype.store = function (data) {
        if (data === null) {
            return this.storeNull();
        } else if (typeof data === "undefined" && arguments.length === 1) {
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

    Heap.prototype.load = function (ptr) {
        
        switch (this._buffer[ptr]) {
            case NUMBER_TYPE:
            case OBJECT_TYPE:
            case ARRAY_TYPE:
            
            case STRING_TYPE:
                var len = this._buffer[ptr+1];
                var str = "";                
                for (var i = ptr+2, j = ptr+2+len; i < j; i++) {
                    str += String.fromCharCode(this._buffer[i]);
                }
                return str;
            default:
                return undefined;
        }
                
    };

exports.createHeap = createHeap;
return exports;
});

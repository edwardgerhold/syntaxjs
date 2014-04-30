/**
 * Created by root on 20.04.14.
 */
define("heap", function () {

var ABRUPT = 0x01;

var FREE = "FREE",
    NUMBER = "NUMBER",
    STRING = "STRING",
    LIST = "LIST",
    HASH = "HASH";

var TYPES = {
    0: FREE,
    1: NUMBER,
    2: STRING,
    3: LIST,
    4: HASH
};
var MAX_SIZE = Math.pow(2,32)-1;    // Int32
var POINTER_SIZE = Uint32Array.BYTES_PER_ELEMENT; // 4 Bytes
var TYPE_SIZE = Uint8Array.BYTES_PER_ELEMENT;
var SIZE_SIZE = Uint8Array.BYTES_PER_ELEMENT;
var FREELIST_PTR_SIZE = POINTER_SIZE; // same kind of pointer, just for freelist space
var ALIGN_WITH = 4;

/**
 * Creates a new Space
 * @param space
 * @returns {{space: *, buffer: ArrayBuffer, heap: DataView, root: null, sp: number}}
 */
function new_space (space) {
    var buffer = new ArrayBuffer(space);
    var view = new DataView(buffer);
    return {
        size: space,
        buffer: buffer,
        view: view,
        root: Object.create(null),
        sp: 0,  // increased on allocation by a number of header + allocated bytes
        freeFirst: undefined,
        freeLast: undefined
    };
}

function get_alloc_size(bytes) {
    return OVERHEAD_SIZE + bytes;
}

var OVERHEAD_SIZE = TYPE_SIZE + SIZE_SIZE + FREELIST_PTR_SIZE;

/**
 * A doubly linked list in typed memory
 * @constructor
 */

function SentinelListNode(list, heap) {
    var ptr = ListNode(list, heap)
    return ptr;
}
/**
 * ListNode has
 * + OVERHEAD_SIZE
 * item -> pointer
 * next -> pointer
 * prev -> pointer
 * allocated space for 3x pointer
 *
 * @constructor
 */

function getIndex(startIndex, field_size, field_num) {
    var start = startIndex+OVERHEAD_SIZE;
    return start + (field_num*field_size);
}
function getPrev(heap, node_ptr) {
    var index = getIndex(node_ptr, POINTER_SIZE, 1);
    return heap.space.view.getUint32(index);
}
function setPrev(heap, node_ptr, value) {
    var index = getIndex(node_ptr, POINTER_SIZE, 1);
    return heap.space.view.setUint32(index, value);
}
function getNext(heap, node_ptr) {
    var index = getIndex(node_ptr, POINTER_SIZE, 2);
    return heap.space.view.getUint32(index);
}
function setNext(heap, node_ptr, value) {
    var index = getIndex(node_ptr, POINTER_SIZE, 2);
    return heap.space.view.setUint32(index, value);
}
function getValue(heap, node_ptr) {
    // return a type
}
function setValue(heap, node_ptr, value) {
    // set a type (with full overhead like the node)
}
function ListNode(list, heap, value, prev, next) {
    var startIndex = heap.allocate(POINTER_SIZE * 3);
    var firstIndex = getIndex(startIndex, POINTER_SIZE, 0);
    store(heap, firstIndex, value);
    store(heap, firstIndex + POINTER_SIZE, prev);
    store(heap, firstIndex + 2 * POINTER_SIZE, next);
    return startIndex;
}
/**
 * A doubly linked list with sentinel
 * The sentinel points at the beginning to itself
 * The first an last nodes prev and next point to
 * This makes iterators very easily stop at the sentinel
 * @param heap
 * @returns {List}
 * @constructor
 */
function List(heap) {
    var list = Object.create(List.prototype);
    list.heap = heap;
    list.sentinel = SentinelListNode(list, heap);
    return list;
}
List.prototype = {
    constructor: List,
    insertFirst: function () {
    },
    insertLast: function () {
    },
    removeFirst: function () {
    },
    removeLast: function () {
    }
};

/**
 * A Hashtable for typed Memory
 * @constructor
 */
function getKey(hash, heap, key) {
}
function setKey() {}
function getValue() {}
function setValue() {}
function Entry(hash, heap, key, value) {
    // insert op:
    // calculate hash index for key
    //
}

function Hash(N, P, heap) {
    var hash = Object.create(Hash.prototype);
    hash.heap = heap;
    hash.N = N;
    hash.P = P;
    return hash;
}
Hash.prototype = {
    constructor: Hash,
    insert: function (key, value) {
        return this.set(key, value);
    },
    remove: function (key) {
    },
    has: function (key) {
    },
    get: function (key) {
    },
    set: function (key, value) {
    },
    h: function (key) {
        var hashVal = 0;
        var N = this.N;
        var prime = this.P;
        key = ""+key;
        for (var i = 0, j = key.length; i < j; i++) {
            hashVal += prime * key[i].charCodeAt(0);
        }
        return hashVal % N;
    }
};
/**
 * FreeListNode creates a free list on the position of a pointer,
 * and is used to free memory.
 * @param ptr
 * @constructor
 */
function FreeListNode(heap, ptr) {
    var view = heap.space.view;
    view.setInt8(ptr, FREE); // TYPE
    // SIZE IS LEFT
    // now add heap.freelast to this prev
    // and say to this "heap.freelast"
    setPrev(heap, ptr, heap.space.freelast);    // point prev to freelast
    setNext(heap, heap.space.freelast, ptr);    // point freelast.next to this
    heap.space.freelast = ptr;                  // and move freelast to this.

}

/**
 * Heap is creating and managing the memory
 * @constructor
 */
function Heap (size) {
    var heap = Object.create(Heap.prototype);
    heap.size = size;
    heap.space = new_space(size);
    return heap;
}

Heap.prototype = {
    constructor: Heap,
    align: function (num, A) {
        var sp = this.space.sp;
        if (sp == 0) return sp;
        A = A || ALIGN_WITH;
        return sp + (A - (sp % A));
    },
    allocate: function (numBytes) {
        var startIndex = this.align(this.space.sp); // align with 8
        var realSize = get_alloc_size(numBytes);
        var newSp = startIndex + realSize // allocation simply increases the sp until the space is full. (should i align here?)

        if (newSp > this.size) {
            this.resize(this.size * 2);
        }
        this.space.sp = newSp;
        return startIndex;

    },
    free: function (ptr) {
        var ptr = FreeListNode(this, ptr);
    },
    gc: function () {
        // mark and sweep + copy spaces or what i improve with my little knowledge about gc strategies
        var newSize;
        if (newSize < this.size / 4) {
            this.resize(Math.floor(this.size / 2))
        }
    },
    resize: function (size) {
        var oldSpace = this.space;
        var oldSize = this.size;
        var oldSp = this.space.sp;
        var oldFree = this.space.free
        var newSpace = new_space(size);
        var newSize = Math.min(size, MAX_SIZE);
        var viewOld = new Int8Array(oldSpace.buffer);
        var viewNew = new Int8Array(newSpace.buffer);
        if (newSize > oldSize) len = oldSize;
        for (var i = 0; i < len; i++) {
            viewNew[i] = viewOld[i]; // ptrs have same address, bytes should be bytes while copying, or=
        }
        this.size = size;
        this.space = newSpace;
        this.space.sp = oldSp;
        this.space.freeFirst = oldSpace.freeFirst;
        this.space.freeLast = oldSpace.freeLast;
    },
    createHash: function (N) {
        // allocate a data structure header
        return new Hash(N, this);
    },
    createList: function () {
        // allocate a data structure header
        return new List(this);
    },
    removeHash: function (hash) {
        // delete each index for freelist (O(N) without money in the bank)
        // free the type structure
    },
    removeList: function (list) {
        // iterate all elements and free them
        // free the list.
        // TRICK: RELABEL INTO A FREE LIST ;-) IF I CAN
    }
};

// console.log("heap debug msg: overhead size each allocation for information is: " + OVERHEAD_SIZE);

exports.Heap = Heap;
return exports;

});
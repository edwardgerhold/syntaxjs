
/*
############################################################################################################################################################################################################
    
    The Heap Memory (ArrayBuffer plus Load and Store)
    
############################################################################################################################################################################################################
*/

define("heap", function (require, exports, module) {

    var DataType = {
        "object": 1,
        "string": 2,
        "number": 3,
        "boolean": 4,
        "null": 5,
        "environment": 6,
        "context": 7,
        "descriptor": 8,
        "bindingrecord": 9,
        "completion": 10,
        "declarative": 11,
        "global": 12,
        "function": 13,
        "objectenvironment": 14,
        "functionenvironment": 15,
        "symbol": 16
    };

    function makeDynamicHash() {

    }

    function makeFixedSizeHash(N) {
        var ptr;

        return ptr;
    }

    var encodes = Object.create(null);
    encodes["object"] = 1;
    encodes["undefined"] = 2;
    encodes["null"] = 3;
    encodes["true"] = 4;
    encodes["false"] = 5;
    encodes["function"] = 6;
    encodes["string"] = 7;
    encodes["number"] = 8;
    encodes["Program"] = 100;
    encodes["Identifier"] = 102;
    encodes["FunctionDeclaration"] = 103;
    encodes["FunctionExpression"] = 104;
    encodes["VariableDeclaration"] = 105;
    encodes["LexialDeclaration"] = 106;
    encodes["VariableDeclarator"] = 107;
    encodes["WhileStatement"] = 108;
    encodes["DoWhileStatement"] = 111;
    encodes["ForStatement"] = 112;
    encodes["IfStatement"] = 113;
    encodes["TryStatement"] = 114;
    encodes["ReturnStatement"] = 115;
    encodes["BreakStatement"] = 116;
    encodes["ThrowStatement"] = 117;
    encodes["ContinueStatement"] = 118;
    encodes["EmptyStatement"] = 127;

    var decodes = Object.create(null);
    for (var c in encodes) {
        if (Object.hasOwnProperty.call(encodes, c)) {
            decodes[encodes[c]] = c;
        }
    }

    var symbols = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        A: 10,
        B: 11,
        C: 12,
        D: 13,
        E: 14,
        F: 15,
        "undefined": 16,
        "null": 17,
        "true": 0,
        "false": 1,
    };
    var exports = {};
    var heap;

    var MAX_HEAPSIZE = 2048;
    var DEFAULT_ALIGNMENT = 8;
    var ALIGNMENT = 8;

    function align(number, alignment) {
        if (alignment === undefined) alignment = ALIGNMENT;
        var rest = number % alignment;
        if (rest === 0) return number;
        else return number + (alignment - rest);
    }

    function gc() {
        mark_reachable();
        copy_space();
    }

    function copy_space() {}

    function mark_reachable() {}

    function alloc(bytes) {}

    function make_hash(buf, ofs, N) {
        // offset: 
        // 1) Flags
        // 2) N
        // 3...) NAME, VALUE (offset, offset)

    }

    function createSpace(size) {

        size = alignWith8(size);
        var byteSize = size * Int8Array.BYTES_PER_ELEMENT

        var buf = new ArrayBuffer(byteSize);
        var view = new DataView(buf);
        var heap = {
            from: buf,
            view: view,
            root: Object.create(null),
            all: Object.create(null),
            freeList: Object.create(null),
            size: size,
            bytes: byteSize,
            sp: 0,
            hp: byteSize
        };
        return heap;
    }

    exports.createSpace = createSpace;

    exports.alignWith8 = alignWith8;

    function alignWith8(bytes) {
        var r = bytes % 8;
        if (r != 0) bytes += 8 - r;
        return bytes;
    }

    function make_heap() {}
    exports.make_heap = make_heap;

    function Allocate(buffer, bytes, root) {
        var sp = heap.sp;
        var rnd = alignWith8(bytes);
        heap.sp += rnd;
        var ptr = {
            ofs: sp,
            len: bytes,
            aln: rnd
        };
        // look at freelist
        // or give new mem
        if (root) heap.root[sp] = ptr;
        heap.all[sp] = ptr;
        return ptr;
    }

    exports.allocate = Allocate;

    function store_string() {}

    function store_number() {}

    function store_object() {}

    function store_array() {}

    function store_function() {}

    function store_global_environment() {}

    function store_fn_environment() {}

    function store_decl_environment() {}

    function store_context() {}

    function store_intrinsics() {}

    function store_realm() {}

    function store_completion() {}

    function Store(ptr, value, size, type) {
        if (type === "string") {} else if (type === "number") {} else if (type === "object" && value !== null) {} else if (value === undefined) {}
    }
    exports.store = Store;

    function ToInteger(V) {
        return V|0;
        //var ints = new Int8Array(8);
    }
    exports.toInteger = ToInteger;
    var hp;
    exports.init = function (size) {
        hp = make_heap(size);
    };
    exports.destroy = function (size) {
        hp = null;
    };
});


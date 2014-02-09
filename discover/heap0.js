
/*
    Wer Bytecode will muss leiden (ueben).
*/

function Heap (space) {

    "use strict";

    space = space || 2048;
    var from = new_space(space);
    var to;

    function new_space (space) {
	return {
	    space: space,
	    heap: new ArrayBuffer(space),
	    sp: 0,
	    root: Object.create(null)
	};
    }

    function collect() { // Mark and Sweep frei nach 6.172 Lektion 10
	"use strict";
	var v;
	var Q = [];	
	var r,e,v,o,p,q,b,i,j;
	var root = from.root;
	var bytes = 0;
	
	// erstmal alle live objects suchen  
	for (e in root) {
	
	    v = root[e];
	    if (v.mark === 1) {
		Q.push(v); 
		r = v.view;
		bytes += r.byteLength; // ob ich resizen will
	    } else {
		v.view = null;
		v.ptr.offset = null;
	    }
	}
	
	// resize bei genug belegung
	if (bytes > (space / 2)) { 
	    space += Math.floor(space * 2);
	    if ((b=space % 8) !== 0) space += 8-b;
	} else if (bytes < (space / 4)) {
	    space -= Math.floor(space / 2);
	    if ((b=space % 8) !== 0) space -= b;
	}
	
	// neue to space
	to = new_space(space);
	
	// umkopieren in den to space und pointer updaten
	i=0, j=Q.length;
	while (i < j) {
	    v = Q[i]; // Billiger als O(n) Q.shift()
	    i += 1; 
    	    p = store(to, load(v.ptr)); // neue records fuer to wurden in store erzeugt
	    if (p) {
	        o = v.ptr.offset;
	        root[o].view = v.view; // an alle vorherigen besitzer
		root[o].ptr.offset = p.offset; // die neuen daten per reference type (der record bleibt)
		root[p.offset] = root[o];
		root[o] = null;
		delete root[o];
	    }
	}
        // space wechseln
	delete from.root;// = null; 
	delete from.sp;// = null;
	delete from.heap; //= null;
        from = to;
	to = null;
    }
    
    /*
	resize: Loesche den alten View, nachdem ein neuer alloziert wurde
    */

    function resize(ptr, new_size) {
	"use strict";
	var rec = from.root[ptr.offset];
	var view = rec.view;
	var map = rec.map;

	var new_rec = store(load(ptr));
	
	rec.mark = 0;
	rec.view = null;
	rec.ptr.offset = null;
	rec.map = null;
    }
    
    function alloc (size) {
	var offset = to8(buf.sp);
	size = to8(size);
	from.sp += size;
	if (offset > space) {
	    collect();
	    offset = to8(buf.sp);
	    size = to8(size);
	    from.sp += size;
	}
	var view = new FloatArray(from.heap, offset, size);
	return { offset:offset, size:size, view: view };
    }

    function free(ptr) {
	"use strict";
	var rec = from.root[ptr.offset];
	rec.mark = 0;
	if (rec.view) rec.view = null;
	if (rec.map) for (var k in rec.map) free(rec.map[k]);
    }

    function load(ref) {
	"use strict";
	var data, view, view2, map, k, obj, f, key, keys, m,n,l,j,i;
	var rec = from.root[ref.offset];
	if (rec) {
	    if (rec.type == "object") {
		
		map = rec.map;
		view = rec.view;
		view2 = new Uint16Array(from.heap, ref.offset, view.length);
		keys = view[0];
		i = 8;
		console.log("got keys="+keys);
		
		for (j=0; j < keys; j++) {
		    key = "";
		    offset = view[i];
		    n = view[i+1];
		    i += 8;
		    for (m=0; m < n; m++) { 
		    	key += String.fromCharCode(view2[Math.floor(i/4)+m]);
		    }
		    console.log("key restauriert? "+key);
		    i += to8(n); 
		}
		obj = {};
		for (k in map) obj[k] = load(map[k]);
		return obj;
	    } else if (rec.type == "array") {
		map = rec.map;
		obj = [];
		for (k in map) obj[k] = load(map[k]);
		return obj;
	    } else if (rec.type === "function") {
		view = rec.view;
		data = "";
		for (var i=0, j=view.length; i < j; i++) {
		    data += String.fromCharCode(view[i]);
		}
		f = new Function("return "+data);
		f = f();
		return f; 
	    } else if (rec.view) {
    		view = rec.view;
    		if (view instanceof Uint16Array) {
		    data = "";
		    for (var i=0, j=view.length; i < j; i++) {
			data +=  String.fromCharCode(view[i]);
		    }
		    return data;
		} else if (view instanceof Float64Array) {
		    return view[0];
		}
	    }
	} 
    }

    /*
	Speichern auf der Halde (die Wdh darf ich noch DRYen, schoen fuer extractMethods())
    */
    
    function storedouble(view, data, off)  {
	off = off| 0;
	view[off] = data;
    }
    
    function storestring(view, data, off) {
	    off = off| 0;
	    for (var i = 0; i < data.length; i++) {
		view[i+off] = data.charCodeAt(i);
    	    }
    }
    
    function to8 (n) {
	var m = n % 8;
	if (m === 0) return n;
	else return n + 8-m;
    }

    function store(buf, data, size) {
	"use strict";
	
	var offset, view, view2, bpe;
	var type, map, i,j,k,l,m,n;
	var rec;
	var heap = buf.heap;
	
	var t = typeof data;
	
	
	if (t === "string") {
	    type = "string";
	    bpe = Uint16Array.BYTES_PER_ELEMENT;	
	    if (size === undefined) size = data.length;
	    offset = buf.sp + (bpe - (buf.sp % bpe)); // align
	} else if (t === "number") {
	    type = "number";
	    bpe = Float64Array.BYTES_PER_ELEMENT;
	    size = 1;
	    offset = buf.sp + (bpe - (buf.sp % bpe)); // align
	} else if (t === "function") {
	    type = "function";
	    data = data.toString();
	    bpe = Uint16Array.BYTES_PER_ELEMENT;	
	    if (size === undefined) size = data.length;
	    offset = buf.sp + (bpe - (buf.sp % bpe)); // align
	} else if (t === "object") {
	    if (Array.isArray(data)) {
		type = "array";
		map = Object.create(null);
		for (i = 0, j = data.length; i < j; i++) {
		    map[i] = store(buf, data[i]);
		}    
		
	    } else {
		var keys = 0;
		size = 8;
		type = "object";
		map = Object.create(null);
		for (k in data) {
		    ++keys;
		    map[k] = store(buf, data[k]);
		    size+= k.length;
		    size+= 16; // for offset + len
		}
		j = size%8;
		if (j !== 0) size += 8-j;
		bpe = Float64Array.BYTES_PER_ELEMENT;	
		for (k in data) {
		offset = map[k].offset + "MAP"; // ein trick
		break;
		}
	    }
	}
	
	
	// 2. Moeglicher Collect
	if ((offset + (size*bpe)) > space) {
	    collect();
	    buf = from;
	    offset = buf.sp + (bpe - (buf.sp % bpe)); // align again
	}
	    
	
	// 3. Daten im richtigen Space speichern.
	if (t === "string") {
	    view = new Uint16Array(buf.heap, offset, size);
	    storestring(view, data);
    	
	} else if (t === "number") {
	    view = new Float64Array(buf.heap, offset, size);
	    storedouble(view, data);
	} else if (t === "function") {
	    view = new Uint16Array(buf.heap, offset, size);
	    storestring(view, data);
	} else if (t === "object") {
		view = new Float64Array(buf, offset, size);
		view2 = Uint16Array(buf, offset, size);
		view[0] = keys;
		console.log("saved keys="+keys);
		i = 1;
		for (k in map) {
		    console.log("encode "+k);
		    view[++i] = offset;
		    view[++i] = (n=k.length);
		    for (m=0; m < n; m++) { 
		    	view2[Math.floor(i/4)+m] = k.charCodeAt(m);
		    }
		    i += to8(n);
		}
	}
	
	

	if (view) buf.sp = offset + view.byteLength - 1;
 	
 	if (view || map) {
	    
	    buf.root[offset] = rec = {
		mark: 1,
		view: view ? view : undefined,
		type: type,
		map: map ? map : undefined,
		ptr: {
		    offset: offset
		}
	    };
	    
	    return rec.ptr;	// distributed kann ich mir hier bereits promises vorstellen 
	}
    }

    return {
	get byteLength () {
	    return from.space;
	},
	get bytesUsed () { 
	    return from.sp;
	},
	store: function (data, size) { 
	    return store(from, data, size); 
	},
	load: function (ptr) { 
	    return load(ptr); 
	},
	resize: function (ptr, size) { 
	    return resize(ptr, size); 
	},
	free: function (ptr) { 
	    return free(ptr); 
	},
	alloc: function (size) {
	    return alloc(size);
	},
	gc: function () {
	    return collect(from); 
	},
	heap: function () {
	    return from.heap;
	}
    };

}

exports.Heap = Heap;



var heap = new Heap(2048);
var ptr = [];
for (var i = 0, j = 100; i < j; i++) {
    var s = "string "+i;
    ptr.push(heap.store(s, s.length));
    console.log(heap.bytesUsed + " (bytes used)");
}
var p;
while (p=ptr.shift()) {
    var s = heap.load(p);
    console.log("retrieved "+s);
    
    heap.free(p);
    console.log("freed ptr");
}
console.log(heap.byteLength + " (heap.byteLength)");
console.log(heap.bytesUsed + " (bytes used)");

heap.gc();

console.log(heap.byteLength + " (heap.byteLength)");
console.log(heap.bytesUsed + " (bytes used)");

/*
17 (bytes used)
33 (bytes used)
49 (bytes used)
65 (bytes used)
81 (bytes used)
97 (bytes used)
113 (bytes used)
129 (bytes used)
145 (bytes used)
161 (bytes used)
179 (bytes used)
197 (bytes used)
215 (bytes used)
233 (bytes used)
251 (bytes used)
269 (bytes used)
287 (bytes used)
305 (bytes used)
323 (bytes used)
341 (bytes used)
359 (bytes used)
377 (bytes used)
395 (bytes used)
413 (bytes used)
431 (bytes used)
449 (bytes used)
467 (bytes used)
485 (bytes used)
503 (bytes used)
521 (bytes used)
539 (bytes used)
557 (bytes used)
575 (bytes used)
593 (bytes used)
611 (bytes used)
629 (bytes used)
647 (bytes used)
665 (bytes used)
683 (bytes used)
701 (bytes used)
719 (bytes used)
737 (bytes used)
755 (bytes used)
773 (bytes used)
791 (bytes used)
809 (bytes used)
827 (bytes used)
845 (bytes used)
863 (bytes used)
881 (bytes used)
899 (bytes used)
917 (bytes used)
935 (bytes used)
953 (bytes used)
971 (bytes used)
989 (bytes used)
1007 (bytes used)
1025 (bytes used)
1043 (bytes used)
1061 (bytes used)
1079 (bytes used)
1097 (bytes used)
1115 (bytes used)
1133 (bytes used)
1151 (bytes used)
1169 (bytes used)
1187 (bytes used)
1205 (bytes used)
1223 (bytes used)
1241 (bytes used)
1259 (bytes used)
1277 (bytes used)
1295 (bytes used)
1313 (bytes used)
1331 (bytes used)
1349 (bytes used)
1367 (bytes used)
1385 (bytes used)
1403 (bytes used)
1421 (bytes used)
1439 (bytes used)
1457 (bytes used)
1475 (bytes used)
1493 (bytes used)
1511 (bytes used)
1529 (bytes used)
1547 (bytes used)
1565 (bytes used)
1583 (bytes used)
1601 (bytes used)
1619 (bytes used)
1637 (bytes used)
1655 (bytes used)
1673 (bytes used)
1691 (bytes used)
1709 (bytes used)
1727 (bytes used)
1745 (bytes used)
1763 (bytes used)
1781 (bytes used)
retrieved string 0
freed ptr
retrieved string 1
freed ptr
retrieved string 2
freed ptr
retrieved string 3
freed ptr
retrieved string 4
freed ptr
retrieved string 5
freed ptr
retrieved string 6
freed ptr
retrieved string 7
freed ptr
retrieved string 8
freed ptr
retrieved string 9
freed ptr
retrieved string 10
freed ptr
retrieved string 11
freed ptr
retrieved string 12
freed ptr
retrieved string 13
freed ptr
retrieved string 14
freed ptr
retrieved string 15
freed ptr
retrieved string 16
freed ptr
retrieved string 17
freed ptr
retrieved string 18
freed ptr
retrieved string 19
freed ptr
retrieved string 20
freed ptr
retrieved string 21
freed ptr
retrieved string 22
freed ptr
retrieved string 23
freed ptr
retrieved string 24
freed ptr
retrieved string 25
freed ptr
retrieved string 26
freed ptr
retrieved string 27
freed ptr
retrieved string 28
freed ptr
retrieved string 29
freed ptr
retrieved string 30
freed ptr
retrieved string 31
freed ptr
retrieved string 32
freed ptr
retrieved string 33
freed ptr
retrieved string 34
freed ptr
retrieved string 35
freed ptr
retrieved string 36
freed ptr
retrieved string 37
freed ptr
retrieved string 38
freed ptr
retrieved string 39
freed ptr
retrieved string 40
freed ptr
retrieved string 41
freed ptr
retrieved string 42
freed ptr
retrieved string 43
freed ptr
retrieved string 44
freed ptr
retrieved string 45
freed ptr
retrieved string 46
freed ptr
retrieved string 47
freed ptr
retrieved string 48
freed ptr
retrieved string 49
freed ptr
retrieved string 50
freed ptr
retrieved string 51
freed ptr
retrieved string 52
freed ptr
retrieved string 53
freed ptr
retrieved string 54
freed ptr
retrieved string 55
freed ptr
retrieved string 56
freed ptr
retrieved string 57
freed ptr
retrieved string 58
freed ptr
retrieved string 59
freed ptr
retrieved string 60
freed ptr
retrieved string 61
freed ptr
retrieved string 62
freed ptr
retrieved string 63
freed ptr
retrieved string 64
freed ptr
retrieved string 65
freed ptr
retrieved string 66
freed ptr
retrieved string 67
freed ptr
retrieved string 68
freed ptr
retrieved string 69
freed ptr
retrieved string 70
freed ptr
retrieved string 71
freed ptr
retrieved string 72
freed ptr
retrieved string 73
freed ptr
retrieved string 74
freed ptr
retrieved string 75
freed ptr
retrieved string 76
freed ptr
retrieved string 77
freed ptr
retrieved string 78
freed ptr
retrieved string 79
freed ptr
retrieved string 80
freed ptr
retrieved string 81
freed ptr
retrieved string 82
freed ptr
retrieved string 83
freed ptr
retrieved string 84
freed ptr
retrieved string 85
freed ptr
retrieved string 86
freed ptr
retrieved string 87
freed ptr
retrieved string 88
freed ptr
retrieved string 89
freed ptr
retrieved string 90
freed ptr
retrieved string 91
freed ptr
retrieved string 92
freed ptr
retrieved string 93
freed ptr
retrieved string 94
freed ptr
retrieved string 95
freed ptr
retrieved string 96
freed ptr
retrieved string 97
freed ptr
retrieved string 98
freed ptr
retrieved string 99
freed ptr
2048 (heap.byteLength)
1781 (bytes used)
1024 (heap.byteLength)
0 (bytes used)
*/
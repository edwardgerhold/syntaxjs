var Heap = require("./heap.js").Heap;

var heap = new Heap(2048);
console.dir(heap);

var ptr = heap.allocate(16);
console.log("allocated 16 bytes at " + ptr);
console.log("heap´s sp is now at " + heap.space.sp);


var ptr = heap.allocate(16);
console.log("allocated 16 bytes at " + ptr);
console.log("heap´s sp is now at " + heap.space.sp);

var ptr = heap.allocate(16);
console.log("allocated 16 bytes at " + ptr);
console.log("heap´s sp is now at " + heap.space.sp);

var xyz = heap.free(ptr);
console.log("freed ptr "+xyz);
console.dir(heap);

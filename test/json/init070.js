let object = new Object();
let object2 = Object();
let array = new Array(5);
let array2 = Array();
let proxy = new Proxy({},{});
let set = new Set();
let map = new Map();
let arraybuffer = new ArrayBuffer(24);
let dataview = new DataView(arraybuffer);
let regexp = new RegExp("abc");
let i8 = new Int8Array(arraybuffer);
let ui8 = new Uint8Array(arraybuffer);
let ui8c = new Uint8ClampedArray(arraybuffer);
let i16 = new Int16Array(arraybuffer);
let ui16 = new Uint16Array(arraybuffer);
let i32 = new Int32Array(arraybuffer);
let ui32 = new Uint32Array(arraybuffer);
let f32 = new Float32Array(arraybuffer);
let f64 = new Float64Array(arraybuffer);
let number = new Number(1);
let boolean = new Boolean(true);
let string = new String("abc");
let symbol = Symbol();
let func = new Function("a", "return a");
try {
let generator = new GeneratorFunction("a", "yield a;");
} catch(ex) {
console.log("FAIL: at new GeneratorFunction('a','yield a;') *wonder*isYieldId===false*: "+ex.message);
}
let date = new Date();
let loader = new (Reflect.Loader);
let realm = new (Reflect.Realm);
let promise = new Promise((r,rej) => r('accepted'));

var o = {};


var handler = {
    isExtensible: function (t) {
	console.log("isExtensible flag");
	return Object.isExtensible(t);
    },
    preventExtensions: function (t) {
    },
    getPrototypeOf: function (t) {
    },
    setPrototypeOf: function (t, p) {
    },
    hasOwn: function (t, p) {
	console.log("Has Own Trap (in reality already removed from spec) bei "+p);
    
    }, 
    getOwnPropertyDescriptor: function (t, p) {
	return [1,2,3,4];
    },
    getOwnPropertyNames: function (t, p) {
	return [2,3,4,5];
    },

    defineProperty: function (t, p) {
    
    },
    get: function (t, p) {
	console.log("get Accessing property "+p);
	return t[p];
    },

    set: function (t, p, v) {
	console.log("set Accessing property "+p);
	return t[p] = v;
    },

    invoke: function (t, p, a) {
	consolelog("Called invoke Trap");
	return t[p].apply(t, a);
    },
    
    deleteProperty: function (t, p) {
    
    },
    
    enumerate: function (t) {
	return ["E","d","w","a","r","d"];
    },
    ownKeys: function (t) {
    
    },
    apply: function (t, ta, al) {
	console.log("callled apply trap");
	return t.apply(ta, al);
    },
    construct: function (t, al) {
	return t.apply(t, al);
    },
    
};

let p;

p = Proxy(o, handler);

// console.log(p.toString());

p.abc = "Hallo";
p.abc;

Object.isExtensible(p);

//p.f = function x() { return 10; };

//p.f();

let obj = {
    name: "Edward",
    age: 307,
    state: undefined,
    getName() {return this.name},
    getAge() {return this.age},
    setState(state) {this.state = state},
    getState() {return this.state}
};

let handler = {
    get: function (A, B, C) {

    },
    set: function (A, B, C) {
    
    },
    invoke: function (A, B, C) {
    
    }
};


let p = new Proxy(handler, obj);
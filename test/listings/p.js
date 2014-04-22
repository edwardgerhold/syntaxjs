let p = new Promise((res, rej) => rej(new TypeError("Hallo")));
p.then(value => print(value));


let e = new Emitter();

let first = name => console.log("name = "+name);

e.on("first", first);

e.emit("first", "Eddie");
e.emit("first", "Puff Daddy");

e.once("first", (name) => {
    console.log("einmal sollte ich nur aufgerufen werden mit Mr. Eins. Hier ist: "+name);
});

e.emit("first", "Mr. Eins");
e.emit("first", "Mr. Zwei");

e.remove("first", first);

e.emit("first", "nach remove von 'first'");

let second = (name) => {
    console.log("2. = "+name);
};

e.once("second", second);
e.on("second", second);
e.on("second", second);
e.emit("second", "dreimal");
e.emit("second", "zweimal");
e.emit("second", "nochmal zweimal");

e.removeAll("second");

console.log("Job Done -- jetzt sollte nichts mehr emittiert werden.. achtung test:");

e.emit("first", "val");
e.emit("second", "val");





if (true) { console.log("Richtig"); }

if (false) { console.log("Falsch"); }

if (false) { console.log("Falsch"); }
else console.log("Richtig");


if (false) console.log("Falsch");
else console.log("Richtig");


if (false) console.log("Falsch");
else { console.log("Richtig"); }

let i = 10;
console.log("i = 10");

if (i === 5) {
    console.log("Falsch bei 5");
} else if (i < 20 && i < 10) {
    console.log("Falsch bei 20 und 10");
} else if (i === 10) {
    console.log("Richtig");
} else {
    console.log("Falsch bei else mit i === 10");
}


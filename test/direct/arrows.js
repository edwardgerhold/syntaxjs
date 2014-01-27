var N = 10;
var a = [];
for(let i = 0, f = () => i * i, a.push(f); i < N; i++) {
  a.push(f);
}
for (let f of a) {
    console.log(f());
}

var memo = {};
function fib(n) {
    console.log("call "+n);
    if (n <= 1) return 1;
    if (memo[n]) return memo[n];
    return (memo[n] = fib(n-1) + fib(n-2));
    
}
console.log(fib(1));
console.log(fib(10));
console.log(fib(20));
console.log(fib(30));
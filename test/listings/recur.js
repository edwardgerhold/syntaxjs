function recur(x) {
    print(x);
    if (x > 0) recur(--x);
}

recur(10);
recur(3);

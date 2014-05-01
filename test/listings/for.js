for (var i = 0; i < 5; i++) {
    if (i === 3) break;
    print(i);
}
print("end " +i);
for (var i = 0; i < 5; i++) {
    if (i < 3) continue;
    print(i);
}
print("end "+i);
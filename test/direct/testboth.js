
var label = "1e5 * isIdentifierPart 9179933 and 917989, -Start 9142, 125:"
console.time(label);
for (var i = 0, j = 1e5; i < j; i++) {
    String.isIdentifierPart(917993);
    String.isIdentifierPart(917989);
    String.isIdentifierStart(9142);
    String.isIdentifierStart(125);
}
console.timeEnd(label);


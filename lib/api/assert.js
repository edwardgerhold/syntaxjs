function Assert(act, message) {
    //var cx;
    if (!act) {
        /* if (cx = getContext()) {
                var line = cx.line;
                var col = cx.column;
                throw new Error("Assertion failed: " + message + " (at: line " + line + ", column " + col + ")");
        }*/
        throw new Error(format("ASSERTION_S", + message));
    }
}

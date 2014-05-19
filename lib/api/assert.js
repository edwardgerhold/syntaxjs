function Assert(act, message) {
    if (!act) throw new Error(format("ASSERTION_S", message));
}


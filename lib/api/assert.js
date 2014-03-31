/**
 * Created by root on 31.03.14.
 */

// ===========================================================================================================
// Assert
// ===========================================================================================================

function Assert(act, message) {
    var cx, node;
    if (!act) {
        if (cx = getContext()) {
            node = cx.state.node;
        }
        if (node) {
            var loc = node.loc;
            if (loc) {
                var line = loc.start.line;
                var col = loc.start.column;
            }
        }
        throw new Error("Assertion failed: " + message + " (at: line " + line + ", column " + col + ")");
    }
}

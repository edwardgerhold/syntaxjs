/**
 * Created by root on 30.04.14.
 */
define("asm.js-bytecode", function (require, exports) {

    "use strict";

    /* win */

    /* ok. What can i do? Generate ASM.js strings and eval(strings) to run fast javascript ?
        - this would require a code generator, another stringification of the syntax tree.
        - question, isn´t it better to reuse the emscripten backend? that would require llvm ir templates
     */

    exports.NULL = 0;

    /* grin */

    /*
        my first idea was to write the heap and to do some stuff they do. I´ve looked into the emscripten papers.
        Practically i would have to rewrite this "engine" here. But think about, the runtime isn´t that big.
        On the other side, i don´t think that i would succeed so soon in optimizing my javascript code itself.
        So i would say at the end, any further comment is childish and i should try, and fail, and do again, however.
     */


    return Object.freeze(exports);
});
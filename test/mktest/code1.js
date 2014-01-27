function F() {
    "use strict";
    this.fault = true;
}
F.prototype = {
    myFault: true,
    yourFault: true,
    theirFault: true
};

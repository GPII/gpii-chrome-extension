(function () {
    "use strict";
    document.documentElement.removeAttribute("data-gpii-hc");
    [].forEach.call(document.querySelectorAll("body *"), function (node) {
        node.removeAttribute("data-gpii-hc");
    });
})();

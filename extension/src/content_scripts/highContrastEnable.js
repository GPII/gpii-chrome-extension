/* global chrome */

(function () {
    "use strict";
    chrome.runtime.sendMessage({type: "requestTheme"}, function (response) {
        document.documentElement.setAttribute("data-gpii-hc", response.theme);
        [].forEach.call(document.querySelectorAll("body *"), function (node) {
            node.setAttribute("data-gpii-hc", response.theme);
        });
        document.documentElement.setAttribute("data-gpii-hc", response.theme);
    });
})();

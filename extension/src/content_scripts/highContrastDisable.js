/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

"use strict";

(function () {
    document.documentElement.removeAttribute("data-gpii-hc");
    [].forEach.call(document.querySelectorAll("body *"), function (node) {
        node.removeAttribute("data-gpii-hc");
    });
})();

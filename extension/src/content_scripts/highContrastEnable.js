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

/* global chrome */
"use strict";

(function () {
    chrome.runtime.sendMessage({type: "requestTheme"}, function (response) {
        document.documentElement.setAttribute("data-gpii-hc", response.theme);
        [].forEach.call(document.querySelectorAll("body *"), function (node) {
            node.setAttribute("data-gpii-hc", response.theme);
        });
        document.documentElement.setAttribute("data-gpii-hc", response.theme);
    });
})();

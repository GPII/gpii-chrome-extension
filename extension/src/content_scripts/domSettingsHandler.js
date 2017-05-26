/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global gpii, chrome */
"use strict";

(function () {
    chrome.runtime.sendMessage({type: "requestSettings"}, function (response) {
        var settings = response.settings;

        var domEnactor = gpii.chrome.domEnactor("body", {
            model: settings
        });
    });
})();

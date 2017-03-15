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

/* global gpii, chrome */
"use strict";

(function () {
    chrome.runtime.sendMessage({type: "requestSettings"}, function (response) {
        var settings = response.settings;
        var rootURL = response.rootURL;

        var body = document.querySelector("body");

        gpii.chrome.domeEnactor(body, {
            model: settings,
            rootURL: rootURL
        });
    });
})();

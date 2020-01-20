/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid, gpii, chrome */
"use strict";

(function ($, fluid) {

    fluid.registerNamespace("gpii.chrome.webInjection");

    gpii.chrome.webInjection.fonts = [{
        fontFamily: "Orator-Icons",
        urls: [chrome.runtime.getURL("fonts/Orator-Icons.woff")]
    }];

    gpii.chrome.webInjection.styleTemplate = "<style>@font-face {font-family: \"%fontFamily\"; src: %src;}</style>";

    // inject fonts
    fluid.each(gpii.chrome.webInjection.fonts, function (fontInfo) {
        var urls = fluid.transform(fluid.makeArray(fontInfo.urls), function (url) {
            return "url(\"" + url + "\")";
        });

        var info = {
            fontFamily: fontInfo.fontFamily,
            src: urls.join(",")
        };

        var styleElm = $(fluid.stringTemplate(gpii.chrome.webInjection.styleTemplate, info));

        $("head").append(styleElm);
    });
})(jQuery, fluid);

// to allow for the pages own instance of jQuery
jQuery.noConflict();

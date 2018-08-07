/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2018 OCAD University
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
        urls: [
            chrome.runtime.getURL("fonts/Orator-Icons.ttf"),
            chrome.runtime.getURL("fonts/Orator-Icons.eot")
        ]
    }];

    // Listed in the order the scripts will appear on the web page
    gpii.chrome.webInjection.scripts = [
        "https://www.youtube.com/iframe_api",
        // chrome.runtime.getURL("dist/ui-options-chrome-webScriptsLib.min.js")
        chrome.runtime.getURL("src/captionsEnactor.js")
    ];

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

    // inject scripts
    fluid.each(gpii.chrome.webInjection.scripts.reverse(), function (src) {
        var existingScript = $("script[src=\"" + src + "\"]");

        // if the script doesn't already exist on the page, inject it.
        if (existingScript.length === 0) {
            var script = $("<script>").attr("src", src);
            $("script").eq(0).before(script);
        }
    });


})(jQuery, fluid);

// to allow for the pages own instance of jQuery
jQuery.noConflict();

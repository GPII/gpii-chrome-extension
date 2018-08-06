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

fluid.registerNamespace("gpii.chrome.fontInjection");

gpii.chrome.fontInjection.fonts = [{
    fontFamily: "Orator-Icons",
    urls: [
        chrome.runtime.getURL("fonts/Orator-Icons.ttf"),
        chrome.runtime.getURL("fonts/Orator-Icons.eot")
    ]
}];

gpii.chrome.fontInjection.styleTemplate = "<style>@font-face {font-family: \"%fontFamily\"; src: %src;}</style>";

fluid.each(gpii.chrome.fontInjection.fonts, function (fontInfo) {
    var urls = fluid.transform(fluid.makeArray(fontInfo.urls), function (url) {
        return "url(\"" + url + "\")";
    });

    var info = {
        fontFamily: fontInfo.fontFamily,
        src: urls.join(",")
    };

    var styleElm = $(fluid.stringTemplate(gpii.chrome.fontInjection.styleTemplate, info));

    $("head").append(styleElm);
});

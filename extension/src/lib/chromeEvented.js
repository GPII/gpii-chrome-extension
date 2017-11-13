/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, require */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

fluid.defaults("gpii.chrome.eventedComponent", {
    gradeNames: ["fluid.component"],
    // The left hand side is the name of a chrome event. Must be the full path to a valid chrome event.
    // The right hand side is the component event to be called from the corresponding chrome event handler.
    eventRelayMap: {
        // "chromeEventName": "componentEventName"
    },
    listeners: {
        "onCreate.bindListeners": {
            funcName: "gpii.chrome.eventedComponent.processEventRelay",
            args: "{that}"
        },
        "onDestroy.unbindListeners": {
            funcName: "gpii.chrome.eventedComponent.processEventRelay",
            args: ["{that}", true]
        }
    }
});

gpii.chrome.eventedComponent.processEventRelay = function (that, remove) {
    fluid.each(that.options.eventRelayMap, function (componentEventName, chromeEventName) {
        var chromeEvent = fluid.getGlobalValue(chromeEventName);
        var chromeEventFunc = chromeEvent[remove ? "removeListener" : "addListener"];
        chromeEventFunc.call(chromeEvent, that.events[componentEventName].fire);
    });
};

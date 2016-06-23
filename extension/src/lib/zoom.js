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

/* eslint-env node */
/* global fluid, require */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.zoom", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    model: {
        magnifierEnabled: false,
        magnification: 1
    },
    events: {
        onError: null
    },
    invokers: {
        applyZoomSettings: {
            funcName: "gpii.chrome.zoom.applyZoomSettings",
            args: ["{that}"]
        },
        applyZoomInTab: {
            funcName: "gpii.chrome.zoom.applyZoomInTab",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        updateTab: {
            funcName: "gpii.chrome.zoom.updateTab",
            args: ["{that}", "{arguments}.0"]
        }
    },
    modelListeners: {
        "zoom.modelChanged": {
            path: ["magnifierEnabled", "magnification"],
            funcName: "{that}.applyZoomSettings",
            args: "{that}",
            excludeSource: "init"
        }
    },
    listeners: {
        onTabOpened: {
            funcName: "{that}.updateTab",
            args: "{arguments}.0"
        },
        onTabUpdated: {
            funcName: "{that}.updateTab",
            args: "{arguments}.2"
        }
    }
});

gpii.chrome.zoom.applyZoomInTab = function (that, tab, value) {
    chrome.tabs.setZoom(tab.id, value, function () {
        if (chrome.runtime.lastError) {
            fluid.log("Could not apply zoom in tab'",
                      tab.url, "', error was: ",
                      chrome.runtime.lastError.message);
            that.events.onError.fire(chrome.runtime.lastError);
        }
    });
};

gpii.chrome.zoom.applyZoomSettings = function (that) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
    // Iterate over all tabs and set the zoom factor
    chrome.tabs.query({}, function (tabs) {
        fluid.each(tabs, function (tab) {
            that.applyZoomInTab(tab, value);
        });
    });
};

gpii.chrome.zoom.updateTab = function (that, tab) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
    that.applyZoomInTab(tab, value);
};

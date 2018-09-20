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
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

fluid.defaults("gpii.chrome.zoom", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    model: {
        magnifierEnabled: false,
        magnification: 1
    },
    events: {
        onError: null,
        onTabOpened: null,
        onTabUpdated: null,
        onWindowFocusChanged: null
    },
    eventRelayMap: {
        "chrome.tabs.onCreated": "onTabOpened",
        "chrome.tabs.onUpdated": "onTabUpdated",
        "chrome.windows.onFocusChanged": "onWindowFocusChanged"
    },
    invokers: {
        applyZoomSettings: {
            funcName: "gpii.chrome.zoom.applyZoomSettings",
            args: "{that}"
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
            funcName: "{that}.applyZoomSettings"
        }
    },
    listeners: {
        "onTabOpened.setupTab": {
            funcName: "{that}.updateTab",
            args: "{arguments}.0"
        },
        "onTabUpdated.setupTab": {
            funcName: "{that}.updateTab",
            args: "{arguments}.2"
        },
        "onWindowFocusChanged.applyZoomSettings": "{that}.applyZoomSettings"
    },
    members: {
        magnifierChanged: false
    }
});

gpii.chrome.zoom.applyZoomInTab = function (that, tab, value) {
    if (that.magnifierChanged) {
        // set the zoom value if it hasn't already been set.
        chrome.tabs.getZoom(tab.id, function (currentZoom) {
            if (currentZoom !== value) {
                chrome.tabs.setZoom(tab.id, value, function () {
                    if (chrome.runtime.lastError) {
                        fluid.log("Could not apply zoom in tab'",
                            tab.url, "', error was: ",
                            chrome.runtime.lastError.message);
                        that.events.onError.fire(chrome.runtime.lastError);
                    }
                });
            }
        });
    }
};

gpii.chrome.zoom.applyZoomSettings = function (that) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
    if (value !== 1) {
        that.magnifierChanged = true;
    }
    // Iterate over all tabs in the current window and set the zoom factor
    // Only changing in the current window to address cases where changing the
    // zoom level in other windows causes it to gain focus. See: https://issues.gpii.net/browse/GPII-2525
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        fluid.each(tabs, function (tab) {
            that.applyZoomInTab(tab, value);
        });
    });
};

gpii.chrome.zoom.updateTab = function (that, tab) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
    that.applyZoomInTab(tab, value);
};

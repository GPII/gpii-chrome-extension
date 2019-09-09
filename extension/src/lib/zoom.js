/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md.
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

/*
 * `gpii.chrome.zome` sets the browser zoom. This can be used for enacting preferences such as magnification or
 * font size. The browser zoom updates tabs in the currently focused window, updated tabs, created tabs, and tabs in
 * other windows as they become focused.
 *
 * In addition to being able to set zoom from a preference set or editor, the zoom factor can be retrieved from the
 * onZoomChanged event. This allows for a user to set the zoom using the browsers built in mechanisms and propagate
 * that change to other tabs. See https://issues.gpii.net/browse/GPII-3386
 */

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
        onTabActivated: null,
        onWindowFocusChanged: null,
        onZoomChanged: null
    },
    eventRelayMap: {
        "chrome.tabs.onCreated": "onTabOpened",
        "chrome.tabs.onUpdated": "onTabUpdated",
        "chrome.tabs.onActivated": "onTabActivated",
        "chrome.tabs.onZoomChange": "onZoomChanged",
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
            funcName: "{that}.applyZoomSettings",
            excludeSource: ["onZoomChanged"]
        }
    },
    listeners: {
        "onTabOpened.applyZoom": "{that}.updateTab",
        "onTabUpdated.applyZoom": {
            funcName: "{that}.updateTab",
            args: "{arguments}.2"
        },
        "onTabActivated.applyZoom": "{that}.updateTab",
        "onWindowFocusChanged.applyZoomSettings": "{that}.applyZoomSettings",
        "onZoomChanged.updateMagnification": {
            funcName: "gpii.chrome.zoom.updateFromZoomChange",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

gpii.chrome.zoom.updateFromZoomChange = function (that, ZoomChangeInfo) {
    // Only fire the onZoomChanged event if the Zoom factor is actually different.
    // This is necessary because chrome will fire its onZoomChange event when a new tab or window is opened;
    // with old and new zoom factors of 0. If this check isn't present, all pages will be reset.
    if (ZoomChangeInfo.oldZoomFactor !== ZoomChangeInfo.newZoomFactor) {
        that.applier.change("magnification", ZoomChangeInfo.newZoomFactor, "ADD", "onZoomChanged");
    }
};

gpii.chrome.zoom.applyZoomInTab = function (that, tab, value) {
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
};

gpii.chrome.zoom.applyZoomSettings = function (that) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
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

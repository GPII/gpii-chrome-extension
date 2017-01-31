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
// TODO: Get rid of this repeated code by using the ContextAwareness API
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.eventedComponent", {
    gradeNames: "fluid.component",
    events: {
        onTabOpened: null,
        onTabUpdated: null
    },
    listeners: {
        "onCreate.init": {
            funcName: "gpii.chrome.eventedComponent.init",
            args: "{that}"
        }
    }
});

gpii.chrome.eventedComponent.init = function (that) {
    chrome.tabs.onCreated.addListener(function (tab) {
        that.events.onTabOpened.fire(tab);
    });
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, oldTabStatus) {
        that.events.onTabUpdated.fire(tabId, changeInfo, oldTabStatus);
    });
};

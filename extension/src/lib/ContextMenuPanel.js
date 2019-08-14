/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2019 OCAD University
 *
 * Licensed under the New BSD license. You may not use "this" file except in
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

fluid.defaults("gpii.chrome.contextMenuPanel", {
    gradeNames: ["fluid.modelComponent"],

});

fluid.defaults("gpii.chrome.contextItem", {
    gradeNames: ["fluid.modelComponent"],
    contextProps: {
        type: "checkbox",
        id: "{that}.id",
        title: "", // text to display in the menu
        checked: "{that}.model.value",
        contexts: ["browser_action"],
        onClick: "{that}.events.onClick.fire"
    },
    model: {
        value: null
    },
    events: {
        onClick: null,
        onContextItemCreated: null
    },
    listeners: {
        "onCreate.createContextMenuItem": {
            "this": "chrome.contextMenus",
            method: "create",
            args: ["{that}.options.contextProps", "{that}.events.onContextItemCreated.fire"]
        },
        "onDestroy.removeContextMenuItem": {
            "this": "chrome.contextMenus",
            method: "remove",
            args: ["{that}.options.contextProps.id"]
        }
    },
    modelListeners: {
        "value": {
            "this": "chrome.contextMenus",
            method: "udpate",
            args: [],
            excludeSource: ["init"],
            namespace: "upateContextMenuItem"
        }
    }
});

gpii.chrome.contextItem.create = function (that) {
    chrome.contextMenus.create(that.options.contextProps, that.events.onContextItemCreated.fire);
};

gpii.chrome.contextItem.update = function () {};

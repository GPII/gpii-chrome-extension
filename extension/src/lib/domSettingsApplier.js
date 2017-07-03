/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

// This component makes use of css/Enactor.css to perform the adaptations
// of the web content, and this is done through chrome.tabs.executeScript.
//
fluid.defaults("gpii.chrome.domSettingsApplier", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    domSettingsHandler: "content_scripts/domSettingsHandler.js",
    events: {
        onConnect: null
    },
    model: {
        // Accepted model values:
        // contrastTheme: string,
        // lineSpace: number,    // the multiplier to the current line space
        // inputsLarger: boolean,
        // selectionTheme: string,
        // simplifiedUiEnabled: boolean,
        // tableOfContents: boolean
    },
    listeners: {
        "onCreate.bindOnConnect": {
            "this": "chrome.runtime.onConnect",
            method: "addListener",
            args: "{that}.events.onConnect.fire"
        }
    },
    dynamicComponents: {
        port: {
            type: "gpii.chrome.portConnection",
            createOnEvent: "onConnect",
            options: {
                model: "{domSettingsApplier}.model",
                port: "{arguments}.0"
            }
        }
    }
});

fluid.defaults("gpii.chrome.portConnection", {
    gradeNames: ["fluid.modelComponent"],
    // TODO: When FLUID-5912 is fixed, move port to the members block.
    //       https://issues.fluidproject.org/browse/FLUID-5912
    port: null, // must be supplied by integrator
    events: {
        onDisconnect: null,
        onMessage: null
    },
    listeners: {
        "onCreate.bindDisconnect": {
            "this": "{that}.options.port.onDisconnect",
            method: "addListener",
            args: ["{that}.destroy"]
        },
        "onCreate.bindToPortEvents": {
            funcName: "gpii.chrome.portConnection.bindToPortEvents",
            args: ["{that}", "{that}.options.port"]
        },
        "onDisconnect.destroy": "{that}.destroy",
        "onMessage.updateModel": "{that}.updateModel"
    },
    modelListeners: {
        "": {
            "this": "{that}.options.port",
            method: "postMessage",
            args: ["{that}.model"]
        }
    },
    invokers: {
        updateModel: {
            changePath: "",
            value: "{arguments}.0"
        }
    }
});

gpii.chrome.portConnection.bindToPortEvents = function (that, port) {
    port.onDisconnect.addListener(that.events.onDisconnect.fire);
    port.onMessage.addListener(that.events.onMessage.fire);
};

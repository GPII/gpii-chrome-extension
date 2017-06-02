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

fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

// This component makes use of css/Enactor.css to perform the adaptations
// of the web content, and this is done through chrome.tabs.executeScript.
//
fluid.defaults("gpii.chrome.domSettingsApplier", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    domSettingsHandler: "content_scripts/domSettingsHandler.js",
    updatedTabScriptOptions: {
        runAt: "document_end"
    },
    events: {
        onConnect: null
    },
    model: {
        // highContrastEnabled: boolean,
        // highContrastTheme: string,
        // lineSpace: number,    // the multiplier to the current line space
        // inputsLarger: boolean,
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
            type: "fluid.modelComponent",
            createOnEvent: "onConnect",
            options: {
                model: "{domSettingsApplier}.model",
                // TODO: When FLUID-5912 is fixed, move port to the members block.
                //       https://issues.fluidproject.org/browse/FLUID-5912
                port: "{arguments}.0",
                listeners: {
                    "onCreate.bindDisconnect": {
                        "this": "{that}.options.port.onDisconnect",
                        method: "addListener",
                        args: ["{that}.destroy"]
                    }
                },
                modelListeners: {
                    "": {
                        "this": "{that}.options.port",
                        method: "postMessage",
                        args: ["{that}.model"]
                    }
                }
            }
        }
    }
});

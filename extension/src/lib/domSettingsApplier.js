/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017-2018 OCAD University
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
    eventRelayMap: {
        "chrome.runtime.onConnect": "onConnect"
    },
    model: {
        // Accepted model values:
        // settings.contrastTheme: string,
        // settings.lineSpace: number,    // the multiplier to the current line space
        // settings.characterSpace: number,
        // settings.inputsLarger: boolean,
        // settings.selectionTheme: string,
        // settings.simplifiedUiEnabled: boolean,
        // settings.tableOfContentsEnabled: boolean,
        // settings.selfVoicingEnabled: boolean,
        // settings.syllabificationEnabled: boolean,
        // settings.captionsEnabled: boolean
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
    gradeNames: ["gpii.chrome.portBinding", "fluid.modelComponent"],
    // TODO: When FLUID-5912 is fixed, move port to the members block.
    //       https://issues.fluidproject.org/browse/FLUID-5912
    port: null, // must be supplied by integrator
    invokers: {
        setPort: {
            funcName: "fluid.identity",
            args: ["{that}.options.port"]
        },
        handleWrite: {
            funcName: "gpii.chrome.portConnection.updateModel",
            args: ["{that}", "{arguments}.0.payload"]
        },
        handleRead: {
            funcName: "fluid.identity",
            args: ["{that}.model"]
        }
    },
    listeners: {
        "onDisconnect.destroy": "{that}.destroy"
    },
    modelListeners: {
        "": {
            func: "{that}.write",
            args: ["{that}.model"]
        }
    }
});

gpii.chrome.portConnection.updateModel = function (that, model) {
    var transaction = that.applier.initiate();
    transaction.fireChangeRequest({path: "", type: "DELETE"});
    transaction.change("", model);
    transaction.commit();
};

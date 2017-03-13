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
/* global fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

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
        onMessage: null,
        onError: null
    },
    model: {
        // highContrastEnabled: boolean,
        // highContrastTheme: string,
        // textSize: number    // the multiplier to the current font size
        // lineSpace: number,    // the multiplier to the current line space
        // inputsLarger: boolean,
        // tableOfContents: boolean
    },
    invokers: {
        formatScript: {
            funcName: "gpii.chrome.domSettingsApplier.formatScript",
            args: ["{that}", "{arguments}.0"]
        },
        executeScriptInTab: {
            funcName: "gpii.chrome.domSettingsApplier.executeScriptInTab",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        executeScriptInAllTabs: {
            funcName: "gpii.chrome.domSettingsApplier.executeScriptInAllTabs",
            args: "{that}"
        }
    },
    modelListeners: {
        "": {
            listener: "gpii.chrome.domSettingsApplier.executeScriptInAllTabs",
            args: "{that}",
            excludeSource: "init"
        }
    },
    listeners: {
        "onCreate.populate": {
            funcName: "gpii.chrome.domSettingsApplier.populate",
            args: "{that}"
        },
        "onTabOpened.setupTab": {
            func: "{that}.executeScriptInTab",
            args: ["{arguments}.0", "{that}.options.updatedTabScriptOptions"]
        },
        "onTabUpdated.setupTab": {
            func: "{that}.executeScriptInTab",
            args: ["{arguments}.2", "{that}.options.updatedTabScriptOptions"]
        },
        "onMessage.respond": {
            funcName: "gpii.chrome.domSettingsApplier.respondToMessage",
            args: ["{that}.model", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    }
});

gpii.chrome.domSettingsApplier.respondToMessage = function (settings, request, sender, sendResponse) {
    if (request.type === "requestSettings") {
        sendResponse({
            settings: settings
        });
    }
};

gpii.chrome.domSettingsApplier.populate = function (that) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        that.events.onMessage.fire(request, sender, sendResponse);
    });
};

gpii.chrome.domSettingsApplier.formatScript = function (that, options) {
    var script = {
        file: that.options.domSettingsHandler,
        allFrames: true
    };
    fluid.extend(script, options);
    return script;
};

gpii.chrome.domSettingsApplier.executeScriptInTab = function (that, tab, options) {
    if (tab.url === undefined || tab.status !== "complete") {
        return;
    }

    var script = that.formatScript(options);
    chrome.tabs.executeScript(tab.id, script, function () {
        if (chrome.runtime.lastError) {
            fluid.log("Could not apply highContrast in tab '",
            tab.url, "', error was: ",
            chrome.runtime.lastError.message);
            that.events.onError.fire(chrome.runtime.lastError);
        }
    });
};

gpii.chrome.domSettingsApplier.executeScriptInAllTabs = function (that) {
    chrome.tabs.query({}, function (tabs) {
        fluid.each(tabs, function (tab) {
            that.executeScriptInTab(tab);
        });
    });
};

/* eslint-env node */
/* global fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

// This component makes use of css/highContrast.css to perform the adaptations
// of the web content, and this is done through chrome.tabs.executeScript.
//
fluid.defaults("gpii.chrome.highContrast", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    enableScript: "content_scripts/highContrastEnable.js",
    disableScript: "content_scripts/highContrastDisable.js",
    updatedTabScriptOptions: {
        runAt: "document_end"
    },
    events: {
        onMessage: null,
        onError: null
    },
    model: {
        highContrastEnabled: undefined,
        highContrastTheme: undefined
    },
    invokers: {
        formatScript: {
            funcName: "gpii.chrome.highContrast.formatScript",
            args: "{that}"
        },
        executeScriptInTab: {
            funcName: "gpii.chrome.highContrast.executeScriptInTab",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        executeScriptInAllTabs: {
            funcName: "gpii.chrome.highContrast.executeScriptInAllTabs",
            args: "{that}"
        }
    },
    modelListeners: {
        "highContrast.modelChanged": {
            path: ["highContrastEnabled", "highContrastTheme"],
            funcName: "gpii.chrome.highContrast.executeScriptInAllTabs",
            args: "{that}",
            excludeSource: "init"
        }
    },
    listeners: {
        onCreate: {
            funcName: "gpii.chrome.highContrast.populate",
            args: "{that}"
        },
        onTabOpened: {
            func: "{that}.executeScriptInTab",
            args: ["{arguments}.0", "{that}.options.updatedTabScriptOptions"]
        },
        onTabUpdated: {
            func: "{that}.executeScriptInTab",
            args: ["{arguments}.2", "{that}.options.updatedTabScriptOptions"]
        },
        onMessage: {
            funcName: "gpii.chrome.highContrast.respondToMessage",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    }
});

gpii.chrome.highContrast.respondToMessage = function (that, request, sender, sendResponse) {
    if (request.type === "requestTheme") {
        sendResponse({theme: that.model.highContrastTheme});
    }
};

gpii.chrome.highContrast.populate = function (that) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        that.events.onMessage.fire(request, sender, sendResponse);
    });
};

gpii.chrome.highContrast.formatScript = function (that, options) {
    var script = {
        file: that.model.highContrastEnabled ? that.options.enableScript : that.options.disableScript,
        allFrames: true
    };
    fluid.extend(script, options);
    return script;
};

gpii.chrome.highContrast.executeScriptInTab = function (that, tab, options) {
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

gpii.chrome.highContrast.executeScriptInAllTabs = function (that) {
    chrome.tabs.query({}, function (tabs) {
        fluid.each(tabs, function (tab) {
            that.executeScriptInTab(tab);
        });
    });
};

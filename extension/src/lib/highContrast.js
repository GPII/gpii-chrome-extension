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
    scriptTemplate: "document.documentElement.setAttribute('data-gpii-hc','__THEME__');" +
                    "[].forEach.call(document.querySelectorAll('body *'), function(node) {" +
                        "node.setAttribute('data-gpii-hc', '__THEME__');" +
                    "});" +
                    "document.documentElement.setAttribute('data-gpii-hc', '__THEME__');",
    disableScript: "document.documentElement.removeAttribute('data-gpii-hc');" +
                    "[].forEach.call(document.querySelectorAll('body *'), function(node) {" +
                        "node.removeAttribute('data-gpii-hc');" +
                    "});",
    commonToPlatform: {
        highContrastTheme: {
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "highContrastTheme",
                defaultInputValue: "black-white",
                options: {
                    "black-white": {
                        outputValue: "bw"
                    },
                    "white-black": {
                        outputValue: "wb"
                    },
                    "black-yellow": {
                        outputValue: "by"
                    },
                    "yellow-black": {
                        outputValue: "yb"
                    }
                }
            }
        }
    },
    model: {
        highContrastEnabled: undefined,
        highContrastTheme: undefined
    },
    invokers: {
        formatScript: {
            funcName: "gpii.chrome.highContrast.formatScript",
            args: "{that}"
        }
    },
    modelListeners: {
        "*": {
            funcName: "gpii.chrome.highContrast.modelChanged",
            args: "{that}",
            excludeSource: "init"
        }
    },
    listeners: {
        onTabOpened: {
            funcName: "gpii.chrome.highContrast.updateTab",
            args: ["{that}", "{arguments}.0"]
        },
        onTabUpdated: {
            funcName: "gpii.chrome.highContrast.updateTab",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

gpii.chrome.highContrast.formatScript = function (that) {
    var script;
    if (that.model.highContrastEnabled) {
        var theme = fluid.model.transformWithRules(that.model, that.options.commonToPlatform);
        script = that.options.scriptTemplate.replace(/__THEME__/g, theme.highContrastTheme);
    } else {
        script = that.options.disableScript;
    }
    return script;
};

gpii.chrome.highContrast.executeScriptInTab = function (tab, script) {
    chrome.tabs.executeScript(tab.id, {code: script}, function () {
        if (chrome.runtime.lastError) {
            console.log("Could not apply highContrast in tab '" +
            tab.url + "', error was: " +
            chrome.runtime.lastError.message);
        }
    });
};

gpii.chrome.highContrast.executeScriptInAllTabs = function (script) {
    chrome.tabs.query({}, function (tabs) {
        fluid.each(tabs, function (tab) {
            gpii.chrome.highContrast.executeScriptInTab(tab, script);
        });
    });
};

gpii.chrome.highContrast.modelChanged = function (that) {
    var script = that.formatScript();
    gpii.chrome.highContrast.executeScriptInAllTabs(script);
};

gpii.chrome.highContrast.updateTab = function (that, tab) {
    var script = that.formatScript();
    gpii.chrome.highContrast.executeScriptInTab(tab, script);
};

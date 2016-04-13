/*globals fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

// This component makes use of css/highContrast.css to perform the adaptations
// of the web content, and this is done through chrome.tabs.executeScript.
//
fluid.defaults("gpii.chrome.highContrast", {
    gradeNames: ["fluid.modelComponent"],
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
    modelListeners: {
        "*": {
            funcName: "gpii.chrome.highContrast.modelChanged",
            args: "{that}",
            excludeSource: "init"
        }
    }
});

gpii.chrome.highContrast.modelChanged = function (that) {
    if (that.model.highContrastEnabled) {
        var theme = fluid.model.transformWithRules(that.model, that.options.commonToPlatform);
        var script = that.options.scriptTemplate.replace(/__THEME__/g, theme.highContrastTheme);

        chrome.tabs.query({}, function (tabs) {
            fluid.each(tabs, function (tab) {
                chrome.tabs.executeScript(tab.id, {code: script}, function() {
                    if (chrome.runtime.lastError) {
                        console.log("Could not apply highContrast in tab '" +
                        tab.url + "', error was: " +
                        chrome.runtime.lastError.message);
                    }
                });
            });
        });
    } else {
        chrome.tabs.query({}, function (tabs) {
            fluid.each(tabs, function (tab) {
                chrome.tabs.executeScript(tab.id, {code: that.options.disableScript}, function() {
                    if (chrome.runtime.lastError) {
                        console.log("Could not remove highContrast from tab '" +
                        tab.url + "', error was: " +
                        chrome.runtime.lastError.message);
                    }
                });
            });
        });
    }
};

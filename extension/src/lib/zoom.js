/*globals fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.zoom", {
    gradeNames: "fluid.modelComponent",
    model: {
        magnifierEnabled: false,
        magnification: 1
    },
    invokers: {
        set: {
            funcName: "gpii.chrome.zoom.set",
            args: "{arguments}.0"
        }
    },
    modelListeners: {
        "*": {
            funcName: "gpii.chrome.zoom.modelChanged",
            args: "{that}",
            excludeSource: "init"
        }
    }
});

gpii.chrome.zoom.modelChanged = function (that) {
    if(that.model.magnifierEnabled) {
        that.set(that.model.magnification);
    } else { // set back to default zoom value
        that.set(1);
    }
};

gpii.chrome.zoom.set = function (value) {
    // Iterate over all tabs and set the zoom factor
    chrome.tabs.query({}, function (tabs) {
        fluid.each(tabs, function (tab) {
            chrome.tabs.setZoom(tab.id, value, function () {
                if (chrome.runtime.lastError) {
                    console.log("Could not apply zoom in tab '" +
                    tab.url + "', error was: " +
                    chrome.runtime.lastError.message);
                }
            });
        });
    });
};

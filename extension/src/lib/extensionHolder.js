/*globals fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.extensionHolder", {
    gradeNames: "fluid.modelComponent",
    extensionId: "",
    members: {
        extensionInstance: null
    },
    model: {
        extensionEnabled: undefined
    },
    invokers: {
        switch: {
            funcName: "gpii.chrome.extensionHolder.switch",
            args: ["{that}", "{arguments}.1"]
        }
    },
    listeners: {
        onCreate: {
            funcName: "gpii.chrome.extensionHolder.populate",
            args: "{that}"
        }
    },
    modelListeners: {
        extensionEnabled: {
            func: "{that}.switch",
            args: "{that}",
            excludeSource: "init"
        }
    }
});

gpii.chrome.extensionHolder.populate = function (that) {
    chrome.management.get(that.options.extensionId, function (extInfo) {
        that.extensionInstance = extInfo;
        that.applier.change("extensionEnabled", that.extensionInstance.enabled);
    });
};

gpii.chrome.extensionHolder.switch = function (that) {
    that.extensionInstance.enabled = that.model.extensionEnabled;
    chrome.management.setEnabled(that.extensionInstance.id, that.model.extensionEnabled, function () {
        // TODO: What can go wrong here?
    });
};

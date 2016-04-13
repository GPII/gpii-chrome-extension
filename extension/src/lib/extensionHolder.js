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
        setEnabled: {
            funcName: "gpii.chrome.extensionHolder.setEnabled",
            args: ["{that}", "{arguments}.1"]
        },
        getEnabled: {
            funcName: "gpii.chrome.extensionHolder.getEnabled",
            args: "{that}.extensionInstance"
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
            func: "{that}.setEnabled",
            args: "{that}",
            excludeSource: "init"
        }
    }
});

gpii.chrome.extensionHolder.populate = function (that) {
    chrome.management.get(that.options.extensionId, function (extInfo) {
        that.extensionInstance = extInfo;
        that.applier.change("extensionEnabled", that.getEnabled());
    });
};

gpii.chrome.extensionHolder.getEnabled = function (extension) {
    return extension.enabled;
};

gpii.chrome.extensionHolder.setEnabled = function (that) {
    that.extensionInstance.enabled = that.model.extensionEnabled;
    chrome.management.setEnabled(that.extensionInstance.id, that.model.extensionEnabled, function () {
        // TODO: What can go wrong here?
    });
};

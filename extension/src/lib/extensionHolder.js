/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
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

fluid.defaults("gpii.chrome.extensionHolder", {
    gradeNames: "fluid.modelComponent",
    extensionId: "",
    name: "",
    installationUrl: "",
    members: {
        extensionInstance: null
    },
    events: {
        onError: null,
        onExtensionMissing: null,
        onSetEnabled: null,
        onExtInstalled: null,
        onExtUninstalled: null,
        onExtEnabled: null,
        onExtDisabled: null
    },
    model: {
        extensionEnabled: undefined
    },
    invokers: {
        updateEnabledStatus: {
            funcName: "gpii.chrome.extensionHolder.updateEnabledStatus",
            args: "{that}"
        },
        updateModel: {
            changePath: "extensionEnabled",
            value: "{arguments}.0"
        },
        populate: {
            funcName: "gpii.chrome.extensionHolder.populate",
            args: ["{that}", "{arguments}.0"]
        },
        unpopulate: {
            funcName: "gpii.chrome.extensionHolder.unpopulate",
            args: ["{that}"]
        }
    },
    listeners: {
        "onCreate.bindChromeEvents": {
            listener: "gpii.chrome.extensionHolder.bindChromeEvents",
            args: "{that}"
        },
        "onCreate.populate": {
            listener: "{that}.populate",
            args: [true],
            priority: "after:bindChromeEvents"
        },
        "onSetEnabled.complete": {
            listener: "gpii.chrome.extensionHolder.setEnabledComplete",
            args: "{that}"
        },
        "onExtInstalled.populate": {
            listener: "{that}.populate",
            args: [false]
        },
        "onExtUninstalled.unpopulate": {
            listener: "{that}.unpopulate"
        },
        "onError.translateToOnExtensionMissing": {
            listener: "gpii.chrome.extensionHolder.translateToOnExtensionMissing",
            args: ["{that}", "{arguments}.0"]
        }
    },
    modelListeners: {
        extensionEnabled: {
            func: "{that}.updateEnabledStatus",
            excludeSource: "init"
        }
    }
});

gpii.chrome.extensionHolder.bindChromeEvents = function (that) {
    chrome.management.onInstalled.addListener(function (extInfo) {
        if (extInfo.id === that.options.extensionId) {
            that.events.onExtInstalled.fire(extInfo);
        }
    });
    chrome.management.onUninstalled.addListener(function (id) {
        if (id === that.options.extensionId) {
            that.events.onExtUninstalled.fire(id);
        }
    });
    chrome.management.onEnabled.addListener(function (extInfo) {
        if (extInfo.id === that.options.extensionId) {
            that.events.onExtEnabled.fire(extInfo);
        }
    });
    chrome.management.onDisabled.addListener(function (extInfo) {
        if (extInfo.id === that.options.extensionId) {
            that.events.onExtDisabled.fire(extInfo);
        }
    });
};

gpii.chrome.extensionHolder.unpopulate = function (that) {
    // clear out any partial or old extension instance
    that.extensionInstance = undefined;
    // remove events when no extension instance present
    that.events.onExtDisabled.removeListener("updateModel");
    that.events.onExtEnabled.removeListener("updateModel");
};

gpii.chrome.extensionHolder.populate = function (that, useExtensionState) {
    chrome.management.get(that.options.extensionId, function (extInfo) {
        if (chrome.runtime.lastError) {
            that.unpopulate();
            fluid.log(fluid.logLevel.FAIL,
                      "Could not get extensionInfo, error was:",
                      chrome.runtime.lastError.message);
            that.events.onError.fire(chrome.runtime.lastError);
        } else {
            that.extensionInstance = extInfo;
            // Manually binding the events because the onEnabled event is fired
            // with onInstall. We want to ignore that initial onEnabled event
            // otherwise the event handler will update the model.
            that.events.onExtDisabled.addListener(function () {
                that.updateModel(false);
            }, "updateModel");
            that.events.onExtEnabled.addListener(function () {
                that.updateModel(true);
            }, "updateModel");

            if (useExtensionState) {
                that.updateModel(that.extensionInstance.enabled);
            } else {
                that.updateEnabledStatus();
            }
        }
    });
};

gpii.chrome.extensionHolder.updateEnabledStatus = function (that) {
    if (that.extensionInstance) {
        that.extensionInstance.enabled = that.model.extensionEnabled;
        chrome.management.setEnabled(that.extensionInstance.id, that.model.extensionEnabled, that.events.onSetEnabled.fire);
    } else if (that.model.extensionEnabled) {
        that.events.onExtensionMissing.fire();
    }
};

gpii.chrome.extensionHolder.setEnabledComplete = function (that) {
    // Only fire the error if an error, it is enabled, and an extension instance exists
    // This condition is needed because it will through two errors when removing an enabled extension through
    // the chrome interface. It first fires a onDisabled then an onUninstalled event.
    if (chrome.runtime.lastError && !that.model.extensionEnabled && !that.extensionInstance) {
        fluid.log(fluid.logLevel.FAIL,
                  "Could not enable extension, error was:",
                  chrome.runtime.lastError.message);
        that.events.onError.fire(chrome.runtime.lastError);
    };
};

gpii.chrome.extensionHolder.translateToOnExtensionMissing = function (that, error) {
    if (error.message === "Failed to find extension with id " + that.options.extensionId + ".") {
        that.events.onExtensionMissing.fire();
    }
};

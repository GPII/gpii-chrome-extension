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
        setup: {
            funcName: "gpii.chrome.extensionHolder.setup",
            args: ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        "onCreate.bindChromeEvents": {
            listener: "gpii.chrome.extensionHolder.bindChromeEvents",
            args: "{that}"
        },
        "onCreate.populate": {
            funcName: "gpii.chrome.extensionHolder.populate",
            args: "{that}",
            priority: "after:bindChromeEvents"
        },
        "onSetEnabled.complete": {
            funcName: "gpii.chrome.extensionHolder.setEnabledComplete",
            args: "{that}"
        },
        "onExtInstalled.populate": {
            funcName: "gpii.chrome.extensionHolder.populate",
            args: "{that}"
        },
        "onExtUninstalled.populate": {
            funcName: "gpii.chrome.extensionHolder.populate",
            args: "{that}"
        },
        "onExtDisabled.updateModel": {
            changePath: "extensionEnabled",
            value: false,
            source: "chrome"
        },
        "onExtEnabled.updateModel": {
            changePath: "extensionEnabled",
            value: true,
            source: "chrome"
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

gpii.chrome.extensionHolder.setup = function (that, extInfo) {
    if (chrome.runtime.lastError) {
        // clear out any partial or old extension instance
        that.extensionInstance = undefined;
        fluid.log(fluid.logLevel.FAIL,
                  "Could not get extensionInfo, error was:",
                  chrome.runtime.lastError.message);
        that.events.onError.fire(chrome.runtime.lastError);
    } else {
        that.extensionInstance = extInfo;
        that.updateEnabledStatus();
    }
};

gpii.chrome.extensionHolder.populate = function (that) {
    chrome.management.get(that.options.extensionId, that.setup);
};

gpii.chrome.extensionHolder.updateEnabledStatus = function (that) {
    that.extensionInstance.enabled = that.model.extensionEnabled;
    chrome.management.setEnabled(that.extensionInstance.id, that.model.extensionEnabled, that.events.onSetEnabled.fire);
};

gpii.chrome.extensionHolder.setEnabledComplete = function (that) {
    if (chrome.runtime.lastError) {
        fluid.log(fluid.logLevel.FAIL,
                  "Could not enable extension, error was:",
                  chrome.runtime.lastError.message);
        that.events.onError.fire(chrome.runtime.lastError);
    };
};

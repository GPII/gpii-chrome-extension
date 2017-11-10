/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, require */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

fluid.defaults("gpii.chrome.notification", {
    gradeNames: "fluid.modelComponent",
    members: {
        // must be supplied by an integrator
        messageData: {},
        notificationID: {
            expander: {
                funcName: "fluid.allocateGuid"
            }
        }
    },
    strings: {
        title: "",
        message: ""
    },
    events: {
        onClosed: null,
        onClicked: null,
        onButtonClicked: null,
        onNotificationCreated: null,
        onNotificationUpdated: null
    },
    // See: https://developer.chrome.com/apps/notifications#type-NotificationOptions for all available options
    model: {
        type: "basic",
        // iconUrl: "relative/path", the result of chrome.extension.getURL("./") to provide the full extension path
        title: "{that}.options.strings.title",
        message: "{that}.options.strings.message" // may take the form of a string template with values from `messageData` interpolated.
    },
    modelRelay: [{
        target: "message",
        singleTransform: {
            "type": "fluid.transforms.stringTemplate",
            "template": "{that}.model.message",
            "terms": "{that}.messageData"
        }
    }, {
        target: "iconUrl",
        singleTransform: {
            "type": "fluid.transforms.free",
            "func": "gpii.chrome.notification.transformUrl",
            "args": ["{that}.model.iconUrl"]
        }
    }],
    modelListeners: {
        "": {
            listener: "{that}.update",
            excludeSource: ["init"]
        }
    },
    listeners: {
        "onCreate.bindListeners": "gpii.chrome.notification.bindListeners",
        "onCreate.createNotification": {
            listener: "gpii.chrome.notification.create",
            priority: "after:bindListeners"
        },
        "onDestroy.unbindListeners": "gpii.chrome.notification.unbindListeners",
        "onDestroy.clear": {
            listener: "gpii.chrome.notification.clear",
            args: ["{that}.notificationID"]
        }
    },
    invokers: {
        update: {
            funcName: "gpii.chrome.notification.update",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        relayOnClose: {
            funcName: "gpii.chrome.notification.relayEvent",
            args: ["{that}", "{that}.events.onClosed.fire", "{arguments}.0", "{arguments}.1"]
        },
        relayOnClicked: {
            funcName: "gpii.chrome.notification.relayEvent",
            args: ["{that}", "{that}.events.onClicked.fire", "{arguments}.0", "{arguments}.1"]
        },
        relayOnButtonClicked: {
            funcName: "gpii.chrome.notification.relayEvent",
            args: ["{that}", "{that}.events.onButtonClicked.fire", "{arguments}.0", "{arguments}.1"]
        }
    }
});

gpii.chrome.notification.transformUrl = function (iconUrl) {
    if (fluid.isValue(iconUrl)) {
        var prefix = chrome.extension.getURL("./");
        return iconUrl.startsWith(prefix) ? iconUrl : prefix + iconUrl;
    }
};

gpii.chrome.notification.relayEvent = function (that, firer, id, data) {
    console.log("that:", that, "notificationID:", that.notificationID, "id:", id, "data:", data);
    if (that.notificationID === id) {
        firer(id, data);
    }
};

gpii.chrome.notification.bindListeners = function (that) {
    chrome.notifications.onClosed.addListener(that.relayOnClose);
    chrome.notifications.onClicked.addListener(that.relayOnClicked);
    chrome.notifications.onButtonClicked.addListener(that.relayOnButtonClicked);
};

gpii.chrome.notification.unbindListeners = function (that) {
    chrome.notifications.onClosed.removeListener(that.relayOnClose);
    chrome.notifications.onClicked.removeListener(that.relayOnClicked);
    chrome.notifications.onButtonClicked.removeListener(that.relayOnButtonClicked);
};

gpii.chrome.notification.create = function (that) {
    chrome.notifications.create(that.notificationID, that.model, that.events.onNotificationCreated.fire);
};

gpii.chrome.notification.update = function (that) {
    chrome.notifications.update(that.notificationID, that.model, that.events.onNotificationUpdated.fire);
};

gpii.chrome.notification.clear = function (notificationID) {
    chrome.notifications.clear(notificationID);
};

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
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
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
        onClosed: "preventable",
        onClicked: "preventable",
        onButtonClicked: "preventable",
        onNotificationCreated: null,
        onNotificationUpdated: null
    },
    eventRelayMap: {
        "chrome.notifications.onClosed": "onClosed",
        "chrome.notifications.onClicked": "onClicked",
        "chrome.notifications.onButtonClicked": "onButtonClicked"
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
        "onCreate.createNotification": {
            listener: "gpii.chrome.notification.create",
            priority: "after:bindListeners"
        },
        "onDestroy.clear": {
            listener: "gpii.chrome.notification.clear",
            args: ["{that}.notificationID"]
        },
        "onClosed.guard": {
            listener: "gpii.chrome.notification.guardEventRelay",
            args: ["{that}.notificationID", "{arguments}.0"],
            priority: "first"
        },
        "onClicked.guard": {
            listener: "gpii.chrome.notification.guardEventRelay",
            args: ["{that}.notificationID", "{arguments}.0"],
            priority: "first"
        },
        "onButtonClicked.guard": {
            listener: "gpii.chrome.notification.guardEventRelay",
            args: ["{that}.notificationID", "{arguments}.0"],
            priority: "first"
        }
    },
    invokers: {
        update: {
            funcName: "gpii.chrome.notification.update",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    }
});

gpii.chrome.notification.transformUrl = function (iconUrl) {
    if (fluid.isValue(iconUrl)) {
        var prefix = chrome.extension.getURL("./");
        return iconUrl.startsWith(prefix) ? iconUrl : prefix + iconUrl;
    }
};

// only relay chrome events for this component's notification.
gpii.chrome.notification.guardEventRelay = function (notificationID, id) {
    return notificationID === id;
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

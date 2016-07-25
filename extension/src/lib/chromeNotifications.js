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
/* global fluid, require */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.notifications", {
    gradeNames: "fluid.component",
    events: {
        onError: null,
        onClosed: null,
        onClicked: null,
        onButtonClicked: null,
        onPermissionLevelChanged: null,
        onShowSettings: null
    },
    invokers: {
        create: {
            funcName: "gpii.chrome.notifications.create",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        update: {
            funcName: "gpii.chrome.notifications.update",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        clear: {
            funcName: "gpii.chrome.notifications.clear",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        getAll: {
            funcName: "gpii.chrome.notifications.getAll",
            args: ["{that}", "{arguments}.0"]
        },
        getPermissionLevel: {
            funcName: "gpii.chrome.notifications.getPermissionLevel",
            args: ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        "onCreate.addListeners": {
            funcName: "gpii.chrome.notifications.addListeners",
            args: "{that}"
        }
    }
});

gpii.chrome.notifications.addListeners = function (that) {
    chrome.notifications.onClosed.addListener(that.events.onClosed.fire);
    chrome.notifications.onClicked.addListener(that.events.onClicked.fire);
    chrome.notifications.onButtonClicked.addListener(that.events.onButtonClicked.fire);
};

gpii.chrome.notifications.create = function (that, options, eventFirer) {
    // notificationId format is 'gpii-<milliseconds since 1st Jan. 1970>'
    var notificationId = "gpii-".concat(new Date().getTime());
    chrome.notifications.create(notificationId, options, function (id) {
        if (chrome.runtime.lastError) {
            that.events.onError.fire(id, chrome.runtime.lastError);
        } else {
            eventFirer(id);
        }
    });
};

gpii.chrome.notifications.update = function (that, notificationId, options, eventFirer) {
    chrome.notifications.clear(notificationId, function (success) {
        if (chrome.runtime.lastError) {
            that.events.onError.fire(notificationId, chrome.runtime.lastError);
        } else {
            eventFirer(success);
        }
    });
};

gpii.chrome.notifications.clear = function (that, notificationId, eventFirer) {
    chrome.notifications.clear(notificationId, function (success) {
        if (chrome.runtime.lastError) {
            that.events.onError.fire(notificationId, chrome.runtime.lastError);
        } else {
            eventFirer(success);
        }
    });
};

gpii.chrome.notifications.getAll = function (that, eventFirer) {
    chrome.notifications.getAll(function (notifications) {
        if (chrome.runtime.lastError) {
            that.events.onError.fire(chrome.runtime.lastError);
        } else {
            eventFirer(notifications);
        }
    });
};

gpii.chrome.notifications.getPermissionLevel = function (that, eventFirer) {
    chrome.notifications.getPermissionLevel(function (level) {
        if (chrome.runtime.lastError) {
            that.events.onError.fire(chrome.runtime.lastError);
        } else {
            eventFirer(level);
        }
    });
};

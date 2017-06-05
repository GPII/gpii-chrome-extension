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
/* global require */

"use strict";

var fluid = require("infusion");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome"); // eslint-disable-line no-unused-vars
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var gpii = fluid.registerNamespace("gpii");

require("../../extension/src/lib/chromeNotifications.js");

fluid.defaults("gpii.tests.chromeNotificationsTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        chromeNotifications: {
            type: "gpii.chrome.notifications"
        },
        chromeNotificationsTester: {
            type: "gpii.tests.chromeNotificationsTester"
        }
    }
});

gpii.tests.chromeNotificationsTests.assertCalledWith = function (methodName, args) {
    var method = fluid.getGlobalValue(methodName);
    jqUnit.assertTrue(methodName + " should have been called", method.calledWith.apply(method, args));
};

gpii.tests.chromeNotificationsTests.triggerHandleResultFn = function (that) {
    var fn = that.handleResult(fluid.identity);
    fn();
};

// TODO: Add tests for the following:
//       - onClosed chrome event relayed to onClosed component event
//       - onClicked chrome event relayed to onClicked component event
//       - onButtonClicked chrome event relayed to onButtonClicked component event
fluid.defaults("gpii.tests.chromeNotificationsTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOpts: {
        opts: {
            test: "testOpt"
        },
        id: "testID"
    },
    modules: [{
        name: "GPII Chrome Extension chromeNotifications unit tests",
        tests: [{
            name: "Invoker pass correct args",
            expect: 5,
            sequence: [{
                func: "{chromeNotifications}.create",
                args: ["{that}.options.testOpts.opts"]
            }, {
                // only testing that chrome.notifications.create was called, but doesn't check the args
                // because the first argument constructs an ID based on the time the method is run.
                func: "jqUnit.assertTrue",
                args: ["chrome.notifications.create should have been called", "chrome.notifications.create.calledOnce"]
            }, {
                func: "{chromeNotifications}.update",
                args: ["{that}.options.testOpts.id", "{that}.options.testOpts.opts"]
            }, {
                func: "gpii.tests.chromeNotificationsTests.assertCalledWith",
                args: ["chrome.notifications.update", ["{that}.options.testOpts.id", "{that}.options.testOpts.opts"]]
            }, {
                func: "{chromeNotifications}.clear",
                args: ["{that}.options.testOpts.id"]
            }, {
                func: "gpii.tests.chromeNotificationsTests.assertCalledWith",
                args: ["chrome.notifications.clear", ["{that}.options.testOpts.id"]]
            }, {
                func: "{chromeNotifications}.getAll"
            }, {
                func: "jqUnit.assertTrue",
                args: ["chrome.notifications.getAll should have been called", "chrome.notifications.getAll.calledOnce"]
            }, {
                func: "{chromeNotifications}.getPermissionLevel"
            }, {
                func: "jqUnit.assertTrue",
                args: ["chrome.notifications.getPermissionLevel should have been called", "chrome.notifications.getPermissionLevel.calledOnce"]
            }]
        }, {
            name: "handleResult tests",
            expect: 1,
            sequence: [{
                func: "fluid.set",
                args: [chrome.runtime, "lastError", true]
            }, {
                func: "gpii.tests.chromeNotificationsTests.triggerHandleResultFn",
                args: ["{chromeNotifications}"]
            }, {
                event: "{chromeNotifications}.events.onError",
                func: "jqUnit.assert",
                args: ["The onError event should have fired"]
            }]
        }]
    }]
});

fluid.test.runTests([
    "gpii.tests.chromeNotificationsTests"
]);

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
/* global require */

"use strict";

var fluid = require("infusion");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");
var jqUnit = fluid.require("node-jqunit", require, "jqUnit");
var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.tests.extensionHolder");

require("./testUtils.js");
require("../../extension/src/lib/chromeEvented.js");
require("../../extension/src/lib/extensionHolder.js");

gpii.tests.extensionHolder.extInfoMock = {
    "description": "Chrome Extension Mock",
    "disabledReason": "unknown",
    "enabled": true,
    "id": "abcdefghijklmnoprstuvwxyz0123456",
    "mayDisable": true,
    "name": "ChromeExtensionMock",
    "shortName": "Mocky",
    "type": "extension",
    "version": "0.1"
};

fluid.defaults("gpii.tests.chrome.extensionHolder", {
    gradeNames: ["gpii.chrome.extensionHolder"],
    extensionId: "abcdefghijklmnoprstuvwxyz0123456",
    model: {
        extensionEnabled: false
    }
});

fluid.defaults("gpii.tests.extensionHolderTests", {
    gradeNames: ["gpii.tests.testEnvironmentWithSetup"],
    events: {
        startTest: {
            events: {
                onTestCaseStart: "{extensionHolderTester}.events.onTestCaseStart",
                afterSetup: "afterSetup"
            }
        }
    },
    components: {
        extensionHolder: {
            type: "gpii.tests.chrome.extensionHolder",
            createOnEvent: "startTest"
        },
        extensionHolderTester: {
            type: "gpii.tests.extensionHolderTester"
        }
    },
    invokers: {
        setup: "{that}.events.afterSetup.fire",
        tearDown: "gpii.tests.extensionHolderTests.tearDown"
    }
});

gpii.tests.extensionHolderTests.tearDown = function () {
    chrome.management.get.resetBehavior;
    chrome.management.setEnabled.resetBehavior;
};

fluid.defaults("gpii.tests.extensionHolderTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "GPII Chrome Extension extensionHolder unit tests",
        tests: [{
            name: "interaction",
            expect: 23,
            sequence: [{
                event: "{extensionHolderTests extensionHolder}.events.onCreate",
                priority: "last:testing",
                listener: "gpii.tests.utils.assertEventRelayBound",
                args: ["{extensionHolder}", "{extensionHolder}.options.eventRelayMap"]
            }, {
                // Trigger chrome.management.get callback with mock extension info
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.management.get, 1, gpii.tests.extensionHolder.extInfoMock]
            }, {
                func: "jqUnit.assertDeepEq",
                args: ["Check that the extension holder has been successfully populated", gpii.tests.extensionHolder.extInfoMock, "{extensionHolder}.extensionInstance"]
            }, {
                // Trigger tabs onUpdated event firer callback
                func: "gpii.tests.extensionHolderTester.assertSetEnabledCalled",
                args: ["{extensionHolder}"]
            }, {
                // Verify that the extension enabled state is `true` because it is based on the enabled state of the
                // managed extension.
                func: "gpii.tests.extensionHolderTester.assertState",
                args: ["{extensionHolder}", true]
            }, {
                func: "{extensionHolder}.applier.change",
                args: ["extensionEnabled", false]
            }, {
                changeEvent: "{extensionHolder}.applier.modelChanged",
                path: "extensionEnabled",
                listener: "gpii.tests.extensionHolderTester.assertState",
                args: ["{extensionHolder}", false]
            }, {
                func: "{extensionHolder}.applier.change",
                args: ["extensionEnabled", true]
            }, {
                changeEvent: "{extensionHolder}.applier.modelChanged",
                path: "extensionEnabled",
                listener: "gpii.tests.extensionHolderTester.assertState",
                args: ["{extensionHolder}", true]
            }, {
                // Trigger management onDisabled event firer callback
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.management.onDisabled.addListener, 0, {id: "{extensionHolder}.options.extensionId"}]
            }, {
                event: "{extensionHolder}.events.onExtDisabled",
                priority: "last:testing",
                listener: "gpii.tests.extensionHolderTester.assertState",
                args: ["{extensionHolder}", false]
            }, {
                // Trigger management onEnabled event firer callback
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.management.onEnabled.addListener, 0, {id: "{extensionHolder}.options.extensionId"}]
            }, {
                event: "{extensionHolder}.events.onExtEnabled",
                priority: "last:testing",
                listener: "gpii.tests.extensionHolderTester.assertState",
                args: ["{extensionHolder}", true]
            }, {
                // Trigger management onUninstalled event firer callback
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.management.onUninstalled.addListener, 0, "{extensionHolder}.options.extensionId"]
            }, {
                event: "{extensionHolder}.events.onExtUninstalled",
                priority: "last:testing",
                listener: "jqUnit.assertUndefined",
                args: ["Checking that the extensionInstance has been cleared", "{extensionHolder}.extensionInstance"]
            }, {
                // Trigger management onInstalled event firer callback
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.management.onInstalled.addListener, 0, {id: "{extensionHolder}.options.extensionId"}]
            }, {
                event: "{extensionHolder}.events.onExtInstalled",
                priority: "last:testing",
                listener: "jqUnit.assert",
                args: ["The onExtInstalled event was called"]
            }, {
                // Trigger chrome.management.get callback with mock extension info
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.management.get, 1, gpii.tests.extensionHolder.extInfoMock]
            }, {
                func: "jqUnit.assertDeepEq",
                args: ["Check that the extension holder has been successfully populated", gpii.tests.extensionHolder.extInfoMock, "{extensionHolder}.extensionInstance"]
            }, {
                func: "{extensionHolder}.destroy"
            }, {
                event: "{extensionHolder}.events.onDestroy",
                priority: "last:testing",
                listener: "gpii.tests.utils.assertEventRelayUnbound",
                args: ["{extensionHolder}", "{extensionHolder}.options.eventRelayMap"]
            }]
        }]
    }]
});

gpii.tests.extensionHolderTester.assertSetEnabledCalled = function (that) {
    var wasCalled = chrome.management.setEnabled.lastCall.calledWithExactly(that.extensionInstance.id, that.model.extensionEnabled, that.events.onSetEnabled.fire);
    jqUnit.assertTrue("chrome.management.setEnabled was called with the proper arguments", wasCalled);
};

gpii.tests.extensionHolderTester.assertState = function (that, state) {
    jqUnit.assertEquals("Checking that ext.model.extensionEnabled is " + state, state, that.model.extensionEnabled);
    jqUnit.assertEquals("Checking that that.extensionInstance.enabled is " + state, state, that.extensionInstance.enabled);
};

fluid.test.runTests([
    "gpii.tests.extensionHolderTests"
]);

/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017-2018 OCAD University
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

require("./testUtils.js");
require("../../extension/src/lib/chromeEvented.js");
require("../../extension/src/lib/portBinding.js");
require("../../extension/src/lib/domSettingsApplier.js");

fluid.defaults("gpii.tests.domSettingsApplierTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        domSettingsApplier: {
            type: "gpii.chrome.domSettingsApplier",
            options: {
                events: {
                    messagePosted: null
                },
                dynamicComponents: {
                    port: {
                        options: {
                            listeners: {
                                "onCreate.passMessage": {
                                    "this": "{that}.options.port.onPost",
                                    method: "addListener",
                                    args: ["{domSettingsApplier}.events.messagePosted.fire"]
                                }
                            }
                        }
                    }
                }
            }
        },
        domSettingsApplierTester: {
            type: "gpii.tests.domSettingsApplierTester"
        }
    }
});

// TODO: Refactor mockPort into a sharable mock object
// mock message port
gpii.tests.mockPort = {
    onMessage: {
        addListener: function (fn) {
            gpii.tests.mockPort.onMessage.listeners.push(fn);
        },
        listeners: []
    },
    onDisconnect: {
        addListener: function (fn) {
            gpii.tests.mockPort.onDisconnect.listeners.push(fn);
        },
        listeners: []
    },
    // this event is just for testing
    onPost: {
        addListener: function (fn) {
            gpii.tests.mockPort.onPost.listeners.push(fn);
        },
        listeners: []
    },
    requestToReceiptMap: {
        "gpii.chrome.readRequest": "gpii.chrome.readReceipt",
        "gpii.chrome.writeRequest": "gpii.chrome.writeReceipt"
    },
    postMessage: function (msg) {
        // automatically post a receipt
        var reply = fluid.copy(msg);

        // convert READ/WRITE to READ_RECEIPT/WRITE_RECEIPT
        reply.type = gpii.tests.mockPort.requestToReceiptMap[ msg.type] || msg.type;

        fluid.each(gpii.tests.mockPort.onMessage.listeners, function (fn) {
            fn(reply);
        });
        // this is just for testing.
        fluid.each(gpii.tests.mockPort.onPost.listeners, function (fn) {
            fn(msg);
        });
    },
    disconnect: function (msg) {
        fluid.each(gpii.tests.mockPort.onDisconnect.listeners, function (fn) {
            fn(msg);
        });
    }
};

// TODO: Add tests for the following:
//       - multiple open ports
//       - onDisconnect destroys port component
fluid.defaults("gpii.tests.domSettingsApplierTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOpts: {
        model: {
            test: "testValue"
        },
        incomingModel: {
            test: "incomingValue"
        },
        message: {
            type: "gpii.chrome.writeRequest",
            payload: "{that}.options.testOpts.model"
        },
        incomingWrite: {
            id: "test-1",
            type: "gpii.chrome.writeRequest",
            payload: "{that}.options.testOpts.incomingModel"
        },
        updateMessage: {
            type: "gpii.chrome.writeRequest",
            payload: "{that}.options.testOpts.incomingModel"
        },
        writeReceipt: {
            id: "test-1",
            type: "gpii.chrome.writeReceipt",
            payload: "{that}.options.testOpts.incomingModel"
        }
    },
    modules: [{
        name: "GPII Chrome Extension domSettingsApplier unit tests",
        tests: [{
            name: "Port Connection",
            expect: 10,
            sequence: [{
                func: "gpii.tests.utils.assertEventRelayBound",
                args: ["{domSettingsApplier}", "{domSettingsApplier}.options.eventRelayMap"]
            }, {
                // Trigger onConnect event firer callback
                func: "gpii.tests.utils.triggerCallback",
                args: [chrome.runtime.onConnect.addListener, 0, gpii.tests.mockPort]
            }, {
                event: "{domSettingsApplier}.events.onConnect",
                listener: "jqUnit.assertValue",
                args: ["A port component should be created", "{domSettingsApplier}.port"]
            }, {
                // model changed - send a write request
                func: "{domSettingsApplier}.applier.change",
                args: ["test", "{that}.options.testOpts.model.test"]
            }, {
                event: "{domSettingsApplier}.events.messagePosted",
                listener: "gpii.tests.domSettingsApplierTester.verifyPostedMessage",
                args: ["{that}.options.testOpts.message", "{arguments}.0"]
            }, {
                // receive a write request
                func: "{domSettingsApplier}.port.events.onIncomingWrite.fire",
                args: ["{that}.options.testOpts.incomingWrite"]
            }, {
                event: "{domSettingsApplier}.events.messagePosted",
                listener: "gpii.tests.domSettingsApplierTester.verifyPostedMessage",
                args: ["{that}.options.testOpts.updateMessage", "{arguments}.0"]
            }, {
                event: "{domSettingsApplier}.events.messagePosted",
                listener: "gpii.tests.domSettingsApplierTester.verifyPostedMessage",
                args: ["{that}.options.testOpts.writeReceipt", "{arguments}.0"]
            }, {
                funcName: "jqUnit.assertDeepEq",
                args: [
                    "The model should be updated to match the incoming write",
                    "{that}.options.testOpts.incomingModel",
                    "{domSettingsApplier}.model"
                ]
            }, {
                // destroy the component
                func: "{domSettingsApplier}.destroy"
            }, {
                event: "{domSettingsApplier}.events.onDestroy",
                priority: "last:testing",
                listener: "gpii.tests.utils.assertEventRelayUnbound",
                args: ["{domSettingsApplier}", "{domSettingsApplier}.options.eventRelayMap"]
            }]
        }]
    }]
});

gpii.tests.domSettingsApplierTester.verifyPostedMessage = function (expectedPost, message) {
    jqUnit.assertEquals("The posted message type is correct", expectedPost.type, message.type);
    jqUnit.assertDeepEq("The posted message payload is correct", expectedPost.payload, message.payload);
};

fluid.test.runTests([
    "gpii.tests.domSettingsApplierTests"
]);

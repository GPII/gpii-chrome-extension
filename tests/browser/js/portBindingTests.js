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

/* global fluid, gpii, jqUnit, sinon */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        /*********************
         * portBinding tests *
         *********************/

        fluid.defaults("gpii.tests.chrome.portBinding", {
            gradeNames: ["gpii.chrome.portBinding"],
            connectionName: "portBindingTests",
            messageType: "portBindingTests",
            filters: {
                messages: ["incoming-message"],
                receipts: ["incoming-receipt"]
            },
            members: {
                handleSpy: {
                    expander: {
                        "this": sinon,
                        method: "spy"
                    }
                }
            },
            invokers: {
                handleMessageImpl: {
                    func: function (that, data) {
                        that.handleSpy(data);
                        return data.payload;
                    },
                    args: ["{that}", "{arguments}.0"]
                }
            }
        });

        fluid.defaults("gpii.tests.portBindingTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                portBinding: {
                    type: "gpii.tests.chrome.portBinding"
                },
                portBindingTester: {
                    type: "gpii.tests.portBindingTester"
                }
            }
        });

        fluid.defaults("gpii.tests.portBindingTester", {
            gradeNames: ["fluid.test.testCaseHolder", "gpii.tests.portBinding.portName"],
            testOpts: {
                messages: {
                    anonymous: {
                        type: "anonymous-message",
                        id: "test-0",
                        payload: {prefs: "someprefs"}
                    },
                    one: {
                        type: "incoming-message",
                        id: "test-1",
                        payload: {pref: "one"}
                    },
                    posted: {pref: "posted"},
                    expectedPost: {
                        type: "portBindingTests-message",
                        id: "portBindingTests-",
                        payload: {pref: "posted"}
                    },
                    sentReceipt: {
                        type: "portBindingTests-receipt",
                        id: "test-1",
                        payload: {pref: "one"}
                    },
                    incomingReceipt: {
                        type: "incoming-receipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "one"}
                    },
                    rejectedReceipt: {
                        type: "incoming-receipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "one"},
                        error: {message: "rejected"}
                    }
                }
            },
            modules: [{
                name: "portBinding Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 14,
                    sequence: [{
                        // connection
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        // unaccepted incoming message
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.anonymous"]
                    }, {
                        event: "{portBinding}.events.onIncoming",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Blocked Message: The onIncoming event should have passed along the message", "{that}.options.testOpts.messages.anonymous", "{arguments}.0"]
                    }, {
                        func: "jqUnit.assertFalse",
                        args: ["Blocked Message: The message should have been blocked by the filtering and not triggered the handling of the message", "{portBinding}.handleSpy.called"]
                    }, {
                        // accepted incoming message
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.one"]
                    }, {
                        event: "{portBinding}.events.onIncomingMessage",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Accepted Message: The onIncomingMessage event should have passed along the message", "{that}.options.testOpts.messages.one", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.portBindingTester.verifyHandleMessageImpl",
                        args: ["{portBinding}", "Accepted Message: The handleMessageImpl method was called correctly", "{that}.options.testOpts.messages.one"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.sentReceipt"]
                    }, {
                        // post message
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.incomingReceipt"]
                    }, {
                        task: "{portBinding}.postMessage",
                        args: ["{that}.options.testOpts.messages.posted"],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessageWithID",
                        resolveArgs: ["{portBinding}.port", "{that}.options.testOpts.messages.expectedPost"]
                    }, {
                        // reject post
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.rejectedReceipt"]
                    }, {
                        task: "{portBinding}.postMessage",
                        args: ["{that}.options.testOpts.messages.posted"],
                        reject: "gpii.tests.chrome.portBinding.assertPostMessageWithID",
                        rejectArgs: ["{portBinding}.port", "{that}.options.testOpts.messages.expectedPost"]
                    }, {
                        // disconnect
                        func: "gpii.tests.mockPort.trigger.onDisconnect",
                        args: ["{portBinding}.port"]
                    }, {
                        event: "{portBinding}.events.onDisconnect",
                        priority: "last:testing",
                        listener: "jqUnit.assert",
                        args: ["The onDisconnect event should have fired"]
                    }, {
                        // remove port
                        func: "fluid.set",
                        args: ["{portBinding}", ["port"], undefined]
                    }, {
                        task: "{portBinding}.postMessage",
                        args: ["{that}.options.testOpts.messages.posted"],
                        reject: "jqUnit.assert",
                        rejectArgs: ["The postMessage promise should have been rejected"]
                    }]
                }]
            }]
        });

        gpii.tests.portBindingTester.verifyHandleMessageImpl = function (that, msg, expectedData) {
            jqUnit.assertTrue(msg, that.handleSpy.calledWithExactly(expectedData));
        };

        /***************
         * store tests *
         ***************/

        fluid.defaults("gpii.tests.portBindingStoreTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                portBindingStore: {
                    type: "gpii.chrome.portBinding.store",
                    options: {
                        gradeNames: ["gpii.tests.chrome.portBinding", "fluid.dataSource.writable"],
                        connectionName: "portBindingStoreTests",
                        messageType: "portBindingStoreTests"
                    }
                },
                portBindingStoreTester: {
                    type: "gpii.tests.portBindingStoreTester"
                }
            }
        });

        fluid.defaults("gpii.tests.portBindingStoreTester", {
            gradeNames: ["fluid.test.testCaseHolder", "gpii.tests.portBinding.portName"],
            testOpts: {
                prefs: {
                    preferences: {
                        setting: "set"
                    }
                },
                message: {
                    prefsToUpdate: {
                        type: "incoming-message",
                        id: "incoming-1",
                        payload: "{that}.options.testOpts.prefs"
                    },
                    post: {
                        type: "portBindingStoreTests-message",
                        id: "portBindingStoreTests-",
                        payload: "{that}.options.testOpts.prefs"
                    },
                    receipt: {
                        type: "incoming-receipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: {accepted: true}
                    }
                }
            },
            modules: [{
                name: "portBinding store Tests",
                tests: [{
                    name: "getting/setting",
                    expect: 8,
                    sequence: [{
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        func: "jqUnit.assertDeepEq",
                        args: ["The original lastIncomingPayload should be empty", {}, "{portBindingStore}.lastIncomingPayload"]
                    }, {
                        task: "{portBindingStore}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the initial model correctly", {}, "{arguments}.0"]
                    }, {
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.message.prefsToUpdate"]
                    }, {
                        event: "{portBinding}.events.onIncomingMessage",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["The lastIncomingPayload member should have been updated after receiving the message", "{that}.options.testOpts.prefs", "{portBindingStore}.lastIncomingPayload"]
                    }, {
                        task: "{portBindingStore}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the updated model correctly", "{that}.options.testOpts.prefs", "{arguments}.0"]
                    }, {
                        // return receipt
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.message.receipt"]
                    }, {
                        task: "{portBindingStore}.set",
                        args: [null, "{that}.options.testOpts.prefs"],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessageWithID",
                        resolveArgs: ["{portBindingStore}.port", "{that}.options.testOpts.message.post"]
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "gpii.tests.portBindingTests",
            "gpii.tests.portBindingStoreTests"
        ]);
    });
})(jQuery);

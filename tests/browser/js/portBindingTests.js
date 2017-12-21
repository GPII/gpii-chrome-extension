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

/* global fluid */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        /*********************
         * portBinding tests *
         *********************/

        fluid.defaults("gpii.tests.portBindingTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                portBinding: {
                    type: "gpii.tests.chrome.portBinding",
                    options: {
                        connectionName: "portBindingTests"
                    }
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
                    one: {pref: "one"},
                    two: {pref: "two"},
                    posted: {pref: "posted"}
                }
            },
            modules: [{
                name: "portBinding Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 5,
                    sequence: [{
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.one"]
                    }, {
                        event: "{portBinding}.events.onIncomingMessage",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["The lastIncomingMessage member should have been updated after receiving the message", "{that}.options.testOpts.messages.one", "{portBinding}.lastIncomingMessage"]
                    }, {
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.two"]
                    }, {
                        event: "{portBinding}.events.onIncomingMessage",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["The lastIncomingMessage member should have been updated after receiving the message", "{that}.options.testOpts.messages.two", "{portBinding}.lastIncomingMessage"]
                    }, {
                        task: "{portBinding}.postMessage",
                        args: ["{that}.options.testOpts.messages.posted"],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessage",
                        resolveArgs: ["{portBinding}.port", "{that}.options.testOpts.messages.posted"]
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
                        options: {
                            connectionName: "portBindingStoreTests"
                        }
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
                prefsToUpdate: {
                    preferences: {
                        setting: "set"
                    }
                }
            },
            modules: [{
                name: "portBinding store Tests",
                tests: [{
                    name: "getting/setting",
                    expect: 6,
                    sequence: [{
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        func: "jqUnit.assertDeepEq",
                        args: ["The original lastIncomingMessage should be empty", {}, "{portBindingStore}.lastIncomingMessage"]
                    }, {
                        task: "{portBindingStore}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the initial model correctly", {}, "{arguments}.0"]
                    }, {
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.prefsToUpdate"]
                    }, {
                        event: "{portBinding}.events.onIncomingMessage",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["The lastIncomingMessage member should have been updated after receiving the message", "{that}.options.testOpts.prefsToUpdate", "{portBindingStore}.lastIncomingMessage"]
                    }, {
                        task: "{portBindingStore}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the updated model correctly", "{that}.options.testOpts.prefsToUpdate", "{arguments}.0"]
                    }, {
                        task: "{portBindingStore}.set",
                        args: [null, "{that}.options.testOpts.prefsToUpdate"],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessage",
                        resolveArgs: ["{portBindingStore}.port", "{that}.options.testOpts.prefsToUpdate"]
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

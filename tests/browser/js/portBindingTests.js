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

/* global fluid, chrome, jqUnit, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        /**************
         * Test utils *
         **************/

        fluid.defaults("gpii.tests.portBinding.portName", {
            testOpts: {
                expectedPortName: {
                    expander: {
                        funcName: "fluid.stringTemplate",
                        args: ["%connectionName-%id", {
                            connectionName: "{portBinding}.options.connectionName",
                            id: "{portBinding}.id"
                        }]
                    }
                }
            }
        });


        /*********************
         * portbinding tests *
         *********************/

        fluid.defaults("gpii.tests.portBindingTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                portBinding: {
                    type: "gpii.chrome.portBinding",
                    options: {
                        connectionName: "test"
                    }
                },
                portBindingTester: {
                    type: "fluid.tests.portBindingTester"
                }
            }
        });

        gpii.tests.portBindingTests.assertConnection = function (that, expectedPortName) {
            jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: expectedPortName}).calledOnce);
        };

        gpii.tests.portBindingTests.assertPostMessage = function (port, postedMessage) {
            jqUnit.assertTrue("postMessage called with the correct arguments", port.postMessage.calledWith(postedMessage));
        };

        fluid.defaults("fluid.tests.portBindingTester", {
            gradeNames: ["fluid.test.testCaseHolder", "gpii.tests.portBinding.portName"],
            testOpts: {
                messages: {
                    one: {pref: true},
                    two: {pref: false},
                    posted: {prefs: "posted"}
                }
            },
            modules: [{
                name: "portBinding Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 4,
                    sequence: [{
                        func: "gpii.tests.portBindingTests.assertConnection",
                        args: ["{portBinding}", "{that}.options.testOpts.expectedPortName"]
                    }, {
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.one"]
                    }, {
                        changeEvent: "{portBinding}.applier.modelChanged",
                        spec: {path: "remote", priority: "last:testing"},
                        listener: "jqUnit.assertDeepEq",
                        args: ["The model.remote path should have been updated after receiving the message", "{that}.options.testOpts.messages.one", "{portBinding}.model.remote"]
                    }, {
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.two"]
                    }, {
                        changeEvent: "{portBinding}.applier.modelChanged",
                        spec: {path: "remote", priority: "last:testing"},
                        listener: "jqUnit.assertDeepEq",
                        args: ["The model.remote path should have been updated after receiving the message", "{that}.options.testOpts.messages.two", "{portBinding}.model.remote"]
                    }, {
                        func: "{portBinding}.postMessage",
                        args: ["{that}.options.testOpts.messages.posted"]
                    }, {
                        func: "gpii.tests.portBindingTests.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.posted"]
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
                        connectionName: "storeTest",
                        model: {
                            preferences: "{that}.model.remote",
                            remote: {
                                setting: "original"
                            }
                        }
                    }
                },
                portBindingStoreTester: {
                    type: "fluid.tests.portBindingStoreTester"
                }
            }
        });

        gpii.tests.portBindingStoreTests.assertGet = function (that, expected) {
            var actual = that.get();
            jqUnit.assertDeepEq("The get method returns the model correctly", expected, actual);
        };

        fluid.defaults("fluid.tests.portBindingStoreTester", {
            gradeNames: ["fluid.test.testCaseHolder", "gpii.tests.portBinding.portName"],
            testOpts: {
                origModel: {
                    preferences: {
                        setting: "original"
                    },
                    remote: {
                        setting: "original"
                    }
                },
                prefsToUpdate: {
                    preferences: {
                        setting: "set"
                    }
                },
                updatedModel: {
                    preferences: {
                        setting: "set"
                    },
                    remote: {
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
                        func: "gpii.tests.portBindingTests.assertConnection",
                        args: ["{portBindingStore}", "{that}.options.testOpts.expectedPortName"]
                    }, {
                        func: "jqUnit.assertDeepEq",
                        args: ["The model holds the original values", "{that}.options.testOpts.origModel", "{portBindingStore}.model"]
                    }, {
                        func: "gpii.tests.portBindingStoreTests.assertGet",
                        args: ["{portBindingStore}", "{that}.options.testOpts.origModel"]
                    }, {
                        func: "{portBindingStore}.set",
                        args: ["{that}.options.testOpts.prefsToUpdate"]
                    }, {
                        func: "jqUnit.assertDeepEq",
                        args: ["The model should have been updated after receiving the message", "{that}.options.testOpts.updatedModel", "{portBindingStore}.model"]
                    }, {
                        func: "gpii.tests.portBindingTests.assertPostMessage",
                        args: ["{portBindingStore}.port", "{that}.options.testOpts.updatedModel.preferences"]
                    }, {
                        func: "gpii.tests.portBindingStoreTests.assertGet",
                        args: ["{portBindingStore}", "{that}.options.testOpts.updatedModel"]
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

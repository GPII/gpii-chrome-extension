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
            portName: "portBindingTests",
            members: {
                handleReadSpy: {
                    expander: {
                        "this": sinon,
                        method: "spy"
                    }
                },
                handleWriteSpy: {
                    expander: {
                        "this": sinon,
                        method: "spy"
                    }
                }
            },
            invokers: {
                handleRead: {
                    funcName: "gpii.tests.chrome.portBinding.handle",
                    args: ["{that}.handleReadSpy", "{arguments}.0"]
                },
                handleWrite: {
                    funcName: "gpii.tests.chrome.portBinding.handle",
                    args: ["{that}.handleWriteSpy", "{arguments}.0"]
                }
            }
        });

        gpii.tests.chrome.portBinding.handle = function (spy, data) {
            var promise = fluid.promise();
            spy(data);

            if (fluid.get(data, ["payload", "reject"])) {
                promise.reject({message: "rejected"});
            } else {
                promise.resolve(fluid.get(data, ["payload", "toReturn"]));
            }

            return promise;
        };

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
                posted: {pref: "posted"},
                messages: {
                    incomingRead: {
                        type: "gpii.chrome.readRequest",
                        id: "incomingRead-1",
                        payload: {
                            toReturn: {value: "test"}
                        }
                    },
                    returnedReadReceipt: {
                        type: "gpii.chrome.readReceipt",
                        id: "incomingRead-1",
                        payload: {
                            value: "test"
                        }
                    },
                    incomingReadRejected: {
                        type: "gpii.chrome.readRequest",
                        id: "incomingRead-2",
                        payload: {
                            reject: true
                        }
                    },
                    returnedRejectedReadReceipt: {
                        type: "gpii.chrome.readReceipt",
                        id: "incomingRead-2",
                        payload: {
                            reject: true
                        },
                        error: {
                            message: "rejected"
                        }
                    },
                    incomingWrite: {
                        type: "gpii.chrome.writeRequest",
                        id: "incomingRead-1",
                        payload: {
                            toReturn: {value: "test"}
                        }
                    },
                    returnedWriteReceipt: {
                        type: "gpii.chrome.writeReceipt",
                        id: "incomingRead-1",
                        payload: {
                            value: "test"
                        }
                    },
                    incomingWriteRejected: {
                        type: "gpii.chrome.writeRequest",
                        id: "incomingRead-2",
                        payload: {
                            reject: true
                        }
                    },
                    returnedRejectedWriteReceipt: {
                        type: "gpii.chrome.writeReceipt",
                        id: "incomingRead-2",
                        payload: {
                            reject: true
                        },
                        error: {
                            message: "rejected"
                        }
                    },
                    readRequest: {
                        type: "gpii.chrome.readRequest",
                        // the id is created with a unique number, so it will not be tested
                        payload: {}
                    },
                    readRequestReceipt: {
                        type: "gpii.chrome.readReceipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "one"}
                    },
                    readRequestRejectedReceipt: {
                        type: "gpii.chrome.readReceipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "one"},
                        error: {message: "rejected"}
                    },
                    writeRequest: {
                        type: "gpii.chrome.writeRequest",
                        // the id is created with a unique number, so it will not be tested
                        payload: {pref: "posted"}
                    },
                    writeRequestReceipt: {
                        type: "gpii.chrome.writeReceipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "posted"}
                    }
                }
            },
            modules: [{
                name: "portBinding Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 23,
                    sequence: [{
                        // connection
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        // accepted incoming read
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingRead"]
                    }, {
                        event: "{portBinding}.events.onIncomingRead",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Accepted Incoming Read: The onIncomingRead event should have passed along the message", "{that}.options.testOpts.messages.incomingRead", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.portBindingTester.verifyHandleFn",
                        args: ["Accepted Incoming Read: The handleRead method was called correctly", "{portBinding}.handleReadSpy", "{that}.options.testOpts.messages.incomingRead"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedReadReceipt"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // rejected incoming read
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingReadRejected"]
                    }, {
                        event: "{portBinding}.events.onIncomingRead",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Rejected Incoming Read: The onIncomingRead event should have passed along the message", "{that}.options.testOpts.messages.incomingReadRejected", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.portBindingTester.verifyHandleFn",
                        args: ["Rejected Incoming Read: The handleRead method was called correctly", "{portBinding}.handleReadSpy", "{that}.options.testOpts.messages.incomingReadRejected"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedRejectedReadReceipt"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // accepted incoming write
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingWrite"]
                    }, {
                        event: "{portBinding}.events.onIncomingWrite",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Accepted Incoming Write: The onIncomingWrite event should have passed along the message", "{that}.options.testOpts.messages.incomingWrite", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.portBindingTester.verifyHandleFn",
                        args: ["Accepted Incoming Write: The handleWrite method was called correctly", "{portBinding}.handleWriteSpy", "{that}.options.testOpts.messages.incomingWrite"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedWriteReceipt"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // rejected incoming write
                        func: "gpii.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingWriteRejected"]
                    }, {
                        event: "{portBinding}.events.onIncomingWrite",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Rejected Incoming Write: The onIncomingWrite event should have passed along the message", "{that}.options.testOpts.messages.incomingWriteRejected", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.portBindingTester.verifyHandleFn",
                        args: ["Rejected Incoming Write: The handleWrite method was called correctly", "{portBinding}.handleWriteSpy", "{that}.options.testOpts.messages.incomingWriteRejected"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedRejectedWriteReceipt"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // send read Request
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.readRequestReceipt"]
                    }, {
                        task: "{portBinding}.read",
                        args: [{}],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        resolveArgs: ["Read Request", "{portBinding}.port", "{that}.options.testOpts.messages.readRequest"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // reject read Request
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.readRequestRejectedReceipt"]
                    }, {
                        task: "{portBinding}.read",
                        args: [{}],
                        reject: "gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        rejectArgs: ["Read Request - Rejected", "{portBinding}.port", "{that}.options.testOpts.messages.readRequest"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // send write Request
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.writeRequestReceipt"]
                    }, {
                        task: "{portBinding}.write",
                        args: ["{that}.options.testOpts.posted"],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        resolveArgs: ["Write Request", "{portBinding}.port", "{that}.options.testOpts.messages.writeRequest"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // reject write Request
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.writeRequestRejectedReceipt"]
                    }, {
                        task: "{portBinding}.write",
                        args: ["{that}.options.testOpts.posted"],
                        reject: "gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        rejectArgs: ["Write Request - Rejected", "{portBinding}.port", "{that}.options.testOpts.messages.writeRequest"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
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
                        task: "{portBinding}.read",
                        args: ["{that}.options.testOpts.posted"],
                        reject: "jqUnit.assert",
                        rejectArgs: ["The postMessage promise should have been rejected"]
                    }]
                }]
            }]
        });

        gpii.tests.portBindingTester.verifyHandleFn = function (msg, spy, expectedData) {
            jqUnit.assertTrue(msg, spy.calledWithExactly(expectedData));
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
                        portName: "portBindingStoreTests"
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
                messages: {
                    readRequestReceipt: {
                        type: "gpii.chrome.readReceipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: "{that}.options.testOpts.prefs"
                    },
                    writeRequest: {
                        type: "gpii.chrome.writeRequest",
                        // the id is created with a unique number, so it will not be tested
                        payload: "{that}.options.testOpts.prefs"
                    },
                    writeRequestReceipt: {
                        type: "gpii.chrome.writeReceipt",
                        // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                        payload: "{that}.options.testOpts.prefs"
                    }
                }
            },
            modules: [{
                name: "portBinding store Tests",
                tests: [{
                    name: "getting/setting",
                    expect: 4,
                    sequence: [{
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        // Get
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBindingStore}", "{that}.options.testOpts.messages.readRequestReceipt"]
                    }, {
                        task: "{portBindingStore}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the stored prefs correctly", "{that}.options.testOpts.prefs", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBindingStore}.port"]
                    }, {
                        // Set
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBindingStore}", "{that}.options.testOpts.messages.writeRequestReceipt"]
                    }, {
                        task: "{portBindingStore}.set",
                        args: [null, "{that}.options.testOpts.prefs"],
                        resolve: "gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        resolveArgs: ["Set", "{portBindingStore}.port", "{that}.options.testOpts.messages.writeRequest"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBindingStore}.port"]
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

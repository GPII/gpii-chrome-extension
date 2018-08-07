/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2018 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        fluid.defaults("gpii.tests.captionsEnactorTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                captionsEnactor: {
                    type: "gpii.chrome.enactor.captions",
                    container: ".gpii-test-captionsEnactor"
                },
                captionsEnactorTester: {
                    type: "gpii.tests.captionsEnactorTester"
                }
            }
        });

        fluid.defaults("gpii.tests.captionsEnactorTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Captions Enactor Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 5,
                    sequence: [{
                        // Post valid message
                        func: "gpii.tests.captionsEnactorTester.postMessage",
                        args: ["UIO+_Settings", {captionsEnabled: true}]
                    }, {
                        changeEvent: "{captionsEnactor}.applier.modelChanged",
                        path: "enabled",
                        listener: "jqUnit.assertTrue",
                        args: ["The model.value should be set to \"true\"", "pink", "{captionsEnactor}.model.enabled"]
                    }, {
                        // Post message not from UIO+
                        func: "gpii.tests.captionsEnactorTester.postMessage",
                        args: ["other", {captionsEnabled: false}]
                    }, {
                        funcName: "jqUnit.assertTrue",
                        args: ["The model.value should still be set to \"true\"", "pink", "{captionsEnactor}.model.enabled"]
                    }, {
                        // Post message without captionsEnabled setting
                        func: "gpii.tests.captionsEnactorTester.postMessage",
                        args: ["UIO+_Settings", {selfVoicingEnabled: false}]
                    }, {
                        funcName: "jqUnit.assertTrue",
                        args: ["The model.value should still be set to \"true\"", "pink", "{captionsEnactor}.model.enabled"]
                    }, {
                        // Post message not from window
                        func: "{captionsEnactor}.updateModelFromMessage",
                        args: [{
                            source: "other",
                            data: {
                                "UIO+_Settings": {captionsEnabled: false}
                            }
                        }]
                    }, {
                        funcName: "jqUnit.assertTrue",
                        args: ["The model.value should still be set to \"true\"", "pink", "{captionsEnactor}.model.enabled"]
                    }, {
                        // Post valid message
                        func: "gpii.tests.captionsEnactorTester.postMessage",
                        args: ["UIO+_Settings", {captionsEnabled: false}]
                    }, {
                        changeEvent: "{captionsEnactor}.applier.modelChanged",
                        path: "enabled",
                        listener: "jqUnit.assertTrue",
                        args: ["The model.value should be set to \"true\"", "pink", "{captionsEnactor}.model.enabled"]
                    }]
                }]
            }]
        });

        gpii.tests.captionsEnactorTester.postMessage = function (namespace, message) {
            var data = {};
            data[namespace] = message;
            window.postMessage(data, "*");
        };

        fluid.test.runTests([
            "gpii.tests.captionsEnactorTests"
        ]);
    });
})(jQuery);

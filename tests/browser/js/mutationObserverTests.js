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

/* global fluid, jqUnit, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        fluid.defaults("gpii.tests.mutationObserverTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                mutationObserver: {
                    type: "gpii.chrome.mutationObserver",
                    container: ".gpiic-mutationObserver"
                },
                mutationObserverTester: {
                    type: "gpii.tests.mutationObserverTester"
                }
            }
        });

        fluid.defaults("gpii.tests.mutationObserverTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                markup: {
                    firstAddition: "<li class=\"gpiic-mutationObserver-firstAddition\">First Addition</li>"
                }
            },
            modules: [{
                name: "Mutation Observer Tests",
                tests: [{
                    name: "DOM Manipulations",
                    expect: 4,
                    sequence: [{
                        func: "{mutationObserver}.observe"
                    }, {
                        func: "gpii.tests.mutationObserverTester.insert",
                        args: ["{mutationObserver}", "{that}.options.testOpts.markup.firstAddition"]
                    }, {
                        event: "{mutationObserver}.events.onNodeAdded",
                        listener: "gpii.tests.mutationObserverTester.verifyReturnedNode",
                        args: ["Node Added", "{arguments}.0", ".gpiic-mutationObserver-firstAddition"]
                    }, {
                        func: "gpii.tests.mutationObserverTester.remove",
                        args: [".gpiic-mutationObserver-remove"]
                    }, {
                        event: "{mutationObserver}.events.onNodeRemoved",
                        listener: "gpii.tests.mutationObserverTester.verifyReturnedNode",
                        args: ["Node Removed", "{arguments}.0", ".gpiic-mutationObserver-remove"]
                    }, {
                        func: "gpii.tests.mutationObserverTester.changeAttr",
                        args: [".gpiic-mutationObserver-changeAttr", {"data-test": "test"}]
                    }, {
                        event: "{mutationObserver}.events.onAttributeChanged",
                        listener: "gpii.tests.mutationObserverTester.verifyAttributeChange",
                        args: ["Attribute Changed", "{arguments}.0", "{arguments}.1", ".gpiic-mutationObserver-changeAttr", "data-test"]
                    }]
                }]
            }]
        });

        gpii.tests.mutationObserverTester.insert = function (that, elm) {
            elm = $(elm);
            that.container.append(elm);
        };

        gpii.tests.mutationObserverTester.remove = function (elm) {
            $(elm).remove();
        };

        gpii.tests.mutationObserverTester.changeAttr = function (elm, attrs) {
            $(elm).attr(attrs);
        };

        gpii.tests.mutationObserverTester.verifyReturnedNode = function (prefix, node, expectedClass) {
            node = $(node);
            jqUnit.assertTrue(prefix + ": Returned the correct node", node.is(expectedClass));
        };

        gpii.tests.mutationObserverTester.verifyAttributeChange = function (prefix, node, mutationRecord, expectedClass, expectedAttribute) {
            gpii.tests.mutationObserverTester.verifyReturnedNode(prefix, node, expectedClass);
            jqUnit.assertEquals(prefix + ": The correct attribute was changed", expectedAttribute, mutationRecord.attributeName);
        };

        fluid.test.runTests([
            "gpii.tests.mutationObserverTests"
        ]);

    });
})(jQuery);

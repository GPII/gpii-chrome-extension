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

/* global fluid, jqUnit, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        jqUnit.module("findFirstSelector Tests");

        fluid.defaults("gpii.tests.findFirstSelectorComp", {
            gradeNames: ["fluid.viewComponent"],
            selectors: {
                article: "article",
                div: "div",
                span: "span",
                p: "p"
            },
            invokers: {
                find: {
                    funcName: "gpii.chrome.utils.findFirstSelector",
                    args: ["{that}", "{arguments}.0"]
                },
                findWithDefault: {
                    funcName: "gpii.chrome.utils.findFirstSelector",
                    args: ["{that}", "{arguments}.0", "{that}.container"]
                }
            }
        });

        gpii.tests.findFirstSelectorComp.testCases = {
            singleExisting: {
                selectors: "article",
                expected: "article"
            },
            singleNotExisting: {
                selectors: "span"
            },
            multipleExisting: {
                selectors: ["article", "div"],
                expected: "article"
            },
            multipleNotExisting: {
                selectors: ["span", "p"]
            },
            startExisting: {
                selectors: ["div", "span"],
                expected: "div"
            },
            startNotExisting: {
                selectors: ["span", "article"],
                expected: "article"
            }
        };

        jqUnit.test("gpii.chrome.utils.findFirstSelector", function () {
            var that = gpii.tests.findFirstSelectorComp(".gpiic-utils-findFirstSelector");

            fluid.each(gpii.tests.findFirstSelectorComp.testCases, function (testCase, name) {
                var found = that.find(testCase.selectors);
                var foundWithDefault = that.findWithDefault(testCase.selectors);

                if (testCase.expected) {
                    jqUnit.assertTrue(name + ": the " + testCase.expected + " selector should be found", found.is(that.options.selectors[testCase.expected]));
                    jqUnit.assertTrue(name + "with default value: the " + testCase.expected + " selector should be found", foundWithDefault.is(that.options.selectors[testCase.expected]));
                } else {
                    jqUnit.assertUndefined(name + ": no elements should be found", found);
                    jqUnit.assertTrue(name + "with default value: the default should be returned", foundWithDefault.is(".gpiic-utils-findFirstSelector"));
                }
            });
        });
    });
})(jQuery);

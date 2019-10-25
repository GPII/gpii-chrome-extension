/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md
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

        fluid.defaults("gpii.tests.chrome.contentView", {
            gradeNames: ["gpii.chrome.contentView"],
            selectors: {
                toFind: "span"
            }
        });

        gpii.tests.chrome.contentView.asssertSelection = function (that, prefix, selection, selectorName, expected) {
            expected = $(expected);
            var selector = that.options.selectors[selectorName];

            jqUnit.assertEquals(prefix + ": " + expected.length + " element(s) were found.", expected.length, selection.length);

            selection.each(function (idx, elm) {
                elm = $(elm);
                jqUnit.assertTrue(prefix + ": The element at index " + idx + " matches the selector \"" + selector + "\"", elm.is(selector));
                jqUnit.assertTrue(prefix + ": The element at index " + idx + " is in the expected set", elm.is(expected));
            });
        };

        gpii.tests.chrome.contentView.assertSearch = function (that, prefix, method, expected) {
            var selection = that[method]("toFind");
            gpii.tests.chrome.contentView.asssertSelection(that, prefix + " - " + method, selection, "toFind", expected);
        };

        fluid.defaults("gpii.tests.contentView.check", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                func: "gpii.tests.chrome.contentView.asssertSelection",
                args: [
                    "{contentView}",
                    "{testCaseHolder}.options.testOpts.prefix",
                    "{contentView}.content",
                    "{testCaseHolder}.options.testOpts.selector",
                    "{testCaseHolder}.options.testOpts.expectedSelection"
                ]
            }, {
                func: "gpii.tests.chrome.contentView.assertSearch",
                args: [
                    "{contentView}",
                    "{testCaseHolder}.options.testOpts.prefix",
                    "locateInContent",
                    "{testCaseHolder}.options.testOpts.expectedInContent"
                ]
            }, {
                func: "gpii.tests.chrome.contentView.assertSearch",
                args: [
                    "{contentView}",
                    "{testCaseHolder}.options.testOpts.prefix",
                    "locateOutOfContent",
                    "{testCaseHolder}.options.testOpts.expectedOutOfContent"
                ]
            }]
        });

        fluid.defaults("gpii.tests.contentView.priority", {
            gradeNames: "fluid.test.sequence",
            sequenceElements: {
                main: {
                    gradeNames: "gpii.tests.contentView.check"
                }
            }
        });

        /******************************************************
         * Found Article Content
         ******************************************************/

        fluid.defaults("gpii.tests.contentViewArticleTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "gpii.tests.chrome.contentView",
                    container: ".gpiic-contentView-article"
                },
                contentViewTester: {
                    type: "gpii.tests.contentViewArticleTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contentViewArticleTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "Article",
                selector: "article",
                expectedSelection: ".gpiic-contentView-articleSelection",
                expectedInContent: ".gpiic-contentView-articleSelection-inContent",
                expectedOutOfContent: ".gpiic-contentView-articleSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "Article Content",
                    sequenceGrade: "gpii.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * Found Main Content
         ******************************************************/

        fluid.defaults("gpii.tests.contentViewMainTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "gpii.tests.chrome.contentView",
                    container: ".gpiic-contentView-main"
                },
                contentViewTester: {
                    type: "gpii.tests.contentViewMainTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contentViewMainTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "Main",
                selector: "main",
                expectedSelection: ".gpiic-contentView-mainSelection",
                expectedInContent: ".gpiic-contentView-mainSelection-inContent",
                expectedOutOfContent: ".gpiic-contentView-mainSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "Main Content",
                    sequenceGrade: "gpii.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * Found Generic Content
         ******************************************************/

        fluid.defaults("gpii.tests.contentViewGenericTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "gpii.tests.chrome.contentView",
                    container: ".gpiic-contentView-genericContent"
                },
                contentViewTester: {
                    type: "gpii.tests.contentViewGenericTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contentViewGenericTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "Generic",
                selector: "genericContent",
                expectedSelection: ".gpiic-contentView-genericSelection",
                expectedInContent: ".gpiic-contentView-genericSelection-inContent",
                expectedOutOfContent: ".gpiic-contentView-genericSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "Generic Content",
                    sequenceGrade: "gpii.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * All Content types present
         ******************************************************/

        fluid.defaults("gpii.tests.contentViewAllTypesTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "gpii.tests.chrome.contentView",
                    container: ".gpiic-contentView-allContent"
                },
                contentViewTester: {
                    type: "gpii.tests.contentViewAllTypesTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contentViewAllTypesTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "All Content Types",
                selector: "main",
                expectedSelection: ".gpiic-contentView-allSelection",
                expectedInContent: ".gpiic-contentView-allSelection-inContent",
                expectedOutOfContent: ".gpiic-contentView-allSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "All Content Types",
                    sequenceGrade: "gpii.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * No Content types present
         ******************************************************/

        fluid.defaults("gpii.tests.contentViewNoTypesTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "gpii.tests.chrome.contentView",
                    container: ".gpiic-contentView-noContent"
                },
                contentViewTester: {
                    type: "gpii.tests.contentViewNoTypesTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contentViewNoTypesTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "No Content Types",
                selector: "article",
                expectedSelection: ".gpiic-contentView-noSelection",
                expectedInContent: ".gpiic-contentView-noSelection-inContent",
                expectedOutOfContent: ".gpiic-contentView-noSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "No Content Types",
                    sequenceGrade: "gpii.tests.contentView.priority"
                }]
            }]
        });

        fluid.test.runTests([
            "gpii.tests.contentViewArticleTests",
            "gpii.tests.contentViewMainTests",
            "gpii.tests.contentViewGenericTests",
            "gpii.tests.contentViewAllTypesTests",
            "gpii.tests.contentViewNoTypesTests"
        ]);

    });
})(jQuery);

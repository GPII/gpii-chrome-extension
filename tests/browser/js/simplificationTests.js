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

/* global fluid, jqUnit, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        jqUnit.module("Simplification Tests");

        jqUnit.test("Initialization - simplify disabled", function () {
            jqUnit.expect(3);
            var that = gpii.simplify(".gpiic-simplify-init", {model: {simplify: false}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
            jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
        });

        jqUnit.test("Initialization - simplify enabled", function () {
            jqUnit.expect(3);
            var that = gpii.simplify(".gpiic-simplify-init", {model: {simplify: true}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertEquals("Visibility styling on the container should have been set", "hidden", that.container.css("visibility"));
            jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
        });

        jqUnit.test("Initialization - simplify enabled, wth nav", function () {
            jqUnit.expect(6);
            var that = gpii.simplify(".gpiic-simplify-init-withNav", {model: {simplify: true}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertEquals("Visibility styling on the container should have been set", "hidden", that.container.css("visibility"));
            jqUnit.assertEquals("The navigation toggle button should be inserted", 1, navToggle.length);
            jqUnit.assertEquals("The navToggle's text should be set", that.options.strings.navToggle, navToggle.text());
            jqUnit.assertTrue("The navToggle style should be set", navToggle.hasClass(that.options.styles.navToggle));
            jqUnit.assertEquals("The navToggle's pressed state should be set", "false", navToggle.attr("aria-pressed"));
        });

        jqUnit.test("Initialization - simplify enabled, noContent", function () {
            jqUnit.expect(4);
            var that = gpii.simplify(".gpiic-simplify-init-noContent", {model: {simplify: true}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
            jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
            jqUnit.assertEquals("Should not have found any content elements", 0, that.content.length);
        });

        jqUnit.test("findNav - generic", function () {
            jqUnit.expect(1);
            var that = gpii.simplify(".gpiic-simplify-navigation");

            jqUnit.assertEquals("Should have found all of the nav elements", 6, that.nav.length);
        });


        fluid.defaults("gpii.tests.simplifyTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            markupFixture: ".gpii-test-simplify",
            components: {
                simplify: {
                    type: "gpii.simplify",
                    container: ".gpii-test-simplify",
                    options: {
                        model: {
                            simplify: false,
                            showNav: false
                        }
                    }
                },
                simplifyTester: {
                    type: "fluid.tests.simplifyTester"
                }
            }
        });

        gpii.tests.simplifyTests.assertSimplified = function (that) {
            jqUnit.assertEquals("The container should be set to hidden", "hidden", that.container.css("visibility"));
            that.content.each(function (idx, node) {
                jqUnit.isVisible("The content element at index " + idx + " should be visible", node);
            });
            fluid.each(that.options.alwaysVisible, function (selector) {
                that.locate(selector).each(function (idx, node) {
                    jqUnit.isVisible("The always visible element at index " + idx + " should be visible", node);
                });
            });
            jqUnit.isVisible("The navigation toggle should be visible", that.locate("navToggle"));
        };

        gpii.tests.simplifyTests.assertNotSimplified = function (that) {
            jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
            jqUnit.notVisible("The navigation toggle should be visible", that.locate("navToggle"));
        };

        gpii.tests.simplifyTests.assertNavShown = function (that) {
            that.nav.each(function (idx, node) {
                jqUnit.isVisible("The navigation element at index " + idx + " should be visible", node);
            });
            jqUnit.assertEquals("The aria-pressed state for the nav toggle should be set to true", "true", that.locate("navToggle").attr("aria-pressed"));
        };

        gpii.tests.simplifyTests.assertNavNotShown = function (that) {
            that.nav.each(function (idx, node) {
                jqUnit.assertEquals("The navigation element at index " + idx + " should be set to hidden", "hidden", $(node).css("visibility"));
            });
            jqUnit.assertEquals("The aria-pressed state for the nav toggle should be set to false", "false", that.locate("navToggle").attr("aria-pressed"));
        };

        fluid.defaults("fluid.tests.simplifyTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Simplification Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 11,
                    sequence: [{
                        func: "{simplify}.applier.change",
                        args: ["simplify", true]
                    }, {
                        changeEvent: "{simplify}.applier.modelChanged",
                        path: "simplify",
                        listener: "gpii.tests.simplifyTests.assertSimplified",
                        args: ["{simplify}"]
                    }, {
                        jQueryTrigger: "click",
                        element: "{simplify}.dom.navToggle"
                    }, {
                        changeEvent: "{simplify}.applier.modelChanged",
                        path: "showNav",
                        listener: "gpii.tests.simplifyTests.assertNavShown",
                        args: ["{simplify}"]
                    }, {
                        func: "{simplify}.applier.change",
                        args: ["showNav", false]
                    }, {
                        changeEvent: "{simplify}.applier.modelChanged",
                        path: "showNav",
                        listener: "gpii.tests.simplifyTests.assertNavNotShown",
                        args: ["{simplify}"]
                    }, {
                        func: "{simplify}.applier.change",
                        args: ["simplify", false]
                    }, {
                        changeEvent: "{simplify}.applier.modelChanged",
                        path: "simplify",
                        listener: "gpii.tests.simplifyTests.assertNotSimplified",
                        args: ["{simplify}"]
                    }]
                }, {
                    name: "Dynamically added always visible element",
                    expect: 1,
                    sequence: [{
                        func: "{simplify}.applier.change",
                        args: ["simplify", true]
                    }, {
                        func: "fluid.tests.simplifyTester.injectElement",
                        args: ["{simplify}"]
                    }, {
                        event: "{simplify}.events.onAlwaysVisibleNodeAdded",
                        priority: "after:makeVisible",
                        listener: "fluid.tests.simplifyTester.assertElmVisible"
                    }]
                }]
            }]
        });

        fluid.tests.simplifyTester.injectElement = function (that) {
            var elm = $("<button class=\"gpiic-simplify-visible\">Test</button>");
            that.container.append(elm);
        };

        fluid.tests.simplifyTester.assertElmVisible = function (elm) {
            jqUnit.assertEquals("The element should be visible", "visible", elm.css("visibility"));
        };

        fluid.defaults("gpii.tests.simplifyNoNavToggleTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            markupFixture: ".gpii-test-simplify",
            components: {
                simplify: {
                    type: "gpii.simplify",
                    container: ".gpii-test-simplify",
                    options: {
                        injectNavToggle: false,
                        model: {
                            simplify: false,
                            showNav: false
                        }
                    }
                },
                simplifyTester: {
                    type: "fluid.tests.simplifyNoNavToggleTester"
                }
            }
        });

        gpii.tests.simplifyNoNavToggleTests.assertNoNavToggle = function (navToggleElm) {
            jqUnit.assertEquals("The nav toggle element should not exist", 0, navToggleElm.length);
        };

        fluid.defaults("fluid.tests.simplifyNoNavToggleTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Simplification Tests ",
                tests: [{
                    name: "No Nav Toggle",
                    expect: 2,
                    sequence: [{
                        func: "{simplify}.applier.change",
                        args: ["simplify", true]
                    }, {
                        changeEvent: "{simplify}.applier.modelChanged",
                        path: "simplify",
                        listener: "gpii.tests.simplifyNoNavToggleTests.assertNoNavToggle",
                        args: ["{simplify}.dom.navToggle"]
                    }, {
                        func: "{simplify}.applier.change",
                        args: ["simplify", false]
                    }, {
                        changeEvent: "{simplify}.applier.modelChanged",
                        path: "simplify",
                        listener: "gpii.tests.simplifyNoNavToggleTests.assertNoNavToggle",
                        args: ["{simplify}.dom.navToggle"]
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "gpii.tests.simplifyTests",
            "gpii.tests.simplifyNoNavToggleTests"
        ]);
    });
})(jQuery);

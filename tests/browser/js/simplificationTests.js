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
            jqUnit.expect(6);
            var that = gpii.simplify(".gpiic-simplify-init", {model: {simplify: true}});
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
            jqUnit.assertEquals("Should not have found any content elements", 0, that.findContent().length);
        });

        jqUnit.test("findContent - article", function () {
            jqUnit.expect(1);
            var that = gpii.simplify(".gpiic-simplify-article");
            var content = that.findContent();

            jqUnit.assertEquals("Should have found all article like elements", 4, content.length);
        });

        jqUnit.test("findContent - main", function () {
            jqUnit.expect(1);
            var that = gpii.simplify(".gpiic-simplify-main");
            var content = that.findContent();

            jqUnit.assertEquals("Should have found all main like elements", 4, content.length);
        });

        jqUnit.test("findContent - generic", function () {
            jqUnit.expect(1);
            var that = gpii.simplify(".gpiic-simplify-genericContent");
            var content = that.findContent();

            jqUnit.assertEquals("Should have found all generic content elements", 4, content.length);
        });

        jqUnit.test("findContent - all content", function () {
            jqUnit.expect(5);
            var that = gpii.simplify(".gpiic-simplify-allContent");
            var content = that.findContent();

            console.log(content);

            jqUnit.assertEquals("Should have only found all article like elements", 4, content.length);

            content.each(function (idx, node) {
                jqUnit.assertTrue("The elemen at index " + idx + " satisfies the article requirements", $(node).is(that.options.selectors.article));
            });
        });

        jqUnit.test("findNav - generic", function () {
            jqUnit.expect(1);
            var that = gpii.simplify(".gpiic-simplify-navigation");
            var nav = that.findNav();

            jqUnit.assertEquals("Should have found all of the nav elements", 8, nav.length);
        });


        fluid.defaults("gpii.tests.simplifyTests", {
            gradeNames: ["fluid.test.testEnvironment"],
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
            that.findContent().each(function (idx, node) {
                jqUnit.isVisible("The content element at index " + idx + " should be visible", node);
            });
            jqUnit.isVisible("The navigation toggle should be visible", that.locate("navToggle"));
        };

        gpii.tests.simplifyTests.assertNotSimplified = function (that) {
            jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
            jqUnit.notVisible("The navigation toggle should be visible", that.locate("navToggle"));
        };

        gpii.tests.simplifyTests.assertNavShown = function (that) {
            that.findNav().each(function (idx, node) {
                jqUnit.isVisible("The navigation element at index " + idx + " should be visible", node);
            });
            jqUnit.assertEquals("The aria-pressed state for the nav toggle should be set to true", "true", that.locate("navToggle").attr("aria-pressed"));
        };

        gpii.tests.simplifyTests.assertNotNavShown = function (that) {
            that.findNav().each(function (idx, node) {
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
                    expect: 12,
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
                        listener: "gpii.tests.simplifyTests.assertNotNavShown",
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
                }]
            }]
        });

        fluid.test.runTests([
            "gpii.tests.simplifyTests"
        ]);
    });
})(jQuery);

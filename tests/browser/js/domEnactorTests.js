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

/* global fluid, jqUnit, chrome, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        /****************
         * Chrome Mocks *
         ****************/

        // using the sinon-chrome stub, we return the correct path to the table of contents template
        chrome.runtime.getURL.returns("../../../node_modules/infusion/src/components/tableOfContents/html/TableOfContents.html");

        // mock message port
        gpii.tests.mockPort = {
            onMessage: {
                addListener: function (fn) {
                    gpii.tests.mockPort.onMessage.listeners.push(fn);
                },
                listeners: []
            },
            postMessage: function (msg) {
                fluid.each(gpii.tests.mockPort.onMessage.listeners, function (fn) {
                    fn(msg);
                });
            }
        };

        // using the sinon-chrome stub we return the mockPort
        chrome.runtime.connect.returns(gpii.tests.mockPort);

        /*********************
         * Common Assertions *
         *********************/

        gpii.tests.assertClasses = function (that, setting) {
            fluid.each(that.options.classes, function (className, settingName) {
                if (settingName === setting && className) {
                    jqUnit.assertTrue("The " + className + " class should be applied.", that.container.hasClass(className));
                } else if (className) {
                    jqUnit.assertFalse("The " + className + " class should not be applied.", that.container.hasClass(className));
                }
            });
        };

        /*****************************
         * Selection Highlight Tests *
         *****************************/

        jqUnit.module("Selection Highlight Tests");

        fluid.defaults("gpii.tests.selectionHighlightTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                selectionHighlight: {
                    type: "gpii.chrome.enactor.selectionHighlight",
                    container: ".gpii-test-selectionHighlight",
                    options: {
                        model: {
                            selectionHighlightEnabled: false,
                            selectionHighlightTheme: "yellow"
                        }
                    }
                },
                selectionHighlightTester: {
                    type: "fluid.tests.selectionHighlightTester"
                }
            }
        });

        fluid.defaults("fluid.tests.selectionHighlightTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Selection Highlight Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 17,
                    sequence: [{
                        func: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{selectionHighlight}.model.value"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["selectionHighlightEnabled", true]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"yellow\"", "yellow", "{selectionHighlight}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{selectionHighlight}", "yellow"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["selectionHighlightTheme", "pink"]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"pink\"", "pink", "{selectionHighlight}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{selectionHighlight}", "pink"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["selectionHighlightTheme", "green"]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"green\"", "green", "{selectionHighlight}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{selectionHighlight}", "green"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["selectionHighlightEnabled", false]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{selectionHighlight}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{selectionHighlight}", "default"]
                    }]
                }]
            }]
        });

        /***********************
         * High Contrast Tests *
         ***********************/

        jqUnit.module("Contrast Tests");

        gpii.tests.convertContrastTestCases = [{
            highContrastEnabled: true,
            highContrastTheme: "black-yellow",
            mapping: {
                "black-yellow": "by"
            },
            expected: "by"
        }, {
            highContrastEnabled: false,
            highContrastTheme: "black-yellow",
            mapping: {
                "black-yellow": "by"
            },
            expected: "default"
        }];

        jqUnit.test("test the gpii.chrome.enactor.contrast.convertContrast function", function () {
            jqUnit.expect(gpii.tests.convertContrastTestCases.length);
            fluid.each(gpii.tests.convertContrastTestCases, function (model) {
                var result = gpii.chrome.enactor.contrast.convertContrast(model);
                jqUnit.assertEquals("The output of the contrast conversion should be \"" + model.expected + "\"", model.expected, result);
            });
        });

        fluid.defaults("gpii.tests.contrastTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contrast: {
                    type: "gpii.chrome.enactor.contrast",
                    container: ".gpii-test-contrast",
                    options: {
                        model: {
                            highContrastEnabled: false,
                            highContrastTheme: "black-yellow"
                        }
                    }
                },
                contrastTester: {
                    type: "fluid.tests.contrastTester"
                }
            }
        });

        fluid.defaults("fluid.tests.contrastTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Contrast Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 26,
                    sequence: [{
                        func: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{contrast}.model.value"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["highContrastEnabled", true]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"yb\"", "by", "{contrast}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{contrast}", "by"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["highContrastTheme", "yellow-black"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"by\"", "yb", "{contrast}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{contrast}", "yb"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["highContrastTheme", "white-black"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"wb\"", "wb", "{contrast}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{contrast}", "wb"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["highContrastTheme", "black-white"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"bw\"", "bw", "{contrast}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{contrast}", "bw"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["highContrastEnabled", false]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{contrast}.model.value"]
                    }, {
                        func: "gpii.tests.assertClasses",
                        args: ["{contrast}", "default"]
                    }]
                }]
            }]
        });

        /***********************
         * Line Space Tests *
         ***********************/

        fluid.defaults("gpii.tests.lineSpaceTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                lineSpace: {
                    type: "gpii.chrome.enactor.lineSpace",
                    container: ".gpii-test-lineSpace",
                    options: {
                        model: {
                            value: 1
                        }
                    }
                },
                lineSpaceTester: {
                    type: "fluid.tests.lineSpaceTester"
                }
            }
        });

        gpii.tests.lineSpaceTests.assertLineSpace = function (that, expectedMultiplier, baseLineSpace) {
            baseLineSpace = baseLineSpace || 1.2;
            var expectedLineHeight = baseLineSpace * expectedMultiplier;
            jqUnit.assertEquals("The model value should be set to " + expectedMultiplier, expectedMultiplier, that.model.value);
            jqUnit.assertEquals("The line height should be set to " + expectedLineHeight, "line-height: " + expectedLineHeight + ";", that.container.attr("style"));
        };

        fluid.defaults("fluid.tests.lineSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Line Space Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 8,
                    sequence: [{
                        func: "gpii.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 1]
                    }, {
                        func: "{lineSpace}.applier.change",
                        args: ["value", 1.3]
                    }, {
                        changeEvent: "{lineSpace}.applier.modelChanged",
                        path: "value",
                        listener: "gpii.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 1.3]
                    }, {
                        func: "{lineSpace}.applier.change",
                        args: ["value", 2]
                    }, {
                        changeEvent: "{lineSpace}.applier.modelChanged",
                        path: "value",
                        listener: "gpii.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 2]
                    }, {
                        func: "{lineSpace}.applier.change",
                        args: ["value", 1]
                    }, {
                        changeEvent: "{lineSpace}.applier.modelChanged",
                        path: "value",
                        listener: "gpii.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 1]
                    }]
                }]
            }]
        });

        /***********************
         * Inputs Larger Tests *
         ***********************/

        fluid.defaults("gpii.tests.inputsLargerTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                inputsLarger: {
                    type: "gpii.chrome.enactor.inputsLarger",
                    container: ".gpii-test-inputsLarger",
                    options: {
                        model: {
                            value: false
                        }
                    }
                },
                inputsLargerTester: {
                    type: "fluid.tests.inputsLargerTester"
                }
            }
        });

        gpii.tests.inputsLargerTests.assertClass = function (that, applied) {
            var enhanceClass = that.options.cssClass;

            if (applied) {
                jqUnit.assertEquals("Inputs Larger should be enabled", applied, that.model.value);
                jqUnit.assertTrue("The " + enhanceClass + " class should be applied", that.container.hasClass(enhanceClass));
            } else {
                jqUnit.assertEquals("Inputs Larger should be disabled", applied, that.model.value);
                jqUnit.assertFalse("The " + enhanceClass + " class should not be applied", that.container.hasClass(enhanceClass));
            }
        };

        fluid.defaults("fluid.tests.inputsLargerTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Inputs Larger Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 6,
                    sequence: [{
                        func: "gpii.tests.inputsLargerTests.assertClass",
                        args: ["{inputsLarger}", false]
                    }, {
                        func: "{inputsLarger}.applier.change",
                        args: ["value", true]
                    }, {
                        changeEvent: "{inputsLarger}.applier.modelChanged",
                        path: "value",
                        listener: "gpii.tests.inputsLargerTests.assertClass",
                        args: ["{inputsLarger}", true]
                    }, {
                        func: "{inputsLarger}.applier.change",
                        args: ["value", false]
                    }, {
                        changeEvent: "{inputsLarger}.applier.modelChanged",
                        path: "value",
                        listener: "gpii.tests.inputsLargerTests.assertClass",
                        args: ["{inputsLarger}", false]
                    }]
                }]
            }]
        });

        /***************************
         * Table of Contents Tests *
         ***************************/

        fluid.defaults("gpii.tests.tocTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                toc: {
                    type: "gpii.chrome.enactor.tableOfContents",
                    container: ".gpii-test-toc",
                    options: {
                        selectors: {
                            tocContainer: ".flc-toc-tocContainer"
                        },
                        model: {
                            toc: false
                        }
                    }
                },
                tocTester: {
                    type: "fluid.tests.tocTester"
                }
            }
        });

        gpii.tests.tocTests.assertToCNotCreated = function (that) {
            jqUnit.assert("The Table of Contents should not be created", that.tableOfContents);
        };

        gpii.tests.tocTests.assertToc = function (that, applied) {
            var tocElm = that.locate("tocContainer");
            if (applied) {
                console.log("ToC elm:", tocElm.html(), "isVisible:", tocElm.css("display"));
                jqUnit.isVisible("The Table of Contents should be visible", tocElm);
                jqUnit.assertTrue("The Table of Contents should be populated", 0 < tocElm.children("ul").length);
            } else {
                jqUnit.notVisible("The Table of Contents should not be visible", tocElm);
            }
        };

        fluid.defaults("fluid.tests.tocTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Table of Contents Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 5,
                    sequence: [{
                        // The table of conents subcomonent is not initialized until the enactor is enabled for the first time.
                        func: "gpii.tests.tocTests.assertToCNotCreated",
                        args: ["{toc}"]
                    }, {
                        func: "{toc}.applier.change",
                        args: ["toc", true]
                    }, {
                        event: "{toc}.events.afterTocRender",
                        listener: "gpii.tests.tocTests.assertToc",
                        args: ["{toc}", true]
                    }, {
                        func: "jqUnit.assertTrue",
                        args: ["The model changed to true", "{toc}.model.toc"]
                    }, {
                        func: "{toc}.applier.change",
                        args: ["toc", false]
                    }, {
                        changeEvent: "{toc}.applier.modelChanged",
                        path: "toc",
                        listener: "gpii.tests.tocTests.assertToc",
                        args: ["{toc}", false]
                    }]
                }]
            }]
        });

        /********************
         * domEnactor Tests *
         ********************/

        fluid.defaults("gpii.tests.domEnactorTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                domEnactor: {
                    type: "gpii.chrome.domEnactor",
                    container: ".gpii-test-domEnactor"
                },
                domEnactorTester: {
                    type: "fluid.tests.domEnactorTester"
                }
            }
        });

        gpii.tests.domEnactorTests.assertConnection = function (that) {
            jqUnit.assertTrue("Connection only triggered once", chrome.runtime.connect.calledOnce);
            jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: "domEnactor-" + that.id}));
        };

        fluid.defaults("fluid.tests.domEnactorTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                messages: {
                    one: {testOne: 1},
                    two: {testTwo: 2}
                }
            },
            modules: [{
                name: "domEnactor Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 4,
                    sequence: [{
                        func: "gpii.tests.domEnactorTests.assertConnection",
                        args: ["{domEnactor}"]
                    }, {
                        func: "gpii.tests.mockPort.postMessage",
                        args: ["{that}.options.testOpts.messages.one"]
                    }, {
                        event: "{domEnactor}.events.onMessage",
                        listener: "jqUnit.assertDeepEq",
                        args: ["The onMessage event was fired", "{that}.options.testOpts.messages.one", "{arguments}.0"]
                    }, {
                        func: "gpii.tests.mockPort.postMessage",
                        args: ["{that}.options.testOpts.messages.two"]
                    }, {
                        changeEvent: "{domEnactor}.applier.modelChanged",
                        path: "testTwo",
                        listener: "jqUnit.assertEquals",
                        args: ["The model should have been updated after receiving the message", "{that}.options.testOpts.messages.two.testTwo", "{domEnactor}.model.testTwo"]
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "gpii.tests.selectionHighlightTests",
            "gpii.tests.contrastTests",
            "gpii.tests.lineSpaceTests",
            "gpii.tests.inputsLargerTests",
            "gpii.tests.tocTests",
            "gpii.tests.domEnactorTests"
        ]);
    });
})(jQuery);

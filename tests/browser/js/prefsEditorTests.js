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

        /****************
         * Chrome Mocks *
         ****************/

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

        /***************
         * store tests *
         ***************/

        jqUnit.module("Store Tests");

        fluid.defaults("gpii.tests.chrome.prefs.extensionPanel.store", {
            gradeNames: ["gpii.chrome.prefs.extensionPanel.store"],
            model: {
                remote: {
                    contrastTheme: "test-contrastTheme",
                    inputsLargerEnabled: "test-inputsLargerEnabled",
                    lineSpace: "test-lineSpace",
                    tableOfContentsEnabled: "test-tableOfContents",
                    fontSize: "test-fontSize",
                    selfVoicingEnabled: "test-selfVoicingEnabled",
                    simplifiedUiEnabled: "test-simplifiedUiEnabled",
                    dictionaryEnabled: "test-dictionaryEnabled",
                    selectionTheme: "test-selectionTheme",
                    clickToSelectEnabled: "test-clickToSelectEnabled"
                }
            }
        });

        gpii.tests.chrome.prefs.extensionPanel.store.prefs = {
            gpii_chrome_prefs_contrast: "test-contrastTheme",
            fluid_prefs_enhanceInputs: "test-inputsLargerEnabled",
            gpii_chrome_prefs_lineSpace: "test-lineSpace",
            fluid_prefs_tableOfContents: "test-tableOfContents",
            gpii_chrome_prefs_textSize: "test-fontSize",
            fluid_prefs_speak: "test-selfVoicingEnabled",
            gpii_chrome_prefs_simplify: "test-simplifiedUiEnabled",
            gpii_chrome_prefs_dictionary: "test-dictionaryEnabled",
            gpii_chrome_prefs_highlight: "test-selectionTheme",
            gpii_chrome_prefs_clickToSelect: "test-clickToSelectEnabled"
        };

        jqUnit.test("remote to prefernces model transformation", function () {
            var that = gpii.tests.chrome.prefs.extensionPanel.store();

            jqUnit.assertDeepEq("The remote model path was transformed to preferences", gpii.tests.chrome.prefs.extensionPanel.store.prefs, that.model.preferences);
        });

        /***************
         * Panel Tests *
         ***************/

        gpii.tests.changeInput = function (container, newValue) {
            fluid.changeElementValue(container.find("input"), newValue);
        };

        fluid.registerNamespace("gpii.tests.themePicker");

        gpii.tests.themePicker.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
            var inputs = that.locate("themeInput");
            var labels = that.locate("themeLabel");
            var messageBase = that.options.messageBase;

            jqUnit.assertEquals("The label text is " + messageBase.label, messageBase.label, that.locate("label").text());
            jqUnit.assertEquals("The description text is " + messageBase.description, messageBase.description, that.locate("description").text());

            jqUnit.assertEquals("There are " + expectedNumOfOptions + " contrast selections in the control", expectedNumOfOptions, inputs.length);
            jqUnit.assertEquals("The first theme is " + expectedContrast, expectedContrast, inputs.filter(":checked").val());

            var inputValue, label;
            fluid.each(inputs, function (input, index) {
                inputValue = input.value;
                label = labels.eq(index);
                jqUnit.assertTrue("The theme label has appropriate css applied", label.hasClass(that.options.classnameMap.theme[inputValue]));

                jqUnit.assertEquals("The aria-label is " + that.options.messageBase.contrast[index], that.options.messageBase.contrast[index], label.attr("aria-label"));
            });

            jqUnit.assertTrue("The default theme label has the default label css applied", labels.eq(0).hasClass(that.options.styles.defaultThemeLabel));
        };

        gpii.tests.themePicker.changeChecked = function (inputs, newValue) {
            inputs.prop("checked", false);
            var matchingInput = inputs.filter("[value='" + newValue + "']");
            matchingInput.prop("checked", "checked").change();
        };

        // Text Size
        fluid.defaults("gpii.tests.chrome.prefs.panel.textSize", {
            gradeNames: ["gpii.chrome.prefs.panel.textSize", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                textSize: 1
            },
            messageBase: {
                "textSizeLabel": "Text Size",
                "multiplier": "times",
                "textSizeDescr": "Adjust text size"
            },
            resources: {
                template: {
                    href: "../../../build/templates/PrefsEditorTemplate-textSize.html"
                }
            }
        });

        fluid.defaults("gpii.tests.textSizeAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                textSize: {
                    type: "gpii.tests.chrome.prefs.panel.textSize",
                    container: ".gpiic-textSize",
                    createOnEvent: "{textSizeTester}.events.onTestCaseStart"
                },
                textSizeTester: {
                    type: "gpii.tests.textSizeTester"
                }
            }
        });

        fluid.defaults("gpii.tests.textSizeTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                newValue: 3.5
            },
            modules: [{
                name: "Text Size Adjuster",
                tests: [{
                    expect: 2,
                    name: "rendering",
                    sequence: [{
                        event: "{gpii.tests.textSizeAdjusterTests textSize}.events.afterRender",
                        priority: "last:testing",
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["textSize", "{textSize}.model", 1]
                    }, {
                        func: "gpii.tests.changeInput",
                        args: ["{textSize}.dom.textSize", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["textSize", "{textSize}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "textSize", priority: "last"},
                        changeEvent: "{textSize}.applier.modelChanged"
                    }]
                }]
            }]
        });

        // Line Space
        fluid.defaults("gpii.tests.chrome.prefs.panel.lineSpace", {
            gradeNames: ["gpii.chrome.prefs.panel.lineSpace", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                lineSpace: 1
            },
            messageBase: {
                "lineSpaceLabel": "Line Spacing",
                "multiplier": "times",
                "lineSpaceDescr": "Adjust the spacing between lines of text"
            },
            resources: {
                template: {
                    href: "../../../build/templates/PrefsEditorTemplate-lineSpace.html"
                }
            }
        });

        fluid.defaults("gpii.tests.lineSpaceAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                lineSpace: {
                    type: "gpii.tests.chrome.prefs.panel.lineSpace",
                    container: ".gpiic-lineSpace",
                    createOnEvent: "{lineSpaceTester}.events.onTestCaseStart"
                },
                lineSpaceTester: {
                    type: "gpii.tests.lineSpaceTester",
                    options: {
                        modules: [{
                            name: "Test the line space settings panel"
                        }]
                    }
                }
            }
        });

        fluid.defaults("gpii.tests.lineSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                newValue: 2.6
            },
            modules: [{
                name: "Line Space Adjuster",
                tests: [{
                    expect: 2,
                    name: "rendering",
                    sequence: [
                        {
                            event: "{gpii.tests.lineSpaceAdjusterTests lineSpace}.events.afterRender",
                            priority: "last:testing",
                            listener: "fluid.tests.panels.utils.checkModel",
                            args: ["lineSpace", "{lineSpace}.model", 1]
                        }, {
                            func: "gpii.tests.changeInput",
                            args: ["{lineSpace}.dom.lineSpace", "{that}.options.testOptions.newValue"]
                        }, {
                            listener: "fluid.tests.panels.utils.checkModel",
                            args: ["lineSpace", "{lineSpace}.model", "{that}.options.testOptions.newValue"],
                            spec: {path: "lineSpace", priority: "last"},
                            changeEvent: "{lineSpace}.applier.modelChanged"
                        }
                    ]
                }]
            }]
        });

        // Contrast
        fluid.defaults("gpii.chrome.tests.prefs.panel.contrast", {
            gradeNames: ["gpii.chrome.prefs.panel.contrast", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            messageBase: {
                "contrast": ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"],
                "contrast-default": "Default",
                "contrast-bw": "Black on white",
                "contrast-wb": "White on black",
                "contrast-by": "Black on yellow",
                "contrast-yb": "Yellow on black",
                "label": "colour and contrast",
                "description": "Change the text and background colours"
            },
            model: {
                value: "default"
            },
            resources: {
                template: {
                    href: "../../../build/templates/PrefsEditorTemplate-contrast.html"
                }
            },
            classnameMap: {
                "theme": {
                    "default": "fl-prefsEditor-default-theme",
                    "bw": "fl-theme-bw",
                    "wb": "fl-theme-wb",
                    "by": "fl-theme-by",
                    "yb": "fl-theme-yb"
                }
            },
            controlValues: {
                theme: ["default", "bw", "wb", "by", "yb"]
            }
        });

        fluid.defaults("gpii.tests.contrastAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contrast: {
                    type: "gpii.chrome.tests.prefs.panel.contrast",
                    container: ".gpiic-contrast",
                    createOnEvent: "{contrastTester}.events.onTestCaseStart"
                },
                contrastTester: {
                    type: "gpii.tests.contrastTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contrastTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                expectedNumOfOptions: 5,
                defaultValue: "default",
                newValue: "bw"
            },
            modules: [{
                name: "Contrast Adjuster",
                tests: [{
                    expect: 16,
                    name: "rendering",
                    sequence: [{
                        listener: "gpii.tests.themePicker.testDefault",
                        args: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                        spec: {priority: "last"},
                        event: "{contrastAdjusterTests contrast}.events.afterRender"
                    }, {
                        func: "gpii.tests.themePicker.changeChecked",
                        args: ["{contrast}.dom.themeInput", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{contrast}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "value", priority: "last"},
                        changeEvent: "{contrast}.applier.modelChanged"
                    }]
                }]
            }]
        });

        // Highlight
        fluid.defaults("gpii.chrome.tests.prefs.panel.highlight", {
            gradeNames: ["gpii.chrome.prefs.panel.highlight", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            messageBase: {
                "contrast": ["Default", "Yellow highlight", "Green highlight", "Pink highlight"],
                "selectionHighlight-default": "Default",
                "selectionHighlight-yellow": "Yellow highlight",
                "selectionHighlight-green": "Green highlight",
                "selectionHighlight-pink": "Pink highlight",
                "label": "Selection Highlight",
                "description": "Change the highlight colour for text selections"
            },
            model: {
                value: "default"
            },
            resources: {
                template: {
                    href: "../../../build/templates/SelectionHighlightPanelTemplate.html"
                }
            },
            classnameMap: {
                "theme": {
                    "default": "fl-theme-prefsEditor-default",
                    "yellow": "gpii-ext-selection-preview-yellow",
                    "green": "gpii-ext-selection-preview-green",
                    "pink": "gpii-ext-selection-preview-pink"
                }
            }
        });

        fluid.defaults("gpii.tests.highlightAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                highlight: {
                    type: "gpii.chrome.tests.prefs.panel.highlight",
                    container: ".gpiic-highlight",
                    createOnEvent: "{highlightTester}.events.onTestCaseStart"
                },
                highlightTester: {
                    type: "gpii.tests.highlightTester"
                }
            }
        });

        fluid.defaults("gpii.tests.highlightTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                expectedNumOfOptions: 4,
                defaultValue: "default",
                newValue: "green"
            },
            modules: [{
                name: "Highlight Adjuster",
                tests: [{
                    expect: 14,
                    name: "rendering",
                    sequence: [{
                        listener: "gpii.tests.themePicker.testDefault",
                        args: ["{highlight}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                        spec: {priority: "last"},
                        event: "{highlightAdjusterTests highlight}.events.afterRender"
                    }, {
                        func: "gpii.tests.themePicker.changeChecked",
                        args: ["{highlight}.dom.themeInput", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{highlight}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "value", priority: "last"},
                        changeEvent: "{highlight}.applier.modelChanged"
                    }]
                }]
            }]
        });
        // Swith Adjuster Sequences

        fluid.defaults("gppi.tests.sequence.switchAdjusterRendering", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                event: "{testEnvironment panel}.events.afterRender",
                priority: "last:testing",
                args: ["{panel}", "{that}.options.defaultInputStatus"]
            }]
        });

        fluid.defaults("gppi.tests.sequence.switchAdjusterChange", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                jQueryTrigger: "click",
                element: "{panel}.switchUI.dom.control"
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", "{that}.options.newValue"],
                spec: {path: "value", priority: "last"},
                changeEvent: "{panel}.applier.modelChanged"
            }, {
                jQueryTrigger: "click",
                element: "{panel}.switchUI.dom.control"
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", "{that}.options.originalValue"],
                spec: {path: "value", priority: "last"},
                changeEvent: "{panel}.applier.modelChanged"
            }]
        });

        fluid.defaults("fluid.tests.switchAdjusterSequences", {
            gradeNames: "fluid.test.sequence",
            sequenceElements: {
                initialRendering: {
                    gradeNames: "gppi.tests.sequence.switchAdjusterRendering",
                    options: {
                        defaultInputStatus: "{fluid.test.testCaseHolder}.options.testOptions.defaultInputStatus"
                    }
                },
                inputChange: {
                    gradeNames: "gppi.tests.sequence.switchAdjusterChange",
                    priority: "after:initialRendering",
                    options: {
                        newValue: "{fluid.test.testCaseHolder}.options.testOptions.newValue",
                        originalValue: "{fluid.test.testCaseHolder}.options.testOptions.defaultInputStatus"
                    }
                }
            }
        });

        // Simplify
        fluid.defaults("fluid.tests.prefs.panel.simplify", {
            gradeNames: ["gpii.chrome.prefs.panel.simplify", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: false
            },
            messageBase: {
                "label": "Simplify",
                "description": "Only display the main content",
                "switchOn": "ON",
                "switchOff": "OFF"
            },
            resources: {
                template: {
                    href: "../../../build/templates/SimplifyPanelTemplate.html"
                }
            }
        });

        fluid.defaults("gpii.tests.simplifyAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                simplify: {
                    type: "fluid.tests.prefs.panel.simplify",
                    container: ".gpiic-simplify",
                    createOnEvent: "{simplifyTester}.events.onTestCaseStart"
                },
                simplifyTester: {
                    type: "gpii.tests.simplifyTester"
                }
            }
        });

        fluid.defaults("gpii.tests.simplifyTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                defaultInputStatus: false,
                newValue: true
            },
            modules: [{
                name: "Simplify Adjuster",
                tests: [{
                    expect: 8,
                    name: "rendering and input change",
                    sequenceGrade: "fluid.tests.switchAdjusterSequences"
                }]
            }]
        });

        // Dictionary
        fluid.defaults("fluid.tests.prefs.panel.dictionary", {
            gradeNames: ["gpii.chrome.prefs.panel.dictionary", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: false
            },
            messageBase: {
                "label": "Dictionary",
                "description": "Double click a word to show its definition",
                "switchOn": "ON",
                "switchOff": "OFF"
            },
            resources: {
                template: {
                    href: "../../../build/templates/DictionaryPanelTemplate.html"
                }
            }
        });

        fluid.defaults("gpii.tests.dictionaryAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                dictionary: {
                    type: "fluid.tests.prefs.panel.dictionary",
                    container: ".gpiic-dictionary",
                    createOnEvent: "{dictionaryTester}.events.onTestCaseStart"
                },
                dictionaryTester: {
                    type: "gpii.tests.dictionaryTester"
                }
            }
        });

        fluid.defaults("gpii.tests.dictionaryTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                defaultInputStatus: false,
                newValue: true
            },
            modules: [{
                name: "Dictionary Adjuster",
                tests: [{
                    expect: 8,
                    name: "rendering and input change",
                    sequenceGrade: "fluid.tests.switchAdjusterSequences"
                }]
            }]
        });

        // Click to Select
        fluid.defaults("fluid.tests.prefs.panel.clickToSelect", {
            gradeNames: ["gpii.chrome.prefs.panel.clickToSelect", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: false
            },
            messageBase: {
                "label": "Click To Select",
                "description": "Right click to select paragraph",
                "switchOn": "ON",
                "switchOff": "OFF"
            },
            resources: {
                template: {
                    href: "../../../build/templates/DictionaryPanelTemplate.html"
                }
            }
        });

        fluid.defaults("gpii.tests.clickToSelectAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                clickToSelect: {
                    type: "fluid.tests.prefs.panel.clickToSelect",
                    container: ".gpiic-clickToSelect",
                    createOnEvent: "{clickToSelectTester}.events.onTestCaseStart"
                },
                clickToSelectTester: {
                    type: "gpii.tests.clickToSelectTester"
                }
            }
        });

        fluid.defaults("gpii.tests.clickToSelectTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                defaultInputStatus: false,
                newValue: true
            },
            modules: [{
                name: "Click to Select Adjuster",
                tests: [{
                    expect: 8,
                    name: "rendering and input change",
                    sequenceGrade: "fluid.tests.switchAdjusterSequences"
                }]
            }]
        });

        /*********************
         * PrefsEditor Tests *
         *********************/

        // TODO: Added "integration" tests for the prefs editor using the gpii.chrome.prefs.auxSchema schema.
        //       Ensure that adjuster models are updated in both directions, and that the store is triggered.

        // fluid.defaults("gpii.tests.domEnactorTests", {
        //     gradeNames: ["fluid.test.testEnvironment"],
        //     components: {
        //         domEnactor: {
        //             type: "gpii.chrome.domEnactor",
        //             container: ".gpii-test-domEnactor"
        //         },
        //         domEnactorTester: {
        //             type: "fluid.tests.domEnactorTester"
        //         }
        //     }
        // });
        //
        // gpii.tests.domEnactorTests.assertConnection = function (that) {
        //     jqUnit.assertTrue("Connection only triggered once", chrome.runtime.connect.calledOnce);
        //     jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: "domEnactor-" + that.id}));
        // };
        //
        // fluid.defaults("fluid.tests.domEnactorTester", {
        //     gradeNames: ["fluid.test.testCaseHolder"],
        //     testOpts: {
        //         messages: {
        //             one: {testOne: 1},
        //             two: {testTwo: 2}
        //         }
        //     },
        //     modules: [{
        //         name: "domEnactor Tests",
        //         tests: [{
        //             name: "Port Connection",
        //             expect: 4,
        //             sequence: [{
        //                 func: "gpii.tests.domEnactorTests.assertConnection",
        //                 args: ["{domEnactor}"]
        //             }, {
        //                 func: "gpii.tests.mockPort.postMessage",
        //                 args: ["{that}.options.testOpts.messages.one"]
        //             }, {
        //                 event: "{domEnactor}.events.onMessage",
        //                 listener: "jqUnit.assertDeepEq",
        //                 args: ["The onMessage event was fired", "{that}.options.testOpts.messages.one", "{arguments}.0"]
        //             }, {
        //                 func: "gpii.tests.mockPort.postMessage",
        //                 args: ["{that}.options.testOpts.messages.two"]
        //             }, {
        //                 changeEvent: "{domEnactor}.applier.modelChanged",
        //                 path: "testTwo",
        //                 listener: "jqUnit.assertEquals",
        //                 args: ["The model should have been updated after receiving the message", "{that}.options.testOpts.messages.two.testTwo", "{domEnactor}.model.testTwo"]
        //             }]
        //         }]
        //     }]
        // });

        fluid.test.runTests([
            "gpii.tests.textSizeAdjusterTests",
            "gpii.tests.lineSpaceAdjusterTests",
            "gpii.tests.contrastAdjusterTests",
            "gpii.tests.highlightAdjusterTests",
            "gpii.tests.simplifyAdjusterTests",
            "gpii.tests.dictionaryAdjusterTests",
            "gpii.tests.clickToSelectAdjusterTests"
        ]);
    });
})(jQuery);

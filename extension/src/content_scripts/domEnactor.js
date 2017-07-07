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

/* global fluid, chrome */
"use strict";

(function ($, fluid) {

    var gpii = fluid.registerNamespace("gpii");

    // The main component to handle settings that require DOM manipulations.
    // It contains various subcomponents for handling various settings.
    fluid.defaults("gpii.chrome.domEnactor", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            // Accepted model values:
            // contrastTheme: string,
            // lineSpace: number,    // the multiplier to the current line space
            // inputsLarger: boolean,
            // selectionTheme: string,
            // simplifiedUiEnabled: boolean,
            // tableOfContents: boolean
        },
        events: {
            onMessage: null
        },
        listeners: {
            "onCreate.bindPortEvents": "gpii.chrome.domEnactor.bindPortEvents",
            "onMessage.updateModel": {
                changePath: "",
                value: "{arguments}.0"
            }
        },
        distributeOptions: {
            record: "{that}.container",
            target: "{that > fluid.prefs.enactor}.container"
        },
        components: {
            contrast: {
                type: "gpii.chrome.enactor.contrast",
                options: {
                    model: {
                        value: "{domEnactor}.model.contrastTheme"
                    }
                }
            },
            lineSpace: {
                type: "gpii.chrome.enactor.lineSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.lineSpace"
                    }
                }
            },
            inputsLarger: {
                type: "gpii.chrome.enactor.inputsLarger",
                options: {
                    model: {
                        value: "{domEnactor}.model.inputsLargerEnabled"
                    }
                }
            },
            selectionHighlight: {
                type: "gpii.chrome.enactor.selectionHighlight",
                options: {
                    model: {
                        value: "{domEnactor}.model.selectionTheme"
                    }
                }
            },
            simplify: {
                type: "gpii.chrome.enactor.simplify",
                options: {
                    model: {
                        simplify: "{domEnactor}.model.simplifiedUiEnabled"
                    }
                }
            },
            tableOfContents: {
                type: "gpii.chrome.enactor.tableOfContents",
                options: {
                    model: {
                        toc: "{domEnactor}.model.tableOfContents"
                    }
                }
            }
        }
    });

    gpii.chrome.domEnactor.bindPortEvents = function (that) {
        that.port = chrome.runtime.connect({name: "domEnactor-" + that.id});
        that.port.onMessage.addListener(that.events.onMessage.fire);
    };

    // High contrast
    fluid.defaults("gpii.chrome.enactor.contrast", {
        gradeNames: ["fluid.prefs.enactor.contrast"],
        classes: {
            "default": "",
            "bw": "gpii-ext-theme-bw",
            "wb": "gpii-ext-theme-wb",
            "by": "gpii-ext-theme-by",
            "yb": "gpii-ext-theme-yb"
        }
    });

    // Line space
    fluid.defaults("gpii.chrome.enactor.lineSpace", {
        gradeNames: ["fluid.prefs.enactor.lineSpace"],
        fontSizeMap: {
            "xx-small": "9px",
            "x-small": "11px",
            "small": "13px",
            "medium": "15px",
            "large": "18px",
            "x-large": "23px",
            "xx-large": "30px"
        }
    });

    // Inputs larger
    fluid.defaults("gpii.chrome.enactor.inputsLarger", {
        gradeNames: ["fluid.prefs.enactor.enhanceInputs"],
        cssClass: "gpii-ext-input-enhanced"
    });

    // Selection highlight
    fluid.defaults("gpii.chrome.enactor.selectionHighlight", {
        gradeNames: ["fluid.prefs.enactor.classSwapper"],
        classes: {
            "default": "",
            "yellow": "gpii-ext-selection-yellow",
            "green": "gpii-ext-selection-green",
            "pink": "gpii-ext-selection-pink"
        },
        listeners: {
            "onCreate.rightClick": {
                "this": "{that}.container",
                method: "contextmenu",
                args: ["{that}.handleRightClick"]
            }
        },
        invokers: {
            selectParagraph: "gpii.chrome.enactor.selectionHighlight.selectParagraph",
            handleRightClick: {
                funcName: "gpii.chrome.enactor.selectionHighlight.handleRightClick",
                args: ["{that}.model", "{arguments}.0", "{that}.selectParagraph"]
            }
        }
    });

    gpii.chrome.enactor.selectionHighlight.selectParagraph = function (node) {
        // find closest paragraph node
        node = $(node);
        var paragraphNode = node.closest("p")[0] || node[0];

        if (paragraphNode) {
            // create a range containg the paragraphNode
            var range = new Range();
            range.selectNode(paragraphNode);

            // retrieve the current selection
            var selection = window.getSelection();

            // clear all ranges in the selection
            selection.removeAllRanges();

            // add the new range based on the RIGHT-ClICKed paragraph
            selection.addRange(range);
        }
    };

    gpii.chrome.enactor.selectionHighlight.handleRightClick = function (model, event, handler) {
        // Check if the right mouse button was pressed so that this isn't
        // triggered by the context menu key ( https://api.jquery.com/contextmenu/ ).
        // Only trigger the handler if the appropriate model condition is met.
        if (event.button === 2 && model.selectParagraph) {
            handler(event.target);
            event.preventDefault();
        }
    };

    // Simplification
    fluid.defaults("gpii.chrome.enactor.simplify", {
        gradeNames: ["fluid.prefs.enactor", "gpii.simplify"]
    });

    // Table of contents
    fluid.defaults("gpii.chrome.enactor.tableOfContents", {
        gradeNames: ["fluid.prefs.enactor.tableOfContents"],
        tocTemplate: {
            // Converts the relative path to a fully-qualified URL in the extension.
            expander: {
                funcName: "chrome.runtime.getURL",
                args: ["templates/TableOfContents.html"]
            }
        },
        // Handle the initial model value when the component creation cycle completes instead of
        // relying on model listeners. See https://issues.fluidproject.org/browse/FLUID-5519
        listeners: {
            "onCreate.handleInitialModelValue": {
                listener: "{that}.applyToc",
                args: ["{that}.model.toc"]
            }
        }
    });

})(jQuery, fluid);

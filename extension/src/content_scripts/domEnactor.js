/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid */
"use strict";

(function ($, fluid) {

    var gpii = fluid.registerNamespace("gpii");

    // The main component to handle settings that require DOM manipulations.
    // It contains various subcomponents for handling various settings.
    fluid.defaults("gpii.chrome.domeEnactor", {
        gradeNames: ["fluid.viewComponent"],
        rootURL: null,   // must be supplied by integrators. The chrome extension root URL
        model: {
            // Accepted model values:
            // highContrastEnabled: boolean,
            // highContrastTheme: string,
            // textSize: number    // the multiplier to the current font size
            // lineSpace: number,    // the multiplier to the current line space
            // inputsLarger: boolean,
            // tableOfContents: boolean
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
                        highContrastEnabled: "{domeEnactor}.model.highContrastEnabled",
                        highContrastTheme: "{domeEnactor}.model.highContrastTheme"
                    }
                }
            },
            textSize: {
                type: "fluid.prefs.enactor.textSize",
                options: {
                    model: {
                        value: "{domeEnactor}.model.textSize"
                    }
                }
            },
            lineSpace: {
                type: "gpii.chrome.enactor.lineSpace",
                options: {
                    model: {
                        value: "{domeEnactor}.model.lineSpace"
                    }
                }
            },
            inputsLarger: {
                type: "gpii.chrome.enactor.inputsLarger",
                options: {
                    model: {
                        value: "{domeEnactor}.model.inputsLarger"
                    }
                }
            },
            tableOfContents: {
                type: "gpii.chrome.enactor.tableOfContents",
                options: {
                    rootURL: "{domeEnactor}.options.rootURL",
                    model: {
                        toc: "{domeEnactor}.model.tableOfContents"
                    }
                }
            }
        }
    });

    // High contrast
    fluid.defaults("gpii.chrome.enactor.contrast", {
        gradeNames: ["fluid.prefs.enactor.contrast"],
        classes: {
            "default": "",
            "bw": "fl-theme-bw",
            "wb": "fl-theme-wb",
            "by": "fl-theme-by",
            "yb": "fl-theme-yb",
            "lgdg": "fl-theme-lgdg"
        },
        modelRelay: {
            target: "value",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.chrome.enactor.contrast.convertContrast",
                args: {
                    highContrastEnabled: "{that}.model.highContrastEnabled",
                    highContrastTheme: "{that}.model.highContrastTheme"
                }
            }
        }
    });

    gpii.chrome.enactor.contrast.convertContrast = function (model) {
        var mapping = {
            "black-white": "bw",
            "white-black": "wb",
            "black-yellow": "by",
            "yellow-black": "yb"
        };

        return model.highContrastEnabled ? fluid.get(mapping, [model.highContrastTheme]) : "default";
    };

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

    // Line space
    fluid.defaults("gpii.chrome.enactor.inputsLarger", {
        gradeNames: ["fluid.prefs.enactor.inputsLarger"],
        cssClass: "fl-text-larger"
    });

    // Table of contents
    fluid.defaults("gpii.chrome.enactor.tableOfContents", {
        gradeNames: ["fluid.prefs.enactor.tableOfContents"],
        rootURL: null,   // must be supplied by integrators. The chrome extension root URL
        tocTemplate: {
            expander: {
                funcName: "fluid.stringTemplate",
                args: ["%rootURL%tocTemplate", {
                    rootURL: "{that}.options.rootURL",
                    tocTemplate: "templates/TableOfContents.html"
                }]
            }
        },
        // tocTemplate: "templates/TableOfContents.html",
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

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
        model: {
            // Accepted model values:
            // highContrastEnabled: boolean,
            // highContrastTheme: string
        },
        components: {
            contrast: {
                type: "gpii.chrome.enactor.contrast",
                container: "{domeEnactor}.container",
                options: {
                    model: {
                        highContrastEnabled: "{domeEnactor}.model.highContrastEnabled",
                        highContrastTheme: "{domeEnactor}.model.highContrastTheme"
                    }
                }
            }
        }
    });

    // High contrast
    // Container: DOM <body> element
    fluid.defaults("gpii.chrome.enactor.contrast", {
        gradeNames: ["fluid.prefs.enactor.contrast"],
        "classes": {
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

        if (!model.highContrastEnabled) {
            return "default";
        } else {
            return fluid.get(mapping, [model.highContrastTheme]);
        }
    };

})(jQuery, fluid);

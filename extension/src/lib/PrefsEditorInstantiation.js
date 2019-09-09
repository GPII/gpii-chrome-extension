/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md.
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid */
"use strict";

$("document").ready(function () {
    fluid.prefs.create("#gpiic-ext-adjusters", {
        build: {
            gradeNames: ["gpii.chrome.prefs.auxSchema"]
        },
        prefsEditor: {
            prefsEditor: {
                gradeNames: ["fluid.prefs.arrowScrolling"],
                listeners: {
                    "onReady.scrollToPanel": {
                        listener: "fluid.prefs.arrowScrolling.scrollToPanel",
                        args: ["{that}", "{that}.model.panelIndex"]
                    }
                },
                // TODO: Remove this modelListener after FLUID-6230 is addressed
                // https://issues.fluidproject.org/browse/FLUID-6230
                modelListeners: {
                    "panelIndex": {
                        listener: "fluid.prefs.arrowScrolling.scrollToPanel",
                        args: ["{that}", "{that}.model.panelIndex"],
                        includeSource: "scrollEvent"
                    }
                }
            }
        }
    });
});

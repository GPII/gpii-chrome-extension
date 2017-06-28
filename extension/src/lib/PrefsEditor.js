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

/* global fluid */
"use strict";

(function ($, fluid) {
    $("document").ready(function () {
        fluid.prefs.create("#gpiic-ext-adjusters", {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "loaderGrades": ["fluid.prefs.fullNoPreview"],
                    "terms": {
                        "templatePrefix": "../templates/",
                        "messagePrefix": "../messages/"
                    },
                    "template": "%templatePrefix/PrefsEditorPanel.html"
                }
            }
        });
    });
})(jQuery, fluid);

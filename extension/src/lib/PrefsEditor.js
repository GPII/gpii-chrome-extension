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
    fluid.defaults("gpii.chrome.prefs.extensionPanel", {
        gradeNames: ["fluid.prefs.fullNoPreview"],
        components: {
            prefsEditor: {
                options: {
                    modelListeners: {
                        "": {
                            listener: function (model) {
                                console.log("PrefsEditor Model:", model);
                            },
                            args: ["{that}.model"]
                        }
                    },
                    components: {
                        portBinding: {
                            type: "gpii.chrome.portBinding",
                            options: {
                                connectionName: "prefsEditor",
                                model: {
                                    contrastTheme: "{prefsEditor}.model.preferences.fluid_prefs_contrast",
                                    inputsLargerEnabled: "{prefsEditor}.model.preferences.fluid_prefs_enhanceInputs",
                                    lineSpace: "{prefsEditor}.model.preferences.fluid_prefs_lineSpace",
                                    tableOfContentsEnabled: "{prefsEditor}.model.preferences.fluid_prefs_tableOfContents",
                                    fontSize: "{prefsEditor}.model.preferences.fluid_prefs_textSize"
                                    // TODO: Add adjusters for the following
                                    // characterSpace:
                                    // dictionaryEnabled:
                                    // selectionTheme:
                                    // selfVoicingEnabled:
                                    // simplifiedUiEnabled:
                                    // syllabificationEnabled:
                                },
                                listeners: {
                                    "onMessage.refreshView": {
                                        listener: "{prefsEditor}.events.onPrefsEditorRefresh",
                                        priority: "after:updateModel"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    $("document").ready(function () {
        fluid.prefs.create("#gpiic-ext-adjusters", {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "loaderGrades": ["gpii.chrome.prefs.extensionPanel"],
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

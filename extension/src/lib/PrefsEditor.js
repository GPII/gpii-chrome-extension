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

    fluid.defaults("gpii.chrome.prefs.extensionPanel.store", {
        gradeNames: ["gpii.chrome.portBinding.store"],
        model: {
            // TODO: if possible automate the model relay bindings so that we don't
            //       have to know the model paths ahead of time.
            preferences: {
                fluid_prefs_contrast: "{that}.model.remote.contrastTheme",
                fluid_prefs_enhanceInputs: "{that}.model.remote.inputsLargerEnabled",
                fluid_prefs_lineSpace: "{that}.model.remote.lineSpace",
                fluid_prefs_tableOfContents: "{that}.model.remote.tableOfContentsEnabled",
                fluid_prefs_textSize: "{that}.model.remote.fontSize"
                // TODO: Add adjusters and model relays for the following:
                // characterSpace
                // dictionaryEnabled
                // selectionTheme
                // selfVoicingEnabled
                // simplifiedUiEnabled
                // syllabificationEnabled
            }
        }
    });

    fluid.contextAware.makeChecks({"gpii.chrome.prefs.portBinding": true});

    fluid.contextAware.makeAdaptation({
        distributionName: "gpii.chrome.prefs.portBinding.storeDistributor",
        targetName: "fluid.prefs.store",
        adaptationName: "strategy",
        checkName: "portBinding",
        record: {
            contextValue: "{gpii.chrome.prefs.portBinding}",
            gradeNames: "gpii.chrome.prefs.extensionPanel.store",
            priority: "after:user"
        }
    });

    fluid.defaults("gpii.chrome.prefs.extensionPanel", {
        gradeNames: ["fluid.prefs.fullNoPreview"],
        components: {
            prefsEditor: {
                options: {
                    // Set the initialModel to an empty object so that all of the model preferences are sent to the
                    // settings store.
                    members: {
                        initialModel: {}
                    },
                    modelListeners: {
                        "": {
                            // can't use the autoSave option because we need to exclude init
                            listener: "{that}.save",
                            excludeSource: "init"
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

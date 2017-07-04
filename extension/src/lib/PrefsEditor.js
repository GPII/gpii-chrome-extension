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
                gpii_chrome_prefs_contrast: "{that}.model.remote.contrastTheme",
                fluid_prefs_enhanceInputs: "{that}.model.remote.inputsLargerEnabled",
                gpii_chrome_prefs_lineSpace: "{that}.model.remote.lineSpace",
                fluid_prefs_tableOfContents: "{that}.model.remote.tableOfContentsEnabled",
                gpii_chrome_prefs_textSize: "{that}.model.remote.fontSize"
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
                        },
                        "{fluid.prefs.store}.model.preferences": {
                            listener: "{that}.fetch",
                            args: [], // removes the default arguments passed in by the model change event
                            includeSource: "onMessage"
                        }
                    }
                }
            }
        }
    });

    $("document").ready(function () {
        fluid.prefs.create("#gpiic-ext-adjusters", {
            build: {
                gradeNames: ["gpii.chrome.prefs.auxSchema"]
            }
        });
    });

    /**********
     * panels *
     **********/

    fluid.defaults("gpii.chrome.prefs.panel.textSize", {
        gradeNames: ["fluid.prefs.panel.textSize"],
        preferenceMap: {
            "gpii.chrome.prefs.textSize": {
                "model.textSize": "default",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.lineSpace", {
        gradeNames: ["fluid.prefs.panel.lineSpace"],
        preferenceMap: {
            "gpii.chrome.prefs.lineSpace": {
                "model.lineSpace": "default",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.contrast", {
        gradeNames: ["fluid.prefs.panel.contrast"],
        preferenceMap: {
            "gpii.chrome.prefs.contrast": {
                "model.value": "default",
                "controlValues.theme": "enum"
            }
        },
        // TODO: Remove the merge policy after FLUID-6165 has been addressed
        //       https://issues.fluidproject.org/browse/FLUID-6165
        mergePolicy: {
            "controlValues.theme": "replace"
        }
    });

    /***********
     * schemas *
     ***********/

    fluid.defaults("gpii.chrome.prefs.auxSchema", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "loaderGrades": ["gpii.chrome.prefs.extensionPanel"],
            "namespace": "gpii.chrome.prefs.constructed",
            "terms": {
                "templatePrefix": "../templates/",
                "messagePrefix": "../messages/"
            },
            "template": "%templatePrefix/PrefsEditorPanel.html",
            "message": "%messagePrefix/prefsEditor.json",
            "textSize": {
                "type": "gpii.chrome.prefs.textSize",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.textSize",
                    "container": ".flc-prefsEditor-text-size",
                    "message": "%messagePrefix/textSize.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-textSize.html"
                }
            },
            "lineSpace": {
                "type": "gpii.chrome.prefs.lineSpace",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.lineSpace",
                    "container": ".flc-prefsEditor-line-space",
                    "message": "%messagePrefix/lineSpace.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-lineSpace.html"
                }
            },
            "contrast": {
                "type": "gpii.chrome.prefs.contrast",
                "classes": {
                    "default": "fl-theme-prefsEditor-default",
                    "bw": "fl-theme-bw",
                    "wb": "fl-theme-wb",
                    "by": "fl-theme-by",
                    "yb": "fl-theme-yb"

                },
                "panel": {
                    "type": "gpii.chrome.prefs.panel.contrast",
                    "container": ".flc-prefsEditor-contrast",
                    "classnameMap": {"theme": "@contrast.classes"},
                    "template": "%templatePrefix/PrefsEditorTemplate-contrast.html",
                    "message": "%messagePrefix/contrast.json"
                }
            },
            "tableOfContents": {
                "type": "fluid.prefs.tableOfContents",
                "panel": {
                    "type": "fluid.prefs.panel.layoutControls",
                    "container": ".flc-prefsEditor-layout-controls",  // the css selector in the template where the panel is rendered
                    "template": "%templatePrefix/PrefsEditorTemplate-layout.html",
                    "message": "%messagePrefix/tableOfContents.json"
                }
            },
            "enhanceInputs": {
                "type": "fluid.prefs.enhanceInputs",
                "panel": {
                    "type": "fluid.prefs.panel.enhanceInputs",
                    "container": ".flc-prefsEditor-enhanceInputs",  // the css selector in the template where the panel is rendered
                    "template": "%templatePrefix/PrefsEditorTemplate-enhanceInputs.html",
                    "message": "%messagePrefix/enhanceInputs.json"
                }
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.textSize", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.textSize": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 4,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.lineSpace", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.lineSpace": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 3,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.contrast", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.contrast": {
                "type": "string",
                "default": "default",
                "enum": ["default", "bw", "wb", "by", "yb"]
            }
        }
    });

})(jQuery, fluid);

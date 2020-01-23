/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid, gpii */
"use strict";

(function ($, fluid) {

    // TODO: if possible automate the model transformation bindings so we don't
    //       have to know the model paths ahead of time.
    fluid.defaults("gpii.chrome.prefs.extensionPanel.store", {
        gradeNames: ["gpii.chrome.portBinding.store"],
        portName: "extensionPanel",
        rules: {
            "panelIndex": "panelIndex",
            "preferences.fluid_prefs_enhanceInputs": "settings.inputsLargerEnabled",
            "preferences.fluid_prefs_letterSpace": "settings.characterSpace",
            "preferences.fluid_prefs_speak": "settings.selfVoicingEnabled",
            "preferences.fluid_prefs_syllabification": "settings.syllabificationEnabled",
            "preferences.fluid_prefs_tableOfContents": "settings.tableOfContentsEnabled",
            "preferences.gpii_chrome_prefs_contrast": "settings.contrastTheme",
            "preferences.gpii_chrome_prefs_clickToSelect": "settings.clickToSelectEnabled",
            "preferences.gpii_chrome_prefs_highlight": "settings.selectionTheme",
            "preferences.gpii_chrome_prefs_lineSpace": "settings.lineSpace",
            "preferences.gpii_chrome_prefs_simplify": "settings.simplifiedUiEnabled",
            "preferences.gpii_chrome_prefs_textSize": "settings.fontSize",
            "preferences.gpii_chrome_prefs_wordSpace": "settings.wordSpace"
        },
        listeners: {
            "onRead.transform": {
                func: "gpii.chrome.prefs.extensionPanel.store.transform",
                priority: "after:encoding",
                args: ["{that}.options.rules", false, "{arguments}.0"]
            },
            "onWrite.transform": {
                func: "gpii.chrome.prefs.extensionPanel.store.transform",
                priority: "before:encoding",
                args: ["{that}.options.rules", true, "{arguments}.0"]
            },
            "onWriteResponse.transform": {
                func: "gpii.chrome.prefs.extensionPanel.store.transform",
                priority: "after:encoding",
                args: ["{that}.options.rules", false, "{arguments}.0"]
            }
        }
    });

    gpii.chrome.prefs.extensionPanel.store.transform = function (rules, invert, data) {
        rules = invert ? fluid.model.transform.invertConfiguration(rules) : rules;
        return fluid.model.transform(data, rules);
    };

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
        selectors: {
            loading: ".flc-loading"
        },
        listeners: {
            "onReady.removeSpinner": {
                "this": "{that}.dom.loading",
                method: "remove",
                args: []
            },
            "onReady.updateAria": {
                "this": "{that}.container",
                method: "removeAttr",
                args: ["aria-busy"]
            }
        },
        components: {
            prefsEditor: {
                options: {
                    invokers: {
                        writeImpl: {
                            funcName: "gpii.chrome.prefs.extensionPanel.writeImpl"
                        }
                    },
                    model: {
                        preferences: "{prefsEditorLoader}.model.preferences",
                        panelIndex: "{prefsEditorLoader}.model.panelIndex",
                        panelMaxIndex: "{prefsEditorLoader}.model.panelMaxIndex",
                        local: {
                            panelIndex: "{that}.model.panelIndex"
                        }
                    },
                    listeners: {
                        // auto fetch changes from the store
                        "{fluid.prefs.store}.events.onIncomingRead": {
                            listener: "{that}.fetch",
                            priority: "after:handle",
                            namespace: "autoFetchFromStore"
                        },
                        "afterFetch.updateEnhancer": {
                            listener: "{that}.applyChanges",
                            priority: "after:unblock"
                        }
                    },
                    modelListeners: {
                        "preferences": {
                            // can't use the autoSave option because we need to exclude init
                            listener: "{that}.save",
                            excludeSource: "init"
                        },
                        "panelIndex": {
                            // can't use the autoSave option because we need to exclude init
                            listener: "{that}.save",
                            excludeSource: "init"
                        }
                    }
                }
            }
        }
    });

    /**
     * Sends the prefsEditor.model to the store and fires onSave
     * Overrides the default writeImpl functionality as all of the model, including the default values, must be sent
     * to the store.
     *
     * @param {Component} that - the component
     * @param {Object} modelToSave - the model to be written
     *
     * @return {Promise} promise - a promise that is resolved when the model is saved.
     */
    gpii.chrome.prefs.extensionPanel.writeImpl = function (that, modelToSave) {
        var promise = fluid.promise();

        that.events.onSave.fire(modelToSave);
        var setPromise = that.setSettings(modelToSave);

        fluid.promise.follow(setPromise, promise);
        return promise;
    };

    /**********
     * panels *
     **********/

    fluid.defaults("gpii.chrome.prefs.panel.textSize", {
        gradeNames: ["fluid.prefs.panel.textSize"],
        preferenceMap: {
            "gpii.chrome.prefs.textSize": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        },
        distributeOptions: [{
            record: {
                scale: 2
            },
            target: "{that textfieldStepper}.options",
            namespace: "scale"
        }]
    });

    fluid.defaults("gpii.chrome.prefs.panel.lineSpace", {
        gradeNames: ["fluid.prefs.panel.lineSpace"],
        preferenceMap: {
            "gpii.chrome.prefs.lineSpace": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.wordSpace", {
        gradeNames: ["fluid.prefs.panel.wordSpace"],
        preferenceMap: {
            "gpii.chrome.prefs.wordSpace": {
                "model.value": "value",
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
                "model.value": "value",
                "controlValues.theme": "enum"
            }
        },
        stringArrayIndex: {
            theme: [
                "contrast-default",
                "contrast-bw",
                "contrast-wb",
                "contrast-by",
                "contrast-yb",
                "contrast-gw",
                "contrast-gd",
                "contrast-bbr"
            ]
        },
        controlValues: {
            theme: ["default", "bw", "wb", "by", "yb", "gw", "gd", "bbr"]
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.simplify", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "gpii.chrome.prefs.simplify": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.clickToSelect", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "gpii.chrome.prefs.clickToSelect": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.highlight", {
        gradeNames: ["fluid.prefs.panel.themePicker"],
        preferenceMap: {
            "gpii.chrome.prefs.highlight": {
                "model.value": "value",
                "controlValues.theme": "enum"
            }
        },
        selectors: {
            header: ".flc-prefsEditor-highlight-header"
        },
        selectorsToIgnore: ["header"],
        stringArrayIndex: {
            theme: ["selectionHighlight-default", "selectionHighlight-yellow", "selectionHighlight-green", "selectionHighlight-pink"]
        },
        controlValues: {
            theme: ["default", "yellow", "green", "pink"]
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
            "charSpace": {
                "type": "fluid.prefs.letterSpace",
                "panel": {
                    "type": "fluid.prefs.panel.letterSpace",
                    "container": ".flc-prefsEditor-char-space",
                    "message": "%messagePrefix/charSpace.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-letterSpace.html"
                }
            },
            "clickToSelect": {
                "type": "gpii.chrome.prefs.clickToSelect",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.clickToSelect",
                    "container": ".flc-prefsEditor-clickToSelect",
                    "template": "%templatePrefix/ClickToSelectPanelTemplate.html",
                    "message": "%messagePrefix/clickToSelect.json"
                }
            },
            "contrast": {
                "type": "gpii.chrome.prefs.contrast",
                "classes": {
                    "default": "fl-theme-prefsEditor-default",
                    "bw": "fl-theme-bw",
                    "wb": "fl-theme-wb",
                    "by": "fl-theme-by",
                    "yb": "fl-theme-yb",
                    "gd": "fl-theme-gd",
                    "gw": "fl-theme-gw",
                    "bbr": "fl-theme-bbr"

                },
                "panel": {
                    "type": "gpii.chrome.prefs.panel.contrast",
                    "container": ".flc-prefsEditor-contrast",
                    "classnameMap": {"theme": "@contrast.classes"},
                    "template": "%templatePrefix/PrefsEditorTemplate-contrast.html",
                    "message": "%messagePrefix/contrast.json"
                }
            },
            "enhanceInputs": {
                "type": "fluid.prefs.enhanceInputs",
                "panel": {
                    "type": "fluid.prefs.panel.enhanceInputs",
                    "container": ".flc-prefsEditor-enhanceInputs",
                    "template": "%templatePrefix/PrefsEditorTemplate-enhanceInputs.html",
                    "message": "%messagePrefix/enhanceInputs.json"
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
            "selectionHighlight": {
                "type": "gpii.chrome.prefs.highlight",
                "classes": {
                    "default": "fl-theme-prefsEditor-default",
                    "yellow": "gpii-ext-selection-preview-yellow",
                    "green": "gpii-ext-selection-preview-green",
                    "pink": "gpii-ext-selection-preview-pink"
                },
                "panel": {
                    "type": "gpii.chrome.prefs.panel.highlight",
                    "container": ".flc-prefsEditor-selectionHighlight",
                    "classnameMap": {"theme": "@selectionHighlight.classes"},
                    "template": "%templatePrefix/SelectionHighlightPanelTemplate.html",
                    "message": "%messagePrefix/selectionHighlight.json"
                }
            },
            "selfVoicing": {
                "type": "fluid.prefs.speak",
                "panel": {
                    "type": "fluid.prefs.panel.speak",
                    "container": ".flc-prefsEditor-selfVoicing",
                    "template": "%templatePrefix/PrefsEditorTemplate-speak.html",
                    "message": "%messagePrefix/speak.json"
                }
            },
            "simplify": {
                "type": "gpii.chrome.prefs.simplify",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.simplify",
                    "container": ".flc-prefsEditor-simplify",
                    "template": "%templatePrefix/SimplifyPanelTemplate.html",
                    "message": "%messagePrefix/simplify.json"
                }
            },
            "syllabification": {
                "type": "fluid.prefs.syllabification",
                "panel": {
                    "type": "fluid.prefs.panel.syllabification",
                    "container": ".flc-prefsEditor-syllabification",
                    "template": "%templatePrefix/PrefsEditorTemplate-syllabification.html",
                    "message": "%messagePrefix/syllabification.json"
                }
            },
            "tableOfContents": {
                "type": "fluid.prefs.tableOfContents",
                "panel": {
                    "type": "fluid.prefs.panel.layoutControls",
                    "container": ".flc-prefsEditor-layout-controls",
                    "template": "%templatePrefix/PrefsEditorTemplate-layout.html",
                    "message": "%messagePrefix/tableOfContents.json"
                }
            },
            "textSize": {
                "type": "gpii.chrome.prefs.textSize",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.textSize",
                    "container": ".flc-prefsEditor-text-size",
                    "message": "%messagePrefix/zoom.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-textSize.html"
                }
            },
            "wordSpace": {
                "type": "gpii.chrome.prefs.wordSpace",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.wordSpace",
                    "container": ".flc-prefsEditor-word-space",
                    "message": "%messagePrefix/wordSpace.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-wordSpace.html"
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
                "minimum": 0.25,
                "maximum": 5,
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
                "minimum": 0.7,
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
                "enum": ["default", "bw", "wb", "by", "yb", "gw", "gd", "bbr"]
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.simplify", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.simplify": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.clickToSelect", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.clickToSelect": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.highlight", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.highlight": {
                "type": "string",
                "default": "default",
                "enum": ["default", "yellow", "green", "pink"]
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.wordSpace", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.wordSpace": {
                "type": "number",
                "default": 1,
                "minimum": 0.7,
                "maximum": 4,
                "divisibleBy": 0.1
            }
        }
    });

})(jQuery, fluid);

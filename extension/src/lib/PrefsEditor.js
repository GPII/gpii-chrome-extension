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
                gpii_chrome_prefs_textSize: "{that}.model.remote.fontSize",
                fluid_prefs_speak: "{that}.model.remote.selfVoicingEnabled",
                gpii_chrome_prefs_simplify: "{that}.model.remote.simplifiedUiEnabled",
                gpii_chrome_prefs_dictionary: "{that}.model.remote.dictionaryEnabled",
                gpii_chrome_prefs_highlight: "{that}.model.remote.selectionTheme",
                gpii_chrome_prefs_clickToSelect: "{that}.model.remote.clickToSelectEnabled"
                // TODO: Add adjusters and model relays for the following:
                // characterSpace
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

    fluid.defaults("gpii.chrome.prefs.panel.simplify", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "gpii.chrome.prefs.simplify": {
                "model.value": "default"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.dictionary", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "gpii.chrome.prefs.dictionary": {
                "model.value": "default"
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.panel.clickToSelect", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "gpii.chrome.prefs.clickToSelect": {
                "model.value": "default"
            }
        }
    });

    // TODO: After FLUID-6166 has been addressed, make use of the new base grade to simplify this configuration.
    fluid.defaults("gpii.chrome.prefs.panel.highlight", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "gpii.chrome.prefs.highlight": {
                "model.value": "default",
                "controlValues.theme": "enum"
            }
        },
        mergePolicy: {
            "controlValues.theme": "replace",
            "stringArrayIndex.theme": "replace"
        },
        selectors: {
            themeRow: ".flc-prefsEditor-themeRow",
            themeLabel: ".flc-prefsEditor-theme-label",
            themeInput: ".flc-prefsEditor-themeInput",
            label: ".flc-prefsEditor-selectionHighlight-label",
            selectionHighlightDescr: ".flc-prefsEditor-selectionHighlight-descr"
        },
        listeners: {
            "afterRender.style": "{that}.style"
        },
        stringArrayIndex: {
            theme: ["selectionHighlight-default", "selectionHighlight-yellow", "selectionHighlight-green", "selectionHighlight-pink"]
        },
        styles: {
            defaultThemeLabel: "fl-prefsEditor-contrast-defaultThemeLabel"
        },
        repeatingSelectors: ["themeRow"],
        protoTree: {
            label: {messagekey: "selectionHighlightLabel"},
            selectionHighlightDescr: {messagekey: "selectionHighlightDescr"},
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "themeRow",
                labelID: "themeLabel",
                inputID: "themeInput",
                selectID: "theme-radio",
                tree: {
                    optionnames: "${{that}.msgLookup.theme}",
                    optionlist: "${{that}.options.controlValues.theme}",
                    selection: "${value}"
                }
            }
        },
        controlValues: {
            theme: ["default", "yellow", "green", "pink"]
        },
        markup: {
            // Aria-hidden needed on fl-preview-A and Display 'a' created as pseudo-content in css to prevent AT from reading out display 'a' on IE, Chrome, and Safari
            // Aria-hidden needed on fl-crossout to prevent AT from trying to read crossout symbol in Safari
            label: "<span class=\"fl-preview-A\" aria-hidden=\"true\"></span><span class=\"fl-hidden-accessible\">%theme</span><div class=\"fl-crossout\" aria-hidden=\"true\"></div>"
        },
        invokers: {
            style: {
                funcName: "fluid.prefs.panel.contrast.style",
                args: [
                    "{that}.dom.themeLabel",
                    "{that}.msgLookup.theme",
                    "{that}.options.markup.label",
                    "{that}.options.controlValues.theme",
                    "default",
                    "{that}.options.classnameMap.theme",
                    "{that}.options.styles.defaultThemeLabel"
                ]
            }
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
            "dictionary": {
                "type": "gpii.chrome.prefs.dictionary",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.dictionary",
                    "container": ".flc-prefsEditor-dictionary",
                    "template": "%templatePrefix/DictionaryPanelTemplate.html",
                    "message": "%messagePrefix/dictionary.json"
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
            "clickToSelect": {
                "type": "gpii.chrome.prefs.clickToSelect",
                "panel": {
                    "type": "gpii.chrome.prefs.panel.clickToSelect",
                    "container": ".flc-prefsEditor-clickToSelect",
                    "template": "%templatePrefix/ClickToSelectPanelTemplate.html",
                    "message": "%messagePrefix/clickToSelect.json"
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

    fluid.defaults("gpii.chrome.prefs.schemas.simplify", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.simplify": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("gpii.chrome.prefs.schemas.dictionary", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "gpii.chrome.prefs.dictionary": {
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

})(jQuery, fluid);

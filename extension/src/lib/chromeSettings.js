/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
 * Copyright 2017-2018 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, gpii */

"use strict";

// fluid.relayRecursionBailout = 1000;

fluid.defaults("gpii.chrome.settings", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    defaultSettings: {
        // not all of the following settings are in the common terms yet.
        // and may need to be updated once they are added there.
        captionsEnabled: false, // from captionsEnabled
        characterSpace: 1, // from characterSpace
        contrastTheme: "default", // from highContrastEnabled and highContrastTheme
        fontSize: 1, // from fontSize
        inputsLargerEnabled: false, // from inputsLargerEnabled
        lineSpace: 1, // from lineSpace
        selectionTheme: "default", // from highlightColor
        selfVoicingEnabled: false, // from selfVoicingEnabled
        simplifiedUiEnabled: false, // from simplifiedUiEnabled
        syllabificationEnabled: false, // from syllabificationEnabled
        tableOfContentsEnabled: false, // from tableOfContents,
        wordSpace: 1 // from wordSpace
    },
    model: {
        settings: "{settings}.options.defaultSettings"
    },
    invokers: {
        updateSettings: {
            funcName: "gpii.chrome.settings.updateSettings",
            args: ["{that}",  "{arguments}.0"]
        }
    },
    listeners: {
        "{wsConnector}.events.onSettingsChange": "{settings}.updateSettings"
    },
    modelListeners: {
        "": {
            func: function (change) {
                console.log("gpii.chrome.settings model change:", change);
            },
            args: ["{change}"],
            priority: "first"
        }
    },
    components: {
        domSettingsApplier: {
            type: "gpii.chrome.domSettingsApplier",
            options: {
                model: {
                    settings: "{settings}.model.settings"
                }
                // model: "{settings}.model"
            }
        },
        zoom: {
            type: "gpii.chrome.zoom",
            options: {
                model: {
                    magnifierEnabled: true, // set to true because fontSize is always enabled
                    magnification: "{settings}.model.settings.fontSize"
                }
            }
        },
        wsConnector: {
            type: "gpii.wsConnector",
            options: {
                solutionId: "net.gpii.uioPlus",
                flowManager: "ws://localhost:8081/browserChannel",
                retryTime: 10
            }
        },
        // contextMenuPanel: {
        //     type: "gpii.chrome.contextMenuPanel",
        //     options: {
        //         model: "{settings}.model",
        //         strings: {
        //             captions: "youtube captions",
        //             inputsLarger: "enhance inputs",
        //             rightClickToSelect: "right-click to select",
        //             selfVoicing: "text-to-speech",
        //             simplifiedUI: "reading mode",
        //             syllabification: "syllables",
        //             tableOfContents: "table of contents"
        //         },
        //         distributeOptions: {
        //             preferences: {
        //                 target: "{that subMenu}.options.components",
        //                 record: {
        //                     "syllabification": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.syllabification"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.syllabificationEnabled"
        //                             }
        //                         }
        //                     },
        //                     "rightClickToSelect": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         priority: "after:syllabification",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.rightClickToSelect"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.clickToSelectEnabled"
        //                             }
        //                         }
        //                     },
        //                     "selfVoicing": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         priority: "after:rightClickToSelect",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.selfVoicing"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.selfVoicingEnabled"
        //                             }
        //                         }
        //                     },
        //                     "simplifiedUI": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         priority: "after:selfVoicing",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.simplifiedUI"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.simplifiedUiEnabled"
        //                             }
        //                         }
        //                     },
        //                     "tableOfContents": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         priority: "after:simplifiedUI",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.tableOfContents"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.tableOfContentsEnabled"
        //                             }
        //                         }
        //                     },
        //                     "inputsLarger": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         priority: "after:tableOfContents",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.inputsLarger"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.inputsLargerEnabled"
        //                             }
        //                         }
        //                     },
        //                     "captions": {
        //                         type: "gpii.chrome.contextItem.checkbox",
        //                         priority: "after:inputsLarger",
        //                         options: {
        //                             contextProps: {
        //                                 title: "{contextMenuPanel}.options.strings.captions"
        //                             },
        //                             model: {
        //                                 value: "{contextMenuPanel}.model.settings.captionsEnabled"
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }
});

gpii.chrome.settings.updateSettings = function (that, settings) {
    that.applier.change("settings", settings || that.options.defaultSettings);
};

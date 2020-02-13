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

/* eslint-env node */
/* global fluid, gpii */

"use strict";

fluid.defaults("gpii.chrome.settings", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent", "fluid.contextAware"],
    defaultSettings: {
        // not all of the following settings are in the common terms yet.
        // and may need to be updated once they are added there.
        characterSpace: 1, // from characterSpace
        clickToSelectEnabled: false,
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
        // A dedicated invoker instead of declaratively setting up the model change is required to provide a default
        // value for the `settings` to set. Specifically this is necessary for the web socket connection so that the
        // `settings` can be "reset" by Morphic when a user is keyed out.
        updateSettings: {
            funcName: "gpii.chrome.settings.updateSettings",
            args: ["{that}",  "{arguments}.0"]
        }
    },
    components: {
        domSettingsApplier: {
            type: "gpii.chrome.domSettingsApplier",
            options: {
                model: "{settings}.model"
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
        contextMenuPanel: {
            type: "gpii.chrome.settingsContextPanel",
            options: {
                model: "{settings}.model",
                distributeOptions: {
                    reset: {
                        target: "{that reset}.options.invokers.click",
                        record: {
                            func: "{settings}.updateSettings",
                            args: ["{settings}.options.defaultSettings"]
                        }
                    }
                }
            }
        }
    }
});

gpii.chrome.settings.updateSettings = function (that, settings) {
    that.applier.change("settings", settings || that.options.defaultSettings);
};

fluid.defaults("gpii.chrome.settingsContextPanel", {
    gradeNames: ["gpii.chrome.contextMenuPanel"],
    strings: {
        inputsLarger: "enhance inputs",
        rightClickToSelect: "right-click to select",
        selfVoicing: "text-to-speech",
        simplifiedUI: "reading mode",
        syllabification: "syllables",
        tableOfContents: "table of contents"
    },
    events: {
        afterContextMenuItemsCreated: null
    },
    listeners: {
        "onCreate.createContextMenuItems": "gpii.chrome.contextMenuPanel.createContextMenuItems"
    },
    components: {
        "syllabification": {
            type: "gpii.chrome.contextItem.checkbox",
            options: {
                priority: "after:parent",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.syllabification",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.syllabificationEnabled"
                }
            }
        },
        "rightClickToSelect": {
            type: "gpii.chrome.contextItem.checkbox",
            options: {
                priority: "after:syllabification",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.rightClickToSelect",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.clickToSelectEnabled"
                }
            }
        },
        "selfVoicing": {
            type: "gpii.chrome.contextItem.checkbox",
            options: {
                priority: "after:rightClickToSelect",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.selfVoicing",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.selfVoicingEnabled"
                }
            }
        },
        "simplifiedUI": {
            type: "gpii.chrome.contextItem.checkbox",
            options: {
                priority: "after:selfVoicing",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.simplifiedUI",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.simplifiedUiEnabled"
                }
            }
        },
        "tableOfContents": {
            type: "gpii.chrome.contextItem.checkbox",
            options: {
                priority: "after:simplifiedUI",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.tableOfContents",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.tableOfContentsEnabled"
                }
            }
        },
        "inputsLarger": {
            type: "gpii.chrome.contextItem.checkbox",
            options: {
                priority: "after:tableOfContents",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.inputsLarger",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.inputsLargerEnabled"
                }
            }
        }
    }
});

/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2019 OCAD University
 *
 * Licensed under the New BSD license. You may not use "this" file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, require */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

fluid.defaults("gpii.chrome.contextMenuPanel", {
    gradeNames: ["fluid.modelComponent"],
    components: {
        "captions": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "youtube captions"
                },
                model: {
                    value: "{contextMenuPanel}.model.captionsEnabled"
                }
            }
        },
        "inputsLarger": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "enhance inputs"
                },
                model: {
                    value: "{contextMenuPanel}.model.inputsLargerEnabled"
                }
            }
        },
        "rightClickToSelect": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "right-click to select"
                },
                model: {
                    value: "{contextMenuPanel}.model.clickToSelectEnabled"
                }
            }
        },
        "selfVoicing": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "text-to-speech"
                },
                model: {
                    value: "{contextMenuPanel}.model.selfVoicingEnabled"
                }
            }
        },
        "simplifiedUI": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "reading mode"
                },
                model: {
                    value: "{contextMenuPanel}.model.simplifiedUIEnabled"
                }
            }
        },
        "syllabification": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "syllables"
                },
                model: {
                    value: "{contextMenuPanel}.model.syllabificationEnabled"
                }
            }
        },
        "tableOfContents": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "table of contents"
                },
                model: {
                    value: "{contextMenuPanel}.model.tableOfContentsEnabled"
                }
            }
        }
    }

});

fluid.defaults("gpii.chrome.contextItem", {
    gradeNames: ["fluid.modelComponent"],
    contextProps: {
        type: "checkbox",
        id: "{that}.id",
        title: "", // text to display in the menu
        checked: "{that}.model.value",
        contexts: ["browser_action"],
        onclick: "{that}.events.onClick.fire"
    },
    model: {
        value: null
    },
    events: {
        onClick: null,
        onContextItemCreated: null
    },
    listeners: {
        "onCreate.createContextMenuItem": {
            "this": "chrome.contextMenus",
            method: "create",
            args: ["{that}.options.contextProps", "{that}.events.onContextItemCreated.fire"]
        },
        "onDestroy.removeContextMenuItem": {
            "this": "chrome.contextMenus",
            method: "remove",
            args: ["{that}.options.contextProps.id"]
        },
        "onClick.updateModel": {
            changePath: "value",
            value: "{arguments}.0.checked"
        }
    },
    modelListeners: {
        "value": {
            funcName: "{that}.update",
            args: ["{change}.value"],
            excludeSource: ["init"],
            namespace: "upateContextMenuItem"
        }
    },
    invokers: {
        update: {
            "this": "chrome.contextMenus",
            method: "update",
            args: ["{that}.id", {checked: "{arguments}.0"}]
        }
    }
});

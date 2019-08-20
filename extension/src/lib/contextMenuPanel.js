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
    events: {
        onParentItemReady: null
    },
    components: {
        "parent": {
            type: "gpii.chrome.contextItem",
            options: {
                contextProps: {
                    title: "Preferences Quick Panel",
                },
                events: {
                    onContextItemCreated: "{contextMenuPanel}.events.onParentItemReady"
                }
            }
        },
        "reset": {
            type: "gpii.chrome.contextItem",
            createOnEvent: "onParentItemReady",
            options: {
                contextProps: {
                    title: "Reset",
                }
            }
        },
        "subMenu": {
            type: "fluid.component",
            createOnEvent: "onParentItemReady",
            options: {
                parentId: "{parent}.options.contextProps.id",
                distributeOptions: {
                    "parentID": {
                        source: "{that}.options.parentId",
                        target: "{that > gpii.chrome.contextItem}.options.contextProps.parentId"
                    }
                },
                components: {
                    "syllabification": {
                        type: "gpii.chrome.contextItem.checkbox",
                        options: {
                            contextProps: {
                                title: "syllables"
                            },
                            model: {
                                value: "{contextMenuPanel}.model.syllabificationEnabled"
                            }
                        }
                    },
                    "rightClickToSelect": {
                        type: "gpii.chrome.contextItem.checkbox",
                        priority: "after:syllabification",
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
                        type: "gpii.chrome.contextItem.checkbox",
                        priority: "after:rightClickToSelect",
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
                        type: "gpii.chrome.contextItem.checkbox",
                        priority: "after:selfVoicing",
                        options: {
                            contextProps: {
                                title: "reading mode"
                            },
                            model: {
                                value: "{contextMenuPanel}.model.simplifiedUIEnabled"
                            }
                        }
                    },
                    "tableOfContents": {
                        type: "gpii.chrome.contextItem.checkbox",
                        priority: "after:simplifiedUI",
                        options: {
                            contextProps: {
                                title: "table of contents"
                            },
                            model: {
                                value: "{contextMenuPanel}.model.tableOfContentsEnabled"
                            }
                        }
                    },
                    "inputsLarger": {
                        type: "gpii.chrome.contextItem.checkbox",
                        priority: "after:tableOfContents",
                        options: {
                            contextProps: {
                                title: "enhance inputs"
                            },
                            model: {
                                value: "{contextMenuPanel}.model.inputsLargerEnabled"
                            }
                        }
                    },
                    "captions": {
                        type: "gpii.chrome.contextItem.checkbox",
                        priority: "after:inputsLarger",
                        options: {
                            contextProps: {
                                title: "youtube captions"
                            },
                            model: {
                                value: "{contextMenuPanel}.model.captionsEnabled"
                            }
                        }
                    }
                }
            }
        }
    }
});

fluid.defaults("gpii.chrome.contextItem", {
    gradeNames: ["fluid.component"],
    contextProps: {
        id: "{that}.id",
        title: "", // text to display in the menu
        contexts: ["browser_action"]
    },
    events: {
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
        }
    },
    invokers: {
        update: {
            "this": "chrome.contextMenus",
            method: "update",
            args: ["{that}.options.contextProps.id", "{arguments}.0"]
        }
    }
});

fluid.defaults("gpii.chrome.contextItem.checkbox", {
    gradeNames: ["gpii.chrome.contextItem", "fluid.modelComponent"],
    contextProps: {
        type: "checkbox",
        checked: "{that}.model.value",
        onclick: "{that}.events.onClick.fire"
    },
    model: {
        value: false
    },
    events: {
        onClick: null
    },
    listeners: {
        "onClick.updateModel": {
            changePath: "value",
            value: "{arguments}.0.checked"
        }
    },
    modelListeners: {
        "value": {
            funcName: "{that}.update",
            args: [{checked: "{change}.value"}],
            excludeSource: ["init"],
            namespace: "updateContextMenuItem"
        }
    }
});

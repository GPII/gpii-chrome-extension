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
    strings: {
        parent: "Preferences Quick Panel",
        reset: "Reset"
    },
    components: {
        "parent": {
            type: "gpii.chrome.contextItem.parent",
            options: {
                contextProps: {
                    title: "{contextMenuPanel}.options.strings.parent"
                }
            }
        },
        "reset": {
            type: "gpii.chrome.contextItem.button",
            createOnEvent: "{parent}.events.onContextItemCreated",
            options: {
                contextProps: {
                    title: "{contextMenuPanel}.options.strings.reset"
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

fluid.defaults("gpii.chrome.contextItem.button", {
    gradeNames: ["gpii.chrome.contextItem"],
    contextProps: {
        onclick: "{that}.click"
    },
    invokers: {
        // must be supplied in a concrete implementation
        click: "fluid.notImplemented"
    }
});

fluid.defaults("gpii.chrome.contextItem.parent", {
    gradeNames: ["gpii.chrome.contextItem"],
    components: {
        "subMenuItems": {
            type: "gpii.chrome.contextItem.subMenu",
            createOnEvent: "onContextItemCreated",
            options: {
                parentId: "{parent}.options.contextProps.id"
            }
        }
    }
});

fluid.defaults("gpii.chrome.contextItem.subMenu", {
    gradeNames: ["fluid.component"],
    parentId: "", // to be set in parent grade or by integrator
    distributeOptions: {
        "parentId": {
            source: "{that}.options.parentId",
            target: "{that > gpii.chrome.contextItem}.options.contextProps.parentId"
        }
    }
});

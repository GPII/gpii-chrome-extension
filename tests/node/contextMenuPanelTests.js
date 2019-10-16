/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2019 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global require */

"use strict";

var fluid = require("infusion");
var chrome = fluid.require("sinon-chrome"); // eslint-disable-line no-unused-vars
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var gpii = fluid.registerNamespace("gpii"); // eslint-disable-line no-unused-vars

require("./testUtils.js");
require("../../extension/src/lib/contextMenuPanel.js");

/***********************************************************
 * Test helpers
 ***********************************************************/

fluid.defaults("gpii.tests.chrome.contextItem", {
    gradeNames: ["gpii.chrome.contextItem"],
    contextProps: {
        title: "context_item"
    }
});

fluid.defaults("gpii.tests.contextMenuTestEnvironment", {
    gradeNames: ["gpii.tests.testEnvironmentWithSetup"],
    invokers: {
        setup: "gpii.tests.contextMenuTestEnvironment.setup",
        teardown: "gpii.tests.contextMenuTestEnvironment.teardown"
    }
});

gpii.tests.contextMenuTestEnvironment.setup = function () {
    chrome.contextMenus.create.callsArg(1);
    chrome.contextMenus.update.callsArg(2);
};

gpii.tests.contextMenuTestEnvironment.teardown = function () {
    chrome.flush();
};

// chrome-sinon does not have support to dispatch events to listeners bound through the `contextProps`.
// This function manually relays clicks from the `onClicked` event to the handler bound to the `onclick` `contextProp`.
gpii.tests.contextMenuTestEnvironment.relayClickEvent = function (contextProps) {
    var onclick = fluid.get(contextProps, ["onclick"]);

    if (onclick) {
        chrome.contextMenus.onClicked.addListener(onclick);
    }
};

gpii.tests.contextMenuTestEnvironment.dispatchClick = function (arg) {
    chrome.contextMenus.onClicked.dispatch(arg);
};

gpii.tests.contextMenuTestEnvironment.assertCreate = function (properties, callNum) {
    var callArgs = chrome.contextMenus.create.args[callNum || 0];
    jqUnit.assertDeepEq("The context menu item was created with the correct properties", properties, callArgs[0]);
};

gpii.tests.contextMenuTestEnvironment.assertUpdate = function (id, properties, callNum) {
    var callArgs = chrome.contextMenus.update.args[callNum || 0];
    jqUnit.assertEquals("The update was called for the correct context menu item", id, callArgs[0]);
    jqUnit.assertDeepEq("The contextMenu was updated with the correct properties", properties, callArgs[1]);
};

gpii.tests.contextMenuTestEnvironment.assertRemove = function (id, callNum) {
    var callArgs = chrome.contextMenus.remove.args[callNum || 0];
    jqUnit.assertEquals("The removal was called for the correct context menu item", id, callArgs[0]);
};

fluid.defaults("gpii.tests.contextMenuTestEnvironment.sequence.create", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        event: "{contextMenuTestEnvironment contextItem}.events.onCreate",
        priority: "last:testing",
        listener: "jqUnit.assert",
        args: ["The context item component was created"]
    }, {
        // Assert context props id is the same as the components id
        func: "jqUnit.assertEquals",
        args: ["The context props id should be set correctly", "{contextItem}.id", "{contextItem}.options.contextProps.id"]
    }, {
        // Trigger context menu item creation
        task: "{contextItem}.createPeerMenu",
        resolve: "gpii.tests.contextMenuTestEnvironment.assertCreate",
        resolveArgs: ["{contextItem}.options.contextProps"]
    }]
});

fluid.defaults("gpii.tests.contextMenuTestEnvironment.sequence.update", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        // update menu item
        task: "{contextItem}.updatePeerMenu",
        args: ["{that}.options.testOpts.updatedContextProps"],
        resolve: "gpii.tests.contextMenuTestEnvironment.assertUpdate",
        resolveArgs: ["{contextItem}.id", "{that}.options.testOpts.updatedContextProps"]
    }]
});

fluid.defaults("gpii.tests.contextMenuTestEnvironment.sequence.destroy", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        // store contextItem id before calling destroy
        func: "fluid.set",
        args: ["{that}", ["contextItemId"], "{contextItem}.id"]
    }, {
        // destroy contextMenuItem
        func: "{contextItem}.destroy"
    }, {
        funcName: "gpii.tests.contextMenuTestEnvironment.assertRemove",
        args: ["{that}.contextItemId"]
    }]
});

fluid.defaults("gpii.tests.contextMenuTestEnvironment.sequence", {
    gradeNames: "fluid.test.sequence",
    sequenceElements: {
        create: {
            gradeNames: "gpii.tests.contextMenuTestEnvironment.sequence.create",
            priority: "before:sequence"
        },
        update: {
            gradeNames: "gpii.tests.contextMenuTestEnvironment.sequence.update",
            priority: "after:create"
        },
        destroy: {
            gradeNames: "gpii.tests.contextMenuTestEnvironment.sequence.destroy",
            priority: "after:sequence"
        }
    }
});

/***********************************************************
 * gpii.chrome.contextItem tests
 ***********************************************************/

fluid.defaults("gpii.tests.chrome.contextItem", {
    gradeNames: ["gpii.chrome.contextItem"],
    contextProps: {
        title: "context_item"
    }
});

fluid.defaults("gpii.tests.contextItemTests", {
    gradeNames: ["gpii.tests.contextMenuTestEnvironment"],
    components: {
        contextItem: {
            type: "gpii.tests.chrome.contextItem",
            createOnEvent: "{contextItemTester}.events.onTestCaseStart"
        },
        contextItemTester: {
            type: "gpii.tests.contextItemTester"
        }
    }
});

fluid.defaults("gpii.tests.contextItemTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOpts: {
        updatedContextProps: {
            title: "new title"
        }
    },
    modules: [{
        name: "GPII Chrome Extension contextMenu unit tests",
        tests: [{
            name: "contextItem",
            expect: 6,
            sequenceGrade: "gpii.tests.contextMenuTestEnvironment.sequence"
        }]
    }]
});

/***********************************************************
 * gpii.chrome.contextItem.checkbox tests
 ***********************************************************/

fluid.defaults("gpii.tests.chrome.contextItem.checkbox", {
    gradeNames: ["gpii.chrome.contextItem.checkbox"],
    contextProps: {
        title: "checkbox"
    }
});

fluid.defaults("gpii.tests.contextItemCheckboxTests", {
    gradeNames: ["gpii.tests.contextMenuTestEnvironment"],
    components: {
        contextItem: {
            type: "gpii.tests.chrome.contextItem.checkbox",
            createOnEvent: "{contextItemTester}.events.onTestCaseStart"
        },
        contextItemTester: {
            type: "gpii.tests.contextItemCheckboxTester"
        }
    }
});

fluid.defaults("gpii.tests.contextItemCheckboxTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOpts: {
        updatedContextProps: {
            title: "new checkbox title"
        },
        clickPayload: {
            checked: true
        },
        modelChange: {
            checked: false
        }
    },
    modules: [{
        name: "GPII Chrome Extension contextMenu unit tests",
        tests: [{
            name: "contextItem - Checkbox",
            expect: 9,
            sequenceGrade: "gpii.tests.contextMenuTestEnvironment.sequence",
            sequence: [{
                // mock click
                funcName: "gpii.tests.contextMenuTestEnvironment.relayClickEvent",
                args: ["{contextItem}.options.contextProps"]
            }, {
                funcName: "gpii.tests.contextMenuTestEnvironment.dispatchClick",
                args: ["{that}.options.testOpts.clickPayload"]
            }, {
                // assert click event handling
                changeEvent: "{contextItem}.applier.modelChanged",
                path: "value",
                listener: "jqUnit.assertEquals",
                args: ["The model.value should be set to \"true\"", "{that}.options.testOpts.clickPayload.checked", "{contextItem}.model.value"]
            }, {
                // update model
                func: "{contextItem}.applier.change",
                args: ["value", "{that}.options.testOpts.modelChange.checked"]
            }, {
                // Assert menu item is updated
                funcName: "gpii.tests.contextMenuTestEnvironment.assertUpdate",
                args: ["{contextItem}.id", "{that}.options.testOpts.modelChange", 1]
            }]
        }]
    }]
});

/***********************************************************
 * gpii.chrome.contextItem.button tests
 ***********************************************************/

fluid.defaults("gpii.tests.chrome.contextItem.button", {
    gradeNames: ["gpii.chrome.contextItem.button"],
    contextProps: {
        title: "button"
    },
    invokers: {
        click: {
            funcName: "fluid.set",
            args: ["{that}", ["clicked"], true]
        }
    }
});

fluid.defaults("gpii.tests.contextItemButtonTests", {
    gradeNames: ["gpii.tests.contextMenuTestEnvironment"],
    components: {
        contextItem: {
            type: "gpii.tests.chrome.contextItem.button",
            createOnEvent: "{contextItemTester}.events.onTestCaseStart"
        },
        contextItemTester: {
            type: "gpii.tests.contextItemButtonTester"
        }
    }
});

fluid.defaults("gpii.tests.contextItemButtonTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOpts: {
        updatedContextProps: {
            title: "new button title"
        }
    },
    modules: [{
        name: "GPII Chrome Extension contextMenu unit tests",
        tests: [{
            name: "contextItem - Button",
            expect: 7,
            sequenceGrade: "gpii.tests.contextMenuTestEnvironment.sequence",
            sequence: [{
                // mock click
                funcName: "gpii.tests.contextMenuTestEnvironment.relayClickEvent",
                args: ["{contextItem}.options.contextProps"]
            }, {
                funcName: "gpii.tests.contextMenuTestEnvironment.dispatchClick",
                args: ["{that}.options.testOpts.clickPayload"]
            }, {
                funcName: "jqUnit.assertTrue",
                args: ["The click invoker should have fired", "{contextItem}.clicked"]
            }]
        }]
    }]
});


/***********************************************************
 * gpii.chrome.contextMenuPanel tests
 ***********************************************************/

fluid.defaults("gpii.tests.chrome.contextMenuPanel", {
    gradeNames: ["gpii.chrome.contextMenuPanel"],
    strings: {
        subMenuItem: "sub menu item"
    },
    distributeOptions: {
        reset: {
            target: "{that reset}.options.invokers.click",
            record: {
                funcName: "fluid.identity"
            }
        }
    },
    components: {
        "subMenuItem": {
            type: "gpii.chrome.contextItem",
            options: {
                priority: "after:parent",
                contextProps: {
                    parentId: "{parent}.options.contextProps.id",
                    title: "{contextMenuPanel}.options.strings.subMenuItem"
                }
            }
        }
    }
});

fluid.defaults("gpii.tests.contextMenuPanelTests", {
    gradeNames: ["gpii.tests.contextMenuTestEnvironment"],
    components: {
        contextMenuPanel: {
            type: "gpii.tests.chrome.contextMenuPanel",
            createOnEvent: "{contextMenuPanelTester}.events.onTestCaseStart"
        },
        contextMenuPanelTester: {
            type: "gpii.tests.contextMenuPanelTester"
        }
    }
});

fluid.defaults("gpii.tests.contextMenuPanelTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "GPII Chrome Extension contextMenu unit tests",
        tests: [{
            name: "contextMenuPanel",
            expect: 5,
            sequence: [{
                event: "{contextMenuTestEnvironment contextMenuPanel}.events.afterContextMenuItemsCreated",
                priority: "last:testing",
                listener: "jqUnit.assert",
                args: ["The contextMenuPanel was created"]
            }, {
                func: "jqUnit.assertEquals",
                args: [
                    "The parent menu item title is set correctly",
                    "{contextMenuPanel}.options.strings.parent",
                    "{contextMenuPanel}.parent.options.contextProps.title"
                ]
            }, {
                func: "jqUnit.assertEquals",
                args: [
                    "The reset menu item title is set correctly",
                    "{contextMenuPanel}.options.strings.reset",
                    "{contextMenuPanel}.reset.options.contextProps.title"
                ]
            }, {
                func: "jqUnit.assertEquals",
                args: [
                    "The sub menu item title is set correctly",
                    "{contextMenuPanel}.options.strings.subMenuItem",
                    "{contextMenuPanel}.subMenuItem.options.contextProps.title"
                ]
            }, {
                func: "jqUnit.assertEquals",
                args: [
                    "The sub menu item parent id is set correctly",
                    "{contextMenuPanel}.parent.options.contextProps.id",
                    "{contextMenuPanel}.subMenuItem.options.contextProps.parentId"
                ]
            }]
        }]
    }]
});


fluid.test.runTests([
    "gpii.tests.contextItemTests",
    "gpii.tests.contextItemCheckboxTests",
    "gpii.tests.contextItemButtonTests",
    "gpii.tests.contextMenuPanelTests"
]);

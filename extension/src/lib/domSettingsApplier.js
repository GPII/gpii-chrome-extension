/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017-2019 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

// This component makes use of css/Enactor.css to perform the adaptations
// of the web content, and this is done through chrome.tabs.executeScript.
//
fluid.defaults("gpii.chrome.domSettingsApplier", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    domSettingsHandler: "content_scripts/domSettingsHandler.js",
    events: {
        onConnect: null
    },
    eventRelayMap: {
        "chrome.runtime.onConnect": "onConnect"
    },
    model: {
        // Accepted model values:
        //
        // settings.captionsEnabled: Boolean
        // settings.characterSpace: Number,
        // settings.contrastTheme: String,
        // settings.inputsLarger: Boolean,
        // settings.lineSpace: Number,    // the multiplier to the current line space
        // settings.selectionTheme: String,
        // settings.selfVoicingEnabled: Boolean,
        // settings.simplifiedUiEnabled: Boolean,
        // settings.syllabificationEnabled: Boolean,
        // settings.tableOfContentsEnabled: Boolean,
        // settings.wordSpace: Number
    },
    dynamicComponents: {
        port: {
            type: "gpii.chrome.portConnection",
            createOnEvent: "onConnect",
            options: {
                port: "{arguments}.0"
            }
        }
    },
    components: {
        contentScriptInjector: {
            type: "gpii.chrome.contentScriptInjector"
        }
    }
});

/*******************************************************************************************
 * gpii.chrome.portConnection manages a port a connection
 *
 * Typically this is used as a dynamic component with an instance created for each
 * port.
 *******************************************************************************************/

//TODO: This component interacts with the parent's (domSettingsApplier) model rather than using a model relay to
//      modify it's own model and share with the parent. This is because ports are created for every window/page/iframe
//      and even the browser action. If there are too many of these connections, which may occur even on a single page
//      with many iframes, the model relay will abort and throw an error because of too many relays.
fluid.defaults("gpii.chrome.portConnection", {
    gradeNames: ["gpii.chrome.portBinding", "fluid.modelComponent"],
    // TODO: When FLUID-5912 is fixed, move port to the members block.
    //       https://issues.fluidproject.org/browse/FLUID-5912
    port: null, // must be supplied by integrator
    invokers: {
        setPort: {
            funcName: "fluid.identity",
            args: ["{that}.options.port"]
        },
        // model writes will be triggered by the browser_action (UIO+ panel) and any enactor that also provides a
        // settings UI to the user.
        handleWrite: {
            funcName: "gpii.chrome.portConnection.updateModel",
            args: ["{domSettingsApplier}", "{arguments}.0.payload"]
        },
        handleRead: {
            funcName: "fluid.identity",
            args: ["{domSettingsApplier}.model"]
        }
    },
    listeners: {
        "onDisconnect.destroy": "{that}.destroy"
    },
    modelListeners: {
        "{domSettingsApplier}.model": {
            func: "{that}.write",
            args: ["{domSettingsApplier}.model"]
        }
    }
});

gpii.chrome.portConnection.updateModel = function (that, model) {
    var transaction = that.applier.initiate();
    transaction.fireChangeRequest({path: "", type: "DELETE"});
    transaction.change("", model);
    transaction.commit();
    return that.model;
};

/*******************************************************************************************
 * gpii.chrome.contentScriptInjector handles dynamically injecting content scripts
 *******************************************************************************************/

fluid.defaults("gpii.chrome.contentScriptInjector", {
    gradeNames: ["fluid.component", "gpii.chrome.eventedComponent"],
    requestType: "gpii.chrome.contentScriptInjectionRequest",
    listeners: {
        "onCreate.bindEvents": {
            listener: "gpii.chrome.contentScriptInjector.bindEvents",
            args: ["{that}"]
        },
        "onDestroy.unbindEvents": {
            listener: "gpii.chrome.contentScriptInjector.bindEvents",
            args: ["{that}", true]
        }
    },
    invokers: {
        injectContentScript: "gpii.chrome.contentScriptInjector.injectContentScript",
        handleRequest: {
            funcName: "gpii.chrome.contentScriptInjector.handleRequest",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    }
});

gpii.chrome.contentScriptInjector.bindEvents = function (that, unbind) {
    // The onMessage event is bound manually and doesn't make use of `gpii.chrome.eventedComponent` because the handler
    // is required to return `true` in order to indicate that the `sendResponse` will be communicated asynchronously.
    // When using `gpii.chrome.eventedComponent` the return value of the handler is lost.
    // (See: https://developer.chrome.com/extensions/messaging#simple)
    var eventFuncName = [unbind ? "removeListener" : "addListener"];
    chrome.runtime.onMessage[eventFuncName](function (request, sender, sendResponse) {
        // Not relaying through an infusion event because only one sendResponse will be accepted.
        that.handleRequest(request, sender, sendResponse);
        return true;
    });
};

gpii.chrome.contentScriptInjector.handleRequest = function (that, request, sender, sendResponse) {
    var tabID = fluid.get(sender, ["tab", "id"]);
    if (request.type === that.options.requestType && tabID) {
        var promise = that.injectContentScript(tabID, request.src);
        promise.then(sendResponse);
    }
};

gpii.chrome.contentScriptInjector.injectContentScript = function (tabID, src) {
    var promise = fluid.promise();
    chrome.tabs.executeScript(tabID, {
        file: src,
        allFrames: true,
        matchAboutBlank: true,
        runAt: "document_start"
    }, promise.resolve);
    return promise;
};

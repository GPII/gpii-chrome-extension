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

/* global fluid, chrome */
"use strict";

(function ($, fluid) {
    var gpii = fluid.registerNamespace("gpii");

    // The main component to handle settings that require DOM manipulations.
    // It contains various subcomponents for handling various settings.
    fluid.defaults("gpii.chrome.portBinding", {
        gradeNames: ["fluid.component"],
        connectionName: "",
        members: {
            lastIncomingMessage: {}
        },
        events: {
            onIncomingMessage: null
        },
        listeners: {
            "onCreate.bindPortEvents": "gpii.chrome.portBinding.bindPortEvents",
            "onIncomingMessage.setLastIncomingMessage": {
                listener: "fluid.set",
                args: ["{that}", ["lastIncomingMessage"], "{arguments}.0"]
            }
        },
        invokers: {
            postMessage: {
                funcName: "gpii.chrome.portBinding.postMessage",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    gpii.chrome.portBinding.bindPortEvents = function (that) {
        that.port = chrome.runtime.connect({name: that.options.connectionName + "-" + that.id});
        that.port.onMessage.addListener(that.events.onIncomingMessage.fire);
    };

    gpii.chrome.portBinding.postMessage = function (that, message) {
        var promise = fluid.promise();
        try {
            that.port.postMessage(message);
            promise.resolve(message);
        } catch (e) {
            promise.reject(e);
        }
        return promise;
    };

    /***************************
     * port binding data store *
     ***************************/

    fluid.defaults("gpii.chrome.portBinding.store", {
        gradeNames: ["fluid.dataSource", "gpii.chrome.portBinding"],
        components: {
            encoding: {
                type: "fluid.dataSource.encoding.model"
            }
        },
        listeners: {
            "onRead.impl": {
                listener: "fluid.identity",
                args: ["{that}.lastIncomingMessage"]
            }
        }
    });

    fluid.defaults("gpii.chrome.portBinding.store.writable", {
        gradeNames: ["fluid.prefs.tempStore.writable"],
        listeners: {
            "onWrite.impl": {
                listener: "{that}.postMessage"
            }
        }
    });

    fluid.makeGradeLinkage("gpii.chrome.portBinding.store.linkage", ["fluid.dataSource.writable", "gpii.chrome.portBinding.store"], "gpii.chrome.portBinding.store.writable");

})(jQuery, fluid);

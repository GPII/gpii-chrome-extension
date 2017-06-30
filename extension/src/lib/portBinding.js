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
        gradeNames: ["fluid.modelComponent"],
        connectionName: "",
        events: {
            onMessage: null
        },
        listeners: {
            "onCreate.bindPortEvents": "gpii.chrome.portBinding.bindPortEvents",
            "onMessage.updateModel": {
                changePath: "",
                value: "{arguments}.0"
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
        that.port.onMessage.addListener(that.events.onMessage.fire);
    };

    gpii.chrome.portBinding.postMessage = function (that, message) {
        // TODO: handle case where the port hasn't been created yet
        if (that.port) {
            that.port.postMessage(message);
        }
    };
})(jQuery, fluid);

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

(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.chrome.portBinding", {
        gradeNames: ["fluid.component"],
        connectionName: "",
        messageType: "",
        members: {
            port: {
                expander: {
                    func: "{that}.setPort"
                }
            }
        },
        events: {
            onIncomingMessage: null,
            onDisconnect: null
        },
        listeners: {
            "onCreate.bindPortEvents": "gpii.chrome.portBinding.bindPortEvents"
        },
        invokers: {
            postMessage: {
                funcName: "gpii.chrome.portBinding.postMessage",
                args: ["{that}", "{that}.options.messageType", "{arguments}.0"]
            },
            setPort: {
                funcName: "gpii.chrome.portBinding.setPort",
                args: ["{that}.options.connectionName", "{that}.id"]
            }
        }
    });

    gpii.chrome.portBinding.setPort = function (connectionName, id) {
        return chrome.runtime.connect({name: connectionName + "-" + id});
    };

    gpii.chrome.portBinding.bindPortEvents = function (that) {
        that.port.onDisconnect.addListener(that.events.onDisconnect.fire);
        that.port.onMessage.addListener(that.events.onIncomingMessage.fire);
    };

    gpii.chrome.portBinding.postMessage = function (that, type, payload) {
        var promise = fluid.promise();
        try {
            that.port.postMessage({type: type, payload: payload});
            promise.resolve(payload);
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
        members: {
            lastIncomingPayload: {}
        },
        listeners: {
            "onIncomingMessage.setLastIncomingPayload": "{that}.setLastIncomingPayload",
            "onRead.impl": {
                listener: "fluid.identity",
                args: ["{that}.lastIncomingPayload"]
            }
        },
        invokers: {
            setLastIncomingPayload: {
                funcName: "gpii.chrome.portBinding.store.setLastIncomingPayload",
                args: ["{that}", "gpii.chrome.domSettingsApplier", "{arguments}.0"]
            }
        }
    });

    gpii.chrome.portBinding.store.setLastIncomingPayload = function (that, acceptedType, message) {
        if (message.type === acceptedType) {
            that.lastIncomingPayload = fluid.get(message, ["payload"]);
        }
    };

    fluid.defaults("gpii.chrome.portBinding.store.writable", {
        gradeNames: ["fluid.prefs.tempStore.writable"],
        listeners: {
            "onWrite.impl": {
                listener: "{that}.postMessage"
            }
        }
    });

    fluid.makeGradeLinkage("gpii.chrome.portBinding.store.linkage", ["fluid.dataSource.writable", "gpii.chrome.portBinding.store"], "gpii.chrome.portBinding.store.writable");

})(fluid);

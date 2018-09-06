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

    /*
        The `gpii.chrome.portBinding` grade provides a system for creating a port connection and sending/receiving
        messages across that port. To verify that messages sent across a port are received and acted upon correctly,
        posts provide a promise that is resolved/rejected based on a returned receipt. Connections are also set to
        return receipts after an incoming message has been handled.

        Workflow:
        post - ( sends payload with message id )
             - message id gets stored in a map with the promise to resolve/reject
             -  receiver takes action of the message and returns a receipt ( includes the same message id )

        receive - (receives a message)
                - if it is a returned receipt
                  - look into message map and resolve/reject corresponding promise
                  - remove from map
                - if it is a new message
                  - take action on the message
                  - send a return message containing the same message id


        Post Messages:
        1) Standard Message
           - wait for receipt
        2) Receipt
           - do not wait for receipt

        Received Messages:
        1) Standard Message
           - action, return receipt
        2) Receipt
           - remove from message map

        To prevent handling receipts and messages that are broadcast but not intended for a connection, a whitelist
        must be provided to allow `types` of requests to be handled.
    */

    fluid.defaults("gpii.chrome.portBinding", {
        gradeNames: ["fluid.component"],
        connectionName: "",
        messageType: "",
        members: {
            port: {
                expander: {
                    func: "{that}.setPort"
                }
            },
            openRequests: {}
        },
        filters: {
            messages: [],
            receipts: []
        },
        events: {
            onIncoming: null,
            onIncomingMessage: null,
            onIncomingReceipt: null,
            onDisconnect: null
        },
        listeners: {
            "onCreate.bindPortEvents": "gpii.chrome.portBinding.bindPortEvents",
            "onIncoming.filterMessages": {
                listener: "gpii.chrome.portBinding.handleIncoming",
                args: ["{that}", "{arguments}.0"]
            },
            "onIncomingMessage.handleMessage": "{that}.handleMessage",
            "onIncomingReceipt.handleReceipt": "{that}.handleReceipt"
        },
        invokers: {
            postMessage: {
                funcName: "gpii.chrome.portBinding.postMessage",
                args: ["{that}", "{that}.options.messageType", "{arguments}.0"]
            },
            postReceipt: {
                funcName: "gpii.chrome.portBinding.postReceipt",
                args: ["{that}", "{that}.options.messageType", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            setPort: {
                funcName: "gpii.chrome.portBinding.setPort",
                args: ["{that}.options.connectionName", "{that}.id"]
            },
            isReceipt: {
                funcName: "gpii.chrome.portBinding.isAcceptable",
                args: ["{that}.options.filters.receipts", "{arguments}.0"]
            },
            isMessage: {
                funcName: "gpii.chrome.portBinding.isAcceptable",
                args: ["{that}.options.filters.messages", "{arguments}.0"]
            },
            handleMessage: {
                funcName: "gpii.chrome.portBinding.handleMessage",
                args: ["{that}", "{arguments}.0"]
            },
            handleReceipt: {
                funcName: "gpii.chrome.portBinding.handleReceipt",
                args: ["{that}", "{arguments}.0"]
            },
            // Must be implemented by an integrator. It will be called by the handleMessage flow and may
            // return a promise to indicate if the task has completed successfully or not. If a promise isn't returned
            // all responses will be treated as a success.
            handleMessageImpl: "fluid.notImplemented"
        }
    });

    /**
     * An object which allows two way communication with other pages.
     * See: https://developer.chrome.com/apps/runtime#type-Port
     *
     * @typedef {Object} Port
     */

    /**
     * Creates a connection and returns a port.
     *
     * @param {String} connectionName - the name of the connection. Will be used as the prefix for the name passed
     *                                  to the connection.
     * @param {String} id - the id of the connection. Will be used as the suffix for the name passed to the conneciton.
     *
     * @return {Port} - the chrome port connection
     */
    gpii.chrome.portBinding.setPort = function (connectionName, id) {
        return chrome.runtime.connect({name: connectionName + "-" + id});
    };

    /**
     * Binds/relays {Port} events to infusion events that can be used by the component.
     *
     * @param {Component} that - the component itself
     */
    gpii.chrome.portBinding.bindPortEvents = function (that) {
        that.port.onDisconnect.addListener(that.events.onDisconnect.fire);
        that.port.onMessage.addListener(that.events.onIncoming.fire);
    };

    /**
     * Posts messages over the {Port} connection. The content of the message must be provided in the `payload` argument.
     * A promise is returned and will be resolved/rejected upon receiving a receipt from the other end. An `id` is sent
     * with the message and should be used as the `id` in a receipt to identify which message the receipt is for.
     *
     * @param {Component} that - the component itself
     * @param {String} type - identifies the type of message for listeners on the other end. Also used as the prefix
     *                           for the id.
     * @param {Object} payload - the content of the message
     *
     * @return {Promise} - a promise that is resolved/rejected upon receipt from the other end.
     */
    gpii.chrome.portBinding.postMessage = function (that, type, payload) {
        var promise = fluid.promise();
        var id = type + "-" + fluid.allocateGuid();
        type = type + "-message";
        that.openRequests[id] = promise;

        try {
            that.port.postMessage({type: type, id: id, payload: payload});
        } catch (error) {
            delete that.openRequests[id];
            promise.reject(error);
        }


        return promise;
    };

    /**
     * Posts receipt over the {Port} connection to reply to a previously received message. Content of the receipt may be
     * provided in the `payload` argument.
     *
     * @param {Component} that - the component itself
     * @param {String} type - identifies the type of message for listeners on the other end.
     * @param {String} id - must match a previously received message.
     * @param {Object} payload - the content to return
     * @param {Object} error - an error object to return if the previous message handling failed.
     */
    gpii.chrome.portBinding.postReceipt = function (that, type, id, payload, error) {
        type = type + "-receipt";
        var toPost = {type: type, id: id, payload: payload};

        if (error) {
            toPost.error = error;
        }

        that.port.postMessage(toPost);
    };

    /**
     * Determines if message/receipt type should be accepted for handling.
     *
     * @param {String|Array} filter - a type or array of types to accept
     * @param {String} type - the type to check
     *
     * @return {Boolean} - returns `true` if `type` is acceptable and `false` otherwise.
     */
    gpii.chrome.portBinding.isAcceptable = function (filter, type) {
        filter = fluid.makeArray(filter);
        return fluid.find(filter, function (accepted) {
            if (accepted === type) {
                return true;
            }
        }, false);
    };

    /**
     * Determines if an incoming port message is an acceptable receipt or message and will first the data to the
     * respective events: `onIncomingReceipt`, `onIncomingMessage`.
     *
     * @param {Component} that - the component itself
     * @param {Object} data - the data to handle from the incoming port message
     */
    gpii.chrome.portBinding.handleIncoming = function (that, data) {
        if (that.isReceipt(data.type)) {
            that.events.onIncomingReceipt.fire(data);
        } else if (that.isMessage(data.type)) {
            that.events.onIncomingMessage.fire(data);
        }
    };

    /**
     * Handles an incoming message. It will call the `handleMessageImpl` invoker; which needs to be set by an
     * integrator. The result or promise returned by `handleMessageImpl` is used to determine if a receipt should be
     * sent with or without an error and with what payload.
     *
     * @param {Component} that - the component itself
     * @param {Object} data - the incoming data from the message.
     *
     * @return {Promise} - a promise that is resolved/rejected based on result of `handleMessageImpl` method
     */
    gpii.chrome.portBinding.handleMessage = function (that, data) {
        var promise = fluid.promise();

        promise.then(function (value) {
            that.postReceipt(data.id, value);
        }, function (reason) {
            // this should be a rejected receipt
            that.postReceipt(data.id, data.payload, {error: reason});
        });

        var handlePromise = that.handleMessageImpl(data);
        handlePromise = fluid.toPromise(handlePromise);
        fluid.promise.follow(handlePromise, promise);

        return promise;
    };

    /**
     * Handles the receipt of a posted message. Based on the `id` in the receipt, the promise related to the originally
     * sent message will be removed from the `openRequests` object and resolved/rejected as needed.
     *
     * @param {Component} that - the component itself
     * @param {Object} receipt - the data from the receipt
     */
    gpii.chrome.portBinding.handleReceipt = function (that, receipt) {
        var promise = that.openRequests[receipt.id];
        delete that.openRequests[receipt.id];

        if (receipt.error) {
            promise.reject(receipt.error);
        } else {
            promise.resolve(receipt.payload);
        }
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
                args: ["{that}", "{arguments}.0"]
            },
            handleMessageImpl: "gpii.chrome.portBinding.store.setLastIncomingPayload"
        }
    });

    gpii.chrome.portBinding.store.setLastIncomingPayload = function (that, message) {
        that.lastIncomingPayload = fluid.get(message, ["payload"]);
        return that.lastIncomingPayload;
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

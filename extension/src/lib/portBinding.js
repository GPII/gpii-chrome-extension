/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017-2018 OCAD University
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

    fluid.registerNamespace("gpii.chrome.portBinding");

    gpii.chrome.portBinding.type = {
        READ: 0,
        READ_RECEIPT: 1,
        WRITE: 2,
        WRITE_RECEIPT: 3
    };

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
                  - send a return message (receipt) containing the same message id


        Post Messages:
        1) read/write message
           - wait for receipt
        2) read-receipt/write-receipt
           - do not wait for receipt

        Received Messages:
        1) read/write message
           - action, return receipt
        2) read-receipt/write-receipt
           - remove from message map

        To prevent handling receipts and messages that are broadcast but not intended for a connection, incoming message
        is validated. The destination must match the current component, and the source must be from an accepted sender.
    */

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
        // Name of the port connection. Will be used as the prefix for the name passed to the connection.
        connectionName: "",
        members: {
            port: {
                expander: {
                    func: "{that}.setPort"
                }
            },
            openRequests: {}
        },
        events: {
            onIncoming: null,
            onIncomingRead: null,
            onIncomingReadReceipt: null,
            onIncomingWrite: null,
            onIncomingWriteReceipt: null,
            onDisconnect: null
        },
        listeners: {
            "onCreate.bindPortEvents": "gpii.chrome.portBinding.bindPortEvents",
            "onIncoming.filterMessages": {
                listener: "gpii.chrome.portBinding.handleIncoming",
                args: ["{that}", "{arguments}.0"]
            },
            "onIncomingRead.handle": {
                listener: "{that}.handleMessage",
                args: [gpii.chrome.portBinding.type.READ_RECEIPT, "{that}.handleRead", "{arguments}.0"]
            },
            "onIncomingReadReceipt.handle": "{that}.handleReceipt",
            "onIncomingWrite.handle": {
                listener: "{that}.handleMessage",
                args: [gpii.chrome.portBinding.type.WRITE_RECEIPT, "{that}.handleWrite", "{arguments}.0"]
            },
            "onIncomingWriteReceipt.handle": "{that}.handleReceipt"
        },
        invokers: {
            read: {
                funcName: "gpii.chrome.portBinding.postRequest",
                args: ["{that}", gpii.chrome.portBinding.type.READ, "{arguments}.0"]
            },
            write: {
                funcName: "gpii.chrome.portBinding.postRequest",
                args: ["{that}", gpii.chrome.portBinding.type.WRITE, "{arguments}.0"]
            },
            postReceipt: {
                funcName: "gpii.chrome.portBinding.postReceipt",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
            },
            setPort: {
                funcName: "gpii.chrome.portBinding.setPort",
                args: ["{that}.options.connectionName", "{that}.id"]
            },
            handleMessage: {
                funcName: "gpii.chrome.portBinding.handleMessage",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            handleReceipt: {
                funcName: "gpii.chrome.portBinding.handleReceipt",
                args: ["{that}", "{arguments}.0"]
            },
            // handleRead and handleWrite must be implemented by an integrator. They will be called by the handleMessage
            // flow for handling read and write requests. They may return a promise to indicate if the task has
            // completed successfully or not. If a promise isn't returned all responses will be treated as a success.
            handleRead: "fluid.notImplemented",
            handleWrite: "fluid.notImplemented"
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
     * Posts a request over the {Port} connection. The content of the message must be provided in the `payload`
     * argument. A promise is returned and will be resolved/rejected upon receiving a receipt from the other end. An
     * `id` is sent with the message and should be used as the `id` in a receipt to identify which message the receipt
     * is for.
     *
     * @param {Component} that - the component itself
     * @param {Number} type - identifies the type of message for listeners on the other end.
     *                        See: gpii.chrome.portBinding.type
     * @param {Object} payload - the content of the message
     *
     * @return {Promise} - a promise that is resolved/rejected upon receipt from the other end.
     */
    gpii.chrome.portBinding.postRequest = function (that, type, payload) {
        var promise = fluid.promise();
        var id = type + "-" + fluid.allocateGuid();
        that.openRequests[id] = promise;

        try {
            that.port.postMessage({
                id: id,
                type: type,
                payload: payload
            });
        } catch (error) {
            delete that.openRequests[id];
            promise.reject(error);
        }

        return promise;
    };

    /**
     * Posts the receipt over the {Port} connection to reply to a previously received message. Content of the receipt
     * may be provided in the `payload` argument.
     *
     * @param {Component} that - the component itself
     * @param {Number} type - identifies the type of message for listeners on the other end.
     *                        See: gpii.chrome.portBinding.type
     * @param {String} id - must match a previously received message.
     * @param {Object} payload - the content to return
     * @param {Object} error - an error object to return if the previous message handling failed.
     */
    gpii.chrome.portBinding.postReceipt = function (that, type, id, payload, error) {
        var toPost = {
            id: id,
            type: type,
            payload: payload
        };

        if (error) {
            toPost.error = error;
        }

        that.port.postMessage(toPost);
    };

    /**
     * Can be used to replace the listener for the onIncomingRead and onIncomingWrite events if those operations aren't
     * supported.
     *
     * @param {Component} that - the component itself
     * @param {Number} type - identifies the type of message for listeners on the other end.
     *                        See: gpii.chrome.portBinding.type
     * @param {Object} data - the incoming data from the message.
     */
    gpii.chrome.portBinding.requestNotAccepted = function (that, type, data) {
        that.postReceipt(type, data.id, null, {message: "Request of type: " + data.type + " are not accepted."});
    };

    /**
     * Directs the incoming message to the appropriate event:
     * `onIncomingRead`, `onIncomingReadReceipt`, `onIncomingWrite`, `onIncomingWriteReceipt`
     *
     * @param {Component} that - the component itself
     * @param {Object} data - the data to handle from the incoming port message
     */
    gpii.chrome.portBinding.handleIncoming = function (that, data) {
        if (data.type === gpii.chrome.portBinding.type.READ) {
            that.events.onIncomingRead.fire(data);
        }
        if (data.type === gpii.chrome.portBinding.type.READ_RECEIPT) {
            that.events.onIncomingReadReceipt.fire(data);
        }
        if (data.type === gpii.chrome.portBinding.type.WRITE) {
            that.events.onIncomingWrite.fire(data);
        }
        if (data.type === gpii.chrome.portBinding.type.WRITE_RECEIPT) {
            that.events.onIncomingWriteReceipt.fire(data);
        }
    };

    /**
     * Handles an incoming message. It will call the `handleMessageImpl` invoker; which needs to be set by an
     * integrator. The result or promise returned by `handleMessageImpl` is used to determine if a receipt should be
     * sent with or without an error and with what payload.
     *
     * @param {Component} that - the component itself
     * @param {Number} type - identifies the type of message for listeners on the other end.
     *                        See: gpii.chrome.portBinding.type
     * @param {Function} handleFn - a function to handle the message
     * @param {Object} data - the incoming data from the message.
     *
     * @return {Promise} - a promise that is resolved/rejected based on the result of `handleFn` execution
     */
    gpii.chrome.portBinding.handleMessage = function (that, type, handleFn, data) {
        var promise = fluid.promise();

        promise.then(function (value) {
            that.postReceipt(type, data.id, value);
        }, function (reason) {
            // this should be a rejected receipt
            that.postReceipt(type, data.id, data.payload, reason);
        });

        var handlePromise = handleFn(data);
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

        if (promise) {
            delete that.openRequests[receipt.id];

            if (receipt.error) {
                promise.reject(receipt.error);
            } else {
                promise.resolve(receipt.payload);
            }
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
        listeners: {
            "onRead.impl": "{that}.read",
            "onIncomingRead.handle": {
                listener: "gpii.chrome.portBinding.requestNotAccepted",
                args: ["{that}", gpii.chrome.portBinding.type.READ_RECEIPT, "{arguments}.0"]
            },
            "onIncomingWrite.handle": {
                listener: "gpii.chrome.portBinding.requestNotAccepted",
                args: ["{that}", gpii.chrome.portBinding.type.WRITE_RECEIPT, "{arguments}.0"]
            }
        },
        invokers: {
            handleRead: "fluid.identity",
            handleWrite: "fluid.identity"
        }
    });

    fluid.defaults("gpii.chrome.portBinding.store.writable", {
        gradeNames: ["fluid.prefs.tempStore.writable"],
        listeners: {
            "onWrite.impl": {
                listener: "{that}.write"
            }
        }
    });

    fluid.makeGradeLinkage("gpii.chrome.portBinding.store.linkage", ["fluid.dataSource.writable", "gpii.chrome.portBinding.store"], "gpii.chrome.portBinding.store.writable");

})(fluid);

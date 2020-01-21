/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, JSON */

"use strict";

var WebSocket = WebSocket || require("ws");
var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.wsConnector", {
    gradeNames: "fluid.modelComponent",
    solutionId: null,   /* The solution id, such as "net.gpii.solution" */
    flowManager: null,  /* This takes the form "ws://host:port"*/
    members: {
        socket: null
    },
    model: {
        reconnect: true,  /* Whether the component should reconnect automatically */
        retryTime: 5      /* Try reconnecting after x seconds */
    },
    invokers: {
        connect: {
            funcName: "gpii.wsConnector.connect",
            args: "{that}"
        },
        openHandler: {
            func: "{that}.events.onConnect.fire"
        },
        errorHandler: {
            func: "{that}.events.onError.fire",
            args: ["{arguments}.0"]
        },
        messageHandler: {
            funcName: "gpii.wsConnector.messageHandler",
            args: ["{that}", "{arguments}.0"]
        }
    },
    events: {
        onConnect: null,
        onConnectionSucceeded: null,
        onError: null,
        onSettingsChange: null
    },
    listeners: {
        "onCreate.connect": "{wsConnector}.connect",
        "onConnect.setup": {
            funcName: "gpii.wsConnector.setup",
            args: "{that}",
            priority: "after:connect"
        },
        onError: {
            funcName: "gpii.wsConnector.error",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    }
});

gpii.wsConnector.messageHandler = function (that, ev) {
    var msg = JSON.parse(ev.data);

    if (msg.isError) {
        that.events.onError.fire(msg);
    } else if (msg.type === "connectionSucceeded") {
        that.events.onConnectionSucceeded.fire();
        if (msg.payload) {
            that.events.onSettingsChange.fire(msg.payload);
        }
    } else if (msg.type === "onSettingsChanged") {
        that.events.onSettingsChange.fire(msg.payload ? msg.payload : undefined);
    } else {
        fluid.log("Unrecognized event/message");
    }
};

gpii.wsConnector.connect = function (that) {
    that.socket = new WebSocket(that.options.flowManager);
    that.socket.onopen = that.openHandler;
    that.socket.onerror = that.errorHandler;
    that.socket.onclose = that.errorHandler;
};

gpii.wsConnector.error = function (that, err) {
    //TODO: Add some error handling, ie:
    //  * make difference between different kind of errors
    //
    if (err.type === "close") {
        if (that.model.reconnect) {
            setTimeout(that.connect, that.model.retryTime * 1000);
        }
    }
};

gpii.wsConnector.setup = function (that) {
    var authPayload = {
        type: "connect",
        payload: {
            solutionId: that.options.solutionId
        }
    };
    that.socket.send(JSON.stringify(authPayload));
    that.socket.onmessage = that.messageHandler;
};

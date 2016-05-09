/*globals fluid, JSON */

"use strict";

var WebSocket = WebSocket || require("ws");
var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.wsConnector", {
    gradeNames: "fluid.modelComponent",
    solutionId: "com.ilunion.cloud4chrome",
    flowManager: "ws://localhost:8081/browserChannel",
    model: {
        socket: null
    },
    invokers: {
        onopen: {
            funcName: "gpii.wsConnector.onopen",
            args: "{that}"
        },
        onerror: {
            funcName: "gpii.wsConnector.onerror",
            args: ["{that}",  "{arguments}.0"]
        },
        onclose: {
            funcName: "gpii.wsConnector.onclose",
            args: ["{that}",  "{arguments}.0"]
        },
        onmessage: {
            funcName: "gpii.wsConnector.onmessage",
            args: ["{that}",  "{arguments}.0"]
        }
    },
    events: {
        onCreate: null,
        onConnect: null,
        onConnectionSucceeded: null,
        onErrors: null,
        onMessage: null,
        onSettingsChange: null
    },
    listeners: {
        onCreate: "gpii.wsConnector.connect",
        onConnect: {
            funcName: "gpii.wsConnector.setup",
            args: "{that}"
        },
        onErrors: {
            funcName: "gpii.wsConnector.error",
            args: "{arguments}.0"
        },
        onSettingsChange: { // This listener is only for testing
            funcName: "gpii.wsConnector.onSettingsChange",
            args: "{arguments}.0"
        }
    }
});

gpii.wsConnector.onopen = function (that) {
    that.events.onConnect.fire();
};

gpii.wsConnector.onerror = function (that, ev) {
    that.events.onErrors.fire(ev);
};

gpii.wsConnector.onclose = function (that, ev) {
    that.events.onErrors.fire(ev);
};

gpii.wsConnector.onmessage = function (that, ev) {
    var msg = JSON.parse(ev.data);

    if (msg.isError) {
        that.events.onErrors.fire(msg);
    } else if (msg.type === "connectionSucceeded") {
        that.events.onConnectionSucceeded.fire();
        if (msg.payload) {
            that.events.onSettingsChange.fire(msg.payload);
        }
    } else if (msg.type === "onSettingsChanged") {
        that.events.onSettingsChange.fire(msg.payload? msg.payload: undefined);
    } else {
        console.log("Unrecognized event/message");
    }
};

gpii.wsConnector.connect = function (that) {
    var socket = new WebSocket(that.options.flowManager);
    that.applier.change("socket", socket);
    socket.onopen = that.onopen;
    socket.onerror = that.onerror;
    socket.onclose = that.onclose;
};

gpii.wsConnector.error = function (err) {
    //TODO: Add some error handling, ie:
    //  * make difference between different kind of errors
    //  * try reconnecting in x seconds
    //
    console.log("### error: " + JSON.stringify(err, null, 2));
};

gpii.wsConnector.setup = function (that) {
    var payload = { solutionId: that.options.solutionId };
    that.model.socket.send(JSON.stringify({payload: payload}));
    that.model.socket.onmessage = that.onmessage;
};

// Useful for testing
gpii.wsConnector.onSettingsChange = function (settings) {
    console.log("## Got the folowing settings: " + JSON.stringify(settings, null, 2));
};

/* eslint-env node */
/* global fluid, JSON */

"use strict";

var WebSocket = WebSocket || require("ws");
var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.wsConnector", {
    gradeNames: "fluid.component",
    solutionId: null,
    flowManager: null,
    retryTime: 5,  // Try reconnecting after x seconds.
    members: {
        socket: null
    },
    invokers: {
        connect: {
            funcName: "gpii.wsConnector.connect",
            args: "{that}"
        },
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
        onCreate: "{wsConnector}.connect",
        onConnect: {
            funcName: "gpii.wsConnector.setup",
            args: "{that}"
        },
        onErrors: {
            funcName: "gpii.wsConnector.error",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    }
});

gpii.wsConnector.onopen = function (that) {
    that.events.onConnect.fire();
};

gpii.wsConnector.onerror = function (that, ev) {
    that.events.onErrors.fire(ev, "onerror");
};

gpii.wsConnector.onclose = function (that, ev) {
    that.events.onErrors.fire(ev, "onclose");
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
        that.events.onSettingsChange.fire(msg.payload ? msg.payload : undefined);
    } else {
        console.log("Unrecognized event/message");
    }
};

gpii.wsConnector.connect = function (that) {
    that.socket = new WebSocket(that.options.flowManager);
    that.socket.onopen = that.onopen;
    that.socket.onerror = that.onerror;
    that.socket.onclose = that.onclose;
};

gpii.wsConnector.error = function (that, err, type) {
    //TODO: Add some error handling, ie:
    //  * make difference between different kind of errors
    //
    if (type === "onclose") {
        setTimeout(that.connect, that.options.retryTime * 1000);
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
    that.socket.onmessage = that.onmessage;
};

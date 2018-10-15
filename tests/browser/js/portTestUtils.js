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

/* global fluid, chrome, sinon, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests.mockPort");

        gpii.tests.mockPort.returnPort = function () {
            var port = {
                onMessage: {
                    addListener: function (handler) {
                        port.onMessage.listeners.push(handler);
                    },
                    listeners: []
                },
                onDisconnect: {
                    addListener: function (handler) {
                        port.onDisconnect.listeners.push(handler);
                    },
                    listeners: []
                },
                postMessage: sinon.stub()
            };
            return port;
        };

        gpii.tests.mockPort.trigger = {
            onMessage: function (port, msg) {
                fluid.each(port.onMessage.listeners, function (handler) {
                    handler(msg, port);
                });
            },
            onDisconnect: function (port) {
                fluid.each(port.onDisconnect.listeners, function (handler) {
                    handler(port);
                });
            }
        };

        gpii.tests.mockPort.reset = function () {
            // using the sinon-chrome stub we return a fresh mockPort
            chrome.runtime.connect.returns(gpii.tests.mockPort.returnPort());
        };

        gpii.tests.mockPort.reset();
    });
})(jQuery);

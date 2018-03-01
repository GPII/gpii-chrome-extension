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

/* global fluid, chrome, gpii, jqUnit*/
"use strict";

(function () {

    fluid.defaults("gpii.tests.portBinding.portName", {
        testOpts: {
            expectedPortName: {
                expander: {
                    funcName: "fluid.stringTemplate",
                    args: ["%connectionName-%id", {
                        connectionName: "{portBinding}.options.connectionName",
                        id: "{portBinding}.id"
                    }]
                }
            }
        }
    });

    fluid.defaults("gpii.tests.chrome.portBinding", {
        gradeNames: ["gpii.chrome.portBinding"],
        listeners: {
            "onCreate.resetPort": {
                listener: "gpii.tests.mockPort.reset",
                priority: "before:bindPortEvents"
            }
        }
    });

    gpii.tests.chrome.portBinding.assertConnection = function (expectedPortName) {
        jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: expectedPortName}).calledOnce);
    };

    gpii.tests.chrome.portBinding.assertPostMessage = function (port, postedMessage) {
        jqUnit.assertTrue("postMessage called with the correct arguments", port.postMessage.calledWith(postedMessage));
    };

})();

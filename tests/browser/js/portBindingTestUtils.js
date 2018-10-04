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

/* global fluid, chrome, gpii, jqUnit*/
"use strict";

(function () {

    fluid.defaults("gpii.tests.portBinding.portName", {
        testOpts: {
            expectedPortName: "{portBinding}.options.portName"
        }
    });

    fluid.registerNamespace("gpii.tests.chrome.portBinding");

    gpii.tests.chrome.portBinding.assertConnection = function (expectedPortName) {
        jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: expectedPortName}).calledOnce);
    };

    gpii.tests.chrome.portBinding.assertPostMessage = function (port, postedMessage) {
        jqUnit.assertTrue("postMessage called with the correct arguments", port.postMessage.calledWith(postedMessage));
    };

    /**
     * Sends a reset method to the postMessage stub.
     *
     * @param {Port} port - the mocked port
     * @param {String} resetMethod - defaults to "reset" but can be the following:
     *                               "reset": resets behavior and history
     *                               "resetBehavior": just resets the behavior
     *                               "resetHistory": just resets the history
     */
    gpii.tests.chrome.portBinding.resetPostMessage = function (port, resetMethod) {
        var method = resetMethod || "reset";
        port.postMessage[method]();
    };

    gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID = function (prefix, port, expectedPost, callIndex) {
        callIndex = callIndex || 0;
        var actualPost = port.postMessage.args[callIndex][0];
        jqUnit.assertEquals(prefix + ": The posted message type is correct", expectedPost.type, actualPost.type);
        jqUnit.assertDeepEq(prefix + ": The posted message payload is correct", expectedPost.payload, actualPost.payload);
    };

    gpii.tests.chrome.portBinding.returnReceipt = function (that, receipt) {
        that.port.postMessage.callsFake(function () {
            // Needs to get the actual id used in the post request.
            // Best to make sure that there is only one open request to ensure that
            // the correct id is retrieved.
            var ids = fluid.keys(that.openRequests);
            if (ids.length) {
                receipt.id = ids[0];
                gpii.tests.mockPort.trigger.onMessage(that.port, receipt);
            }
        });
    };

})();

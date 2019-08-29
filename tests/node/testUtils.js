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

/* eslint-env node */
/* global require */

"use strict";

var fluid = require("infusion");
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var gpii = fluid.registerNamespace("gpii"); // eslint-disable-line no-unused-vars

fluid.registerNamespace("gpii.tests.utils");

fluid.defaults("gpii.tests.testEnvironmentWithSetup", {
    gradeNames: ["fluid.test.testEnvironment"],
    invokers: {
        setup: "fluid.identity",
        teardown: "fluid.identity"
    },
    listeners: {
        "onCreate.setup": {
            listener: "{that}.setup",
            priority: "first"
        },
        "onDestroy.teardown": "{that}.teardown"
    },
    invokers: {
        setup: "gpii.tests.contextItemTester.setup",
        teardown: "gpii.tests.contextItemTester.teardown"
    }
});

gpii.tests.dispatchChromeEvent = function (chromeEvent, args) {
    args = fluid.makeArray(args);
    chromeEvent.dispatch.apply(chromeEvent, args);
};

gpii.tests.utils.assertEventRelayBound = function (that, eventRelayMap) {
    fluid.each(eventRelayMap, function (componentEventName, chromeEventName) {
        var addListenerFunc = fluid.getGlobalValue(chromeEventName).addListener;
        var isBound = addListenerFunc.calledWithExactly(that.events[componentEventName].fire);
        jqUnit.assertTrue("The " + chromeEventName + " event is relayed to the " + componentEventName + " component event.", isBound);
    });
};

gpii.tests.utils.assertEventRelayUnbound = function (that, eventRelayMap) {
    fluid.each(eventRelayMap, function (componentEventName, chromeEventName) {
        var removeListenerFunc = fluid.getGlobalValue(chromeEventName).removeListener;
        var isUnbound = removeListenerFunc.calledWithExactly(that.events[componentEventName].fire);
        jqUnit.assertTrue("The " + chromeEventName + " event relay was removed.", isUnbound);
    });
};

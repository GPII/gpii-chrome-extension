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
var chrome = fluid.require("sinon-chrome"); // eslint-disable-line no-unused-vars
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var gpii = fluid.registerNamespace("gpii"); // eslint-disable-line no-unused-vars

require("./testUtils.js");
require("../../extension/src/lib/chromeEvented.js");

fluid.defaults("gpii.tests.chrome.eventedComponent", {
    gradeNames: ["gpii.chrome.eventedComponent"],
    events: {
        onTabOpened: null,
        onTabUpdated: null,
        onWindowFocusChanged: null
    },
    eventRelayMap: {
        "chrome.tabs.onCreated": "onTabOpened",
        "chrome.tabs.onUpdated": "onTabUpdated",
        "chrome.windows.onFocusChanged": "onWindowFocusChanged"
    }
});

fluid.defaults("gpii.tests.chromeEventedTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        chromeEvented: {
            type: "gpii.tests.chrome.eventedComponent",
            createOnEvent: "{chromeEventedTester}.events.onTestCaseStart"
        },
        chromeEventedTester: {
            type: "gpii.tests.chromeEventedTester"
        }
    }
});

fluid.defaults("gpii.tests.chromeEventedTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "GPII Chrome Extension chromeEvented unit tests",
        tests: [{
            name: "interaction",
            expect: 9,
            sequence: [{
                event: "{chromeEventedTests chromeEvented}.events.onCreate",
                priority: "last:testing",
                listener: "gpii.tests.utils.assertEventRelayBound",
                args: ["{chromeEvented}", "{chromeEvented}.options.eventRelayMap"]
            }, {
                // Dispatch tabs onCreated event
                func: "gpii.tests.dispatchChromeEvent",
                args: [chrome.tabs.onCreated]
            }, {
                event: "{chromeEvented}.events.onTabOpened",
                listener: "jqUnit.assert",
                args: ["The onTabOpened event was fired"]
            }, {
                // Dispatch tabs onUpdated event
                func: "gpii.tests.dispatchChromeEvent",
                args: [chrome.tabs.onUpdated]
            }, {
                event: "{chromeEvented}.events.onTabUpdated",
                listener: "jqUnit.assert",
                args: ["The onTabUpdated event was fired"]
            }, {
                // Dispatch window onFocusChanged event
                func: "gpii.tests.dispatchChromeEvent",
                args: [chrome.windows.onFocusChanged]
            }, {
                event: "{chromeEvented}.events.onWindowFocusChanged",
                listener: "jqUnit.assert",
                args: ["The onWindowFocusChanged event was fired"]
            }, {
                func: "{chromeEvented}.destroy"
            }, {
                event: "{chromeEvented}.events.onDestroy",
                priority: "last:testing",
                listener: "gpii.tests.utils.assertEventRelayUnbound",
                args: ["{chromeEvented}", "{chromeEvented}.options.eventRelayMap"]
            }]
        }]
    }]
});

fluid.test.runTests([
    "gpii.tests.chromeEventedTests"
]);

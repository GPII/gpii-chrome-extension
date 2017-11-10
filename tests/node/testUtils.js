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
var gpii = fluid.registerNamespace("gpii"); // eslint-disable-line no-unused-vars

console.log("File run: testUtils.js");

fluid.defaults("gpii.tests.testEnvironmentWithSetup", {
    gradeNames: ["fluid.test.testEnvironment"],
    events: {
        afterSetup: null
    },
    invokers: {
        setup: "fluid.identity",
        tearDown: "fluid.identity"
    },
    listeners: {
        "onCreate.setup": "{that}.setup",
        "onDestroy.tearDown": "{that}.tearDown"
    }
});

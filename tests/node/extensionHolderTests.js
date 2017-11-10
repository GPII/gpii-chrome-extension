/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
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
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");
var jqUnit = fluid.require("node-jqunit", require, "jqUnit");
var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.tests.extensionHolder");

require("../../extension/src/lib/extensionHolder.js");

gpii.tests.extensionHolder.extInfoMock = {
    "description": "Chrome Extension Mock",
    "disabledReason": "unknown",
    "enabled": true,
    "id": "abcdefghijklmnoprstuvwxyz0123456",
    "mayDisable": true,
    "name": "ChromeExtensionMock",
    "shortName": "Mocky",
    "type": "extension",
    "version": "0.1"
};

gpii.tests.extensionHolder.disabledInstance = fluid.merge("replace", gpii.tests.extensionHolder.extInfoMock, {"enabled": false});

gpii.tests.extensionHolder.assertState = function (ext, state) {
    jqUnit.assertEquals("Checking that ext.model.extensionEnabled is " + state, state, ext.model.extensionEnabled);
    jqUnit.assertEquals("Checking that ext.extensionInstance.enabled is " + state, state, ext.extensionInstance.enabled);
};

jqUnit.module("GPII Chrome Extension extensionHolder unit tests");

jqUnit.test("Running unit tests for extensionHolder", function () {
    // Mock of a 3rd party extensionMock
    //
    fluid.defaults("gpii.chrome.tests.extensionMock", {
        gradeNames: "gpii.chrome.extensionHolder",
        extensionId: "abcdefghijklmnoprstuvwxyz0123456",
        model: {
            extensionEnabled: false
        }
    });

    // Mock this call to chrome.management.get
    //
    chrome.management.get.yields(gpii.tests.extensionHolder.extInfoMock);
    var ext = gpii.chrome.tests.extensionMock();

    jqUnit.assertDeepEq("Check that the extensionMock has been successfully populated", gpii.tests.extensionHolder.extInfoMock, ext.extensionInstance);

    chrome.management.setEnabled.func = function (id, value) {
        jqUnit.assertTrue("setEnabled gets a boolean value", "boolean", typeof(value));
    };

    ext.applier.change("extensionEnabled", true);
    gpii.tests.extensionHolder.assertState(ext, true);

    ext.applier.change("extensionEnabled", false);
    gpii.tests.extensionHolder.assertState(ext, false);

    ext.events.onExtEnabled.fire();
    gpii.tests.extensionHolder.assertState(ext, true);

    ext.events.onExtDisabled.fire();
    gpii.tests.extensionHolder.assertState(ext, false);

    chrome.runtime.lastError = true;
    ext.events.onExtUninstalled.fire(gpii.tests.extensionHolder.extInfoMock.id);
    jqUnit.assertUndefined("Checking that the extensionInstance has been cleared", ext.extensionInstance);
    chrome.runtime.lastError = undefined;

    ext.events.onExtInstalled.fire(gpii.tests.extensionHolder.extInfoMock);
    jqUnit.assertDeepEq("Check that the extensionInstance has been successfully repopulated", gpii.tests.extensionHolder.disabledInstance, ext.extensionInstance);

    chrome.management.setEnabled.flush();
});

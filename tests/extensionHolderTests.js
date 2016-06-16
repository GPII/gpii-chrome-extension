/* eslint-env node */
/* global require */

"use strict";

var chrome = require("sinon-chrome");
var fluid = require("infusion");
var jqUnit = fluid.require("node-jqunit", require, "jqUnit");
var gpii = fluid.registerNamespace("gpii");

require("../extension/src/lib/extensionHolder.js");

jqUnit.module("GPII Chrome Extension extensionHolder unit tests");

jqUnit.test("Running unit tests for extensionHolder", function () {
    // Mock of a 3rd party extensionMock
    //
    fluid.defaults("gpii.chrome.tests.extensionMock", {
        gradeNames: "gpii.chrome.extensionHolder",
        extensionId: "abcdefghijklmnoprstuvwxyz0123456"
    });

    var extInfoMock = {
        "description": "Chrome Extension Mock",
        "disabledReason": "unknown",
        "enabled": false,
        "id": "abcdefghijklmnoprstuvwxyz0123456",
        "mayDisable": true,
        "name": "ChromeExtensionMock",
        "shortName": "Mocky",
        "type": "extension",
        "version": "0.1"
    };

    // Mock this call to chrome.management.get
    //
    chrome.management.get.yields(extInfoMock);
    var ext = gpii.chrome.tests.extensionMock();

    jqUnit.assertDeepEq("Check that the extensionMock has been successfully populated", extInfoMock, ext.extensionInstance);

    chrome.management.setEnabled.func = function (id, value) {
        jqUnit.assertTrue("setEnabled gets a boolean value", "boolean", typeof(value));
    };

    ext.applier.change("extensionEnabled", true);
    jqUnit.assertTrue("Checking that ext.model.extensionEnabled is true", ext.model.extensionEnabled);
    jqUnit.assertTrue("Checking that ext.extensionInstance.enabled is true", ext.extensionInstance.enabled);
    jqUnit.assertTrue("Checking that ext.getEnabled returns true", ext.getEnabled());

    ext.applier.change("extensionEnabled", false);
    jqUnit.assertFalse("Checking that ext.model.extensionEnabled is false", ext.model.extensionEnabled);
    jqUnit.assertFalse("Checking that ext.extensionInstance.enabled is false", ext.extensionInstance.enabled);
    jqUnit.assertFalse("Checking that ext.getEnabled returns false", ext.getEnabled());

    chrome.flush();
});

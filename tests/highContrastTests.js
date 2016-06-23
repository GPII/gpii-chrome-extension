/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
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
var jqUnit = fluid.require("node-jqunit", require, "jqUnit");
var gpii = fluid.registerNamespace("gpii");

require("../extension/src/lib/chromeEvented.js");
require("../extension/src/lib/highContrast.js");

jqUnit.module("GPII Chrome Extension highContrast unit tests");

jqUnit.test("Running unit tests for highContrast", function () {

    var highContrast = gpii.chrome.highContrast();

    jqUnit.assertFalse("highContrastEnabled must be false at the beginning",
                        highContrast.model.highContrastEnabled);
    jqUnit.assertUndefined("highContrastTheme must be undefined at the beginning",
                            highContrast.model.highContrastTheme);

    highContrast.applier.change("highContrastEnabled", true);
    jqUnit.assertTrue("highContrastEnabled === true", highContrast.model.highContrastEnabled);

    highContrast.applier.change("highContrastTheme", "black-white");
    jqUnit.assertEquals("highContrastTheme is set to black-white",
                        "black-white",
                        highContrast.model.highContrastTheme);

    highContrast.applier.change("highContrastEnabled", false);
    jqUnit.assertFalse("highContrastEnabled must be false now",
                        highContrast.model.highContrastEnabled);

});

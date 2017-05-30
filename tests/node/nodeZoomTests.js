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

var chrome = chrome || require("sinon-chrome");
var fluid = fluid || require("infusion");
var jqUnit = jqUnit || fluid.require("node-jqunit", require, "jqUnit");

require("../../extension/src/lib/chromeEvented.js");
require("../../extension/src/lib/zoom.js");
require("../shared/zoomTestDefs.js");

fluid.test.runTests("gpii.chrome.tests.zoom.testEnvironment");

/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md.
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

var fluid = fluid || require("infusion");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");
var jqUnit = jqUnit || fluid.require("node-jqunit", require, "jqUnit");

require("../../extension/src/lib/chromeEvented.js");
require("../../extension/src/lib/zoom.js");
require("../shared/zoomTestDefs.js");

fluid.test.runTests("gpii.chrome.tests.zoom.testEnvironment");

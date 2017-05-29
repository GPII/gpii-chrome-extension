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

/* global QUnit */
"use strict";

// command line search:
// find . -name "*Tests.html" | awk '{print "\""$1"\","}'

QUnit.testSuites("Adaptation/Enactor Tests", [
    "highContrastTests.html"
]);

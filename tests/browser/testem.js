/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/AUTHORS.md
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

fluid.require("%ui-options-chrome");
require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.instrumentation"],
    coverageDir: "%ui-options-chrome/coverage",
    reportsDir: "%ui-options-chrome/reports",
    testPages:  ["tests/browser/all-tests.html"],
    instrumentedSourceDir: "%ui-options-chrome/instrumented",
    instrumentationOptions: {
        nonSources: [
            "./**/*.!(js)",
            "./Gruntfile.js"
        ]
    },
    sourceDirs: {
        extension: "%ui-options-chrome/src"
    },
    contentDirs: {
        tests:   "%ui-options-chrome/tests"
    },
    testemOptions: {
        // Due to https://issues.gpii.net/browse/GPII-4064 skipping "Headless Chrome"
        // Due to https://github.com/testem/testem/issues/1387 skipping "Safari"
        skip: "Headless Chrome,IE,PhantomJS,Safari",
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.testem().getTestemOptions();

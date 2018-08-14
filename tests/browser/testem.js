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
        extension: "%ui-options-chrome/extension"
    },
    contentDirs: {
        tests:   "%ui-options-chrome/tests"
    },
    testemOptions: {
        skip: "PhantomJS,Opera,Safari,Firefox",
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.testem().getTestemOptions();

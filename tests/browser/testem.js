"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

require("../../index.js");
require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.instrumentation"],
    coverageDir: "coverage",
    reportsDir: "reports",
    testPages:  ["tests/browser/all-tests.html"],
    instrumentationOptions: {
        nonSources: [
            "./**/*.!(js)",
            "./Gruntfile.js"
        ]
    },
    sourceDirs: {
        content_scripts: "%ui-options-chrome/extension/src/content_scripts",
        lib: "%ui-options-chrome/extension/src/lib",
        dist: "%ui-options-chrome/dist"
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

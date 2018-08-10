"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

require("../../index.js");
require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverage"],
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
        // content_scripts: "%ui-options-chrome/extension/src/content_scripts",
        // lib: "%ui-options-chrome/extension/src/lib"
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

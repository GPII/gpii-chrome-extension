"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

require("../../index.js");
require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    coverageDir: "coverage",
    reportsDir: "reports",
    testPages:  ["tests/browser/all-tests.html"],
    instrumentSource: false,
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

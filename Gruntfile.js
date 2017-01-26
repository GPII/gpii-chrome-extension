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

 /* global module */

"use strict";

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-crx");
    grunt.loadNpmTasks("grunt-jsonlint");

    var files = {
        jQueryStandalone: [
            "node_modules/infusion/src/framework/core/js/jquery.standalone.js"
        ],
        infusion: [
            "node_modules/infusion/src/framework/core/js/Fluid.js",
            "node_modules/infusion/src/framework/core/js/FluidDebugging.js",
            "node_modules/infusion/src/framework/core/js/FluidIoC.js",
            "node_modules/infusion/src/framework/core/js/DataBinding.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformation.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformationTransforms.js"
        ],
        infusionTesting: [
            "node_modules/infusion/src/framework/enhancement/js/ContextAwareness.js",
            "node_modules/infusion/tests/test-core/utils/js/IoCTestUtils.js"
        ],
        extension: [
            "extension/src/lib/chromeEvented.js",
            "extension/src/lib/chromeNotifications.js",
            "extension/src/lib/extensionHolder.js",
            "extension/src/lib/highContrast.js",
            "extension/src/lib/chromeSettings.js",
            "extension/src/lib/wsConnector.js",
            "extension/src/lib/zoom.js"
        ],
        testing: [
            "node_modules/infusion/tests/lib/qunit/js/qunit.js",
            "node_modules/infusion/tests/lib/qunit/addons/composite/qunit-composite.js",
            "node_modules/infusion/tests/test-core/jqUnit/js/jqUnit.js",
            "node_modules/infusion/tests/test-core/jqUnit/js/jqUnit-browser.js",
            "node_modules/sinon-chrome/dist/sinon-chrome.latest.js"
        ],
        testingCSS: [
            "node_modules/infusion/tests/lib/qunit/css/qunit.css",
            "node_modules/infusion/tests/lib/qunit/addons/composite/qunit-composite.css"
        ]
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        manifest: grunt.file.readJSON("extension/manifest.json"),
        jsonlint: {
            all: ["extension/manifest.json"]
        },
        eslint: {
            all: [
                "Gruntfile.js",
                "extension/src/*.js",
                "extension/src/lib/*.js",
                "extension/src/content_scripts/*.js",
                "tests/*.js"
            ]
        },
        uglify: {
            options: {
                beautify: {
                    ascii_only: true
                }
            },
            all: {
                files: {
                    "dist/<%= pkg.name %>-all.min.js" : [].concat(
                        files.jQueryStandalone,
                        files.infusion,
                        files.extension
                    ),
                    "dist/<%= pkg.name %>-testing.min.js" : [].concat(
                        files.infusionTesting,
                        files.testing
                    )
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        src: ["extension/manifest.json"],
                        dest: "build/manifest.json"
                    },
                    {
                        src: ["extension/src/background.js"],
                        dest: "build/src/background.js"
                    },
                    {
                        expand: true,
                        cwd: "extension/css/",
                        src: "*",
                        dest: "build/css/"
                    },
                    {
                        expand: true,
                        cwd: "extension/src/content_scripts/",
                        src: "*",
                        dest: "build/content_scripts/"
                    },
                    {
                        expand: true,
                        cwd: "tests/",
                        src: "**",
                        dest: "build/tests/"
                    },
                    {
                        src: ["dist/<%= pkg.name %>-all.min.js"],
                        dest: "build/"
                    },
                    {
                        src: ["dist/<%= pkg.name %>-testing.min.js"],
                        dest: "build/"
                    },
                    {
                        src: [].concat(
                            files.testingCSS
                        ),
                        dest: "build/css/",
                        expand: true,
                        flatten: true
                    }
                ]
            }
        },
        clean: {
            all: {
                src: ["dist/", "build/", "*.crx"]
            }
        },
        crx: {
            "build": {
                "src": [
                    "build/**/*"
                ],
                "dest": "./gpii-chrome-extension.crx",
                "options": {
                    "privateKey": "./key.pem"
                }
            }
        }
    });

    grunt.registerTask("lint", "Lint the source code", ["jsonlint", "eslint"]);
    grunt.registerTask("bundle", "Bundle dependencies and source code into a single .min.js file", ["uglify"]);
    grunt.registerTask("build", "Build the extension so you can start using it unpacked", ["bundle", "copy"]);
    grunt.registerTask("buildPkg", "Create a .crx package ready to be distributed", ["lint", "build", "crx"]);
};

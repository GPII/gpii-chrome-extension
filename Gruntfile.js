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
        extensionLib: [
            "node_modules/infusion/src/framework/core/js/jquery.standalone.js",
            "node_modules/infusion/src/framework/core/js/Fluid.js",
            "node_modules/infusion/src/framework/core/js/FluidDebugging.js",
            "node_modules/infusion/src/framework/core/js/FluidIoC.js",
            "node_modules/infusion/src/framework/core/js/DataBinding.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformation.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformationTransforms.js"
        ],
        contentScriptsLib: [
            "node_modules/infusion/src/lib/jquery/core/js/jquery.js",
            "node_modules/infusion/src/framework/core/js/Fluid.js",
            "node_modules/infusion/src/framework/core/js/FluidDocument.js",
            "node_modules/infusion/src/framework/core/js/FluidIoC.js",
            "node_modules/infusion/src/framework/core/js/DataBinding.js",
            "node_modules/infusion/src/framework/core/js/FluidView.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformation.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformationTransforms.js",
            "node_modules/infusion/src/framework/core/js/FluidDOMUtilities.js",
            "node_modules/infusion/src/framework/core/js/FluidRequests.js",
            "node_modules/infusion/src/lib/fastXmlPull/js/fastXmlPull.js",
            "node_modules/infusion/src/framework/renderer/js/fluidParser.js",
            "node_modules/infusion/src/framework/renderer/js/fluidRenderer.js",
            "node_modules/infusion/src/framework/renderer/js/RendererUtilities.js",
            "node_modules/infusion/src/components/tableOfContents/js/TableOfContents.js",
            "node_modules/infusion/src/framework/preferences/js/Enactors.js"
        ],
        enactorCSS: [
            "node_modules/infusion/dist/assets/src/framework/preferences/css/Enactors.css"
        ],
        templates: [
            "node_modules/infusion/src/components/tableOfContents/html/TableOfContents.html"
        ],
        infusionTesting: [
            "node_modules/infusion/src/framework/enhancement/js/ContextAwareness.js",
            "node_modules/infusion/tests/test-core/utils/js/IoCTestUtils.js"
        ],
        extension: [
            "extension/src/lib/chromeEvented.js",
            "extension/src/lib/chromeNotifications.js",
            "extension/src/lib/domSettingsApplier.js",
            "extension/src/lib/extensionHolder.js",
            "extension/src/lib/highContrast.js",
            "extension/src/lib/chromeSettings.js",
            "extension/src/lib/wsConnector.js",
            "extension/src/lib/zoom.js"
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
                "*.js",
                "extension/**/*.js",
                "tests/**/*.js"
            ]
        },
        uglify: {
            options: {
                beautify: {
                    ascii_only: true
                }
                // sourceMap options set in buildDev task definition
            },
            all: {
                files: {
                    "dist/<%= pkg.name %>-all.min.js" : [].concat(
                        files.extensionLib,
                        files.extension
                    ),
                    "dist/<%= pkg.name %>-contentScriptsLib.min.js" : [].concat(
                        files.contentScriptsLib
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
                        src: [].concat(
                            files.enactorCSS
                        ),
                        dest: "build/css/",
                        expand: true,
                        flatten: true
                    },
                    {
                        src: [].concat(
                            files.templates
                        ),
                        dest: "build/templates/",
                        expand: true,
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: "extension/images/",
                        src: "*",
                        dest: "build/images/"
                    },
                    {
                        expand: true,
                        cwd: "extension/src/content_scripts/",
                        src: "*",
                        dest: "build/content_scripts/"
                    },
                    {
                        src: ["dist/*.min.js*"],
                        dest: "build/"
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
    grunt.registerTask("build", "Build the extension so you can start using it unpacked", ["clean", "bundle", "copy"]);
    grunt.registerTask("buildPkg", "Create a .crx package ready to be distributed", ["lint", "build", "crx"]);

    grunt.registerTask("buildDev", "Build the extension so you can start using it unpacked and with a sourceMap", function () {
        grunt.config.set("uglify.options.sourceMap.includeSources", true);
        grunt.task.run("build");
    });
};

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

 /* global module */

"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        buildType: "uio",
        lintAll: {
            sources: {
                md: [ "./*.md"],
                js: ["./tests/**/*.js", "./src/**/*.js", "./*.js"],
                json: ["./src/**/*.json", "./*.json", "./.*.json"],
                other: ["./.*"]
            }
        },
        clean: {
            all: {
                src: ["build/"]
            }
        },
        stylus: {
            build: {
                options: {
                    compress: true,
                    relativeDest: "../../build/<%= buildType %>/css"
                },
                files: [{
                    expand: true,
                    src: ["src/stylus/*.styl"],
                    ext: ".css"
                }]
            }
        },
        writeManifest: {
            options: {
                space: 4
            },
            uio: {
                src: "src/manifest.json",
                dest: "build/<%= buildType %>/manifest.json"
            },
            morphic: {
                src: ["src/manifest.json", "src/manifest_morphic.json"],
                dest: "build/<%= buildType %>/manifest.json"
            }
        },
        copy: {
            source: {
                cwd: "src",
                expand: true,
                src: [
                    "css/**/*",
                    "html/**/*",
                    "images/**/*",
                    "js/**/*",
                    "messages/**/*",
                    "templates/**/*"
                ],
                dest: "build/<%= buildType %>/"
            },
            lib: {
                //TODO: Currently there is a bug in Chrome that prevents source maps from working for extensions.
                //      see: https://bugs.chromium.org/p/chromium/issues/detail?id=212374
                //      After the above issue is fixed, include source maps and/or additional build types to improve
                //      debugging.
                files: [{
                    expand: true,
                    flatten: true,
                    src: "node_modules/infusion/dist/infusion-uio.min.js",
                    dest: "build/<%= buildType %>/js/lib/infusion/"
                }, {
                    expand: true,
                    flatten: true,
                    src: "node_modules/infusion/src/lib/hypher/patterns/*.js",
                    dest: "build/<%= buildType %>/js/lib/syllablePatterns/"
                }]
            },
            templates: {
                cwd: "node_modules/infusion/src/",
                expand: true,
                flatten: true,
                src: [
                    "components/tableOfContents/html/TableOfContents.html",
                    "framework/preferences/html/PrefsEditorTemplate-*.html"
                ],
                dest: "build/<%= buildType %>/templates/"
            },
            messages: {
                expand: true,
                flatten: true,
                src: "node_modules/infusion/src/framework/preferences/messages/*.json",
                dest: "build/<%= buildType %>/messages/"
            },
            fonts: {
                cwd: "node_modules/infusion/src/",
                expand: true,
                flatten: true,
                src: [
                    "framework/preferences/fonts/*.woff",
                    "components/orator/fonts/*.woff",
                    "lib/opensans/fonts/*.woff"
                ],
                dest: "build/<%= buildType %>/fonts/"
            },
            styles: {
                cwd: "node_modules/infusion/",
                expand: true,
                flatten: true,
                src: [
                    "src/lib/normalize/css/normalize.css",
                    "src/framework/core/css/fluid.css",
                    "src/components/orator/css/Orator.css",
                    "src/components/tableOfContents/css/TableOfContents.css",
                    "dist/assets/src/framework/preferences/css/PrefsEditor.css",
                    "dist/assets/src/framework/preferences/css/SeparatedPanelPrefsEditorFrame.css"
                ],
                dest: "build/<%= buildType %>/css/"
            }
        },
        compress: {
            all: {
                options: {
                    archive: "build/<%= buildType %>/UIO+_v<%= pkg.version %>_<%= buildType %>.zip"
                },
                files: [{
                    expand: true,
                    cwd: "build/<%= buildType %>/",
                    src: ["**/*"]
                }]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-stylus");
    grunt.loadNpmTasks("gpii-grunt-lint-all");

    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);

    grunt.registerTask("buildType", "Build the UIO+ extension", function (target) {
        grunt.config.set("buildType", target);
    });

    // Can specify a replacer or space option to be used by the JSON.stringify call
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    grunt.registerMultiTask("writeManifest", "Outputs a manifest file by merging the source documents into the destination.", function () {
        var options = this.options();
        var output = {};
        var version_name = grunt.option("version_name");

        this.filesSrc.forEach(function (fileSrc) {
            var json = grunt.file.readJSON(fileSrc);
            Object.assign(output, json);
        });

        if (version_name) {
            Object.assign(output, {version_name: version_name});
        }

        grunt.file.write(this.data.dest, JSON.stringify(output, options.replacer, options.space));
    });

    grunt.registerTask("buildExtensions", "Build the UIO+ extension", function (target) {
        target = target ? [target] : ["uio", "morphic"];

        target.forEach(function (buildType) {
            var tasks = [
                "buildType:" + buildType,
                "stylus",
                "copy",
                "writeManifest:" + buildType,
                "compress"
            ];
            grunt.task.run(tasks);
        });
    });

    grunt.registerTask("build", "Build the extensions", ["clean", "buildExtensions"]);
    grunt.registerTask("default", ["build"]);
};

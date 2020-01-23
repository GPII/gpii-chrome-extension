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
        lintAll: {
            sources: {
                md: [ "./*.md"],
                js: ["./tests/**/*.js", "./extension/**/*.js", "./*.js"],
                json: ["./extension/**/*.json", "./*.json", "./.*.json"],
                other: ["./.*"]
            }
        },
        stylus: {
            build: {
                options: {
                    compress: true,
                    relativeDest: "../../build/css"
                },
                files: [{
                    expand: true,
                    src: ["src/stylus/*.styl"],
                    ext: ".css"
                }]
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
                    "templates/**/*",
                    "manifest.json"
                ],
                dest: "build/"
            },
            lib: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: "node_modules/infusion/dist/infusion-uio.min.js",
                    dest: "build/js/lib/infusion/"
                }, {
                    expand: true,
                    flatten: true,
                    src: "node_modules/infusion/src/lib/hypher/patterns/*.js",
                    dest: "build/js/lib/syllablePatterns/"
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
                dest: "build/templates/"
            },
            messages: {
                expand: true,
                flatten: true,
                src: "node_modules/infusion/src/framework/preferences/messages/*.json",
                dest: "build/messages/"
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
                dest: "build/fonts/"
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
                dest: "build/css/"
            }
        },
        clean: {
            all: {
                src: ["build/"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-stylus");
    grunt.loadNpmTasks("gpii-grunt-lint-all");

    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);
    grunt.registerTask("build", "Build the extension so you can start using it unpacked", ["clean", "stylus", "copy"]);

    grunt.registerTask("default", ["build"]);
};

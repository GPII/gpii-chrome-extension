/*
 * Copyright The UIO+ for Morphic copyright holders
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

var merge = require("deepmerge");

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        buildVersion: "<%= pkg.version %>",
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
                src: ["dist/"]
            }
        },
        writeManifest: {
            options: {
                space: 4
            },
            all: {
                src: ["dist/manifest.json", "src/manifest.json"],
                dest: "dist/manifest.json"
            }
        },
        copy: {
            "uio+": {
                cwd: "node_modules/uio-plus/dist",
                expand: true,
                dest: "dist/",
                src: ["**/*"]
            },
            source: {
                cwd: "src",
                expand: true,
                src: [
                    "js/**/*"
                ],
                dest: "dist/"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("gpii-grunt-lint-all");

    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);

    // Can specify a replacer or space option to be used by the JSON.stringify call
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    grunt.registerMultiTask("writeManifest", "Outputs a manifest file by merging the source documents into the destination.", function () {
        var options = this.options();
        var version_name = grunt.option("version_name");

        var overwriteMerge = function (destinationArray, sourceArray) {
            return sourceArray;
        };

        var inputs = this.filesSrc.map(function (fileSrc) {
            return grunt.file.readJSON(fileSrc);
        });

        var output = merge.all(inputs, { arrayMerge: overwriteMerge });

        if (version_name) {
            output = merge(output, {version_name: version_name});
        }

        grunt.file.write(this.data.dest, JSON.stringify(output, options.replacer, options.space));
    });

    grunt.registerTask("build", "Build the extensions", ["clean", "copy", "writeManifest"]);
    grunt.registerTask("default", ["build"]);
};

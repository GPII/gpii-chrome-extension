/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid */
"use strict";

(function ($, fluid) {
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.simplify", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            article: "article, [role~='article'], .article, #article",
            main: "main, [role~='main'], .main, #main",
            genericContent: ".content, #content, .body:not('body'), #body:not('body')",
            nav: "nav, [role~='navigation'], .navigation, .nav, #nav, #navigation, [role~='search'], [type~='search']"
        },
        model: {
            simplify: false
        },
        modelListeners: {
            simplify: {
                listener: "{that}.set",
                args: ["{change}.value"]
            }
        },
        events: {
            settingChanged: null
        },
        invokers: {
            findContent: {
                funcName: "gpii.simplify.findByStrategy",
                args: ["{that}", ["article", "main", "genericContent"]]
            },
            findNav: {
                funcName: "gpii.simplify.findByStrategy",
                args: ["{that}", "nav"]
            },
            set: {
                funcName: "gpii.simplify.set",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    gpii.simplify.findByStrategy = function (that, strategy) {
        strategy = fluid.makeArray(strategy);
        var elms;

        for (var pos in strategy) {
            elms = that.locate(strategy[pos]);
            if (elms.length) {
                break;
            }
        }

        return elms;
    };

    gpii.simplify.set = function (that, state) {
        var content = that.findContent();
        if (state && content.length) {
            that.container.css("visibility", "hidden");
            content.css("visibility", "visible");
        } else {
            that.container.css("visibility", "");
            content.css("visibility", "");
        }
    };
})(jQuery, fluid);

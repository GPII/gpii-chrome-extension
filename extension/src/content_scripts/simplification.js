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
            navToggle: ".gpiic-simplify-navToggle",
            article: "article, [role~='article'], .article, #article",
            main: "main, [role~='main'], .main, #main",
            genericContent: ".content, #content, .body:not('body'), #body:not('body')",
            nav: "nav, [role~='navigation'], .navigation, .nav, #nav, #navigation, [role~='search'], [type~='search']"
        },
        markup: {
            navToggle: "<button class='gpiic-simplify-navToggle'></button>"
        },
        strings: {
            navToggle: "Show/Hide Navigation"
        },
        styles: {
            navToggle: "gpii-simplify-navToggle"
        },
        model: {
            simplify: false,
            showNav: false
        },
        modelListeners: {
            simplify: {
                listener: "{that}.set",
                args: ["{change}.value"]
            },
            showNav: {
                listener: "{that}.toggleNav",
                args: ["{change}.value"],
                excludeSource: "init"
            }
        },
        listeners: {
            "onCreate.toggleNav": {
                listener: "{that}.toggleNav",
                args: ["{that}.model.showNav"]
            }
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
            },
            toggleNav: {
                funcName: "gpii.simplify.toggleNav",
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

    gpii.simplify.injectToggle = function (that, content) {
        var navToggle = that.locate("navToggle");

        if (!navToggle.length) {
            navToggle = $(that.options.markup.navToggle);
            navToggle.attr("aria-pressed", that.model.showNav);
            navToggle.text(that.options.strings.navToggle);
            navToggle.addClass(that.options.styles.navToggle);
            navToggle.click(function () {
                var newState = !that.model.showNav;
                that.applier.change("showNav", newState);
            });
            // prepend to first content element only
            content.eq(0).prepend(navToggle);
        }
    };

    gpii.simplify.set = function (that, state) {
        var content = that.findContent();
        if (state && content.length) {
            that.container.css("visibility", "hidden");
            content.css("visibility", "visible");
            gpii.simplify.injectToggle(that, content);
            that.locate("navToggle").show();
        } else {
            that.locate("navToggle").hide();
            that.container.css("visibility", "");
            content.css("visibility", "");
        }
    };

    gpii.simplify.toggleNav = function (that, state) {
        var nav = that.findNav();
        var navToggle = that.locate("navToggle");
        if (state && that.model.simplify) {
            nav.css("visibility", "visible");
            navToggle.attr("aria-pressed", state);
        } else {
            nav.css("visibility", "");
            navToggle.attr("aria-pressed", state);
        }
    };
})(jQuery, fluid);

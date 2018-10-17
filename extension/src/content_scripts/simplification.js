/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2017-2018 OCAD University
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
        gradeNames: ["gpii.chrome.contentView"],
        selectors: {
            navToggle: ".gpiic-simplify-navToggle",
            nav: "nav, [role~='navigation'], .navigation, .nav, #nav, #navigation",
            search: "[role~='search'], [type~='search']",
            visible: ".gpiic-simplify-visible"
        },
        alwaysVisible: ["search", "visible"],
        markup: {
            navToggle: "<button class='gpiic-simplify-navToggle'></button>"
        },
        strings: {
            navToggle: "Show/Hide Navigation"
        },
        styles: {
            navToggle: "gpii-simplify-navToggle"
        },
        members: {
            nav: {
                expander: {
                    funcName: "{that}.locateOutOfContent",
                    args: ["nav"]
                }
            }
        },
        model: {
            simplify: false,
            showNav: false
        },
        modelListeners: {
            simplify: {
                listener: "{that}.set",
                args: ["{change}.value"],
                excludeSource: ["init"]
            },
            showNav: {
                listener: "{that}.toggleNav",
                args: ["{change}.value"],
                excludeSource: "init"
            }
        },
        events: {
            onAlwaysVisibleNodeAdded: null
        },
        listeners: {
            "onCreate.toggleNav": {
                listener: "{that}.toggleNav",
                args: ["{that}.model.showNav"]
            },
            "onCreate.set": {
                listener: "{that}.set",
                args: ["{that}.model.simplify"]
            }
        },
        injectNavToggle: true,
        components: {
            observer: {
                type: "gpii.chrome.mutationObserver",
                container: "{that}.container",
                options: {
                    defaultObserveConfig: {
                        attributes: false
                    },
                    listeners: {
                        "onNodeAdded.makeVisible": {
                            listener: "gpii.simplify.setVisible",
                            args: ["{simplify}", "{arguments}.0", "{arguments}.1"]
                        }
                    }
                }
            }
        },
        invokers: {
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

    gpii.simplify.injectToggle = function (that, content) {
        var navToggle = that.locate("navToggle");

        if (!navToggle.length && that.nav.length) {
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

    gpii.simplify.setVisible = function (that, node, mutationRecord) {
        var elm = node.nodeType === Node.ELEMENT_NODE ? $(node) : $(mutationRecord.target);

        var makeVisible = fluid.find(that.options.alwaysVisible, function (selectorName) {
            return elm.is(that.options.selectors[selectorName]) || undefined;
        }, false);

        if (makeVisible) {
            elm.css("visibility", "visible");
        }
    };

    gpii.simplify.set = function (that, state) {
        if (state && that.content.length) {
            that.content.css("visibility", "visible");
            fluid.each(that.options.alwaysVisible, function (selector) {
                that.locate(selector).css("visibility", "visible");
            });
            that.container.css("visibility", "hidden");
            if (that.options.injectNavToggle) {
                gpii.simplify.injectToggle(that, that.content);
            }
            that.locate("navToggle").show();
            that.observer.observe();
        } else if (that.content.length) {
            that.locate("navToggle").hide();
            that.container.css("visibility", "");
            that.content.css("visibility", "");
            fluid.each(that.options.alwaysVisible, function (selector) {
                that.locate(selector).css("visibility", "");
            });
            that.observer.disconnect();
        }
    };

    gpii.simplify.toggleNav = function (that, state) {
        var navToggle = that.locate("navToggle");
        if (state && that.model.simplify) {
            that.nav.css("visibility", "visible");
            navToggle.attr("aria-pressed", state);
        } else {
            that.nav.css("visibility", "");
            navToggle.attr("aria-pressed", state);
        }
    };
})(jQuery, fluid);

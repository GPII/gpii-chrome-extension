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

/* global fluid, gpii */
"use strict";

(function ($, fluid) {

    /*
     * `gpii.chrome.contentView` is a type of view component which extends the typical viewComponent facilities for
     * searching for selectors. The extended features allow for searching for "content" amongst a variety of selectors,
     * and returning the first one found. This is useful when trying to determine the primary content of a page, and is
     * typically used by enactors acting upon an entire document without explicit knowledge of the primary content area.
     *
     * The content is located upon component creation and stored in the `content` member. The `content` option can be
     * set with an array of selector names to determine which selectors should be used to search for the content. The
     * order determines which selectors to look through first. The search will terminate after the first selector
     * that returns elements. If none of the selectors is able to locate any elements, the value stored in the
     * `defaultContent` is returned or if that is not provided, an empty jQuery object is returned.
     *
     * Additionally, methods are provided to find selectors scoped within the content (`locateInContent`) or scoped to
     * the container, but outside of the content (`locateOutOfContent`). These methods behave similarly to calls to
     * `locate`; which is also still available for use. However, they cannot be used in IoC expressions like `locate`
     * can.
     */
    fluid.defaults("gpii.chrome.contentView", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            article: "article, [role~='article'], .article, #article",
            main: "main, [role~='main'], .main, #main",
            genericContent: ".content, #content, .body:not('body'), #body:not('body')"
        },
        content: ["article", "main", "genericContent"],
        defaultContent: "",
        members: {
            // The content member provides the scoping for the `locateInContent` method,
            // the "inverse" scoping for the `locateOutOfContent` method and can be used directly
            // to refer to other operations on the primary content (e.g. as a container for another component).
            // We assign this as a member so that it is available at creation, and only has to be executed once.
            content: {
                expander: {
                    funcName: "gpii.chrome.contentView.findFirstSelector",
                    args: ["{that}", "{that}.options.content", "{that}.options.defaultContent"]
                }
            }
        },
        invokers: {
            locateInContent: {
                funcName: "gpii.chrome.contentView.locateInContent",
                args: ["{that}.locate", "{arguments}.0"]
            },
            locateOutOfContent: {
                funcName: "gpii.chrome.contentView.locateOutOfContent",
                // the last argument isn't directly used, but is provided to force IoC resolution of the method which is
                // used within the executed function.
                args: ["{that}", "{arguments}.0", "{that}.locateInContent"]
            }
        }
    });

    /**
     * Returns the jQuery element for the first selector which returns a
     * jQuery object with 1 or more elements. If no elements found, it returns
     * either an empty jQuery object or the default, if a default is provided.
     *
     * @param {Function} locate - a locate function to find a jQuery element from a selector. Typically this is a
     *                            component's `locate` method. e.g. `that.locate`
     * @param {String|Array} selectorNames - one or more selector names to search through in the order to try.
     *                    The selector names must correspond to selectors in the component's
     *                    selectors block.
     * @param {Any} deflt - a default value to use if no elements found for any of the  selector names
     * @return {Any} - a jQuery object if found. If nothing found, either the `deflt` value or an empty jQuery is
     *                 returned.
     */
    gpii.chrome.contentView.findFirstSelector = function (locate, selectorNames, deflt) {
        selectorNames = fluid.makeArray(selectorNames);

        var found = fluid.find_if(selectorNames, function (selector) {
            var elms = locate(selector);
            return elms.length > 0;
        });

        return found ? locate(found) : deflt || $();
    };

    /**
     * Similar to `that.locate` but the scope of the search is within just the content and not the container whole
     * container.
     *
     * @param {Component} that - an instance of `gpii.chrome.contentView`
     * @param {String} selectorName - a selector name as defined in the selector's block. Similar to using `that.locate`
     *
     * @return {jQuery} - a jQuery object representing the selection found within the content
     */
    gpii.chrome.contentView.locateInContent = function (that, selectorName) {
        return that.content.find(that.options.selectors[selectorName]);
    };

    /**
     * Similar to `that.locate` but the search excludes any items found within the scope of the content.
     *
     * @param {Component} that - an instance of `gpii.chrome.contentView`
     * @param {String} selectorName - a selector name as defined in the selectors block. Similar to using `that.locate`
     *
     * @return {jQuery} - a jQuery object representing the selection found outside of the content
     */
    gpii.chrome.contentView.locateOutOfContent = function (that, selectorName) {
        var inContent = that.locateInContent(selectorName);
        return that.locate(selectorName).not(inContent);
    };

})(jQuery, fluid);

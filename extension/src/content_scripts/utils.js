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

/* global fluid, gpii */
"use strict";

(function ($, fluid) {
    fluid.registerNamespace("gpii.chrome.utils");

    /**
     * Returns the jQuery element for the first selector which returns a
     * jQuery object with 1 or more elements. If no elements found, it returns
     * either an empty jQuery object or the default, if a default is provided.
     *
     * @param that {Object} - a fluid.viewComponent
     * @param selectors {String|Array} - one or more selector names to search through in the order to try.
     *                    The selector names must correspond to selectors in the component's
     *                    selectors block.
     * @param deflt {Any} - a default value to use if no elements found for any of the  selector names
     * @returns {Any} - a jQuery object if found. If nothing found, either the deflt value or undefined is returned.
     */
    gpii.chrome.utils.findFirstSelector = function (that, selectorNames, deflt) {
        selectorNames = fluid.makeArray(selectorNames);

        var found = fluid.find_if(selectorNames, function (selector) {
            var  elms = that.locate(selector);
            return elms.length > 0;
        });

        return found ? that.locate(found) : deflt;
    };
})(jQuery, fluid);

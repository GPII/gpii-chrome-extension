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

"use strict";

var gpii = gpii || {};

[
    "../js/lib/infusion/infusion-uio.min.js",
    "../js/shared/portBinding.js",
    "../js/browserAction/PrefsEditor.js",
    "../js/browserAction/PrefsEditorInstantiation.js"
].forEach(function (src) {
    var element = document.createElement("script");
    element.src = src;
    element.async = false;
    document.head.appendChild(element);
});

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

/*

    As this is a browser component, this file is only meant to make it easier to refer to our code and fixtures using
    the standard `%package-name/path/to/content` notation.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.module.register("uio-plus-for-morphic", __dirname, require);

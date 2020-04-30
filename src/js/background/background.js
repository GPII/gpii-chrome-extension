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

/* global fluid, gpii */

"use strict";


fluid.defaults("gpii.chrome.morphic", {
    gradeNames: "uioPlus.chrome.settings",
    components: {
        wsConnector: {
            type: "gpii.wsConnector",
            options: {
                solutionId: "net.gpii.uioPlus",
                flowManager: "ws://localhost:8081/browserChannel",
                retryTime: 10,
                listeners: {
                    "{that}.events.onSettingsChange": "{uioPlus.chrome.settings}.updateSettings"
                }
            }
        }
    }
});

gpii.chrome.morphic();

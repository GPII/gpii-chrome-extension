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

/* eslint-env node */
/* global fluid */

"use strict";

fluid.contextAware.makeChecks({"gpii.chrome.morphic": true});

fluid.defaults("gpii.chrome.settings.webSocketConnection", {
    components: {
        wsConnector: {
            type: "gpii.wsConnector",
            options: {
                solutionId: "net.gpii.uioPlus",
                flowManager: "ws://localhost:8081/browserChannel",
                retryTime: 10,
                listeners: {
                    "{that}.events.onSettingsChange": "{gpii.chrome.settings}.updateSettings"
                }
            }
        }
    }
});

fluid.contextAware.makeAdaptation({
    distributionName: "gpii.chrome.websocketDistribution",
    targetName: "gpii.chrome.settings",
    adaptationName: "morphicWebSocket",
    checkName: "morphic",
    record: {
        contextValue: "{gpii.chrome.morphic}",
        gradeNames: "gpii.chrome.settings.webSocketConnection",
        priority: "after:user"
    }
});

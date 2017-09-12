/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, gpii, chrome */

"use strict";

fluid.defaults("gpii.chrome.settings", {
    gradeNames: "fluid.modelComponent",
    events: {
        onInstalled: null,
        onUpdated: null,
        onStartup: null,
        onLoadExtensionHolders: null
    },
    defaultSettings: {
        // not all of the following settings are in the common terms yet.
        // and may need to be updated once they are added there.
        fontSize: 1, // from fontSize
        lineSpace: 1, // from lineSpace
        selectionTheme: "default", // from highlightColor
        contrastTheme: "default", // from highContrastEnabled and highContrastTheme
        characterSpace: 1, // from characterSpace
        inputsLargerEnabled: false, // from inputsLargerEnabled
        selfVoicingEnabled: false, // from selfVoicingEnabled
        tableOfContentsEnabled: false, // from tableOfContents
        dictionaryEnabled: false, // from supportTool
        simplifiedUiEnabled: false, // from simplifiedUiEnabled
        syllabificationEnabled: false // from syllabificationEnabled
    },
    components: {
        click2Speech: {
            type: "gpii.chrome.extensionHolder",
            createOnEvent: "onLoadExtensionHolders",
            options: {
                settingName: "text-to-speech",
                extensionId: "djfpbemmcokhlllnafdmomgecdlicfhj",
                name: "click2speech",
                installationUrl: "https://chrome.google.com/webstore/detail/click2speech/djfpbemmcokhlllnafdmomgecdlicfhj",
                model: {
                    extensionEnabled: "{settings}.model.settings.selfVoicingEnabled"
                }
            }
        },
        dictionary: {
            type: "gpii.chrome.extensionHolder",
            createOnEvent: "onLoadExtensionHolders",
            options: {
                settingName: "dictionary",
                extensionId: "mgijmajocgfcbeboacabfgobmjgjcoja",
                name: "Google Dictionary (by Google)",
                installationUrl: "https://chrome.google.com/webstore/detail/google-dictionary-by-goog/mgijmajocgfcbeboacabfgobmjgjcoja",
                model: {
                    extensionEnabled: "{settings}.model.settings.dictionaryEnabled"
                }
            }
        },
        domSettingsApplier: {
            type: "gpii.chrome.domSettingsApplier",
            options: {
                model: "{settings}.model"
            }
        },
        zoom: {
            type: "gpii.chrome.zoom",
            options: {
                model: {
                    magnifierEnabled: true, // set to true because fontSize is always enabled
                    magnification: "{settings}.model.settings.fontSize"
                }
            }
        },
        wsConnector: {
            type: "gpii.wsConnector",
            options: {
                solutionId: "net.gpii.uioPlus",
                flowManager: "ws://localhost:8081/browserChannel",
                retryTime: 10
            }
        },
        notifications: {
            type: "gpii.chrome.notifications"
        }
    },
    model: {
        settings: "{settings}.options.defaultSettings",  // Defaults
        promptInstall: true
    },
    invokers: {
        updateSettings: {
            funcName: "gpii.chrome.settings.updateSettings",
            args: ["{that}",  "{arguments}.0"]
        }
    },
    listeners: {
        "{wsConnector}.events.onSettingsChange": "{settings}.updateSettings",
        "onCreate.bindChromeEvents": "gpii.chrome.settings.bindChromeEvents",
        "onStartup.updateModel": {
            changePath: "promptInstall",
            value: false
        },
        "onInstalled.loadExtensionHolders": "{that}.events.onLoadExtensionHolders",
        "onUpdated.loadExtensionHolders": "{that}.events.onLoadExtensionHolders",
        "onStartup.loadExtensionHolders": {
            listener: "{that}.events.onLoadExtensionHolders",
            priority: "after:updateModel"
        }
    },
    distributeOptions: [{
        record: {
            "onExtensionMissing.handle": {
                funcName: "gpii.chrome.settings.handleExtensionMissing",
                args: ["{settings}", "{that}"]
            }
        },
        target: "{settings > gpii.chrome.extensionHolder}.options.listeners"
    }]
});

gpii.chrome.settings.bindChromeEvents = function (that) {
    chrome.runtime.onInstalled.addListener(function (object) {
        if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
            that.events.onInstalled.fire();
        }
        if (object.reason === chrome.runtime.OnInstalledReason.UPDATE) {
            that.events.onUpdated.fire();
        }
    });

    chrome.runtime.onStartup.addListener(function () {
        that.events.onStartup.fire();
    });
};

gpii.chrome.settings.updateSettings = function (that, settings) {
    that.applier.change("settings", settings || that.options.defaultSettings);
};

gpii.chrome.settings.handleExtensionMissing = function (that, extension) {
    if (that.model.promptInstall || extension.model.extensionEnabled) {
        var options = {
            type: "basic",
            title: "GPII notifications",
            message: "To use " + extension.options.settingName + ", please install " + extension.options.name + ".",
            iconUrl: chrome.extension.getURL("./") + "images/gpii.png",
            requireInteraction: true,
            buttons: [{
                title: "Install from Chrome Web Store"
            }]
        };

        that.notifications.create(options, function (id) {
            var cb = function (notificationId) {
                if (notificationId === id) {
                    window.open(extension.options.installationUrl);
                    that.notifications.events.onButtonClicked.removeListener(cb);
                    that.notifications.clear(notificationId, function (wasCleared) {
                        fluid.log("Clearing notification:", notificationId, wasCleared);
                    });
                }
            };
            that.notifications.events.onButtonClicked.addListener(cb);
        });
    }
};

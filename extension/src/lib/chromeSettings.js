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
/* global fluid, gpii */

"use strict";

fluid.defaults("gpii.chrome.settings", {
    gradeNames: ["fluid.modelComponent", "gpii.chrome.eventedComponent"],
    events: {
        onInstalled: "preventable",
        onStartup: null,
        onLoadExtensionHolders: null,
        onNotifyOfMissingExtension: null
    },
    eventRelayMap: {
        "chrome.runtime.onInstalled": "onInstalled",
        "chrome.runtime.onStartup": "onStartup"
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
        }
    },
    dynamicComponents: {
        notification: {
            type: "gpii.chrome.notification",
            createOnEvent: "onNotifyOfMissingExtension",
            options: {
                members: {
                    messageData: "{that}.options.managedExtension.options"
                },
                managedExtension: "{arguments}.0",
                strings: {
                    title: "GPII notifications",
                    message: "To use %settingName, please install %name.",
                    install: "Install from Chrome Web Store"
                },
                model: {
                    type: "basic",
                    iconUrl: "images/gpii.png",
                    requireInteraction: true,
                    buttons: [{
                        title: "{that}.options.strings.install"
                    }]
                },
                listeners: {
                    "onButtonClicked": {
                        "this": "window",
                        method: "open",
                        args: ["{that}.options.managedExtension.options.installationUrl"]
                    }
                }
            }
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
        "onStartup.updateModel": {
            changePath: "promptInstall",
            value: false
        },
        "onInstalled.loadExtensionHolders": "{that}.events.onLoadExtensionHolders",
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

gpii.chrome.settings.updateSettings = function (that, settings) {
    that.applier.change("settings", settings || that.options.defaultSettings);
};

gpii.chrome.settings.handleExtensionMissing = function (that, extension) {
    if (that.model.promptInstall || extension.model.extensionEnabled) {
        that.events.onNotifyOfMissingExtension.fire(extension);
    }
};

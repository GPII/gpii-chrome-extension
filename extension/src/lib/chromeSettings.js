/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
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
    defaultSettings: {
        screenReaderTTSEnabled: false,
        onScreenKeyboardEnabled: undefined,
        highContrastEnabled: false,
        highContrastTheme: "black-white",
        invertColors: undefined,
        greyscale: undefined,
        magnifierEnabled: false,
        magnification: 1
    },
    components: {
        chromeVox: {
            type: "gpii.chrome.extensionHolder",
            options: {
                extensionId: "kgejglhpjiefppelpmljglcjbhoiplfn",
                name: "ChromeVox",
                installationUrl: "https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn",
                model: {
                    extensionEnabled: "{settings}.model.screenReaderTTSEnabled"
                }
            }
        },
        domSettingsApplier: {
            type: "gpii.chrome.domSettingsApplier",
            options: {
                model: {
                    highContrastEnabled: "{settings}.model.highContrastEnabled",
                    highContrastTheme: "{settings}.model.highContrastTheme"
                }
            }
        },
        // highContrast: {
        //     type: "gpii.chrome.highContrast",
        //     options: {
        //         model: {
        //             highContrastEnabled: "{settings}.model.highContrastEnabled"
        //         },
        //         modelRelay: {
        //             highContrastTheme: {
        //                 source: "{settings}.model.highContrastTheme",
        //                 target: "highContrastTheme",
        //                 singleTransform: {
        //                     type: "fluid.transforms.valueMapper",
        //                     defaultInputValue: "black-white",
        //                     options: {
        //                         "black-white": {
        //                             outputValue: "bw"
        //                         },
        //                         "white-black": {
        //                             outputValue: "wb"
        //                         },
        //                         "black-yellow": {
        //                             outputValue: "by"
        //                         },
        //                         "yellow-black": {
        //                             outputValue: "yb"
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // },
        zoom: {
            type: "gpii.chrome.zoom",
            options: {
                model: {
                    magnifierEnabled: "{settings}.model.magnifierEnabled",
                    magnification: "{settings}.model.magnification"
                }
            }
        },
        wsConnector: {
            type: "gpii.wsConnector",
            options: {
                solutionId: "net.gpii.chromeExtension",
                flowManager: "ws://localhost:8081/browserChannel",
                retryTime: 10
            }
        },
        notifications: {
            type: "gpii.chrome.notifications"
        }
    },
    model: "{settings}.options.defaultSettings",  // Defaults
    invokers: {
        updateSettings: {
            funcName: "gpii.chrome.settings.updateSettings",
            args: ["{that}",  "{arguments}.0"]
        }
    },
    listeners: {
        "{wsConnector}.events.onSettingsChange": "{settings}.updateSettings",
        "{chromeVox}.events.onError": {
            funcName: "gpii.chrome.settings.handleExtensionHolderError",
            args: ["{that}", "{chromeVox}", "{arguments}.0"]
        }
    }
});

gpii.chrome.settings.updateSettings = function (that, settings) {
    that.applier.change("", settings || that.options.defaultSettings);
};

gpii.chrome.settings.handleExtensionHolderError = function (that, extension, error) {
    if (error.message === "Failed to find extension with id " + extension.options.extensionId + ".") {
        var options = {
            type: "basic",
            title: "GPII notifications",
            message: extension.options.name + " couldn't be found. Do you want to add it from the chrome store?",
            iconUrl: chrome.extension.getURL("./") + "images/gpii.png",
            buttons: [{
                title: "Yes, please"
            }, {
                title: "No, thanks"
            }]
        };

        that.notifications.create(options, function (id) {
            var cb = function (notificationId, buttonId) {
                if (notificationId === id) {
                    if (buttonId === 0) {
                        window.open(extension.options.installationUrl);
                    }
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

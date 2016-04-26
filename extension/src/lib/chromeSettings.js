/*globals fluid, gpii */

"use strict";

fluid.defaults("gpii.chrome.settings", {
    gradeNames: "fluid.modelComponent",
    components: {
        chromeVox: {
            type: "gpii.chrome.extensionHolder",
            options: {
                extensionId: "kgejglhpjiefppelpmljglcjbhoiplfn",
                model: {
                    extensionEnabled: "{settings}.model.currentSettings.screenReaderTTSEnabled"
                }
            }
        },
        // virtualKeyboard: {
        //     type: "gpii.chrome.extensionHolder",
        //     options: {
        //         extensionId: "lfaiipcbbikbnfcgcmaldlacamgekmnb",
        //         model: {
        //             extensionEnabled: "{gpii.chrome.settings}.model.onScreenKeyboardEnabled"
        //         }
        //     }
        // },
        highContrast: {
            type: "gpii.chrome.highContrast",
            options: {
                model: {
                    highContrastEnabled: "{settings}.model.currentSettings.highContrastEnabled",
                    highContrastTheme: "{settings}.model.currentSettings.highContrastTheme"
                }
            }
        //},
        //zoom: {
        //    type: "gpii.chrome.zoom",
        //    options: {
        //        model: {
        //            magnifierEnabled: "{settings}.model.magnifierEnabled",
        //            magnification: "{settings}.model.magnification"
        //       }
        //    }
        },
        wsConnector: {
            type: "gpii.wsConnector"
        }
    },
    model: {
        currentSettings: {
            screenReaderTTSEnabled: undefined,
            onScreenKeyboardEnabled: undefined,
            highContrastEnabled: false,
            highContrastTheme: "",
            invertColors: undefined,
            greyscale: undefined,
            magnifierEnabled: undefined,
            magnification: undefined
        },
        oldSettings: null
    },
    invokers: {
        onSettingsChange: {
            funcName: "gpii.chrome.settings.onSettingsChange",
            args: ["{that}",  "{arguments}.0"]
        }
    },
    listeners: {
        "{wsConnector}.events.onSettingsChange": "{settings}.onSettingsChange"
    }
});

gpii.chrome.settings.onSettingsChange = function (that, settings) {
    if (settings === undefined) {
        that.applier.change("currentSettings", that.model.oldSettings);
        that.applier.change("oldSettings", null);
    } else {
        if (that.model.oldSettings === null) {
            that.applier.change("oldSettings", that.model.currentSettings);
        }
        fluid.each(settings, function (value, key) {
            that.applier.change(["currentSettings", key], value);
        });
    }
};

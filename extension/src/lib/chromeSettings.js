/* eslint-env node */
/* global fluid, gpii */

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
                model: {
                    extensionEnabled: "{settings}.model.screenReaderTTSEnabled"
                }
            }
        },
        highContrast: {
            type: "gpii.chrome.highContrast",
            options: {
                model: {
                    highContrastEnabled: "{settings}.model.highContrastEnabled"
                },
                modelRelay: {
                    highContrastTheme: {
                        source: "{settings}.model.highContrastTheme",
                        target: "highContrastTheme",
                        singleTransform: {
                            type: "fluid.transforms.valueMapper",
                            defaultInputValue: "black-white",
                            options: {
                                "black-white": {
                                    outputValue: "bw"
                                },
                                "white-black": {
                                    outputValue: "wb"
                                },
                                "black-yellow": {
                                    outputValue: "by"
                                },
                                "yellow-black": {
                                    outputValue: "yb"
                                }
                            }
                        }
                    }
                }
            }
        },
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
                solutionId: "com.ilunion.cloud4chrome",  // This will change in the near future
                flowManager: "ws://localhost:8081/browserChannel",
                retryTime: 10
            }
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
        "{wsConnector}.events.onSettingsChange": "{settings}.updateSettings"
    }
});

gpii.chrome.settings.updateSettings = function (that, settings) {
    that.applier.change("", settings || that.options.defaultSettings);
};

fluid.defaults("gpii.chrome.settings", {
    gradeNames: "fluid.modelComponent",
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
        virtualKeyboard: {
            type: "gpii.chrome.extensionHolder",
            options: {
                extensionId: "lfaiipcbbikbnfcgcmaldlacamgekmnb",
                model: {
                    extensionEnabled: "{gpii.chrome.settings}.model.onScreenKeyboardEnabled"
                }
            }
        },
        highContrast: {
            type: "gpii.chrome.highContrast",
            options: {
               model: {
                   highContrastEnabled: "{settings}.model.highContrastEnabled",
                   highContrastTheme: "{settings}.model.highContrastTheme"
               }
           }
        }
    },
    model: {
        screenReaderTTSEnabled: undefined,
        onScreenKeyboardEnabled: undefined,
        highContrastEnabled: false,
        highContrastTheme: "",
        invertColors: undefined,
        magnifierEnabled: undefined,
        magnification: undefined
    }
});

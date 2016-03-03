// This component makes use of css/highContrast.css to perform the adaptations
// of the web content, and this is done through chrome.tabs.executeScript.
//
fluid.defaults("gpii.chrome.highContrast", {
    gradeNames: ["fluid.modelComponent"],
    "black-white":  "bw",
    "white-black":  "wb",
    "black-yellow": "by",
    "yellow-black": "yb",
    model: {
        highContrastEnabled: undefined,
        highContrastTheme: undefined
    },
    modelListeners: {
        "*": {
            funcName: "gpii.chrome.highContrast.modelChanged",
            args: ["{that}"],
            excludeSource: "init"
        }
    }
});

gpii.chrome.highContrast.modelChanged = function (that) {
    if (that.model.highContrastEnabled) {
        // Fix this crap. Better use a transformation to get the right value.
        //
        var theme = that.options[fluid.get(that.model, "highContrastTheme")];
        var scriptTemplate = "document.documentElement.setAttribute('hc','__THEME__');\
                             [].forEach.call(document.querySelectorAll('body *'), function(node) {\
                                 node.setAttribute('hc', '__THEME__');\
                             });\
                             document.documentElement.setAttribute('hc', '__THEME__');"
        var script = scriptTemplate.replace(/__THEME__/g, theme);

        chrome.tabs.query({}, function (tabs) {
            fluid.each(tabs, function (tab) {
                chrome.tabs.executeScript(tab.id, {code: script}, function() {
                    if (chrome.runtime.lastError) {
                        console.log("Could not apply highContrast in tab '"
                        + tab.url + "', error was: "
                        + chrome.runtime.lastError.message);
                    }
                });
            });
        });
    } else {
        var script = "document.documentElement.removeAttribute('hc');\
                     [].forEach.call(document.querySelectorAll('body *'), function(node) {\
                          node.removeAttribute('hc');\
                      });"
        chrome.tabs.query({}, function (tabs) {
            fluid.each(tabs, function (tab) {
                chrome.tabs.executeScript(tab.id, {code: script}, function() {
                    if (chrome.runtime.lastError) {
                        console.log("Could not remove highContrast from tab '"
                        + tab.url + "', error was: "
                        + chrome.runtime.lastError.message);
                    }
                });
            });
        });
    }
};

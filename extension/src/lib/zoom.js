/*globals fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.zoom", {
    gradeNames: "fluid.modelComponent",
    model: {
        magnifierEnabled: null,
        magnification: null
    },
    modelListeners: {
        "*": {
            funcName: "gpii.chrome.zoom.modelChanged",
            args: "{that}",
            excludeSource: "init"
        }
    }
});

gpii.chrome.zoom.modelChanged = function (that) {
    if(that.model.magnifierEnabled) {
        // Iterate over all tabs and set the zoom factor
        chrome.tabs.query({}, function (tabs) {
            fluid.each(tabs, function (tab) {
                chrome.tabs.setZoom(tab.id, that.model.magnification, function () {
                    if (chrome.runtime.lastError) {
                        console.log("Could not apply zoom in tab '" +
                        tab.url + "', error was: " +
                        chrome.runtime.lastError.message);
                    }
                });
            });
        });
    } else { // set back to default zoom value
      chrome.tabs.query({}, function (tabs) {
          fluid.each(tabs, function (tab) {
              chrome.tabs.setZoom(tab.id, 1, function () {
                  if (chrome.runtime.lastError) {
                      console.log("Could not apply zoom in tab '" +
                      tab.url + "', error was: " +
                      chrome.runtime.lastError.message);
                  }
              });
          });
      });
    }
};

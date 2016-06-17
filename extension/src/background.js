/* global fluid */

fluid.setLogging(true);
var gpii = fluid.registerNamespace("gpii");
var chromeSettings = gpii.chrome.settings();

fluid.log("Instantiated chromeSettings:", chromeSettings);

# GPII extension for Google Chrome

The GPII for Google Chrome is an extension that allows Google Chrome to be configured by the GPII and improve the accessibility of the browser in different ways.

Although the extension is on development right now, it includes support for:
* High Contrast themes
* Enable/Disable TTS output - you need to install *ChromeVox* on your browser

## Building the extension

Install *grunt-cli* globally:

    npm install -g grunt-cli

Install required dependencies:

    npm install

Perform a build so you can run an unpacked version of the extension on your browser.

    grunt build

Follow these steps if you want to use the unpacked version of the extension:

1. Visit *chrome://extensions* in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  The menu's icon is three horizontal bars. and select *Extensions* under the *Tools* menu to get to the same place).

2. Ensure that the *Developer mode* checkbox in the top right-hand corner is checked.

3. Click *Load unpacked extension* to pop up a file-selection dialog.

4. Navigate to the directory in which your local copy of the extension lives, and select the *build* folder.


If you want to create a *crx* package to be distributed, run:

    grunt buildPkg

**Note that you need to use a .pem file to sign the crx package with. This file needs to be called *key.pem* and needs to be placed into the top level folder of this repository.**

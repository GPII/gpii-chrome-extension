# GPII extension for Google Chrome

The GPII for Google Chrome is an extension that allows Google Chrome to be configured by the GPII and improve the accessibility of the browser in different ways.

Although the extension is in development right now, it includes support for:
* High Contrast themes
* Enable/Disable TTS output - you need to install *ChromeVox* on your browser
* Zoom

## Building the extension

Install *grunt-cli* globally:

    npm install -g grunt-cli

Install required dependencies:

    npm install

Perform a build so you can run an unpacked version of the extension on your browser.

    grunt build


If you want to create a [crx](https://developer.chrome.com/extensions/crx) package to be distributed, run:

    grunt buildPkg

**Note that you need to use a [PEM](http://how2ssl.com/articles/working_with_pem_files/) file to sign the crx package with. This file needs to be called *key.pem* and needs to be placed into the top level folder of this repository.**

## Testing

Run the node tests:

    node tests/node-tests.js

You can also run the browser tests. Inside chrome, browse to chrome://extensions, look for _GPII chrome extension_ and copy the _ID_ of the extension. Then browse to:

    chrome-extension://<paste-the-ID-here>/tests/highContrastTests.html

More tests are coming soon. :)

## Trying out the extension

Requirements:
* Google Chrome browser. You can download it [here](https://www.google.com/chrome/browser/desktop/).
* The GPII running locally on your system. More information about how to install and run the GPII on your machine can be found [here](https://github.com/GPII/universal#installation).

Follow these steps if you want to use the unpacked version of the extension:

1. Visit *chrome://extensions* in your browser. Alternatively, open the Chrome menu by clicking the icon to the far right of the Omnibox; The menu's icon is three horizontal bars. Select *Extensions* under the *Tools* menu to open Chrome's extension settings.

2. Ensure that the *Developer mode* checkbox in the top right-hand corner is checked.

3. Click *Load unpacked extension* to pop up a file-selection dialog.

4. Navigate to the directory in which your local copy of the extension lives, and select the *build* folder.

Alternatively, you can install the *crx* package that you created yourself by opening it from Google Chrome. Soon, you will be able to install the extension just by clicking on a link, but this won't happen until we release the first time.

### Testing the auto-personalization

We have included two users in the GPII in order to demonstrate this extension:
* *gpiiChrome1*: Enables chromeVox
* *gpiiChrome2*: Applies a white-on-black high contrast theme and turns magnification on

Key-in as any of these users to see the extension in action.

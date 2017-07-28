# GPII extension for Google Chrome

The GPII for Google Chrome is an extension that allows Google Chrome to be configured by the GPII and improve the accessibility of the browser in different ways.

Although the extension is in development right now, it includes support for:
* font size
* line space
* dictionary (requires the *Google Dictionary* extension)
* selection highlight
* text-to-speech (requires the *click2speech* extension)
* contrast
* simplify
* enhance inputs
* table of contents

## Building the extension

Install *grunt-cli* globally:

    npm install -g grunt-cli

Install required dependencies:

    npm install

Perform a build so you can run an unpacked version of the extension on your browser.

    grunt build

You can also create a development build which creates an unpacked version that includes source maps.

    grunt buildDev


If you want to create a [crx](https://developer.chrome.com/extensions/crx) package to be distributed, run:

    grunt buildPkg

**Note that you need to use a [PEM](http://how2ssl.com/articles/working_with_pem_files/) file to sign the crx package with. This file needs to be called *key.pem* and needs to be placed into the top level folder of this repository.**

## Testing

Run the node based tests:

    node tests/node/all-tests.js

Run the browser based tests:

    http://localhost/tests/browser/all-tests.html



_**NOTE:** Browser tests should be served through a web server. The exact URL may vary._

## Trying out the extension

Requirements:
* Google Chrome browser. You can download it [here](https://www.google.com/chrome/browser/desktop/).

Follow these steps if you want to use the unpacked version of the extension:

1. Visit *chrome://extensions* in your browser. Alternatively, open the Chrome menu by clicking the icon to the far right of the Omnibox; The menu's icon is three horizontal bars. Select *Extensions* under the *Tools* menu to open Chrome's extension settings.

2. Ensure that the *Developer mode* checkbox in the top right-hand corner is checked.

3. Click *Load unpacked extension* to pop up a file-selection dialog.

4. Navigate to the directory in which your local copy of the extension lives, and select the *build* folder.

Alternatively, you can install the *crx* package that you created yourself by opening it from Google Chrome. Soon, you will be able to install the extension just by clicking on a link, but this won't happen until we release the first time.

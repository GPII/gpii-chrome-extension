# UI Options Plus (UIO+)

User Interface Options Plus (UIO+) allows you to customize websites to match your own personal needs and preferences.
Settings for the adaptations can be set via the UIO+ adjuster panel or, if on a GPII (Global Public Inclusive
Infrastructure) enable machine, from a keyed in preference set.

The following adaptations are supported:

* Captions (embedded YouTube videos)
* Character Space
* Contrast
* Enhance Inputs
* Line Space
* Reading Mode
* Right-Click to Select
* Selection Highlight
* Syllables
* Table of Contents
* Text-to-Speech (only for selected text)
* Word Space
* Zoom

_**Note**: The ability to apply an adaptation will vary from page to page_

UI Options Plus is the result of a joint effort of the Inclusive Design Research Centre at OCAD University and the Trace
R&D Center at University of Maryland under funding for the FLOE Project from the William and Flora Hewlett Foundation
and the National Institute on Disability, Independent Living, and Rehabilitation Research (NIDILRR), Administration for
Community Living under grant #90RE5027.

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

**Note that you need to use a [PEM](http://how2ssl.com/articles/working_with_pem_files/) file to sign the crx package
with. This file needs to be called *key.pem* and needs to be placed into the top level folder of this repository.**

## Testing

Run the node based tests:

    node tests/node/all-tests.js

Run the browser based tests:

    http://localhost/tests/browser/all-tests.html

_**NOTE:** Browser tests should be served through a web server. The exact URL may vary._

## Trying out the extension

Requirements:

* [Google Chrome browser](https://www.google.com/chrome/browser/desktop/)

Follow these steps if you want to use the unpacked version of the extension:

1. Visit *chrome://extensions* in your browser. Alternatively, open the Chrome menu by clicking the icon to the far
   right of the Omnibox; the menu's icon is three horizontal bars. Select *Extensions* under the *Tools* menu to open
   Chrome's extension settings.
2. Ensure that the *Developer mode* checkbox in the top right-hand corner is checked.
3. Click *Load unpacked extension* to pop up a file-selection dialog.
4. Navigate to the directory in which your local copy of the extension lives, and select the *build* folder.

Published versions can be installed from the Chrome Web Store.

## 3rd Party Software

### BSD (3-Clause)

* [Infusion v3.0.0-dev](https://fluidproject.org/infusion.html)

### MIT License

* [Font-Awesome-SVG-PNG v1.1.5](https://github.com/encharm/Font-Awesome-SVG-PNG)

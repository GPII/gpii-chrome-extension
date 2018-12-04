# UI Options Plus (UIO+)

User Interface Options Plus (UIO+) allows you to customize websites to match your own personal needs andpreferences.
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

### Dependencies

Install *grunt-cli* globally:

```bash
npm install -g grunt-cli
```

Install required dependencies:

```bash
npm install
```

### Build

This is the primary build type and used when creating a published version. However, the build can also be run as an an unpacked extension. The generated build is output to the "build" directory at the root of the project.

```bash
grunt build
```

### Development Build

Development build's create a version that can be run as an unpacked extension and includes source maps for debugging purposes. Due to the extra resources for debugging, this build type should not be used for publishing. The generated build is output to the "build" directory at the root of the project.

```bash
grunt buildDev
```

### CRX Build

[CRX](https://developer.chrome.com/extensions/crx) builds, allow for packaging the extension into a format that can be more easily shared and distributed for testing. However, this type of package cannot be uploaded to the Chrome Web Store. The generated build is output to the "build" directory at the root of the project.

```bash
grunt buildPkg
```

_**NOTE:** You need to use a [PEM](http://how2ssl.com/articles/working_with_pem_files/) file to sign the crx package
with. This file needs to be called "key.pem" and must be placed in the top level folder of this repository._

## Testing

### Node

Run the node based tests:

```bash
node tests/node/all-tests.js
```

### Browser

Run the browser based tests:

[http://localhost/tests/browser/all-tests.html](http://localhost/tests/browser/all-tests.html)

_**NOTE:** Browser tests should be served through a web server. The exact URL may vary._

### All tests with reports

Run all the tests and generate reports which can be viewed in the browser from the "reports" directory:

```bash
# run on the host machine
npm test

# run in a vagrant vm
npm run test:vagrant
```

## Trying out the extension

Requirements:

* [Google Chrome browser](https://www.google.com/chrome/browser/desktop/)

Follow these steps if you want to use the unpacked version of the extension:

1. Visit [chrome://extensions](chrome://extension) in your Chrome browser. Alternatively, open Chrome's menu by
   clicking the icon to the far right of the Omnibox; the menu's icon is three horizontal bars. Select *Extensions*
   under the *Tools* menu to open Chrome's extension settings.
2. Ensure that the *Developer mode* checkbox in the top right-hand corner is checked.
3. Click *Load unpacked extension* to open a file-selection dialog.
4. Navigate to the directory in which your local copy of the extension lives, and select the *build* folder.

_**NOTE:** Published versions can be installed from the [Chrome Web Store](https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek)._

## 3rd Party Software

### BSD (3-Clause)

* [Infusion v3.0.0-dev](https://fluidproject.org/infusion.html)

### MIT License

* [Font-Awesome-SVG-PNG v1.1.5](https://github.com/encharm/Font-Awesome-SVG-PNG)

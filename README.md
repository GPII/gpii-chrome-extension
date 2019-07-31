# UI Options Plus (UIO+)

User Interface Options Plus (UIO+) allows you to customize websites to match your own personal needs and preferences.
Settings for the adaptations can be set via the UIO+ adjuster panel or, if on a [Morphic](https://morphic.world) enabled
machine, from a keyed in preference set.

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

This is the primary build type and used when creating a published version. However, the build can also be run as an an
unpacked extension. The generated build is output to the "build" directory at the root of the project.

```bash
grunt build
```

### Development Build

Development build's create a version that can be run as an unpacked extension and includes source maps for debugging
purposes. Due to the extra resources for debugging, this build type should not be used for publishing. The generated
build is output to the "build" directory at the root of the project.

```bash
grunt buildDev
```

### CRX Build

[CRX](https://developer.chrome.com/extensions/crx) builds, allow for packaging the extension into a format that can be
more easily shared and distributed for testing. However, this type of package cannot be uploaded to the Chrome Web
Store. The generated build is output to the "build" directory at the root of the project.

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

_**NOTE:** Published versions can be installed from the [Chrome Web Store](
    https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek)._

## 3rd Party Software

### BSD (3-Clause)

* [Infusion v3.0.0-dev](https://fluidproject.org/infusion.html)

### MIT License

* [Font-Awesome-SVG-PNG v1.1.5](https://github.com/encharm/Font-Awesome-SVG-PNG)

## Publishing to the Chrome Web Store

1. Prepare Code
   1. Ensure that all of the code, that should be published, has been merged into the master branch.
   2. Ensure that the code in master is working as expected
      1. Run tests: `npm test`
      2. Lint: `grunt lint`
      3. Manual test build
         1. Create a developer build: "grunt buildDev"
         2. Load unpacked extension into Chrome
            1. In Chrome go to [chrome://extensions](chrome://extensions)
            2. Ensure that "Developer mode" is enabled
            3. Click "Load unpacked"
            4. From the File Dialog, navigate to the "gpii-chrome-extension" repo and select the "build" directory.
         3. Test all of the preferences and ensure that they apply to web page content correctly.
            1. Refresh any Browser Tabs/Windows that were open prior to installing the extension.
            2. The preferences should be tested individually and in combinations to ensure that interactions between the
               preferences are working properly. For example (Text-to-Speech and Syllabification, Text-to-Speech with
               Reading Mode).
            3. Multiple web pages should be tested. However, not all preferences will work with all sites. For example,
               YouTube captions will only work with YouTube videos embedded using the iframe API and providing captions
               (not autogenerated captions).
               1. This [example](http://jsfiddle.net/xpvt214o/628070/show) provides a YouTube video that can be used to
                  test Captions.
         4. Load Morphic and ensure that logging in users (e.g. [uioPlusCommon](
            https://github.com/GPII/universal/blob/master/testData/preferences/uioPlusCommon.json5)) applies the
            preferences to UIO+.
   3. Increase the "version" number in the [manifest](
      https://github.com/GPII/gpii-chrome-extension/blob/master/extension/manifest.json#L5) file, and push changes to
      master.
2. Create the release package
   1. Create a release build: `grunt build`
      1. If making a beta, open the manifest file, located in the newly created build directory, and add a
      [version name](https://developer.chrome.com/apps/manifest/version#version_name) with the beta release number (e.g.
      “version_name”:  “0.1.0 beta 10” ). The version name will be displayed instead of the version number in the Chrome
      Web Store.
   2. Create a zip archive of the build directory
3. Publish to the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions)
   1. Go to the [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard/g02818309428530539805) on
      the Chrome Web Store and login using the fluid team account
   2. On the Developer Dashboard, click “Edit”; located on the right hand side of the UI Options Plus (UIO+) listing
   3. On the UI Options Plus (UIO+) edit page, click “upload updated package” and upload the zip created in step 2.2
      above.
   4. Update the “Detailed description” field as necessary. Similar information is contained in this README.
   5. Update the screenshots if necessary. They will need to be the exact size requested.
   6. Until a full release is published we will want to ensure that the “Visibility Options” are set to “Unlisted”. This
      means that UIO+ will be available for install from the Chrome Web Store, but won't be searchable. It will only be
      accessible by direct link: [UIO+](
      https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek).
   7. Click "Preview Changes"
      1. Verify that everything appears correct. Pay particular attention to anything that was changed, e.g. version
         number/name, descriptions, screenshots and etc.
   8. When everything appears correct, publish the changes.
      1. The actual publishing to the Chrome Web Store will take about an hour.
   9. Tag the master branch with the release (e.g. v0.1.0-beta.10)
   10. Create a GitHub release for the tag
       1. Go to the [gpii-chrome-extension](
          https://github.com/GPII/gpii-chrome-extension) GitHub page.
       2. Click on "releases"
       3. Click "Draft a new release"
       4. For "Tag Version" and "Release Title", enter the tag name created in step 3.9 (e.g. v0.1.0-beta.10).
       5. For the description, add a summary of changes and any other important information. View prior releases for
          examples.
       6. Attach the build zip file created in step 2.2. Before uploading make sure the file is named "build_{tag}.zip"
          (e.g. build_v0.1.0-beta.10.zip)
       7. If this is a beta release, check "This is a pre-release".
       8. After all the information has been entered correctly, click "Publish release".
4. Verify Published UIO+
   1. Ensure that the contents of the [UIO+](
      https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek) page on the
      Chrome Web Store appear correct. Double check things like version number/name, descriptions, screenshots and etc.
   2. Install the version from the Chrome Web Store, and run through the manual testing again. (See: step 1.2.3 above)
   3. If everything is working, announce release where required (e.g. fluid-work list, GPII list, project teams etc.).
      If there are any issues, fix them and repeat the process.

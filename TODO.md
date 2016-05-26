# TODO list

* Improve the high contrast css "hack"
* Since we depend on third party extensions (such as Chrome Vox), check whether they're installed or not. If an extension can't be found, disable the components that make use of this extension, alternatively ask the user for confirmation to install it and perform the installation (if possible).
* Testing
 * Add unit tests for the wsConnector component
 * Add unit/integration tests for the chromeSettings component
 * Right now, the tests only run in node.js, make them run in the browser too
* Add support for web simplification
* Identify and evaluate the security risks and improve the implementation according to these
* More personalization features
 * Simplification of content
 * Add support for CSS filtering - http://www.w3schools.com/cssref/css3_pr_filter.asp
* Implement support for GPII compatible web pages

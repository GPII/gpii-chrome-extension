/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2018 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid, gpii, jqUnit, sinon */
"use strict";

(function ($) {

    $(document).ready(function () {

        /**************************************************************************************************************
         * Mock for the YT.Player
         **************************************************************************************************************/

        fluid.registerNamespace("gpii.tests.mock.YT");

        // Thisist object to be created with the new constructor to match YT.Player api
        gpii.tests.mock.YT.player = function (id, options) {
            this.id = id;
            this.options = options;
            this.loadModule = sinon.stub();
            this.unloadModule = sinon.stub();
            this.setOption = sinon.stub();
            this.getOption = sinon.stub();
        };

        gpii.tests.mock.YT.createGlobal = function () {
            window.YT = {
                Player: gpii.tests.mock.YT.player
            };
        };

        gpii.tests.mock.YT.removeGlobal = function () {
            delete window.YT;
        };

        /**************************************************************************************************************
         * gpii.uioPlus.allocateSimpleId tests
         **************************************************************************************************************/

        gpii.tests.allocateSimpleIdTests = [{
            name: "No ID",
            selector: ".no-id",
            expected: "gpii-uioPlus-id-" + gpii.uioPlus.gpii_prefix + "-0"
        }, {
            name: "Second without ID",
            selector: ".no-id-2",
            expected: "gpii-uioPlus-id-" + gpii.uioPlus.gpii_prefix + "-1"
        }, {
            name: "Existing ID",
            selector: ".existing-id",
            expected:"existing-id"
        }];

        jqUnit.test("Test gpii.uioPlus.allocateSimpleId", function () {
            // setup
            var originalGUID = gpii.uioPlus.guid;
            gpii.uioPlus.guid = 0;

            // test
            fluid.each(gpii.tests.allocateSimpleIdTests, function (testCase) {
                var elm = $(testCase.selector);
                var returnedID = gpii.uioPlus.allocateSimpleId(elm[0]);
                jqUnit.assertEquals(testCase.name + ": the id should be returned", testCase.expected, returnedID);
                jqUnit.assertEquals(testCase.name + ": the id should be added", testCase.expected, elm.attr("id"));
            });

            // cleanup
            gpii.uioPlus.guid = originalGUID;
        });

        /**************************************************************************************************************
         * gpii.uioPlus.player.enableJSAPI tests
         **************************************************************************************************************/

        fluid.registerNamespace("gpii.tests.player");

        gpii.tests.player.enableJSAPITestCases = [{
            name: "no query parameters",
            src: "https://localhost:8888/embed/SjnXy0Iplvs"
        }, {
            name: "jsapi disabled",
            src: "https://localhost:8888/embed/SjnXy0Iplvs/?enablejsapi=0"
        }, {
            name: "jsapi invalid",
            src: "https://localhost:8888/embed/SjnXy0Iplvs/?enablejsapi=false"
        }, {
            name: "jsapi enabled",
            src: "https://localhost:8888/embed/SjnXy0Iplvs/?enablejsapi=1"
        }, {
            name: "other params",
            src: "https://localhost:8888/embed/SjnXy0Iplvs/?controls=0&loop=1"
        }];

        jqUnit.test("Test gpii.uioPlus.player.enableJSAPI", function () {
            var expected = "1";
            fluid.each(gpii.tests.player.enableJSAPITestCases, function (testCase) {
                var elm = $("<iframe src =\"" + testCase.src + "\">");
                gpii.uioPlus.player.enableJSAPI(elm[0]);
                var params = new URL(elm.attr("src")).searchParams;
                jqUnit.assertEquals(testCase.name + " - The enablejsapi query parameter should have been set correctly", expected, params.get("enablejsapi"));
            });
        });

        /**************************************************************************************************************
         * gpii.uioPlus.player.createYTPlayer tests
         **************************************************************************************************************/

        jqUnit.test("Test gpii.uioPlus.player.createYTPlayer", function () {
            // setup
            var originalGUID = gpii.uioPlus.guid;
            gpii.uioPlus.guid = 0;
            gpii.tests.mock.YT.createGlobal();

            // test
            var videoElm = $("<iframe src =\"https://localhost:8888/embed/SjnXy0Iplvs\">");
            var options = {events: {onApiChange: "test"}};
            var player = gpii.uioPlus.player.createYTPlayer(videoElm[0], options);
            var params = new URL(videoElm.attr("src")).searchParams;
            var expectedID = "gpii-uioPlus-id-" + gpii.uioPlus.gpii_prefix + "-0";
            jqUnit.assertEquals("The enablejsapi query parameter should have been set correctly", "1", params.get("enablejsapi"));
            jqUnit.assertEquals("The ID should have been set", expectedID, videoElm.attr("id"));
            jqUnit.assertEquals("The player is created with the correct video ID", expectedID, player.id);
            jqUnit.assertDeepEq("The player is created with the correct options", options, player.options);

            // cleanup
            gpii.uioPlus.guid = originalGUID;
            gpii.tests.mock.YT.removeGlobal();
        });

        /**************************************************************************************************************
         * gpii.uioPlus.player tests
         **************************************************************************************************************/

        jqUnit.test("Test gpii.uioPlus.player", function () {
            // setup
            var originalGUID = gpii.uioPlus.guid;
            gpii.uioPlus.guid = 0;
            gpii.tests.mock.YT.createGlobal();

            // test
            var videoElm = $("<iframe src =\"https://localhost:8888/embed/SjnXy0Iplvs\">");
            var expectedID = "gpii-uioPlus-id-" + gpii.uioPlus.gpii_prefix + "-0";
            var player = gpii.uioPlus.player(videoElm[0]);

            var params = new URL(videoElm.attr("src")).searchParams;
            jqUnit.assertEquals("The enablejsapi query parameter should have been set correctly", "1", params.get("enablejsapi"));
            jqUnit.assertEquals("The ID should have been set", expectedID, videoElm.attr("id"));
            jqUnit.assertEquals("The player is created with the correct video ID", expectedID, player.player.id);
            jqUnit.assertValue("The player is created the onApiChange event listener bound", player.player.options.events.onApiChange);
            jqUnit.assertFalse("The initial captionsEnabled model should be false", player.model.captionsEnabled);
            sinon.reset();

            player.updateModel(false);
            jqUnit.assertFalse("Set model to same value: the captionsEnabled value should still be false", player.model.captionsEnabled);
            jqUnit.assertTrue("Set model to same value: the YT Player's loadModule method should not have been called", player.player.loadModule.notCalled);
            jqUnit.assertTrue("Set model to same value: the YT Player's getOption method should not have been called", player.player.getOption.notCalled);
            jqUnit.assertTrue("Set model to same value: the YT Player's setOption method should not have been called", player.player.setOption.notCalled);
            sinon.reset();

            var track = {languageCode: "en"};
            player.player.getOption.returns([track]);
            player.updateModel(true);
            jqUnit.assertTrue("Enable Captions: the captionsEnabled value should be true", player.model.captionsEnabled);
            jqUnit.assertTrue("Enable Captions: the YT Player's loadModule method should have been called", player.player.loadModule.calledWith("captions"));
            jqUnit.assertTrue("Enable Captions: the YT Player's getOption method should have been called", player.player.getOption.calledWith("captions", "tracklist"));
            jqUnit.assertTrue("Enable Captions: the YT Player's setOption method should have been called", player.player.setOption.calledWith("captions", "track", track));
            sinon.reset();

            player.player.getOption.returns([]);
            player.setCaptions();
            jqUnit.assertTrue("Set captions with an empty tracklist: the captionsEnabled value should be true", player.model.captionsEnabled);
            jqUnit.assertTrue("Set captions with an empty tracklist: the YT Player's loadModule method should have been called", player.player.loadModule.calledWith("captions"));
            jqUnit.assertTrue("Set captions with an empty tracklist: the YT Player's getOption method should have been called", player.player.getOption.calledWith("captions", "tracklist"));
            jqUnit.assertTrue("Set captions with an empty tracklist: the YT Player's setOption method should have been called", player.player.setOption.calledWith("captions", "track", {}));
            sinon.reset();

            player.updateModel(false);
            jqUnit.assertFalse("Disable Captions: the captionsEnabled value should be false", player.model.captionsEnabled);
            jqUnit.assertTrue("Disable Captions: the YT Player's loadModule method should not have been called", player.player.loadModule.notCalled);
            jqUnit.assertTrue("Disable Captions: the YT Player's getOption method should not have been called", player.player.getOption.notCalled);
            jqUnit.assertTrue("Disable Captions: the YT Player's setOption method should have been called", player.player.setOption.calledWith("captions", "track", {}));
            sinon.reset();

            var player2 = gpii.uioPlus.player(videoElm[0], true);
            jqUnit.assertTrue("The player is created with the captions enabled", player2.model.captionsEnabled);

            player2.player.loadModule = undefined;
            player.updateModel(false);
            jqUnit.assertFalse("LoadModule function not available: the captionsEnabled value should be false", player.model.captionsEnabled);
            jqUnit.assertTrue("LoadModule function not available: the YT Player's loadModule method should not have been called", player.player.loadModule.notCalled);
            jqUnit.assertTrue("LoadModule function not available: the YT Player's getOption method should not have been called", player.player.getOption.notCalled);
            jqUnit.assertTrue("LoadModule function not available: the YT Player's setOption method should not have been called", player.player.setOption.notCalled);
            sinon.reset();

            // cleanup
            gpii.uioPlus.guid = originalGUID;
            gpii.tests.mock.YT.removeGlobal();
        });

        /**************************************************************************************************************
         * gpii.uioPlus.captions.createPlayers tests
         **************************************************************************************************************/

        jqUnit.asyncTest("Test gpii.uioPlus.captions.createPlayers", function () {
            // setup
            var playerStub = sinon.stub(gpii.uioPlus, "player");
            var expected = ["player1", "player2"];
            var injected = expected.concat(["player3"]);
            playerStub.onCall(0).returns(expected[0]);
            playerStub.onCall(1).returns(expected[1]);
            playerStub.onCall(2).returns(injected[2]);

            // test existing
            var model = {captionsEnabled: true};
            var createdPlayers = gpii.uioPlus.captions.createPlayers(model);
            jqUnit.assertTrue("The gpii.uioPlus.player should have been called for each video found", playerStub.calledTwice);
            jqUnit.assertDeepEq("Players for each video should have been created", expected, createdPlayers.players);

            // test injected
            var container = $(".injection");
            var video = $("<iframe width=\"560\" height=\"315\""
                + "src=\"https://www.youtube.com/embed/SjnXy0Iplvs\""
                + "frameborder=\"0\" style=\"border: solid 4px #37474F\""
                + "allow=\"autoplay; encrypted-media\" allowfullscreen> </iframe>");

            video.ready(function () {
                jqUnit.assertTrue("The gpii.uioPlus.player should have been called for the injected videos", playerStub.calledThrice);
                jqUnit.assertDeepEq("The injected player should be added to the set of players.", injected, createdPlayers.players);

                // cleanup
                container.html("");
                playerStub.restore();
                createdPlayers.observer.disconnect();

                jqUnit.start();
            });
            container.append(video);
        });

        jqUnit.asyncTest("Test gpii.uioPlus.captions.createPlayers - removal", function () {
            // setup
            var container = $(".removal");
            var video = $("<iframe id=\"toRemove\" width=\"560\" height=\"315\""
                + "src=\"https://www.youtube.com/embed/SjnXy0Iplvs\""
                + "frameborder=\"0\" style=\"border: solid 4px #37474F\""
                + "allow=\"autoplay; encrypted-media\" allowfullscreen> </iframe>");
            container.append(video);
            var videos = $("iframe");

            var playerStub = sinon.stub(gpii.uioPlus, "player");
            var expected = [];

            videos.each(function (idx, elm) {
                var mock = {videoElm: elm};
                expected.push(mock);
                playerStub.onCall(idx).returns(mock);
            });

            // test existing
            var model = {captionsEnabled: true};
            var createdPlayers = gpii.uioPlus.captions.createPlayers(model);
            jqUnit.assertTrue("The gpii.uioPlus.player should have been called for each video found", playerStub.calledThrice);
            jqUnit.assertDeepEq("Players for each video should have been created", expected, createdPlayers.players);

            // test removal
            var postRemovalExpected = expected.slice(0, 2);
            var observer = new MutationObserver(function (mutationRecords) {
                mutationRecords.forEach(function (mutationRecord) {
                    if (mutationRecord.removedNodes.length) {
                        jqUnit.assertDeepEq("Players should have updated to omit the removed video", postRemovalExpected, createdPlayers.players);

                        // cleanup
                        container.html("");
                        playerStub.restore();
                        createdPlayers.observer.disconnect();

                        jqUnit.start();
                    }
                });
            });

            observer.observe(container[0], {childList: true, subtree: true });
            $("#toRemove").remove();
        });

        /**************************************************************************************************************
         * gpii.uioPlus.captions.updateFromMessage tests
         **************************************************************************************************************/

        fluid.registerNamespace("gpii.tests.captions");

        gpii.tests.captions.updateFromMessageTestCases = [{
            name: "Source not window",
            model: {captionsEnabled: true},
            event: {
                data: {
                    type: "gpii.chrome.domEnactor",
                    payload: {captionsEnabled: false}
                }
            },
            expectedModelValue: true
        }, {
            name: "No type",
            model: {captionsEnabled: true},
            event: {
                source: window,
                data: {
                    payload: {captionsEnabled: false}
                }
            },
            expectedModelValue: true
        }, {
            name: "Type not gpii.chrome.domEnactor",
            model: {captionsEnabled: true},
            event: {
                source: window,
                data: {
                    type: "otherType",
                    payload: {captionsEnabled: false}
                }
            },
            expectedModelValue: true
        }, {
            name: "Setting is the same as the model value",
            model: {captionsEnabled: true},
            event: {
                source: window,
                data: {
                    type: "gpii.chrome.domEnactor",
                    payload: {captionsEnabled: true}
                }
            },
            expectedModelValue: true
        }, {
            name: "Update setting to false",
            model: {captionsEnabled: true},
            event: {
                source: window,
                data: {
                    type: "gpii.chrome.domEnactor",
                    payload: {captionsEnabled: false}
                }
            },
            expectedCallbackValue: false,
            expectedModelValue: false
        }, {
            name: "Update setting to true",
            model: {captionsEnabled: false},
            event: {
                source: window,
                data: {
                    type: "gpii.chrome.domEnactor",
                    payload: {captionsEnabled: true}
                }
            },
            expectedCallbackValue: true,
            expectedModelValue: true
        }, {
            name: "Update setting with falsy value",
            model: {captionsEnabled: true},
            event: {
                source: window,
                data: {
                    type: "gpii.chrome.domEnactor",
                    payload: {}
                }
            },
            expectedCallbackValue: false,
            expectedModelValue: false
        }, {
            name: "Update setting with truthy value",
            model: {captionsEnabled: false},
            event: {
                source: window,
                data: {
                    type: "gpii.chrome.domEnactor",
                    payload: {captionsEnabled: "true"}
                }
            },
            expectedCallbackValue: true,
            expectedModelValue: true
        }];

        jqUnit.test("Test gpii.uioPlus.captions.updateFromMessage", function () {
            fluid.each(gpii.tests.captions.updateFromMessageTestCases, function (testCase) {
                var callbackValue;
                var callback = function (value) {
                    callbackValue = value;
                };

                gpii.uioPlus.captions.updateFromMessage(testCase.model, testCase.event, callback);
                jqUnit.assertEquals(testCase.name + ": the model value should be - " + testCase.expectedModelValue, testCase.expectedModelValue, testCase.model.captionsEnabled);

                var expectedCallback = testCase.expectedCallbackValue;
                if (expectedCallback === undefined) {
                    jqUnit.assertUndefined(testCase.name + ": the callback shouldn't have fired", callbackValue);
                } else {
                    jqUnit.assertEquals(testCase.name + ": the callback should be fired with the update model value", expectedCallback, callbackValue);
                }
            });
        });

        /**************************************************************************************************************
         * gpii.uioPlus.captions.updatePlayers tests
         **************************************************************************************************************/

        jqUnit.test("Test gpii.uioPlus.captions.updatePlayers", function () {
            jqUnit.expect(2);
            var mockThat = {
                model: {
                    captionsEnabled: true
                },
                players: [{
                    updateModel: sinon.stub()
                }, {
                    updateModel: sinon.stub()
                }]
            };

            gpii.uioPlus.captions.updatePlayers(mockThat);

            fluid.each(mockThat.players, function (player, index) {
                jqUnit.assertTrue("Player at index " + index + " was called with value: " + mockThat.model.captionsEnabled, player.updateModel.calledWith(mockThat.model.captionsEnabled));
            });

            // cleanup
            sinon.reset();
        });

        /**************************************************************************************************************
         * gpii.uioPlus.captions tests
         **************************************************************************************************************/

        jqUnit.asyncTest("Test gpii.uioPlus.captions", function () {
            // setup
            gpii.tests.mock.YT.createGlobal();
            var createPlayers = sinon.stub(gpii.uioPlus.captions, "createPlayers");
            var players = ["player1", "player2"];
            createPlayers.returns({players: players, observer: "observer"});
            var updatePlayers = sinon.stub(gpii.uioPlus.captions, "updatePlayers");

            var that = gpii.uioPlus.captions();
            jqUnit.assertTrue("The createPlayers function was called", createPlayers.calledWith(that.model));
            jqUnit.assertDeepEq("The players member was set", players, that.players);

            window.postMessage({
                type: "gpii.chrome.domEnactor",
                payload: {captionsEnabled: true}
            }, "*");

            window.addEventListener("message", function (event) {
                if (event.data.type === "gpii.chrome.domEnactor") {
                    jqUnit.assertTrue("The model was updated", that.model.captionsEnabled);
                    jqUnit.assertTrue("The updatePlayers function was called", updatePlayers.called);

                    // cleanup
                    gpii.tests.mock.YT.removeGlobal();
                    createPlayers.restore();
                    updatePlayers.restore();
                    jqUnit.start();
                }
            });
        });

        jqUnit.test("Test gpii.uioPlus.captions - wait for YT object", function () {
            // setup
            var createPlayers = sinon.stub(gpii.uioPlus.captions, "createPlayers");
            createPlayers.returns({players: ["player1", "player2"], observer: "observer"});

            var that = gpii.uioPlus.captions();
            window.onYouTubeIframeAPIReady();
            jqUnit.assertTrue("The createPlayers function was called once", createPlayers.calledOnce);
            jqUnit.assertTrue("The createPlayers function was called", createPlayers.calledWith(that.model));

            // cleanup
            createPlayers.restore();
        });

        jqUnit.test("Test gpii.uioPlus.captions - wait for YT.Player object", function () {
            // setup
            window.YT = {};
            var createPlayers = sinon.stub(gpii.uioPlus.captions, "createPlayers");
            createPlayers.returns({players: ["player1", "player2"], observer: "observer"});

            var that = gpii.uioPlus.captions();
            window.onYouTubeIframeAPIReady();
            jqUnit.assertTrue("The createPlayers function was called once", createPlayers.calledOnce);
            jqUnit.assertTrue("The createPlayers function was called", createPlayers.calledWith(that.model));

            // cleanup
            gpii.tests.mock.YT.removeGlobal();
            createPlayers.restore();
        });
    });
})(jQuery);

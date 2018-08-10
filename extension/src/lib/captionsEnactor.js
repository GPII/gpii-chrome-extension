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

"use strict";

// The contents of this file are written in plain JavaScript to avoid conflicts of duplicate dependencies (e.g.
// Fluid Infusion, jQuery, and etc.) when injected into arbitrary web pages.

var gpii = gpii || {};

(function (gpii) {

    gpii.uioPlus = {
        guid: 0
    };

    gpii.uioPlus.allocateSimpleId = function (element) {
        if (!element.id) {
            var simpleId = "gpii-uioPlus-id-" + Date.now() + "-" + gpii.uioPlus.guid++;
            element.id = simpleId;
        }
        return element.id;
    };

    /**********************************************************************************************
     * Player component
     **********************************************************************************************/

    gpii.uioPlus.player = function (videoElm, captionsEnabled) {

        var that = {};

        that.model = {
            captionsEnabled: captionsEnabled || false
        };

        that.setCaptions = function () {
            if (that.player.loadModule) {
                if (that.model.captionsEnabled) {
                    that.player.loadModule("captions");
                    var tracklist = that.player.getOption("captions", "tracklist");
                    that.player.setOption("captions", "track", tracklist[0] || {});
                } else {
                    that.player.unloadModule("captions");
                }
            }
        };

        that.updateModel = function (captionsEnabled) {
            if (that.model.captionsEnabled !== captionsEnabled) {
                that.model.captionsEnabled = captionsEnabled;
                that.setCaptions();
            }
        };

        that.player = gpii.uioPlus.player.createYTPlayer(videoElm, {
            events: {
                onApiChange: that.setCaptions
            }
        });

        return that;
    };

    /**
     * Adds the "enablejsapi=1" query parameter to the query string at the end of the src attribute.
     * If "enablejsapi" already exists it will modify its value to 1. This is required for API access
     * to the embedded YouTube video.
     *
     * @param {jQuery|Element} videoElm - a reference to the existing embedded YouTube video.
     */
    gpii.uioPlus.player.enableJSAPI = function (videoElm) {
        var url = new URL(videoElm.getAttribute("src"));

        url.searchParams.set("enablejsapi", 1);
        videoElm.setAttribute("src", url.toString());
    };

    gpii.uioPlus.player.createYTPlayer = function (videoElm, options) {
        var id = gpii.uioPlus.allocateSimpleId(videoElm);
        gpii.uioPlus.player.enableJSAPI(videoElm);
        return new window.YT.Player(id, options);
    };

    /**********************************************************************************************
     * Captions component
     **********************************************************************************************/

    gpii.uioPlus.captions = function () {
        var that = {};

        that.players = [];
        that.model = {
            captionsEnabled: false
        };

        // bind a window event to update the model and players
        window.addEventListener("message", function (event) {
            gpii.uioPlus.captions.updateFromMessage(that.model, event, function () {
                gpii.uioPlus.captions.updatePlayers(that);
            });
        });

        // wait for the YouTube iframe API and create players
        if (window.YT && window.YT.Player) {
            that.players = gpii.uioPlus.captions.createPlayers(that.model.captionsEnabled);
        } else {
            // the YouTube iframe api will call onYouTubeIframeAPIReady after the api has loaded
            window.onYouTubeIframeAPIReady = function () {
                that.players = gpii.uioPlus.captions.createPlayers(that.model.captionsEnabled);
            };
        }

        return that;
    };

    gpii.uioPlus.captions.createPlayers = function (captionsEnabled) {
        var players = [];
        var videos = document.querySelectorAll("iframe[src^=\"https://www.youtube.com/embed/\"]");

        videos.forEach(function (video) {
            players.push(gpii.uioPlus.player(video, captionsEnabled));
        });

        return players;
    };

    gpii.uioPlus.captions.updateFromMessage = function (model, event, callback) {
        var settings = event.data["UIO+_Settings"];
        if (event.source === window && settings && model.captionsEnabled !== settings.captionsEnabled) {
            model.captionsEnabled = !!settings.captionsEnabled;
            callback(model.captionsEnabled);
        }
    };

    gpii.uioPlus.captions.updatePlayers = function (that) {
        that.players.forEach(function (player) {
            player.updateModel(that.model.captionsEnabled);
        });
    };


    /**********************************************************************************************
     * Instantiate Captions component
     **********************************************************************************************/

    gpii.uioPlus.captions();

})(gpii);



































// var fluid_3_0_0 = fluid_3_0_0 || {};
//
// (function ($, fluid) {
//
//     fluid.registerNamespace("gpii.chrome.enactor");
//
//     /*********************************************************************************************
//      * gpii.chrome.enactor.wndw is a singleton component to be used for registering event     *
//      * bindings to events fired by the window object                                             *
//      *********************************************************************************************/
//
//     fluid.defaults("gpii.chrome.enactor.wndw", {
//         gradeNames: ["fluid.component", "fluid.resolveRootSingle"],
//         singleRootType: "gpii.chrome.enactor.wndw",
//         members: {
//             wndw: window
//         },
//         listeners: {
//             "onCreate.bindEvents": {
//                 funcName: "gpii.chrome.enactor.wndw.bindEvents",
//                 args: ["{that}"]
//             }
//         }
//     });
//
//     /**
//     * Adds a listener to a window event for each event defined on the component.
//     * The name must match a valid window event.
//     *
//     * @param {Component} that - the component itself
//     */
//     gpii.chrome.enactor.wndw.bindEvents = function (that) {
//         fluid.each(that.options.events, function (type, eventName) {
//             that.wndw.addEventListener(eventName, that.events[eventName].fire);
//         });
//     };
//
//     /*********************************************************************************************
//      * gpii.chrome.enactor.captions is a type of captions enactor that has its model updated  *
//      * through messages sent to the window.                                                      *
//      *********************************************************************************************/
//
//     fluid.defaults("gpii.chrome.enactor.captions", {
//         gradeNames: ["fluid.prefs.enactor.captions"],
//         components: {
//             wndw: {
//                 type: "gpii.chrome.enactor.wndw",
//                 options: {
//                     events: {
//                         "message": null
//                     },
//                     listeners: {
//                         "message.updateModel": "{captions}.updateModelFromMessage"
//                     }
//                 }
//             }
//         },
//         invokers: {
//             updateModelFromMessage: {
//                 funcName: "fluid.prefs.enactor.captions.updateModelFromMessage",
//                 args: ["{that}", "{arguments}.0"]
//             }
//         }
//     });
//
//     /**
//     * Updates the model based on a message. The message must have come from the window and must contain
//     * `UIO+_Settings` as part of the data.
//     *
//     * @param {Component} that - the component itself
//     * @param {Event} event - a message event object
//     */
//     fluid.prefs.enactor.captions.updateModelFromMessage = function (that, event) {
//         if (event.source === window && fluid.get(event, ["data", "UIO+_Settings"])) {
//             that.applier.change("enabled", fluid.get(event, ["data", "UIO+_Settings", "captionsEnabled"]));
//         }
//     };
//
//     // instantiating
//     $(document).ready(function () {
//         gpii.chrome.enactor.captions("body");
//     });
//
// })(jQuery, fluid_3_0_0);


//
// /*
// Copyright 2018 OCAD University
//
// Licensed under the Educational Community License (ECL), Version 2.0 or the New
// BSD license. You may not use this file except in compliance with one these
// Licenses.
//
// You may obtain a copy of the ECL 2.0 License and BSD License at
// https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
// */
//
// /* global YT */
//
// var fluid_3_0_0 = fluid_3_0_0 || {};
//
// (function ($, fluid) {
//     "use strict";
//
//     /*******************************************************************************
//      * captions
//      *
//      * An enactor that is capable enabling captions on embedded YouTube videos
//      *******************************************************************************/
//
//     fluid.defaults("fluid.prefs.enactor.captions", {
//         gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
//         preferenceMap: {
//             "fluid.prefs.captions": {
//                 "model.enabled": "default"
//             }
//         },
//         events: {
//             onVideoElementLocated: null
//         },
//         selectors: {
//             videos: "iframe[src^=\"https://www.youtube.com/embed/\"]"
//         },
//         model: {
//             enabled: false
//         },
//         components: {
//             ytAPI: {
//                 type: "fluid.prefs.enactor.captions.ytAPI"
//             }
//         },
//         dynamicComponents: {
//             player: {
//                 type: "fluid.prefs.enactor.captions.youTubePlayer",
//                 createOnEvent: "onVideoElementLocated",
//                 container: "{arguments}.0",
//                 options: {
//                     model: {
//                         captions: "{captions}.model.enabled"
//                     }
//                 }
//             }
//         },
//         listeners: {
//             "onCreate.initPlayers": "{that}.initPlayers"
//         },
//         invokers: {
//             initPlayers: {
//                 funcName: "fluid.prefs.enactor.captions.initPlayers",
//                 args: ["{that}", "{ytAPI}.notifyWhenLoaded", "{that}.dom.videos"]
//             }
//         }
//     });
//
//     /**
//      * When the YouTube API is available, the onVideoElementLocated event will fire for each video element located by
//      * the `videos` argument. Each of these event calls will fire with a jQuery object containing a single video
//      * element. This allows for initializing dynamicComponents (fluid.prefs.enactor.captions.youTubePlayer) for each
//      * video element.
//      *
//      * @param {Component} that - the component
//      * @param {Function} getYtApi - a function that returns a promise indicating if the YouTube API is available
//      * @param {jQuery|Element} videos - the videos to fire onVideoElementLocated events with
//      *
//      * @return {Promise} - A promise that follows the promise returned by the getYtApi function
//      */
//     fluid.prefs.enactor.captions.initPlayers = function (that, getYtApi, videos) {
//         var promise = fluid.promise();
//         var ytAPINotice = getYtApi();
//
//         promise.then(function () {
//             $(videos).each(function (index, elm) {
//                 that.events.onVideoElementLocated.fire($(elm));
//             });
//         });
//
//         fluid.promise.follow(ytAPINotice, promise);
//         return promise;
//     };
//
//     /*********************************************************************************************
//      * fluid.prefs.enactor.captions.window is a singleton component to be used for assigning     *
//      * values onto the window object.                                                            *
//      *********************************************************************************************/
//
//     fluid.defaults("fluid.prefs.enactor.captions.ytAPI", {
//         gradeNames: ["fluid.component", "fluid.resolveRootSingle"],
//         singleRootType: "fluid.prefs.enactor.captions.window",
//         events: {
//             onYouTubeAPILoaded: null
//         },
//         members: {
//             global: window
//         },
//         invokers: {
//             notifyWhenLoaded: {
//                 funcName: "fluid.prefs.enactor.captions.ytAPI.notifyWhenLoaded",
//                 args: ["{that}"]
//             }
//         }
//     });
//
//     /**
//      * Used to determine when the YouTube API is available for use. It will test if the API is already available, and if
//      * not, will bind to the onYouTubeIframeAPIReady method that is called when the YouTube API finishes loading.
//      * When the YouTube API is ready, the promise will resolve an the onYouTubeAPILoaded event will fire.
//      *
//      * NOTE: After FLUID-6148 (https://issues.fluidproject.org/browse/FLUID-6148) is complete, it should be possible for
//      *       the framework to handle this asynchrony directly in an expander for the player member in
//      *       fluid.prefs.enactor.captions.youTubePlayer.
//      *
//      * @param {Component} that - the component itself
//      *
//      * @return {Promise} - a promise resolved after the YouTube API has loaded.
//      */
//     fluid.prefs.enactor.captions.ytAPI.notifyWhenLoaded = function (that) {
//         var promise = fluid.promise();
//         promise.then(function () {
//             that.events.onYouTubeAPILoaded.fire();
//         }, function (error) {
//             fluid.log(fluid.logLevel.WARN, error);
//         });
//
//         if (fluid.get(window, ["YT", "Player"])) {
//             promise.resolve();
//         } else {
//             // the YouTube iframe api will call onYouTubeIframeAPIReady after the api has loaded
//             fluid.set(that.global, "onYouTubeIframeAPIReady", promise.resolve);
//         }
//
//         return promise;
//     };
//
//     /**
//      * See: https://developers.google.com/youtube/iframe_api_reference#Events for details on the YouTube player
//      * events. This includes when they are fired and what data is passed along.
//      */
//     fluid.defaults("fluid.prefs.enactor.captions.youTubePlayer", {
//         gradeNames: ["fluid.viewComponent"],
//         events: {
//             onReady: null,
//             onStateChange: null,
//             onPlaybackQualityChange: null,
//             onPlaybackRateChange: null,
//             onError: null,
//             onApiChange: null
//         },
//         model: {
//             captions: false,
//             track: {}
//         },
//         members: {
//             player: {
//                 expander: {
//                     funcName: "fluid.prefs.enactor.captions.youTubePlayer.initYTPlayer",
//                     args: ["{that}"]
//                 }
//             },
//             tracklist: []
//         },
//         invokers: {
//             applyCaptions: {
//                 funcName: "fluid.prefs.enactor.captions.youTubePlayer.applyCaptions",
//                 args: ["{that}.player", "{that}.model.track", "{that}.model.captions"]
//             }
//         },
//         modelListeners: {
//             "setCaptions": {
//                 listener: "{that}.applyCaptions",
//                 path: ["captions", "track"],
//                 excludeSource: "init"
//             }
//         },
//         listeners: {
//             "onApiChange.prepTrack": {
//                 listener: "fluid.prefs.enactor.captions.youTubePlayer.prepTrack",
//                 args: ["{that}", "{that}.player"]
//             },
//             "onApiChange.applyCaptions": {
//                 listener: "{that}.applyCaptions",
//                 priority: "after:prepTrack"
//             }
//         }
//     });
//
//     /**
//      * Adds the "enablejsapi=1" query parameter to the query string at the end of the src attribute.
//      * If "enablejsapi" already exists it will modify its value to 1. This is required for API access
//      * to the embedded YouTube video.
//      *
//      * @param {jQuery|Element} videoElm - a reference to the existing embedded YouTube video.
//      */
//     fluid.prefs.enactor.captions.youTubePlayer.enableJSAPI = function (videoElm) {
//         videoElm = $(videoElm);
//         var url = new URL(videoElm.attr("src"));
//
//         url.searchParams.set("enablejsapi", 1);
//         videoElm.attr("src", url.toString());
//     };
//
//     /**
//      * An instance of a YouTube player from the YouTube iframe API
//      *
//      * @typedef {Object} YTPlayer
//      */
//
//     /**
//      * Initializes the YT.Player using the existing embedded video (component's container). An ID will be added to the
//      * video element if one does not already exist.
//      *
//      * @param {Component} that - the component
//
//      * @return {YTPlayer} - an instance of a YouTube player controlling the embedded video
//      */
//     fluid.prefs.enactor.captions.youTubePlayer.initYTPlayer = function (that) {
//         var id = fluid.allocateSimpleId(that.container);
//         fluid.prefs.enactor.captions.youTubePlayer.enableJSAPI(that.container);
//         return new YT.Player(id, {
//             events: {
//                 onReady: that.events.onReady.fire,
//                 onStateChange: that.events.onStateChange.fire,
//                 onPlaybackQualityChange: that.events.onPlaybackQualityChange.fire,
//                 onPlaybackRateChange: that.events.onPlaybackRateChange.fire,
//                 onError: that.events.onError.fire,
//                 onApiChange: that.events.onApiChange.fire
//             }
//         });
//     };
//
//     /**
//      * Enables/disables the captions on an embedded YouTube video. Requires that the player be initiallized and the API
//      * ready for use.
//      *
//      * @param {YTPlayer} player - an instance of a YouTube player
//      * @param {Object} track - a track object for the {YTPlayer}
//      * @param {Boolean} state - true - captions enabled; false - captions disabled.
//      */
//     fluid.prefs.enactor.captions.youTubePlayer.applyCaptions = function (player, track, state) {
//         // The loadModule method from the player must be ready first. This is made available after
//         // the onApiChange event has fired.
//         if (player.loadModule) {
//             if (state) {
//                 player.loadModule("captions");
//                 player.setOption("captions", "track", track);
//             } else {
//                 player.unloadModule("captions");
//             }
//         }
//     };
//
//     /**
//      * Prepares the track to be used when captions are enabled. It will use the first track in the tracklist, and update
//      * the "track" model path with it.
//      *
//      * @param {Component} that - the component
//      * @param {YTPlayer} player - an instance of a YouTube player
//      */
//     fluid.prefs.enactor.captions.youTubePlayer.prepTrack = function (that, player) {
//         player.loadModule("captions");
//         var tracklist = player.getOption("captions", "tracklist");
//
//         if (tracklist.length && !that.tracklist.length) {
//             // set the tracklist and use first track for the captions
//             that.tracklist = tracklist;
//             that.applier.change("track", tracklist[0], "ADD", "prepTrack");
//         }
//     };


// })(jQuery, fluid_3_0_0);

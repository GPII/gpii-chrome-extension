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
        guid: 0,
        // generate a unique instance identifier to allow for unique IDs across iframes.
        gpii_prefix: Math.random().toString().replace( /\D/g, "")
    };

    gpii.uioPlus.allocateSimpleId = function (element) {
        if (!element.id) {
            var simpleId = "gpii-uioPlus-id-" + gpii.uioPlus.gpii_prefix + "-" + gpii.uioPlus.guid++;
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
                    that.player.setOption("captions", "track", {});
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
        var settings = event.data.payload;
        if (event.source === window && event.data.type === "gpii.chrome.domEnactor" && settings && model.captionsEnabled !== settings.captionsEnabled) {
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

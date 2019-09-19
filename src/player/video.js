const video = {
        player: null,
        markers: [],
        isPlaying: false,
        isPaused: false,
        isSeeking: false,
        time: null,

        aListener: function (val) {
        },

        set isStarted(val) {
            video.aListener(val);
        },

        onFirstPlay: function (listener) {
            video.aListener = listener;
        },

        load: (container, url, poster = null) => {

            /// destroy old video
            if (video.player !== null) {
                video.player.destroy();
                logger.log("new video is requested to load");
            }

            video.player = new Clappr.Player({
                source: url,
                plugins: {container: [Video360],},
                width: "100%",
                height: "100%",
                parentId: container,
                poster: poster,
            });

            /// disable click to pause for 360 video
            video.player.getPlugin('click_to_pause').disable();

            /// Events
            video.player.listenTo(video.player, Clappr.Events.PLAYER_PLAY, video.onPlay);
            video.player.listenTo(video.player, Clappr.Events.PLAYER_PAUSE, video.onPause);
            video.player.listenTo(video.player, Clappr.Events.PLAYER_SEEK, video.onSeek);
            // video.player.listenTo(video.player, Clappr.Events.PLAYER_SEEK, resetCounter);
            video.player.listenTo(video.player, Clappr.Events.PLAYER_ENDED, function () {
                logger.log("Video ended");
                viewer.camera.flyToBoundingSphere(main.boundingSphere);
            });


        },

        onPlay: () => {
            video.isStarted = true;

            /// if we where seeking wait a bit before to set
            /// playerPlaying = true, because it does not get immediately
            /// the time of the video
            if (video.isSeeking) {
                video.isSeeking = false;
                setTimeout(function () {
                    video.isPlaying = true;
                    logger.log("video is playing again from seek");
                }, 500);
            } else {
                if (video.isPaused) {
                    video.isPaused = false;
                    video.isPlaying = true;
                    logger.log("video is playing again from pause");
                } else {
                    video.isPlaying = true;
                    logger.log("video started");

                    /// HERE WE HAVE TO CALL A FUNCTION FOR THE START OF THE VIDEO!
                    ///
                    ///

                    /// get playing time
                    setInterval(function () {
                        if (video.isPlaying && video.player !== null) {
                            video.time = video.player.getCurrentTime();
                            console.log(video.time);
                        }
                    }, 200);


                    let id = document.getElementById("playerPoster");
                    id.style.opacity = 0;
                    id.style.transition = "opacity " + 1 + "s";
                    id.style.WebkitTransition = "opacity " + 1 + "s";
                }
            }
        },

        onPause:
            () => {
                video.isPlaying = false;
                video.isPaused = true;
                logger.log("video is paused");
            },

        onSeek:
            () => {
                video.isSeeking = true;
                video.isPlaying = false;
                logger.log("video is seeking");


                video.dispatchEvent(event);
            },

    }
;


video.load("#player", "video/Lido%20-%20Pellestrina_026.mp4", "data/Venezia_LidoPellestrina/poster.jpg");


/////////////////////////////

video.onFirstPlay(function (val) {
    alert("Someone changed the value of x.a to " + val);
});



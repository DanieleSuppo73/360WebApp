const videoPlayer = {
        player: null,
        markers: [],
        isPlaying: false,
        time: null,

        /// STARTED
        _isStarted: false,
        set isStarted(val) {
            if (!videoPlayer._isStarted) {
                videoPlayer._isStarted = val;
                videoPlayer.firstPlayListener(val);
            }
        },
        get isStarted() {
            return videoPlayer._isStarted;
        },

        /// PAUSED
        _isPaused: false,
        set isPaused(val) {
            videoPlayer._isPaused = val;
            if (val){
                videoPlayer.pauseListener(val);
            }
        },
        get isPaused() {
            return videoPlayer._isPaused;
        },

        /// FINISHED
        set isFinished(val) {
            videoPlayer.endListener(val);
        },


        isSeeking: false,


        /// listeners
        onFirstPlay: function (listener) {
            videoPlayer.firstPlayListener = listener;
        },
        onPause: function (listener) {
            videoPlayer.pauseListener = listener;
        },
        onSeek: function (listener) {
            videoPlayer.seekListener = listener;
        },
        onEnd: function (listener) {
            videoPlayer.endListener = listener;
        },


        firstPlayListener: function (val) {
        },
        pauseListener: function (va) {
        },
        seekListener: function (va) {
        },
        endListener: function (va) {
        },


        /// load
        load: (container, url, poster = null) => {

            videoPlayer.isStarted = false;

            /// destroy old video
            if (videoPlayer.player !== null) {
                videoPlayer.player.destroy();
                logger.log("new video is requested to load");
            }

            videoPlayer.player = new Clappr.Player({
                source: url,
                plugins: {container: [Video360],},
                width: "100%",
                height: "100%",
                parentId: container,
                poster: poster,
            });

            /// disable click to pause for 360 video
            videoPlayer.player.getPlugin('click_to_pause').disable();


            videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_PLAY, () => {

                videoPlayer.isStarted = true;

                /// if we where seeking wait a bit before to set
                /// playerPlaying = true, because it does not get immediately
                /// the time of the video
                if (videoPlayer.isSeeking) {
                    videoPlayer.isSeeking = false;
                    setTimeout(function () {
                        videoPlayer.isPlaying = true;
                        logger.log("video is playing again from seek");
                    }, 500);
                } else {
                    if (videoPlayer.isPaused) {
                        videoPlayer.isPaused = false;
                        videoPlayer.isPlaying = true;
                        logger.log("video is playing again from pause");
                    } else {
                        videoPlayer.isPlaying = true;
                        logger.log("video started");

                        /// HERE WE HAVE TO CALL A FUNCTION FOR THE START OF THE VIDEO!
                        ///
                        ///

                        /// get playing time
                        setInterval(function () {
                            if (videoPlayer.isPlaying && videoPlayer.player !== null) {
                                videoPlayer.time = videoPlayer.player.getCurrentTime();
                                console.log(videoPlayer.time);
                            }
                        }, 200);


                        let id = document.getElementById("playerPoster");
                        id.style.opacity = 0;
                        id.style.transition = "opacity " + 1 + "s";
                        id.style.WebkitTransition = "opacity " + 1 + "s";
                    }
                }

            });


            videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_PAUSE, () => {
                videoPlayer.isPlaying = false;
                videoPlayer.isPaused = true;
                logger.log("video is paused");
            });


            videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_SEEK, () => {
                videoPlayer.isSeeking = true;
                videoPlayer.isPlaying = false;
                logger.log("video is seeking");
            });


            videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_ENDED, () => {
                videoPlayer.isSeeking = false;
                videoPlayer.isPlaying = false;
                videoPlayer.isFinished = true;
                logger.log("Video ended");
            });
        },
    }
;


/////////////////////////////
/////////////////////////////




videoPlayer.load("#player", "video/Lido%20-%20Pellestrina_026.mp4", "data/Venezia_LidoPellestrina/poster.jpg");


videoPlayer.onFirstPlay(function (val) {
    logger.log("video listener - onFirstPlay");
});

videoPlayer.onPause(function (val) {
    logger.log("video listener - onPause");
});

videoPlayer.onSeek(function (val) {
    logger.log("video listener - onSeek");
});

videoPlayer.onEnd(function (val) {
    logger.log("video listener - onEnd");
});




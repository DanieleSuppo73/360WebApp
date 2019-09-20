const videoPlayer = {
        player: null,
        isPlaying: false,
        get time (){
            if (videoPlayer.player != null){
                return videoPlayer.player.getCurrentTime();
            }
            else{
                console.log("Error - try to get time from player not defined")
            }
        },

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

                if (videoPlayer.isSeeking) {
                    videoPlayer.isSeeking = false;
                    videoPlayer.isPlaying = true;
                    logger.log("video is playing again from seek");

                } else {
                    if (videoPlayer.isPaused) {
                        videoPlayer.isPaused = false;
                        videoPlayer.isPlaying = true;
                        logger.log("video is playing again from pause");
                    } else {
                        videoPlayer.isPlaying = true;
                        logger.log("video started");
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




// videoPlayer.load("#player", "video/Lido%20-%20Pellestrina_026.mp4", "data/Venezia_LidoPellestrina/poster.jpg");
//
//
// videoPlayer.onFirstPlay(function (val) {
//     logger.log("video listener - onFirstPlay");
// });
//
// videoPlayer.onPause(function (val) {
//     logger.log("video listener - onPause");
// });
//
// videoPlayer.onSeek(function (val) {
//     logger.log("video listener - onSeek");
// });
//
// videoPlayer.onEnd(function (val) {
//     logger.log("video listener - onEnd");
// });
//
// setInterval(function () {
//     if (videoPlayer.isPlaying) {
//         console.log(videoPlayer.time);
//     }
// }, 200);




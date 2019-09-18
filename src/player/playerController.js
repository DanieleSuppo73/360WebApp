var playerPlaying = false;
var playerTime;
var Player = null;

function loadPlayer(videoUrl, posterImg) {

  /// if is the 1st time we load the player
  if (Player == null) {
    Player = new Clappr.Player({
      source: videoUrl,
      plugins: {
        container: [Video360],

      },
      width: "100%",
      height: "100%",
      parentId: '#player',
      poster: posterImg,
    });

    /// disable click to pause for 360 video
    Player.getPlugin('click_to_pause').disable();

    /// get playing time
    setInterval(GetPlayerTime, 200);

    /// Events
    Player.listenTo(Player, Clappr.Events.PLAYER_PLAY, OnPlayerStarted);
    Player.listenTo(Player, Clappr.Events.PLAYER_PAUSE, OnPlayerPaused);
    Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, OnPlayerSeek);
    Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, resetCounter);

    Player.listenTo(Player, Clappr.Events.PLAYER_ENDED, function () {
      logger.log("Video ended");
      viewer.camera.flyToBoundingSphere(main.boundingSphere);
    });
  }

  /// else, if we are loading a new video
  else {
    Player.source = videoUrl;
    Player.poster = posterImg;
  }
}


function GetPlayerTime() {
  if (playerPlaying) {
    playerTime = Player.getCurrentTime();
  }
}



function OnPlayerStarted() {
  /// if we where seeking wait a bit before to set
  /// playerPlaying = true, because it does not get immediately
  /// the time of the video
  if (isSeeking) {
    isSeeking = false;
    setTimeout(function () {
      console.log("playing!");
      playerPlaying = true;
    }, 500);
  } else {
    console.log("playing!");
    playerPlaying = true;
    var id = document.getElementById("playerPoster");
    id.style.opacity = 0;
    id.style.transition = "opacity " + 1 + "s";
    id.style.WebkitTransition = "opacity " + 1 + "s";
  }
}

function OnPlayerPaused() {
  playerPlaying = false;
  console.log("paused");
}

var isSeeking = false;

function OnPlayerSeek() {
  isSeeking = true;
  playerPlaying = false;
  console.log("seek");
}
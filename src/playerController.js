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

  }

  /// else, if we are loading a new video
  else {
    Player.source = videoUrl;
    Player.poster = posterImg;
  }
}



// /// Player
// var Player = new Clappr.Player({
//   //source: 'https://player.vimeo.com/external/356158599.hd.mp4?s=a65bd6b347c2304168f064aa36ff6b72bbe68d49&profile_id=175',
//   source: 'video/Lido%20-%20Pellestrina_026.mp4',
//   plugins: {
//     container: [Video360],

//   },
//   width: "100%",
//   height: "100%",
//   parentId: '#player',
//   //poster: 'Lido_Pellestrina_poster_blank.jpg',
// });

// Player.getPlugin('click_to_pause').disable();


// // /// set the title on the poster
// // function playerSetTitle(title, subtitle) {
// //   document.getElementById("title").innerHTML = title;
// //   document.getElementById("subtitle").innerHTML = subtitle;


// //   Player.poster = (posterUrl);
// // }


// /// get playing time
// setInterval(GetPlayerTime, 200);

function GetPlayerTime() {
  if (playerPlaying) {
    playerTime = Player.getCurrentTime();
  }
}


// /// Events
// Player.listenTo(Player, Clappr.Events.PLAYER_PLAY, OnPlayerStarted);
// Player.listenTo(Player, Clappr.Events.PLAYER_PAUSE, OnPlayerPaused);
// Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, OnPlayerSeek);


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
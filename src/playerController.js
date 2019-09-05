
var playerPlaying = false;
var playerTime;

/// Player
var Player = new Clappr.Player({
    //source: 'https://player.vimeo.com/external/356158599.hd.mp4?s=a65bd6b347c2304168f064aa36ff6b72bbe68d49&profile_id=175',
    source: 'video/Lido%20-%20Pellestrina_026.mp4',
    plugins: {
        container: [Video360],
      
    },
    width: "100%",
    height: "100%",
    parentId: '#player',
    poster: 'Lido_Pellestrina_poster_blank.jpg',
});

Player.getPlugin('click_to_pause').disable();   


/// set the title on the poster
function playerSetTitle(title, subtitle){
  document.getElementById("title").innerHTML = title;
  document.getElementById("subtitle").innerHTML = subtitle;
}


/// get playing time
setInterval(GetPlayerTime, 200);
function GetPlayerTime(){
    if (playerPlaying){
      playerTime = Player.getCurrentTime();
    }
}


/// Events
Player.listenTo(Player, Clappr.Events.PLAYER_PLAY, OnPlayerStarted);
Player.listenTo(Player, Clappr.Events.PLAYER_PAUSE, OnPlayerPaused);
Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, OnPlayerSeek);


function OnPlayerStarted(){
	console.log("playing!");
  playerPlaying = true;
  var id = document.getElementById("playerPoster");
  id.style.opacity = 0;
  id.style.transition = "opacity " + 1 + "s";
  id.style.WebkitTransition = "opacity " + 1 + "s";
}

function OnPlayerPaused(){
  playerPlaying = false;
  console.log("paused");
}

function OnPlayerSeek(){
  playerPlaying = false;
  console.log("seek");
}
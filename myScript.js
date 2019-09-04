

function loadDoc(url, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}



function convertTimeCodeToSeconds(timeString, framerate)
{
  var timeArray = timeString.split(":");
  var hours = parseInt(timeArray[0]) * 60 * 60;
  var minutes = parseInt(timeArray[1]) * 60;
  var seconds = parseInt(timeArray[2]);
  var frames  = parseInt(timeArray[3])*(1/framerate);
  var str = "h:" + hours + "\nm:" + minutes + "\ns:" + seconds + "\nf:" + frames;
  var totalTime = hours + minutes + seconds + frames;
  return totalTime;
}



function fade(element) {
  var op = 1;  // initial opacity
  var timer = setInterval(function () {
      if (op <= 0.1){
          clearInterval(timer);
          element.style.display = 'none';
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op -= op * 0.1;
  }, 50);
}





/// Read markers
var playerMarkers = [];
loadDoc("markers.xml", LoadMarkers);

function LoadMarkers(xml) {
  var i;
  var xmlDoc = xml.responseXML;
  var x = xmlDoc.getElementsByTagName("MARKER");
  for (i = 0; i <x.length; i++) {
    timecode = x[i].getElementsByTagName("TIMECODE")[0].childNodes[0].nodeValue;
    playerMarkers.push({
      time: convertTimeCodeToSeconds(timecode,25),
      title: x[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue,
      longitude: x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue,
      latitude: x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue
    });
  }
  setInterval(chechForMarker, 500);
}


/// check for marker
/// during playback
var playerMarkerIndexStart = 0;

Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, resetCounter);
function resetCounter(){
  playerMarkerIndexStart = 0;
  console.log("RESET");
}

function chechForMarker(){
  if (playerMarkers.length == 1 || !playerPlaying) return;

  for (i = playerMarkerIndexStart; i < playerMarkers.length; i++){

    if (playerTime >= playerMarkers[i].time){
      playerMarkerIndexStart = i+1;

      if ((i<playerMarkers.length - 1 && playerTime <= playerMarkers[i+1].time) 
      || (i==playerMarkers.length - 1)){
        DisplayPlayerMessage("marker:" + i + " - " + playerMarkers[i].title);
        console.log("linkato su marker : " + i + " - " + playerMarkers[i].title);
        onMarkerReached(i);
        break;
      }
    }
  }
}





/// when a marker is detected during playing
/// do this
function onMarkerReached(index){
  flyMapTo(playerMarkers[index].longitude, playerMarkers[index].latitude);

  addMapBillboard(playerMarkers[index].longitude, playerMarkers[index].latitude);
}


function DisplayPlayerMessage(value)
{
  var id = document.getElementById("playerMessage");
  id.style.opacity = 1;
  id.innerHTML = value;

}


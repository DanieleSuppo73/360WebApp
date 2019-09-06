function loadDoc(url, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      callback(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}



function convertTimeCodeToSeconds(timeString, framerate) {
  var timeArray = timeString.split(":");
  var hours = parseInt(timeArray[0]) * 60 * 60;
  var minutes = parseInt(timeArray[1]) * 60;
  var seconds = parseInt(timeArray[2]);
  var frames = parseInt(timeArray[3]) * (1 / framerate);
  var str = "h:" + hours + "\nm:" + minutes + "\ns:" + seconds + "\nf:" + frames;
  var totalTime = hours + minutes + seconds + frames;
  return totalTime;
}






loadMainData();

/// Load main xml data
function loadMainData() {
  loadDoc("data/main.xml", function (xml) {
    var i;
    var xmlDoc = xml.responseXML;
    var title = xmlDoc.getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
    var subtitle = xmlDoc.getElementsByTagName("SUBTITLE")[0].childNodes[0].nodeValue;
    var videoUrl = xmlDoc.getElementsByTagName("VIDEO_URL")[0].childNodes[0].nodeValue;
    var videoMarkersUrl = xmlDoc.getElementsByTagName("VIDEOMARKERS_URL")[0].childNodes[0].nodeValue;
    var track = [];
    var x = xmlDoc.getElementsByTagName("TRACK");
    for (i = 0; i < x.length; i++) {
      track.push({
        gpxUrl: x[i].getElementsByTagName("GPX_URL")[0].childNodes[0].nodeValue,
        name: x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue,
      });
    }

    playerSetTitle(title, subtitle);
  });


}




/// Load GPX and draw polyline
var coordinates = [];

function loadGPX() {
  loadDoc("data/Alessandria_20190620124553.gpx", function (xhttp) {
    gpx = new gpxParser();
    gpx.parse(xhttp.responseText);

    gpx.waypoints.forEach(function (wpt) {
      //coordinates.push(wpt.lon, wpt.lat, wpt.ele); // push with elevation
      coordinates.push(wpt.lon, wpt.lat); // push without elevation
    });

    /// draw polyline
    //drawPolylineOnTerrain(coordinates);


    getCartographicPosition(coordinates, temp);

  });
}


function temp(pos) {
  /// add the height from cartesian to the array of log lat coordinates
  i = 0;
  ii = 0;
  while (i <= coordinates.length) {
    i += 2;
    if (ii == pos.length) {
      ii = pos.length - 1;
    }
    coordinates.splice(i, 0, pos[ii].height);
    i++;
    ii++;
  }

  /// remove last element (...?)
  coordinates.pop();

  /// draw polyline
  useHeight = true;
  drawPolyline(coordinates, useHeight);
}



/// Load markers
var playerMarkers = [];

loadMarkers();

function loadMarkers() {
  loadDoc("data/markers.xml", function (xml) {
    var i;
    var xmlDoc = xml.responseXML;
    var x = xmlDoc.getElementsByTagName("MARKER");
    for (i = 0; i < x.length; i++) {
      timecode = x[i].getElementsByTagName("TIMECODE")[0].childNodes[0].nodeValue;
      playerMarkers.push({
        time: convertTimeCodeToSeconds(timecode, 25),
        title: x[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue,
        longitude: x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue,
        latitude: x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue
      });
    }
    setInterval(chechForMarker, 500);
  });
}





/// check for marker
/// during playback
var playerMarkerIndexStart = 0;

Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, resetCounter);

function resetCounter() {
  playerMarkerIndexStart = 0;
  console.log("RESET");
}

function chechForMarker() {
  if (playerMarkers.length == 1 || !playerPlaying) return;

  for (i = playerMarkerIndexStart; i < playerMarkers.length; i++) {

    if (playerTime >= playerMarkers[i].time) {
      playerMarkerIndexStart = i + 1;

      if ((i < playerMarkers.length - 1 && playerTime <= playerMarkers[i + 1].time) ||
        (i == playerMarkers.length - 1)) {
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
function onMarkerReached(index) {
  //flyMapTo(playerMarkers[index].longitude, playerMarkers[index].latitude);

  addMapBillboard(playerMarkers[index].longitude, playerMarkers[index].latitude, flyMapToPin);
}


function DisplayPlayerMessage(value) {
  var id = document.getElementById("playerMessage");
  id.style.opacity = 1;
  id.innerHTML = value;

}
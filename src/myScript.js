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








///////////////////////////////
/// Load main xml data
/// with all the starting informations
/// to setup everything
///////////////////////////////
var main = {
  title : "",
  subtitle : "",
  videoUrl : "",
  videoMarkersUrl : "",
  tracks : [],
  load : function (url, callback = null) {
    loadDoc(url, function (xml) {
      let xmlDoc = xml.responseXML;
      main.title = xmlDoc.getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
      main.subtitle = xmlDoc.getElementsByTagName("SUBTITLE")[0].childNodes[0].nodeValue;
      main.videoUrl = xmlDoc.getElementsByTagName("VIDEO_URL")[0].childNodes[0].nodeValue;
      main.videoMarkersUrl = xmlDoc.getElementsByTagName("VIDEO_MARKERS_URL")[0].childNodes[0].nodeValue;

      //var i;
      // var track = [];
      // var x = xmlDoc.getElementsByTagName("TRACK");
      // for (i = 0; i < x.length; i++) {
      //   track.push({
      //     gpxUrl: x[i].getElementsByTagName("GPX_URL")[0].childNodes[0].nodeValue,
      //     name: x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue,
      //   });
      // }

 

      if (callback != null) callback();
    });
  },
  setup : function(){
    playerSetTitle(main.title, main.subtitle);
    loadMarkers(main.videoMarkersUrl);
  }
}




main.load("data/Venezia_LidoPellestrina/main.xml", main.setup);













// //loadMainData();

// function loadMainData() {
//   loadDoc("data/main.xml", function (xml) {
//     var i;
//     var xmlDoc = xml.responseXML;
//     var title = xmlDoc.getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
//     var subtitle = xmlDoc.getElementsByTagName("SUBTITLE")[0].childNodes[0].nodeValue;
//     var videoUrl = xmlDoc.getElementsByTagName("VIDEO_URL")[0].childNodes[0].nodeValue;
//     var videoMarkersUrl = xmlDoc.getElementsByTagName("VIDEOMARKERS_URL")[0].childNodes[0].nodeValue;
//     var track = [];
//     var x = xmlDoc.getElementsByTagName("TRACK");
//     for (i = 0; i < x.length; i++) {
//       track.push({
//         gpxUrl: x[i].getElementsByTagName("GPX_URL")[0].childNodes[0].nodeValue,
//         name: x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue,
//       });
//     }

//     playerSetTitle(title, subtitle);
//   });
// }




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


    getCartographicPosition(coordinates, createPolylineOnTerrain);

  });
}



////////////////////////////
/// Create a 3d polyline from array with lng, lat and real terrain height
////////////////////////////
function createPolylineOnTerrain(pos) {
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




////////////////////////////
/// Load markers
////////////////////////////

var playerMarkers = [];
//loadMarkers();

function loadMarkers(url) {
  loadDoc(url, function (xml) {
    var i;
    var xmlDoc = xml.responseXML;
    var x = xmlDoc.getElementsByTagName("MARKER");
    for (i = 0; i < x.length; i++) {
      var sequenceTimeCode = 0;
      var videoTimeCode = 0;
      var title = "";
      var longitude = 0;
      var latitude = 0;
      if (x[i].getElementsByTagName("SEQUENCE_TIMECODE").length != 0) {
        if (x[i].getElementsByTagName("SEQUENCE_TIMECODE")[0].childNodes.length != 0) {
          sequenceTimeCode = x[i].getElementsByTagName("SEQUENCE_TIMECODE")[0].childNodes[0].nodeValue;
        }
      }
      if (x[i].getElementsByTagName("VIDEO_TIMECODE").length != 0) {
        if (x[i].getElementsByTagName("VIDEO_TIMECODE")[0].childNodes.length != 0) {
          videoTimeCode = x[i].getElementsByTagName("VIDEO_TIMECODE")[0].childNodes[0].nodeValue;
          videoTimeCode = convertTimeCodeToSeconds(videoTimeCode, 25);
        }
      }
      if (x[i].getElementsByTagName("TITLE").length != 0) {
        if (x[i].getElementsByTagName("TITLE")[0].childNodes.length != 0) {
          title = x[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
        }
      }
      if (x[i].getElementsByTagName("LONGITUDE").length != 0) {
        if (x[i].getElementsByTagName("LONGITUDE")[0].childNodes.length != 0) {
          longitude = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
        }
      }
      if (x[i].getElementsByTagName("LATITUDE").length != 0) {
        if (x[i].getElementsByTagName("LATITUDE")[0].childNodes.length != 0) {
          latitude = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
        }
      }

      playerMarkers.push({
        sequenceTime: sequenceTimeCode,
        videoTime: videoTimeCode,
        title: title,
        longitude: longitude,
        latitude: latitude,
      });
    }

    /// start to check for markers during video playback
    setInterval(checkForMarker, 500);


    /// create a placeholder for each marker
    playerMarkers.forEach(function (marker) {
      createPlaceholder(marker.longitude, marker.latitude);
    });


    /// add billboardImage method for each placeholder
    placeholders.forEach(function (placeholder) {
      placeholder.billboardImage = new BillboardImage(placeholder);
      placeholder.billboardImage.setOpacity(0.001);
    });
  });
}






////////////////////////////
/// check for marker during playback
////////////////////////////
var playerMarkerIndexStart = -1;

Player.listenTo(Player, Clappr.Events.PLAYER_SEEK, resetCounter);

function resetCounter() {
  playerMarkerIndexStart = 0;
}

function checkForMarker() {
  if (playerMarkers.length == 1 || !playerPlaying) return;

  for (i = 0; i < playerMarkers.length; i++) {

    if (i < playerMarkers.length - 1 && playerTime >= playerMarkers[i].videoTime &&
      playerTime < playerMarkers[i + 1].videoTime && playerMarkerIndexStart != i) {

      playerMarkerIndexStart = i;
      onMarkerReached(i);

    } else if (i == playerMarkers.length - 1 && playerTime >= playerMarkers[i].videoTime &&
      playerMarkerIndexStart != i) {

      playerMarkerIndexStart = i;
      onMarkerReached(i);
    }
  }
}




function BillboardImage(element) {
  var timer;
  var fadeTime = 10;
  var op;
  var isFading = false;

  this.setOpacity = function (value) {
    op = value;
    element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
  }

  this.fadeIn = function () {
    console.log("FADE IN " + this);
    isFading = true;
    if (timer != null) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      if (op >= 0.95) {
        isFading = false;
        clearInterval(timer);
        timer = null;
        element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 1);
      }
      if (isFading) {
        element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
        op += 0.025;
      }
    }, fadeTime);
  }

  this.fadeOut = function () {
    isFading = true;
    if (timer != null) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      if (op <= 0.05) {
        isFading = false;
        clearInterval(timer);
        timer = null;
        element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.001);
      }
      if (isFading) {
        element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
        op -= 0.025;
      }
    }, fadeTime);
  }
}



////////////////////////////
/// when a marker is detected during playing do this
////////////////////////////
var oldMarkerIndex;

function onMarkerReached(index) {

  if (index == oldMarkerIndex) return;

  /// debug
  DisplayPlayerMessage("marker:" + index + " - " + playerMarkers[index].title);
  console.log("linkato su marker : " + index + " - " + playerMarkers[index].title);
  console.log("player:" + playerTime + " - marker:" + playerMarkers[index].time);

  /// fade in-out old placeholders
  if (oldMarkerIndex != null) {
    placeholders[oldMarkerIndex].billboardImage.fadeOut();
    console.log("spengo " + oldMarkerIndex);
  }

  /// fade-in new placeholder
  placeholders[index].billboardImage.fadeIn();
  console.log("accendo " + index);
  oldMarkerIndex = index;


  mapController.flyToElement(placeholders[index]);
}



function DisplayPlayerMessage(value) {
  var id = document.getElementById("playerMessage");
  id.style.opacity = 1;
  id.innerHTML = value;

}





/////////////////////////////////////// TEST ///////////////////////////////////
var lng1 = 12.309487;
var lat1 = 45.343125;

var lng2 = 12.365823;
var lat2 = 45.408781;


var pos1 = Cesium.Cartesian3.fromDegrees(lng1, lat1);
var pos2 = Cesium.Cartesian3.fromDegrees(lng2, lat2);



var pinTest = viewer.entities.add({
  position: pos1,
  billboard: {
    //image: 'images/pin_icon.png',
    image: 'images/temp.svg',
    width: 15,
    height: 15,
    //verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
  }
});



//setInterval (dolerp, 1000);

var iii = 0;

function dolerp() {
  // console.log("LERP: " + lerp (pos1.x, pos2.x, iii));
  // console.log("LERP: " + lerp (pos1.y, pos2.y, iii));

  iii += 0.05;

  var pos3 = new Cesium.Cartesian3(lerp(pos1.x, pos2.x, iii), lerp(pos1.y, pos2.y, iii), lerp(pos1.z, pos2.z, iii));
  console.log("LERP: " + pos3);


  pinTest.position = pos3;
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}
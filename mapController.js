Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1NWMyOC00YjFkLTQ5OTUtODg5Yy0zZDRlNGI1NTg3ZjciLCJpZCI6MTUxNTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjcyNDQ4NjR9.WDQmliwvLOArHiI9n4ET2TBELHRsGofW1unvSsbuyR8';
//var viewer = new Cesium.Viewer('map');
var viewer = new Cesium.Viewer('map', {
    terrainProvider: Cesium.createWorldTerrain(),
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false

});

/// Map color correction
var imageryLayers = viewer.imageryLayers;
var layer = imageryLayers.get(0);
layer.brightness = 3;


var scene = viewer.scene;
var mapCamera = scene.camera;


/// Set start map position and orientation
var defaultHeight = 180;
flyMapTo(12.3098806, 45.3418537, defaultHeight, Cesium.Math.toRadians(200.0),
 Cesium.Math.toRadians(-50.0), 0);



/// fly camera to position

function flyMapTo (longitude, latitude, height = mapCamera.positionCartographic.height,
     heading = mapCamera.heading, pitch = mapCamera.pitch, duration = null){
    mapCamera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation : {
            heading : heading,
            pitch: pitch
        },
        duration: duration,
        easingFunction : Cesium.EasingFunction.EXPONENTIAL_IN_OUT
});
};


/// add a billboard
var pin;
function addMapBillboard(longitude, latitude, callback = null){
    if (pin == null){
        pin = viewer.entities.add({
            position : Cesium.Cartesian3.fromDegrees(longitude, latitude),
            billboard :{
                image : 'images/pin_icon.png',
                width : 64, 
                height : 64,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND,          
            }
        });
    }
    else{
        pin.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    }
    
    if (callback != null){
        console.log("callback da addbillboard");
        callback();
    }
    else
    {
        console.log("no callback da addbillboard");
    } 
}


function flyMapToPin(){
    heading = mapCamera.heading;
    pitch = mapCamera.pitch;
    range = 764.534479411941;
    viewer.flyTo(pin, {
        offset: new Cesium.HeadingPitchRange(heading, pitch, 500)
});
}

function fadeBillboard(element, callback = null) {

    // pin.position = Cesium.Cartesian3.fromDegrees(12.366305, 45.404293);

    // pin.billboard.height = 150;
    // pin.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.5);

    if (pin == null){
        console.log("NULLO!!");
    }

    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            if (callback!=null) callback();
        }
        pin.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
        op -= op * 0.1;
    }, 50);
  }


var defaultHeight = 180;

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
function addMapBillboard(longitude, latitude){
    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard :{
            image : 'images/pin_icon.png',
            width : 64, 
            height : 64,
            verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
            heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
        }
    });
}

//setInterval(function(){console.log(mapCamera.heading + " --- " + mapCamera.pitch);}, 1000 );

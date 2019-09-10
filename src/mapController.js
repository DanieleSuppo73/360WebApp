Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1NWMyOC00YjFkLTQ5OTUtODg5Yy0zZDRlNGI1NTg3ZjciLCJpZCI6MTUxNTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjcyNDQ4NjR9.WDQmliwvLOArHiI9n4ET2TBELHRsGofW1unvSsbuyR8';
var terrainProvider = Cesium.createWorldTerrain();
var viewer = new Cesium.Viewer('map', {
    imageryProvider: new Cesium.MapboxImageryProvider({
        mapId: 'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoiZGFuaWVsZXN1cHBvIiwiYSI6ImNqb2owbHp2YjAwODYzcW8xaWdhcGp1ancifQ.JvNWYw_cL6rV7ymuEbeTCw'
    }),
    terrainProvider: terrainProvider,
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


var scene = viewer.scene;
var mapCamera = scene.camera;

var mapController = {
    flyToElement: function (element) {
        heading = viewer.scene.camera.heading;
        pitch = viewer.scene.camera.pitch;
        range = cameraProperties.range;
        viewer.flyTo(element, {
            offset: new Cesium.HeadingPitchRange(heading, pitch, range)
        });
    }
}





/// Map color correction
var imageryLayers = viewer.imageryLayers;
var layer = imageryLayers.get(0);
layer.brightness = 2;
//layer.gamma = 1.05;





/// Set start map position and orientation

/// per alessandria
var defaultHeight = 600;
flyMapTo(8.921944969520226, 44.80576049196282, defaultHeight, Cesium.Math.toRadians(200.0),
    Cesium.Math.toRadians(-50.0), 0);


// /// per lido e pellestrina
// viewer.camera.setView({
//     destination : new Cesium.Cartesian3(4404792.475707513, 962828.6766361801, 4508398.182356733),
//     orientation: {
//         heading : Cesium.Math.toRadians(353.5990272815255), // east, default value is 0.0 (north)
//         pitch : Cesium.Math.toRadians(-39.021508523873536),    // default value (looking down)
//         roll : Cesium.Math.toRadians(6.28270206832835)                            
//     }
// });




/// fly camera to position
function flyMapTo(longitude, latitude, height = mapCamera.positionCartographic.height,
    heading = mapCamera.heading, pitch = mapCamera.pitch, duration = null) {
    mapCamera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
            heading: heading,
            pitch: pitch
        },
        duration: duration,
        easingFunction: Cesium.EasingFunction.EXPONENTIAL_IN_OUT
    });
};





/// draw a polyline from an array of coordinates in degrees
function drawPolyline(coordinates, useHeight = true, clamp = false) {

    if (clamp && !Cesium.Entity.supportsPolylinesOnTerrain(viewer.scene)) {
        console.log('Polylines on terrain are not supported on this platform');
        alert('Polylines on terrain are not supported on this platform');
        clamp = false;
    }

    var pos = [];
    if (!useHeight) pos = Cesium.Cartesian3.fromDegreesArray(coordinates);
    else pos = Cesium.Cartesian3.fromDegreesArrayHeights(coordinates);

    viewer.entities.add({
        polyline: {
            positions: pos,
            clampToGround: clamp,
            width: 5,
            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.ORANGE,
                outlineWidth: 2,
                outlineColor: Cesium.Color.BLACK
            })
        }
    });
}












function getCameraInfo() {
    console.log("position: " + mapCamera.positionWC);
    console.log("heading: " + Cesium.Math.toDegrees(mapCamera.heading));
    console.log("pitch: " + Cesium.Math.toDegrees(mapCamera.pitch));
    console.log("roll: " + mapCamera.roll);
}



/// return the cartographic position with elevation
/// from an array of coordinates (lng, lat, lng, lat, ...)
function getCartographicPosition(coordinates, callback) {
    var positions = [];
    for (i = 0; i < coordinates.length; i += 2) {
        positions.push(Cesium.Cartographic.fromDegrees(coordinates[i], coordinates[i + 1]));
        //console.log(Cesium.Cartographic.fromDegrees(coordinates[i], coordinates[i + 1]));
    }

    var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
    Cesium.when(promise, function (updatedPositions) {
        // positions[0].height and positions[1].height have been updated.
        // updatedPositions is just a reference to positions.
        callback(positions);
    });
}









////////////////////////////
/// return the coordinates with the elevation sampled from the terrain
////////////////////////////
function insertHeightInCoordinates(coordinates, callback) {
    var positions = [];
    for (i = 0; i < coordinates.length; i += 2) {
        positions.push(Cesium.Cartographic.fromDegrees(coordinates[i], coordinates[i + 1]));
    }

    var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
    Cesium.when(promise, function (updatedPositions) {
        // positions[0].height and positions[1].height have been updated.
        // updatedPositions is just a reference to positions.
        
        /// add the height from cartesian to the array of log lat coordinates
        var i = 0;
        var ii = 0;
        while (i <= coordinates.length) {
            i += 2;
            if (ii == positions.length) {
                ii = positions.length - 1;
            }
            coordinates.splice(i, 0, positions[ii].height);
            i++;
            ii++;
        }

        /// remove last element (...?)
        coordinates.pop();

        /// callback
        callback(coordinates);
    });
}
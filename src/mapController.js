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



/// Map color correction
var imageryLayers = viewer.imageryLayers;
var layer = imageryLayers.get(0);
layer.brightness = 2;
//layer.gamma = 1.05;


var scene = viewer.scene;
var mapCamera = scene.camera;


/// Set start map position and orientation


var defaultHeight = 600;
flyMapTo(8.921944969520226, 44.80576049196282, defaultHeight, Cesium.Math.toRadians(200.0),
    Cesium.Math.toRadians(-50.0), 0);


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


/// add a billboard
var pin;

function addMapBillboard(longitude, latitude, callback = null) {
    if (pin == null) {
        pin = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            billboard: {
                image: 'images/pin_icon.png',
                width: 64,
                height: 64,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            }
        });
    } else {
        pin.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    }

    if (callback != null) {
        callback();
    }
}


function flyMapToPin() {
    heading = mapCamera.heading;
    pitch = mapCamera.pitch;
    range = 500;
    viewer.flyTo(pin, {
        offset: new Cesium.HeadingPitchRange(heading, pitch, range)
    });
}

function fadeBillboard(element, callback = null) {

    // pin.position = Cesium.Cartesian3.fromDegrees(12.366305, 45.404293);

    // pin.billboard.height = 150;
    // pin.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.5);

    if (pin == null) {
        console.log("NULLO!!");
    }

    var op = 1; // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1) {
            clearInterval(timer);
            if (callback != null) callback();
        }
        pin.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
        op -= op * 0.1;
    }, 50);
}




/// draw a polyline from an array of coordinates
function drawPolylineOnTerrain(coordinates, useHeight = false, clamp = false) {

    if (!Cesium.Entity.supportsPolylinesOnTerrain(viewer.scene)) {
        console.log('Polylines on terrain are not supported on this platform');
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


/// draw a polyline from an array of coordinates
function drawPolyline(coordinates) {

    viewer.entities.add({
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
            clampToGround: false,
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
function getTerrainHeight(coordinates, callback) {
    var positions = [];
    for (i = 0; i < coordinates.length; i += 2) {
        positions.push(Cesium.Cartographic.fromDegrees(coordinates[i], coordinates[i + 1]));
    }

    var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
    Cesium.when(promise, function (updatedPositions) {
        // positions[0].height and positions[1].height have been updated.
        // updatedPositions is just a reference to positions.
        callback(positions);
    });
}
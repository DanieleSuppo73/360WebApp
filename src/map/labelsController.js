
// viewer.entities.add({
//     position: Cesium.Cartesian3.fromDegrees(12.3153133, 45.4392717),
//     label: {
//         text: "Venezia",
//         //font: size.toString() + 'px acuminBold',
//         font: '20px Helvetica',
//         fillColor: Cesium.Color.WHITE,
//         outlineColor: Cesium.Color.BLACK,
//         outlineWidth: 2,
//         style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//         heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//         pixelOffset: new Cesium.Cartesian2(0, -5),
//         scale: 1
//     }
// });
// viewer.camera.moveStart.addEventListener(() => {console.log("START");});
viewer.camera.changed.addEventListener(() => {
    console.log("CHANGED");
    getLabelsFromGeoDB();
});
viewer.camera.moveEnd.addEventListener(() => {console.log("END");});

//position : Cesium.Cartesian3.fromDegrees(12.3153133, 45.4392717),

function TEST() {
    console.log(long, lati);
    viewer.entities.add({
        position: pp,
        billboard: {
            image: 'images/pin_icon.svg',
            width: 30,
            height: 30,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        }
    });


}


/// load cities from https://rapidapi.com/wirefreethought/api/geodb-cities/details
var isLoading = false;
function getLabelsFromGeoDB() {
    if (!main.isLoaded || isLoading) return;

    console.log("Loading cities...");
    console.log("radius " + cameraProperties.range / 4000);

    /// since when the map is loading the 1st time the camera range is wrong,
    /// we must wait for a reasonable range is detected before to load
    let cameraRange = cameraProperties.range;
    if (cameraRange > 50000){
        let waitForReasonableRange = setInterval(function (handle) {
            console.log("attempt refused...");
            if (cameraProperties.range <= 50000){
                clearInterval(waitForReasonableRange);
                loader();
            }
        }, 1000);
    }
    else {
        console.log("attempt accepted!");
        loader();
    }



    /// find intersection of ray from camera (to the center of the window) and 3d terrain
    // var elmnt = document.getElementById("map");
    // var windowCoordinates = new Cesium.Cartesian2(elmnt.offsetHeight / 2, elmnt.offsetWidth / 2);
    // var ray = viewer.camera.getPickRay(windowCoordinates);
    // var intersectionPoint = viewer.scene.globe.pick(ray, viewer.scene);


    // var cartographic = Cesium.Cartographic.fromCartesian(getPointFromCamera());
    // pp = Cesium.Cartographic.fromCartesian(getPointFromCamera());
    // var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    // var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
    // console.log(latitude);
    // console.log(longitude);
    //
    // var radius = cameraProperties.range / 4000;
    // console.log("radius " + radius);
    // var minPopulation = 15000;

    var longitude = 12.24;
    var latitude = 45.40;
    var radius = 15;
    var minPopulation = 15000;

    var data = null;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            // console.log(this.responseText);

            var allObj = JSON.parse(this.responseText);
            console.log(allObj);

            var data = allObj.data;
            //console.log("CI SONO " + data.length);

            for (i = 0; i < data.length; i++) {

                var result = data[i];

                if (result.type === "CITY"){

                    /// check if this city is already loaded
                    if (!main.labels.includes(result.city)){
                        /// create map label
                        viewer.entities.add({
                            position: Cesium.Cartesian3.fromDegrees(result.longitude, result.latitude),
                            label: {
                                text: result.city,
                                font: 'bold 13px Helvetica',
                                fillColor: Cesium.Color.WHITE,
                                outlineColor: Cesium.Color.BLACK,
                                outlineWidth: 2,
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                                pixelOffset: new Cesium.Cartesian2(0, -5),
                            }
                        });

                        main.labels.push(result.city);
                    }
                }
            }
        }
    });


    xhr.open("GET", "https://wft-geo-db.p.rapidapi.com/v1/geo/locations/%2B" + latitude + "%2B"
        + longitude + "/nearbyCities?limit=10&languageCode=IT&minPopulation=" + minPopulation + "&radius=" + radius);
    xhr.setRequestHeader("x-rapidapi-host", "wft-geo-db.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", "ce699b059emshab8963e751a141dp1fb327jsn457d60aff686");

    xhr.send(data);
}


function loader(){
    isLoading = true;

    /// wait 1 second before to accept a new request
    setTimeout(function () {
        isLoading = false;
    }, 1200);

    let cartographic = Cesium.Cartographic.fromCartesian(getPointFromCamera());
    let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

    console.log(latitude, longitude);
}



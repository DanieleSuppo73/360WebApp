
var mapChaged = false;
viewer.camera.changed.addEventListener(() => {
    mapChaged = true;
});
viewer.camera.moveEnd.addEventListener(() => {
    if (mapChaged){
        mapChaged = false;
        console.log("------ MAP changed ------");
        mapLabels.load();
    }
});



var mapLabels = {
    isLoading : false, /// do we have finished to load the cities?
    isAvailable : true, /// does the webserver can accept a new request?
    requestTime : 2000, /// time to wait from each request to the webserver
    small : [],
    medium : [],
    large : [],
    load: function () {
        if (!main.isLoaded || mapLabels.isLoading || !mapLabels.isAvailable) return;

        /// since when the map is loading the 1st time the camera range is wrong,
        /// we must wait for a reasonable range is detected before to load
        let cameraRange = cameraProperties.range;
        if (cameraRange > 50000){
            console.log("attempt refused...");
            let waitForReasonableRange = setInterval(function (handle) {
                if (cameraProperties.range <= 50000){
                    console.log("2nd attempt accepted!");
                    clearInterval(waitForReasonableRange);
                    loader(cameraRange);
                }
            }, 1000);
        }
        else {
            console.log("attempt accepted!");
            loader(cameraRange);
        }
    }
};




/// load cities from https://rapidapi.com/wirefreethought/api/geodb-cities/details
var waitForNewRequest = null;
function loader(cameraRange){
    mapLabels.isLoading = true;
    mapLabels.isAvailable = false;
    console.log("Loading cities...");

    /// wait 2 seconds before to accept a new request
    if (waitForNewRequest != null){
        clearTimeout(waitForNewRequest);
    }
    waitForNewRequest = setTimeout(function () {
        mapLabels.isAvailable = true;
        waitForNewRequest = null;
    }, mapLabels.requestTime);

    let cartographic = Cesium.Cartographic.fromCartesian(getPointFromCamera());
    let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

    console.log("Position: " + latitude, longitude);

    //var radius = 15;
    var radius = cameraRange / 1500;
    console.log("radius: " + radius);
    var minPopulation = 15000;

    var data = null;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            // console.log(this.responseText);

            labelsCreating = true;

            var allObj = JSON.parse(this.responseText);
            //console.log(allObj);

            var data = allObj.data;

            if (data === undefined) return;
            if (data.length === 0){
                console.log("no cities with " + minPopulation + " people in this area");
            }


            for (i = 0; i < data.length; i++) {

                var result = data[i];

                if (result.type === "CITY"){

                    /// check if this city is already loaded
                    if (!main.labels.includes(result.city)){

                        console.log("new city: " + result.city);

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
                    else{
                        console.log("refused city: " + result.city);
                    }
                }
            }
            mapLabels.isLoading = false;
        }
    });


    xhr.open("GET", "https://wft-geo-db.p.rapidapi.com/v1/geo/locations/%2B" + latitude + "%2B"
        + longitude + "/nearbyCities?limit=10&languageCode=IT&minPopulation=" + minPopulation + "&radius=" + radius);
    xhr.setRequestHeader("x-rapidapi-host", "wft-geo-db.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", "ce699b059emshab8963e751a141dp1fb327jsn457d60aff686");
    xhr.send(data);
}




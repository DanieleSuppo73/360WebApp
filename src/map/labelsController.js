

viewer.camera.changed.addEventListener(() => {
    mapLabels.isRequestCheck = true;

});
viewer.camera.moveEnd.addEventListener(() => {
    if (mapLabels.isRequestCheck){
        mapLabels.isRequestCheck = false;
        console.log("------ MAP changed, try to load labels ------");
        mapLabels.load();
    }
});


const mapLabels = {
    isRequestCheck: false,
    isServerAvailable: true, /// does the webserver can accept a new request?ù
    serverRequestDelay: 2000, /// time to wait from each request to the webserver
    labels : [],
    load: function () {
        if (!mapLabels.isServerAvailable) {
            return;
        }

        /// since when the map is loading the 1st time the camera range is wrong,
        /// we must wait for a reasonable range is detected before to load
        let cameraRange = cameraProperties.range;
        if (cameraRange !== undefined && cameraRange > 50000){
            logger.log("attempt refused...");
            let waitForReasonableRange = setInterval(function (handle) {
                if (cameraProperties.range <= 50000){
                    logger.log("2nd attempt accepted!");
                    clearInterval(waitForReasonableRange);
                    loader(cameraRange);
                }
            }, 1000);
        }
        else {
            logger.log("attempt accepted!");
            loader(cameraRange);
        }

        /// load cities
        function loader(cameraRange) {
            //mapLabels.isLoading = true;
            mapLabels.isServerAvailable = false;
            logger.log("Loading cities...");

            /// get the coordinates in the center of the window
            let cartographic = Cesium.Cartographic.fromCartesian(getPointFromCamera());
            let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

            logger.log("Position: " + latitude, longitude);

            let radius = cameraRange / 1500;
            logger.log("radius: " + radius);

            /// load mayor cities
            let minPopulation = 50000;
            let font = 'bold 18px Roboto';
            let minDistance = 50000;
            let maxDistance = 80000;
            getDataFromWebServer(function () {

                /// load minor cities
                setTimeout(function () {
                    minPopulation = 10000;
                    font = '14px Roboto';
                    minDistance = 30000;
                    maxDistance = 40000;
                    getDataFromWebServer(function () {
                        logger.log("end of request for this frame");
                        mapLabels.resetServerAvailable();
                    })
                }, mapLabels.serverRequestDelay);
            });



            /// actually get data from https://rapidapi.com/wirefreethought/api/geodb-cities/details
            function getDataFromWebServer(callback) {
                var data = null;
                var xhr = new XMLHttpRequest();
                xhr.withCredentials = true;

                xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === this.DONE) {
                        var allObj = JSON.parse(this.responseText);
                        var data = allObj.data;

                        /// handle the error from webserver
                        if (data === undefined){
                            // mapLabels.isLoading = false;
                            logger.error("error loading labels from webserver");
                            mapLabels.resetServerAvailable();
                            return;
                        }
                        if (data.length === 0){
                            logger.log("no cities with " + minPopulation + " people in this area");
                        }

                        /// create labels of the cities
                        for (i = 0; i < data.length; i++) {
                            let result = data[i];
                            if (result.type === "CITY"){

                                /// check if this city is already loaded
                                if (!mapLabels.labels.includes(result.city)){

                                    logger.log("new city: " + result.city);

                                    /// create map label
                                    viewer.entities.add({
                                        position: Cesium.Cartesian3.fromDegrees(result.longitude, result.latitude),
                                        label: {
                                            text: result.city,
                                            font: font,
                                            fillColor: Cesium.Color.WHITE,
                                            outlineColor: Cesium.Color.BLACK,
                                            outlineWidth: 2,
                                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                                            pixelOffset: new Cesium.Cartesian2(0, -5),
                                            translucencyByDistance : new Cesium.NearFarScalar(minDistance, 1.0,
                                                maxDistance, 0.0),
                                        }
                                    });

                                    mapLabels.labels.push(result.city);
                                }
                                else{
                                    console.log("refused city: " + result.city);
                                }
                            }
                        }
                        callback();
                    }
                });


                xhr.open("GET", "https://wft-geo-db.p.rapidapi.com/v1/geo/locations/%2B" + latitude + "%2B"
                    + longitude + "/nearbyCities?limit=10&languageCode=it&minPopulation=" + minPopulation + "&radius=" + radius);
                xhr.setRequestHeader("x-rapidapi-host", "wft-geo-db.p.rapidapi.com");
                xhr.setRequestHeader("x-rapidapi-key", "ce699b059emshab8963e751a141dp1fb327jsn457d60aff686");
                xhr.send(data);
            }
        }
    },
    resetServerAvailable: function () {
        /// reset server available
        setTimeout(function () { mapLabels.isServerAvailable = true;
        }, mapLabels.serverRequestDelay);
    }
};


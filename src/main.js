var markersLayer;




/// get the Parameters from iframe declaration in html page
function getParameterFromIframe(parameter)
{
    let url = window.location.search.substring(1); //get rid of "?" in querystring
    let qArray = url.split('&'); //get key-value pairs
    for (let i = 0; i < qArray.length; i++)
    {
        let pArr = qArray[i].split('='); //split key and value
        if (pArr[0] === parameter)
            return pArr[1]; //return value
    }
}


function loadDoc(url, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(this);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}


function loadGPX(obj, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(obj, this);
        }
    };
    xhttp.open("GET", obj.url, true);
    xhttp.send();
}


function convertTimeCodeToSeconds(timeString, framerate) {
    const timeArray = timeString.split(":");
    const hours = parseInt(timeArray[0]) * 60 * 60;
    const minutes = parseInt(timeArray[1]) * 60;
    const seconds = parseInt(timeArray[2]);
    const frames = parseInt(timeArray[3]) * (1 / framerate);
    return hours + minutes + seconds + frames;
}


function GPX() {
    this.url = "";
    this.name = "";
    this.coordinates = [];

    /// load the gpx file
    this.load = function (callback = null) {
        loadGPX(this, function (obj, xhttp) {
            var _gpx = new gpxParser();
            _gpx.parse(xhttp.responseText);
            _gpx.waypoints.forEach(function (wpt) {
                obj.coordinates.push(wpt.lon, wpt.lat); // push without elevation
            });

            /// add the height, sampled from the terrain
            insertHeightInCoordinates(obj.coordinates, function () {

                /// draw the polyline grom GPX
                drawPolyline(obj.coordinates);

                /// call the callback
                callback();
            });
        });
    }
}


///////////////////////////////
/// Load main xml data
/// with all the starting informations
/// to setup everything
///////////////////////////////
let main = {
    isLoaded: false,
    title: "",
    subtitle: "",
    videoUrl: "",
    videoMarkersUrl: "",
    posterImage: "",
    gpxList: [],
    markers: [],
    placeholdersMap: [],
    placeholdersPlay: [],
    labels: [],
    boundingSphere : new Cesium.BoundingSphere(),
    load: function (url, callback = null) {
        loadDoc(url, function (xml) {
            let xmlDoc = xml.responseXML;

            main.title = xmlDoc.getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
            main.subtitle = xmlDoc.getElementsByTagName("SUBTITLE")[0].childNodes[0].nodeValue;
            main.videoUrl = xmlDoc.getElementsByTagName("VIDEO_URL")[0].childNodes[0].nodeValue;
            main.posterImage = xmlDoc.getElementsByTagName("POSTER_IMAGE")[0].childNodes[0].nodeValue;

            /// load the video
            // loadPlayer(main.videoUrl, main.posterImage);
            videoPlayer.load("#player", main.videoUrl, main.posterImage);

            /// set the title in the poster image
            document.getElementById("title").innerHTML = main.title;
            document.getElementById("subtitle").innerHTML = main.subtitle;


            videoPlayer.onFirstPlay(function (e) {
                /// fade out #playerPoster on first play
                let playerPoster = document.getElementById("playerPoster");
                playerPoster.style.opacity = 0;
                playerPoster.style.transition = "opacity " + 1 + "s";
                playerPoster.style.WebkitTransition = "opacity " + 1 + "s";

                /// fade out placeholders on first play
                fadeOutAllPlaceholdersAtStart();
            });

            videoPlayer.onEnd(function (e) {
                /// fly back to boundingSphere
                viewer.camera.flyToBoundingSphere(main.boundingSphere)

                /// fade in placeholders at end of video
                fadeInAllPlaceholdersAtEnd();
            });


            // /// load map labels
            // main.labels = [];
            // if (xmlDoc.getElementsByTagName("LABELS_URL").length !== 0) {
            //     const labelsUrl = xmlDoc.getElementsByTagName("LABELS_URL")[0].childNodes[0].nodeValue;
            //
            //     loadDoc(labelsUrl, function (xml) {
            //         let i;
            //         let xmlDoc = xml.responseXML;
            //         let x = xmlDoc.getElementsByTagName("LABEL");
            //         for (i = 0; i < x.length; i++) {
            //             const text = x[i].getElementsByTagName("TEXT")[0].childNodes[0].nodeValue;
            //             const size = x[i].getElementsByTagName("SIZE")[0].childNodes[0].nodeValue;
            //             const longitude = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
            //             const latitude = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
            //
            //             /// create map label
            //             main.labels.push(viewer.entities.add({
            //                 position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            //                 label: {
            //                     text: text,
            //                     //font: size.toString() + 'px acuminBold',
            //                     font: '57px acuminBold',
            //                     fillColor: Cesium.Color.WHITE,
            //                     outlineColor: Cesium.Color.BLACK,
            //                     outlineWidth: 2,
            //                     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            //                     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            //                     heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            //                     pixelOffset: new Cesium.Cartesian2(0, -5),
            //                     scale: 0.3
            //                 }
            //             }));
            //         }
            //     });
            // }


            /// load all gpx
            main.gpxList = [];
            if (xmlDoc.getElementsByTagName("GPX").length !== 0) {
                let i;
                let ii = 0;
                let x = xmlDoc.getElementsByTagName("GPX");

                for (i = 0; i < x.length; i++) {
                    main.gpxList[i] = new GPX;
                    main.gpxList[i].url = x[i].getElementsByTagName("GPX_URL")[0].childNodes[0].nodeValue;
                    main.gpxList[i].name = x[i].getElementsByTagName("GPX_NAME")[0].childNodes[0].nodeValue;
                    main.gpxList[i].load(function () {

                        /// this is the callback when all the coordinates of this gpx are loaded
                        ii++;
                        /// when all gpx coordinates are loaded do this:
                        if (ii === x.length) {
                            console.log("terminato di caricare tutti i GPX!");

                            /// create an array with all coordinates from all GPX
                            let allCoordinates = [];
                            for (y = 0; y < main.gpxList.length; y++) {
                                allCoordinates.push.apply(allCoordinates, main.gpxList[y].coordinates);
                            }

                            /// create a bounding sphere and fly there
                            let allPositions = Cesium.Cartesian3.fromDegreesArrayHeights(allCoordinates);
                            main.boundingSphere = new Cesium.BoundingSphere.fromPoints(allPositions);

                            viewer.camera.flyToBoundingSphere(main.boundingSphere, {
                                //offset: offset,
                                duration: 0
                            });

                            //$("#mapLoader").fadeOut("slow");
                            main.isLoaded = true;
                        }
                    });
                }


            }


            /// load the markers
            main.markers = [];
            /// create customDataSource for placeholdersMap
            // let markersLayer = new Cesium.CustomDataSource();
            if (xmlDoc.getElementsByTagName("VIDEO_MARKERS_URL").length !== 0) {
                main.videoMarkersUrl = xmlDoc.getElementsByTagName("VIDEO_MARKERS_URL")[0].childNodes[0].nodeValue;

                loadDoc(main.videoMarkersUrl, function (xml) {
                    let i;
                    let xmlDoc = xml.responseXML;
                    let x = xmlDoc.getElementsByTagName("MARKER");
                    for (i = 0; i < x.length; i++) {
                        var sequenceTimeCode = 0;
                        var videoTimeCode = 0;
                        var title = "";
                        var longitude = 0;
                        var latitude = 0;
                        if (x[i].getElementsByTagName("SEQUENCE_TIMECODE").length !== 0) {
                            if (x[i].getElementsByTagName("SEQUENCE_TIMECODE")[0].childNodes.length !== 0) {
                                sequenceTimeCode = x[i].getElementsByTagName("SEQUENCE_TIMECODE")[0].childNodes[0].nodeValue;
                            }
                        }
                        if (x[i].getElementsByTagName("VIDEO_TIMECODE").length !== 0) {
                            if (x[i].getElementsByTagName("VIDEO_TIMECODE")[0].childNodes.length !== 0) {
                                videoTimeCode = x[i].getElementsByTagName("VIDEO_TIMECODE")[0].childNodes[0].nodeValue;
                                videoTimeCode = convertTimeCodeToSeconds(videoTimeCode, 25);
                            }
                        }
                        if (x[i].getElementsByTagName("TITLE").length !== 0) {
                            if (x[i].getElementsByTagName("TITLE")[0].childNodes.length !== 0) {
                                title = x[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
                            }
                        }
                        if (x[i].getElementsByTagName("LONGITUDE").length !== 0) {
                            if (x[i].getElementsByTagName("LONGITUDE")[0].childNodes.length !== 0) {
                                longitude = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                            }
                        }
                        if (x[i].getElementsByTagName("LATITUDE").length !== 0) {
                            if (x[i].getElementsByTagName("LATITUDE")[0].childNodes.length !== 0) {
                                latitude = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                            }
                        }


                        /// create the marker
                        main.markers.push({
                            sequenceTime: sequenceTimeCode,
                            videoTime: videoTimeCode,
                            title: title,
                            longitude: longitude,
                            latitude: latitude,
                        });


                        /// create the placeholderMap and placeholderPlay for the marker
                        /// if exist lng/lat for the marker
                        if (longitude !== 0 && latitude !== 0) {

                            /// placeholderMap
                            let placeholder = viewer.entities.add({
                                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                                billboard: {
                                    image: 'images/pin_small_icon.svg',
                                    width: 16.3,
                                    height: 21.3,
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                                }
                            });

                            /// add billboardImage property method for the placeholder
                            placeholder.billboardImage = new BillboardImage(placeholder);
                            placeholder.billboardImage.setOpacity(0.5);

                            main.placeholdersMap.push(placeholder);


                            /// placeholderPlay
                            placeholder = viewer.entities.add({
                                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                                billboard: {
                                    image: 'images/pin_icon.svg',
                                    width: 49,
                                    height: 64,
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                                }
                            });

                            /// add billboardImage property method for the placeholder
                            placeholder.billboardImage = new BillboardImage(placeholder);
                            placeholder.billboardImage.setOpacity(0.001);

                            main.placeholdersPlay.push(placeholder);
                        }
                    }

                    /// cluster the markers
                    //viewer.dataSources.add(markersLayer);

                    // markersLayer.clustering.enabled = true;
                    // markersLayer.clustering.pixelRange = 10;
                    // markersLayer.clustering.minimumClusterSize = 2;
                    // markersLayer.clustering.clusterLabels = false;




                    // markersLayer.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                    //
                    //     console.log("EEEEEEEEEEEEEEEEEEEEEEEEE");
                    //     cluster.label.show = false;
                    //     cluster.billboard.show = true;
                    //     cluster.billboard.id = cluster.label.id;
                    //     cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    //     cluster.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND,
                    //         cluster.billboard.width = 16.3;
                    //     cluster.billboard.height = 21.3;
                    //     cluster.billboard.image = 'images/pin_small_icon.svg';
                    //
                    //     // if (clusteredEntities.length >= 3) {
                    //     //     cluster.billboard.image = 'images/pin_icon.svg';
                    //     // }
                    // });


                    // var removeListener;


                    // function customStyle() {
                    //     if (Cesium.defined(removeListener)) {
                    //         removeListener();
                    //         removeListener = undefined;
                    //     } else {
                    //         removeListener = markersLayer.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
                    //             console.log("EEEEEEEEEEEEEEEEEEEEEEEEE");
                    //             cluster.label.show = false;
                    //             cluster.billboard.show = true;
                    //             cluster.billboard.id = cluster.label.id;
                    //             cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    //             cluster.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                    //             cluster.billboard.width = 16.3;
                    //             cluster.billboard.height = 21.3;
                    //             cluster.billboard.image = 'images/pin_small_icon.svg';
                    //             cluster.billboard.color = new Cesium.Color(0.2, 0.5, 0.7, 0.5);
                    //         });
                    //     }
                    //
                    //     // force a re-cluster with the new styling
                    //     var pixelRange = markersLayer.clustering.pixelRange;
                    //     markersLayer.clustering.pixelRange = 0;
                    //     markersLayer.clustering.pixelRange = pixelRange;
                    // }


                    // start with custom style
                    // customStyle();



                    /// when all markers are loaded, if there are no GPX
                    /// create a bounding sphere around the markers
                    /// to fly the camera in position
                    if (main.gpxList.length === 0) {

                        /// create an array with all coordinates from all markers
                        let allCoordinates = [];
                        for (let y = 0; y < main.markers.length; y++) {
                            allCoordinates.push(main.markers[y].longitude, main.markers[y].latitude);
                        }

                        insertHeightInCoordinates(allCoordinates, function () {

                            /// create a bounding sphere and fly there
                            let allPositions = Cesium.Cartesian3.fromDegreesArrayHeights(allCoordinates);
                            main.boundingSphere = new Cesium.BoundingSphere.fromPoints(allPositions);
                            viewer.camera.flyToBoundingSphere(main.boundingSphere, {
                                //offset: offset,
                                duration: 0,
                            });

                            main.isLoaded = true;
                        });
                    }
                });
                /// start to check for markers during video playback
                startToCheckForMarker();
            }
            if (callback != null) callback();
        });
    },
};


let uri = getParameterFromIframe("param1");
main.load(uri);
// main.load("data/Venezia_LidoPellestrina/main.xml");
//main.load("data/Alessandria/main.xml");


////////////////////////////
/// check for marker during playback
////////////////////////////
var markerIndex = -1;


function fadeOutAllPlaceholdersAtStart(){
    /// fade out all placeholders except the 1st
    for (let i=1; i<main.placeholdersMap.length; i++){
        main.placeholdersMap[i].billboardImage.fadeOut();
    }
}

function fadeInAllPlaceholdersAtEnd(){
    for (let i=0; i<main.placeholdersMap.length; i++){
        main.placeholdersMap[i].billboardImage.fadeIn(0.5);
    }
}

/// start to check for markers during video playback
function startToCheckForMarker(){
    setInterval(checkForMarker, 500);
}

function checkForMarker() {
    if (main.markers.length < 2 || !videoPlayer.isPlaying) return;

    for (let i = 0; i < main.markers.length; i++) {

        if (i < main.markers.length - 1 && videoPlayer.time >= main.markers[i].videoTime &&
            videoPlayer.time < main.markers[i + 1].videoTime && markerIndex !== i) {

            markerIndex = i;
            onMarkerReached(i);

        } else if (i === main.markers.length - 1 && videoPlayer.time >= main.markers[i].videoTime &&
            markerIndex !== i) {

            markerIndex = i;
            onMarkerReached(i);
        }
    }
}


function BillboardImage(element) {
    let timer;
    const fadeTime = 10;
    let op;
    let isFading = false;

    this.setOpacity = function (value) {
        op = value;
        element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
    };

    this.fadeIn = function (value = 1) {
        isFading = true;
        if (timer != null) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            if (op >= value - 0.05) {
                isFading = false;
                clearInterval(timer);
                timer = null;
                element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, value);
            }
            if (isFading) {
                element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
                op += 0.025;
            }
        }, fadeTime);
    };

    this.fadeOut = function (value = 0) {
        isFading = true;
        if (timer != null) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            if (op <= value + 0.05) {
                isFading = false;
                clearInterval(timer);
                timer = null;
                element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, value + 0.001);
            }
            if (isFading) {
                element.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
                op -= 0.025;
            }
        }, fadeTime);
    };
}


////////////////////////////
/// when a marker is detected during playing do this
////////////////////////////
var oldMarkerIndex;

function onMarkerReached(index) {

    if (index === oldMarkerIndex) return;

    /// debug
    // DisplayPlayerMessage("marker:" + index + " - " + main.markers[index].title);
    logger.log("linkato su marker : " + index + " - " + main.markers[index].title);

    /// fade in-out old placeholders
    if (oldMarkerIndex != null) {
        main.placeholdersMap[oldMarkerIndex].billboardImage.fadeOut();
        logger.log("spengo " + oldMarkerIndex);
    }

    /// fade-in new placeholder
    main.placeholdersMap[index].billboardImage.fadeIn();

    //NON FUNZIONA!

    // /// placeholderMaps
    // if (oldMarkerIndex == null) {
    //     main.placeholdersMap[0].billboardImage.fadeOut();
    // }
    // else{
    //     console.log("placeholdersMap: spengo" + index +" , accendo" + oldMarkerIndex);
    //     main.placeholdersMap[index].billboardImage.fadeOut();
    //     main.placeholdersMap[oldMarkerIndex].billboardImage.fadeIn();
    // }


    logger.log("accendo " + index);
    oldMarkerIndex = index;


    mapController.flyToElement(main.placeholdersPlay[index]);
}


function DisplayPlayerMessage(value) {
    const id = document.getElementById("playerMessage");
    id.style.opacity = 1;
    id.innerHTML = value;

}





/////////////////////////////////////// TEST ///////////////////////////////////
///////////// sync with video
// var lng1 = 12.309487;
// var lat1 = 45.343125;
//
// var lng2 = 12.365823;
// var lat2 = 45.408781;
//
//
// var pos1 = Cesium.Cartesian3.fromDegrees(lng1, lat1);
// var pos2 = Cesium.Cartesian3.fromDegrees(lng2, lat2);
//
//
// var pinTest = viewer.entities.add({
//     position: pos1,
//     billboard: {
//         //image: 'images/pin_icon.png',
//         image: 'images/temp.svg',
//         width: 15,
//         height: 15,
//         //verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//         heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//     }
// });
//
//
//
//
// var iii = 0;
//
// function dolerp() {
//
//
//     iii += 0.05;
//
//     var pos3 = new Cesium.Cartesian3(lerp(pos1.x, pos2.x, iii), lerp(pos1.y, pos2.y, iii), lerp(pos1.z, pos2.z, iii));
//     console.log("LERP: " + pos3);
//
//
//     pinTest.position = pos3;
// }
//
// function lerp(start, end, amt) {
//     return (1 - amt) * start + amt * end
// }
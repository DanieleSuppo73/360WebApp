var camera = viewer.scene.camera;
var cameraProperties = {
  minHeight: 0.4, // in Km
  maxHeight: 35, // in Km
  zoomRate: 7,

  get height() { // in Km
    var cartographic = new Cesium.Cartographic();
    var ellipsoid = viewer.scene.mapProjection.ellipsoid;
    ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);
    return (cartographic.height * 0.001).toFixed(1);
  },

  get range() { // in meters
    /// get the size of the window
    var window = document.getElementById("map");
    // find intersection of ray from camera to the center of the window
    var ellipsoid = viewer.scene.mapProjection.ellipsoid;
    var windowCoordinates = new Cesium.Cartesian2(window.offsetHeight / 2, window.offsetWidth / 2);
    var ray = viewer.camera.getPickRay(windowCoordinates);
    var intersection = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
    var intersectionPoint = Cesium.Ray.getPoint(ray, intersection.start);
    return Cesium.Cartesian3.distance(camera.positionWC, intersectionPoint);
  }
}



$(document).ready(function () {
  // $("button").click(function(){
  //   $("#playerOverlay").slideToggle();
  // });

  // $("#player").hover(function(){
  //   $("#playerOverlay").hide();
  // },
  // function(){
  //   $("#playerOverlay").show();
  // }
  // );


  // $("#player").hover(function(){
  //   $("#map").animate({
  //     width: "toggle"
  //   });
  // });

  //var zoom = 0;
  
  
  var timer;


  


  $("#zoomIn").mousedown(function () {
    $(this).css('opacity', '1');
    if (timer != null) {
      clearInterval(timer);
      timer = null;
      return false;
    }
    timer = setInterval(function () {
      let h = cameraProperties.height;
      if (h >= cameraProperties.minHeight) {
        var zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
        camera.moveForward(zoom);
      }
    }, 10);
    return false;
  })
  $("#zoomIn").mouseup(function () {
    $(this).css('opacity', '0.7');
    clearInterval(timer);
    timer = null;
    return false;
  })
  $("#zoomIn").mouseleave(function () {
    $(this).css('opacity', '0.7');
    clearInterval(timer);
    timer = null;
    return false;
  })




  $("#zoomOut").mousedown(function () {
    $(this).css('opacity', '1');
    if (timer != null) {
      clearInterval(timer);
      timer = null;
      return false;
    }
    timer = setInterval(function () {
      let h = cameraProperties.height;
      if (h <= cameraProperties.maxHeight) {
        var zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
        camera.moveBackward(zoom);
      }
    }, 10);
    return false;
  })
  $("#zoomOut").mouseup(function () {
    $(this).css('opacity', '0.7');
    clearInterval(timer);
    timer = null;
    return false;
  })
  $("#zoomOut").mouseleave(function () {
    $(this).css('opacity', '0.7');
    clearInterval(timer);
    timer = null;
    return false;
  })



  $("#turnLeft").mousedown(function () {
    $(this).css('opacity', '1');

    /// get the size of the window
    var elmnt = document.getElementById("map");
    console.log(elmnt.offsetHeight);
    console.log(elmnt.offsetWidth);


    // find intersection of ray from camera to the center of the window
    var ellipsoid = viewer.scene.mapProjection.ellipsoid;
    var windowCoordinates = new Cesium.Cartesian2(elmnt.offsetHeight / 2, elmnt.offsetWidth / 2);
    var ray = viewer.camera.getPickRay(windowCoordinates);
    var intersection = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
    var intersectionPoint = Cesium.Ray.getPoint(ray, intersection.start);


    /// get the range
    var range = Cesium.Cartesian3.distance(camera.positionWC, intersectionPoint);


    // /// rotate the camera
    // var heading = camera.heading;
    // var pitch = camera.pitch
    // viewer.camera.lookAt(intersectionPoint, new Cesium.HeadingPitchRange(heading, pitch, range));


    console.log("INTERSECTION POINT: " + intersectionPoint);
    console.log("POSITION: " + viewer.scene.pickPosition(windowCoordinates));
    var aaa = viewer.scene.pickPosition(windowCoordinates);








    var pin = viewer.entities.add({
      position: aaa,
      billboard: {
        //image: 'images/pin_icon.png',
        image: 'images/pin_icon.svg',
        width: 5,
        height: 5,
        //verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      }
    });



    //   var heading = viewer.scene.camera.heading;
    //   var pitch = viewer.scene.camera.pitch;




    //   viewer.flyTo(pin, {
    //       offset: new Cesium.HeadingPitchRange(80, pitch, range),
    //       duration: 0
    //   });







    // if (timer != null) {
    //   clearInterval(timer);
    //   timer = null;
    //   return false;
    // }
    // timer = setInterval(function () {
    //   let h = cameraProperties.height;
    //   if (h <= cameraProperties.maxHeight) {
    //     zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
    //     camera.moveBackward(zoom);
    //   }
    // }, 10);
    // return false;
  })

});
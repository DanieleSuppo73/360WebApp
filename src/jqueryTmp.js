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





  //:::::::::::::::::::::::::::::::::::::::::::::::::
  //:::                                           :::
  //:::           CAMERA CONTROLLERS              :::
  //:::                                           :::
  //:::::::::::::::::::::::::::::::::::::::::::::::::


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
    if (timer != null) {
      clearInterval(timer);
      timer = null;
      return false;
    }

    /// get the size of the window
    var elmnt = document.getElementById("map");

    // find intersection of ray from camera to the center of the window
    var ellipsoid = viewer.scene.mapProjection.ellipsoid;
    var windowCoordinates = new Cesium.Cartesian2(elmnt.offsetHeight / 2, elmnt.offsetWidth / 2);
    var ray = viewer.camera.getPickRay(windowCoordinates);
    var intersection = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
    var intersectionPoint = Cesium.Ray.getPoint(ray, intersection.start);

    
    timer = setInterval(function () {
      camera.rotate(intersectionPoint, 0.005);
    }, 10);
    return false;
  })
  $("#turnLeft").mouseup(function () {
    $(this).css('opacity', '0.7');
    clearInterval(timer);
    timer = null;
    return false;
  })
  $("#turnLeft").mouseleave(function () {
    $(this).css('opacity', '0.7');
    clearInterval(timer);
    timer = null;
    return false;
  })

});
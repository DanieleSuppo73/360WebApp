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
    var canvas = viewer.scene.canvas;
    var ellipsoid = viewer.scene.mapProjection.ellipsoid;
    var ray = viewer.camera.getPickRay(new Cesium.Cartesian2(
        Math.round(canvas.clientWidth / 2),
        Math.round(canvas.clientHeight / 2)
    ));
    var intersectionPoint = viewer.scene.globe.pick(ray, viewer.scene);
    return Cesium.Cartesian3.distance(camera.positionWC, intersectionPoint);
  }
};



//:::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                           :::
//:::           CAMERA CONTROLLERS              :::
//:::                                           :::
//:::::::::::::::::::::::::::::::::::::::::::::::::



$(document).ready(function () {
  
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

    /// find intersection of ray from camera (to the center of the window) and 3d terrain
    var elmnt = document.getElementById("map");
    var windowCoordinates = new Cesium.Cartesian2(elmnt.offsetHeight / 2, elmnt.offsetWidth / 2);
    var ray = viewer.camera.getPickRay(windowCoordinates);
    var intersectionPoint = viewer.scene.globe.pick(ray, viewer.scene);


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
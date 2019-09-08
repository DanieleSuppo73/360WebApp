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

  var zoom = 0;
  var camera = viewer.scene.camera;
  var timer;


  var cameraProperties = {
    minHeight: 0.4, // in Km
    maxHeight: 35, // in Km
    zoomRate: 7,
    get height() { // in Km
      var cartographic = new Cesium.Cartographic();
      var ellipsoid = viewer.scene.mapProjection.ellipsoid;
      ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);
      return (cartographic.height * 0.001).toFixed(1);
    }
  }


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
        zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
        viewer.scene.camera.moveForward(zoom);
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
        zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
        viewer.scene.camera.moveBackward(zoom);
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





});
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



  var cameraProperties = {
    minHeight: 0.4,
    maxHeight: 15,
    zoomRate: 7,
    getHeight: function () {
      var cartographic = new Cesium.Cartographic();
      var ellipsoid = viewer.scene.mapProjection.ellipsoid;
      ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);
      return (cartographic.height * 0.001).toFixed(1);
    }
  }


  $("#zoomIn").mousedown(function () {
    timer = setInterval(function () {
      let h = cameraProperties.getHeight();
      if (h >= cameraProperties.minHeight) {
        zoom = Math.pow(h , 1.25) * cameraProperties.zoomRate;
        viewer.scene.camera.moveForward(zoom);
      }
    }, 10);
    return false;
  })
  $("#zoomIn").mouseup(function () {
    clearInterval(timer);
    return false;
  })
  $("#zoomIn").mouseleave(function () {
    clearInterval(timer);
    return false;
  })
  



  $("#zoomOut").mousedown(function () {
    timer = setInterval(function () {
      let h = cameraProperties.getHeight();
      if (h <= cameraProperties.maxHeight) {
        zoom = Math.pow(h , 1.25) * cameraProperties.zoomRate;
        viewer.scene.camera.moveBackward(zoom);
      }
    }, 10);
    return false;
  })
  $("#zoomOut").mouseup(function () {
    clearInterval(timer);
    return false;
  })
  




});
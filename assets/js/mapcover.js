$(document).ready(function readyCB(){
  var mapOptions = {
          center: { lat: -34.397, lng: 150.644},
          zoom: 8
        };
  var map = new google.maps.Map(document.getElementById('mapcover-map'),mapOptions);

});
function initMap() {
  var uluru = {
    lat: -25.363,
    lng: 131.044
  };
  var h = {
    lat: 29.363,
    lng: -95.044
  };
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
  
}

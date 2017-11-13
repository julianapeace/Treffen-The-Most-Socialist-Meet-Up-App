function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: new google.maps.LatLng(29.7604, -95.3698),
    mapTypeId: 'terrain',
  });

  infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here.');
            infoWindow.open(map);
            map.setCenter(pos);

            axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=AIzaSyA0fEoOYqyHqCn0k7w0IhQGjW27eFXhfvc`)
                .then(function(response){
                    console.log(response)
                     ws_address = response.data.results[0].formatted_address

                    // call walk score api here
                    $.getScript( "https://www.walkscore.com/tile/show-walkscore-tile.php" );
                })
                .catch(function(err){
                    console.error(err)
                })

          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }


  map.data.addListener('click', function(event){
   var infoWindow = new google.maps.InfoWindow({
     content: (
       "<strong>Market:</strong> " +
       event.feature.getProperty('MarketName') +
       "<br>" +
       "<strong>Date:</strong> " +
       event.feature.getProperty('Season1Date') +
       "<br>" +
       "<strong>Time:</strong> " +
       event.feature.getProperty('Season1Time') +
       "<br>" +
       "<strong>Address:</strong> " + "<br>" +
       event.feature.getProperty('street') + " " + event.feature.getProperty('city') + " " +
       event.feature.getProperty('State') + " " +
       event.feature.getProperty('zip')
    ),
     pixelOffset: new google.maps.Size(0, -40)
   });
   console.log(event);

    infoWindow.open(map);
    infoWindow.setPosition(event.latLng);
  });

  map.addListener('bounds_changed', function() {
    initialViewPort = map.getBounds();
    minx = initialViewPort.b.b;
    maxx = initialViewPort.b.f;
    miny = initialViewPort.f.b;
    maxy = initialViewPort.f.f;


      myData();

  });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
     }

// Loop through the results array and place a marker for each
// set of coordinates.

function myData(){
    map.data.loadGeoJson('data.geojson')
  //
  // axios.get('/data/test-data.geojson')
  //   .then(function(response){
  //     console.log(response.data)
      // map.data.addGeoJson(response.data)
  //   })
  //   .catch(function(error){
  //     console.log(error)
  //   })
}

// function load_geojson(results) {
//   console.log(results);
//   // FEATURE_TYPE = type;
//   map.data.addGeoJson(results);
//   console.log('GEO JSON Complete');
// }
//
// function add_data () {
//     axios.get(`/data/test-data.geojson`)
//    .then(function (response) {
//
//      crimeMapMarkers = load_geojson(response.data, 'crime');
//    })
//    .catch(function (error) {
//      console.log(error);
//    });
// }


$(document).ready(function () {
// add_data();
});

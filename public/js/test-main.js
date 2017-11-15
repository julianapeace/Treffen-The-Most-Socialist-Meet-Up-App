var map, heatmap, infoWindow;
var ws_address;
var ws_wsid = 'g66cb3dc63cb74226ac55ac06fa465f1f';
// var ws_address = '3302 Canal St., Houston, TX';
var ws_format = 'tall';
var ws_width = '300';
var ws_height = '350';
var FEATURE_TYPE;
var data = 'on';

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
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

  // heatmap = new google.maps.visualization.HeatmapLayer({
  //      data: getPoints(),
  //      map: map,
  //      radius: 20,
  //      opacity: .5
  //    });


  map.data.setStyle(function (feature) {
     if (feature.getProperty('offense') == 'Theft' || feature.getProperty('offense') == 'Burglary' || feature.getProperty('offense') == 'Auto Theft') {
       return {
         icon: '/static/images/non.png'
       }
     }
     else if (feature.getProperty('offense') == 'Aggravated Assault' || feature.getProperty('offense') == 'Murder' || feature.getProperty('offense') == 'Robbery' || feature.getProperty('offense') == 'Rape') {
       return {
         icon: '/static/images/violent_crimes.png'
       }
     }
     else if (feature.getProperty('type') == 'bike') {
       return {
         strokeColor: '#00C7FF',
         strokeOpacity: 1.0,
         strokeWeight: 2
       }
     }

     return {};
   });

  map.data.addListener('addfeature', function (event) {
     event.feature.setProperty('type', FEATURE_TYPE);
  });

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

    if (data == 'on') {
      add_data();
    }
  });
}

////OUTSIDE INIT MAP
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

function load_geojson(results) {
  console.log(results);
  // FEATURE_TYPE = type;
  map.data.addGeoJson(results);
  console.log('GEO JSON Complete');
}

function add_data () {
    axios.get(`/static/data/convertcsv-2.geojson`)
   .then(function (response) {
     crimeMapMarkers = load_geojson(response.data, 'crime');
   })
   .catch(function (error) {
     console.log(error);
   });
}

function hideData() {
    map.data.forEach(function (thing) {
        if (thing.getProperty('type') == 'crime') {
            map.data.remove(thing);
        }
    })
}


$(document).ready(function () {
  $('#sidebarCollapse').click(function () {
    console.log('sidebar toggle');
    $('#sidebar').toggleClass('active');
  });

  $('#crime').on('click', toggle (function (){
      crimes = 'on';
      return add_data();
  }, function (){
      crimes = 'off';
      return hideData();
  }));
  $('#walkscore_button').click(function () {
      console.log('walkscore toggle');
      $('#walkscore_container').toggleClass('active');
   });
});

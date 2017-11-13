var htown = {lat: 25.363, lng: -95.044};
var uluru = {lat: -25.363, lng: 131.044};

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: new google.maps.LatLng(29.7604, -95.3698)
    });

  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });


}

function load_geojson(results) {
  console.log(results);
  map.data.addGeoJson(results);
  console.log('GEO JSON Complete');
}

function add_data () {
    axios.get(`data.geojson`)
   .then(function (response) {
     // load_geojson(response.data)
     crimeMapMarkers = load_geojson(response.data, 'crime');
   })
   .catch(function (error) {
     console.log(error);
   });
}

$("#submit").click(function() {
  $.ajax({
    method: "GET",
    url: "http://45.55.198.11:7777/nearest",
    data: {"zip_codes": $("#zipInput").val()},
    success: function(data) {
      console.log(data);
    }
  })
})

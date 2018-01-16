const importEnv = require('import-env')
var axios = require ('axios')
var geolib = require('geolib')
var Promise = require('bluebird')
const GeoJSON = require('geojson');
var fs = require('fs')
const util = require('util');
const Yelp = require('node-yelp-api-v3');
const yelp = new Yelp({
  consumer_key: process.env.yelp_id,
  consumer_secret: process.env.yelp_secret
});

function cleanZip(inputs){
  var zipCodes = []
  var zipList = inputs.split(',')
  for (i = 0; i < zipList.length; i++) {
    var zip = zipList[i].trim()
    zipCodes.push(zip)
  }
  console.log('Zip Codes: ',zipCodes)
  return zipCodes
}

function promisify(zipCodes){
  let promises = [];
  var GKEY = process.env.GOOGLE_API_KEY
  for (let i = 0; i < zipCodes.length; i++) {
      promises.push(
        new Promise((resolve, reject) => {
          resolve(
            axios.get('https://maps.googleapis.com/maps/api/geocode/json', { params: {components:'postal_code:'+zipCodes[i], key:process.env.GKEY} }))
        })
      );
  }
  // console.log('created promises')
  return promises
}

function get_coords(response){
  var coord = []
  response.forEach((response) => {
    var latitude = response.data.results[0].geometry.location.lat;
    var longitude = response.data.results[0].geometry.location.lng;
    coord.push({latitude,longitude})
  })
  // console.log("Coordinates: ", coord)
  return coord
}

function get_center(coord){
  var center = geolib.getCenter(coord)
  console.log('Center: ', center)
  return center
}

function get_geojson(data){
  var data_geojson = JSON.stringify(GeoJSON.parse(data, {Point: ['lng', 'lat']}),null,2);
  // console.log(util.inspect(data_geojson, {showHidden: false, depth: null}))

  fs.writeFile('public/data/data.geojson', data_geojson, (err)=>{
    if (err) throw err;
    console.log('File has been saved.')
  })
}

function getYelp(center, term, num){
    var data = []
    yelp.searchBusiness({ term: term, latitude: center.latitude, longitude: center.longitude, limit: num})
      .then((results) =>{
        //for each result
        arr = results.businesses
        arr.forEach(function(r){
          // console.log(r)
          var name = r.name
          var img = r.image_url
          var url = r.url
          var address1 = r.location.display_address[0]
          var address2 = r.location.display_address[1]
          var phone = r.display_phone
          var lat = r.coordinates.latitude
          var lng = r.coordinates.longitude
          var category = r.categories[0].alias
          data.push({name: name, img: img, url: url, categories: category, address1:address1, address2:address2, phone:phone, lat:lng, lng:lat})
        })
        // console.log(data)
        console.log('Got Yelp results')
        return data
      })
      .then(data=>{
        get_geojson(data)
      })
      .catch(err=>{console.log(err)})
  }

  function get_matrix(center_input, coord_input){
    // center = { latitude: '39.555215', longitude: '-97.231451' }
    // coord = { latitude: 40.7135097, longitude: -73.9859414 }
    let center_lat = center_input['latitude']
    let center_long= center_input['longitude']

    let coord_lat = coord_input['latitude']
    let coord_long = coord_input['longitude']

    var GKEY = process.env.GOOGLE_MATRIX_KEY
    var arrival_time = 'NULL'

    var google = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${coord_lat},${coord_long}&destinations=${center_lat},${center_long}&key=${GKEY}`

    axios.get(google)
      .then(function(response){
        console.log('Google Distance Matrix:',response.data.rows[0].elements[0]);
      })
      .catch(err=>{console.log(err)});
  }


module.exports = {cleanZip, promisify, get_coords, get_center, getYelp, get_geojson, get_matrix}

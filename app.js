var express = require ('express')
var app = express()
var fs = require('fs')
var axios = require ('axios')
var geolib = require('geolib')
var Promise = require('bluebird')
//docs for geolib: https://www.npmjs.com/package/geolib
const importEnv = require('import-env')
const port = process.env.PORT || 8000;
const body_parser = require('body-parser');
const util = require('util');
const GeoJSON = require('geojson');
const Yelp = require('node-yelp-api-v3');
const yelp = new Yelp({
  consumer_key: process.env.yelp_id,
  consumer_secret: process.env.yelp_secret
});
var Memcached = require('memcached');
var memcached = new Memcached('localhost:8000', {maxKeySize:250});

memcached.set('foo', 'bar', 1000, function (err){
  console.log(err)
});

memcached.get('foo', function (err, data) {
  console.log(data);
});

app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index.hbs');
});
app.post('/zip', function(req, res, next){
  if (!req.body) return res.sendStatus(400)
  var zipCodes = []
  var inputs = req.body.zip
  var zipList = inputs.split(',')
  for (i = 0; i < zipList.length; i++) {
    var zip = zipList[i].trim()
    zipCodes.push(zip)
}
  console.log('Zip Codes: ',zipCodes)
//////////////
  let promises = [];
  var GKEY = process.env.GOOGLE_API_KEY
  for (let i = 0; i < zipCodes.length; i++) {
      promises.push(
        new Promise((resolve, reject) => {
          resolve(
            axios.get('https://maps.googleapis.com/maps/api/geocode/json', { params: {components:'postal_code:'+zipCodes[i], key:process.env.GKEY} }))
        })
        // axios.get('https://maps.googleapis.com/maps/api/geocode/json', { params: {components:'postal_code:'+zipCodes[i], key:process.env.GKEY} })
      );
  }
  // console.log(promises)

  Promise.all(promises).then((response) => {
    var coord = []
    response.forEach((response) => {
      var latitude = response.data.results[0].geometry.location.lat;
      var longitude = response.data.results[0].geometry.location.lng;
      coord.push({latitude,longitude})
    })
    console.log("Coordinates: ", coord)
    console.log('Center: ',geolib.getCenter(coord))
    return geolib.getCenter(coord)
  }).then(response => {
    var data = []
    yelp.searchBusiness({ latitude: response.latitude, longitude: response.longitude, limit: 2})
      .then((results) =>{
        //for each result
        arr = results.businesses
        arr.forEach(function(r){
          console.log(r)
          var name = r.name
          var img = r.image_url
          var url = r.url
          var address1 = r.location.display_address[0]
          var address2 = r.location.display_address[1]
          var phone = r.display_phone
          var lat = r.coordinates.latitude
          var lng = r.coordinates.longitude
          var category = r.categories[0].alias
          data.push({name: name, img: img, url: url, categories: category, address1:address1, address2:address2, phone:phone, lat:lat, lng:lng})
        })
           // console.log(util.inspect(results, {showHidden: false, depth: null}))
        console.log(data)
        var data_geojson = JSON.stringify(GeoJSON.parse(data, {Point: ['lng', 'lat']}), null, 2);
        console.log(util.inspect(data_geojson, {showHidden: false, depth: null}))
        //write to file
        fs.writeFile('data.geojson', data_geojson, (err)=>{
          if (err) throw err;
          console.log('File has been saved.')
        })
      })
      .catch(err=>{console.log(err)})
  })

  res.redirect('/')
});

app.post('/zip2', function(req, res, next){
  // yelp docs: https://www.yelp.com/developers/documentation/v3/business_search
  // node yelp docs: https://github.com/joshuaslate/node-yelp-api
  yelp.searchBusiness({category_filter: 'localflavor', limit:1})
    .then((results) => console.log(util.inspect(results, {showHidden: false, depth: null})))
    .catch(next)

  res.redirect('/')
})

app.post('/google-map', function(req, res, next){
  //documentation link: https://developers.google.com/maps/documentation/distance-matrix/intro#Introduction
  //calculate socialistic distance with arrival time/travel
  var GKEY = process.env.GOOGLE_MATRIX_KEY
  var arrival_time = 'NULL'//potential parameter
  //Note: this api has a traffic_model parameter but i need a google premium plan client id. parameter needs departuretime.
  var google = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=29.7431508,-95.38872|29.77,-95.37&destinations=Houston,TX&key=${GKEY}`

  axios.get(google)
    .then(function(response){
      console.log('from first location',response.data.rows[0].elements[0]);
      console.log('from second location',response.data.rows[1].elements[0]);
      //i can get distance and duration from multiple origins to the same destination
    })
    .catch(next);
  res.redirect('/')
})

app.listen(port, function(){
  console.log('listening on port ' + port)
});

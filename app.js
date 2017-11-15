var tools = require('./operations');
var express = require ('express')
var app = express()
var fs = require('fs')
var axios = require ('axios')
var geolib = require('geolib')
var Promise = require('bluebird')
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
  var inputs = req.body.zip
  var zipCodes = tools.cleanZip(inputs)
  let promises = tools.promisify(zipCodes);

  Promise.all(promises)
  .then(response =>{
    let coords = tools.get_coords(response)
    return coords
  })
  .then(coord =>{
    let center = tools.get_center(coord)
    return center
  })
  .then(center =>{
    tools.getYelp(center, 1)
  })
  .catch(next)

  res.redirect('/')
});

app.post('/category', function(req, res, next){
  // yelp docs: https://www.yelp.com/developers/documentation/v3/business_search
  // node yelp docs: https://github.com/joshuaslate/node-yelp-api
  yelp.searchBusiness({category_filter: 'coffee', limit:1})
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

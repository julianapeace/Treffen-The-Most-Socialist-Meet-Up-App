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
  var matrix = ""
  res.render('index.hbs', {'matrix':matrix});
});
app.get('/yelp', function(req, res){
  axios.get("http://localhost:8000/data/yelp-categories.json")
    .then(results =>{
      console.log(typeof(results))
      // console.log(util.inspect(x, {showHidden: false, depth: null}))
    })
    .catch(err=>{console.log(err)})
})

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
    let term = req.body.term
    tools.getYelp(center, term, 3)
  })
  .catch(next)

  var matrix = tools.get_matrix()
  console.log(matrix)

  res.render('index.hbs', {'matrix':matrix})
});

app.listen(port, function(){
  console.log('listening on port ' + port)
});

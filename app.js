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
  matrix = 'hello' || '';
  distance = 'world' || '';
  res.render('index.hbs', {'matrix':matrix, 'distance': distance});
});

// app.get('/yelp', function(req, res){
//   axios.get("http://localhost:8000/data/yelp-categories.json")
//     .then(results =>{
//       console.log(typeof(results))
//       console.log(util.inspect(results, {showHidden: false, depth: null}))
//     })
//     .catch(err=>{console.log(err)})
// })

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
  .then(coords =>{
    let center = tools.get_center(coords)
    return [center, coords]
  })
  .then(response => {
    let center = response[0]
    let coords = response [1]
    let matrix = tools.get_matrix(center, coords[0])
    return [center, matrix]
  })
  .then(response =>{
    let center = response [0]
    let matrix = response [1]
    let term = req.body.term
    tools.getYelp(center, term, 3)
    console.log('*'*50)
    console.log(matrix)
    res.render('index.hbs', {'matrix':matrix})
  })
  // .catch(next)
  .catch(err=>{console.log(err)})


});

app.listen(port, function(){
  console.log('listening on port ' + port)
});

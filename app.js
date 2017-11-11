var express = require ('express')
var app = express()
var axios = require ('axios')
const importEnv = require('import-env')
const port = process.env.PORT || 8000;
const body_parser = require('body-parser');
const Yelp = require('node-yelp-api-v3');
const yelp = new Yelp({
  consumer_key: process.env.yelp_id,
  consumer_secret: process.env.yelp_secret
});

app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index.hbs');
});

app.post('/zip', function(req, res, next){
  var zip = req.body.zip
  if (!req.body) return res.sendStatus(400)
  var GKEY = process.env.GOOGLE_API_KEY
  var google_api = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${zip}&key=${GKEY}`;

  axios.get(google_api)
    .then(function (response) {
      var lat = response.data.results[0].geometry.location.lat;
      var long = response.data.results[0].geometry.location.lng;
      console.log(lat,long)
      yelp.searchBusiness({ latitude: lat, longitude: long })
        .then((results) => console.log(results))
    })
    .catch(next)

  res.redirect('/')
})

app.listen(port, function(){
  console.log('listening on port ' + port)
});

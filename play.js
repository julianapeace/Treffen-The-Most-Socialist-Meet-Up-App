var GeoJSON = require('geojson')
const util = require('util');
var data = [
  { name: 'Location A', category: 'Store', street: 'Market', lat: 39.984, lng: -75.343 },
  { name: 'Location B', category: 'House', street: 'Broad', lat: 39.284, lng: -75.833 },
  { name: 'Location C', category: 'Office', street: 'South', lat: 39.123, lng: -74.534 }
];

var x = GeoJSON.parse(data, {Point: ['lat', 'lng']});
console.log(util.inspect(x, {showHidden: false, depth: null}))

/////
//yelp api format
////
// name = results.name
// img = results.image_url
// url = results.url
// categories = results.categories[0].alias (or .title)
// location = results.location.display_address
// phone = results.display_phone
// coordinates = results.coordinates

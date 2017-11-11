var express = require ('express')
var app = express()
var axios = require ('axios')
const importEnv = require('import-env')
const port = process.env.PORT || 8000;
const body_parser = require('body-parser');
app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index.hbs');
});

app.listen(port, function(){
  console.log('listening on port ' + port)
});

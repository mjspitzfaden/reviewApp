var express = require('express');
const bodyParser = require('body-parser')
var pgp = require('pg-promise')({
  // initialization options
});
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
const db = pgp({
  database: 'restaurant'
});


app.get('/', function (request, response) {
  response.render('search_form.hbs');
});

app.get('/search', function (request, response) {
  var term = request.query.searchTerm
  console.log('Term:', term);
  db.any(`SELECT * from restaurant WHERE restaurant.name ilike '%${term}%'`)
  .then(function (results) {
    response.render('search_results.hbs', {results: results});
    console.log('results', results);
  });
});

app.get('/restaurant/:id', function (request, response) {
  var term = request.params.id

  response.render('restaurant.hbs');
});

app.get('/search/:search_term?', function (request, response) {
  var term = request.params.search_term
  response.send("This is the page for the search " + term);
});














app.get('*', function(request, response) {
response.send("ERROR 404 PAGE NOT FOUND");
});

app.listen(8000, function () {
  console.log('Listening on port 8000');
});

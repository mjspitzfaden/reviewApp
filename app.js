var express = require('express');
const bodyParser = require('body-parser')
const Promise = require('bluebird');
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

app.get('/search', function (request, response, next) {
  let term = request.query.searchTerm
  console.log('Term:', term);
  db.any(`SELECT * from restaurant WHERE restaurant.name ilike '%${term}%'`)
  .then(function (results) {
    response.render('search_results.hbs', {results: results
  });
  })
  .catch(next);
});

app.get('/restaurant/:id?', function (request, response, next) {
  let term = request.params.id
  console.log('Term:', term);
db.any(`SELECT * from restaurant WHERE restaurant.id = '${term}'`)
.then(function (results) {
  response.render('restaurant.hbs', {results: results
});
    console.log(results)
})
.catch(next);
});

app.post('/submit_review/:id', function(req, resp, next) {
  var restaurantId = req.params.id;
  console.log('restaurant ID', restaurantId);
  console.log('from the form', req.body);
  db.none(`insert into review values
    (default, NULL, ${req.body.stars}, '${req.body.title}', '${req.body.review}', ${restaurantId})`)
    .then(function() {
      resp.redirect(`/restaurant/${restaurantId}`);
    })
    .catch(next);
});

app.get('/search/:search_term?', function (request, response) {
  let term = request.params.search_term
  response.send("This is the page for the search " + term);
});

app.get('*', function(request, response) {
response.send("ERROR 404 PAGE NOT FOUND");
});

app.listen(8000, function () {
  console.log('Listening on port 8000');
});

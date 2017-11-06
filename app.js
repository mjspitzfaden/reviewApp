var express = require('express');
const bodyParser = require('body-parser')
const Promise = require('bluebird');
var pgp = require('pg-promise')({
  // initialization options
});
var app = express();
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/static', express.static('public'))
const db = pgp({
  database: 'restaurant'
});
var pbkdf2 = require('pbkdf2');
var crypto = require('crypto');

function create_hash (password) {
  var salt = crypto.randomBytes(20).toString('hex');
  var key = pbkdf2.pbkdf2Sync(
    password, salt, 36000, 256, 'sha256'
  );
  var hash = key.toString('hex');
  var stored_pass = `pbkdf2_sha256$36000$${salt}$${hash}`;
  return stored_pass;
}

function check_pass (stored_pass, password){
  var pass_parts = stored_pass.split('$');
  var key = pbkdf2.pbkdf2Sync( // make new hash
    password,
    pass_parts[2],
    parseInt(pass_parts[1]),
    256, 'sha256'
  );

  var hash = key.toString('hex');
  if (hash === pass_parts[3]) {
    return true
  }
  else {
    console.log('Passwords do not match')
  }
  return false;
}

app.get('/', function (request, response) {
  response.render('login.hbs');
});

app.post('/', function (request, response, next) {
  let password = request.body.enterpassword;
  let user = request.body.enteremail;
  console.log('password', password);
  console.log('user', user);
  db.any(`SELECT reviewer.password from reviewer WHERE reviewer.email = '%${user}%'`)
  .then(function (results) {
    if (check_pass(results, password)){
    response.render('login.hbs')
  }
    else{
    response.render('search_form.hbs')
  }
  })
  .catch(next);
});



app.post('/signup', function (request, response, next) {
   let password = create_hash(request.body.password);
   console.log(password);
  db.none("insert into reviewer values \
    (default, $1, $2, NULL, $3)", [request.body.name, request.body.email, password])
    .then(function() {
      response.redirect(`/`)    })
    .catch(next);

});


app.get('/search/res', function (request, response) {
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

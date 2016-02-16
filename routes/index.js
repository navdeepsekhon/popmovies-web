var express = require('express');
var router = express.Router();
var https = require('https');


//TODO: Bad; move this out in a separate class
var TMDB_API_KEY = "api_key=YOUR_TMDB_API_KEY"; //request your key from themoviedb.org
var TMDB_BASE_URL ="https://api.themoviedb.org";
var TMDB_POSTER_BASE_URL = "http://image.tmdb.org/t/p/";
var TMDB_POSTER_SIZE = "w500";
var TMDB_POPULAR = "/3/movie/popular";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/hello', function(req, res){
  res.send('Hello from the other side');
});

router.get('/movies', function(req, res){

  var url = TMDB_BASE_URL + TMDB_POPULAR + '?' + TMDB_API_KEY;
  https.get(url, function(resp) {
    var response = '';
    resp.on("data", function(chunk) {
      response += chunk;
    });

    resp.on("end", function(){
      var jsonResponse = JSON.parse(response);
      var movies = [];
        jsonResponse.results.forEach(function (movie) {
            movies.push({
                title: movie.title,
                posterUrl: TMDB_POSTER_BASE_URL + TMDB_POSTER_SIZE + movie.poster_path,
                overview: movie.overview,
                rating: movie.vote_average,
                id: movie.id,
                releaseDate: movie.release_date
            });
        });

      res.send(movies);
    })

  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

})
module.exports = router;

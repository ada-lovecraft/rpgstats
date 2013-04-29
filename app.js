
/**
 * Module dependencies.
 */

var express = require('express')
  , user = require('./routes/user')
  , http = require('http')
  , async = require('async')
  , path = require('path');

var nodeCouchDB = require("node-couchdb");
var couch = new nodeCouchDB('localhost', 8092);

var gameListURL = "_design/dev_games/_view/gamesByTitle";
var playerListURL = "_design/dev_players/_view/playersByName"
var characterListURL = "_design/dev_characters/_view/charactersByName";



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req,res) {
	async.parallel({
		getGames: function(callback) {
			couch.get('rpgstats', gameListURL, function(err,results) {
				callback(err,results);
			});
		},
		getPlayers: function(callback) {
			couch.get('rpgstats', playerListURL, function(err,results) {
				callback(err,results);
			});
		},
		getCharacters: function(callback) {
			couch.get('rpgstats', characterListURL, function(err,results) {
				callback(err,results);
			});
		}
	}, function(err,results) {
		console.log('callback');
		console.dir(results.getGames.data.rows);
		res.render('index', { title: 'RPGStats', games: results.getGames.data.rows, players: results.getPlayers.data.rows, characters: results.getCharacters.data.rows});;
	});
	
});

app.get('/games/:id', function (req,res) {
	async.parallel({
		characters: function(callback) {
			couch.get('rpgstats', req.params.id, function(err,results) {
				console.dir(results.data);
				couch.get('rpgstats',characterListURL,{keys: results.data.characters}, function(err, results) {
					console.log(err);
					console.log(results);
					callback(err,results);
				});
			});
		}
	}, function(err,results) {
		console.log('callback');
		console.dir(results.getGames.data.rows);
		res.render('index', { title: 'RPGStats', characters: characters});;
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


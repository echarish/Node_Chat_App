/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

var mongo = require('mongodb').MongoClient;
var mongoDBPath = 'mongodb://127.0.0.1:27017/test';

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

console.log('Routes '+routes);
app.get('/', routes.index);

console.log('user '+user);
app.get('/users', user.list);


var serve = http.createServer(app);
var io = require('socket.io')(serve);

serve.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

var clients = {};

var socketsOfClients = {};

var clientsLogDetails = {};
var avatarList={};
// var clientsCount=0;

io.on('connection', function(socket) {
	console.log('a user connected');
    avatarList=getFiles('public/images/avatar');

    socket.emit('avatarList',JSON.stringify(avatarList));

	Object.keys(clients).forEach(function(clientId) {
		console.log('Clients are ' + clientId);
	})

	Object.keys(socketsOfClients).forEach(function(sId) {
		console.log('Socket Ids ' + sId);
	})

	mongo.connect(mongoDBPath, function(err, db) {
		if (err) {
			console.warn(err.message);
		} else {
			var collection = db.collection('Global_Chat')
			var stream = collection.find().sort().limit(10).stream();
			stream.on('data', function(chat) {
				console.log('emitting savedGlobalChat chat');
				socket.emit('savedGlobalChat', chat);
			});
		}
	});

	socket.on('set username', function(userDetails) {
        var userName=userDetails.userName;

		if (clients[userName] === undefined) {
			// Does not exist ... so, proceed

			clients[userName] = socket.id;
			socketsOfClients[socket.id] = userName;
			userNameAvailable(socket.id, userName);
			clientsLogDetails[userName] = userDetails;
			userJoined(userDetails);
		} else if (clients[userName] === socket.id) {
			// Ignore for now
		} else {
			userNameAlreadyInUse(socket.id, userName);
		}
	});

	socket.on('disconnect', function() {
		var uName = socketsOfClients[socket.id];
		console.log('user disconnected '+uName+" , "+socket.id);
		delete socketsOfClients[socket.id];
		delete clients[uName];
		delete clientsLogDetails[uName];

		userLeft(uName);
	});

	socket.on('globalChat', function(msg) {
		mongo.connect(mongoDBPath, function(err, db) {
			if (err) {
				console.warn(err.message);
			} else {
				var message = msg.message;
				var sender = msg.sender;
				var sentAt = msg.sentAt;
				var collection = db.collection('Global_Chat');
				collection.insert({
					"message" : message,
					"sender" : sender,
					"sentAt" : sentAt
				}, function(err, o) {
					if (err) {
						console.warn(err.message);
					} else {
						console.log("chat message inserted into db: " + message
								+ " , " + sender + " , " + sentAt);
					}
				});
			}
		});

		socket.broadcast.emit('globalChat', msg);
	});
});

function userJoined(userDetails) {
	Object.keys(socketsOfClients).forEach(function(sId) {
		io.sockets.sockets[sId].emit('userJoined', userDetails);
	})
}

function userLeft(uName) {
	console.log('Userleft called ' + uName);
	io.sockets.emit('userLeft', {
		"userName" : uName
	});
}

function userNameAvailable(sId, uName) {
	setTimeout(function() {
		console.log('Sending welcome msg to ' + uName + ' at ' + sId);
		io.sockets.sockets[sId].emit('welcome', {
			"userName" : uName,
			"currentUsers" : JSON.stringify(clientsLogDetails)
		});
	}, 500);
}

function userNameAlreadyInUse(sId, uName) {
	setTimeout(function() {
		io.sockets.sockets[sId].emit('error', {
			"userNameInUse" : true
		});
	}, 500);
}

function getCurrentTimeDisplay() {
	var time = new Date();
	return time.toLocaleDateString() + " | " + time.toLocaleTimeString()

}

function getFiles (dir, files_){
	files_ = files_ || [];
	var files = fs.readdirSync(dir);
	for (var i in files){
		var name = dir + '/' + files[i];
		if (fs.statSync(name).isDirectory()){
			getFiles(name, files_);
		} else {
			files_.push(name.split(path.sep).slice(-1)[0]);
		}
	}

	return files_;
}


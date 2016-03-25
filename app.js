/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var login = require('./routes/login');
var http = require('http');
var path = require('path');
var fs = require('fs');
var jade = require('jade');

var mongo = require('mongodb').MongoClient;
var mongoDBPath = 'mongodb://127.0.0.1:27017/AXA_COMMUNICATE';

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
app.get('/axacom', routes.index);

console.log('user '+user);
app.get('/users', user.list);

app.get('/signup', function(req, res) {
    var fn = jade.compileFile('views/signup.jade',{});
    var html = fn({});
    res.send(html);
  });

app.post('/signmeup', function(request, response) {
     console.log(request.body.username);
     console.log(request.body.password);
       if (signUpSuccessful(request, response)) {
           response.statusCode = 302;
           response.setHeader("Location", "/axacom?userName="+request.body.username);
           response.end();
       }
  });


var serve = http.createServer(app);
var io = require('socket.io')(serve);

serve.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


var clients = {};

var socketsOfClients = {};

var clientsLogDetails = {};
var avatarList={};
// var clientsCount=0;

var axacom = io.of('/axacom');

axacom.on('connection', function(socket) {
	console.log('a user connected');
    avatarList=getFiles('public/images/avatar');

    socket.emit('avatarList',JSON.stringify(avatarList));

	socket.on('set username', function(userDetails) {
	    console.log('Set Username called');
        var userName=userDetails.userName;

		if (clients[userName] === undefined) {
			// Does not exist ... so, proceed

			clients[userName] = socket.id;
			socketsOfClients[socket.id] = userName;
			userNameAvailable(socket.id, userName);
			clientsLogDetails[userName] = userDetails;
			userJoined(userDetails);
            mongo.connect(mongoDBPath, function(err, db) {
                        if (err) {
                            console.warn(err.message);
                        } else {
                            var collection = db.collection('Global_Chat');
                            var stream = collection.find().sort({"sentAt":-1}).limit(10).stream();
                            stream.on('data', function(chat) {
                                console.log('emitting savedGlobalChat chat');
                                socket.emit('savedGlobalChat', chat);
                            });
                        }
                });
		} else if (clients[userName] === socket.id) {
			// Ignore for now
		} else {
			userNameAlreadyInUse(socket.id, userName);
		}
	});

	socket.on('disconnect', function() {
		var uName = socketsOfClients[socket.id];
		console.log('user disconnected disconnect event called'+uName+" , "+socket.id);
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
				collection.insert(msg, function(err, o) {
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


	socket.on('privateChat', function(msg) {

    		console.log('message - '+msg.message+',  sender - '+msg.sender+',  sentAt - '+msg.sentAt+',  sendTo - '+msg.sendTo);
    		 if(clients[msg.sendTo]!=null){
                console.log('Emmitting private chat to '+msg.sendTo);
    		    axacom.sockets[clients[msg.sendTo]].emit('privateChat', msg);
    		}
    	});


	socket.on('avatarChange', function(msg) {
	    socket.broadcast.emit('avatarChange', msg);
	});



});

function userJoined(userDetails) {
	Object.keys(socketsOfClients).forEach(function(sId) {
		axacom.sockets[sId].emit('userJoined', userDetails);
	})
}

function userLeft(uName) {
	console.log('Userleft called ' + uName);
	axacom.emit('userLeft', {
		"userName" : uName
	});
}

function userNameAvailable(sId, uName) {
	setTimeout(function() {
		console.log('Sending welcome msg to ' + uName + ' at ' + sId);
		axacom.sockets[sId].emit('welcome', {
			"userName" : uName,
			"currentUsers" : JSON.stringify(clientsLogDetails)
		});
	}, 500);
}

function userNameAlreadyInUse(sId, uName) {
	setTimeout(function() {
		axacom.sockets[sId].emit('userNameExists', {
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


function signUpSuccessful(request, response){

    return true;
}
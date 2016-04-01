
var mongoose = require('mongoose');

module.exports = mongoose.model('Chat_User',{
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String
});
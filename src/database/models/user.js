const mongoose = require('mongoose');

module.exports = mongoose.model(
	'user',
	new mongoose.Schema({
		id: String,
		username: String,
		password: String
	})
);

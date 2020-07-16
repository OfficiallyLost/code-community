const mongoose = require('mongoose');
module.exports = mongoose.connect(require('./mongo'), {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

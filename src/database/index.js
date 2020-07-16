const mongoose = require('mongoose');
mongoose.connect(require('./mongo'), {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

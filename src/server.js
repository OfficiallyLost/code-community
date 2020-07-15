const path = require('path');
const express = require('express');
const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.get('/html/signup', (req, res) => {
	res.render('html/signup');
});

app.post('/create', async (req, res) => {
	res.status(200).send(req.body);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

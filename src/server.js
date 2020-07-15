const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userModel = require('./database/models/user');
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.get('/html/signup', (req, res) => {
	res.render('html/signup');
});

app.post('/create', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	if (password.length <= 7) res.render('html/signup', { message: 'Passwords must be longer than 7 characters' });
	if (username.length <= 7) res.render('html/signup', { message: 'Your username must be longer than 7 characters' });
	const user = await userModel.create({
		id: Date.now().toString(),
		username,
		password: await argon2.hash(password)
	});
	res.status(200).send(user);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

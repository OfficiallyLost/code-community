const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const app = express();
const userModel = require('./database/models/user');
const port = 5000;
const database = require('./database/index');
database.then(() => console.log('Connected to the database')).catch((e) => console.error(e));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
   const fetch = require('node-fetch');
   const webhook = await fetch(`https://discord.com/api/channels/734711672043864124/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${require('./token')}` },
      body: JSON.stringify({ name: 'bob' })
   }).then((e) => e.json()).then((e) => { return e });
   console.log(webhook.id)
   const sendWebhook = await fetch(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: `{ "content": "bob" }`
      }).then((e) => e.json()).then((e) => { return e });
   console.log(sendWebhook);
   res.render('html/home');
});

app.get('/signup', (req, res) => {
   res.render('html/signup', { message: '' });
});

app.get('/login', (req, res) => {
   res.render('html/login', { message: '' });
});

app.get('/home', (req, res) => {
	res.render('html/home');
});

app.get('/dashboard', (req, res) => {
	res.render('html/dashboard', { 
      avatar: "https://cdn.discordapp.com/avatars/382368885267234816/889b05352086ceb67fbc85ae44fd37e4.png?size=512",
      username: "Some username", 
      userID: "Some discord user ID",
      about: "Some user about"
   });
});

app.get('/users/:user', async (req, res) => {
   const id = req.params.id;
   const user = await userModel.findOne({ id });
   if (user == null) {
      res.render('html/404', { mesasge: req.path });
   } else {
      const fetch = require('node-fetch');
      res.render('html/dashboard', { user }); 
   }
});

app.get('/verify', async (req, res) => {
   const id = require('shortid');
   const fetch = require('node-fetch');
   const userID = req.body.id;
   if (!userID) return res.render('html/verify', { message: 'You need to provide your Discord ID before continuing.'});
   const user = await getUser(userID);
});

app.post('/create', async (req, res) => {
   const username = req.body.username;
   const password = req.body.password;
   const npassowrd = req.body.confirmPassword;
   try {
   	switch (true) {
   	case password.length <= 7:
   	    res.render('html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case username.toLowerCase() === password.toLowerCase():
   	    res.render('html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case username.toLowerCase().split(' ').some((e) => password.toLowerCase().includes(e)):
   	    res.render('html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case username.toLowerCase() === password.toLowerCase():
   	    res.render('html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case password !== npassowrd:
   	    res.render('html/signup', { message: 'Passwords do not match.'});
   	break;
   	default: 
   	const user = await userModel.create({
   		id: Date.now().toString(),
   		username,
   		password: await argon2.hash(password)
   	});
      res.redirect('/login');
     }
   } catch (e) {
   	console.log(e);
   	res.render('html/signup', { message: 'An error occured, please try again.'});
   }
});

app.post('/login', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const user = await userModel.findOne({ username });
	if (user === null) return res.render('html/login', { message: 'That account does not exist.'});
	try {
		if (await argon2.verify(user.password, password)) {
			res.render('html/dashboard', { user });
		} else {
			res.render('html/login', { message: 'That password does not match the accounts password.'});
		}
	} catch (e) {
		console.error(e);
		res.render('html/login', { message: 'An internal error occured. Please try again.'});
	}
});

app.get('*', (req, res) => {
   res.render('html/404', { message: req.path });
});

async function getUser(userID) {
   const fetch = require('node-fetch');
   const user = await fetch(`https://discord.com/api/users/${userID}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${require('./token')}` } 
   }).then((e) => e.json());
   return user;
}
async function creaeWebhook(channelID, name, avatar) {
   const fetch = require('node-fetch');
   const webhook = await fetch(`https://discord.com/api/channels/${channelID}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${require('./token')}` },
      body: JSON.stringify(name)
   }).then((e) => e.json());
   return webhook;
}
async function sendWebhok(content, username, avatarURL, webhook) {
   // console.log(webhook);
   // const fetch = require('node-fetch');
   // const hook = await fetch(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`, {
   // method: 'post',
   // body: { content, username, avatar_url: avatarURL }
   // }).then((e) => e.json());
   // return hook;
}
app.listen(port, () => console.log(`Listening on port ${port}`));
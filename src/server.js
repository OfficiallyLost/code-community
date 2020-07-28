const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const app = express();
const userModel = require('./database/models/user');
const port = 5000;
const id = require('shortid');
const database = require('./database/index');
const limit = require('express-rate-limit');
const limiter = limit({
  windowMs: 1000, 
  max: 3, 
  message: `Please try again later. continuing to do so, will get your IP banned from accessing the site.`
});
const norm = limit({
   windowMs: 1000,
   max: 2
});

database.then(() => console.log('Connected to the database')).catch((e) => console.error(e));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.get('/', norm, async (req, res) => {
   res.render('html/home');
});

app.get('/signup', norm,  (req, res) => {
   res.render('html/signup', { message: '' });
});

app.get('/login', norm, (req, res) => {
   res.render('html/login', { message: '' });
});

app.get('/home', norm, (req, res) => {
	res.render('html/home');
});

app.get('/users/:user', norm, async (req, res) => {
   const id = req.params.user;
   const user = await userModel.findOne({ id });

   if (user == null) {
      res.render('html/404', { message: req.path });
   } else if (user.verified) {
      res.redirect(`/verify/${user.id}`)
   } else {
      const discord = await getUser(user.discordID);
      res.render('html/dashboard', {
         username: user.username,
         avatar: `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`,
         id: user.id,
         userID: discord.id,
         about: user.about ? user.about : 'You do not have an about.'
      });
   }
});

app.get('/verify/:user', norm, async (req, res) => {
   const user = await userModel.findOne({ id: req.params.user });
   if (user == null) return res.render('html/404', { message: req.path });
   if (user.verified) return res.render('html/404', { message: req.path });
    res.render('html/verify', { message: '', code: '', id: user.id });
});

app.post('/users/:user', limiter, async (req, res) => {
   const userID = req.body.discordID;
   const userP = await userModel.findOne({ id: req.params.user });
   if (userP === null) return res.render('html/404', { message: req.path });
   if (!userID) return res.render('html/verify', { message: 'You need to provide your Discord ID before continuing. ', id: userP.id });
   const user = await getUser(userID);
   if (!user) return res.render('html/verify', { message: 'You need to provide your Discord ID before continuing.' });
      if (('code' in user)) {
         const code = await id.generate();
         res.render('html/verify', { message: '', code, id: userP.id });
         const webhook = await createWebhook('735455517509681195', userP.username, `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`);
         await sendWebhook(`**ID:** \`${userP.id}\` | **Discord ID:** \`${user.id}\` | **Code:** \`${code}\``, `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`, webhook);
         setTimeout(async() => {
            await deleteWebhook(webhook.id);
            console.log('done');
         }, 10000);
      } else {
         res.render('html/verify', { message: 'You meed to provide a valid ID.', code: '', id: userP.id });
      }
});

app.post('/create', limiter, async (req, res) => {
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
      case username.includes(' '):
          res.render('html/signup', { message: 'You cannot have spaces in your username '});
      break;
      case password.includes(' '):
          res.render('html/signup', { message: 'You cannot have spaces in your password', username });
      break;

   	default: 
   	const user = await userModel.create({
   		id: Date.now().toString(),
   		username,
   		password: await argon2.hash(password)
   	});
      return res.redirect(`/verify/${user.id}`);
     }
   } catch (e) {
   	console.log(e);
   	res.render('html/signup', { message: 'An error occured, please try again.'});
   }
});

app.post('/login', limiter, async (req, res) => {
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

app.get('*', norm, (req, res) => {
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
async function createWebhook(channelID, name, avatar) {
   const fetch = require('node-fetch');
   const webhook = await fetch(`https://discord.com/api/channels/${channelID}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${require('./token')}` },
      body: `{ "name": "${name}" }`
   });
   return await webhook.json();
}
async function deleteWebhook(webhookID) {
   const fetch = require('node-fetch');
   const deleteHook = await fetch(`https://discord.com/api/webhooks/${webhookID}`,{
      method: 'delete',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${require('./token')}` }
   });
   return await deleteHook.text();
}

async function sendWebhook(content, avatarURL, webhook) {
   const fetch = require('node-fetch');
   const hook = await fetch(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: `{ "content": "${content}", "username": "${webhook.name}", "avatar_url": "${avatarURL}" }`
      });
   return await hook.json();
}

app.listen(port, () => console.log(`Listening on port ${port}`)); 
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

app.get('/html/signup', (req, res) => {
   res.render('html/signup');
});

app.post('/create', async (req, res) => {
   const username = req.body.username;
   const password = req.body.password;
   const npassowrd = req.body.confirmPassword;
   switch (true) {
   	case password.length <= 7:
   	    res.render('/html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case username.toLowerCase() === password.toLowerCase():
   	    res.render('/html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case username.toLowerCase().split(' ').some((e) => password.toLowerCase().includes(e)):
   	    res.render('/html/signup', { message: 'That password is not strong enough.'});
   	break;
   	case username.toLowerCase() === password.toLowerCase():
   	    res.render('/html/signup', { message: 'That password is not strong enough.'});
   	break;
   }
   const user = await userModel.create({
      id: Date.now().toString(),
      username,
      password: await argon2.hash(password)
   });

   await user.save();

   res.status(200).send(user);
});

app.post('/login', async (req, res) => {

});


app.listen(port, () => console.log(`Listening on port ${port}`));
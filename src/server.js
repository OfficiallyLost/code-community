const path = require("path");
const express = require("express");
const app = express();
const port = 5000;

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.get('/html/signup', (req, res) => {
   res.render('html/signup'); 
});

app.use(express.static(path.join(__dirname, 'public')))

app.listen(port, () => console.log(`Listening on port ${port}`));
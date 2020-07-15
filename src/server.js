const app = express();
const port = 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

app.get('/home', (req, res) => {
   res.render('home'); 
});
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Listening on port ${port}`));
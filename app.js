const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();

// File path
const DATA_PATH = path.join(__dirname, 'data.json');

// Load initial data
let { products, totalEarnings } = fs.existsSync(DATA_PATH)
  ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  : { products: [], totalEarnings: 0 };

// Helper to save data to file
function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ products, totalEarnings }, null, 2));
}

// EJS views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Session for login
app.use(session({
  secret: 'secretpass',
  resave: false,
  saveUninitialized: false
}));

// Route for the login page
app.get('/login', (req, res) => {
  res.render('login', { error: null }); // This should render the login page
});

// Handle login post request
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if login credentials match
  if (username === 'admin' && password === 'password') {
    req.session.loggedIn = true;  // Set session to logged in
    res.redirect('/');  // Redirect to the homepage (inventory)
  } else {
    res.render('login', { error: 'Incorrect username or password.' });  // Show error on login page
  }
});

// Middleware to require login for protected routes
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    return next();  // Continue to the route
  }
  res.redirect('/login');  // Redirect to login if not logged in
}

// Inventory Routes
app.get('/', requireLogin, (req, res) => {
  res.render('index', { products: products.filter(p => !p.archived), totalEarnings });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

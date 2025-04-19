const express = require('express');
const session = require('express-session');
const app = express();

// Middleware for parsing POST request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Serve static files (for CSS, JS, etc.)
app.use(express.static('public'));

// Login route (GET)
app.get('/login', (req, res) => {
  res.render('login', { error: null });  // Render login page with no error initially
});

// Handle login form submission (POST)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Basic login validation (replace with your own logic)
  if (username === 'admin' && password === 'password') {
    req.session.loggedIn = true;  // Set session to logged in
    res.redirect('/');  // Redirect to the homepage (inventory page, for example)
  } else {
    res.render('login', { error: 'Incorrect username or password.' });  // Pass error message
  }
});

// Check if the user is logged in
function requireLogin(req, res, next) {
  if (!req.session.loggedIn) {
    return res.redirect('/login');  // Redirect to login page if not logged in
  }
  next();
}

// Example protected route (inventory)
app.get('/', requireLogin, (req, res) => {
  res.render('inventory');  // Render inventory page if logged in
});

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

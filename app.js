const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session management
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index');  // Renders the home page
});

// Login Route
app.get('/login', (req, res) => {
  res.render('login');  // Renders the login page
});

// Post Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {  // Simple check for login
    req.session.loggedIn = true;
    res.redirect('/inventory');  // Redirect to inventory page on success
  } else {
    res.render('login', { error: 'Invalid username or password' });  // Show error message
  }
});

// Inventory Route (only accessible if logged in)
app.get('/inventory', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');  // Redirect to login if not logged in
  }
  res.render('inventory');  // Show the inventory page
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

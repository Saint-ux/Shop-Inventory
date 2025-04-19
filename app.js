const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set views and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Mock user data (replace this with your actual user validation)
const users = {
    admin: 'password', // Example: admin with password 'password'
};

// Route for showing the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Route for handling the login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple user validation (replace with actual validation)
    if (users[username] && users[username] === password) {
        req.session.user = username; // Store username in session
        res.redirect('/inventory');  // Redirect to inventory page after login
    } else {
        // Pass the error message to the login.ejs template
        res.render('login', { error: 'Invalid username or password' });
    }
});

// Route for the inventory page (just a placeholder)
app.get('/inventory', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login if user is not logged in
    }
    res.render('inventory'); // Render the inventory page (create this view later)
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

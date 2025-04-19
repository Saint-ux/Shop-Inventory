const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();

const DATA_PATH = path.join(__dirname, 'data.json');

// Safe load of data with fallback
let products = [];
let totalEarnings = 0;

if (fs.existsSync(DATA_PATH)) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    products = Array.isArray(data.products) ? data.products : [];
    totalEarnings = typeof data.totalEarnings === 'number' ? data.totalEarnings : 0;
  } catch (err) {
    console.error('Failed to parse data.json. Resetting data.');
  }
}

// Save helper
function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ products, totalEarnings }, null, 2));
}

// Set EJS and middleware
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

// Auth middleware
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect('/login');
}

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.loggedIn = true;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Incorrect username or password.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Home - inventory view
app.get('/', requireLogin, (req, res) => {
  res.render('index', {
    products: products.filter(p => !p.archived),
    totalEarnings
  });
});

// Add product
app.post('/add-product', requireLogin, (req, res) => {
  const { name, code, price, stock } = req.body;
  products.push({
    id: Date.now(),
    name,
    code,
    price: parseFloat(price),
    stock: parseInt(stock),
    archived: false
  });
  saveData();
  res.redirect('/');
});

// Sell product
app.post('/sell', requireLogin, (req, res) => {
  const { product_id, quantity } = req.body;
  const product = products.find(p => p.id == product_id);
  const qty = parseInt(quantity);

  if (product && product.stock >= qty) {
    product.stock -= qty;
    totalEarnings += product.price * qty;
    saveData();
    res.redirect('/');
  } else {
    res.send('Not enough stock.');
  }
});

// Edit product
app.post('/edit-product', requireLogin, (req, res) => {
  const { product_id, newPrice, newStock } = req.body;
  const product = products.find(p => p.id == product_id);
  if (product) {
    product.price = parseFloat(newPrice);
    product.stock = parseInt(newStock);
    saveData();
  }
  res.redirect('/');
});

// Archive product
app.post('/archive-product', requireLogin, (req, res) => {
  const product = products.find(p => p.id == req.body.product_id);
  if (product) {
    product.archived = true;
    product.stock = 0;
    saveData();
  }
  res.redirect('/');
});

// Archived products view
app.get('/archived', requireLogin, (req, res) => {
  res.render('archived', {
    products: products.filter(p => p.archived)
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

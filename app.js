const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const dataPath = path.join(__dirname, 'data.json');

// Load products from data.json
let products = [];
let totalEarnings = 0;

if (fs.existsSync(dataPath)) {
  const rawData = fs.readFileSync(dataPath);
  products = JSON.parse(rawData);
}

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Save to data.json helper
function saveData() {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
}

// Home route: Display active products
app.get('/', (req, res) => {
  res.render('index', {
    products: products.filter(product => !product.archived),
    totalEarnings: totalEarnings
  });
});

// Add new product route
app.post('/add-product', (req, res) => {
  const { name, code, price, stock } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    code,
    price: parseFloat(price),
    stock: parseInt(stock),
    archived: false
  };
  products.push(newProduct);
  saveData();
  res.redirect('/');
});

// Sell product route
app.post('/sell', (req, res) => {
  const { product_id, quantity } = req.body;
  const product = products.find(p => p.id == product_id);

  if (product && product.stock >= quantity) {
    product.stock -= quantity;
    const earnings = product.price * quantity;
    totalEarnings += earnings;
    saveData();
    res.redirect('/');
  } else {
    res.send('Not enough stock available.');
  }
});

// Edit product route
app.post('/edit-product', (req, res) => {
  const { product_id, newPrice, newStock } = req.body;
  const product = products.find(p => p.id == product_id);

  if (product) {
    product.price = parseFloat(newPrice);
    product.stock = parseInt(newStock);
    saveData();
  }
  res.redirect('/');
});

// Archive product route
app.post('/archive-product', (req, res) => {
  const { product_id } = req.body;
  const product = products.find(p => p.id == product_id);

  if (product) {
    product.archived = true;
    product.stock = 0;
    saveData();
  }

  res.redirect('/');
});

// Show archived products route
app.get('/archived', (req, res) => {
  res.render('archived', { products: products.filter(product => product.archived) });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

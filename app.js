const express = require('express');
const app = express();
const path = require('path');

// Sample data for products
let products = [
  { id: 1, name: 'Leather Jacket', code: '42', price: 2500, stock: 10, archived: false },
  { id: 2, name: 'Winter Jacket', code: '43', price: 1800, stock: 15, archived: false },
];

let totalEarnings = 0;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Home route: Display active products
app.get('/', (req, res) => {
  res.render('index', { products: products.filter(product => !product.archived), totalEarnings: totalEarnings });
});

// Add new product route
app.post('/add-product', (req, res) => {
  const { name, code, price, stock } = req.body;
  const newProduct = {
    id: products.length + 1,  // Incremental ID
    name,
    code,
    price: parseFloat(price),
    stock: parseInt(stock),
    archived: false // New products are not archived by default
  };
  products.push(newProduct);
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
  }
  res.redirect('/');
});

// Archive product route (instead of delete)
app.post('/archive-product', (req, res) => {
  const { product_id } = req.body;
  const product = products.find(p => p.id == product_id);

  if (product) {
    product.archived = true;  // Flag as archived
    product.stock = 0;  // Optionally set stock to 0 to indicate it's no longer available
  }

  res.redirect('/');
});

// Show archived products route
app.get('/archived', (req, res) => {
  res.render('archived', { products: products.filter(product => product.archived) });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

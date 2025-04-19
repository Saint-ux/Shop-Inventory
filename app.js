const express = require('express');
const app = express();
const path = require('path');

// Example products (replace this with your actual data source)
const products = [
    { name: 'Product 1', code: 'P001', price: 100 },
    { name: 'Product 2', code: 'P002', price: 200 },
    { name: 'Product 3', code: 'P003', price: 300 },
];

// Set up the views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files like stylesheets
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the main page (index)
app.get('/', (req, res) => {
    // Calculate total earnings
    const totalEarnings = products.reduce((sum, product) => sum + product.price, 0);
    
    // Render the index page and pass both totalEarnings and products
    res.render('index', { totalEarnings, products });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

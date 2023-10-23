const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/mindxcuoiky', { useNewUrlParser: true, useUnifiedTopology: true });

const inventorySchema = new mongoose.Schema({
  sku: String,
  description: String,
  instock: Number
});
const Inventory = mongoose.model('Inventory', inventorySchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  item: String,
  price: Number,
  quantity: Number
});
const Order = mongoose.model('Order', orderSchema);


// JWT Secret Key
const JWT_SECRET_KEY = 'mysecretkey';

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// API Endpoints

// Import data to MongoDB
app.post('/import', async (req, res) => {
  try {
    await Order.insertMany(req.body.orders);
    await Inventory.insertMany(req.body.inventory);
    await User.insertMany(req.body.users);
    res.send('Data imported to MongoDB successfully.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API to get all products in inventory
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Inventory.find({});
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API to get products with low quantity
app.get('/api/products/lowquantity', authenticateToken, async (req, res) => {
  try {
    const products = await Inventory.find({ instock: { $lt: 100 } });
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API login and token generation
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.sendStatus(401);

  const token = jwt.sign({ username }, JWT_SECRET_KEY);
  res.json({ token });
});

// API to get orders with product descriptions
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({});
    const ordersWithDescriptions = await Promise.all(orders.map(async (order) => {
      const product = await Inventory.findOne({ sku: order.item });
      return { ...order.toObject(), productDescription: product ? product.description : null };
    }));
    res.json(ordersWithDescriptions);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT=3000;
app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});

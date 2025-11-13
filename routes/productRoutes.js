const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ order: 1, createdAt: 1 }); // Sort by order first
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product order
router.put('/reorder', async (req, res) => {
  try {
    const { productOrders } = req.body; // Array of { id, order }
    
    // Update each product's order in parallel
    await Promise.all(
      productOrders.map(({ id, order }) =>
        Product.findByIdAndUpdate(id, { order })
      )
    );
    
    res.json({ message: 'Product order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
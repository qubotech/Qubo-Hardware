import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Reorder products
router.put('/reorder', async (req, res) => {
  try {
    const { productOrders } = req.body;
    
    console.log('Reorder request received:', productOrders);

    if (!productOrders || !Array.isArray(productOrders)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product orders' 
      });
    }

    // Update each product's displayOrder
    const updatePromises = productOrders.map(({ id, displayOrder }) => 
      Product.findByIdAndUpdate(
        id, 
        { displayOrder }, 
        { new: true }
      )
    );

    await Promise.all(updatePromises);
    
    console.log('Products reordered successfully');
    
    res.json({ 
      success: true, 
      message: 'Product order updated successfully' 
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all products sorted by displayOrder
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .sort({ displayOrder: 1, createdAt: 1 });
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;

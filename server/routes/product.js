import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Reorder products
router.put('/reorder', async (req, res) => {
  try {
    const { productOrders } = req.body;
    
    console.log('Received reorder request:', productOrders);
    
    const bulkOps = productOrders.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder } }
      }
    }));
    
    await Product.bulkWrite(bulkOps);
    
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .sort({ displayOrder: 1, createdAt: 1 });
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

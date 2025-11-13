import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { 
  addProduct, 
  changeStock, 
  productById, 
  productList, 
  editProduct, 
  deleteProduct,
  getProductDisplayOrder,
  updateProductDisplayOrder,
  toggleBestSeller
} from '../controllers/productController.js';
import Product from '../models/Product.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);
productRouter.get('/list', productList);
productRouter.get('/id', productById);
productRouter.post('/stock', authSeller, changeStock);
productRouter.post('/edit', upload.array(["images"]), authSeller, editProduct);
productRouter.delete('/delete/:id', authSeller, deleteProduct);
productRouter.get('/display-order', authSeller, getProductDisplayOrder);
productRouter.post('/update-order', authSeller, updateProductDisplayOrder);
productRouter.post('/best-seller', authSeller, toggleBestSeller);

// Add this new route for reordering products
productRouter.put('/reorder', async (req, res) => {
    try {
        const { productOrders } = req.body;
        
        if (!productOrders || !Array.isArray(productOrders)) {
            return res.json({ 
                success: false, 
                message: 'Invalid product orders data' 
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

// Update your existing GET route to sort by displayOrder
// Find the route that fetches all products and modify it:
productRouter.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category')
            .sort({ displayOrder: 1, createdAt: 1 }); // Sort by displayOrder first
        
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default productRouter;
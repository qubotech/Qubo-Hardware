import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();

// Import routes
import userRoutes from './routes/userRoutes.js';
import productRoute from './routes/productRoute.js';

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Make sure this line exists!
app.use('/api/user', userRoutes);
app.use('/api/product', productRoute);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Database connection error:', err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
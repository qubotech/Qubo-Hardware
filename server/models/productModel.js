import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    variants: [
        {
            weight: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            offerPrice: {
                type: Number,
                required: true
            }
        }
    ],
    image: [
        {
            type: String,
            required: true
        }
    ],
    inStock: {
        type: Boolean,
        default: true
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model("Product", productSchema);
export default Product;

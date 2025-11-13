import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddProduct = () => {
    const { axios, fetchProducts, categories } = useAppContext();
    
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        category: '',
        variants: [{ weight: '', unit: 'gm', price: '', offerPrice: '' }]
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 4) {
            toast.error('Maximum 4 images allowed');
            return;
        }
        
        setImages([...images, ...files]);
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...previews]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const addVariant = () => {
        setProductData({
            ...productData,
            variants: [...productData.variants, { weight: '', unit: 'gm', price: '', offerPrice: '' }]
        });
    };

    const removeVariant = (index) => {
        if (productData.variants.length === 1) {
            toast.error('At least one variant is required');
            return;
        }
        const newVariants = productData.variants.filter((_, i) => i !== index);
        setProductData({ ...productData, variants: newVariants });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...productData.variants];
        newVariants[index][field] = value;
        setProductData({ ...productData, variants: newVariants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!productData.name || !productData.description || !productData.category) {
            toast.error('Please fill all required fields');
            return;
        }
        
        if (images.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        const formData = new FormData();
        formData.append('productData', JSON.stringify(productData));
        images.forEach(image => formData.append('images', image));

        try {
            const { data } = await axios.post('/api/product/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success(data.message);
                // Reset form
                setProductData({
                    name: '',
                    description: '',
                    category: '',
                    variants: [{ weight: '', unit: 'gm', price: '', offerPrice: '' }]
                });
                setImages([]);
                setImagePreviews([]);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add product');
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Add New Product</h1>
                    <p className="text-gray-500">Fill in the details below to add a new product to your store</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Images Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Product Images
                        </h2>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img 
                                        src={preview} 
                                        alt={`Preview ${index + 1}`} 
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            
                            {imagePreviews.length < 4 && (
                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-xs text-gray-500 text-center px-2">Upload Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Upload up to 4 product images (JPG, PNG). First image will be the main image.</p>
                    </div>

                    {/* Basic Information Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Basic Information
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={productData.name}
                                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="e.g., Fresh Organic Cauliflower"
                                    required
                                />
                            </div>

                            {/* Product Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={productData.description}
                                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                                    placeholder="Describe your product, its quality, benefits, and any special features..."
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={productData.category}
                                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Variants Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Product Variants (Sizes/Weights)
                            </h2>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Variant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {productData.variants.map((variant, index) => (
                                <div key={index} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700">Variant #{index + 1}</span>
                                        {productData.variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(index)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {/* Weight */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                Weight/Size <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={variant.weight}
                                                onChange={(e) => updateVariant(index, 'weight', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                                                placeholder="500"
                                                required
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                Unit <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={variant.unit}
                                                onChange={(e) => updateVariant(index, 'unit', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm bg-white"
                                            >
                                                <option value="gm">grams (gm)</option>
                                                <option value="kg">kilograms (kg)</option>
                                                <option value="ml">milliliters (ml)</option>
                                                <option value="ltr">liters (ltr)</option>
                                                <option value="pcs">pieces (pcs)</option>
                                            </select>
                                        </div>

                                        {/* MRP */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                MRP (₹) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                                                placeholder="100"
                                                required
                                            />
                                        </div>

                                        {/* Offer Price */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                Offer Price (₹) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={variant.offerPrice}
                                                onChange={(e) => updateVariant(index, 'offerPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                                                placeholder="80"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dull transition-colors font-semibold text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Product
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setProductData({
                                    name: '',
                                    description: '',
                                    category: '',
                                    variants: [{ weight: '', unit: 'gm', price: '', offerPrice: '' }]
                                });
                                setImages([]);
                                setImagePreviews([]);
                            }}
                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;

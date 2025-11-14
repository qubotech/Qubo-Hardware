import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ProductList = () => {
    const { products, currency, axios, fetchProducts, categories } = useAppContext()

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filterCategories] = useState(['All', 'PC Builds', 'Monitors', 'Pheripherals', 'Internals', 'Gaming', 'Accessories', 'Combos']);

    const [draggedItem, setDraggedItem] = useState(null);
    const [localProducts, setLocalProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setLocalProducts(products);
    }, [products]);

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.4';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedItem === null || draggedItem === index) return;

        const newProducts = [...localProducts];
        const draggedProduct = newProducts[draggedItem];
        
        newProducts.splice(draggedItem, 1);
        newProducts.splice(index, 0, draggedProduct);
        
        setDraggedItem(index);
        setLocalProducts(newProducts);
    };

    const handleDragEnd = async (e) => {
        e.currentTarget.style.opacity = '1';
        
        const productOrders = localProducts.map((product, index) => ({
            id: product._id,
            displayOrder: index
        }));

        try {
            const { data } = await axios.put('/api/product/reorder', { productOrders });
            if (data.success) {
                toast.success('Product order updated successfully');
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Failed to save product order');
        }

        setDraggedItem(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
    };

    const moveProductUp = async (index) => {
        if (index === 0) return; // Already at top
        
        const newProducts = [...localProducts];
        [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
        setLocalProducts(newProducts);
        
        await saveProductOrder(newProducts);
    };

    const moveProductDown = async (index) => {
        if (index === localProducts.length - 1) return; // Already at bottom
        
        const newProducts = [...localProducts];
        [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
        setLocalProducts(newProducts);
        
        await saveProductOrder(newProducts);
    };

    const saveProductOrder = async (products) => {
        const productOrders = products.map((product, index) => ({
            id: product._id,
            displayOrder: index
        }));

        try {
            const { data } = await axios.put('/api/product/reorder', { productOrders });
            if (data.success) {
                toast.success('Product order updated successfully');
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Failed to save product order');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct({
            ...product,
            category: product.category?._id || product.category,
            description: Array.isArray(product.description) ? product.description : [product.description]
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            const { data } = await axios.delete(`/api/product/delete/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        }
    };

    const toggleStock = async (id, inStock) => {
        try {
            const { data } = await axios.post('/api/product/stock', { id, inStock });
            if (data.success) {
                fetchProducts();
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const toggleBestSeller = async (id, isBestSeller) => {
        try {
            const { data } = await axios.post('/api/product/best-seller', { id, isBestSeller });
            if (data.success) {
                fetchProducts();
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleEditSubmit = async () => {
        const formData = new FormData();
        formData.append("productData", JSON.stringify(editingProduct));
        formData.append("id", editingProduct._id);
        if (editingProduct.newImages) {
            for (let i = 0; i < editingProduct.newImages.length; i++) {
                formData.append("images", editingProduct.newImages[i]);
            }
        }

        const { data } = await axios.post(
            "/api/product/edit",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        if (data.success) {
            toast.success(data.message);
            fetchProducts();
            setIsEditModalOpen(false);
            setEditingProduct(null);
        } else {
            toast.error(data.message);
        }
    };

    const addVariant = () => {
        setEditingProduct({
            ...editingProduct,
            variants: [...editingProduct.variants, { weight: '', unit: 'gm', price: '', offerPrice: '' }]
        });
    };

    const removeVariant = (index) => {
        if (editingProduct.variants.length === 1) {
            toast.error('At least one variant is required');
            return;
        }
        const newVariants = editingProduct.variants.filter((_, i) => i !== index);
        setEditingProduct({ ...editingProduct, variants: newVariants });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...editingProduct.variants];
        newVariants[index][field] = value;
        setEditingProduct({ ...editingProduct, variants: newVariants });
    };

    // Filter products based on selected category
    const filteredProducts = selectedCategory === 'All' 
        ? localProducts 
        : localProducts.filter(product => {
            const categoryName = product.category?.name?.toLowerCase() || '';
            const selectedLower = selectedCategory.toLowerCase();
            return categoryName.includes(selectedLower) || categoryName === selectedLower;
        });

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="w-full p-6 md:p-10">
                {/* Header with enhanced design */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                Product Inventory
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Manage your product inventory and stock status
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">{products.length} Products</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Category Filter Tabs */}
                <div className="mb-8 relative">
                    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                        {filterCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`relative px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                                }`}
                            >
                                <span className="relative z-10">{category}</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    selectedCategory === category
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {category === 'All' 
                                        ? products.length 
                                        : products.filter(p => {
                                            const catName = p.category?.name?.toLowerCase() || '';
                                            const filterLower = category.toLowerCase();
                                            return catName.includes(filterLower) || catName === filterLower;
                                        }).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Enhanced Products Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-green-500">
                                <tr>
                                    <th className="px-4 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                            No.
                                        </div>
                                    </th>
                                    <th className="px-4 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-28">
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                            Reorder
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[250px]">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            Product Details
                                        </div>
                                    </th>
                                    <th className="px-4 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-36">
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Category
                                        </div>
                                    </th>
                                    <th className="px-4 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-24">
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            Featured
                                        </div>
                                    </th>
                                    <th className="px-4 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-36">
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Availability
                                        </div>
                                    </th>
                                    <th className="px-4 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-36">
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                            Actions
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                </div>
                                                <p className="text-xl font-semibold text-gray-600 mb-2">No products found</p>
                                                <p className="text-sm text-gray-500">Add your first product to get started with your inventory</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product, index) => (
                                        <tr 
                                            key={product._id} 
                                            draggable={true}
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onDrop={handleDrop}
                                            className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
                                            style={{
                                                cursor: 'grab',
                                                opacity: draggedItem === index ? 0.5 : 1,
                                                backgroundColor: draggedItem === index ? '#f0fdf4' : 'transparent'
                                            }}
                                        >
                                            <td className="px-4 py-5 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm shadow-md">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => moveProductUp(index)}
                                                        disabled={index === 0}
                                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                                            index === 0
                                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                                : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-110 active:scale-95'
                                                        }`}
                                                        title="Move up"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => moveProductDown(index)}
                                                        disabled={index === filteredProducts.length - 1}
                                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                                            index === filteredProducts.length - 1
                                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                                : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-110 active:scale-95'
                                                        }`}
                                                        title="Move down"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-gray-400 hover:text-green-600 cursor-grab flex-shrink-0 transition-colors" title="Drag to reorder">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                                                        </svg>
                                                    </div>
                                                    <div className="relative flex-shrink-0 w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                                        <img 
                                                            src={product.image[0]} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                                                            {product.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                                                                {product.variants?.length || 0} variants
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <button
                                                    onClick={() => toggleBestSeller(product._id, !product.isBestSeller)}
                                                    className={`p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                                                        product.isBestSeller 
                                                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50' 
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                                    title={product.isBestSeller ? "Remove from Best Sellers" : "Add to Best Sellers"}
                                                >
                                                    <svg 
                                                        className={`w-5 h-5 ${product.isBestSeller ? 'text-white' : 'text-gray-400'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-4 py-5">
                                                <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={product.inStock}
                                                        onChange={() => toggleStock(product._id, !product.inStock)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600 transition-all duration-300 relative shadow-inner">
                                                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ease-in-out peer-checked:translate-x-5 shadow-md"></span>
                                                    </div>
                                                    <span className={`ml-3 text-xs font-bold ${product.inStock ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {product.inStock ? '● In Stock' : '○ Out'}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                                                        title="Edit Product"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                                                        title="Delete Product"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Enhanced Edit Product Modal - keeping existing structure with better styling */}
                {isEditModalOpen && editingProduct && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                            {/* Modal Header - Enhanced */}
                            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            Edit Product
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Update product information and variants
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingProduct(null);
                                        }}
                                        className="p-2.5 hover:bg-red-100 rounded-xl transition-all duration-200 group"
                                    >
                                        <svg className="w-6 h-6 text-gray-500 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - keep existing content structure */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProduct.name}
                                        onChange={(e) =>
                                            setEditingProduct({ ...editingProduct, name: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                        placeholder="e.g., Fresh Cauliflower"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={Array.isArray(editingProduct.description) ? editingProduct.description.join('\n') : editingProduct.description}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                description: e.target.value.split('\n'),
                                            })
                                        }
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                                        placeholder="Enter product description..."
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editingProduct.category}
                                        onChange={(e) =>
                                            setEditingProduct({ ...editingProduct, category: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Current Images Preview */}
                                {editingProduct.image && editingProduct.image.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Current Images
                                        </label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {editingProduct.image.map((img, idx) => (
                                                <div key={idx} className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                                                    <img
                                                        src={img}
                                                        alt={`Product ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload New Images */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Upload New Images (Optional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) =>
                                                setEditingProduct({
                                                    ...editingProduct,
                                                    newImages: Array.from(e.target.files),
                                                })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Upload new images to replace existing ones
                                    </p>
                                </div>

                                {/* Product Variants */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Product Variants <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Variant
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {editingProduct.variants?.map((variant, index) => (
                                            <div key={index} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-primary/30 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-gray-700">Variant #{index + 1}</span>
                                                    {editingProduct.variants.length > 1 && (
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
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Weight/Size</label>
                                                        <input
                                                            type="number"
                                                            value={variant.weight}
                                                            onChange={(e) => updateVariant(index, 'weight', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                                                            placeholder="500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Unit</label>
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

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">MRP (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                                                            placeholder="100"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Offer Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={variant.offerPrice}
                                                            onChange={(e) => updateVariant(index, 'offerPrice', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                                                            placeholder="80"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer - Enhanced */}
                            <div className="px-8 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex gap-4">
                                <button
                                    onClick={handleEditSubmit}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    💾 Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingProduct(null);
                                    }}
                                    className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold hover:scale-105 active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductList

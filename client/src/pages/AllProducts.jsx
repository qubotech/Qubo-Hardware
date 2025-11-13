import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import './AllProducts.css';

const AllProducts = () => {
    const { products, categories, currency, addToCart, user, setShowUserLogin } = useAppContext()
    const navigate = useNavigate()
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        let filtered = products.filter((p) => p.inStock)
        
        if (selectedCategory !== "All") {
            filtered = filtered.filter((p) => p.category?.name === selectedCategory)
        }
        
        if (searchQuery.trim()) {
            filtered = filtered.filter((p) => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        
        setFilteredProducts(filtered)
    }, [selectedCategory, products, searchQuery])

    const openProductPopup = (product) => {
        setSelectedProduct(product)
        setSelectedVariant(product.variants?.[0] || null)
        document.body.style.overflow = 'hidden'
    }

    const closeProductPopup = () => {
        setSelectedProduct(null)
        setSelectedVariant(null)
        document.body.style.overflow = 'unset'
    }

    const handleQuickAddToCart = (e, product) => {
        e.stopPropagation();
        if (!user) {
            setShowUserLogin(true);
            return;
        }
        const variantIndex = 0;
        addToCart(`${product._id}|${variantIndex}`);
    };

    const handleQuickBuyNow = (e, product) => {
        e.stopPropagation();
        if (!user) {
            setShowUserLogin(true);
            return;
        }
        const variantIndex = 0;
        addToCart(`${product._id}|${variantIndex}`);
        document.body.style.overflow = 'unset';
        navigate('/cart');
    };

    const handleAddToCart = () => {
        if (!user) {
            setShowUserLogin(true);
            return;
        }
        if (selectedProduct && selectedVariant) {
            const variantIndex = selectedProduct.variants.indexOf(selectedVariant);
            addToCart(`${selectedProduct._id}|${variantIndex}`)
            closeProductPopup()
        }
    }

    const handleBuyNow = () => {
        if (!user) {
            setShowUserLogin(true);
            return;
        }
        if (selectedProduct && selectedVariant) {
            const variantIndex = selectedProduct.variants.indexOf(selectedVariant)
            addToCart(`${selectedProduct._id}|${variantIndex}`)
            // ✅ Reset body overflow before navigation
            document.body.style.overflow = 'unset'
            navigate('/cart')
        }
    }

    // ✅ Also reset overflow when component unmounts
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white p-6 mb-6 rounded-lg shadow-sm">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                நம்ம Products
                            </h1>
                            <p className="text-gray-600">Fresh products delivered to your door 🌿</p>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory("All")}
                            className={`px-6 py-2 rounded-full font-medium text-sm transition ${
                                selectedCategory === "All"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            All Products
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-6 py-2 rounded-full font-medium text-sm transition ${
                                    selectedCategory === cat.name
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-20 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No products found</p>
                        <p className="text-gray-500">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => openProductPopup(product)}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                            >
                                <div className="relative">
                                    <img
                                        src={product.image[0]}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    {product.isBestSeller && (
                                        <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            Best Seller
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500 line-through">{currency}{product.variants[0].price}</p>
                                            <p className="text-lg font-bold text-primary">
                                                {currency}{product.variants[0].offerPrice}
                                            </p>
                                        </div>
                                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            {product.variants[0].weight} {product.variants[0].unit}
                                        </div>
                                    </div>
                                    
                                    {/* Quick Action Buttons */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={(e) => handleQuickAddToCart(e, product)}
                                            className="flex-1 py-2 bg-white border-2 border-primary text-primary text-xs font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                            title="Add to Cart"
                                        >
                                            🛒 Add
                                        </button>
                                        <button
                                            onClick={(e) => handleQuickBuyNow(e, product)}
                                            className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dull transition flex items-center justify-center gap-1"
                                            title="Buy Now"
                                        >
                                            ⚡ Buy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ✅ Flip Animation Popup */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
                    <div 
                        className="absolute inset-0"
                        onClick={closeProductPopup}
                    ></div>
                    
                    <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg animate-flipIn">
                        <button
                            onClick={closeProductPopup}
                            className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg z-10"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="grid md:grid-cols-2 gap-6 p-6">
                            {/* Product Images */}
                            <div className="space-y-3">
                                <div className="bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={selectedProduct.image[0]}
                                        alt={selectedProduct.name}
                                        className="w-full h-80 object-cover"
                                    />
                                </div>
                                
                                {selectedProduct.image.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedProduct.image.map((img, idx) => (
                                            <div key={idx} className="bg-gray-100 rounded overflow-hidden">
                                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-16 object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        {selectedProduct.name}
                                    </h2>
                                    <div className="flex items-center gap-1">
                                        {Array(5).fill('').map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="text-sm text-gray-600 ml-2">(4 reviews)</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-sm text-gray-600 line-through">{currency}{selectedVariant?.price}</p>
                                        <p className="text-3xl font-bold text-primary">
                                            {currency}{selectedVariant?.offerPrice}
                                        </p>
                                    </div>
                                    <p className="text-green-600 font-medium mt-1">
                                        Save {currency}{selectedVariant ? (selectedVariant.price - selectedVariant.offerPrice) : 0}
                                    </p>
                                </div>

                                {/* Variant Selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Variant</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedProduct.variants.map((variant, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`p-3 rounded-lg font-medium transition border-2 ${
                                                    selectedVariant === variant
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                                                }`}
                                            >
                                                <div className="text-base">{variant.weight} {variant.unit}</div>
                                                <div className="text-sm">{currency}{variant.offerPrice}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">About this product</h3>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            {Array.isArray(selectedProduct.description) ? (
                                                selectedProduct.description.map((desc, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>{desc}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>{selectedProduct.description}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-gray-50 transition"
                                    >
                                        🛒 Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dull transition"
                                    >
                                        ⚡ Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AllProducts

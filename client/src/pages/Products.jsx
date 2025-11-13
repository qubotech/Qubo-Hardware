import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Products = () => {
    const { products, categories } = useAppContext();
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    const filteredProducts = selectedCategory
        ? products.filter(product => product.category?._id === selectedCategory)
        : products;

    return (
        <div>
            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === '' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All
                </button>
                {categories.map((category) => (
                    <button
                        key={category._id}
                        onClick={() => setSelectedCategory(category._id)}
                        className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                            selectedCategory === category._id
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md p-4">
                        <img src={product.image[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-gray-500">{product.description}</p>
                            <p className="text-primary font-bold mt-2">₹{product.variants[0].offerPrice}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Products Message */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No products found in this category</p>
                </div>
            )}
        </div>
    );
};

export default Products;
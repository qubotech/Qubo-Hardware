import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SearchBar = () => {
    const navigate = useNavigate();
    const { products, categories } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = (value) => {
        setSearchTerm(value);
        
        if (value.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const searchLower = value.toLowerCase();
        
        // Search in products
        const productResults = products
            .filter(product => 
                product.name.toLowerCase().includes(searchLower) ||
                product.category?.name.toLowerCase().includes(searchLower)
            )
            .slice(0, 5)
            .map(product => ({
                type: 'product',
                id: product._id,
                name: product.name,
                category: product.category?.name,
                image: product.image[0]
            }));

        // Search in categories
        const categoryResults = categories
            .filter(category => 
                category.name.toLowerCase().includes(searchLower)
            )
            .slice(0, 3)
            .map(category => ({
                type: 'category',
                id: category._id,
                name: category.name
            }));

        setSearchResults([...categoryResults, ...productResults]);
        setShowResults(true);
    };

    const handleResultClick = (result) => {
        if (result.type === 'category') {
            // Navigate to products page with category filter
            navigate(`/products?category=${result.id}`);
        } else {
            // Navigate to specific product
            navigate(`/product/${result.id}`);
        }
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Search products or categories..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                        <button
                            key={`${result.type}-${result.id}-${index}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                            {result.type === 'category' ? (
                                <>
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                                        <p className="text-xs text-gray-500">Category - View all products</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <img 
                                        src={result.image} 
                                        alt={result.name}
                                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                                        <p className="text-xs text-gray-500">{result.category}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showResults && searchTerm && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
                    <p className="text-sm text-gray-500">No results found for "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
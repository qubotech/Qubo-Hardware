import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
    const { products, navigate, currency, addToCart, user, setShowUserLogin } = useAppContext();
    const { id } = useParams();

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product]);

    useEffect(() => {
        if (products.length > 0 && product) {
            const productsCopy = products.filter(
                (item) => item.category === product.category && item._id !== product._id
            );
            setRelatedProducts(productsCopy.slice(0, 5));
        }
    }, [products, product]);

    useEffect(() => {
        setThumbnail(product?.image?.[0] ? product.image[0] : null);
    }, [product]);

    return (
        product && selectedVariant && (
            <div className='mt-11 min-h-screen bg-gray-50'>
                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <p className="text-sm text-gray-600">
                        <Link to={"/"} className="hover:text-primary transition">Home</Link> /
                        <Link to={"/products"} className="hover:text-primary transition"> Products</Link> /
                        {product.category && (
                            <Link to={`/products/${product.category.name.toLowerCase()}`} className="hover:text-primary transition">
                                {" "}{product.category.name}
                            </Link>
                        )}
                        /<span className="text-primary"> {product.name}</span>
                    </p>
                </div>

                {/* Product Details Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200 aspect-square">
                                    <img 
                                        src={thumbnail} 
                                        alt="Selected product" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Thumbnail Gallery */}
                                <div className="grid grid-cols-4 gap-3">
                                    {product.image.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setThumbnail(image)}
                                            className={`bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
                                                thumbnail === image ? 'border-primary shadow-md' : 'border-gray-200'
                                            }`}
                                        >
                                            <img 
                                                src={image} 
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover aspect-square"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Product Name */}
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                        {product.name}
                                    </h1>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {Array(5).fill("").map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-gray-600 text-sm font-medium">(4 reviews)</span>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-gray-500 line-through text-xl">
                                            {currency}{selectedVariant.price}
                                        </span>
                                        <span className="text-4xl font-bold text-primary">
                                            {currency}{selectedVariant.offerPrice}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            Save {currency}{selectedVariant.price - selectedVariant.offerPrice}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            ({selectedVariant.weight} {selectedVariant.unit})
                                        </span>
                                    </div>
                                </div>

                                {/* Variant Selector */}
                                <div>
                                    <label className="block text-base font-bold text-gray-900 mb-3">
                                        Select Variant:
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.variants.map((v, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`p-4 rounded-xl font-semibold transition-all border-2 ${
                                                    selectedVariant.weight + selectedVariant.unit === v.weight + v.unit
                                                        ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:shadow-md'
                                                }`}
                                            >
                                                <div className="text-lg">{v.weight} {v.unit}</div>
                                                <div className="text-sm mt-1">{currency}{v.offerPrice}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Product Description */}
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        About Product
                                    </h3>
                                    <ul className="space-y-2">
                                        {product.description.map((desc, index) => (
                                            <li key={index} className="flex items-start gap-3 text-gray-700">
                                                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{desc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                setShowUserLogin(true);
                                                return;
                                            }
                                            addToCart(`${product._id}|${product.variants.indexOf(selectedVariant)}`);
                                        }}
                                        className="flex-1 py-4 font-bold text-lg bg-white border-2 border-primary text-primary rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Add to Cart
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                setShowUserLogin(true);
                                                return;
                                            }
                                            addToCart(`${product._id}|${product.variants.indexOf(selectedVariant)}`);
                                            navigate("/cart");
                                        }}
                                        className="flex-1 py-4 font-bold text-lg bg-primary text-white rounded-xl hover:bg-primary-dull transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Related Products
                        </h2>
                        <div className="w-24 h-1 bg-primary rounded-full mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {relatedProducts
                            .filter((product) => product.inStock)
                            .map((product, index) => (
                                <ProductCard key={index} product={product} />
                            ))}
                    </div>
                    
                    <div className="text-center mt-12">
                        <button
                            onClick={() => {
                                navigate("/products");
                                scrollTo(0, 0);
                            }}
                            className="px-8 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-md hover:shadow-lg"
                        >
                            See More Products
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default ProductDetails;

import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import Details from '../components/VoiceOfTrust'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { products, currency, addToCart, user, setShowUserLogin } = useAppContext();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Filter best sellers
  const bestSellerProducts = products.filter(product => product.isBestSeller && product.inStock);

  // ✅ Continuous auto-scroll (never stops)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !products || products.length === 0) return;

    const scrollSpeed = 1; // pixels per frame
    let animationFrameId;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0; // Reset to start
      } else {
        container.scrollLeft += scrollSpeed;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [products]);

  const openProductPopup = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    document.body.style.overflow = 'hidden';
  };

  const closeProductPopup = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    document.body.style.overflow = 'unset';
  };

  const handleAddToCart = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (selectedProduct && selectedVariant) {
      const variantIndex = selectedProduct.variants.indexOf(selectedVariant);
      addToCart(`${selectedProduct._id}|${variantIndex}`);
      closeProductPopup();
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (selectedProduct && selectedVariant) {
      const variantIndex = selectedProduct.variants.indexOf(selectedVariant);
      addToCart(`${selectedProduct._id}|${variantIndex}`);
      document.body.style.overflow = 'unset';
      navigate('/cart');
    }
  };

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

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className='mt-10 relative'>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <MainBanner />
      
      {/* Enhanced Categories Section */}
      <div className="relative mt-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">Browse through our fresh selection</p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mt-3"></div>
        </div>
        <Categories />
      </div>
      
      {/* ✅ Enhanced Best Sellers with Continuous Scroll & Flip Animation */}
      <div id="best-sellers" className="relative mt-20">
        <div className="text-center mb-10">
          <div className="inline-block relative">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              ⭐ Best Sellers
            </h2>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <p className="text-gray-600 text-lg mt-2">Customer favorites - trending now!</p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mt-3"></div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide mt-10 pb-4"
          style={{ 
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-6 min-w-max px-4">
            {bestSellerProducts.length > 0 ? (
              bestSellerProducts.map((product, index) => (
                <div
                  key={index}
                  onClick={() => openProductPopup(product)}
                  className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group product-flip-card"
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
                        Best
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
                    
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => handleQuickAddToCart(e, product)}
                        className="flex-1 py-2 bg-white border-2 border-primary text-primary text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        🛒 Add
                      </button>
                      <button
                        onClick={(e) => handleQuickBuyNow(e, product)}
                        className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dull transition"
                      >
                        ⚡ Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg font-medium">No best sellers available at the moment.</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon for amazing deals!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Daily Freshies Section */}
      <div className="relative mt-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 shadow-xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            🌿 Daily Freshies
          </h2>
          <p className="text-gray-600 text-lg">Farm-fresh produce delivered daily</p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mt-3"></div>
        </div>
        <BestSeller />
      </div>

      {/* Enhanced Trust Section */}
      <div className="relative mt-20">
        <Details />
      </div>

      {/* Enhanced Features Banner */}
      <div className="relative mt-20">
        <BottomBanner />
      </div>

      {/* Enhanced Newsletter Section */}
      <div className="relative mt-20 bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-3xl p-8 md:p-12 shadow-xl">
        <NewsLetter />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <a 
          href="#best-sellers" 
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </a>
        
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
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

export default Home

// Navbar.jsx
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBoxOpen, faInfoCircle, faPhone, faShoppingBag, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState(localStorage.getItem('siteMode') || 'B2C')
  const [showSearchResults, setShowSearchResults] = useState(false)

  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
    axios,
    animateCart,
    products,
    currency,
  } = useAppContext()

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout')
      if (data.success) {
        toast.success(data.message)
        setUser(null)
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleModeChange = (e) => {
    const selectedMode = e.target.value
    setMode(selectedMode)
    localStorage.setItem('siteMode', selectedMode)

    if (selectedMode === 'B2B') navigate('/b2b')
    else if (selectedMode === 'seller') navigate('/seller')
    else if (selectedMode === 'admin') navigate('/admin')
    else navigate('/')
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchResults(value.length > 0)
  }

  const handleSearchResultClick = (product) => {
    setSearchQuery('')
    setShowSearchResults(false)
    navigate(`/products/${product.category?.name?.toLowerCase()}/${product._id}`)
    window.scrollTo(0, 0)
  }

  // ✅ Fix: Ensure searchQuery is always a string and handle the filter safely
  const filteredSearchResults = products
    .filter(product => {
      if (!product.inStock) return false;
      
      const query = String(searchQuery || '').toLowerCase();
      const productName = String(product.name || '').toLowerCase();
      
      return productName.includes(query);
    })
    .slice(0, 5)

  useEffect(() => {
    // Remove the auto-navigation effect
    // if (searchQuery.length > 0) {
    //   navigate('/products')
    // }
  }, [searchQuery])

  return (
    <nav
      className="backdrop-blur-md bg-[rgba(255,255,255,0.65)] text-black border-b border-gray-300 shadow-md flex items-center justify-between px-6 md:px-12 lg:px-20 xl:px-28 py-2 sticky top-0 z-50 transition-all"
      style={{
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 500,
      }}
    >
      <NavLink
        to="/"
        onClick={() => {
          setOpen(false);
          window.location.href = '/';
        }}
        className="rounded-lg bg-white/60 backdrop-blur-sm p-1 shadow-sm"
      >
        <img className="h-10 w-auto rounded-lg object-contain" src={assets.logo2} alt="logo" />
      </NavLink>

      <div className="hidden sm:flex items-center gap-8 text-gray-800" style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}>
        <NavLink
          to='/'

          className="hover:scale-110 hover:text-primary transition duration-200"
          style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
        >Home</NavLink>
        <NavLink
          to='/products'
          className="hover:scale-110 hover:text-primary transition duration-200"
          style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
        >All Products</NavLink>
        <NavLink
          to='/About'
          className="hover:scale-110 hover:text-primary transition duration-200"
          style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
        >About</NavLink>
        <NavLink
          to='/Contact'
          className="hover:scale-110 hover:text-primary transition duration-200"
          style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
        >Contact Us</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-2 py-1 rounded-full bg-white/50 backdrop-blur relative">
          <input 
            onChange={handleSearchChange} 
            value={searchQuery || ''} // ✅ Ensure it's always a string
            onFocus={() => (searchQuery || '').length > 0 && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 300)} // ✅ Increased delay to 300ms
            className="py-1 w-full bg-transparent outline-none placeholder-gray-500 text-black" 
            type="text" 
            placeholder="Search products" 
          />
          <img src={assets.search_icon} alt='search' className='w-4 h-4 opacity-70' />

          {/* Search Results Dropdown */}
          {showSearchResults && filteredSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] max-h-96 overflow-y-auto">
              {filteredSearchResults.map((product) => (
                <div
                  key={product._id}
                  onMouseDown={(e) => e.preventDefault()} // ✅ Prevent blur from firing
                  onClick={() => handleSearchResultClick(product)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <img 
                    src={product.image[0]} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.category?.name}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {currency}{product.variants[0].offerPrice}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showSearchResults && (searchQuery || '').length > 0 && filteredSearchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] p-4 text-center">
              <p className="text-sm text-gray-500">No products found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img
            id="cart-icon"
            src={assets.nav_cart_icon}
            alt='cart'
            className={`w-5 opacity-80 transition-transform duration-300 ${animateCart ? "animate-bounce" : ""}`}
          />
          <button
            className="absolute -top-2 -right-3 text-xs text-white w-[16px] h-[16px] rounded-full flex items-center justify-center border-none outline-none"
            style={{
              background: 'linear-gradient(to right, #5044E5, #4d8cea)',
              transition: 'background 0.2s',
              padding: 0,
            }}
            tabIndex={-1}
            disabled
          >
            {getCartCount()}
          </button>
        </div>

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="cursor-pointer px-6 py-1.5 text-white rounded-full text-sm"
            style={{
              background: 'linear-gradient(to right, #5044E5, #4d8cea)',
              transition: 'background 0.2s',
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 500,
            }}
            onMouseOver={e => e.currentTarget.style.background = '#4d8cea'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(to right, #5044E5, #4d8cea)'}
          >
            Login / Signup
          </button>
        ) : (
          <div className='relative group flex items-center gap-3'>
            {/* ✅ Display User Name */}
            <span className="hidden md:block text-sm font-medium text-gray-700">
              Hi, <span className="text-primary font-semibold">{user.name}</span>
            </span>
            
            <img src={assets.profile_icon} className='w-8 cursor-pointer' alt="profile" />
            
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2 w-32 rounded-md text-sm z-40 text-black'>
              <li onClick={() => navigate("my-orders")} className='p-1 pl-3 hover:bg-primary/10 cursor-pointer'>My Orders</li>
              <li onClick={logout} className='p-1 pl-3 hover:bg-primary/10 cursor-pointer'>Logout</li>
            </ul>
          </div>
        )}
      </div>

      <div className='flex items-center gap-4 sm:hidden' style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}>
        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img
            id="cart-icon"
            src={assets.nav_cart_icon}
            alt='cart'
            className={`w-5 opacity-80 transition-transform duration-300 ${animateCart ? "animate-bounce" : ""}`}
          />
          <button
            className="absolute -top-2 -right-3 text-xs text-white w-[16px] h-[16px] rounded-full flex items-center justify-center border-none outline-none"
            style={{
              background: 'linear-gradient(to right, #5044E5, #4d8cea)',
              transition: 'background 0.2s',
              padding: 0,
            }}
            tabIndex={-1}
            disabled
          >
            {getCartCount()}
          </button>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Menu">
          <img src={assets.menu_icon} alt='menu' />
        </button>
      </div>

      {open && (
        <div
          className="md:hidden absolute top-[60px] left-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-lg py-4 px-4 flex flex-col gap-3 text-black rounded-b-xl text-sm"
          style={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 500,
          }}
        >
          {/* ✅ Show user name in mobile menu */}
          {user && (
            <div className="px-4 py-2 bg-primary/10 rounded-lg">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-primary">{user.name}</p>
            </div>
          )}
          
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 hover:scale-110 hover:text-primary transition duration-200"
            style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
          >
            <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
            Home
          </NavLink>
          <NavLink
            to="/products"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 hover:scale-110 hover:text-primary transition duration-200"
            style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
          >
            <FontAwesomeIcon icon={faBoxOpen} className="w-4 h-4" />
            All Products
          </NavLink>
          <NavLink
            to="/About"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 hover:scale-110 hover:text-primary transition duration-200"
            style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
            About
          </NavLink>
          <NavLink
            to="/Contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 hover:scale-110 hover:text-primary transition duration-200"
            style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 500 }}
          >
            <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
            Contact Us
          </NavLink>
          {user && (
            <NavLink to="/my-orders" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingBag} className="w-4 h-4" />
              My Orders
            </NavLink>
          )}
          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="flex items-center gap-2 cursor-pointer px-5 py-1.5 text-white rounded-full text-sm"
              style={{
                background: 'linear-gradient(to right, #5044E5, #4d8cea)',
                transition: 'background 0.2s',
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 500,
              }}
              onMouseOver={e => e.currentTarget.style.background = '#4d8cea'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(to right, #5044E5, #4d8cea)'}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
              Login / Signup
            </button>
          ) : (
            <button
              onClick={logout}
              className="flex items-center gap-2 cursor-pointer px-5 py-1.5 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar

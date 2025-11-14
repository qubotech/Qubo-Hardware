// Navbar.jsx
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [open, setOpen] = useState(false)
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

  const filteredSearchResults = products
    .filter(product => {
      if (!product.inStock) return false;
      const query = String(searchQuery || '').toLowerCase();
      const productName = String(product.name || '').toLowerCase();
      return productName.includes(query);
    })
    .slice(0, 5)

  return (
    <nav className="backdrop-blur-md bg-white/95 border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <NavLink to="/" onClick={() => setOpen(false)} className="flex-shrink-0">
          <img className="h-10 w-auto" src={assets.logo2} alt="Qubo logo" />
        </NavLink>

        {/* Center Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2 text-gray-700">
          <NavLink to="/" className="hover:text-primary transition-colors text-sm">Home</NavLink>
          <NavLink to="/products" className="hover:text-primary transition-colors text-sm">Products</NavLink>
          <NavLink to="/About" className="hover:text-primary transition-colors text-sm">Services</NavLink>
          <NavLink to="/Contact" className="hover:text-primary transition-colors text-sm">Contact Us</NavLink>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-full bg-white/50 relative group">
            <input 
              onChange={handleSearchChange} 
              value={searchQuery || ''}
              onFocus={() => (searchQuery || '').length > 0 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 300)}
              className="py-1 w-40 bg-transparent outline-none placeholder-gray-400 text-sm text-gray-800" 
              type="text" 
              placeholder="Search products" 
            />
            <img src={assets.search_icon} alt='search' className='w-4 h-4 opacity-50' />

            {/* Search Results Dropdown */}
            {showSearchResults && filteredSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] max-h-96 overflow-y-auto">
                {filteredSearchResults.map((product) => (
                  <div
                    key={product._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearchResultClick(product)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <img src={product.image[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-primary font-medium">{currency}{product.variants[0].offerPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showSearchResults && (searchQuery || '').length > 0 && filteredSearchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] p-4 text-center">
                <p className="text-sm text-gray-500">No products found</p>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden md:block">
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 2v4M12 16v4M4.22 4.22l2.83 2.83M14.95 14.95l2.83 2.83M2 12h4M16 12h4M4.22 19.78l2.83-2.83M14.95 9.05l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Connect Button / User Menu */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="px-6 py-2 text-white rounded-full text-sm font-medium bg-gradient-to-r from-[#5044E5] to-[#4d8cea] hover:shadow-lg transition-all"
            >
              Connect
            </button>
          ) : (
            <div className='relative group'>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                {user.name}
              </button>
              <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow-lg border border-gray-200 py-2 w-40 rounded-lg text-sm z-40 text-gray-800'>
                <li onClick={() => navigate("my-orders")} className='px-4 py-2 hover:bg-gray-50 cursor-pointer'>My Orders</li>
                <li onClick={logout} className='px-4 py-2 hover:bg-gray-50 cursor-pointer border-t'>Logout</li>
              </ul>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-6 space-y-3">
          <NavLink to="/" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-primary transition-colors">Home</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-primary transition-colors">Products</NavLink>
          <NavLink to="/About" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-primary transition-colors">Services</NavLink>
          <NavLink to="/Contact" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-primary transition-colors">Contact Us</NavLink>
          
          {user && (
            <>
              <hr className="my-2" />
              <NavLink to="/my-orders" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-primary transition-colors">My Orders</NavLink>
              <button onClick={logout} className="w-full text-left py-2 text-gray-700 hover:text-primary transition-colors">Logout</button>
            </>
          )}
          {!user && (
            <button onClick={() => { setOpen(false); setShowUserLogin(true); }} className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#5044E5] to-[#4d8cea] text-white rounded-full font-medium">
              Connect
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Cart = () => {
    const {
        products, currency, cartItems,
        removeFromCart, getCartCount,
        updateCartItem, navigate, getCartAmount,
        axios, user, setCartItems
    } = useAppContext();

    const [addresses, setAddresses] = useState([]);
    const [showAddress, setShowAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentOption, setPaymentOption] = useState("COD");

    const cartArray = Object.keys(cartItems)
        .filter((key) => {
            const [productId, variantIndex] = key.split("|");
            const qty = cartItems[key];
            const validProduct = products.some(p => p._id === productId);
            return qty > 0 && validProduct;
        })
        .map((key) => {
            const [productId, variantIndex] = key.split("|");
            const product = products.find(item => item._id === productId);
            const variant = product?.variants?.[variantIndex] || {};
            return { ...product, variant, variantIndex, quantity: cartItems[key], cartKey: key };
        });

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const getUserAddress = async () => {
        try {
            const { data } = await axios.get('/api/address/get');
            if (data.success) {
                setAddresses(data.addresses);
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0]);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const placeOrder = async () => {
        try {
            if (!selectedAddress) return toast.error("Please select an address");

            const payload = {
                userId: user._id,
                items: cartArray.map(item => ({
                    product: item._id,
                    variantIndex: item.variantIndex,
                    quantity: item.quantity
                })),
                address: selectedAddress._id
            };

            if (paymentOption === "COD") {
                const { data } = await axios.post('/api/order/cod', payload);
                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    navigate('/my-orders');
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post('/api/order/razorpay', payload);
                if (!data.success) return toast.error("Failed to create Razorpay order");

                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Farmpick",
                    description: "Order Payment",
                    order_id: data.orderId,
                    handler: async (response) => {
                        const verifyPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: data.orderDbId,
                            userId: user._id,
                        };
                        const verifyRes = await axios.post("/api/order/razorpay/verify", verifyPayload);
                        if (verifyRes.data.success) {
                            toast.success("Payment Verified & Order Placed!");
                            setCartItems({});
                            navigate("/my-orders");
                        } else {
                            toast.error(verifyRes.data.message);
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.phone,
                    },
                    theme: {
                        color: "#3399cc",
                    },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) getUserAddress();
    }, [user]);

    return products.length > 0 && cartItems ? (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Cart Items */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Shopping Cart
                            </h1>
                            <p className="text-gray-600">
                                {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>

                        {/* Cart Items */}
                        {cartArray.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-20 text-center">
                                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</p>
                                <p className="text-gray-500 mb-6">Add some products to get started</p>
                                <button
                                    onClick={() => navigate("/products")}
                                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition font-medium"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartArray.map((product, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                                        <div className="flex gap-6">
                                            {/* Product Image */}
                                            <div 
                                                onClick={() => {
                                                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                                                    scrollTo(0, 0);
                                                }}
                                                className="cursor-pointer w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                                            >
                                                <img 
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                                                    src={product.image[0]} 
                                                    alt={product.name} 
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-800 text-lg mb-2 truncate">
                                                    {product.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Weight:</span> {product.variant.weight} {product.variant.unit}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Price:</span> {currency}{product.variant.offerPrice}
                                                    </div>
                                                </div>
                                                
                                                {/* Quantity Selector */}
                                                <div className="mt-4 flex items-center gap-4">
                                                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                                    <select
                                                        onChange={e => updateCartItem(product.cartKey, Number(e.target.value))}
                                                        value={product.quantity}
                                                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                    >
                                                        {Array(Math.max(product.quantity, 9)).fill('').map((_, idx) => (
                                                            <option key={idx} value={idx + 1}>{idx + 1}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Price & Remove */}
                                            <div className="flex flex-col items-end justify-between">
                                                <p className="text-2xl font-bold text-primary">
                                                    {currency}{product.variant.offerPrice * product.quantity}
                                                </p>
                                                <button 
                                                    onClick={() => removeFromCart(product.cartKey)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => { navigate("/products"); scrollTo(0, 0); }}
                                    className="flex items-center gap-2 text-primary font-medium hover:underline"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                            {/* Delivery Address */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Delivery Address
                                </label>
                                <div className="relative">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        {selectedAddress ? (
                                            <p className="text-sm text-gray-700">
                                                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500">No address selected</p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowAddress(!showAddress)}
                                        className="mt-2 text-primary hover:underline text-sm font-medium"
                                    >
                                        Change Address
                                    </button>
                                    
                                    {showAddress && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {addresses.map((address, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => { setSelectedAddress(address); setShowAddress(false); }}
                                                    className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 text-sm"
                                                >
                                                    {address.street}, {address.city}, {address.state}
                                                </button>
                                            ))}
                                            <button
                                                className="w-full text-center p-3 text-primary font-medium hover:bg-primary/5"
                                                onClick={() => {
                                                    if (user && user.email) {
                                                        navigate("/add-address");
                                                    } else {
                                                        navigate("/login?redirect=/add-address");
                                                    }
                                                }}
                                            >
                                                + Add New Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Payment Method
                                </label>
                                <select 
                                    onChange={e => setPaymentOption(e.target.value)} 
                                    value={paymentOption}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                                >
                                    <option value="COD">Cash On Delivery</option>
                                    <option value="Online">Online Payment</option>
                                </select>
                            </div>

                            <hr className="border-gray-200 mb-6" />

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{currency}{getCartAmount()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping Fee</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (2%)</span>
                                    <span className="font-medium">{currency}{(getCartAmount() * 0.02).toFixed(2)}</span>
                                </div>
                                <hr className="border-gray-200" />
                                <div className="flex justify-between text-lg font-bold text-gray-800">
                                    <span>Total Amount</span>
                                    <span className="text-primary">{currency}{(getCartAmount() * 1.02).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button 
                                onClick={placeOrder}
                                disabled={cartArray.length === 0}
                                className="w-full py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dull transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default Cart;

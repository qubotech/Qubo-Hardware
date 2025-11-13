import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user');
      if (data.success) setMyOrders(data.orders);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': 'bg-blue-100 text-blue-700',
      'Order Confirmed': 'bg-purple-100 text-purple-700',
      'Shipped': 'bg-yellow-100 text-yellow-700',
      'Out for Delivery': 'bg-orange-100 text-orange-700',
      'Delivered': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 md:px-8'>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-20 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No orders yet</p>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map((order, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Order ID: <span className="font-medium text-gray-800">{order._id}</span></p>
                      <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                    </div>
                    <div className="flex gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => {
                      const variant = item.product?.variants?.[item.variantIndex] || {};
                      return (
                        <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                          {/* Product Image */}
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {item.product?.image?.[0] ? (
                              <img 
                                src={item.product.image[0]} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center text-xs text-gray-400'>
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-base mb-1 truncate">
                              {item.product?.name || "Deleted Product"}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Category: <span className="font-medium">{item.product?.category?.name || "N/A"}</span></p>
                              <p>Variant: <span className="font-medium">{variant.weight || "-"} {variant.unit || ""}</span></p>
                              <p>Quantity: <span className="font-medium text-primary">x {item.quantity || 1}</span></p>
                              <p>Unit Price: <span className="font-medium">{currency}{variant.offerPrice || 0}</span></p>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-primary">
                              {currency}{((variant.offerPrice || 0) * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Delivery Address */}
                    {order.address && (
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold text-gray-800 mb-1">Delivery Address:</p>
                        <p>{order.address.firstName} {order.address.lastName}</p>
                        <p>{order.address.street}, {order.address.city}</p>
                        <p>{order.address.state}, {order.address.zipcode}</p>
                        <p>{order.address.phone}</p>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Order Total</p>
                      <p className="text-2xl font-bold text-gray-800">{currency}{order.amount}</p>
                      <p className="text-xs text-gray-500 mt-1">Payment: {order.paymentType}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

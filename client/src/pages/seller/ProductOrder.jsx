import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const ProductOrder = () => {
  const { backendUrl, token, products, getAllProducts } = useAppContext();
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch products when component mounts
    if (getAllProducts) {
      getAllProducts();
    }
  }, []);

  useEffect(() => {
    if (products && products.length > 0) {
      const sorted = [...products].sort((a, b) => {
        const orderA = a.displayOrder !== undefined ? a.displayOrder : 999;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 999;
        return orderA - orderB;
      });
      setOrderedProducts(sorted);
    }
  }, [products]);

  const updateOrder = (productId, newOrder) => {
    const orderNum = parseInt(newOrder) || 999;
    setOrderedProducts(prev =>
      prev.map(p => p._id === productId ? { ...p, displayOrder: orderNum } : p)
    );
  };

  const saveOrders = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        toast.error('Not authenticated. Please login again.');
        return;
      }

      const orders = orderedProducts.map((p) => ({
        productId: p._id,
        displayOrder: p.displayOrder !== undefined ? p.displayOrder : 999
      }));

      console.log('Sending orders:', orders); // Debug log

      const response = await axios.post(
        `${backendUrl}/api/product/bulk-set-order`,
        { orders },
        { 
          headers: { 
            'Content-Type': 'application/json',
            token: token 
          },
          withCredentials: true
        }
      );

      console.log('Response:', response.data); // Debug log

      if (response.data.success) {
        toast.success('✅ Product orders updated successfully!');
        if (getAllProducts) {
          getAllProducts(); // Refresh products
        }
      } else {
        toast.error(response.data.message || 'Failed to update orders');
      }
    } catch (error) {
      console.error('Error details:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to update orders');
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newProducts = [...orderedProducts];
    [newProducts[index], newProducts[index - 1]] = [newProducts[index - 1], newProducts[index]];
    newProducts[index].displayOrder = index + 1;
    newProducts[index - 1].displayOrder = index;
    setOrderedProducts(newProducts);
  };

  const moveDown = (index) => {
    if (index === orderedProducts.length - 1) return;
    const newProducts = [...orderedProducts];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    newProducts[index].displayOrder = index + 1;
    newProducts[index + 1].displayOrder = index + 2;
    setOrderedProducts(newProducts);
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">⭐ Set Product Display Order</h1>
            <p className="text-gray-600 text-sm mt-2">
              Arrange products for homepage display (1 = highest priority)
            </p>
          </div>
          <button
            onClick={saveOrders}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '💾 Saving...' : '💾 Save Order'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Priority Order</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Move</th>
                </tr>
              </thead>
              <tbody>
                {orderedProducts.map((product, index) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={product.displayOrder !== undefined ? product.displayOrder : 999}
                        onChange={(e) => updateOrder(product._id, e.target.value)}
                        className="w-20 border-2 border-gray-300 rounded-lg px-3 py-2 text-center font-semibold focus:border-green-500 focus:outline-none"
                        min="1"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg shadow"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">ID: {product._id.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition shadow"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === orderedProducts.length - 1}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition shadow"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">How to Use:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>Lower numbers = Higher priority</strong> (1 shows first)</li>
                <li>• Set order 1-10 for top featured products</li>
                <li>• Use arrow buttons (↑ ↓) to quickly rearrange</li>
                <li>• Type number directly in the input box</li>
                <li>• Don't forget to click "Save Order" button!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOrder;

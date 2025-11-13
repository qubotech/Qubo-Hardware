import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const SetProductOrder = () => {
  const { axios: axiosInstance, products: contextProducts, fetchProducts } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (contextProducts && contextProducts.length > 0) {
      // Sort by displayOrder if exists, otherwise by current order
      const sorted = [...contextProducts].sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      setProducts(sorted);
    }
  }, [contextProducts]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newProducts = [...products];
    const draggedItem = newProducts[draggedIndex];
    
    newProducts.splice(draggedIndex, 1);
    newProducts.splice(index, 0, draggedItem);
    
    setProducts(newProducts);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMove = (index, direction) => {
    const newProducts = [...products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newProducts.length) return;
    
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    setProducts(newProducts);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Format 1: Try with 'orders' array
      const orders = products.map((product, index) => ({
        id: product._id,
        displayOrder: index
      }));

      console.log('Sending payload:', { orders }); // Debug log

      const { data } = await axiosInstance.post('/api/product/update-order', { orders });

      if (data.success) {
        toast.success('Product order updated successfully!');
        await fetchProducts(); // Refresh products from backend
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Save order error:', error.response?.data || error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to save product order');
    } finally {
      setLoading(false);
    }
  };

  if (!products || products.length === 0) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Set Product Display Order</h1>
      <p className="text-gray-600 mb-4">Drag and drop products to reorder them, or use the arrow buttons.</p>
      
      <div className="bg-white rounded-lg shadow">
        {products.map((product, index) => (
          <div
            key={product._id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-move transition-all ${
              draggedIndex === index ? 'opacity-50 bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-gray-500 font-medium w-8">{index + 1}.</span>
              <img
                src={product.image?.[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">{product.category?.name || product.category}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(index, 'down')}
                disabled={index === products.length - 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Move down"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dull disabled:opacity-50 transition"
      >
        {loading ? 'Saving...' : 'Save Order'}
      </button>
    </div>
  );
};

export default SetProductOrder;

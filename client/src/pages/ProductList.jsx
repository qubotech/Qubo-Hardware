import { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5173/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = async (e) => {
    e.currentTarget.style.opacity = '1';
    
    // Save new order to backend
    const productOrders = products.map((product, index) => ({
      id: product._id,
      displayOrder: index + 1
    }));

    try {
      await fetch('http://localhost:5173/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productOrders })
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }

    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newProducts = [...products];
    const [draggedProduct] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(dropIndex, 0, draggedProduct);

    setProducts(newProducts);
    setDraggedIndex(dropIndex);
  };

  return (
    <div>
      {/* ...existing code for header and filters... */}
      
      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>CATEGORY</th>
            <th>BEST SELLER</th>
            <th>IN STOCK</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product._id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                cursor: 'move',
                backgroundColor: draggedIndex === index ? '#f0f0f0' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              {/* ...existing code for product row cells... */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;

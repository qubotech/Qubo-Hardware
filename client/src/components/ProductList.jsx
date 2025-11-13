import { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data.products);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newProducts = [...products];
    const draggedProduct = newProducts[draggedItem];
    newProducts.splice(draggedItem, 1);
    newProducts.splice(index, 0, draggedProduct);

    setDraggedItem(index);
    setProducts(newProducts);
  };

  const handleDragEnd = async () => {
    // Update displayOrder in backend
    const productOrders = products.map((product, index) => ({
      id: product._id,
      displayOrder: index
    }));

    await fetch('/api/products/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productOrders })
    });

    setDraggedItem(null);
  };

  return (
    <div>
      {products.map((product, index) => (
        <div
          key={product._id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          style={{ cursor: 'move' }}
        >
          {/* Your existing product row content */}
        </div>
      ))}
    </div>
  );
};

export default ProductList;

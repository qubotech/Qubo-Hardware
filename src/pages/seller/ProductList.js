import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import fetchProducts from './fetchProducts'; // Adjust the import based on your file structure

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const products = await fetchProducts();
      setFilteredProducts(products);
    };

    getProducts();
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UX
    setFilteredProducts(items);

    try {
      // Prepare the order updates
      const productOrders = items.map((product, index) => ({
        id: product._id,
        order: index
      }));

      // Send to backend
      const response = await fetch('http://localhost:5173/api/products/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productOrders }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product order');
      }

      // Refresh the products list to get the updated order from backend
      fetchProducts();
    } catch (error) {
      console.error('Error updating product order:', error);
      // Revert the order if the API call fails
      fetchProducts();
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="products">
        {(provided) => (
          <div
            className="product-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {filteredProducts.map((product, index) => (
              <Draggable key={product._id} draggableId={product._id} index={index}>
                {(provided) => (
                  <div
                    className="product-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {product.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ProductList;
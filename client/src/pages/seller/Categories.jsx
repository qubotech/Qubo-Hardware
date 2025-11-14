import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Categories = () => {
    const { categories, axios, fetchCategories } = useAppContext();
    
    const [categoryData, setCategoryData] = useState({
        name: '',
        description: ''
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!categoryData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            const { data } = await axios.post('/api/category/add', categoryData);
            
            if (data.success) {
                toast.success(data.message);
                setCategoryData({ name: '', description: '' });
                fetchCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editingCategory.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            const { data } = await axios.post('/api/category/edit', {
                id: editingCategory._id,
                name: editingCategory.name,
                description: editingCategory.description
            });
            
            if (data.success) {
                toast.success(data.message);
                setIsEditModalOpen(false);
                setEditingCategory(null);
                fetchCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const { data } = await axios.delete(`/api/category/delete/${id}`);
                
                if (data.success) {
                    toast.success(data.message);
                    fetchCategories();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message || 'Failed to delete category');
            }
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
            <div className="max-w-5xl mx-auto p-6 md:p-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Categories</h1>
                    <p className="text-gray-500">Organize your products by creating and managing categories</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Add New Category Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Category
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Category Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryData.name}
                                    onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="e.g., PC items, Laptops, Monitors"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={categoryData.description}
                                    onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                                    placeholder="Brief description of this category..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dull transition-colors font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Category
                            </button>
                        </form>
                    </div>

                    {/* Categories List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            All Categories
                        </h2>

                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-lg font-medium mb-1">No categories yet</p>
                                <p className="text-sm">Create your first category to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {categories.map((category) => (
                                    <div
                                        key={category._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                                                    {category.name}
                                                </h3>
                                                {category.description ? (
                                                    <p className="text-sm text-gray-500 line-clamp-2 ml-4">
                                                        {category.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic ml-4">
                                                        No description
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit category"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete category"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Category Modal */}
                {isEditModalOpen && editingCategory && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Edit Category</h2>
                                    <p className="text-sm text-gray-500 mt-1">Update category information</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingCategory(null);
                                    }}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-6 space-y-5">
                                {/* Category Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCategory.name}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, name: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                        placeholder="e.g., Vegetables"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={editingCategory.description || ''}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, description: e.target.value })
                                        }
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                                        placeholder="Brief description..."
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                                <button
                                    onClick={handleEditSubmit}
                                    className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dull transition-colors font-semibold shadow-sm hover:shadow-md"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingCategory(null);
                                    }}
                                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;

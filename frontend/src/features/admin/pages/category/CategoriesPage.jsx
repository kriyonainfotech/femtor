import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable, { ActionMenu } from '../../../../components/ui/DataTable';
import SidePanel from '../../../../components/ui/SidePanel';
import Modal from '../../../../components/ui/Modal';
import { Edit, Trash2 } from 'lucide-react';
import { ArrowUp, ArrowDown } from "lucide-react";

const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for UI components
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // --- Data Fetching ---
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${APIURL}/api/categories/get-all-categories`);
            setCategories(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // const handleMoveUp = (index) => {
    //     if (index === 0) return;
    //     const updated = [...categories];  // <-- use categories here
    //     [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    //     setCategories(updated);
    // };

    // const handleMoveDown = (index) => {
    //     if (index === categories.length - 1) return; // <-- use categories here
    //     const updated = [...categories];
    //     [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    //     setCategories(updated);
    // };

    const handleMoveUp = async (index) => {
        if (index === 0) return;

        const category = categories[index];
        try {
            const res = await axios.put(`${APIURL}/api/categories/${category._id}/order`, {
                categoryId: category._id,
                direction: 'up'
            });
            console.log(res.data);
            setCategories(res.data.categories.sort((a, b) => a.count - b.count));
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || 'Failed to move category up.');
        }
    };

    const handleMoveDown = async (index) => {
        if (index === categories.length - 1) return;

        const category = categories[index];
        try {
            const res = await axios.put(`${APIURL}/api/categories/${category._id}/order`, {
                categoryId: category._id,
                direction: 'down'
            });
            setCategories(res.data.categories.sort((a, b) => a.count - b.count));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to move category down.');
        }
    };


    // --- UI Handlers ---
    const handleOpenEdit = (category) => {
        setSelectedCategory(category);
        setIsEditPanelOpen(true);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const response = await axios.delete(`${APIURL}/api/categories/delete-category/${categoryId}`);
                console.log(response.data);
                setCategories(prev => prev.filter(c => c._id !== categoryId));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete category.');
            }
        }
    };

    // --- State Update Handlers ---
    const handleCreateSuccess = (newCategory) => {
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        setIsCreateModalOpen(false);
    };

    const handleUpdateSuccess = (updatedCategory) => {
        setCategories(prev => prev.map(c => c._id === updatedCategory._id ? updatedCategory : c));
        setIsEditPanelOpen(false);
    };

    // --- DataTable Config ---
    const columns = [
        // {
        //     header: "Sr. No.",
        //     accessor: "srno",
        //     cell: (_, index) => (
        //         <div className="text-gray-800 dark:text-gray-200 font-medium">
        //             {index + 1}
        //         </div>
        //     ),
        // },
        {
            header: "Reorder",
            accessor: "actions",
            cell: (row, index) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded-md bg-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600  disabled:opacity-40"
                    >
                        <ArrowUp size={16} color='#fff' />
                    </button>
                    <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1} // use categories state
                        className="p-1 rounded-md bg-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600  disabled:opacity-40"
                    >
                        <ArrowDown size={16} color="#fff" />
                    </button>
                </div>
            ),
        },
        { header: 'Category Name', accessor: 'name', sortable: true, cell: (row) => <div className="font-medium text-gray-800 dark:text-gray-100">{row.name}</div> },
        { header: 'Description', accessor: 'description', cell: (row) => <div className="text-gray-600 dark:text-gray-400">{row.description || '-'}</div> },

    ];


    const renderActions = (category) => (
        <div className="flex items-center justify-center gap-2">
            {/* View */}
            {/* <button
                onClick={() => handleView(user)}
                className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                title="View User"
            >
                <Eye className="text-blue-600 dark:text-blue-400" size={18} />
            </button> */}

            {/* Edit */}
            <button
                onClick={() => handleOpenEdit(category)}
                className="p-2 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900 transition"
                title="Edit User"
            >
                <Edit className="text-yellow-600 dark:text-yellow-400" size={18} />
            </button>

            {/* Delete */}
            <button
                onClick={() => handleDelete(category._id)}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition"
                title="Delete User"
            >
                <Trash2 className="text-red-600 dark:text-red-400" size={18} />
            </button>
        </div>
    );


    const createButton = {
        label: '+ Add Category',
        onClick: () => setIsCreateModalOpen(true),
    };

    return (
        <>
            <DataTable
                title="Manage Categories"
                columns={columns}
                data={categories}
                renderActions={renderActions}
                headerButton={createButton}
                loading={loading}
            />

            {/* Create Category Modal */}
            <Modal title="Create New Category" isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <CategoryForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalOpen(false)} />
            </Modal>

            {/* Edit Category Panel */}
            <SidePanel title="Edit Category" isOpen={isEditPanelOpen} onClose={() => setIsEditPanelOpen(false)}>
                {selectedCategory && <CategoryForm category={selectedCategory} onSuccess={handleUpdateSuccess} onCancel={() => setIsEditPanelOpen(false)} />}
            </SidePanel>
        </>
    );
};

// --- Reusable Form for Create/Edit ---
const CategoryForm = ({ category, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            if (category) { // Update mode
                response = await axios.put(`${APIURL}/api/categories/${category._id}`, formData);
            } else { // Create mode
                response = await axios.post(`${APIURL}/api/categories/create-category`, formData);
            }
            onSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">{error}</div>}
            <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Description (Optional)</label>
                <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Saving...' : (category ? 'Save Changes' : 'Create Category')}
                </button>
            </div>
        </form>
    );
};

export default CategoriesPage;

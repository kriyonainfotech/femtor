import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, X } from 'lucide-react';
import axios from 'axios';
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock data for the category dropdown.
const coachCategories = [
    "Nail Art",
    "Makeup",
    "Skincare",
    "Hair Styling",
    "Fashion",
];

const CreateCoachPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        categories: coachCategories[0],
        isBestseller: false,
        socialMediaLinks: {
            instagram: { url: '' },
            facebook: { url: '' },
            youtube: { url: '' },
        },
    });

    // New state variables
    const [creationMode, setCreationMode] = useState('new'); // 'new' or 'existing'
    const [allUsers, setAllUsers] = useState([]); // To store non-coach users
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${APIURL}/api/users/get-users?role=USER`);
                console.log("Fetched users for coach creation:", response.data);
                setAllUsers(response.data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Could not load the user list. Please try again.");
            }
        };
        fetchUsers();
    }, []);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${APIURL}/api/categories/get-all-categories`);
                console.log("Fetched categories:", response.data);
                setCategories(response.data || []); // assuming your backend sends { data: [...] }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Could not load categories. Please try again.");
            }
        };

        fetchCategories();
    }, []);

    // Filter users based on search term
    const filteredUsers = searchTerm
        ? allUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    // General form input change handler
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    // Social media link change handler
    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialMediaLinks: {
                ...prev.socialMediaLinks,
                [name]: { url: value },
            }
        }));
    };

    // Handle switching between "Create New" and "Select Existing"
    const handleModeChange = (mode) => {
        setCreationMode(mode);
        setError(null);
        setSelectedUser(null);
        setSearchTerm('');
        // Reset name and email when switching modes
        setFormData(prev => ({
            ...prev,
            name: '',
            email: '',
        }));
    };

    // Handle selecting a user from the search results
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
        setSearchTerm(''); // Hide dropdown after selection
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        // Prepare payload based on the creation mode
        let payload = {
            ...formData,
            categories: [formData.categories],
        };

        if (creationMode === 'existing') {
            if (!selectedUser) {
                setError('Please select an existing user from the list.');
                setLoading(false);
                return;
            }
            // Use userId instead of name/email for existing users
            delete payload.name;
            delete payload.email;
            payload.userId = selectedUser._id;
        }

        console.log("Submitting data:", payload);

        try {
            const response = await axios.post(`${APIURL}/api/coach/create-coach`, payload);
            const data = response.data;
            console.log("Coach created successfully:", data);

            setSuccessMessage(`Coach "${data?.user?.name || selectedUser.name}" created successfully!`);
            setTimeout(() => navigate("/manage-coaches"), 2000);

        } catch (err) {
            console.error("Error creating coach:", err);
            const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const disabledInputStyles = "w-full bg-gray-200 border border-gray-300 text-gray-500 text-sm rounded-lg block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400 cursor-not-allowed";

    return (
        <div className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <UserPlus className="text-blue-600" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Create New Coach / Artist</h2>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300" role="alert">{error}</div>}
                {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/30 dark:text-green-300" role="alert">{successMessage}</div>}

                {/* --- Mode Toggle --- */}
                <div className="flex items-center space-x-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => handleModeChange('new')}
                        className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${creationMode === 'new' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                        Create New User
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('existing')}
                        className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${creationMode === 'existing' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                        Select Existing User
                    </button>
                </div>

                {/* --- User Details Section --- */}
                {creationMode === 'new' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputStyles} required />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <label htmlFor="user-search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Search for a User</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="user-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className={`${inputStyles} pl-10`}
                                    autoComplete="off"
                                />
                            </div>
                            {searchTerm && filteredUsers.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredUsers.map(user => (
                                        <li
                                            key={user._id}
                                            onClick={() => handleUserSelect(user)}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            <div className="font-semibold text-gray-900 dark:text-gray-200">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Selected Name</label>
                                <input type="text" value={formData.name} className={disabledInputStyles} readOnly />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Selected Email</label>
                                <input type="email" value={formData.email} className={disabledInputStyles} readOnly />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Rest of the form remains the same --- */}
                <div>
                    <label
                        htmlFor="categories"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                    >
                        Category
                    </label>
                    <select
                        name="categories"
                        id="categories"
                        value={formData.categories}
                        onChange={handleChange}
                        className={inputStyles}
                    >
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>Loading categories...</option>
                        )}
                    </select>
                </div>

                <fieldset className="border p-4 rounded-lg dark:border-gray-600">
                    <legend className="text-sm font-medium px-2 text-gray-900 dark:text-gray-200">Social Media Links</legend>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="instagram" className="block mb-1 text-xs font-medium text-gray-900 dark:text-gray-200">Instagram URL</label>
                            <input type="url" name="instagram" id="instagram" value={formData.socialMediaLinks.instagram.url} onChange={handleSocialChange} className={inputStyles} placeholder="https://instagram.com/username" />
                        </div>
                        {/* <div>
                            <label htmlFor="facebook" className="block mb-1 text-xs font-medium text-gray-900 dark:text-gray-200">Facebook URL</label>
                            <input type="url" name="facebook" id="facebook" value={formData.socialMediaLinks.facebook.url} onChange={handleSocialChange} className={inputStyles} placeholder="https://facebook.com/username" />
                        </div>
                        <div>
                            <label htmlFor="youtube" className="block mb-1 text-xs font-medium text-gray-900 dark:text-gray-200">YouTube URL</label>
                            <input type="url" name="youtube" id="youtube" value={formData.socialMediaLinks.youtube.url} onChange={handleSocialChange} className={inputStyles} placeholder="https://youtube.com/c/channelname" />
                        </div> */}
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Bio</label>
                    <textarea name="bio" id="bio" rows="3" value={formData.bio} onChange={handleChange} className={inputStyles}></textarea>
                </div>

                <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">Mark as Bestseller?</span>
                    </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Creating...' : 'Create Coach'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCoachPage;


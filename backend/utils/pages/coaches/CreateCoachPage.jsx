import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import axios from 'axios';
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock data for the category dropdown. In a real app, you might fetch this.
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
        categories: coachCategories[0], // Default to the first category
        displayOrder: 99,
        isBestseller: false,
        socialMediaLinks: {
            instagram: { url: '' },
            facebook: { url: '' },
            youtube: { url: '' },
        },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target; // e.g., name="instagram"
        setFormData(prev => ({
            ...prev,
            socialMediaLinks: {
                ...prev.socialMediaLinks,
                [name]: { url: value },
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        // Prepare payload for API (category as an array)
        const payload = {
            ...formData,
            categories: [formData.categories],
        };

        console.log("Submitting data:", payload);

        try {
            const response = await axios.post(`${APIURL}/api/coach/create-coach`, payload);

            const data = response.data; // Axios auto-parses JSON
            console.log("Coach created successfully:", data);

            setSuccessMessage(`Coach "${data.user.name}" created successfully!`);
            setTimeout(() => navigate("/manage-coaches"), 2000);

        } catch (err) {
            console.error("Error creating coach:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <UserPlus className="text-blue-600" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Create New Coach / Artist</h2>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
                {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                </div>

                <div>
                    <label htmlFor="categories" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Category</label>
                    <select name="categories" id="categories" value={formData.categories} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                        {coachCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <fieldset className="border p-4 rounded-lg dark:border-gray-600">
                    <legend className="text-sm font-medium px-2 text-gray-900 dark:text-gray-200">Social Media Links</legend>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="instagram" className="block mb-1 text-xs font-medium text-gray-900 dark:text-gray-200">Instagram URL</label>
                            <input type="url" name="instagram" id="instagram" value={formData.socialMediaLinks.instagram.url} onChange={handleSocialChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="https://instagram.com/username" />
                        </div>
                        <div>
                            <label htmlFor="facebook" className="block mb-1 text-xs font-medium text-gray-900 dark:text-gray-200">Facebook URL</label>
                            <input type="url" name="facebook" id="facebook" value={formData.socialMediaLinks.facebook.url} onChange={handleSocialChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="https://facebook.com/username" />
                        </div>
                        <div>
                            <label htmlFor="youtube" className="block mb-1 text-xs font-medium text-gray-900 dark:text-gray-200">YouTube URL</label>
                            <input type="url" name="youtube" id="youtube" value={formData.socialMediaLinks.youtube.url} onChange={handleSocialChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="https://youtube.com/c/channelname" />
                        </div>
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Bio</label>
                    <textarea name="bio" id="bio" rows="3" value={formData.bio} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* <div>
                        <label htmlFor="displayOrder" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Display Order</label>
                        <input type="number" name="displayOrder" id="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                    </div> */}
                    <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">Mark as Bestseller?</span>
                        </label>
                    </div>
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


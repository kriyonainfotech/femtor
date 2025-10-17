import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PublishingPanel = ({
    formData,
    handleChange,
    isDirty,
    isSaving,
    loading,
    onSaveDraft
}) => {
    const inputStyles =
        "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const labelStyles =
        "block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200";

    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);

    // 🔹 Fetch Artists and Categories when component loads
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [artistsRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_URL}/api/coach/get-all-coaches`),
                    axios.get(`${API_URL}/api/categories/get-all-categories`)
                ]);

                console.log("Fetched artists:", artistsRes.data);
                setArtists(artistsRes.data || []);
                setCategories(categoriesRes.data || []);
            } catch (error) {
                console.error("❌ Error fetching artists or categories:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="sticky top-24">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Course Settings
                </h3>

                {/* Thumbnail URL */}
                <label className={labelStyles}>Thumbnail URL</label>
                <input
                    type="text"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={`${inputStyles} mb-4`}
                />

                {/* Artist Dropdown */}
                <label className={labelStyles}>Artist/Coach</label>
                <select
                    name="artistId"
                    value={formData.artistId}
                    onChange={handleChange}
                    className={`${inputStyles} mb-4`}
                >
                    <option value="">Select Artist</option>
                    {artists.map((artist) => (
                        <option className="text-white" key={artist._id} value={artist._id}>
                            {artist.userId.name}
                        </option>
                    ))}
                </select>

                {/* Category Dropdown */}
                <label className={labelStyles}>Category</label>
                <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`${inputStyles} mb-4`}
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {/* Price */}
                <label className={labelStyles}>Price (₹)</label>
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 499"
                    className={`${inputStyles} mb-4`}
                />

                {/* Certificate toggle */}
                <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <label className={`${labelStyles} flex items-center gap-2`}>
                            <Award size={16} /> Certificate
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="certificate.isEnabled"
                                checked={formData.certificate.isEnabled}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {formData.certificate.isEnabled && (
                        <div className="mt-4">
                            <label className={labelStyles}>Certificate URL</label>
                            <input
                                type="text"
                                name="certificate.url"
                                value={formData.certificate.url}
                                onChange={handleChange}
                                placeholder="URL to the certificate template"
                                className={inputStyles}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Save Draft */}
            <div className="mt-6">
                <button
                    onClick={onSaveDraft}
                    disabled={!isDirty || isSaving || loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : (isDirty ? 'Save Draft' : 'All Changes Saved')}
                </button>
            </div>
        </div>
    );
};

export default PublishingPanel;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, UploadCloud } from 'lucide-react';
import axios from 'axios';
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
    });
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        // Use FormData to send both text and file data
        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('email', formData.email);
        dataToSend.append('role', formData.role);
        if (profilePicFile) {
            dataToSend.append('profilePicture', profilePicFile);
        }

        try {
            const response = await axios.post(
                `${APIURL}/api/users/admin-create`,
                dataToSend,
                {
                    headers: {
                        // Don't set Content-Type manually when sending FormData
                        // 'Authorization': `Bearer ${your_auth_token}`,
                    },
                }
            );

            const data = response.data;

            setSuccessMessage(`User "${data.name}" created successfully!`);
            setFormData({ name: "", email: "", role: "USER" });
            setProfilePicFile(null);
            setPreviewUrl(null);
            setTimeout(() => navigate('/manage-users'), 2000);

        } catch (err) {
            console.error("Error creating user:", error);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="max-w-full mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <UserPlus className="text-blue-600" />
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">Create New User</h2>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
                    {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>}

                    {/* --- Profile Picture Input --- */}
                    <div className="flex items-center gap-6">
                        <img
                            src={previewUrl || 'https://placehold.co/400x400/222/FFF?text=Avatar'}
                            alt="Profile Preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                        />
                        <div>
                            <label htmlFor="profilePicture" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Profile Picture</label>
                            <input
                                type="file"
                                name="profilePicture"
                                id="profilePicture"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/jpg"
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">PNG or JPG (MAX. 5MB).</p>
                        </div>
                    </div>

                    {/* --- Other Form Fields --- */}
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Assign Role</label>
                        <select disabled name="role" id="role" value={formData.role} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                            <option value="USER">User</option>
                            <option value="COACH">Coach</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end items-center gap-3 pt-4">
                        {/* Back Button */}
                        <Link
                            to="/manage-users"
                            className="inline-flex items-center gap-2 bg-gray-400 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </Link>

                        {/* Save / Create Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>


                </form>
            </div>
        </div>
    );
};

export default CreateUserPage;
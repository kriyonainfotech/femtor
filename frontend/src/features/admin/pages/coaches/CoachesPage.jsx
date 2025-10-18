import React, { useEffect, useState } from 'react';
import { Edit, Trash2, MessageSquare } from 'lucide-react';
import SidePanel from '../../../../components/ui/SidePanel';
import { Star } from 'lucide-react';
import DataTable, { ActionMenu } from '../../../../components/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { ArrowUp, ArrowDown } from "lucide-react";

const coachCategories = [
    "Nail Art",
    "Makeup",
    "Skincare",
    "Hair Styling",
    "Fashion",
];

// --- Page Component ---
const CoachesPage = () => {

    const navigate = useNavigate();

    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCoaches = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await axios.get(`${APIURL}/api/coach/getCoachProfiles`);
                console.log("Fetched coaches:", response.data);
                setCoaches(response.data || []);
            } catch (err) {
                console.error("Error fetching coaches:", err);
                setError(err.response?.data?.message || "Failed to fetch coaches");
            } finally {
                setLoading(false);
            }
        };

        fetchCoaches();
    }, []);

    const handleMoveUp = async (index) => {
        console.log("Move up index:", index);
        if (index === 0) return;

        const coach = coaches[index];
        try {
            const res = await axios.put(`${APIURL}/api/coach/${coach._id}/order`, {
                direction: 'up'
            });
            console.log("Reorder response:", res.data);
            setCoaches(res.data.coaches.sort((a, b) => a.count - b.count));
        } catch (err) {
            console.log(err, " error moving coach up");
            alert(err.response?.data?.message || 'Failed to move coach up.');
        }
    };

    const handleMoveDown = async (index) => {
        if (index === coaches.length - 1) return;

        const coach = coaches[index];
        try {
            const res = await axios.put(`${APIURL}/api/coach/${coach._id}/order`, {
                direction: 'down'
            });
            setCoaches(res.data.coaches.sort((a, b) => a.count - b.count));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to move coach down.');
        }
    };


    if (loading) return <div>Loading coaches...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const handleEdit = (coach) => {
        // Here you would fetch the full coach profile by its _id for editing
        // For now, we'll use the data we have
        setSelectedCoach(coach);
        setIsPanelOpen(true);
    };

    const handleDelete = async (coachId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await axios.delete(`${APIURL}/api/coach/delete-coach/${coachId}`);
            console.log(response, "delete resposne")
            setCoaches((prev) => prev.filter((u) => u._id !== coachId));
            alert("coach deleted successfully!");
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete coach.");
        }
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedCoach(null);
    };

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
                        className="p-1 rounded-md bg-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40"
                    >
                        <ArrowUp size={16} color="white" />
                    </button>
                    <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === coaches.length - 1}
                        className="p-1 rounded-md bg-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40"
                    >
                        <ArrowDown size={16} color="white" />
                    </button>
                </div>
            ),
        },
        {
            header: "Coach Name",
            accessor: "userId.name",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                        {row.userId.name}
                    </div>
                </div>
            ),
        },
        {
            header: "Email",
            accessor: "userId.email",
            cell: (row) => (
                <div className="font-medium text-gray-700 dark:text-gray-300">
                    {row.userId.email}
                </div>
            ),
        },
        {
            header: "Category",
            accessor: "categories",
            cell: (row) => (
                <div className="font-medium text-gray-700 dark:text-gray-300">
                    {row.categories?.length ? row.categories.join(", ") : "-"}
                </div>
            ),
        },
        {
            header: "Facebook",
            accessor: "socialMediaLinks.facebook.url",
            cell: (row) =>
                row.socialMediaLinks?.facebook?.url ? (
                    <a
                        href={row.socialMediaLinks.facebook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline"
                    >
                        FB
                    </a>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                ),
        },
        {
            header: "Instagram",
            accessor: "socialMediaLinks.instagram.url",
            cell: (row) =>
                row.socialMediaLinks?.instagram?.url ? (
                    <a
                        href={row.socialMediaLinks.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 dark:text-pink-400 underline"
                    >
                        IG
                    </a>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                ),
        },


    ];

    const renderActions = (coach) => (
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
                onClick={() => handleEdit(coach)}
                className="p-2 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900 transition"
                title="Edit User"
            >
                <Edit className="text-yellow-600 dark:text-yellow-400" size={18} />
            </button>

            {/* Delete */}
            <button
                onClick={() => handleDelete(coach._id)}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition"
                title="Delete User"
            >
                <Trash2 className="text-red-600 dark:text-red-400" size={18} />
            </button>
        </div>
    );


    const createCoachButton = {
        label: '+ Create Coach',
        onClick: () => navigate('/create-coach'),
    };

    return (
        <>
            <DataTable
                title="Manage Coaches / Artists"
                columns={columns}
                data={coaches}
                renderActions={renderActions}
                headerButton={createCoachButton}
                loading={loading}
            />
            <SidePanel title={`Edit ${selectedCoach?.userId?.name || 'Coach'}`} isOpen={isPanelOpen} onClose={handleClosePanel}>
                {selectedCoach && <EditCoachForm coach={selectedCoach} onClose={handleClosePanel} />}
            </SidePanel>
        </>
    );
};
// --- Form inside the Side Panel (UPDATED) ---
// --- Form inside the Side Panel (UPDATED) ---
const EditCoachForm = ({ coach, onClose, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        // Initialize with coach data, providing fallbacks for safety
        bio: coach.bio || '',
        categories: coach.categories?.[0] || coachCategories[0],
        displayOrder: coach.displayOrder || 99,
        isBestseller: coach.isBestseller || false,
        socialMediaLinks: {
            instagram: { url: coach.socialMediaLinks?.instagram?.url || '' },
            facebook: { url: coach.socialMediaLinks?.facebook?.url || '' },
            youtube: { url: coach.socialMediaLinks?.youtube?.url || '' },
        },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialMediaLinks: { ...prev.socialMediaLinks, [name]: { url: value } }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { ...formData, categories: [formData.categories] };

        try {
            const response = await axios.put(`${APIURL}/api/coach/updateCoachProfile/${coach._id}`, payload);
            console.log("Update response:", response.data);
            const updatedDataForUI = { ...response.data, userId: coach._id };
            onUpdateSuccess(updatedDataForUI);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">{error}</div>}

            <div>
                <label htmlFor="categories" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Category</label>
                <select name="categories" id="categories" value={formData.categories} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                    {coachCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <fieldset className="border p-4 rounded-lg dark:border-gray-600">
                <legend className="text-sm font-medium px-2 text-gray-900 dark:text-gray-200">Social Media Links</legend>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="instagram" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Instagram URL</label>
                        <input type="url" name="instagram" id="instagram" value={formData.socialMediaLinks.instagram.url} onChange={handleSocialChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="facebook" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Facebook URL</label>
                        <input type="url" name="facebook" id="facebook" value={formData.socialMediaLinks.facebook.url} onChange={handleSocialChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="youtube" className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">YouTube URL</label>
                        <input type="url" name="youtube" id="youtube" value={formData.socialMediaLinks.youtube.url} onChange={handleSocialChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                    </div>
                </div>
            </fieldset>

            <div>
                <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Bio</label>
                <textarea name="bio" id="bio" rows="3" value={formData.bio} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* <div>
                    <label htmlFor="displayOrder" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Display Order</label>
                    <input type="number" name="displayOrder" id="displayOrder" value={formData.displayOrder} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div> */}
                <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">Bestseller?</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default CoachesPage;

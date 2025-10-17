import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DataTable, { ActionMenu } from '../../../../components/ui/DataTable';
// SidePanel and CourseForm are no longer needed on this page
import { Edit, Trash2, Filter, PlusCircle, Loader } from 'lucide-react'; // Import PlusCircle and Loader

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManageCoursesPage = () => {
    const navigate = useNavigate(); // Initialize the navigate function
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false); // Add state for the create button loader
    const token = localStorage.getItem("token");

    // --- Data Fetching (remains the same) ---
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/courses/get-all-courses`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // 👈 Attach token from localStorage
                    },
                });
                console.log("Fetched courses:", response.data);
                // Ensure data is an array before setting state
                if (Array.isArray(response.data.data)) {
                    setCourses(response.data.data);
                } else {
                    console.error("API did not return an array of courses:", response.data);
                    setCourses([]); // Default to empty array on error
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // --- UPDATED: Create handler now contains the full logic ---
    const handleCreate = async () => {
        setIsCreating(true);
        try {
            // This is the core logic from your CreateCoursePage
            const response = await axios.post(`${API_URL}/api/courses/create-course`, {
                title: "New Draft Course",
                description: "",
                price: 0,
                status: 'Draft'
            });

            const newCourse = response.data.data;
            if (newCourse?._id) {
                // On success, immediately redirect to the new edit page.
                navigate(`/edit-course/${newCourse._id}`);
            } else {
                throw new Error("Failed to get new course ID from the server.");
            }

        } catch (err) {
            console.error("Failed to create course:", err);
            alert("Could not create a new course. Please try again.");
            setIsCreating(false);
        }
        // No need to set isCreating to false on success, as we are navigating away.
    };

    const handleEdit = (course) => {
        // Navigate to the dedicated edit page for the specific course
        navigate(`/edit-course/${course._id}`);
    };

    const handleDelete = async (courseId) => {
        if (window.confirm("Are you sure you want to delete this course and all its lessons? This action cannot be undone.")) {
            try {
                const response = await axios.delete(`${API_URL}/api/courses/delete-course/${courseId}`);
                console.log("Delete response:", response);

                setCourses(courses.filter(c => c._id !== courseId));
            } catch (error) {
                console.error("Failed to delete course:", error);
                alert("Error: Could not delete the course.");
            }
        }
    };

    // --- DataTable Configuration (no changes needed here) ---
    const columns = [
        { header: 'Thumbnail', accessor: 'thumbnailUrl', cell: (row) => <img src={row.thumbnailUrl || 'https://placehold.co/100x60/eee/ccc?text=No+Image'} alt={row.title} className="w-24 h-14 object-cover rounded-md" /> },
        { header: 'Course Title', accessor: 'title', sortable: true, cell: (row) => <div className="font-bold text-gray-800 dark:text-gray-100">{row.title}</div> },
        { header: 'Artist', accessor: 'artistId.name', cell: (row) => <div className="font-bold text-gray-800 dark:text-gray-100">{row.artistId?.name || 'N/A'}</div> },
        { header: 'Category', accessor: 'categoryId.name', cell: (row) => <div className='font-bold text-gray-800 dark:text-gray-100'>{row.categoryId?.name || 'N/A'}</div> },
        { header: 'Lessons', accessor: 'lessons', cell: (row) => <div className="text-blue-600 font-semibold dark:text-blue-400">{row.lessons?.length || 0} Lessons</div> },
        { header: 'Price', accessor: 'price', cell: (row) => <div className="text-green-600 font-semibold dark:text-green-400">₹{row.price?.toFixed(2)}</div> },
        { header: 'Status', accessor: 'status', cell: (row) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'Published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>{row.status}</span> },
    ];

    const renderActions = (course) => (
        <div className="flex items-center justify-center gap-2">
            {/* Edit */}
            <button
                onClick={() => handleEdit(course)}
                className="p-2 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900 transition"
                title="Edit User"
            >
                <Edit className="text-yellow-600 dark:text-yellow-400" size={18} />
            </button>

            {/* Delete */}
            <button
                onClick={() => handleDelete(course._id)}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition"
                title="Delete User"
            >
                <Trash2 className="text-red-600 dark:text-red-400" size={18} />
            </button>
        </div>
    );

    return (
        // The SidePanel component is now completely removed.
        <DataTable
            title="Manage Courses"
            columns={columns}
            data={courses}
            renderActions={renderActions}
            // UPDATED: The header button now shows a loading state
            headerButton={{
                label: isCreating ? <Loader className="animate-spin" size={16} /> : '+ Create Course',
                onClick: handleCreate,
                disabled: isCreating,
            }}
            loading={loading}
        >
            {/* Filter controls can remain here */}
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select className="form-select text-sm"><option>Filter by Artist</option></select>
                <select className="form-select text-sm"><option>Filter by Category</option></select>
            </div>
        </DataTable>
    );

};

export default ManageCoursesPage;


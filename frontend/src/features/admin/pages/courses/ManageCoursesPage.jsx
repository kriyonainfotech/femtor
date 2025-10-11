import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable, { ActionMenu, ToggleSwitch } from '../../../../components/ui/DataTable';
import SidePanel from '../../../../components/ui/SidePanel';
import CourseForm from '../courses/CourseForm'; // We will create this next
import { Edit, Trash2, Filter } from 'lucide-react';
import axios from 'axios';
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Mock Data ---
const mockCourses = [
    {
        _id: '1',
        title: 'Advanced Contouring Techniques',
        artistId: { name: 'Makeup Maven' },
        categoryId: { name: 'Makeup' },
        lessons: [{}, {}, {}],
        price: 99.99,
        status: 'Published',
        thumbnailUrl: 'https://placehold.co/100x60/a2d2ff/ffffff?text=Makeup',
    },
    {
        _id: '2',
        title: 'Beginner Nail Art',
        artistId: { name: 'NailArt Pro' },
        categoryId: { name: 'Nail Art' },
        lessons: [{}, {}, {}, {}],
        price: 49.99,
        status: 'Draft',
        thumbnailUrl: 'https://placehold.co/100x60/ffafcc/ffffff?text=Nail+Art',
    },
    {
        _id: '3',
        title: 'Bridal Hairstyling Essentials',
        artistId: { name: 'Hair by Neha' },
        categoryId: { name: 'Hairstyling' },
        lessons: [{}, {}, {}, {}, {}],
        price: 129.0,
        status: 'Published',
        thumbnailUrl: 'https://placehold.co/100x60/fde2e4/333333?text=Hair',
    },
    {
        _id: '4',
        title: 'Flawless Base Makeup Masterclass',
        artistId: { name: 'Beauty Guru' },
        categoryId: { name: 'Makeup' },
        lessons: [{}, {}, {}],
        price: 89.5,
        status: 'Draft',
        thumbnailUrl: 'https://placehold.co/100x60/cdb4db/ffffff?text=Base',
    },
    {
        _id: '5',
        title: 'Creative Eye Makeup Looks',
        artistId: { name: 'Glam by Simran' },
        categoryId: { name: 'Makeup' },
        lessons: [{}, {}, {}, {}, {}, {}],
        price: 119.99,
        status: 'Published',
        thumbnailUrl: 'https://placehold.co/100x60/bde0fe/333333?text=Eyes',
    },
    {
        _id: '6',
        title: 'Salon Management for Beginners',
        artistId: { name: 'Business Coach Riya' },
        categoryId: { name: 'Business' },
        lessons: [{}, {}, {}],
        price: 59.0,
        status: 'Published',
        thumbnailUrl: 'https://placehold.co/100x60/ffc8dd/333333?text=Salon',
    },
    {
        _id: '7',
        title: 'Professional Nail Sculpting',
        artistId: { name: 'NailArt Pro' },
        categoryId: { name: 'Nail Art' },
        lessons: [{}, {}, {}, {}, {}, {}, {}],
        price: 149.99,
        status: 'Published',
        thumbnailUrl: 'https://placehold.co/100x60/ffafcc/333333?text=Sculpt',
    },
    {
        _id: '8',
        title: 'Airbrush Makeup for Events',
        artistId: { name: 'Pro MUA Anjali' },
        categoryId: { name: 'Makeup' },
        lessons: [{}, {}, {}, {}, {}],
        price: 199.99,
        status: 'Draft',
        thumbnailUrl: 'https://placehold.co/100x60/a2d2ff/333333?text=Airbrush',
    },
];


const ManageCoursesPage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        // Simulating API call
        setLoading(true);
        setTimeout(() => {
            setCourses(mockCourses);
            setLoading(false);
        }, 1000);
    }, []);

    const handleStatusToggle = async (courseId, newStatus) => {
        // API call to update status
        console.log(`Updating course ${courseId} to ${newStatus}`);
        setCourses(courses.map(c => c._id === courseId ? { ...c, status: newStatus } : c));
    };

    const handleUpdateSuccess = (updatedCourse) => {
        setCourses(courses.map(c => (c._id === updatedCourse._id ? updatedCourse : c)));
        setIsEditPanelOpen(false);
    };

    const handleEdit = (course) => {
        navigate(`/edit-course/${course._id}`);
    };

    const columns = [
        { header: 'Thumbnail', accessor: 'thumbnailUrl', cell: (row) => <img src={row.thumbnailUrl} alt={row.title} className="w-24 h-14 object-cover rounded-md" /> },
        { header: 'Course Title', accessor: 'title', sortable: true, cell: (row) => <div className="font-bold text-gray-800 dark:text-gray-100">{row.title}</div> },
        {
            header: 'Artist', accessor: 'artistId.name', cell: (row) => (
                <div className="font-bold text-gray-800 dark:text-gray-100">
                    {row.artistId.name || 'Unknown Artist'}
                </div>
            )
        },
        {
            header: 'Category', accessor: 'categoryId.name', cell: (row) => (
                <div className='font-bold text-gray-800 dark:text-gray-100'>
                    {row.categoryId.name || 'Uncategorized'}
                </div>
            )
        },
        {
            header: 'Lessons',
            accessor: 'lessons',
            cell: (row) => (
                <div className="text-blue-600 font-semibold dark:text-blue-400">
                    {row.lessons.length} Lessons
                </div>
            )
        },
        {
            header: 'Price',
            accessor: 'price',
            cell: (row) => (
                <div className="text-green-600 font-semibold dark:text-green-400">
                    ${row.price.toFixed(2)}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            cell: (row) => <ToggleSwitch enabled={row.status === 'Published'} onChange={() => handleStatusToggle(row._id, row.status === 'Published' ? 'Draft' : 'Published')} />
        },
    ];

    const renderActions = (course) => {
        const actionItems = [
            { label: 'Edit', icon: <Edit size={16} />, onClick: () => handleEdit(course) },
            { label: 'Delete', icon: <Trash2 size={16} />, onClick: () => alert(`Deleting ${course.title}`) },
        ];
        return <ActionMenu items={actionItems} />;
    };

    return (
        <>
            <DataTable
                title="Manage Courses"
                columns={columns}
                data={courses}
                renderActions={renderActions}
                headerButton={{ label: '+ Create Course', onClick: () => navigate('/create-course') }}
                loading={loading}
            >
                {/* Children can be used to add filters or other controls */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <select className="form-select text-sm"><option>Filter by Artist</option></select>
                    <select className="form-select text-sm"><option>Filter by Category</option></select>
                </div>
            </DataTable>
        </>
    );
};

export default ManageCoursesPage;

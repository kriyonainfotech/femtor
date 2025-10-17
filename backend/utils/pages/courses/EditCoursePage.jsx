import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CourseForm from './CourseForm';
import { ArrowLeft, Loader } from 'lucide-react';

const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditCoursePage = () => {
    const navigate = useNavigate();
    const { courseId } = useParams(); // Get the course ID from the URL
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            // --- This is a SIMULATED API call ---
            // In your real app, you would fetch the course by its ID:
            // const response = await axios.get(`${APIURL}/api/courses/${courseId}`);
            // setCourse(response.data);
            console.log("Fetching course with ID:", courseId);
            setLoading(true);
            await new Promise(res => setTimeout(res, 1000));

            // Mock data for demonstration
            const mockCourse = {
                _id: courseId,
                title: 'Advanced Contouring Techniques',
                artistId: { _id: 'artist1', name: 'Makeup Maven' },
                categoryId: { _id: 'cat1', name: 'Makeup' },
                lessons: [
                    { title: 'Lesson 1', description: 'Intro', video: { status: 'completed', url: '...' } }
                ],
                price: 99.99,
                status: 'Published',
                thumbnailUrl: 'https://placehold.co/100x60/a2d2ff/ffffff?text=Course'
            };
            setCourse(mockCourse);
            setLoading(false);
        };

        fetchCourse();
    }, [courseId]);

    const handleUpdateSuccess = (updatedCourse) => {
        console.log("Course updated successfully:", updatedCourse);
        alert(`Course "${updatedCourse.title}" has been updated!`);
        navigate('/manage-courses'); // Redirect back to the main list
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div>
            <Link to="/manage-courses" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6 font-semibold">
                <ArrowLeft size={18} />
                Back to All Courses
            </Link>

            {course && <CourseForm course={course} onSuccess={handleUpdateSuccess} />}
        </div>
    );
};

export default EditCoursePage;

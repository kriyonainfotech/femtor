import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseForm from '../courses/CourseForm';
import { ArrowLeft } from 'lucide-react';

const CreateCoursePage = () => {
    const navigate = useNavigate();

    const handleCreateSuccess = (newCourse) => {
        console.log("Course created successfully:", newCourse);
        alert(`Course "${newCourse.title}" created!`);
        navigate('/manage-courses'); // Redirect back to the main list
    };

    return (
        <div>
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6 font-semibold">
                <ArrowLeft size={18} />
                Back to All Courses
            </button>
            <CourseForm onSuccess={handleCreateSuccess} />
        </div>
    );
};

export default CreateCoursePage;

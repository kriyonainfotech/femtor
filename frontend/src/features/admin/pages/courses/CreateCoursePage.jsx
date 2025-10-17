import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreateCoursePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateCourse = async () => {
        setIsLoading(true);
        setError('');
        try {
            // This is the core logic: create a barebones course on the backend.
            const response = await axios.post(`${API_URL}/api/courses`, {
                title: "New Draft Course",
                description: "",
                price: 0,
                status: 'Draft'
            });

            console.log("Create course response:", response);
            const newCourse = response.data.data;
            if (newCourse?._id) {
                // On success, immediately redirect to the new edit page.
                navigate(`/edit-course/${newCourse._id}`);
            } else {
                throw new Error("Failed to get new course ID from the server.");
            }

        } catch (err) {
            console.error("Failed to create course:", err);
            setError("Could not create a new course. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Create a New Course</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                Start by creating a new draft. You'll be taken to the editor where you can add all your details, lessons, and videos.
            </p>
            <button
                onClick={handleCreateCourse}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
                {isLoading ? (
                    <Loader className="animate-spin" size={24} />
                ) : (
                    <PlusCircle size={24} />
                )}
                <span>{isLoading ? 'Creating Draft...' : 'Start New Course'}</span>
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
    );
};

export default CreateCoursePage;

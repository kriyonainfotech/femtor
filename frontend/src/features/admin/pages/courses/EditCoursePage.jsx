import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseForm from '../../../../components/courses/CourseForm';
import { ArrowLeft, Loader, Save, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- New Skeleton Loader Component ---
// This provides a much better loading experience than a simple spinner.
const EditPageSkeleton = () => (
    <div>
        {/* Skeleton for the sticky header */}
        <div className="h-16 mb-6 animate-pulse">
            <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                    <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                    <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);


const EditCoursePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- State for the new UI elements ---
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [currentTitle, setCurrentTitle] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/courses/get-course/${courseId}`);
                if (!response.data.data) throw new Error("Course not found");
                setCourse(response.data.data);
                setCurrentTitle(response.data.data.title); // Initialize title for the header
            } catch (err) {
                console.error("Failed to fetch course data:", err);
                setError("Could not load course. It may have been deleted or an error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) fetchCourse();
    }, [courseId]);

    const handleSuccess = () => {
        alert("Course published successfully!");
        navigate('/manage-courses');
    };

    // The main loading state now shows the beautiful skeleton loader
    if (isLoading) {
        return <EditPageSkeleton />;
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500">{error}</p>
                <button onClick={() => navigate('/manage-courses')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* --- The New Sticky Command Center Header --- */}
            <div className="sticky -top-6 z-10 bg-gray-50 dark:bg-gray-900/80 backdrop-blur-sm -mx-6 px-8 py-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('/manage-courses')} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold">
                            <ArrowLeft size={16} />
                            Back to Courses
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate max-w-lg" title={currentTitle}>
                            {currentTitle}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Auto-save indicator */}
                        <div className="text-sm text-gray-500 transition-opacity duration-300">
                            {isSaving ? 'Saving...' : (isDirty ? 'Unsaved changes' : 'All changes saved')}
                        </div>
                        <button
                            onClick={() => document.getElementById('publish-button').click()} // Trigger form's publish
                            disabled={isDirty || isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send size={16} />
                            Publish Course
                        </button>
                    </div>
                </div>
            </div>

            {/* The CourseForm is now the heart of the page, handling all the logic.
                We pass down functions to keep the parent page (this file) updated on the form's state. */}
            <CourseForm
                key={course._id} // THIS IS THE FIX!
                course={course}
                onSuccess={handleSuccess}
                onStateChange={({ isDirty, isSaving, title }) => {
                    setIsDirty(isDirty);
                    setIsSaving(isSaving);
                    if (title) setCurrentTitle(title);
                }}
            />
        </div>
    );
};

export default EditCoursePage;

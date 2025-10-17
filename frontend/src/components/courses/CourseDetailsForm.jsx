import React from 'react';

const CourseDetailsForm = ({ formData, handleChange }) => {
    const inputStyles = "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Main Details</h3>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Course Title</label>
            <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced Contouring Techniques"
                className={`${inputStyles} mb-4`}
            />
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Course Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn in this course..."
                rows="4"
                className={inputStyles}
            />
        </div>
    );
};

export default CourseDetailsForm;

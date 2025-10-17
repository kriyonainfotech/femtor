import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, GripVertical, ChevronDown, X } from 'lucide-react';
import VideoUploader from './VideoUploader'; // Import the new, separate component

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LessonList = ({ lessons, setLessons, courseId }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [expandedLesson, setExpandedLesson] = useState(null);
    const token = localStorage.getItem("token");

    const handleLessonChange = (index, field, value) => {
        setLessons(prevLessons => {
            const newLessons = [...prevLessons];
            newLessons[index][field] = value;
            return newLessons;
        });
    };

    const addLesson = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/courses/${courseId}/lessons`);
            setExpandedLesson(lessons.length);
            setLessons([...lessons, response.data.data]);
        } catch (error) {
            console.error("Failed to add lesson:", error);
            alert("Error: Could not add a new lesson.");
        }
    };

    const handleVideoUpload = async (lessonIndex) => {
        const lesson = lessons[lessonIndex];
        const file = lesson.selectedFile;

        if (!file || !lesson.title) {
            alert("Please provide a lesson title and select a video file.");
            return;
        }

        // --- STEP 1: CREATE THE OFFICIAL RECORD ON THE BACKEND ---
        // We set a temporary "initializing" status in the UI.
        handleLessonChange(lessonIndex, 'video', { status: 'initializing' });

        let videoId, uploadUrl, objectKey;

        try {
            console.log("Step 1: Calling backend to initialize upload and create DB record...");
            const initResponse = await axios.post(`${API_URL}/api/videos/initialize-upload`, {
                fileName: file.name,
                fileSize: file.size,
                contentType: file.type,
                title: lesson.title,
                description: lesson.description,
                lessonId: lesson._id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }

            );

            videoId = initResponse.data.videoId;
            uploadUrl = initResponse.data.uploadUrl;
            objectKey = initResponse.data.objectKey;

            console.log(`Backend confirmed. VideoID: ${videoId}, ObjectKey: ${objectKey}`);

            // Instantly update the lesson with the permanent videoId.
            // From this point on, even if the user refreshes, this lesson is officially in the system.
            handleLessonChange(lessonIndex, 'video', {
                _id: videoId,
                status: 'uploading',
                progress: 0,
                objectKey: objectKey
            });

        } catch (error) {
            console.error("CRITICAL: Failed to initialize upload on the backend.", error);
            handleLessonChange(lessonIndex, 'video', { status: 'failed', error: "Could not contact server. Please try again." });
            return; // Stop the process if we can't create the record.
        }

        // --- STEP 2: UPLOAD THE FILE DIRECTLY TO S3 ---
        try {
            console.log("Step 2: Uploading file directly to S3...");
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    handleLessonChange(lessonIndex, 'video', {
                        _id: videoId,
                        status: 'uploading',
                        progress: percentCompleted,
                        objectKey: objectKey
                    });
                }
            });

            console.log("Step 3: Upload to S3 complete. Handing off to backend for processing.");
            // The UI will now wait for the WebSocket message to change status to 'processing'.
            handleLessonChange(lessonIndex, 'video', {
                _id: videoId,
                status: 'uploaded', // This status tells the user the upload is done, and processing is next.
                progress: 100,
                objectKey: objectKey
            });

        } catch (error) {
            console.error("CRITICAL: S3 upload failed.", error);
            // If the S3 upload fails, we set the status to 'failed'.
            // The backend can have a cleanup job for videos stuck in 'initializing'.
            handleLessonChange(lessonIndex, 'video', { _id: videoId, status: 'failed', error: "Upload to storage failed." });
        }
    };

    const confirmDeleteLesson = async () => {
        const index = showDeleteModal;
        if (index === null) return;
        const lessonToDelete = lessons[index];
        setShowDeleteModal(null);

        if (lessonToDelete.video?._id) {
            try {
                await axios.delete(`${API_URL}/api/videos/${lessonToDelete.video._id}`);
            } catch (error) {
                console.error("Failed to delete video from server:", error);
                alert("Error: Could not delete the video. Please try again.");
                return;
            }
        }
        setLessons(lessons.filter((_, i) => i !== index));
    };

    const handleDeleteClick = (index) => {
        setShowDeleteModal(index);
    };

    const handleRetryUpload = (lessonIndex) => {
        setLessons((prev) =>
            prev.map((lesson, i) =>
                i === lessonIndex
                    ? {
                        ...lesson,
                        selectedFile: null, // clear the old file
                        video: {
                            status: "idle", // reset status
                            progress: 0,
                            urls: null,
                        },
                    }
                    : lesson
            )
        );
    };

    const inputStyles = "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Lessons</h3>
                <button onClick={addLesson} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    <PlusCircle size={18} /> Add Lesson
                </button>
            </div>
            <div className="space-y-2">
                {lessons.map((lesson, index) => (
                    <div key={lesson._id || index} className="border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg transition-all duration-300">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedLesson(expandedLesson === index ? null : index)}
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical className="text-gray-400 cursor-grab" />
                                <span className="font-semibold text-gray-800 dark:text-gray-100">{lesson.title || `Lesson ${index + 1}`}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* You can add a status indicator icon here */}
                                <ChevronDown
                                    size={20}
                                    className={`text-gray-500 transition-transform duration-300 ${expandedLesson === index ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>
                        {/* Collapsible Content with smooth animation */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedLesson === index ? 'max-h-screen' : 'max-h-0'}`}>
                            <div className="p-4 border-t dark:border-gray-600 space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Lesson Title</label>
                                    <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                                        placeholder={`Lesson ${index + 1} Title`}
                                        className={inputStyles}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Lesson Description</label>
                                    <textarea
                                        value={lesson.description}
                                        onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                                        placeholder="Describe what this lesson is about..."
                                        rows="3"
                                        className={inputStyles}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Lesson Video</label>
                                    <VideoUploader
                                        video={lesson.video}
                                        onFileSelect={(file) => handleLessonChange(index, 'selectedFile', file)}
                                        onUploadClick={() => handleVideoUpload(index)}
                                        isUploadDisabled={!lesson.title || !lesson.selectedFile}
                                        onRetryClick={() => handleRetryUpload(index)}
                                    />
                                </div>
                                <button onClick={() => handleDeleteClick(index)} disabled={['uploading', 'processing'].includes(lesson.video?.status)} className="disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                                    <Trash2 size={18} className="text-red-500 hover:text-red-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {lessons.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-6">No lessons yet. Click "Add Lesson" to get started.</p>}
            </div>

            {showDeleteModal !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
                            <button onClick={() => setShowDeleteModal(null)}><X size={20} /></button>
                        </div>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this lesson? This will permanently remove the video and all its data. This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-sm font-medium rounded-md border dark:border-gray-600">Cancel</button>
                            <button onClick={confirmDeleteLesson} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LessonList;

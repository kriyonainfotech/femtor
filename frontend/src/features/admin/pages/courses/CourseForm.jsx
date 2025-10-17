import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, UploadCloud, CheckCircle, Loader, GripVertical, Award, Film, UploadIcon, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '../../../../Context/AuthContext';
// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

// --- Helper Component 1: VideoStatusIndicator ---
// This component's only job is to display the correct UI for the video's current status.
const VideoStatusIndicator = ({ video, onRetryClick }) => {
    if (video?.status === 'uploading') {
        return (
            <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${video.progress}%` }}></div>
                </div>
                <span className="text-xs text-center block mt-1 text-gray-600 dark:text-gray-300">{`Uploading... ${video.progress}%`}</span>
            </div>
        );
    }
    if (video?.status === 'uploaded') {
        return (<div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"><CheckCircle size={16} /><span>Upload complete. Awaiting processing...</span></div>);
    }
    if (video?.status === 'processing') {
        return (
            <div className="flex items-center gap-3 text-sm">
                <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full absolute animate-ping"></div>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                    <span>Processing video...</span>
                    {video.estimatedProcessingTime && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Info size={12} />
                            <span>Est. time: {Math.ceil(video.estimatedProcessingTime / 60)} min</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    if (video?.status === 'completed') {
        return (<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle size={16} /><span>Video is ready.</span></div>);
    }
    if (video?.status === 'failed') {
        return (
            <div className="p-3 text-center bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="flex justify-center items-center gap-2 text-sm text-red-600 dark:text-red-400"><AlertTriangle size={16} /><span>Processing failed.</span></div>
                <button type="button" onClick={onRetryClick} className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Try Upload Again</button>
            </div>
        );
    }
    // If status is 'idle' or unknown, we render nothing, letting the uploader show.
    return null;
};

// --- Helper Component 2: VideoUploader ---
// This component handles the UI for selecting and uploading a file.
const VideoUploader = ({ video, onFileSelect, onUploadClick, isUploadDisabled, onRetryClick }) => {
    // We manage the selected file locally to show the name in the UI before upload.
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Pre-upload file checks
            if (file.size > 10 * 1024 * 1024 * 1024) { // 10 GB limit
                alert("File size exceeds the 10 GB limit.");
                return;
            }
            if (!file.type.startsWith("video/")) {
                alert("Invalid file type. Please select a video file.");
                return;
            }
            setSelectedFile(file);
            onFileSelect(file); // Notify the parent component of the selected file
        }
    };

    // We first check if there's a status to display (uploading, processing, etc.)
    const statusIndicator = <VideoStatusIndicator video={video} onRetryClick={onRetryClick} />;
    if (video?.status && video.status !== 'idle') {
        return statusIndicator;
    }

    // If the status is 'idle', we show the uploader interface.
    return (
        <div className="space-y-2">
            <label className="flex items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud size={24} className="text-gray-500 dark:text-gray-400" />
                    <p className="text-xs text-gray-800 dark:text-gray-200 mt-1">
                        {selectedFile ? selectedFile.name : <span className="font-semibold">Select video file</span>}
                    </p>
                </div>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button
                type="button"
                onClick={onUploadClick}
                disabled={isUploadDisabled}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <UploadIcon size={16} />
                Upload Video
            </button>
        </div>
    );
};


// --- Main Component ---
const CourseForm = ({ course, onSuccess }) => {
    const { user } = useAuth();
    const isEditMode = !!course;
    const token = localStorage.getItem("token");

    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        thumbnailUrl: course?.thumbnailUrl || '',
        artistId: course?.artistId?._id || '',
        categoryId: course?.categoryId?._id || '',
        price: course?.price || 0,
        certificate: {
            isEnabled: course?.certificate?.isEnabled || false,
            url: course?.certificate?.url || '',
        },
        trailerVideo: course?.trailerVideo || { status: 'idle' }, // Make sure trailer video has a state
    });
    const [lessons, setLessons] = useState(course?.lessons || []);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- REAL-TIME UPDATES via WEBSOCKET ---
    useEffect(() => {
        const userId = user?._id;
        if (!userId) return;

        const ws = new WebSocket(`${WS_URL}?userId=${userId}`);
        ws.onopen = () => console.log("[WebSocket] Connection established.");
        ws.onclose = () => console.log("[WebSocket] Connection closed.");
        ws.onerror = (err) => console.error("[WebSocket] Error:", err);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("[WebSocket] Received real-time update:", message);

            // This is the core of the real-time UI. It finds the correct lesson
            // using the permanent `videoId` and updates its status.
            setLessons(prevLessons =>
                prevLessons.map(lesson => {
                    if (lesson.video?._id === message.videoId) {
                        return {
                            ...lesson,
                            video: { ...lesson.video, status: message.status, urls: message.videoResolutions, estimatedProcessingTime: message.estimatedProcessingTime }
                        };
                    }
                    return lesson;
                })
            );
        };

        // Cleanup when the component unmounts
        return () => ws.close();
    }, [user]);

    // --- AUTO-SAVING DRAFTS ---
    const debounceTimeout = useRef(null);
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            if (isEditMode) handleAutoSave();
        }, 2500);
        return () => clearTimeout(debounceTimeout.current);
    }, [formData, lessons]);

    const handleAutoSave = async () => {
        setIsSaving(true);
        const lessonIds = lessons.map(lesson => lesson.video?._id).filter(Boolean);
        const payload = { ...formData, lessons: lessonIds, status: 'Draft' };
        try {
            const response = await axios.put(`${API_URL}/api/courses/${course._id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`, // 👈 Attach token from localStorage
                },
            });
            console.log(response, "response")
        } catch (error) {
            console.error("Auto-save failed:", error);
        } finally {
            setTimeout(() => setIsSaving(false), 1000);
        }
    };

    // --- FORM HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("certificate.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, certificate: { ...prev.certificate, [field]: type === 'checkbox' ? checked : value } }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    const handleLessonChange = (index, field, value) => {
        setLessons(prevLessons => {
            const newLessons = [...prevLessons];
            newLessons[index][field] = value;
            return newLessons;
        });
    };


    const addLesson = () => {
        setLessons([...lessons, { title: '', description: '', video: { status: 'idle' } }]);
    };

    // --- SAFE DELETION LOGIC ---
    const handleDeleteClick = (index) => {
        setShowDeleteModal(index);
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
            const lessonId = lesson._id;

            console.log("Step 1: Calling backend to initialize upload and create DB record...");
            const initResponse = await axios.post(`${API_URL}/api/videos/initialize-upload`, {
                fileName: file.name,
                fileSize: file.size,
                contentType: file.type,
                title: lesson.title,
                description: lesson.description,
            });

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


    // Placeholder for trailer upload
    const handleTrailerUpload = (file) => alert("Trailer upload logic goes here!");

    const handleRetryUpload = (lessonIndex) => {
        handleLessonChange(lessonIndex, 'video', { status: 'idle' });
        handleLessonChange(lessonIndex, 'selectedFile', null);
    };

    const handleSubmit = async (status) => {
        // Implement your final course submission logic here
        console.log("Submitting course with status:", status);
        alert("Course submission logic goes here!");
    };

    const inputStyles = "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const labelStyles = "block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Main Details</h3>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Course Title" className={`${inputStyles} mb-4`} />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Course Description" rows="4" className={inputStyles}></textarea>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <Film size={20} className="text-gray-600 dark:text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Trailer</h3>
                    </div>
                    <VideoUploader video={formData.trailerVideo} onFileSelect={handleTrailerUpload} onUploadClick={() => alert("Trailer upload logic needed!")} isUploadDisabled={!formData.trailerVideo?.selectedFile} onRetryClick={() => { /* trailer retry logic */ }} />
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Lessons</h3>
                        <button onClick={addLesson} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"><PlusCircle size={18} /> Add Lesson</button>
                    </div>
                    <div className="space-y-4">
                        {lessons.map((lesson, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 flex gap-3 items-start">
                                <GripVertical className="mt-10 text-gray-400 cursor-grab flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <input type="text" value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} placeholder={`Lesson ${index + 1} Title`} className={inputStyles} />
                                    <textarea value={lesson.description} onChange={(e) => handleLessonChange(index, 'description', e.target.value)} placeholder="Lesson Description" rows="2" className={inputStyles}></textarea>
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
                        ))}
                        {lessons.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No lessons yet.</p>}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Publishing</h3>
                    <label className={labelStyles}>Course Thumbnail</label>
                    <input type="text" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="Image URL" className={`${inputStyles} mb-4`} />
                    <label className={labelStyles}>Artist/Coach</label>
                    <select name="artistId" value={formData.artistId} onChange={handleChange} className={`${inputStyles} mb-4`}>
                        <option value="">Select Artist</option>
                        <option value="artist1">Makeup Maven</option>
                        <option value="artist2">NailArt Pro</option>
                    </select>
                    <label className={labelStyles}>Category</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={`${inputStyles} mb-4`}>
                        <option value="">Select Category</option>
                        <option value="cat1">Makeup</option>
                        <option value="cat2">Nail Art</option>
                    </select>
                    <label className={labelStyles}>Price</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 49.99" className={`${inputStyles} mb-4`} />
                    <div className="pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <label className={`${labelStyles} flex items-center gap-2`}><Award size={16} /> Certificate</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="certificate.isEnabled" checked={formData.certificate.isEnabled} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        {formData.certificate.isEnabled && (
                            <input type="text" name="certificate.url" value={formData.certificate.url} onChange={handleChange} placeholder="Certificate URL" className={inputStyles} />
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={() => handleSubmit('Published')} disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Saving...' : (isEditMode ? 'Update & Publish' : 'Publish Course')}
                    </button>
                    <button onClick={() => handleSubmit('Draft')} disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                </div>
            </div>

            {/* --- SAFE DELETION MODAL --- */}
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

export default CourseForm;


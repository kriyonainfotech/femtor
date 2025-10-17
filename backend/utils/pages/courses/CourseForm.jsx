import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, UploadCloud, CheckCircle, Loader, GripVertical, Award, Film, UploadIcon, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '../../../../Context/AuthContext';

// NOTE: Using a hardcoded URL for now. In production, this should come from an environment variable.
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

const CourseForm = ({ course, onSuccess }) => {

    const { user } = useAuth();
    const isEditMode = !!course;
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        thumbnailUrl: course?.thumbnailUrl || '',
        artistId: course?.artistId?._id || '',
        categoryId: course?.categoryId?._id || '',
        price: course?.price || 0,
        trailerVideo: course?.trailerVideo || { status: 'idle', progress: 0 },
        certificate: {
            isEnabled: course?.certificate?.isEnabled || false,
            url: course?.certificate?.url || '',
        }
    });
    const [lessons, setLessons] = useState(course?.lessons || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userId = user?._id;

        if (!userId) {
            console.log("No user logged in, WebSocket connection paused.");
            return;
        };

        const ws = new WebSocket(`wss://dec4a4aeb3dc.ngrok-free.app?userId=${userId}`);

        if (!userId) return;

        console.log("DEBUG: WS_URL is:", WS_URL);
        console.log("DEBUG: userId is:", userId);

        ws.onopen = () => console.log("WebSocket connection established.");
        ws.onclose = () => console.log("WebSocket connection closed.");
        ws.onerror = (err) => console.error("WebSocket error:", err);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received real-time update:", message);

            setLessons(prevLessons =>
                prevLessons.map(lesson => {
                    // Message 1: The S3 trigger confirms processing has started.
                    // It links our temporary objectKey to the permanent videoId.
                    if (lesson.video?.objectKey === message.objectKey) {
                        return {
                            ...lesson,
                            video: { ...lesson.video, _id: message.videoId, status: message.status }
                        };
                    }
                    // Message 2: The ECS trigger confirms the job is completed or failed.
                    // We match by the permanent videoId we received earlier.
                    if (lesson.video?._id === message.videoId) {
                        return {
                            ...lesson,
                            video: { ...lesson.video, status: message.status, urls: message.videoResolutions }
                        };
                    }
                    return lesson;
                })
            );
        };

        // Cleanup: Close the connection when the component unmounts
        return () => ws.close();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("certificate.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, certificate: { ...prev.certificate, [field]: type === 'checkbox' ? checked : value } }));
        } else {
            setFormData({ ...formData, [name]: e.target.value });
        }
    };

    const handleLessonChange = (index, field, value) => {
        const newLessons = [...lessons];
        newLessons[index][field] = value;
        setLessons(newLessons);
    };

    const addLesson = () => {
        setLessons([...lessons, { title: '', description: '', video: { status: 'idle', progress: 0 } }]);
    };

    const removeLesson = (index) => {
        setLessons(lessons.filter((_, i) => i !== index));
    };

    // --- REAL VIDEO UPLOAD LOGIC ---
    const handleVideoUpload = async (lessonIndex) => {
        const lesson = lessons[lessonIndex];
        const file = lesson.selectedFile;
        if (!file || !lesson.title) {
            alert("Please provide a lesson title and select a video file before uploading.");
            return;
        }

        handleLessonChange(lessonIndex, 'video', { status: 'uploading', progress: 0 });

        try {
            // STEP 1: Ask backend for presigned URL, NOW WITH METADATA
            const presignedUrlResponse = await axios.post(`${APIURL}/api/videos/upload-video`, {
                fileName: file.name,
                contentType: file.type,
                // Pass the title and description from the form
                title: lesson.title,
                description: lesson.description,
            });

            console.log("Presigned URL response:", presignedUrlResponse.data);
            if (!presignedUrlResponse?.data?.uploadUrl || !presignedUrlResponse?.data?.objectKey) {
                throw new Error("Invalid response from server: Missing upload URL or object key");
            }
            const { uploadUrl, objectKey } = presignedUrlResponse.data;
            handleLessonChange(lessonIndex, 'video', { status: 'uploading', progress: 0, objectKey });

            // STEP 2: Upload the file directly to the S3 URL
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    handleLessonChange(lessonIndex, 'video', { status: 'uploading', progress: percentCompleted, objectKey });
                }
            });

            // STEP 3: Confirm the upload. The backend now already has the metadata from S3.
            handleLessonChange(lessonIndex, 'video', { status: 'uploaded', progress: 100, objectKey });
            console.log("Upload to S3 complete. Waiting for backend to confirm processing has started...");


        } catch (error) {
            console.error("Upload failed:", error);
            handleLessonChange(lessonIndex, 'video', { status: 'failed', progress: 0 });
        }
    };

    // You would implement a similar function for the trailer
    const handleTrailerUpload = async (file) => {
        // ... similar logic to handleVideoUpload ...
        alert("Trailer upload logic would go here!");
    };

    const handleRetryUpload = (lessonIndex) => {
        // Reset the video state for the specific lesson, allowing a new upload attempt
        handleLessonChange(lessonIndex, 'video', { status: 'idle', progress: 0 });
        handleLessonChange(lessonIndex, 'selectedFile', null);
    };

    const handleSubmit = async (status) => {
        setLoading(true);
        // The lesson objects now contain the MongoDB _id of the created Video document.
        // We just need to send the array of IDs.
        const lessonIds = lessons.map(lesson => lesson.video._id).filter(id => id);

        const payload = {
            ...formData,
            lessons: lessonIds, // Send only the IDs
            status
        };

        try {
            if (isEditMode) {
                // Update existing course
                await axios.put(`${APIURL}/api/courses/${course._id}`, payload);
            } else {
                // Create new course
                await axios.post(`${APIURL}/api/courses`, payload);
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save course:", error);
            alert("Error: Could not save course.");
        } finally {
            setLoading(false);
        }
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
                    <VideoUploader video={formData.trailerVideo} onFileSelect={handleTrailerUpload} />
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Lessons</h3>
                        <button onClick={addLesson} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                            <PlusCircle size={18} /> Add Lesson
                        </button>
                    </div>
                    <div className="space-y-4">
                        {lessons.map((lesson, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 flex gap-3">
                                <GripVertical className="mt-10 text-gray-400 cursor-grab" />
                                <div className="flex-1 space-y-3">
                                    <input type="text" value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} placeholder={`Lesson ${index + 1} Title`} className={inputStyles} />
                                    <textarea value={lesson.description} onChange={(e) => handleLessonChange(index, 'description', e.target.value)} placeholder="Lesson Description" rows="2" className={inputStyles}></textarea>
                                    <VideoUploader
                                        video={lesson.video}
                                        selectedFile={lesson.selectedFile}
                                        isUploadDisabled={!lesson.title || !lesson.selectedFile}
                                        onFileSelect={(file) => handleLessonChange(index, 'selectedFile', file)}
                                        onUploadClick={() => handleVideoUpload(index)}
                                        onRetryClick={() => handleRetryUpload(index)} // Pass the retry handler
                                    />
                                </div>
                                <button onClick={() => removeLesson(index)}><Trash2 size={18} className="text-red-500 hover:text-red-600" /></button>
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
        </div>
    );
};

const VideoUploader = ({ video, selectedFile, onFileSelect, onUploadClick, isUploadDisabled, onRetryClick }) => {
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    // This part handles the visual state based on the video object's status
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

    // NEW STATE: When upload is done, but we're waiting for the backend to confirm processing.
    if (video?.status === 'uploaded') {
        return (<div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"><CheckCircle size={16} /><span>Upload complete. Awaiting processing...</span></div>);
    }

    if (video?.status === 'processing') {
        return (<div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400"><Loader size={16} className="animate-spin" /><span>Processing video...</span></div>);
    }

    // Changed this condition slightly to be more robust
    if (video?.status === 'completed') {
        return (<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle size={16} /><span>Video is ready.</span></div>);
    }

    if (video?.status === 'failed') {
        return (
            <div className="p-3 text-center bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="flex justify-center items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle size={16} />
                    <span>Upload failed.</span>
                </div>
                <button
                    type="button"
                    onClick={onRetryClick}
                    className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="flex items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud size={24} className="text-gray-500 dark:text-gray-400" />
                    {selectedFile ? (
                        <p className="text-xs text-gray-800 dark:text-gray-200 mt-1">{selectedFile.name}</p>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Select video file</span></p>
                    )}
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

export default CourseForm;


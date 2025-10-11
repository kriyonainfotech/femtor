import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, UploadCloud, CheckCircle, Loader, GripVertical } from 'lucide-react';

const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CourseForm = ({ course, onSuccess }) => {
    const isEditMode = !!course;
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        thumbnailUrl: course?.thumbnailUrl || '',
        artistId: course?.artistId?._id || '',
        categoryId: course?.categoryId?._id || '',
        price: course?.price || 0,
    });
    const [lessons, setLessons] = useState(course?.lessons || []);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    // --- Video Upload Logic ---
    const handleVideoUpload = async (file, lessonIndex) => {
        if (!file) return;

        handleLessonChange(lessonIndex, 'video', { status: 'uploading', progress: 0 });

        try {
            console.log("Requesting presigned URL...");
            await new Promise(res => setTimeout(res, 500));
            const uploadUrl = "https://s3.mock.upload.url/your-video";

            console.log("Uploading to S3...");
            await axios.put(uploadUrl, file, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    const newLessons = [...lessons];
                    newLessons[lessonIndex].video = { status: 'uploading', progress: percentCompleted };
                    setLessons(newLessons);
                }
            });

            console.log("Upload complete! Now processing...");
            handleLessonChange(lessonIndex, 'video', { status: 'processing', progress: 100 });

            await new Promise(res => setTimeout(res, 3000));
            handleLessonChange(lessonIndex, 'video', { status: 'completed', progress: 100, url: 'https://final.video.url/playlist.m3u8' });

        } catch (error) {
            console.error("Upload failed:", error);
            handleLessonChange(lessonIndex, 'video', { status: 'failed', progress: 0 });
        }
    };

    const handleSubmit = async (status) => {
        setLoading(true);
        const payload = { ...formData, lessons, status };
        console.log("Submitting payload:", payload);
        await new Promise(res => setTimeout(res, 1000));
        setLoading(false);
        onSuccess({ ...payload, _id: course?._id || Date.now() });
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
                                    <VideoUploader video={lesson.video} onFileSelect={(file) => handleVideoUpload(file, index)} />
                                    <textarea value={lesson.description} onChange={(e) => handleLessonChange(index, 'description', e.target.value)} placeholder="Lesson Description" rows="2" className={inputStyles}></textarea>
                                </div>
                                <button onClick={() => removeLesson(index)}><Trash2 size={18} className="text-red-500 hover:text-red-600" /></button>
                            </div>
                        ))}
                        {lessons.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No lessons yet. Click 'Add Lesson' to get started.</p>}
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
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 49.99" className={inputStyles} />
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


// --- Helper component for video upload state ---
const VideoUploader = ({ video, onFileSelect }) => {
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    switch (video?.status) {
        case 'uploading':
            return (
                <div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${video.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-center block mt-1 text-gray-600 dark:text-gray-300">{`Uploading... ${video.progress}%`}</span>
                </div>
            );
        case 'processing':
            return (
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <Loader size={16} className="animate-spin" />
                    <span>Processing video... Please wait.</span>
                </div>
            );
        case 'completed':
            return (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle size={16} />
                    <span>Video is ready.</span>
                </div>
            );
        case 'failed':
            return <p className="text-sm text-red-500 dark:text-red-400">Upload failed. Please try again.</p>;
        default:
            return (
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud size={24} className="text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload video</span></p>
                        </div>
                        <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
            );
    }
};

export default CourseForm;


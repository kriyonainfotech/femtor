import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { UploadCloud, CheckCircle, Loader, AlertTriangle, UploadIcon, Info } from 'lucide-react';

// --- Helper Component 1: VideoStatusIndicator ---
const VideoStatusIndicator = ({ video, onRetryClick }) => {

    // --- 1. THE MOST IMPORTANT LOG ---
    // This will show us the exact object this component receives.
    console.log("VideoStatusIndicator received video prop:", video);

    const isCompleted = video?.status === 'completed' || video?.progress === 'completed';
    const playlistUrl = video?.urls?.playlist || video?.videoResolutions?.playlist;

    // --- 2. LOGGING THE DECISIONS ---
    console.log(`[Debug] isCompleted: ${isCompleted}, has playlistUrl: ${!!playlistUrl}`);


    // If the video is complete (from either source) and we have a URL, show the player.
    if (isCompleted && playlistUrl) {
        console.log("[Debug] Rendering: VideoPlayer");
        return <VideoPlayer src={playlistUrl} />;
    }

    if (video?.status === 'uploading') {
        console.log("[Debug] Rendering: Uploading UI");
        return (
            <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${video.progress}%` }}></div>
                </div>
                <span className="text-xs text-center block mt-1 text-gray-600 dark:text-gray-400">{`Uploading... ${video.progress}%`}</span>
            </div>
        );
    }
    if (video?.status === 'uploaded') {
        console.log("[Debug] Rendering: Uploaded UI");
        return (<div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"><CheckCircle size={16} /><span>Upload complete. Awaiting processing...</span></div>);
    }

    // --- Check for 'status' OR 'progress' ---
    if (video?.status === 'processing' || video?.progress === 'processing') {
        console.log("[Debug] Rendering: Processing UI");
        return (
            <div className="flex items-center gap-3 text-sm">
                <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full absolute animate-ping"></div>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                    <span>Processing video...</span>
                    {video.estimatedProcessingTime && (
                        <div className="text-xs text-gray-500 flex items-center gap-1"><Info size={12} /><span>Est. time: {Math.ceil(video.estimatedProcessingTime / 60)} min</span></div>
                    )}
                </div>
            </div>
        );
    }

    // --- Check for 'status' OR 'progress' ---
    if (video?.status === 'failed' || video?.progress === 'failed') {
        console.log("[Debug] Rendering: Failed UI");
        return (
            <div className="p-3 text-center bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="flex justify-center items-center gap-2 text-sm text-red-600 dark:text-red-400"><AlertTriangle size={16} /><span>Processing failed.</span></div>
                <button type="button" onClick={onRetryClick} className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Try Upload Again</button>
            </div>
        );
    }

    // This is a fallback for the 'completed' state if the player can't be shown
    if (isCompleted) {
        console.log("[Debug] Rendering: 'Video is ready' (fallback)");
        return (<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle size={16} /><span>Video is ready.</span></div>);
    }

    // If status is 'idle' or unknown, we render nothing.
    console.log("[Debug] Rendering: null (no matching status)");
    return null;
};

// --- Main VideoUploader Component ---
const VideoUploader = ({ video, onFileSelect, onUploadClick, isUploadDisabled, onRetryClick }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Pre-upload file validation
            if (file.size > 10 * 1024 * 1024 * 1024) { // 10 GB limit
                alert("File size exceeds the 10 GB limit.");
                return;
            }
            if (!file.type.startsWith("video/")) {
                alert("Invalid file type. Please select a video file.");
                return;
            }
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    // 1. Check for a "live" status (from an active upload session)
    const activeLiveStatus = video?.status && video.status !== 'idle';

    // 2. Check for a "database" status that is *past* the initial upload stage.
    // Your DB has 'pending' and 'initializing' as defaults. We don't want to show a status for those.
    const activeDBStatus = video?.progress && !['pending', 'initializing'].includes(video.progress);

    // 3. Add a log to see this decision in action
    console.log(`VideoUploader decision: video.progress is '${video?.progress}'. Rendering status? ${activeLiveStatus || activeDBStatus}`);


    // 4. The final decision:
    if (activeLiveStatus || activeDBStatus) {
        // If we have an active status (processing, completed, failed), show the indicator.
        return <VideoStatusIndicator video={video} onRetryClick={onRetryClick} />;
    }

    return (
        <div className="space-y-2">
            <label className="flex items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud size={24} className="text-gray-500 dark:text-gray-400" />
                    {/* --- THE FIX: Added correct dark mode text colors --- */}
                    <p className="text-xs text-gray-800 dark:text-gray-300 mt-1">
                        {selectedFile ? selectedFile.name : (
                            <span className="font-semibold text-gray-500 dark:text-gray-400">Select video file</span>
                        )}
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

export default VideoUploader;
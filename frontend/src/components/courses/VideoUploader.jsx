import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { UploadCloud, CheckCircle, Loader, AlertTriangle, UploadIcon, Info } from 'lucide-react';

// --- Helper Component 1: VideoStatusIndicator ---
// This component's only job is to display the correct UI for the video's current status.
const VideoStatusIndicator = ({ video, onRetryClick }) => {
    const isCompleted = video?.status === 'completed' || video?.progress === 'completed';
    const playlistUrl = video?.urls?.playlist || video?.videoResolutions?.playlist;

    // If the video is complete (from either source) and we have a URL, show the player.
    if (isCompleted && playlistUrl) {
        return <VideoPlayer src={playlistUrl} />;
    }

    if (video?.status === 'uploading') {
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
                        <div className="text-xs text-gray-500 flex items-center gap-1"><Info size={12} /><span>Est. time: {Math.ceil(video.estimatedProcessingTime / 60)} min</span></div>
                    )}
                </div>
            </div>
        );
    }

    if (video?.status === 'failed') {
        return (
            <div className="p-3 text-center bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="flex justify-center items-center gap-2 text-sm text-red-600 dark:text-red-400"><AlertTriangle size={16} /><span>Processing failed.</span></div>
                <button type="button" onClick={onRetryClick} className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Try Upload Again</button>
            </div>
        );
    }

    // If status is 'idle' or unknown, we render nothing, letting the parent show the uploader.
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

    if (video) {
        return <VideoStatusIndicator video={video} onRetryClick={onRetryClick} />;
    }

    // First, check if there's a status to display (uploading, processing, etc.)
    // const statusIndicator = <VideoStatusIndicator video={video} onRetryClick={onRetryClick} />;
    // if (video?.status && video.status !== 'idle') {
    //     return statusIndicator;
    // }

    // If the status is 'idle', we show the uploader interface with the corrected styles.
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
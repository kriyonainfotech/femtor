import { useEffect } from "react";
import { useRef } from "react";
import Hls from 'hls.js'; // Import the HLS.js library

// --- NEW: Reusable HLS Video Player Component ---
const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null); // Create a ref to access the <video> element directly

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls;

        // Check if the browser can play HLS natively (like Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        }
        // If not, and HLS.js is supported, use it
        else if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        }

        // Cleanup function: This is crucial to prevent memory leaks!
        // When the component is removed, we destroy the Hls instance.
        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]); // Re-run this effect if the video source URL changes

    return (
        <video
            ref={videoRef}
            controls
            className="w-full rounded-lg aspect-video bg-black"
            crossOrigin="anonymous" // Important for HLS streams from S3
        />
    );
};

export default VideoPlayer;
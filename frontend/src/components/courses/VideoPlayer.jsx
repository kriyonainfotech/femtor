// import React, { useEffect, useRef } from 'react';
// import Hls from 'hls.js';

// const VideoPlayer = ({ src }) => {
//     const videoRef = useRef(null);

//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;

//         let hls;
//         if (video.canPlayType('application/vnd.apple.mpegurl')) {
//             video.src = src;
//         } else if (Hls.isSupported()) {
//             hls = new Hls();
//             hls.loadSource(src);
//             hls.attachMedia(video);
//         }
//         return () => {
//             if (hls) {
//                 hls.destroy();
//             }
//         };
//     }, [src]);

//     return (
//         <video
//             ref={videoRef}
//             controls
//             className="w-full rounded-lg aspect-video bg-black"
//             crossOrigin="anonymous"
//         />
//     );
// };

// export default VideoPlayer;

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    // 1. State to track if the video is vertical
    const [isVertical, setIsVertical] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // 2. This function now checks the video's orientation
        const handleMetadata = () => {
            if (video.videoHeight > video.videoWidth) {
                setIsVertical(true);
            } else {
                setIsVertical(false);
            }
        };

        video.addEventListener('loadedmetadata', handleMetadata);

        let hls;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
            // Important: clean up the event listener
            video.removeEventListener('loadedmetadata', handleMetadata);
        };
    }, [src]);

    return (
        // 3. A simple container that centers the video and sets a max height for UX
        <div className="w-full bg-black rounded-lg flex justify-center items-center overflow-hidden" style={{ maxHeight: '75vh' }}>
            <video
                ref={videoRef}
                controls
                // 4. THE KEY CHANGE: Apply classes conditionally based on orientation
                className={`
                    rounded-lg
                    ${isVertical ? 'w-auto h-full' : 'w-full h-auto'}
                `}
                style={{ maxHeight: '75vh' }}
                crossOrigin="anonymous"
            />
        </div>
    );
};

export default VideoPlayer;
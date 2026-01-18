import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ stream, isMuted = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Error playing video:", err));
        }
    }, [stream]);

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-lg border border-purple-900/50">
            <video
                ref={videoRef}
                muted={isMuted} // Mute self to avoid feedback
                className="w-full h-full object-cover"
                autoPlay
                playsInline
            />
        </div>
    );
};

export default VideoPlayer;

// src/components/common/VideoPlayer.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IconPlayerPlay, 
    IconPlayerPause, 
    IconVolume, 
    IconVolumeOff, 
    IconMaximize,
    IconMinimize
} from '@tabler/icons-react';

// Helper function to format time from seconds to MM:SS
const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function PostVideoPlayer({ src, onDoubleClick }) {
    if (!src || typeof src !== 'string') {
        console.error("VideoPlayer Error: `src` prop is missing, null, or not a string. Received:", src);
        return (
            <div className="relative w-full h-full bg-gray-800 flex flex-col items-center justify-center text-white/50">
                <IconAlertCircle size={48} />
                <p className="mt-2 text-sm font-semibold">Video Unavailable</p>
            </div>
        );
    }
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Start muted for better UX in a feed
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Auto-pause video when it scrolls out of view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                }
            },
            { threshold: 0.5 } // Trigger when 50% of the video is visible
        );

        const currentContainerRef = containerRef.current;
        if (currentContainerRef) {
            observer.observe(currentContainerRef);
        }

        return () => {
            if (currentContainerRef) {
                observer.unobserve(currentContainerRef);
            }
        };
    }, []);

    // Handle video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setProgress((video.currentTime / video.duration) * 100);
            setCurrentTime(video.currentTime);
        };
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        // Cleanup
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);
    
    // Auto-hide controls logic
    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    }, []);


    const togglePlayPause = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
    };
    
    const toggleMute = (e) => {
        e.stopPropagation();
        const newMuted = !isMuted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const handleVolumeChange = (e) => {
        e.stopPropagation();
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
            videoRef.current.muted = false;
        } else if (newVolume === 0) {
            setIsMuted(true);
            videoRef.current.muted = true;
        }
    };

    const handleProgressScrub = (e) => {
        const scrubTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
        videoRef.current.currentTime = scrubTime;
    };
    
    const toggleFullScreen = (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };
    
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
            onDoubleClick={onDoubleClick}
        >
            <video
                key={src}
                ref={videoRef}
                src={src}
                muted={isMuted}
                playsInline
                loop
                className="w-full h-full object-contain"
                onClick={togglePlayPause}
            />
            
            <AnimatePresence>
                {/* Center Play/Pause button shown when paused */}
                {!isPlaying && (
                     <motion.div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <div className="bg-black/50 rounded-full p-4">
                            <IconPlayerPlay size={48} className="text-white" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(showControls || !isPlaying) && (
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Progress Bar */}
                        <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-2" onClick={handleProgressScrub}>
                            <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}/>
                            <div className="absolute top-1/2 left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full" style={{ left: `${progress}%` }} />
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlayPause}>
                                    {isPlaying ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
                                </button>
                                <div className="flex items-center group/volume">
                                    <button onClick={toggleMute}>
                                        {isMuted || volume === 0 ? <IconVolumeOff size={24} /> : <IconVolume size={24} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-0 group-hover/volume:w-20 h-1.5 ml-2 transition-all duration-300 opacity-0 group-hover/volume:opacity-100"
                                    />
                                </div>
                                <span className="text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>
                            <button onClick={toggleFullScreen}>
                                {isFullScreen ? <IconMinimize size={24} /> : <IconMaximize size={24} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
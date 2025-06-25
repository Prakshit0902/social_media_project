"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { 
    IconHeart, 
    IconHeartFilled, 
    IconMessageCircle, 
    IconShare3,
    IconChevronLeft,
    IconChevronRight,
    IconAt,
    IconX,
    IconBookmark,
    IconBookmarkFilled
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { toggleLikePost } from "../../store/slices/postSlice";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { PostVideoPlayer } from "./PostVideoPlayer";

const slideVariants = {
    // The entering image will slide in from the right (100%) or left (-100%)
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    // The image in the center is fully visible and at its natural position
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    // The exiting image will slide out to the left (-100%) or right (100%)
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
}

export function PostCard({ 
    userProfilePicture, 
    postContent, 
    postContentType,
    postDescription, 
    postLikes, 
    postComments, 
    postShares, 
    username, 
    postId, 
    isLiked,
    isSaved = false,
    postMentions = [],
    likedByUsers = []
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // ... (all other state and hooks remain the same) ...
    const [likes, setLikes] = useState(postLikes);
    const [liked, setLiked] = useState(isLiked);
    const [saved, setSaved] = useState(isSaved);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMentions, setShowMentions] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const [showArrows, setShowArrows] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    
    const mentionsRef = useRef(null);
    const likesRef = useRef(null);
    const mentionButtonRef = useRef(null);
    const likeButtonRef = useRef(null);

    const [slideDirection, setSlideDirection] = useState(1);

   const images = useMemo(() => {
        // This logic is correct, but it relies on postContent having a value.
        if (!postContent) return []; // Return empty array if postContent is null/undefined
        return Array.isArray(postContent) ? postContent : [postContent];
    }, [postContent])

    const minSwipeDistance = 50;

    useOutsideClick(mentionsRef, () => setShowMentions(false));
    useOutsideClick(likesRef, () => setShowLikes(false));

    useEffect(() => {
        function onKeyDown(event) {
            if (event.key === "Escape") {
                setShowMentions(false);
                setShowLikes(false);
            }
        }

        if (showMentions || showLikes) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [showMentions, showLikes]);

    useEffect(() => {
        setLikes(postLikes);
        setLiked(isLiked);
        setSaved(isSaved);
    }, [postLikes, isLiked, isSaved]);

     useEffect(() => {
        // We only need to run this if there is more than one image
        if (images.length > 1) {
            images.forEach((src) => {
                const img = new Image();
                img.src = src;
                
            });
        }
    }, [images])

    const handleLike = useCallback(async (e) => {
        e.preventDefault();
        
        if (isUpdating) return;
        
        setIsUpdating(true);
        
        const previousLiked = liked;
        const previousLikes = likes;
        
        const newLiked = !liked;
        setLiked(newLiked);
        setLikes(newLiked ? likes + 1 : likes - 1);
        
        if (newLiked) {
            setShowHeartAnimation(true);
            setTimeout(() => {
                setShowHeartAnimation(false);
            }, 800);
        }
        
        try {
            const result = await dispatch(toggleLikePost(postId)).unwrap();
            setLikes(result.updatedPost.likes);
            setLiked(!result.isLiked);
        } catch (error) {
            setLiked(previousLiked);
            setLikes(previousLikes);
            console.error('Failed to toggle like:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [isUpdating, liked, likes, dispatch, postId]);

    const handleSave = useCallback(() => {
        setSaved(!saved);
    }, [saved]);

    const handlePreviousImage = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNextImage = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handleImageIndicatorClick = useCallback((index) => {
        // Set direction based on which way we are moving
        setSlideDirection(index > currentImageIndex ? 1 : -1);
        setCurrentImageIndex(index);
    }, [currentImageIndex]);

    const onTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

 const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;
        const minSwipeDistance = 50;
        const distance = touchStart - touchEnd;
        
        if (distance > minSwipeDistance && images.length > 1) {
            handleNextImage();
        } else if (distance < -minSwipeDistance && images.length > 1) {
            handlePreviousImage();
        }
    }, [touchStart, touchEnd, images.length, handleNextImage, handlePreviousImage]);

    const usernameClicked = (e) => {
        navigate(`/dashboard/profile/${username}`)
    }

    const handleShowMentions = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setModalOrigin({ x: centerX, y: centerY });
        setShowMentions(true);
    }

    const handleShowLikes = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setModalOrigin({ x: centerX, y: centerY });
        setShowLikes(true);
    }

    const navigateToProfile = (username) => {
        setShowMentions(false);
        setShowLikes(false);
        navigate(`/dashboard/profile/${username}`);
    }


    return (
        <>
            <div className="inter-var w-full">
                <div className="bg-white relative dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-xl mx-auto h-auto rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Header */}
                    <div
                        className="flex flex-row items-center text-neutral-700 dark:text-white mb-4"
                    >
                        <img
                            src={userProfilePicture}
                            height="40"
                            width="40"
                            alt="profile"
                            className="mr-3 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <p className="font-semibold text-base cursor-pointer" onClick={usernameClicked}>{username}</p>
                    </div>
                    
                    {/* Main Image Carousel with Animations */}
                    {/* FIXED: Event handlers are now on this parent div */}
                    <div 
                        className="w-full relative group"
                        onMouseEnter={() => setShowArrows(true)}
                        onMouseLeave={() => setShowArrows(false)}
                    >
                        <div className="w-full">
                            {/* REMOVED: Event handlers were here before */}
                            <div 
                                className="relative w-full overflow-hidden rounded-xl touch-pan-y bg-black"
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                style={{ aspectRatio: '4 / 3' }}
                            >
                                {/* Animated Image Carousel */}
                                <AnimatePresence initial={false} custom={slideDirection}>
                                {/***************************************************************/}
                                {/* START OF CHANGES: motion.img becomes a motion.div wrapper */}
                                {/***************************************************************/}
                                <motion.div
                                    key={currentImageIndex} // Key is on the container
                                    custom={slideDirection}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="absolute h-full w-full"
                                >
                                    {postContentType[currentImageIndex] === 'video' ? (
                                        <PostVideoPlayer 
                                            src={images[currentImageIndex]}
                                            onDoubleClick={handleLike}
                                        />
                                    ) : (
                                        <img
                                            src={images[currentImageIndex]}
                                            className="h-full w-full object-contain cursor-pointer select-none"
                                            alt="post content"
                                            onDoubleClick={handleLike}
                                            draggable={false}
                                        />
                                    )}
                                </motion.div>
                                {/***************************************************************/}
                                {/* END OF CHANGES                                            */}
                                {/***************************************************************/}
                            </AnimatePresence>
                                {/* Like Animation Heart */}
                                <AnimatePresence>
                                    {showHeartAnimation && (
                                        <motion.div 
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ 
                                                opacity: [0, 1, 1, 0],
                                                scale: [0.5, 1.2, 1, 1]
                                            }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.8, times: [0, 0.15, 0.5, 1] }}
                                        >
                                            <IconHeartFilled 
                                                className="text-red-400" 
                                                size={150}
                                                style={{
                                                    filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))'
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <motion.button
                                    onClick={handlePreviousImage}
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-150`}
                                    style={{ zIndex: 50, touchAction: 'manipulation' }}
                                    aria-label="Previous image"
                                    animate={{ opacity: showArrows ? 1 : 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <IconChevronLeft size={20} />
                                </motion.button>
                                <motion.button
                                    onClick={handleNextImage}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-150`}
                                    style={{ zIndex: 50, touchAction: 'manipulation' }}
                                    aria-label="Next image"
                                    animate={{ opacity: showArrows ? 1 : 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <IconChevronRight size={20} />
                                </motion.button>
                            </>
                        )}
                        
                        {/* Image Indicators */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-3 absolute bottom-3 left-0 right-0 z-10">
                                {images.map((_, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleImageIndicatorClick(index)}
                                        className={`transition-all duration-150 rounded-full`}
                                        animate={{
                                            width: index === currentImageIndex ? 8 : 6,
                                            height: index === currentImageIndex ? 8 : 6,
                                            backgroundColor: index === currentImageIndex ? '#3b82f6' : 'rgba(255, 255, 255, 0.7)'
                                        }}
                                        whileHover={{ scale: 1.2 }}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Actions and Description ... */}
                    {/* ... (rest of the component is unchanged) ... */}
                    <div>
                        <div className="flex flex-row mt-4 text-neutral-600 dark:text-neutral-300 justify-between">
                            <div className="flex flex-row gap-4">
                                <div className="flex flex-row items-center" ref={likeButtonRef}>
                                    <motion.button 
                                        onClick={handleLike}
                                        disabled={isUpdating}
                                        className="flex items-center transition-transform duration-150 ease-in-out disabled:opacity-50"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {liked ? (
                                            <IconHeartFilled 
                                                className="text-red-500 transition-all duration-200 w-6 h-6" 
                                            />
                                        ) : (
                                            <IconHeart 
                                                className="text-neutral-600 dark:text-neutral-300 hover:text-red-500 transition-colors duration-150 w-6 h-6" 
                                            />
                                        )}
                                    </motion.button>
                                    <motion.span 
                                        className="font-medium text-sm ml-2 cursor-pointer" 
                                        onClick={handleShowLikes}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {likes}
                                    </motion.span>
                                </div>

                                <motion.button 
                                    className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <IconMessageCircle className="w-6 h-6" />
                                    <span className="ml-2 font-medium text-sm">{postComments}</span>
                                </motion.button>
                                
                                <motion.button 
                                    className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <IconShare3 className="w-6 h-6" />
                                    <span className="ml-2 font-medium text-sm">{postShares}</span>
                                </motion.button>

                                {postMentions && postMentions.length > 0 && (
                                    <motion.button 
                                        ref={mentionButtonRef}
                                        onClick={handleShowMentions}
                                        className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <IconAt className="w-6 h-6" />
                                        <span className="ml-2 font-medium text-sm">{postMentions.length}</span>
                                    </motion.button>
                                )}
                            </div>

                            <motion.button
                                onClick={handleSave}
                                className="flex items-center transition-transform duration-150 ease-in-out"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {saved ? (
                                    <IconBookmarkFilled 
                                        className="text-neutral-800 dark:text-white transition-all duration-200 w-6 h-6" 
                                    />
                                ) : (
                                    <IconBookmark 
                                        className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors duration-150 w-6 h-6" 
                                    />
                                )}
                            </motion.button>
                        </div>
                    </div>
                    
                    {postDescription && (
                        <p
                            className="text-neutral-700 text-sm mt-3 dark:text-neutral-300 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-200"
                        >
                            <span className="font-semibold mr-2 cursor-pointer" onClick={usernameClicked}>{username}</span>
                            {postDescription}
                        </p>
                    )}
                </div>
            </div>

            {/* Animated Mentions Modal (No changes here) */}
            <AnimatePresence>
                {showMentions && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 z-[100]"
                        />
                        <div className="fixed inset-0 z-[101] pointer-events-none">
                            <motion.div
                                ref={mentionsRef} // or likesRef for likes modal
                                className="pointer-events-auto fixed"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    x: '-50%',
                                    y: '-50%'
                                }}
                                initial={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: modalOrigin.x - window.innerWidth / 2,
                                    y: modalOrigin.y - window.innerHeight / 2,
                                }}
                                animate={{ 
                                    opacity: 1,
                                    scale: 1,
                                    x: '-50%',
                                    y: '-50%'
                                }}
                                exit={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: modalOrigin.x - window.innerWidth / 2,
                                    y: modalOrigin.y - window.innerHeight / 2,
                                }}
                                transition={{ 
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300
                                }}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-[90vw] sm:w-full max-h-[80vh] overflow-hidden shadow-2xl">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex justify-between items-center mb-4"
                                    >
                                        <h3 className="text-lg font-semibold dark:text-white">Mentions</h3>
                                        <motion.button
                                            onClick={() => setShowMentions(false)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <IconX size={24} />
                                        </motion.button>
                                    </motion.div>
                                    <motion.div 
                                        className="space-y-3 overflow-y-auto max-h-[60vh] pr-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        {postMentions.map((mention, index) => (
                                            <motion.div 
                                                key={index} 
                                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * index }}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => navigateToProfile(mention.username)}
                                            >
                                                <motion.img
                                                    src={mention.profilePicture || '/default-avatar.png'}
                                                    alt={mention.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    whileHover={{ scale: 1.1 }}
                                                />
                                                <div>
                                                    <p className="font-medium dark:text-white">{mention.username}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">@{mention.handle || mention.username}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Animated Likes Modal (No changes here) */}
            {/* Animated Likes Modal (No changes here) */}
            <AnimatePresence>
                {showLikes && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 z-[100]"
                        />
                        <div className="fixed inset-0 z-[101] pointer-events-none">
                            <motion.div
                                ref={mentionsRef} // or likesRef for likes modal
                                className="pointer-events-auto fixed"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    x: '-50%',
                                    y: '-50%'
                                }}
                                initial={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: modalOrigin.x - window.innerWidth / 2,
                                    y: modalOrigin.y - window.innerHeight / 2,
                                }}
                                animate={{ 
                                    opacity: 1,
                                    scale: 1,
                                    x: '-50%',
                                    y: '-50%'
                                }}
                                exit={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: modalOrigin.x - window.innerWidth / 2,
                                    y: modalOrigin.y - window.innerHeight / 2,
                                }}
                                transition={{ 
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300
                                }}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-[90vw] sm:w-full max-h-[80vh] overflow-hidden shadow-2xl">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex justify-between items-center mb-4"
                                    >
                                        <h3 className="text-lg font-semibold dark:text-white">Likes</h3>
                                        <motion.button
                                            onClick={() => setShowLikes(false)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <IconX size={24} />
                                        </motion.button>
                                    </motion.div>
                                    <motion.div 
                                        className="space-y-3 overflow-y-auto max-h-[60vh] pr-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        {likedByUsers && likedByUsers.length > 0 ? (
                                            likedByUsers.map((user, index) => (
                                                <motion.div 
                                                    key={index} 
                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.05 * index }}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => navigateToProfile(user.username)}
                                                >
                                                    <motion.img
                                                        src={user.profilePicture || '/default-avatar.png'}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        whileHover={{ scale: 1.1 }}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium dark:text-white">{user.username}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.handle || user.username}</p>
                                                    </div>
                                                    {user.isFollowing !== undefined && (
                                                        <motion.button
                                                            className={`px-3 py-1 text-sm rounded-full font-medium ${
                                                                user.isFollowing
                                                                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                                    : 'bg-blue-500 text-white'
                                                            }`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Add follow/unfollow logic here
                                                            }}
                                                        >
                                                            {user.isFollowing ? 'Following' : 'Follow'}
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                                No likes yet
                                            </p>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { 
    IconHeart, 
    IconHeartFilled, 
    IconMessageCircle, 
    IconShare3,
    IconChevronLeft,
    IconChevronRight,
    IconAt,
    IconX
} from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikePost } from "../../store/slices/postSlice";

export function PostCard({ 
    userProfilePicture, 
    postContent, 
    postDescription, 
    postLikes, 
    postComments, 
    postShares, 
    username, 
    postId, 
    isLiked,
    postMentions = [] 
}) {
    const dispatch = useDispatch();
    
    // Use local state for immediate UI updates
    const [likes, setLikes] = useState(postLikes);
    const [liked, setLiked] = useState(isLiked);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMentions, setShowMentions] = useState(false);
    const [showArrows, setShowArrows] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Convert postContent to array if it's a string
    const images = useMemo(() => 
        Array.isArray(postContent) ? postContent : [postContent]
    , [postContent]);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Update local state when props change
    useEffect(() => {
        setLikes(postLikes);
        setLiked(isLiked);
    }, [postLikes, isLiked]);

    const handleLike = useCallback(async (e) => {
        e.preventDefault();
        
        if (isUpdating) return;
        
        setIsUpdating(true);
        
        const previousLiked = liked;
        const previousLikes = likes;
        
        const newLiked = !liked;
        setLiked(newLiked);
        setLikes(newLiked ? likes + 1 : likes - 1);
        
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
        setCurrentImageIndex(index);
    }, []);

    // Touch handlers for swipe
    const onTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe && images.length > 1) {
            handleNextImage();
        }
        if (isRightSwipe && images.length > 1) {
            handlePreviousImage();
        }
    }, [touchStart, touchEnd, minSwipeDistance, images.length, handleNextImage, handlePreviousImage]);

    return (
        <>
            <CardContainer className="inter-var w-full">
                <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-xl mx-auto h-auto rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Header */}
                    <CardItem
                        // translateZ="50"
                        className="flex flex-row items-center text-neutral-700 dark:text-white mb-4"
                    >
                        <img
                            src={userProfilePicture}
                            height="40"
                            width="40"
                            alt="profile"
                            className="mr-3 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <p className="font-semibold text-base">{username}</p>
                    </CardItem>
                    
                    {/* Main Image Carousel */}
                    <div className="w-full relative group">
                        <CardItem 
                            // translateZ="100" 
                            className="w-full"
                            style={{ willChange: 'transform' }}
                        >
                            <div 
                                className="relative overflow-hidden rounded-xl touch-pan-y"
                                onMouseEnter={() => setShowArrows(true)}
                                onMouseLeave={() => setShowArrows(false)}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            >
                                {/* Preload adjacent images */}
                                {images.length > 1 && (
                                    <>
                                        <link 
                                            rel="preload" 
                                            as="image" 
                                            href={images[(currentImageIndex + 1) % images.length]} 
                                        />
                                        <link 
                                            rel="preload" 
                                            as="image" 
                                            href={images[currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1]} 
                                        />
                                    </>
                                )}
                                
                                <img
                                    src={images[currentImageIndex]}
                                    className="h-80 w-full object-cover cursor-pointer select-none"
                                    alt="post content"
                                    onDoubleClick={handleLike}
                                    draggable={false}
                                    loading="eager"
                                />
                                
                                {/* Like Animation Heart */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    {liked && (
                                        <IconHeartFilled 
                                            className="text-red-400 opacity-0 animate-[likeHeart_0.8s_ease-out]" 
                                            size={150} // Even larger
                                            style={{
                                                filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))', // Stronger red glow
                                                fontSize: '150px', // Fallback size
                                                strokeWidth: '1' // Thinner stroke for better visibility
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </CardItem>

                        {/* Navigation Arrows - Fixed positioning outside CardItem */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePreviousImage}
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-150 ${
                                        showArrows ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
                                    }`}
                                    style={{ 
                                        zIndex: 50,
                                        touchAction: 'manipulation'
                                    }}
                                    aria-label="Previous image"
                                >
                                    <IconChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-150 ${
                                        showArrows ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
                                    }`}
                                    style={{ 
                                        zIndex: 50,
                                        touchAction: 'manipulation'
                                    }}
                                    aria-label="Next image"
                                >
                                    <IconChevronRight size={20} />
                                </button>
                            </>
                        )}
                        
                        {/* Image Indicators */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-3">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleImageIndicatorClick(index)}
                                        className={`transition-all duration-150 ${
                                            index === currentImageIndex
                                                ? 'w-2 h-2 bg-blue-500'
                                                : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                                        } rounded-full`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Actions */}
                    <CardItem 
                    // translateZ="100"
                     >
                        <div className="flex flex-row mt-4 text-neutral-600 dark:text-neutral-300 gap-4">
                            <button 
                                onClick={handleLike}
                                disabled={isUpdating}
                                className="flex items-center transition-transform duration-150 ease-in-out disabled:opacity-50 hover:scale-110 active:scale-95"
                            >
                                {liked ? (
                                    <IconHeartFilled 
                                        className="text-red-500 transition-all duration-200 animate-[heartBeat_0.3s_ease-in-out] w-6 h-6" 
                                    />
                                ) : (
                                    <IconHeart 
                                        className="text-neutral-600 dark:text-neutral-300 hover:text-red-500 transition-colors duration-150 w-6 h-6" 
                                    />
                                )}
                                <span className="ml-2 font-medium text-sm">
                                    {likes}
                                </span>
                            </button>

                            <button className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150 hover:scale-110 active:scale-95">
                                <IconMessageCircle className="w-6 h-6" />
                                <span className="ml-2 font-medium text-sm">{postComments}</span>
                            </button>
                            
                            <button className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150 hover:scale-110 active:scale-95">
                                <IconShare3 className="w-6 h-6" />
                                <span className="ml-2 font-medium text-sm">{postShares}</span>
                            </button>

                            {/* Mentions Button */}
                            {postMentions && postMentions.length > 0 && (
                                <button 
                                    onClick={() => setShowMentions(true)}
                                    className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150 hover:scale-110 active:scale-95"
                                >
                                    <IconAt className="w-6 h-6" />
                                    <span className="ml-2 font-medium text-sm">{postMentions.length}</span>
                                </button>
                            )}
                        </div>
                    </CardItem>
                    
                    {/* Description */}
                    {postDescription && (
                        <CardItem
                            as="p"
                            // translateZ="60"
                            className="text-neutral-700 text-sm mt-3 dark:text-neutral-300 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-200"
                        >
                            <span className="font-semibold mr-2">{username}</span>
                            {postDescription}
                        </CardItem>
                    )}
                </CardBody>
            </CardContainer>

            {/* Mentions Modal */}
            {showMentions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">Mentions</h3>
                            <button
                                onClick={() => setShowMentions(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <IconX size={24} />
                            </button>
                        </div>
                        <div className="space-y-3">
                                                        {postMentions.map((mention, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <img
                                        src={mention.profilePicture || '/default-avatar.png'}
                                        alt={mention.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium dark:text-white">{mention.username}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{mention.handle || mention.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes likeHeart {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    15% {
                        opacity: 0.55;
                        transform: scale(1.0);
                    }
                    30% {
                        transform: scale(1.5);
                    }
                    45%, 80% {
                        opacity: 0.55;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1);
                    }
                }

                @keyframes heartBeat {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.3); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </>
    );
}
"use client";

import React, { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { IconHeart, IconHeartFilled, IconMessageCircle, IconShare3 } from "@tabler/icons-react";
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
    isLiked 
}) {
    const dispatch = useDispatch();
    
    // Use local state for immediate UI updates
    const [likes, setLikes] = useState(postLikes);
    const [liked, setLiked] = useState(isLiked);
    const [isUpdating, setIsUpdating] = useState(false);

    // Update local state when props change
    useEffect(() => {
        setLikes(postLikes);
        setLiked(isLiked);
    }, [postLikes, isLiked]);

    const handleLike = async (e) => {
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
    };

    return (
        <CardContainer className="inter-var w-full">
            <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-xl mx-auto h-auto rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Header */}
                <CardItem
                    translateZ="50"
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
                
                {/* Main Image */}
                <CardItem translateZ="100" className="w-full">
                    <img
                        src={postContent}
                        className="h-80 w-full object-cover rounded-xl cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                        alt="post content"
                        onDoubleClick={handleLike}
                    />
                </CardItem>
                
                {/* Actions */}
                <CardItem translateZ="100">
                    <div className="flex flex-row mt-4 text-neutral-600 dark:text-neutral-300 gap-4">
                        <button 
                            onClick={handleLike}
                            disabled={isUpdating}
                            className="flex items-center transition-all duration-150 ease-in-out disabled:opacity-50 hover:scale-110"
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

                        <button className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all duration-150 hover:scale-110">
                            <IconMessageCircle className="w-6 h-6" />
                            <span className="ml-2 font-medium text-sm">{postComments}</span>
                        </button>
                        
                        <button className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all duration-150 hover:scale-110">
                            <IconShare3 className="w-6 h-6" />
                            <span className="ml-2 font-medium text-sm">{postShares}</span>
                        </button>
                    </div>
                </CardItem>
                
                {/* Description */}
                {postDescription && (
                    <CardItem
                        as="p"
                        translateZ="60"
                        className="text-neutral-700 text-sm mt-3 dark:text-neutral-300 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-200"
                    >
                        <span className="font-semibold mr-2">{username}</span>
                        {postDescription}
                    </CardItem>
                )}
            </CardBody>
        </CardContainer>
    );
}
"use client";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { PostCard } from "../PostCard/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { getUserPostFeed, resetFeedPage } from "../../store/slices/feedSlice";
import { initializeLikedStatus, initializeSavedStatus } from "../../store/slices/postSlice";
import { Virtuoso } from 'react-virtuoso';

function Home() {
    const dispatch = useDispatch();
    const { feedPosts, feedLoading, feedPage, hasMoreFeed, error } = useSelector((state) => state.feed);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { isLikedByPost } = useSelector((state) => state.post);
    const { isSavedByPost = {} } = useSelector((state) => state.post);
    
    const initialLoadDone = useRef(false);
    
    // Memoize the loadMore callback for virtuoso
    const loadMore = useCallback(() => {
        if (isAuthenticated && !feedLoading && hasMoreFeed) {
            dispatch(getUserPostFeed(feedPage + 1));
        }
    }, [isAuthenticated, feedLoading, hasMoreFeed, feedPage, dispatch]);

    // Initial load - only once when authenticated
    useEffect(() => {
        if (isAuthenticated && feedPosts.length === 0 && !feedLoading && !initialLoadDone.current) {
            initialLoadDone.current = true;
            dispatch(resetFeedPage()); 
            dispatch(getUserPostFeed(1));
        }
    }, [dispatch, isAuthenticated, feedPosts.length, feedLoading]);

    // Initialize liked status when posts are loaded
    useEffect(() => {
        if (Array.isArray(feedPosts) && feedPosts.length > 0 && user?._id) {
            dispatch(initializeLikedStatus({ 
                posts: feedPosts, 
                currentUserId: user._id 
            }));
            dispatch(initializeSavedStatus({ 
                posts: feedPosts, 
                currentUserId: user._id 
            }));
        }
    }, [dispatch, feedPosts.length, user?._id]); // Only depend on length, not entire array

    // Memoize post items for virtuoso
    const postItems = useMemo(() => {
        if (!Array.isArray(feedPosts)) return [];
        
        return feedPosts.map((post, idx) => ({
            key: post._id || `fallback-feed-${idx}-${Date.now()}`,
            postId: post._id,
            postOwnerId : post.owner?._id,
            postContent: post.media?.map(m => m.url) || [],
            postContentType: post.media?.map(m => m.type) || [],
            username: post.owner?.username || 'Unknown',
            userProfilePicture: post.owner?.profilePicture,
            postLikes: post.likes || 0,
            postComments: post.comments?.length || 0,
            postShares: post.shares || 0,
            postDescription: post.caption || '',
            isLiked: isLikedByPost[post._id] ?? post.likedByUsers?.includes(user?._id) ?? false,
            isSaved: post && post._id ? (isSavedByPost[post._id] ?? post.savedBy?.includes(user?._id) ?? false): false,
            postMentions: post.mentions || [],
            likedByUsers: post.likedByUsers || []
        }));
    }, [feedPosts, isLikedByPost,isSavedByPost, user?._id]);

    // Check authentication first
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-xl mb-4">Please log in to view your feed</p>
                </div>
            </div>
        );
    }

    // Show error if feed fails to load
    if (error && !feedLoading && feedPosts.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load feed: {error}</p>
                    <button 
                        onClick={() => dispatch(getUserPostFeed(1))}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Show loading state for initial load
    if (feedLoading && feedPosts.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white">Loading your feed...</p>
                </div>
            </div>
        );
    }

    // Footer component for infinite scroll loading
    const Footer = () => {
        if (!hasMoreFeed && postItems.length > 0) {
            return (
                <div className="text-center py-8 text-white/60">
                    <p>You're all caught up! 🎉</p>
                </div>
            );
        }
        
        if (feedLoading && postItems.length > 0) {
            return (
                <div className="flex items-center justify-center py-8 gap-2 text-white">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading more posts...</span>
                </div>
            );
        }
        
        return null;
    };

    // Empty state
    if (postItems.length === 0 && !feedLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center py-8 text-white">
                    <p className="text-xl mb-2">No posts to display</p>
                    <p className="text-white/60">Follow some users to see their posts!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen">
            <Virtuoso
                style={{ height: '100%' }}
                data={postItems}
                endReached={loadMore}
                overscan={200}
                itemContent={(index, post) => (
                    <div className="flex justify-center py-4 first:pt-6 px-4">
                        <div className="w-full max-w-2xl">
                            <PostCard
                                key={post.key}
                                postContent={post.postContent}
                                postContentType={post.postContentType}
                                postOwnerId={post.postOwnerId}
                                postDescription={post.postDescription}
                                postLikes={post.postLikes}
                                postComments={post.postComments}
                                postShares={post.postShares}
                                username={post.username}
                                postId={post.postId}
                                userProfilePicture={post.userProfilePicture}
                                isLiked={post.isLiked}
                                isSaved={post.isSaved}
                                postMentions={post.postMentions}
                                likedByUsers={post.likedByUsers}
                            />
                        </div>
                    </div>
                )}
                components={{
                    Footer
                }}
                increaseViewportBy={{ top: 400, bottom: 400 }}
            />
        </div>
    );
}

export { Home };
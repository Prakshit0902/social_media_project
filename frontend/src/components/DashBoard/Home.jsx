"use client";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { PostCard } from "../PostCard/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { getUserPostFeed, resetFeedPage } from "../../store/slices/feedSlice";
import { initializeLikedStatus, initializeSavedStatus } from "../../store/slices/postSlice";
import { Virtuoso } from 'react-virtuoso';
import { ExpandableCard } from "../UserSuggestionSidebar/ExpandableCard";

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
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-xl text-white mb-2">Please log in to view your feed</p>
                    <p className="text-neutral-500 text-sm">Connect with friends and see what's new</p>
                </div>
            </div>
        );
    }

    // Show error if feed fails to load
    if (error && !feedLoading && feedPosts.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-sm mx-auto px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-red-400 mb-2 font-medium">Failed to load feed</p>
                    <p className="text-neutral-500 text-sm mb-6">{error}</p>
                    <button 
                        onClick={() => dispatch(getUserPostFeed(1))}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        Try Again
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
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
                    </div>
                    <p className="text-neutral-400 text-sm">Loading your feed...</p>
                </div>
            </div>
        );
    }

    // Footer component for infinite scroll loading
    const Footer = () => {
        if (!hasMoreFeed && postItems.length > 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <span className="text-xl">🎉</span>
                        <span className="text-neutral-400 text-sm">You're all caught up!</span>
                    </div>
                </div>
            );
        }
        
        if (feedLoading && postItems.length > 0) {
            return (
                <div className="flex items-center justify-center py-8 gap-3">
                    <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-neutral-400 text-sm">Loading more...</span>
                </div>
            );
        }
        
        return null;
    };

    // Empty state
    if (postItems.length === 0 && !feedLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-sm mx-auto px-4">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                    <p className="text-neutral-500 text-sm">Follow some users to see their posts in your feed!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex">
            {/* Main Feed - Scrollable with hidden scrollbar */}
            <div className="flex-1 h-full overflow-hidden feed-container">
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
            
            {/* Right Sidebar - User Suggestions (fixed with scrollbar on right) */}
            <div className="hidden lg:flex flex-col w-80 h-full border-l border-white/5 pt-6 px-4 overflow-y-auto sidebar-scroll-right">
                <ExpandableCard />
            </div>
        </div>
    );
}

export { Home };
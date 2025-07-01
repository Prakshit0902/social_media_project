"use client";
import React, { useEffect, useRef } from "react";
import { PostCard } from "../PostCard/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { getUserPostFeed, resetFeedPage } from "../../store/slices/feedSlice";
import { getUserProfilesByIds } from "../../store/slices/userSlice";
import { initializeLikedStatus } from "../../store/slices/postSlice";
import useInfiniteScroll from "../../hooks/use-infinite-scroll";

function Home() {
    const dispatch = useDispatch();
    const { feedPosts, feedLoading, feedPage, hasMoreFeed, error } = useSelector((state) => state.feed);
    const { profilesById = {} } = useSelector((state) => state.user);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { isLikedByPost } = useSelector((state) => state.post);
    
    // Use the custom hook BEFORE any conditional returns
    const loadMore = () => {
        if (isAuthenticated) {
            dispatch(getUserPostFeed(feedPage + 1));
        }
    }
    const loadMoreRef = useInfiniteScroll(loadMore, feedLoading, hasMoreFeed);
    
    const initialLoadDone = useRef(false);

    // Only fetch if authenticated
    useEffect(() => {
        if (!initialLoadDone.current && isAuthenticated) {
            initialLoadDone.current = true;
            dispatch(resetFeedPage());
            dispatch(getUserPostFeed(1));
        }
    }, [dispatch, isAuthenticated]);

    // Fetch user profiles when posts are loaded
    // useEffect(() => {
    //     console.log(feedPosts)
        
    //     if (Array.isArray(feedPosts) && feedPosts.length > 0) {
    //         const ownerIds = [...new Set(feedPosts.map((p) => p.owner))];
    //         dispatch(getUserProfilesByIds(ownerIds));
    //     }
    // }, [dispatch, feedPosts]);

    // Initialize liked status when posts are loaded
    useEffect(() => {
        if (Array.isArray(feedPosts) && feedPosts.length > 0 && user?._id) {
            dispatch(initializeLikedStatus({ 
                posts: feedPosts, 
                currentUserId: user._id 
            }));
            
        }

        // console.log(feedPosts);
        // console.log(user);
        
        
    }, [dispatch, feedPosts, user?._id]);

    // Check authentication first
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                <div>Loading your feed...</div>
            </div>
        );
    }

    const cardContent = Array.isArray(feedPosts)
        ? feedPosts.map((post, idx) => ({
              postId: post._id,
              postContent: post.media?.map(m => m.url),
              postContentType : post.media.map(m => m.type),
              username: post.owner.username,
              profilePicture: post.owner.profilePicture,
              postLikes: post.likes,
              feedPostshares: post.shares,
              postComments: post.comments,
              postDescription: post.caption,
              isLiked: isLikedByPost[post._id] ?? post.likedByUsers?.includes(user?._id) ?? false,
              key: post._id ? `feed-post-${post._id}` : `fallback-feed-${post.owner}-${idx}-${Date.now()}`,
              postMentions: post.mentions || [],
              likedByUsers : post.likedByUsers || []
          }))
        : [];

    return (
        <div className="min-h-screen flex flex-row items-center justify-center" style={{ zIndex: 1 }}>
            <div className="flex flex-col">
                {cardContent.length > 0 ? (
                    cardContent.map((card) => (
                        <PostCard
                            key={card.key}
                            postContent={card.postContent}
                            postContentType = {card.postContentType}
                            postDescription={card.postDescription}
                            postLikes={card.postLikes}
                            postComments={card.postComments.length}
                            postShares={card.feedPostshares}
                            username={card.username}
                            postId={card.postId}
                            userProfilePicture={card.profilePicture}
                            isLiked={card.isLiked}
                            postMentions={card.postMentions}
                            likedByUsers={card.likedByUsers}
                        />
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p>No posts to display. Follow some users to see their posts!</p>
                    </div>
                )}
            </div>
            <div ref={loadMoreRef} className="h-10"></div>
            {feedLoading && feedPosts.length > 0 && <div>Loading more posts...</div>}
            {!hasMoreFeed && feedPosts.length > 0 && <div>No more posts to load.</div>}
        </div>
    );
}

export { Home };
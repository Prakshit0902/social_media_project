"use client";
import React, { useEffect } from "react";
import { PostCard } from "../PostCard/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { getUserPostFeed, resetFeedPage } from "../../store/slices/feedSlice";
import { getUserProfilesByIds } from "../../store/slices/userSlice";
import { initializeLikedStatus } from "../../store/slices/postSlice"; // Add this import
import useInfiniteScroll from "../../hooks/use-infinite-scroll";

function Home() {
    const dispatch = useDispatch();
    const { feedPosts, feedLoading, feedPage, hasMoreFeed } = useSelector((state) => state.feed);
    const { profilesById = {} } = useSelector((state) => state.user);
    const { user } = useSelector((state) => state.auth); // Add this line to get current user
    const { isLikedByPost } = useSelector((state) => state.post); // Add this line

    // Reset state and fetch fresh data on component mount (includes reload)
    useEffect(() => {
        dispatch(resetFeedPage());
        dispatch(getUserPostFeed(1));
    }, [dispatch]);

    // Fetch user profiles when posts are loaded
    useEffect(() => {
        if (Array.isArray(feedPosts) && feedPosts.length) {
            const ids = feedPosts.map((post) => post._id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                console.warn('Duplicate posts detected in feed:', ids.filter((id, index) => ids.indexOf(id) !== index));
            }
            const ownerIds = [...new Set(feedPosts.map((p) => p.owner))];
            dispatch(getUserProfilesByIds(ownerIds));
        }
    }, [dispatch, feedPosts]);

    // ADD THIS useEffect HERE - Initialize liked status when posts are loaded
    useEffect(() => {
        if (Array.isArray(feedPosts) && feedPosts.length && user?._id) {
            dispatch(initializeLikedStatus(feedPosts, user._id));
        }
    }, [dispatch, feedPosts, user]);

    // Use the custom hook for infinite scrolling
    const loadMore = () => {
        dispatch(getUserPostFeed(feedPage + 1));
    };

    const loadMoreRef = useInfiniteScroll(loadMore, feedLoading, hasMoreFeed);

    const cardContent = Array.isArray(feedPosts)
        ? feedPosts.map((post, idx) => ({
              postId: post._id,
              postContent: post.postContent,
              username: profilesById[post.owner]?.username ?? 'Loading...',
              profilePicture : profilesById[post.owner]?.profilePicture,
              postLikes: post.likes,
              feedPostshares: post.shares,
              postComments: post.comments,
              postDescription: post.description,
              isLiked: isLikedByPost[post._id] ?? post.likedBy?.includes(user?._id) ?? false, // Add this line
              key: post._id ? `feed-post-${post._id}` : `fallback-feed-${post.owner}-${idx}-${Date.now()}`,
          }))
        : []

    return (
        <div className="min-h-screen flex flex-row items-center justify-center" style={{ zIndex: 1 }}>
            <div className="flex flex-col">
                {cardContent.map((card) => (
                    <PostCard
                        key={card.key}
                        postContent={card.postContent}
                        postDescription={card.postDescription}
                        postLikes={card.postLikes}
                        postComments={card.postComments}
                        postShares={card.feedPostshares}
                        username={card.username}
                        postId={card.postId}
                        userProfilePicture={card.profilePicture}
                        isLiked={card.isLiked} // Add this line
                    />
                ))}
            </div>
            <div ref={loadMoreRef} className="h-10"></div>
            {feedLoading && <div>Loading more posts...</div>}
            {!hasMoreFeed && <div>No more posts to load.</div>}
        </div>
    );
}

export { Home };
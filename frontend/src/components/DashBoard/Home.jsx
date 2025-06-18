"use client";
import React, { useEffect } from "react";
import { PostCard } from "../PostCard/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { getUserPostFeed } from "../../store/slices/feedSlice";
import { getUserProfilesByIds } from "../../store/slices/userSlice";



function Home() {
    const dispatch = useDispatch()
    const {feedPosts,feedLoading} = useSelector((state) => state.feed)
    const {profilesById} = useSelector((state) => state.user)
    useEffect(() => {
        dispatch(getUserPostFeed())
        console.log(feedPosts,'from home');
        
    },[dispatch])

    useEffect(() => {
        if (Array.isArray(feedPosts) && feedPosts.length){
            const ownerIds = [... new Set(feedPosts.map((p) => p.owner))]
            dispatch(getUserProfilesByIds)
        }
    },[dispatch,feedPosts,feedLoading])

    const cardContent = Array.isArray(feedPosts) 
                        ? feedPosts.map((post) => ({
                            postId : post._id,
                            postContent : post.postContent,
                            username : profilesById[post.owner]?.username,
                            postLikes : post.likes,
                            feedPostshares : post.shares,
                            postComments : post.comments,
                            postDescription : post.description,
                        })) : []

    return (
        
        <div className="min-h-screen flex flex-row items-center justify-center" style={{ zIndex: 1 }}> 
            <div className="flex flex-col ">
                {cardContent.map((card) => (
                    <PostCard key={card.postId} 
                        postContent = {card.postContent}
                        postDescription = {card.postDescription}
                        postLikes = {card.postLikes}
                        postComments = {card.postComments}
                        feedPostshares = {card.feedPostshares}
                        username = {card.username} />
                ))}
                {/* <PostCard />
                <PostCard />
                <PostCard />     */}
            </div>

        </div>
    )
}

export { Home };
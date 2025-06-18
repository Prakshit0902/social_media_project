"use client";

import React, { useEffect, useState } from "react";

import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { IconHeart, IconHeartFilled, IconMessageCircle, IconShare3 } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { likePost } from "../../store/slices/postSlice";


export function PostCard({userProfilePicture,postContent,postDescription,postLikes,postComments,postShares,username}) {
    const dispatch = useDispatch()

    useEffect(() => {
      dispatch(likePost())
      
    },[])
    const [likes,setLike] = useState(postLikes)
    const [comments,setComment] = useState(postComments)
    const [shares,setShares] = useState(postShares)
    const [liked,setLiked] = useState(false)

    const likeButtonClick = (e) => {
        if (!liked){
            setLike(likes + 1)
            setLiked(!liked) 
        }
        else {
            setLike(likes - 1)
            setLiked(!liked) 
        }

    }


  return (
    <CardContainer className="inter-var">
      <CardBody
        className=" bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
        <CardItem
          translateZ="50"
          className="flex flex-row justify-center text-xl font-bold text-neutral-600 dark:text-white">
            <img
                src={userProfilePicture}
                height="36"
                width="36"
                alt="thumbnail"
                className="mr-4" />
            <p>
                {username}
            </p>

        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src={postContent}
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail" 
            onDoubleClick={likeButtonClick}/>
        </CardItem>
        
        <CardItem translateZ="100" >

            <div className="flex flex-row mt-10 text-neutral-500 dark:text-neutral-300" >
                {liked? <IconHeartFilled className=" text-red-500" onClick={likeButtonClick}/>
                :<IconHeart className=" text-neutral-500 dark:text-neutral-300" onClick={likeButtonClick}/>} 
                
                    <span className="ml-1 mr-1">{likes}</span>

                <IconMessageCircle className=" text-neutral-500 dark:text-neutral-300"/>
                    <span className="ml-1 mr-1"> {comments} </span>
                <IconShare3 className=" text-neutral-500 dark:text-neutral-300"/>
                    <span className="ml-1 mr-1"> {shares} </span>
            </div>
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300">
          {postDescription}
        </CardItem>
      </CardBody>
    </CardContainer>
    
  );
}

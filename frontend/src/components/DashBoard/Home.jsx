    "use client";
    import React from "react";
    import { PostCard } from "../PostCard/PostCard";

    import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { ExpandableCard } from "../UserSuggestionSidebar/ExpandableCard";

    function Home() {
    return (
        
        <div className="min-h-screen flex flex-row items-center justify-center" style={{ zIndex: 1 }}> 
            <div className="flex flex-col ">
                <PostCard />
                <PostCard />
                <PostCard />
                <PostCard />    
            </div>

        </div>
    )
    }

    export { Home };
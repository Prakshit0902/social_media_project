import React ,{useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { followUser, unFollowUser } from '../../store/slices/followSlice';

// This reusable component determines its own state based on the user passed to it.
const FollowButton = ({ targetUser }) => {
    const dispatch = useDispatch();

    // Get the logged-in user and the loading state from the follow slice
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { loading: followActionLoading, loadingId } = useSelector((state) => state.follow); // Assuming your followSlice has `loadingId`

    // useEffect(() => {
    //     // This code will run every time the button re-renders due to data changes.
    //     console.group(`[DEBUG] FollowButton for: @${targetUser?.username}`);
    //     console.log("1. Logged-In User Object:", loggedInUser);
    //     console.log("2. Logged-In User ID:", loggedInUser?._id);
    //     console.log("3. Target User's Received Requests:", targetUser?.followRequestsReceived);
        
    //     // Let's manually perform the check here to see the result
    //     const hasRequest = targetUser?.followRequestsReceived?.some(
    //         (requester) => (requester?._id || requester)?.toString() === loggedInUser?._id
    //     );
    //     console.log("4. Is Request Sent? (Calculation Result):", hasRequest);
    //     console.groupEnd();

    // }, [loggedInUser, targetUser]); // It runs when these props change
    // // ======================= ^^^^ END OF DEBUG CODE ^^^^ =======================


    if (!loggedInUser || !targetUser || loggedInUser._id === targetUser._id) {
        return null; // Don't render a button for yourself
    }

    // --- DERIVED STATE LOGIC (THE CORE FIX) ---
    // Check if the logged-in user is in the TARGET USER's followers list.
    const isFollowing = targetUser.followers?.some(
        (follower) => follower._id === loggedInUser._id
    );
    
    // Check if the logged-in user's ID is in the TARGET USER's received requests.
    
  const isRequestSent = 
        // Source A: Check the target user's received requests (good for instant UI updates)
        targetUser.followRequestsReceived?.some(
            (requester) => (requester?._id || requester).toString() === loggedInUser._id
        ) 
        || // OR
        // Source B: Check the logged-in user's sent requests (the persistent truth after a reload)
        loggedInUser.followRequestsSent?.includes(targetUser._id);

    const handleFollowToggle = () => {
        if (isFollowing) {
            dispatch(unFollowUser(targetUser._id));
        } else {
            // This one action handles both following and withdrawing a request.
            dispatch(followUser(targetUser._id));
        }
    };
    
    // --- DYNAMIC STYLING AND TEXT ---
    let buttonText = 'Follow';
    let buttonStyle = 'bg-gradient-to-r from-blue-500 to-cyan-400 text-black hover:opacity-90';

    if (isFollowing) {
        buttonText = 'Following';
        buttonStyle = 'bg-white/10 text-white hover:bg-white/20';
    } else if (isRequestSent) {
        buttonText = 'Requested';
        buttonStyle = 'bg-white/10 text-white hover:bg-white/20';
    }

    const isLoading = followActionLoading && loadingId === targetUser._id;
    if (isLoading) buttonText = 'Processing...';

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${buttonStyle} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            {buttonText}
        </motion.button>
    );
};

export default FollowButton;
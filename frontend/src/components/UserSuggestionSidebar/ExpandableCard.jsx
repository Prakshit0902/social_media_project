"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axiosPrivate } from "../../utils/api";
import { followUser, unFollowUser } from "../../store/slices/followSlice";
import { fetchCurrentUser } from "../../store/slices/authSlice";

export function ExpandableCard() {
  
  const [active, setActive] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const ref = useRef(null);
  const id = useId();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loadingId } = useSelector((state) => state.follow);

  // Fetch user suggestions
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get('/api/v1/user/suggestions?limit=10');
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user?.following?.length, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleFollowClick = async (e, userId, username) => {
    e.stopPropagation();
    
    const isFollowing = followingStatus[userId] === 'following';
    
    try {
      if (isFollowing) {
        await dispatch(unFollowUser(userId)).unwrap();
        setFollowingStatus(prev => ({ ...prev, [userId]: null }));
      } else {
        const result = await dispatch(followUser(userId)).unwrap();
        setFollowingStatus(prev => ({ ...prev, [userId]: result.data.status }));
        // Refresh current user and navigate to the followed user's profile
        dispatch(fetchCurrentUser());
        navigate(`/dashboard/profile/${username}`);
        return;
      }
      // Refresh current user to update following list
      dispatch(fetchCurrentUser());
    } catch (error) {
      console.error('Follow action failed:', error);
    }
  };

  const getButtonText = (userId) => {
    if (loadingId === userId) return '...';
    const status = followingStatus[userId];
    if (status === 'following') return 'Following';
    if (status === 'requested') return 'Requested';
    return 'Follow';
  };

  const getButtonStyle = (userId) => {
    const status = followingStatus[userId];
    if (status === 'following') {
      return 'bg-neutral-700 hover:bg-red-500 text-white';
    }
    if (status === 'requested') {
      return 'bg-yellow-500/20 text-yellow-400';
    }
    return 'bg-emerald-500 hover:bg-emerald-600 text-white';
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 py-2">
          <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-neutral-500 text-xs">Loading suggestions...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="w-full sticky top-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Suggested for you
        </h3>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-50"
          title="Refresh suggestions">
          <svg 
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
        
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 h-full w-full z-10" />
        )}
      </AnimatePresence>
        
      <AnimatePresence>
          {active && typeof active === "object" ? (
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.button
                key={`button-${active._id}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-4 right-4 items-center justify-center bg-white/10 hover:bg-white/20 rounded-full h-8 w-8 transition-colors"
                onClick={() => setActive(null)}>
                <CloseIcon />
              </motion.button>
              <motion.div
                layoutId={`card-${active._id}-${id}`}
                ref={ref}
                className="w-full max-w-[400px] h-auto max-h-[90%] flex flex-col bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <motion.div layoutId={`image-${active._id}-${id}`} className="relative">
                  <img
                    width={400}
                    height={200}
                    src={active.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(active.fullname || active.username)}&background=10b981&color=fff&size=400`}
                    alt={active.username}
                    className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                </motion.div>

                <div className="p-5 -mt-8 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <motion.h3
                        layoutId={`title-${active._id}-${id}`}
                        className="font-bold text-lg text-white flex items-center gap-2">
                        {active.fullname || active.username}
                        {active.isVerified && (
                          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${active._id}-${id}`}
                        className="text-neutral-400 text-sm">
                        @{active.username}
                      </motion.p>
                    </div>

                    <motion.button
                      layoutId={`button-${active._id}-${id}`}
                      onClick={(e) => handleFollowClick(e, active._id, active.username)}
                      className={`px-5 py-2 text-sm rounded-full font-semibold transition-colors ${getButtonStyle(active._id)}`}>
                      {getButtonText(active._id)}
                    </motion.button>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex gap-6 mb-4 py-3 border-y border-white/5">
                    <div className="text-center">
                      <p className="text-white font-bold">{active.postsCount || 0}</p>
                      <p className="text-neutral-500 text-xs">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{active.followersCount || 0}</p>
                      <p className="text-neutral-500 text-xs">Followers</p>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  {active.bio && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-neutral-300 text-sm leading-relaxed">
                      {active.bio}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
        
        <ul className="space-y-1">
          {suggestions.map((user) => (
            <motion.li
              layoutId={`card-${user._id}-${id}`}
              key={user._id}
              onClick={() => setActive(user)}
              className="p-2 flex items-center justify-between hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div layoutId={`image-${user._id}-${id}`} className="flex-shrink-0">
                  <img
                    width={40}
                    height={40}
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || user.username)}&background=10b981&color=fff&size=80`}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-emerald-500/30 transition-all" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <motion.h4
                    layoutId={`title-${user._id}-${id}`}
                    className="font-medium text-white text-sm truncate flex items-center gap-1.5">
                    {user.fullname || user.username}
                    {user.isVerified && (
                      <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </motion.h4>
                  <motion.p
                    layoutId={`description-${user._id}-${id}`}
                    className="text-neutral-500 text-xs truncate">
                    @{user.username} · {user.followersCount || 0} followers
                  </motion.p>
                </div>
              </div>
              <motion.button
                layoutId={`button-${user._id}-${id}`}
                onClick={(e) => handleFollowClick(e, user._id, user.username)}
                className={`px-3 py-1.5 text-xs rounded-full font-semibold transition-all flex-shrink-0 ml-2 ${getButtonStyle(user._id)}`}>
                {getButtonText(user._id)}
              </motion.button>
            </motion.li>
          ))}
        </ul>
    </div>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-white">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
// UserProfileContainer.jsx - PART 1/4

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconGridDots,
  IconBookmark,
  IconHeart,
  IconLock,
  IconShieldCheck,
  IconCake,
  IconCalendar,
  IconMessageCircle,
  IconEdit,
  IconSettings,
  IconX,
  IconUserPlus,
  IconGenderMale,
  IconGenderFemale,
  IconCheck,
} from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearUserProfile, getUserProfile } from '../../store/slices/userSlice';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { approveFollowRequest, rejectFollowRequest } from '../../store/slices/followSlice';
import FollowButton from './FollowButton';
import { createOrGetPrivateChat } from '../../store/slices/chatSlice';
 // Make sure this path is correct

// Helper for formatting large numbers
const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num;
};

const UserProfileContainer = () => {
  // --- STATE MANAGEMENT ---
  const { identifier } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowRequestsModal, setShowFollowRequestsModal] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // --- REDUX STATE ---
  const { loading: profileLoading, error, profileById } = useSelector((state) => state.user);
  const { user: loggedInUser } = useSelector((state) => state.auth);

  const navigateToProfile = (username) => {
    navigate(`/dashboard/profile/${username}`);
    // Close all modals when navigating away
    setShowFollowers(false);
    setShowFollowing(false);
    setShowFollowRequestsModal(false);
  };

  // Fetch profile data when the identifier (username) changes
  useEffect(() => {
    if (identifier) {
      dispatch(getUserProfile(identifier));
    }
    // Cleanup function to clear the profile state when the component unmounts
    return () => {
      dispatch(clearUserProfile());
    };
  }, [dispatch, identifier]);


  const userData = profileById?.user;
  const isOwnProfile = profileById?.isOwner;

  const calculateAge = (dob) =>
    dob ? Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970) : null;
  const age = calculateAge(userData?.dob);

  const TABS_CONFIG = {
    ownProfile: [
      { id: 'posts', label: 'Posts', icon: IconGridDots, count: userData?.posts.length || 0 },
      { id: 'saved', label: 'Saved', icon: IconBookmark, count: userData?.savedPosts.length || 0 },
      { id: 'liked', label: 'Liked', icon: IconHeart, count: userData?.likedPosts.length || 0 },
    ],
    publicProfile: [
      { id: 'posts', label: 'Posts', icon: IconGridDots, count: userData?.posts.length || 0 },
    ],
  };
  const tabs = isOwnProfile ? TABS_CONFIG.ownProfile : TABS_CONFIG.publicProfile;

  // Correctly determine if the logged-in user is following the viewed profile
  const isFollowing = useMemo(() => {
    if (!loggedInUser?._id || !userData?.followers) return false;
    return userData.followers.some(follower => follower._id === loggedInUser._id);
  }, [userData?.followers, loggedInUser?._id]);

  const canViewContent = !userData?.isPrivate || isOwnProfile || isFollowing;

  // Handlers for approving/rejecting follow requests
  const handleApproveRequest = async (requesterId) => {
    setProcessingRequestId(requesterId);
    await dispatch(approveFollowRequest(requesterId)).unwrap().finally(() => setProcessingRequestId(null));
  };

  const handleRejectRequest = async (requesterId) => {
    setProcessingRequestId(requesterId);
    await dispatch(rejectFollowRequest(requesterId)).unwrap().finally(() => setProcessingRequestId(null));
  };

  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Add this handler function
  const handleMessageClick = async () => {
      if (isCreatingChat) return; // Prevent multiple clicks
      
      setIsCreatingChat(true);
      try {
          // Create or get existing chat with this user
          const result = await dispatch(createOrGetPrivateChat(userData?._id)).unwrap();
          
          // Navigate to the chat
          navigate(`/dashboard/messages/${result._id}`);
      } catch (error) {
          console.error('Failed to create/open chat:', error);
          // Optionally show an error toast if you have react-hot-toast installed
          // toast.error('Failed to open chat');
      } finally {
          setIsCreatingChat(false);
      }
  }
  // --- RENDER LOGIC ---
  if (profileLoading) return <div className="text-center text-white py-20">Loading Profile...</div>;
  if (error) return <div className="text-center text-red-500 py-20">Error: {error}</div>;
  if (!userData) return <div className="text-center text-white/50 py-20">User not found.</div>;

  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="backdrop-blur-2xl bg-black/30 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* === HEADER === */}
          <div className="relative">
            <div className="h-40 md:h-56 lg:h-64">
              <img src={userData?.bannerImage || `https://source.unsplash.com/random/1200x400/?abstract,${userData?.username}`} alt="Banner" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            {isOwnProfile && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link to="/dashboard/settings/profile">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors">
                    <IconEdit size={20} />
                  </motion.div>
                </Link>
                <Link to="/dashboard/settings/account">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors">
                    <IconSettings size={20} />
                  </motion.div>
                </Link>
              </div>
            )}
            <div className="absolute -bottom-20 md:-bottom-16 left-4 md:left-8 w-[calc(100%-2rem)] md:w-auto">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2, }} className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                  <img src={userData?.profilePicture} alt={userData?.fullname} className="w-full h-full object-cover rounded-3xl border-4 border-black/40 shadow-lg"/>
                  {userData?.isVerified && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute -top-2 -right-2 bg-gradient-to-tr from-blue-500 to-cyan-400 p-2 rounded-full shadow-lg">
                      <IconShieldCheck size={20} className="text-white" />
                    </motion.div>
                  )}
                </motion.div>
                <div className="flex flex-col text-white pb-0 md:pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    {userData?.fullname}{' '}
                    {userData?.isPrivate && <IconLock size={20} className="text-white/50" />}
                  </h1>
                  <p className="text-base text-white/60">@{userData?.username}</p>
                </div>
              </div>
            </div>
          </div>
// UserProfileContainer.jsx - PART 3/4

          {/* === BODY === */}
          <div className="pt-24 md:pt-20 p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <p className="text-white/80 text-sm leading-relaxed">{userData?.bio}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-white/50">
                  {age && (<span className="flex items-center gap-1.5"><IconCake size={16} /> {age} years old</span>)}
                  {userData?.gender === 'male' && (<span className="flex items-center gap-1.5"><IconGenderMale size={16} /> Male</span>)}
                  {userData?.gender === 'female' && (<span className="flex items-center gap-1.5"><IconGenderFemale size={16} /> Female</span>)}
                  <span className="flex items-center gap-1.5">
                    <IconCalendar size={16} /> Joined{' '}
                    {new Date(userData?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-start gap-4">
                <div className="flex justify-around bg-black/20 p-3 rounded-xl w-full">
                  <div className="text-center"><div className="font-bold text-white text-lg">{formatNumber(userData?.posts.length)}</div><div className="text-xs text-white/50">Posts</div></div>
                  <button onClick={() => setShowFollowers(true)} className="text-center transition-transform duration-200 hover:scale-105 focus:outline-none"><div className="font-bold text-white text-lg">{formatNumber(userData?.followers.length)}</div><div className="text-xs text-white/50">Followers</div></button>
                  <button onClick={() => setShowFollowing(true)} className="text-center transition-transform duration-200 hover:scale-105 focus:outline-none"><div className="font-bold text-white text-lg">{formatNumber(userData?.following.length)}</div><div className="text-xs text-white/50">Following</div></button>
                </div>
                {!isOwnProfile ? (
                  <div className="flex gap-2 w-full">
                      {/* --- FIX: Use the new, clean FollowButton component --- */}
                      <FollowButton targetUser={userData} />
                      <motion.button 
                          onClick={handleMessageClick} 
                          whileTap={{ scale: 0.95 }}
                          disabled={isCreatingChat}
                          className={`w-full py-2.5 rounded-lg text-sm font-semibold bg-white/10 text-white 
                              ${isCreatingChat ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                          {isCreatingChat ? 'Opening...' : 'Message'}
                      </motion.button>

                  </div>
                ) : (
                  <button onClick={() => setShowFollowRequestsModal(true)} disabled={!userData?.followRequestsReceived?.length} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconUserPlus size={18} /> {userData?.followRequestsReceived?.length || 0}{' '} Follow Requests
                  </button>
                )}
              </div>
            </div>

            {/* === TABS & CONTENT GRID === */}
            {canViewContent && (
              <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white'}`}>
                    {activeTab === tab.id && ( <motion.div layoutId="active-pill" className="absolute inset-0 bg-white/10 rounded-lg" transition={{ type: 'spring', stiffness: 300, damping: 30, }}/> )}
                    <span className="relative z-10"><tab.icon size={18} /></span>
                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                    <span className="relative z-10 text-xs">({formatNumber(tab.count)})</span>
                  </button>
                ))}
              </div>
            )}
            <div className="pb-16 md:pb-12 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab + canViewContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                  {!canViewContent ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/60 rounded-lg bg-black/10"><IconLock size={40} className="mb-4" /><h3 className="font-semibold text-lg">This Account is Private</h3><p className="text-sm text-white/40">Follow this account to see their photos and videos.</p></div>
                  ) : (
                    <>
                      {activeTab === 'posts' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                          {userData?.posts.map((post, index) => (
                            <motion.div key={post._id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.05, zIndex: 10 }} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group">
                              <img src={post.media[0].url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-110"/>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-2 left-2 flex items-center gap-4 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="flex items-center gap-1 font-semibold"><IconHeart size={14} /> {formatNumber(post.likes)}</span>
                                <span className="flex items-center gap-1 font-semibold"><IconMessageCircle size={14} /> {formatNumber(post.commentsCount)}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {(activeTab === 'saved' || activeTab === 'liked') && isOwnProfile && (
                          <div className="flex flex-col items-center justify-center h-64 text-white/40 rounded-lg bg-black/10">
                            <div className="p-4 bg-black/20 rounded-full mb-4">{activeTab === 'saved' ? <IconBookmark size={32} /> : <IconHeart size={32} />}</div>
                            <h3 className="font-semibold text-lg text-white/60">Your {activeTab} posts</h3><p className="text-sm">Only you can see this.</p>
                          </div>
                        )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Followers/Following Modal */}
      <AnimatePresence>
        {(showFollowers || showFollowing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowFollowers(false);
              setShowFollowing(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-gray-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl max-w-md w-full max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-xl font-semibold text-white">
                  {showFollowers
                    ? `Followers (${userData?.followers.length.toLocaleString()})`
                    : `Following (${userData?.following.length.toLocaleString()})`}
                </h3>
                <button
                  onClick={() => {
                    setShowFollowers(false);
                    setShowFollowing(false);
                  }}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <IconX size={20} />
                </button>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto">
                {((showFollowers ? userData?.followers : userData?.following) || []).map((person, index) => (
                  <motion.div
                    key={person._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => navigateToProfile(person.username)}>
                      <img src={person.profilePicture} alt={person.username} className="w-12 h-12 rounded-full bg-white/10 object-cover"/>
                      <div>
                        <div className="text-white font-semibold text-sm">{person.fullname}</div>
                        <div className="text-white/60 text-xs">@{person.username}</div>
                      </div>
                    </div>
                    <div className="w-28 flex-shrink-0">
                      {/* --- FIX: Use the reusable FollowButton in the modal --- */}
                      <FollowButton targetUser={person} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Follow Requests Modal --- */}
      <AnimatePresence>
        {showFollowRequestsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowFollowRequestsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-gray-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl max-w-md w-full max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-xl font-semibold text-white">
                  Follow Requests ({userData?.followRequestsReceived?.length || 0})
                </h3>
                <button
                  onClick={() => setShowFollowRequestsModal(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <IconX size={20} />
                </button>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto">
                {userData?.followRequestsReceived && userData.followRequestsReceived.length > 0 ? (
                  userData.followRequestsReceived.map((requester, index) => (
                    <motion.div
                      key={requester._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <img
                        src={requester.profilePicture}
                        alt={requester.username}
                        className="w-12 h-12 rounded-full bg-white/10 object-cover cursor-pointer"
                        onClick={() => navigateToProfile(requester.username)}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => navigateToProfile(requester.username)}>
                        <div className="text-white font-semibold text-sm">{requester.fullname}</div>
                        <div className="text-white/60 text-xs">@{requester.username}</div>
                      </div>
                      <div className="flex items-center gap-2">
                         <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveRequest(requester._id)}
                            disabled={processingRequestId === requester._id}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                        >
                            <IconCheck size={16} />
                            {processingRequestId === requester._id ? 'Processing' : 'Approve'}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRejectRequest(requester._id)}
                            disabled={processingRequestId === requester._id}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/70 rounded-full text-xs font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                             <IconX size={16} />
                             {processingRequestId !== requester._id && 'Reject'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-8 text-white/50">
                     <IconUserPlus size={40} className="mx-auto mb-4 opacity-50"/>
                    <h4 className="font-semibold text-white/70">No pending requests</h4>
                    <p className="text-sm">You have no new follow requests.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { UserProfileContainer };
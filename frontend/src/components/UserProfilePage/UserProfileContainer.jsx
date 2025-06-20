// UserProfileContainer.jsx - FINAL & COMPLETE
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  IconX
} from "@tabler/icons-react";

// Helper for formatting large numbers
const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num;
};

// Dummy data
const userData = {
  _id: "123456789",
  username: "aurora_stellaris",
  fullname: "Aurora Stellaris",
  bio: "Digital artist crafting dreams into pixels ✨ | Explorer of virtual realms | Coffee-powered creator",
  profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aurora",
  bannerImage: "https://source.unsplash.com/random/1200x400/?abstract,galaxy",
  followers: Array(12500).fill(null).map((_, i) => ({
    _id: `follower_${i}`,
    username: `user_${Math.floor(Math.random() * 10000)}`,
    fullname: `User Name ${i}`,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=follower${i}`,
  })),
  following: Array(890).fill(null).map((_, i) => ({
    _id: `following_${i}`,
    username: `creator_${Math.floor(Math.random() * 1000)}`,
    fullname: `Creator Name ${i}`,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=following${i}`,
  })),
  posts: Array(18).fill(null).map((_, i) => ({
    _id: i,
    image: `https://source.unsplash.com/random/400x400/?abstract,art&sig=${i}`,
    likes: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 200)
  })),
  savedPosts: Array(45).fill(null),
  likedPosts: Array(320).fill(null),
  isPrivate: false,
  isVerified: true,
  createdAt: new Date("2023-01-15"),
  dob: new Date("1995-08-15"),
};

const tabs = [
  { id: "posts", label: "Posts", icon: IconGridDots, count: userData.posts.length },
  { id: "saved", label: "Saved", icon: IconBookmark, count: userData.savedPosts.length },
  { id: "liked", label: "Liked", icon: IconHeart, count: userData.likedPosts.length }
];

const UserProfileContainer = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  const isOwnProfile = true;

  const calculateAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="backdrop-blur-2xl bg-black/30 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Header Section */}
          <div className="relative">
            <div className="h-40 md:h-56 lg:h-64">
              <img src={userData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            {isOwnProfile && (
              <div className="absolute top-4 right-4 flex gap-2">
                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors"><IconEdit size={20} /></motion.button>
                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors"><IconSettings size={20} /></motion.button>
              </div>
            )}
            <div className="absolute -bottom-20 md:-bottom-16 left-4 md:left-8 w-[calc(100%-2rem)] md:w-auto">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }} className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                  <img src={userData.profilePicture} alt={userData.fullname} className="w-full h-full object-cover rounded-3xl border-4 border-black/40 shadow-lg" />
                  {userData.isVerified && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute -top-2 -right-2 bg-gradient-to-tr from-blue-500 to-cyan-400 p-2 rounded-full shadow-lg"><IconShieldCheck size={20} className="text-white" /></motion.div>)}
                </motion.div>
                <div className="flex flex-col text-white pb-0 md:pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">{userData.fullname} {userData.isPrivate && <IconLock size={20} className="text-white/50" />}</h1>
                  <p className="text-base text-white/60">@{userData.username}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Body Section */}
          <div className="pt-24 md:pt-20 p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2"><p className="text-white/80 text-sm leading-relaxed">{userData.bio}</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-white/50"><span className="flex items-center gap-1.5"><IconCake size={16} /> {calculateAge(userData.dob)} years old</span><span className="flex items-center gap-1.5"><IconCalendar size={16} /> Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div></div>
              <div className="flex flex-col justify-start gap-4">
                  <div className="flex justify-around bg-black/20 p-3 rounded-xl w-full"><div className="text-center"><div className="font-bold text-white text-lg">{formatNumber(userData.posts.length)}</div><div className="text-xs text-white/50">Posts</div></div><button onClick={() => setShowFollowers(true)} className="text-center transition-transform duration-200 hover:scale-105 focus:outline-none"><div className="font-bold text-white text-lg">{formatNumber(userData.followers.length)}</div><div className="text-xs text-white/50">Followers</div></button><button onClick={() => setShowFollowing(true)} className="text-center transition-transform duration-200 hover:scale-105 focus:outline-none"><div className="font-bold text-white text-lg">{formatNumber(userData.following.length)}</div><div className="text-xs text-white/50">Following</div></button></div>
                  {!isOwnProfile && (<div className="flex gap-2 w-full"><motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsFollowing(!isFollowing)} className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${isFollowing ? 'bg-white/10 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-black'}`}>{isFollowing ? "Following" : "Follow"}</motion.button><motion.button whileTap={{ scale: 0.95 }} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-white/10 text-white">Message</motion.button></div>)}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-6">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white"}`}>{activeTab === tab.id && (<motion.div layoutId="active-pill" className="absolute inset-0 bg-white/10 rounded-lg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />)}<span className="relative z-10"><tab.icon size={18} /></span><span className="relative z-10 hidden sm:inline">{tab.label}</span><span className="relative z-10 text-xs">({formatNumber(tab.count)})</span></button>))}</div>
            
            {/* === Content Grid Section - NOW INCLUDED === */}
            <div className="pb-16 md:pb-12 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                  {activeTab === "posts" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                      {userData.posts.map((post, index) => (
                        <motion.div key={post._id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.05, zIndex: 10 }} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group">
                          <img src={post.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-2 left-2 flex items-center gap-4 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="flex items-center gap-1 font-semibold"><IconHeart size={14} /> {formatNumber(post.likes)}</span>
                            <span className="flex items-center gap-1 font-semibold"><IconMessageCircle size={14} /> {formatNumber(post.comments)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {(activeTab === "saved" || activeTab === "liked") && (
                    <div className="flex flex-col items-center justify-center h-64 text-white/40 rounded-lg bg-black/10">
                      <div className="p-4 bg-black/20 rounded-full mb-4">{activeTab === 'saved' ? <IconBookmark size={32} /> : <IconHeart size={32} />}</div>
                      <h3 className="font-semibold text-lg text-white/60">No {activeTab} posts</h3>
                      <p className="text-sm">Your {activeTab} posts will appear here.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Followers/Following Modal */}
      <AnimatePresence>{(showFollowers || showFollowing) && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => { setShowFollowers(false); setShowFollowing(false); }}><motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-gray-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl max-w-md w-full max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0"><h3 className="text-xl font-semibold text-white">{showFollowers ? `Followers (${userData.followers.length.toLocaleString()})` : `Following (${userData.following.length.toLocaleString()})`}</h3><button onClick={() => { setShowFollowers(false); setShowFollowing(false); }} className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"><IconX size={20} /></button></div><div className="p-2 space-y-2 overflow-y-auto">{(showFollowers ? userData.followers : userData.following).slice(0, 20).map((user, index) => (<motion.div key={user._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all cursor-pointer"><img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full bg-white/10 object-cover" /><div className="flex-1"><div className="text-white font-semibold text-sm">{user.fullname}</div><div className="text-white/60 text-xs">@{user.username}</div></div><button className="px-4 py-1.5 bg-white/10 rounded-full text-white text-xs font-medium hover:bg-white/20 transition-all">{showFollowers ? (isOwnProfile ? "Remove" : "Follow") : "Following"}</button></motion.div>))}</div></motion.div></motion.div>)}</AnimatePresence>
    </>
  );
};

export { UserProfileContainer };
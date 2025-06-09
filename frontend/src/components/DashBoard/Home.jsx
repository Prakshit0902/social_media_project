// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   IconHeart, 
//   IconHeartFilled,
//   IconMessageCircle2, 
//   IconSend2,
//   IconBookmark,
//   IconSparkles,
//   IconFlame,
//   IconDiamond,
//   IconStar,
//   IconBolt,
//   IconTrendingUp
// } from "@tabler/icons-react";

// // Sample data
// const stories = [
//   { id: 1, username: "alex_design", avatar: "https://i.pravatar.cc/150?img=1", gradient: "from-purple-500 to-pink-500", active: true },
//   { id: 2, username: "creative_mind", avatar: "https://i.pravatar.cc/150?img=2", gradient: "from-blue-500 to-cyan-500", active: true },
//   { id: 3, username: "art_lover", avatar: "https://i.pravatar.cc/150?img=3", gradient: "from-green-500 to-emerald-500", active: false },
//   { id: 4, username: "photo_pro", avatar: "https://i.pravatar.cc/150?img=4", gradient: "from-orange-500 to-red-500", active: true },
//   { id: 5, username: "wanderlust", avatar: "https://i.pravatar.cc/150?img=5", gradient: "from-pink-500 to-rose-500", active: false },
// ];

// const posts = [
//   {
//     id: 1,
//     username: "alex_design",
//     avatar: "https://i.pravatar.cc/150?img=1",
//     images: [
//       "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=1000&fit=crop",
//       "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1000&fit=crop"
//     ],
//     likes: 2456,
//     caption: "Exploring new dimensions in design ✨",
//     comments: 89,
//     time: "3h",
//     type: "gallery",
//     trending: true
//   },
//   {
//     id: 2,
//     username: "creative_mind",
//     avatar: "https://i.pravatar.cc/150?img=2",
//     images: ["https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=800&fit=crop"],
//     likes: 1834,
//     caption: "Minimalism at its finest",
//     comments: 45,
//     time: "5h",
//     type: "single"
//   },
// ];

// export function Home() {
//   const [likedPosts, setLikedPosts] = useState(new Set());
//   const [savedPosts, setSavedPosts] = useState(new Set());
//   const [activeStory, setActiveStory] = useState(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState({});

//   const toggleLike = (postId) => {
//     setLikedPosts(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(postId)) {
//         newSet.delete(postId);
//       } else {
//         newSet.add(postId);
//       }
//       return newSet;
//     });
//   };

//   const toggleSave = (postId) => {
//     setSavedPosts(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(postId)) {
//         newSet.delete(postId);
//       } else {
//         newSet.add(postId);
//       }
//       return newSet;
//     });
//   };

//   const nextImage = (postId, totalImages) => {
//     setCurrentImageIndex(prev => ({
//       ...prev,
//       [postId]: ((prev[postId] || 0) + 1) % totalImages
//     }));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
//       {/* Unique Header */}
//       <motion.header 
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="px-4 py-6"
//       >
//         <div className="flex items-center justify-between mb-6">
//           <motion.h1 
//             className="text-3xl font-bold"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
//               Discover
//             </span>
//           </motion.h1>
//           <motion.div 
//             className="flex items-center gap-2"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="p-2 bg-white/10 backdrop-blur-sm rounded-xl"
//             >
//               <IconSparkles className="w-5 h-5 text-white" />
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="p-2 bg-white/10 backdrop-blur-sm rounded-xl"
//             >
//               <IconBolt className="w-5 h-5 text-white" />
//             </motion.button>
//           </motion.div>
//         </div>

//         {/* Unique Stories Layout - Hexagonal Grid */}
//         <div className="mb-8">
//           <motion.div 
//             className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//           >
//             {stories.map((story, index) => (
//               <motion.button
//                 key={story.id}
//                 initial={{ opacity: 0, scale: 0 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.5 + index * 0.1 }}
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setActiveStory(story)}
//                 className={`relative ${index === 1 ? '-mt-4' : ''} ${index === 3 ? '-mt-4' : ''}`}
//               >
//                 <div className={`relative p-1 rounded-2xl bg-gradient-to-br ${story.gradient}`}>
//                   <div className="relative bg-black p-1 rounded-2xl">
//                     <img
//                       src={story.avatar}
//                       alt={story.username}
//                       className="w-20 h-20 rounded-2xl object-cover"
//                     />
//                     {story.active && (
//                       <motion.div
//                         className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"
//                         animate={{ scale: [1, 1.2, 1] }}
//                         transition={{ repeat: Infinity, duration: 2 }}
//                       />
//                     )}
//                   </div>
//                 </div>
//                 <p className="text-xs text-white/80 mt-1 truncate">{story.username}</p>
//               </motion.button>
//             ))}
//           </motion.div>
//         </div>
//       </motion.header>

//       {/* Posts Feed with Unique Layouts */}
//       <div className="px-4 space-y-6 pb-20">
//         {posts.map((post, index) => (
//           <motion.article
//             key={post.id}
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.7 + index * 0.2 }}
//             className="relative"
//           >
//             {/* Glassmorphism Card */}
//             <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
//               {/* Post Header with Unique Layout */}
//               <div className="flex items-center justify-between p-4">
//                 <div className="flex items-center gap-3">
//                   <motion.div
//                     whileHover={{ rotate: 360 }}
//                     transition={{ duration: 0.5 }}
//                     className="relative"
//                   >
//                     <img
//                       src={post.avatar}
//                       alt={post.username}
//                       className="w-12 h-12 rounded-2xl object-cover"
//                     />
//                     {post.trending && (
//                       <motion.div
//                         className="absolute -top-1 -right-1"
//                         animate={{ rotate: 360 }}
//                         transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
//                       >
//                         <IconFlame className="w-5 h-5 text-orange-500" />
//                       </motion.div>
//                     )}
//                   </motion.div>
//                   <div>
//                     <p className="font-semibold text-white">{post.username}</p>
//                     <p className="text-xs text-white/60">{post.time} ago</p>
//                   </div>
//                 </div>
//                 {post.trending && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1 rounded-full"
//                   >
//                     <IconTrendingUp className="w-4 h-4 text-orange-400" />
//                     <span className="text-xs text-orange-400">Trending</span>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Unique Image Display */}
//               {post.type === "gallery" ? (
//                 <div className="relative aspect-[4/5] bg-black">
//                   <AnimatePresence mode="wait">
//                     <motion.img
//                       key={currentImageIndex[post.id] || 0}
//                       src={post.images[currentImageIndex[post.id] || 0]}
//                       alt={post.caption}
//                       className="w-full h-full object-cover"
//                       initial={{ opacity: 0, x: 100 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -100 }}
//                       onClick={() => nextImage(post.id, post.images.length)}
//                     />
//                   </AnimatePresence>
//                   {/* Image Indicators */}
//                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//                     {post.images.map((_, idx) => (
//                       <motion.div
//                         key={idx}
//                         className={`h-1 rounded-full bg-white transition-all duration-300 ${
//                           idx === (currentImageIndex[post.id] || 0) ? 'w-8' : 'w-1'
//                         }`}
//                         animate={{ opacity: idx === (currentImageIndex[post.id] || 0) ? 1 : 0.5 }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <motion.div
//                   className="relative aspect-square"
//                   whileHover={{ scale: 1.02 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <img
//                     src={post.images[0]}
//                     alt={post.caption}
//                     className="w-full h-full object-cover"
//                   />
//                 </motion.div>
//               )}

//               {/* Floating Action Buttons */}
//               <div className="p-4">
//                                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-1">
//                     {/* Like Button with Animation */}
//                     <motion.button
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.9 }}
//                       onClick={() => toggleLike(post.id)}
//                       className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-sm"
//                     >
//                       <AnimatePresence mode="wait">
//                         {likedPosts.has(post.id) ? (
//                           <motion.div
//                             key="liked"
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             exit={{ scale: 0 }}
//                           >
//                             <IconHeartFilled className="w-6 h-6 text-red-500" />
//                           </motion.div>
//                         ) : (
//                           <motion.div
//                             key="unliked"
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             exit={{ scale: 0 }}
//                           >
//                             <IconHeart className="w-6 h-6 text-white" />
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                       {likedPosts.has(post.id) && (
//                         <motion.div
//                           className="absolute inset-0 rounded-2xl"
//                           initial={{ scale: 1, opacity: 0.5 }}
//                           animate={{ scale: 1.5, opacity: 0 }}
//                           transition={{ duration: 0.5 }}
//                           style={{
//                             background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)'
//                           }}
//                         />
//                       )}
//                     </motion.button>

//                     {/* Comment Button */}
//                     <motion.button
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.9 }}
//                       className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm"
//                     >
//                       <IconMessageCircle2 className="w-6 h-6 text-white" />
//                     </motion.button>

//                     {/* Share Button */}
//                     <motion.button
//                       whileHover={{ scale: 1.1, rotate: -45 }}
//                       whileTap={{ scale: 0.9 }}
//                       className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm"
//                     >
//                       <IconSend2 className="w-6 h-6 text-white" />
//                     </motion.button>
//                   </div>

//                   {/* Save Button */}
//                   <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={() => toggleSave(post.id)}
//                     className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm"
//                   >
//                     <IconBookmark 
//                       className={`w-6 h-6 transition-all duration-300 ${
//                         savedPosts.has(post.id) ? 'fill-white text-white' : 'text-white'
//                       }`}
//                     />
//                   </motion.button>
//                 </div>

//                 {/* Animated Stats Bar */}
//                 <motion.div 
//                   className="flex items-center gap-6 mb-3"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ delay: 0.2 }}
//                 >
//                   <motion.div 
//                     className="flex items-center gap-2"
//                     animate={likedPosts.has(post.id) ? { x: [0, -5, 0] } : {}}
//                   >
//                     <div className="flex -space-x-2">
//                       {[1, 2, 3].map((i) => (
//                         <motion.img
//                           key={i}
//                           src={`https://i.pravatar.cc/30?img=${i}`}
//                           className="w-6 h-6 rounded-full border-2 border-black"
//                           initial={{ opacity: 0, scale: 0 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ delay: i * 0.1 }}
//                         />
//                       ))}
//                     </div>
//                     <span className="text-sm text-white/80">
//                       {post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes
//                     </span>
//                   </motion.div>
                  
//                   <motion.div className="flex items-center gap-2">
//                     <IconDiamond className="w-4 h-4 text-purple-400" />
//                     <span className="text-sm text-white/80">{post.comments} comments</span>
//                   </motion.div>
//                 </motion.div>

//                 {/* Caption with Gradient */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                 >
//                   <p className="text-white/90">
//                     <span className="font-semibold mr-2">{post.username}</span>
//                     {post.caption}
//                   </p>
//                 </motion.div>
//               </div>
//             </div>

//             {/* Decorative Elements */}
//             <motion.div
//               className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 0.1, scale: 1 }}
//               transition={{ delay: 0.5 }}
//             >
//               <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-2xl" />
//             </motion.div>
//           </motion.article>
//         ))}
//       </div>

//       {/* Story Viewer Modal */}
//       <AnimatePresence>
//         {activeStory && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center"
//             onClick={() => setActiveStory(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.5, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.5, opacity: 0 }}
//               transition={{ type: "spring", damping: 25 }}
//               className="relative max-w-md w-full mx-4"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className={`p-1 rounded-3xl bg-gradient-to-br ${activeStory.gradient}`}>
//                 <div className="bg-black rounded-3xl p-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <img
//                       src={activeStory.avatar}
//                       alt={activeStory.username}
//                       className="w-12 h-12 rounded-full"
//                     />
//                     <div className="flex-1">
//                       <p className="font-semibold text-white">{activeStory.username}</p>
//                       <p className="text-xs text-white/60">2 hours ago</p>
//                     </div>
//                     <motion.button
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.9 }}
//                       onClick={() => setActiveStory(null)}
//                       className="text-white/60"
//                     >
//                       ✕
//                     </motion.button>
//                   </div>
//                   <div className="aspect-[9/16] bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
//                     <motion.div
//                       animate={{ rotate: 360 }}
//                       transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
//                     >
//                       <IconStar className="w-24 h-24 text-white/20" />
//                     </motion.div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Floating New Post Indicator */}
//       <motion.div
//         initial={{ y: -100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 1, type: "spring" }}
//         className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
//       >
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg"
//         >
//           <IconSparkles className="w-4 h-4" />
//           <span className="text-sm font-medium">New posts available</span>
//         </motion.button>
//       </motion.div>
//     </div>
//   );
// }
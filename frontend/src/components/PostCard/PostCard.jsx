'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconShare3,
  IconChevronLeft,
  IconChevronRight,
  IconAt,
  IconX,
  IconBookmark,
  IconBookmarkFilled,
  IconDots,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setPostSavedOptimistic,
  toggleLikePost,
  toggleSavePost,
} from '../../store/slices/postSlice'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { PostVideoPlayer } from './PostVideoPlayer'
import FollowButton from '../UserProfilePage/FollowButton'
import CommentsModal from '../Comments/CommentsModal'
import {
  addOptimisticComment,
  clearComments,
  createComment,
  getCommentsByPostId,
  removeOptimisticComment,
  replaceOptimisticComment,
} from '../../store/slices/commentSlice'

const dummyLoggedInUser = {
  _id: 'user_101', // Your logged-in user's ID
  username: 'current_user',
  profilePicture: 'https://i.pravatar.cc/150?u=user_101',
}

const dummyComments = [
  {
    _id: 'comment_001',
    post: 'post_abc',
    user: {
      _id: 'user_102',
      username: 'sarah_jones',
      profilePicture: 'https://i.pravatar.cc/150?u=user_102',
    },
    content:
      "This is an amazing photo! The colors are stunning. I've always wanted to visit a place like this.",
    likes: 15,
    likedBy: ['user_101', 'user_103'], // Logged-in user has liked this one.
    replies: [{ _id: 'comment_005' }], // Has one reply
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isEdited: false,
    isDeleted: false,
  },
  {
    _id: 'comment_002',
    post: 'post_abc',
    user: {
      _id: 'user_103',
      username: 'mike_wilson',
      profilePicture: 'https://i.pravatar.cc/150?u=user_103',
    },
    content: 'I agree with Sarah!',
    likes: 3,
    likedBy: ['user_104'], // Logged-in user has NOT liked this.
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isEdited: true, // This comment has been edited.
    isDeleted: false,
  },
  {
    _id: 'comment_003',
    post: 'post_abc',
    user: {
      _id: 'user_104',
      username: 'deleted_user',
      profilePicture: 'https://i.pravatar.cc/150?u=user_104',
    },
    content: 'This was a controversial comment.',
    likes: 0,
    likedBy: [],
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isEdited: false,
    isDeleted: true, // This comment has been deleted.
  },
]

const slideVariants = {
  // The entering image will slide in from the right (100%) or left (-100%)
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  // The image in the center is fully visible and at its natural position
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  // The exiting image will slide out to the left (-100%) or right (100%)
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

const PostCardComponent = ({
  userProfilePicture,
  postContent,
  postContentType,
  postDescription,
  postLikes,
  postComments,
  postShares,
  username,
  postId,
  isLiked,
  isSaved,
  postMentions = [],
  likedByUsers = [],
  postOwnerId,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Local state
  const [likes, setLikes] = useState(postLikes)
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showMentions, setShowMentions] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [showArrows, setShowArrows] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 })
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)
  const [slideDirection, setSlideDirection] = useState(1)
  const [showComments, setShowComments] = useState(false)
  const [commentsPage, setCommentsPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [loadedPostId, setLoadedPostId] = useState(null)
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [showPostMenu, setShowPostMenu] = useState(false)

  // Refs
  const mentionsRef = useRef(null)
  const likesRef = useRef(null)
  const mentionButtonRef = useRef(null)
  const likeButtonRef = useRef(null)
  const commentButtonRef = useRef(null)
  const imageCache = useRef(new Map())
  const loadedImagesRef = useRef(new Set())
  const postMenuRef = useRef(null)

  // Redux state - optimized selector
  const user = useSelector(
    (state) => state.auth.user,
    (prev, next) => prev?._id === next?._id
  )
  const {
    commentByPostId,
    loading: isLoadingComments,
    pagination,
  } = useSelector((state) => state.comment)
  const hasMoreComments = pagination?.hasNextPage || false
  const isOwnPost = user?._id === postOwnerId

  // Memoize images array to prevent recalculation
  const images = useMemo(() => {
    if (!postContent) return []
    return Array.isArray(postContent) ? postContent : [postContent]
  }, [postContent])

  // Memoize content types to prevent recalculation
  const contentTypes = useMemo(() => {
    if (!postContentType) return []
    return Array.isArray(postContentType) ? postContentType : [postContentType]
  }, [postContentType])

  useOutsideClick(mentionsRef, () => setShowMentions(false))
  useOutsideClick(likesRef, () => setShowLikes(false))
  useOutsideClick(postMenuRef, () => setShowPostMenu(false))

  // Optimize keyboard and overflow handling
  useEffect(() => {
    if (!showMentions && !showLikes) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMentions(false)
        setShowLikes(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [showMentions, showLikes])

  // Sync props to state only when they change
  useEffect(() => {
    setLikes(postLikes)
  }, [postLikes])

  useEffect(() => {
    setLiked(isLiked)
  }, [isLiked])

  useEffect(() => {
    setSaved(isSaved)
  }, [isSaved])

  // Smart image preloading - only adjacent images with timeout
  useEffect(() => {
    if (images.length <= 1) return

    const preloadImage = (src, index) => {
      // Check if already cached or marked as loaded
      if (imageCache.current.has(src) || loadedImagesRef.current.has(index)) {
        setLoadedImages((prev) => new Set(prev).add(index))
        return
      }

      loadedImagesRef.current.add(index)

      const img = new Image()
      let timeoutId

      const cleanup = () => {
        clearTimeout(timeoutId)
        img.onload = null
        img.onerror = null
      }

      const markAsLoaded = () => {
        setLoadedImages((prev) => {
          const next = new Set(prev)
          next.add(index)
          return next
        })
      }

      // Timeout after 5 seconds - mark as loaded anyway to prevent infinite spinner
      timeoutId = setTimeout(() => {
        console.warn(`Image load timeout: ${src}`)
        markAsLoaded()
        cleanup()
      }, 5000)

      img.onload = () => {
        imageCache.current.set(src, img)
        markAsLoaded()
        cleanup()
      }

      img.onerror = () => {
        console.error(`Failed to load image: ${src}`)
        // Mark as loaded even on error to prevent infinite spinner
        markAsLoaded()
        cleanup()
      }

      img.src = src
    }

    // Only preload current + next + previous (3 images max)
    const nextIndex = (currentImageIndex + 1) % images.length
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length

    preloadImage(images[currentImageIndex], currentImageIndex)
    preloadImage(images[nextIndex], nextIndex)
    preloadImage(images[prevIndex], prevIndex)
  }, [images, currentImageIndex])

  // Memoized callbacks to prevent recreation on every render

  const handleEditPost = useCallback(() => {
    setShowPostMenu(false)
    // Add your edit logic here
    console.log('Edit post:', postId)
  }, [postId])

  const handleDeletePost = useCallback(() => {
    setShowPostMenu(false)
    // Add your delete logic here
    console.log('Delete post:', postId)
    // You might want to show a confirmation dialog first
    if (window.confirm('Are you sure you want to delete this post?')) {
      // Dispatch delete action
    }
  }, [postId])

  const handleViewProfile = useCallback(() => {
    setShowPostMenu(false)
    navigate(`/dashboard/profile/${username}`)
  }, [navigate, username])

  const handleLike = useCallback(
    async (e) => {
      e.preventDefault()

      if (isUpdating) return

      setIsUpdating(true)

      const previousLiked = liked
      const previousLikes = likes

      const newLiked = !liked
      setLiked(newLiked)
      setLikes(newLiked ? likes + 1 : likes - 1)

      if (newLiked) {
        setShowHeartAnimation(true)
        setTimeout(() => setShowHeartAnimation(false), 800)
      }

      try {
        const result = await dispatch(toggleLikePost(postId)).unwrap()
        setLikes(result.updatedPost.likes)
        setLiked(!result.isLiked)
      } catch (error) {
        setLiked(previousLiked)
        setLikes(previousLikes)
        console.error('Failed to toggle like:', error)
      } finally {
        setIsUpdating(false)
      }
    },
    [isUpdating, liked, likes, dispatch, postId]
  )

  const handleSave = useCallback(async () => {
    const previousSaved = saved

    // Optimistically update Redux
    dispatch(setPostSavedOptimistic({ postId, isSaved: !saved }))

    try {
      await dispatch(toggleSavePost(postId)).unwrap()
    } catch (error) {
      // Revert on failure
      dispatch(setPostSavedOptimistic({ postId, isSaved: previousSaved }))
    }
  }, [dispatch, postId, saved])

  const handlePreviousImage = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      setSlideDirection(-1)
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      )
    },
    [images.length]
  )

  const handleNextImage = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      setSlideDirection(1)
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      )
    },
    [images.length]
  )

  const handleImageIndicatorClick = useCallback(
    (index) => {
      setSlideDirection(index > currentImageIndex ? 1 : -1)
      setCurrentImageIndex(index)
    },
    [currentImageIndex]
  )

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    const minSwipeDistance = 50
    const distance = touchStart - touchEnd

    if (distance > minSwipeDistance && images.length > 1) {
      handleNextImage()
    } else if (distance < -minSwipeDistance && images.length > 1) {
      handlePreviousImage()
    }
  }, [
    touchStart,
    touchEnd,
    images.length,
    handleNextImage,
    handlePreviousImage,
  ])

  const usernameClicked = useCallback(
    (e) => {
      navigate(`/dashboard/profile/${username}`)
    },
    [navigate, username]
  )

  const handleShowMentions = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setModalOrigin({ x: centerX, y: centerY })
    setShowMentions(true)
  }, [])

  const handleShowLikes = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setModalOrigin({ x: centerX, y: centerY })
    setShowLikes(true)
  }, [])

  const navigateToProfile = useCallback(
    (username) => {
      setShowMentions(false)
      setShowLikes(false)
      navigate(`/dashboard/profile/${username}`)
    },
    [navigate]
  )

  // Handle image load success
  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }, [])

  // Handle image load error
  const handleImageError = useCallback(
    (index, e) => {
      console.error(`Image failed to load at index ${index}:`, images[index])
      // Mark as loaded to hide spinner even on error
      setLoadedImages((prev) => new Set(prev).add(index))
      // Optional: Set a fallback image
      // e.target.src = '/placeholder-image.jpg';
    },
    [images]
  )

  // Memoized comment submission handler
  const handleSubmitComment = useCallback(
    async (content, postId) => {
      const tempId = `temp_${Date.now()}`
      const optimisticComment = {
        _id: tempId,
        post: postId,
        user: {
          _id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
        },
        content: content,
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
      }

      dispatch(addOptimisticComment(optimisticComment))

      try {
        const response = await dispatch(
          createComment({ postId, content })
        ).unwrap()
        console.log(response.data)
      } catch (error) {
        console.error('Failed to create comment:', error)
        dispatch(removeOptimisticComment(tempId))
      }
    },
    [user, dispatch]
  )

  const handleLikeComment = useCallback((commentId) => {
    console.log(`Liking/Unliking comment ID: ${commentId}`)
  }, [])

  const handleReply = useCallback((comment) => {
    console.log(
      `Replying to comment by ${comment.user.username}: "${comment.content}"`
    )
  }, [])

  const handleCommentButtonClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setModalOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    setShowComments(true)
  }, [])

  const handleLoadMoreComments = useCallback(async () => {
    console.log('handling more comments')

    if (isLoadingComments || !hasMoreComments || loadedPostId !== postId) return

    try {
      const nextPage = commentsPage + 1
      await dispatch(
        getCommentsByPostId({
          postId,
          page: nextPage,
        })
      ).unwrap()

      setCommentsPage(nextPage)
    } catch (error) {
      console.error('Failed to load more comments:', error)
    }
  }, [
    commentsPage,
    isLoadingComments,
    hasMoreComments,
    dispatch,
    postId,
    loadedPostId,
  ])

  const handleCloseComments = useCallback(() => {
    setShowComments(false)
  }, [])

  return (
    <>
      <div className="inter-var w-full">
        <div className="bg-neutral-900/80 backdrop-blur-sm relative border-white/[0.08] w-full max-w-xl mx-auto h-auto rounded-2xl p-6 border shadow-lg hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
          {/* Header */}
          <div className="flex flex-row items-center text-white mb-4">
            <img
              src={userProfilePicture}
              height="40"
              width="40"
              alt="profile"
              className="mr-3 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
            <p
              className="font-semibold text-base cursor-pointer"
              onClick={usernameClicked}
            >
              {username}
            </p>

            {/* Three Dot Menu */}
            <div className="ml-auto relative">
              <motion.button
                onClick={() => setShowPostMenu(!showPostMenu)}
                className="cursor-pointer hover:bg-white/10 rounded-full p-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconDots size={20} className="text-neutral-400" />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showPostMenu && (
                  <motion.div
                    ref={postMenuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-white/10 overflow-hidden z-50"
                  >
                    {isOwnPost && (
                      <>
                        <motion.button
                          onClick={handleEditPost}
                          className="w-full px-4 py-3 text-left text-sm text-neutral-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                          whileHover={{ x: 4 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit Post
                        </motion.button>
                        <motion.button
                          onClick={handleDeletePost}
                          className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                          whileHover={{ x: 4 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          Delete Post
                        </motion.button>
                        <div className="border-t border-white/10"></div>
                      </>
                    )}
                    <motion.button
                      onClick={handleViewProfile}
                      className="w-full px-4 py-3 text-left text-sm text-neutral-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                      whileHover={{ x: 4 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      View Profile
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Main Image Carousel with Animations */}
          {/* FIXED: Event handlers are now on this parent div */}
          <div
            className="w-full relative group"
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
          >
            <div className="w-full">
              {/* REMOVED: Event handlers were here before */}
              <div
                className="relative w-full overflow-hidden rounded-xl touch-pan-y bg-black"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ aspectRatio: '4 / 3' }}
              >
                {/* Animated Image Carousel */}
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.div
                    key={currentImageIndex}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute h-full w-full"
                  >
                    {/* Loading skeleton */}
                    {!loadedImages.has(currentImageIndex) &&
                      contentTypes[currentImageIndex] !== 'video' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800 gap-3">
                          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                          <p className="text-sm text-neutral-400">
                            Loading image...
                          </p>
                        </div>
                      )}

                    {contentTypes[currentImageIndex] === 'video' ? (
                      <PostVideoPlayer
                        src={images[currentImageIndex]}
                        onDoubleClick={handleLike}
                      />
                    ) : (
                      <img
                        src={images[currentImageIndex]}
                        className="h-full w-full object-contain cursor-pointer select-none"
                        alt="post content"
                        onDoubleClick={handleLike}
                        onLoad={() => handleImageLoad(currentImageIndex)}
                        onError={(e) => handleImageError(currentImageIndex, e)}
                        draggable={false}
                        loading="eager"
                        decoding="async"
                        fetchpriority="high"
                        style={{
                          opacity: loadedImages.has(currentImageIndex) ? 1 : 0,
                          transition: 'opacity 0.2s ease-in-out',
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                {/* Like Animation Heart */}
                <AnimatePresence>
                  {showHeartAnimation && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1.2, 1, 1],
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.8, times: [0, 0.15, 0.5, 1] }}
                    >
                      <IconHeartFilled
                        className="text-red-400"
                        size={150}
                        style={{
                          filter:
                            'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={handlePreviousImage}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-150`}
                  style={{ zIndex: 50, touchAction: 'manipulation' }}
                  aria-label="Previous image"
                  animate={{ opacity: showArrows ? 1 : 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconChevronLeft size={20} />
                </motion.button>
                <motion.button
                  onClick={handleNextImage}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-150`}
                  style={{ zIndex: 50, touchAction: 'manipulation' }}
                  aria-label="Next image"
                  animate={{ opacity: showArrows ? 1 : 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconChevronRight size={20} />
                </motion.button>
              </>
            )}

            {/* Image Indicators */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3 absolute bottom-3 left-0 right-0 z-10">
                {images.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleImageIndicatorClick(index)}
                    className={`transition-all duration-150 rounded-full`}
                    animate={{
                      width: index === currentImageIndex ? 8 : 6,
                      height: index === currentImageIndex ? 8 : 6,
                      backgroundColor:
                        index === currentImageIndex
                          ? '#10b981'
                          : 'rgba(255, 255, 255, 0.5)',
                    }}
                    whileHover={{ scale: 1.2 }}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions and Description ... */}
          {/* ... (rest of the component is unchanged) ... */}
          <div>
            <div className="flex flex-row mt-4 text-neutral-300 justify-between">
              <div className="flex flex-row gap-4">
                <div className="flex flex-row items-center" ref={likeButtonRef}>
                  <motion.button
                    onClick={handleLike}
                    disabled={isUpdating}
                    className="flex items-center transition-transform duration-150 ease-in-out disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {liked ? (
                      <IconHeartFilled className="text-rose-500 transition-all duration-200 w-6 h-6" />
                    ) : (
                      <IconHeart className="text-neutral-400 hover:text-rose-500 transition-colors duration-150 w-6 h-6" />
                    )}
                  </motion.button>
                  <motion.span
                    className="font-medium text-sm ml-2 cursor-pointer"
                    onClick={handleShowLikes}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {likes}
                  </motion.span>
                </div>

                <motion.button
                  ref={commentButtonRef}
                  className="flex items-center text-neutral-400 hover:text-emerald-400 transition-colors duration-150"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCommentButtonClick}
                >
                  <IconMessageCircle className="w-6 h-6" />
                  <span className="ml-2 font-medium text-sm">
                    {postComments}
                  </span>
                </motion.button>
                <CommentsModal
                  show={showComments}
                  onClose={() => setShowComments(false)}
                  postId={postId}
                  modalOrigin={modalOrigin}
                />

                {/* <motion.button 
                                    className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors duration-150"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <IconShare3 className="w-6 h-6" />
                                    <span className="ml-2 font-medium text-sm">{postShares}</span>
                                </motion.button> */}

                {postMentions && postMentions.length > 0 && (
                  <motion.button
                    ref={mentionButtonRef}
                    onClick={handleShowMentions}
                    className="flex items-center text-neutral-400 hover:text-cyan-400 transition-colors duration-150"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconAt className="w-6 h-6" />
                    <span className="ml-2 font-medium text-sm">
                      {postMentions.length}
                    </span>
                  </motion.button>
                )}
              </div>

              <motion.button
                onClick={handleSave}
                className="flex items-center transition-transform duration-150 ease-in-out"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {saved ? (
                  <IconBookmarkFilled className="text-emerald-400 transition-all duration-200 w-6 h-6" />
                ) : (
                  <IconBookmark className="text-neutral-400 hover:text-emerald-400 transition-colors duration-150 w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>

          {postDescription && (
            <p className="text-neutral-300 text-sm mt-3 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-200">
              <span
                className="font-semibold mr-2 cursor-pointer text-white hover:text-emerald-400 transition-colors"
                onClick={usernameClicked}
              >
                {username}
              </span>
              {postDescription}
            </p>
          )}
        </div>
      </div>

      {/* Animated Mentions Modal (No changes here) */}
      <AnimatePresence>
        {showMentions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-[100]"
            />
            <div className="fixed inset-0 z-[101] pointer-events-none">
              <motion.div
                ref={mentionsRef} // or likesRef for likes modal
                className="pointer-events-auto fixed"
                style={{
                  left: '50%',
                  top: '50%',
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: modalOrigin.x - window.innerWidth / 2,
                  y: modalOrigin.y - window.innerHeight / 2,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: '-50%',
                  y: '-50%',
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  x: modalOrigin.x - window.innerWidth / 2,
                  y: modalOrigin.y - window.innerHeight / 2,
                }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                }}
              >
                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-[90vw] sm:w-full max-h-[80vh] overflow-hidden shadow-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between items-center mb-4"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      Mentions
                    </h3>
                    <motion.button
                      onClick={() => setShowMentions(false)}
                      className="text-neutral-400 hover:text-white"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconX size={24} />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="space-y-3 overflow-y-auto max-h-[60vh] pr-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {postMentions.map((mention, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigateToProfile(mention.username)}
                      >
                        <motion.img
                          src={mention.profilePicture || '/default-avatar.png'}
                          alt={mention.username}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div>
                          <p className="font-medium text-white">
                            {mention.fullname}
                          </p>
                          <p className="text-sm text-neutral-400">
                            @{mention.handle || mention.username}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {' '}
                          {/* --- CHANGE 6: Remove the w-24, let the button define the width --- */}
                          <FollowButton targetUser={mention} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Animated Likes Modal (No changes here) */}
      {/* Animated Likes Modal (No changes here) */}
      <AnimatePresence>
        {showLikes && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-[100]"
            />
            <div className="fixed inset-0 z-[101] pointer-events-none">
              <motion.div
                ref={likesRef} // or likesRef for likes modal
                className="pointer-events-auto fixed"
                style={{
                  left: '50%',
                  top: '50%',
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: modalOrigin.x - window.innerWidth / 2,
                  y: modalOrigin.y - window.innerHeight / 2,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: '-50%',
                  y: '-50%',
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  x: modalOrigin.x - window.innerWidth / 2,
                  y: modalOrigin.y - window.innerHeight / 2,
                }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                }}
              >
                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-[90vw] sm:w-full max-h-[80vh] overflow-hidden shadow-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between items-center mb-4"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      Likes
                    </h3>
                    <motion.button
                      onClick={() => setShowLikes(false)}
                      className="text-neutral-400 hover:text-white"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconX size={24} />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    className="space-y-3 overflow-y-auto max-h-[60vh] pr-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {likedByUsers && likedByUsers.length > 0 ? (
                      likedByUsers.map((user, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigateToProfile(user.username)}
                        >
                          <motion.img
                            src={user.profilePicture || '/default-avatar.png'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-emerald-500/30"
                            whileHover={{ scale: 1.1 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {user.fullname}
                            </p>
                            <p className="text-sm text-neutral-400">
                              @{user.handle || user.username}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {' '}
                            {/* --- CHANGE 6: Remove the w-24, let the button define the width --- */}
                            <FollowButton targetUser={user} />
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-neutral-400 py-4">
                        No likes yet
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Export memoized version to prevent unnecessary re-renders
export const PostCard = React.memo(
  PostCardComponent,
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these props change
    return (
      prevProps.postId === nextProps.postId &&
      prevProps.postLikes === nextProps.postLikes &&
      prevProps.postComments === nextProps.postComments &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.isSaved === nextProps.isSaved &&
      prevProps.postContent?.length === nextProps.postContent?.length &&
      prevProps.likedByUsers?.length === nextProps.likedByUsers?.length
    )
  }
)

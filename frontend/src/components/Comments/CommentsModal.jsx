import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IconX, 
    IconSend, 
    IconHeart, 
    IconMessageCircle2, 
    IconLoader2,
    IconEdit,
    IconTrash,
    IconCheck,
    IconArrowBack,
    IconChevronUp,
    IconChevronDown
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import useInfiniteScroll from '../../hooks/use-infinite-scroll';
import { useOutsideClick } from '../../hooks/use-outside-click';
import {
    getCommentsByPostId,
    createComment,
    likeComment,
    editComment,
    deleteComment,
    replyToComment,
    clearComments,
    addOptimisticComment,
    removeOptimisticComment,
    updateCommentInPlace,
    replaceOptimisticComment
} from '../../store/slices/commentSlice';

const CommentsModal = ({
    show,
    onClose,
    postId,
    modalOrigin = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}) => {
    const dispatch = useDispatch();
    
    // Redux state
    const { 
        commentByPostId : comments = [], 
        loading, 
        pagination = {
            currentPage: 1,
            totalPages: 1,
            totalComments: 0,
            hasNextPage: false,
            hasPrevPage: false
        } 
    } = useSelector(state => state.comment || {});
    const loggedInUser = useSelector(state => state.auth.user);
    
    // Local state
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const scrollContainerRef = useRef(null);
    const modalRef = useRef(null);
    const replyInputRef = useRef(null);
    const editInputRef = useRef(null);

    const [expandedReplies, setExpandedReplies] = useState(new Set());

    // Use outside click hook
    useOutsideClick(modalRef, () => {
        if (show) {
            onClose();
        }
    });

    // Lock body scroll when modal is open
    useEffect(() => {
        if (show) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            
            return () => {
                const savedScrollY = parseInt(document.body.style.top || '0') * -1;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, savedScrollY);
            };
        }
    }, [show]);

    // Load comments when modal opens
    useEffect(() => {
        if (show && postId) {
            dispatch(getCommentsByPostId({ postId, page: 1 }));
            setCurrentPage(1);
        }
        
        return () => {
            if (!show) {
                dispatch(clearComments());
            }
        };
    }, [show, postId, dispatch]);

    // Focus reply input when replying
    useEffect(() => {
        if (replyingTo && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [replyingTo]);

    // Focus edit input when editing
    useEffect(() => {
        if (editingComment && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingComment]);

    // Load more handler
    const handleLoadMore = () => {
        if (!loading && pagination.hasNextPage) {
            const nextPage = currentPage + 1;
            dispatch(getCommentsByPostId({ postId, page: nextPage }));
            setCurrentPage(nextPage);
        }
    };

 
    // Use infinite scroll hook
    const loadMoreRef = useInfiniteScroll(
        handleLoadMore, 
        loading, 
        pagination.hasNextPage || false 
    );

    // Comment submission handler
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !postId || !loggedInUser) return;
        
        const tempId = `temp_${Date.now()}`;
        const optimisticComment = {
            _id: tempId,
            post: postId,
            user: {
                _id: loggedInUser._id,
                username: loggedInUser.username,
                profilePicture: loggedInUser.profilePicture,
                fullName: loggedInUser.fullName
            },
            content: newComment,
            likes: 0,
            likedBy: [],
            replies: [],
            parentComment: replyingTo ? replyingTo._id : null,
            createdAt: new Date().toISOString(),
            isEdited: false,
            isDeleted: false,
            mentions: [],
            isOptimistic: true // Flag to identify optimistic comments
        };
        
        // Clear input immediately
        setNewComment('');
        
        // Add optimistic comment
        dispatch(addOptimisticComment(optimisticComment));
        
        try {
            let response;
            if (replyingTo) {
                response = await dispatch(replyToComment({
                    content: optimisticComment.content,
                    parentCommentId: replyingTo._id,
                    postId
                })).unwrap();
                setReplyingTo(null);
            } else {
                response = await dispatch(createComment({
                    postId,
                    content: optimisticComment.content
                })).unwrap();
            }
            
            // Replace optimistic comment with real one
            dispatch(replaceOptimisticComment({ 
                tempId, 
                realComment: response.data || response
            }));
            
        } catch (error) {
            console.error('Failed to post comment:', error);
            // Remove optimistic comment on error
            dispatch(removeOptimisticComment(tempId));
            // Restore the input text so user doesn't lose their comment
            setNewComment(optimisticComment.content);
            
            // You can add toast notification here
            // toast.error('Failed to post comment. Please try again.');
        }
    }
    // Edit submission handler
    const handleEditSubmit = async (commentId) => {
            if (!editContent.trim()) return;
            
            // Find the original comment
            const originalComment = comments.find(c => c._id === commentId);
            if (!originalComment) return;
            
            // Create optimistic update
            const optimisticUpdate = {
                ...originalComment,
                content: editContent,
                isEdited: true,
                editedAt: new Date().toISOString()
            };
            
            // Update immediately
            dispatch(updateCommentInPlace(optimisticUpdate));
            setEditingComment(null);
            setEditContent('');
            
            try {
                await dispatch(editComment({
                    commentId,
                    content: editContent
                })).unwrap();
            } catch (error) {
                console.error('Failed to edit comment:', error);
                // Revert to original
                dispatch(updateCommentInPlace(originalComment));
                // Re-open edit mode
                setEditingComment(commentId);
                setEditContent(originalComment.content);
                
                // toast.error('Failed to edit comment. Please try again.');
            }
        };

    // Enhanced like with optimistic update
    const handleLikeComment = async (commentId) => {
        const comment = comments.find(c => c._id === commentId);
        if (!comment || !loggedInUser) return;
        
        const isLiked = comment.likedBy?.includes(loggedInUser._id);
        
        // Optimistic update
        const optimisticUpdate = {
            ...comment,
            likedBy: isLiked 
                ? comment.likedBy.filter(id => id !== loggedInUser._id)
                : [...(comment.likedBy || []), loggedInUser._id],
            likes: isLiked ? comment.likes - 1 : comment.likes + 1
        };
        
        dispatch(updateCommentInPlace(optimisticUpdate));
        
        try {
            await dispatch(likeComment({ commentId })).unwrap();
        } catch (error) {
            console.error('Failed to like comment:', error);
            // Revert optimistic update
            dispatch(updateCommentInPlace(comment));
            
            // toast.error('Failed to like comment. Please try again.');
        }
    };
    // Delete handler
    const handleDelete = async (commentId) => {
        try {
            await dispatch(deleteComment({ commentId })).unwrap();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete comment:', error);
            // You can add toast notification here
        }
    };

    // Like handler


    const startEdit = (comment) => {
        setEditingComment(comment._id);
        setEditContent(comment.content);
        setReplyingTo(null);
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditContent('');
    };

    const startReply = (comment) => {
        setReplyingTo(comment);
        setEditingComment(null);
        setNewComment('');
    };

    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    const renderComment = (comment, index, isReply = false) => {
        if (!comment || !comment._id) return null;

        const isOwner = loggedInUser && comment.user?._id === loggedInUser._id;
        const isLiked = loggedInUser && comment.likedBy && comment.likedBy.includes(loggedInUser._id);
        const isEditing = editingComment === comment._id;
        const isDeleting = deleteConfirm === comment._id;
        const isOptimistic = comment.isOptimistic

        const hasReplies = comment.replies && comment.replies.length > 0;
        const repliesExpanded = expandedReplies.has(comment._id);


        return (
            <motion.div
                key={`comment-${comment._id}`}
                initial={{ opacity: 0, x: isReply ? -40 : -20 }}
                animate={{ opacity: isOptimistic ? 0.7 : 1, x: 0 }}
                transition={{ delay: 0.05 * Math.min(index, 10) }}
                className={`${isReply ? 'ml-12 mt-3' : ''} ${isOptimistic ? 'relative' : ''}`}
            >
                {isOptimistic && (
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400 rounded-full" />
                )}
                {comment.isDeleted ? (
                    <div className="text-sm italic text-gray-500 dark:text-gray-400 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                        This comment has been deleted.
                    </div>
                ) : (
                    <div className="flex items-start space-x-3">
                        <motion.img
                            src={comment.user?.profilePicture || '/default-avatar.png'}
                            alt={comment.user?.username}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                        />
                        <div className="flex-1">
                            {isEditing ? (
                                // Edit Mode
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3"
                                >
                                    <textarea
                                        ref={editInputRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none resize-none dark:text-white"
                                        rows="3"
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <motion.button
                                            onClick={cancelEdit}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <IconArrowBack size={20} />
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleEditSubmit(comment._id)}
                                            className="text-green-500 hover:text-green-700"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <IconCheck size={20} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                // Normal View
                                <>
                                    <motion.div
                                        className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3"
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm dark:text-white">
                                                    {comment.user?.username}
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            {isOwner && !isDeleting && (
                                                <div className="flex space-x-1 ml-2">
                                                    <motion.button
                                                        onClick={() => startEdit(comment)}
                                                        className="text-gray-400 hover:text-blue-500"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <IconEdit size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => setDeleteConfirm(comment._id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <IconTrash size={16} />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                        {isDeleting && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                            >
                                                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                                                    Delete this comment?
                                                </p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDelete(comment._id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                    <div className="flex items-center space-x-4 mt-1.5 pl-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
                                            {comment.isEdited && <span className="italic"> (edited)</span>}
                                        </span>
                                        <motion.button
                                            onClick={() => handleLikeComment(comment._id)}
                                            className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <IconHeart
                                                size={16}
                                                className={`mr-1 transition-colors ${isLiked ? 'text-red-500 fill-current' : ''}`}
                                            />
                                            {comment.likes > 0 && <span>{comment.likes}</span>}
                                        </motion.button>
                                        {!isReply && (
                                                <>
                                                    <motion.button
                                                        onClick={() => startReply(comment)}
                                                        className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <IconMessageCircle2 size={16} className="mr-1" />
                                                        Reply
                                                    </motion.button>
                                                    
                                                    {/* Add this new button for toggling replies */}
                                                    {hasReplies && (
                                                        <motion.button
                                                            onClick={() => toggleReplies(comment._id)}
                                                            className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            {repliesExpanded ? (
                                                                <IconChevronUp size={16} className="mr-1" />
                                                            ) : (
                                                                <IconChevronDown size={16} className="mr-1" />
                                                            )}
                                                            <span>
                                                                {repliesExpanded ? 'Hide' : 'View'} {comment.replies.length} 
                                                                {comment.replies.length === 1 ? ' reply' : ' replies'}
                                                            </span>
                                                        </motion.button>
                                                    )}
                                                </>
                                            )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Render replies */}
                <AnimatePresence>
                        {hasReplies && repliesExpanded && !comment.isDeleted && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-3 overflow-hidden"
                            >
                                {comment.replies.map((reply, replyIndex) => 
                                    renderComment(reply, replyIndex, true)
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
            </motion.div>
        );
    };

    // Filter only parent comments (comments without parentComment)
    const parentComments = comments.filter(comment => !comment.parentComment);

    return (
        <AnimatePresence mode="wait">
            {show ? (
                <motion.div
                    key="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4"
                >
                    <motion.div
                        key="modal-content"
                        ref={modalRef}
                        className="relative"
                        initial={{ 
                            opacity: 0,
                            scale: 0,
                            x: modalOrigin.x - window.innerWidth / 2,
                            y: modalOrigin.y - window.innerHeight / 2,
                        }}
                        animate={{ 
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0
                        }}
                        exit={{ 
                            opacity: 0,
                            scale: 0,
                            x: modalOrigin.x - window.innerWidth / 2,
                            y: modalOrigin.y - window.innerHeight / 2,
                        }}
                        transition={{ 
                            type: "spring",
                            damping: 25,
                            stiffness: 300
                        }}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-[90vw] sm:w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                            {/* Header */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                            >
                                <h3 className="text-lg font-semibold dark:text-white">Comments</h3>
                                <motion.button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <IconX size={24} />
                                </motion.button>
                            </motion.div>

                            {/* Comments List */}
                            <motion.div 
                                ref={scrollContainerRef}
                                className="overflow-y-auto flex-1 p-4 overscroll-contain"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="space-y-5">
                                    {parentComments.length > 0 ? (
                                        <>
                                            {parentComments.map((comment, index) => 
                                                renderComment(comment, index, false)
                                            )}
                                            
                                            {/* Infinite scroll trigger element */}
                                            {pagination.hasNextPage && !loading && (
                                                <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm">Scroll for more</span>
                                                </div>
                                            )}
                                            
                                            {/* Loading indicator */}
                                            {loading && (
                                                <motion.div 
                                                    className="flex justify-center py-4"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <IconLoader2 className="animate-spin text-gray-500 dark:text-gray-400" size={24} />
                                                </motion.div>
                                            )}
                                        </>
                                    ) : (
                                        <motion.p 
                                            className="text-center text-gray-500 dark:text-gray-400 py-8"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            No comments yet. Be the first!
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Comment Input Form */}
                            <motion.div 
                                className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {replyingTo && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between"
                                    >
                                        <span className="text-sm text-blue-600 dark:text-blue-400">
                                            Replying to @{replyingTo.user?.username}
                                        </span>
                                        <motion.button
                                            onClick={() => setReplyingTo(null)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <IconX size={16} />
                                        </motion.button>
                                    </motion.div>
                                )}
                                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3">
                                    <motion.img 
                                        src={loggedInUser?.profilePicture || '/default-avatar.png'} 
                                        alt="Your avatar" 
                                        className="w-10 h-10 rounded-full object-cover" 
                                        whileHover={{ scale: 1.1 }}
                                    />
                                    <input 
                                        ref={replyingTo ? replyInputRef : null}
                                        type="text" 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)} 
                                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."} 
                                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition" 
                                    />
                                    <motion.button 
                                        type="submit" 
                                        disabled={!newComment.trim()} 
                                        className="p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                                        style={{ background: newComment.trim() ? 'linear-gradient(to right, #3b82f6, #06b6d4)' : '#6b7280' }} 
                                        whileHover={{ scale: 1.1 }} 
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <IconSend size={20} />
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default CommentsModal;
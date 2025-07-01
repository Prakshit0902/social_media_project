import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosPrivate } from "../../utils/api";

const initialState = {
    loading: false,
    commentByPostId: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
        hasNextPage: false,
        hasPrevPage: false
    }
}

export const getCommentsByPostId = createAsyncThunk(
    'comment/get-comments',
    async({ postId, page = 1 }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(
                `/api/v1/comment/get-post-comment?page=${page}&limit=10`,
                { postId },
                { withCredentials: true }
            );
            console.log('API Response:', response);
            
            // Return the page number along with the response
            return { 
                comments: response.data.data.comments,
                pagination: response.data.data.pagination,
                page: page // The page we requested
            };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to fetch comments';
            return rejectWithValue(message);
        }
    }
)
export const createComment = createAsyncThunk(
    'comment/create-comment',
    async({postId,content},{rejectWithValue}) => {
        try {
            const response = await axiosPrivate.post('/api/v1/comment/create-comment',{postId,content},{withCredentials : true})
            return response.data
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to create comment';
            return rejectWithValue(message);        
        }
    }
)

export const editComment = createAsyncThunk(
    'comment/edit-comment',
    async({ commentId, content }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.patch(
                `/api/v1/comment/${commentId}`,
                { content },
                { withCredentials: true }
            );
            return response.data.data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to edit comment';
            return rejectWithValue(message);
        }
    }
);

export const deleteComment = createAsyncThunk(
    'comment/delete-comment',
    async({ commentId }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.delete(
                `/api/v1/comment/${commentId}`,
                { withCredentials: true }
            );
            return commentId;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to delete comment';
            return rejectWithValue(message);
        }
    }
);

export const replyToComment = createAsyncThunk(
    'comment/reply-to-comment',
    async({ content, parentCommentId, postId }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(
                '/api/v1/comment/reply',
                { content, parentCommentId, postId },
                { withCredentials: true }
            );
            return { reply: response.data.data, parentCommentId };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to post reply';
            return rejectWithValue(message);
        }
    }
)

const commentSlice = createSlice({
    name: 'comments',
    initialState: initialState,
    reducers: {
        clearComments: (state) => {
            state.commentByPostId = [];
            state.pagination = {
                currentPage: 1,
                totalPages: 1,
                totalComments: 0,
                hasNextPage: false,
                hasPrevPage: false
            }
            state.loading = false;
        },
        addOptimisticComment: (state, action) => {
            const newComment = action.payload;
            // Add the new comment at the beginning
            state.commentByPostId = [newComment, ...state.commentByPostId];
            // Update total comments count if pagination exists
            if (state.pagination.totalComments !== undefined) {
                state.pagination.totalComments += 1;
            }
        },
        // Add this to remove optimistic comment on error
        removeOptimisticComment: (state, action) => {
            const tempId = action.payload;
            state.commentByPostId = state.commentByPostId.filter(
                comment => comment._id !== tempId
            );
            // Update total comments count if pagination exists
            if (state.pagination.totalComments !== undefined) {
                state.pagination.totalComments -= 1;
            }
        },
        // Add this to replace optimistic comment with real one
        replaceOptimisticComment: (state, action) => {
            const { tempId, realComment } = action.payload;
            state.commentByPostId = state.commentByPostId.map(comment =>
                comment._id === tempId ? realComment : comment
            );
        },
        updateCommentInPlace: (state, action) => {
            const updatedComment = action.payload;
            
            // Update in parent comments
            state.commentByPostId = state.commentByPostId.map(comment =>
                comment._id === updatedComment._id ? updatedComment : comment
            );
            
            // Update in replies
            state.commentByPostId.forEach(comment => {
                if (comment.replies) {
                    comment.replies = comment.replies.map(reply =>
                        reply._id === updatedComment._id ? updatedComment : reply
                    );
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCommentsByPostId.pending, (state) => {
                state.loading = true;
            })
            // In your Redux slice extraReducers:
            .addCase(getCommentsByPostId.fulfilled, (state, action) => {
    
                
                state.loading = false;
                
                const { comments, pagination, page } = action.payload;
                
                if (page === 1) {
                    state.commentByPostId = comments;
                } else {
                    const existingIds = new Set(state.commentByPostId.map(c => c._id));
                    const uniqueNewComments = comments.filter(
                        comment => comment._id && !existingIds.has(comment._id)
                    );
                    state.commentByPostId = [...state.commentByPostId, ...uniqueNewComments];
                }
                
                state.pagination = pagination;
            })
            .addCase(getCommentsByPostId.rejected, (state, action) => {
                state.loading = false;
                console.error('Failed to fetch comments:', action.payload);
            })
            .addCase(editComment.fulfilled, (state, action) => {
                const updatedComment = action.payload;
                state.commentByPostId = state.commentByPostId.map(comment => {
                    if (comment._id === updatedComment._id) {
                        return updatedComment;
                    }
                    // Also check in replies
                    if (comment.replies) {
                        comment.replies = comment.replies.map(reply =>
                            reply._id === updatedComment._id ? updatedComment : reply
                        );
                    }
                    return comment;
                });
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                const commentId = action.payload;
                state.commentByPostId = state.commentByPostId.map(comment => {
                    if (comment._id === commentId) {
                        return { ...comment, isDeleted: true, content: '[deleted]' };
                    }
                    // Also check in replies
                    if (comment.replies) {
                        comment.replies = comment.replies.map(reply =>
                            reply._id === commentId 
                                ? { ...reply, isDeleted: true, content: '[deleted]' }
                                : reply
                        );
                    }
                    return comment;
                });
                state.pagination.totalComments -= 1;
            })
            .addCase(replyToComment.fulfilled, (state, action) => {
                const { reply, parentCommentId } = action.payload;
                state.commentByPostId = state.commentByPostId.map(comment => {
                    if (comment._id === parentCommentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), reply]
                        };
                    }
                    return comment;
            })             
    })
}})


export const { clearComments,addOptimisticComment,removeOptimisticComment,replaceOptimisticComment,updateCommentInPlace } = commentSlice.actions;
export default commentSlice.reducer;
// src/services/postService.js
import { axiosPrivate } from '../utils/api';

export const postService = {
  // Create a new post
  createPost: async (formData) => {
    try {
      const response = await axiosPrivate.post('/api/v1/post/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Get all posts (for feed)
  getAllPosts: async (page = 1, limit = 10) => {
    try {
      const response = await axiosPrivate.get(`/api/v1/post?page=${page}&limit=${limit}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get posts by user
  getUserPosts: async (userId, page = 1, limit = 10) => {
    try {
      const response = await axiosPrivate.get(`/api/v1/post/user/${userId}?page=${page}&limit=${limit}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId) => {
    try {
      const response = await axiosPrivate.post(`/api/v1/post/like`, { postId }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Unlike a post (same endpoint as like - it toggles)
  unlikePost: async (postId) => {
    try {
      const response = await axiosPrivate.post(`/api/v1/post/like`, { postId }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      const response = await axiosPrivate.delete(`/api/v1/post/${postId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Update post caption
  updatePost: async (postId, data) => {
    try {
      const response = await axiosPrivate.patch(`/api/v1/post/${postId}`, data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }
};
